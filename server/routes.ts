import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertComputerSchema } from "@shared/schema";
import { z } from "zod";

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
      console.log("Creating computer with data:", req.body);
      const computerData = insertComputerSchema.parse(req.body);
      console.log("Parsed computer data:", computerData);
      const computer = await storage.createComputer(computerData);
      console.log("Created computer:", computer);
      res.status(201).json(computer);
    } catch (error) {
      console.error("Error creating computer:", error);
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
      const computer = await storage.updateComputer(id, updates);
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
