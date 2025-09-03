import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertClientSchema, insertComputerSchema, insertComputerActivitySchema } from "../shared/schema.js";
import { z } from "zod";
import bcrypt from "bcrypt";

// Middleware per controllare se l'utente è autenticato
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Non autorizzato. Effettua il login." });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // --- ROTTE DI AUTENTICAZIONE (NON PROTETTE) ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email e password sono obbligatorie" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({
        email,
        hashedPassword,
      });
      res.status(201).json({ id: newUser.id, email: newUser.email });
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ message: "Email già esistente" });
      }
      console.error(error);
      res.status(500).json({ message: "Registrazione utente fallita" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email e password sono obbligatorie" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }
      
      // @ts-ignore
      req.session.userId = user.id;

      req.session.save((err) => {
        if (err) {
          console.error("Errore nel salvataggio della sessione:", err);
          return res.status(500).json({ message: "Errore durante il login" });
        }
        res.status(200).json({ id: user.id, email: user.email });
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Errore durante il login" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout fallito" });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: "Logout effettuato con successo" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    res.json({ id: user.id, email: user.email });
  });

  // --- ROTTE CLIENTI (PROTETTE) ---
  app.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid client data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create client" });
      }
    }
  });

  app.get("/api/clients/:id/stats", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stats = await storage.getClientStats(id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client stats" });
    }
  });

  // --- ROTTE COMPUTER (PROTETTE) ---
  app.get("/api/computers", isAuthenticated, async (req, res) => {
    try {
      const { query, clientId, status, brand } = req.query;
      
      if (query || clientId || status || brand) {
        const filters = {
          clientId: clientId ? parseInt(clientId as string) : undefined,
          status: status as string,
          brand: brand as string,
        };
        const computers = await storage.searchComputers(query as string || "", filters);
        res.json(computers);
      } else {
        const computers = await storage.getAllComputers();
        res.json(computers);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch computers" });
    }
  });

  app.get("/api/computers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const computer = await storage.getComputer(id);
      if (!computer) {
        return res.status(404).json({ message: "Computer not found" });
      }
      res.json(computer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch computer" });
    }
  });

  app.post("/api/computers", isAuthenticated, async (req, res) => {
    try {
      const computerData = insertComputerSchema.parse(req.body);
      const computer = await storage.createComputer(computerData);
      res.status(201).json(computer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid computer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create computer" });
      }
    }
  });

  app.patch("/api/computers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertComputerSchema.partial().parse(req.body);
      
      const currentComputer = await storage.getComputer(id);
      if (!currentComputer) {
        return res.status(404).json({ message: "Computer not found" });
      }
      
      const computer = await storage.updateComputer(id, updates);
      
      if (updates.assignedTo !== undefined && updates.assignedTo !== currentComputer.assignedTo) {
        if (updates.assignedTo && updates.assignedTo !== currentComputer.assignedTo) {
          await storage.addComputerHistory({
            computerId: id,
            action: "assigned",
            description: `PC assigned to ${updates.assignedTo}`,
            previousValue: currentComputer.assignedTo || "unassigned",
            newValue: updates.assignedTo,
          });
        } else if (updates.assignedTo === null && currentComputer.assignedTo) {
          await storage.addComputerHistory({
            computerId: id,
            action: "unassigned", 
            description: `PC unassigned from ${currentComputer.assignedTo}`,
            previousValue: currentComputer.assignedTo,
            newValue: "unassigned",
          });
        }
      }
      
      res.json(computer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400