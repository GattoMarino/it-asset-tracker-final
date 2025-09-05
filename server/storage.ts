import {
  clients,
  computers,
  computerHistory,
  computerActivities,
  users,
  type Client,
  type InsertClient,
  type Computer,
  type InsertComputer,
  type ComputerHistory,
  type InsertComputerHistory,
  type ComputerActivity,
  type InsertComputerActivity,
  type ComputerWithClient,
  type ComputerWithHistory,
  type User,
  type InsertUser,
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, ilike, or, sql, count } from "drizzle-orm"; // Aggiunto 'count' per pulizia

export interface IStorage {
  // ... interfacce ...
  deleteComputer(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async deleteComputer(id: number): Promise<void> {
    await db.delete(computerHistory).where(eq(computerHistory.computerId, id));
    await db.delete(computerActivities).where(eq(computerActivities.computerId, id));
    await db.delete(computers).where(eq(computers.id, id));
  }
  
  // ... altre funzioni ...
  
  // --- FUNZIONE CORRETTA ---
  async getClientStats(clientId: number): Promise<{
    totalPCs: number;
    maintenancePCs: number;
    desktops: number;
    laptops: number;
    servers: number;
  }> {
    const [totalResult, maintenanceResult, desktopResult, laptopResult, serverResult] = await Promise.all([
      db.select({ value: count() }).from(computers).where(eq(computers.clientId, clientId)),
      db.select({ value: count() }).from(computers).where(and(eq(computers.clientId, clientId), eq(computers.status, 'maintenance'))),
      // Corretto per usare 'ilike' per ignorare maiuscole/minuscole
      db.select({ value: count() }).from(computers).where(and(eq(computers.clientId, clientId), ilike(computers.type, 'desktop'))),
      db.select({ value: count() }).from(computers).where(and(eq(computers.clientId, clientId), ilike(computers.type, 'laptop'))),
      db.select({ value: count() }).from(computers).where(and(eq(computers.clientId, clientId), ilike(computers.type, 'server'))),
    ]);

    // Corretto per usare i nomi che il frontend si aspetta (es. 'laptops' invece di 'laptopPCs')
    return {
      totalPCs: totalResult[0]?.value || 0,
      maintenancePCs: maintenanceResult[0]?.value || 0,
      desktops: desktopResult[0]?.value || 0,
      laptops: laptopResult[0]?.value || 0,
      servers: serverResult[0]?.value || 0,
    };
  }
  
  // ... (tutte le altre funzioni del tuo file rimangono qui sotto)
  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(clients.name);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async getAllComputers(): Promise<ComputerWithClient[]> {
    return await db
      .select()
      .from(computers)
      .leftJoin(clients, eq(computers.clientId, clients.id))
      .orderBy(desc(computers.createdAt))
      .then(rows => rows.map(row => ({
        ...row.computers,
        client: row.clients!
      })));
  }

  async getComputer(id: number): Promise<ComputerWithHistory | undefined> {
    const computerData = await db
      .select()
      .from(computers)
      .leftJoin(clients, eq(computers.clientId, clients.id))
      .where(eq(computers.id, id));

    if (computerData.length === 0) return undefined;

    const history = await this.getComputerHistory(id);
    const activities = await this.getComputerActivities(id);
    
    const { computers: computer, clients: client } = computerData[0];
    return {
      ...computer,
      client: client!,
      history,
      activities
    };
  }

  async getComputersByClient(clientId: number): Promise<ComputerWithClient[]> {
    return await db
      .select()
      .from(computers)
      .leftJoin(clients, eq(computers.clientId, clients.id))
      .where(eq(computers.clientId, clientId))
      .orderBy(desc(computers.createdAt))
      .then(rows => rows.map(row => ({
        ...row.computers,
        client: row.clients!
      })));
  }

  async createComputer(insertComputer: InsertComputer): Promise<Computer> {
    const [computer] = await db.insert(computers).values({
      ...insertComputer,
      updatedAt: new Date()
    }).returning();
    
    await this.addComputerHistory({
      computerId: computer.id,
      action: "created",
      description: `PC ${computer.serial} created and assigned to client`,
    });

    return computer;
  }

  async updateComputer(id: number, updates: Partial<InsertComputer>): Promise<Computer> {
    const [computer] = await db
      .update(computers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(computers.id, id))
      .returning();

    // ... (logica di history)
    return computer;
  }

  async searchComputers(query: string, filters?: {
    clientId?: number;
    status?: string;
    brand?: string;
  }): Promise<ComputerWithClient[]> {
    let conditions = [];

    if (query) {
      conditions.push(
        or(
          ilike(computers.serial, `%${query}%`),
          ilike(computers.model, `%${query}%`),
          ilike(computers.assignedTo, `%${query}%`),
          ilike(computers.brand, `%${query}%`)
        )
      );
    }

    if (filters?.clientId) {
      conditions.push(eq(computers.clientId, filters.clientId));
    }

    if (filters?.status) {
      conditions.push(eq(computers.status, filters.status));
    }

    if (filters?.brand) {
      conditions.push(eq(computers.brand, filters.brand));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select()
      .from(computers)
      .leftJoin(clients, eq(computers.clientId, clients.id))
      .where(whereClause)
      .orderBy(desc(computers.createdAt))
      .then(rows => rows.map(row => ({
        ...row.computers,
        client: row.clients!
      })));
  }

  async addComputerHistory(insertHistory: InsertComputerHistory): Promise<ComputerHistory> {
    const [history] = await db.insert(computerHistory).values(insertHistory).returning();
    return history;
  }

  async getComputerHistory(computerId: number): Promise<ComputerHistory[]> {
    return await db
      .select()
      .from(computerHistory)
      .where(eq(computerHistory.computerId, computerId))
      .orderBy(desc(computerHistory.createdAt));
  }

  async addComputerActivity(insertActivity: InsertComputerActivity): Promise<ComputerActivity> {
    const [activity] = await db
      .insert(computerActivities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getComputerActivities(computerId: number): Promise<ComputerActivity[]> {
    return await db
      .select()
      .from(computerActivities)
      .where(eq(computerActivities.computerId, computerId))
      .orderBy(desc(computerActivities.createdAt));
  }

  async getDashboardStats(): Promise<any> {
    // ...
  }
  
  async getRecentActivity(): Promise<ComputerHistory[]> {
    return await db
      .select()
      .from(computerHistory)
      .orderBy(desc(computerHistory.createdAt))
      .limit(10);
  }

  async getWarrantyAlerts(): Promise<ComputerWithClient[]> {
    // ...
    return [];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
}

export const storage = new DatabaseStorage();