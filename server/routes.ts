import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertClientSchema, insertComputerSchema, insertComputerActivitySchema, users } from "../shared/schema.js";
import { z } from "zod";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Clients routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
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

  app.post("/api/clients", async (req, res) => {
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

  app.get("/api/clients/:id/stats", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stats = await storage.getClientStats(id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client stats" });
    }
  });

  // --- AUTHENTICATION ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      // 1. Get email and password from the request body
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // 2. Hash the password for security
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Call the storage layer to create the user in the database
      const newUser = await storage.createUser({
        email,
        hashedPassword,
      });

      // 4. Respond with success (never send the password back!)
      res.status(201).json({ id: newUser.id, email: newUser.email });

    } catch (error: any) {
      // Handle the error if the email is already in use
      if (error.code === '23505') { // PostgreSQL unique violation error code
        return res.status(409).json({ message: "Email already exists" });
      }
      console.error(error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      // 1. Get email and password from the request
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // 2. Find the user by email
      const user = await storage.getUserByEmail(email);

      // 3. If user doesn't exist or password is wrong, send a generic error
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // 4. LOGIN SUCCESSFUL: Save user ID in the session
      // @ts-ignore - We'll tell TypeScript to ignore that 'userId' is not on the default session type
      req.session.userId = user.id;

      // 5. Respond with success
      res.status(200).json({ id: user.id, email: user.email });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred during login" });
    }
  });
  // ------------------------------------

  // Computers routes
  app.get("/api/computers", async (req, res) => {
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

  app.get("/api/computers/:id", async (req, res) => {
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

  app.post("/api/computers", async (req, res) => {
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

  app.patch("/api/computers/:id", async (req, res) => {
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
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update computer" });
      }
    }
  });

  app.get("/api/computers/:id/history", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const history = await storage.getComputerHistory(id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch computer history" });
    }
  });

  // Computer Activities routes
  app.post("/api/computers/:id/activities", async (req, res) => {
    try {
      const computerId = parseInt(req.params.id);
      const activityData = insertComputerActivitySchema.parse({
        ...req.body,
        computerId
      });
      
      const activity = await storage.addComputerActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create activity" });
      }
    }
  });

  app.get("/api/computers/:id/activities", async (req, res) => {
    try {
      const computerId = parseInt(req.params.id);
      const activities = await storage.getComputerActivities(computerId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/recent-activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  app.get("/api/dashboard/warranty-alerts", async (req, res) => {
    try {
      const alerts = await storage.getWarrantyAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warranty alerts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}