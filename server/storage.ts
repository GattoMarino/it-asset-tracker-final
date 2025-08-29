import { 
  clients, 
  computers, 
  computerHistory,
  computerActivities,
  users, // Aggiunto users
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
  type User,       // Aggiunto User
  type InsertUser, // Aggiunto InsertUser
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // Clients
  getAllClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  
  // Computers
  getAllComputers(): Promise<ComputerWithClient[]>;
  getComputer(id: number): Promise<ComputerWithHistory | undefined>;
  getComputersByClient(clientId: number): Promise<ComputerWithClient[]>;
  createComputer(computer: InsertComputer): Promise<Computer>;
  updateComputer(id: number, updates: Partial<InsertComputer>): Promise<Computer>;
  searchComputers(query: string, filters?: {
    clientId?: number;
    status?: string;
    brand?: string;
  }): Promise<ComputerWithClient[]>;
  
  // Computer History
  addComputerHistory(history: InsertComputerHistory): Promise<ComputerHistory>;
  getComputerHistory(computerId: number): Promise<ComputerHistory[]>;
  
  // Computer Activities
  addComputerActivity(activity: InsertComputerActivity): Promise<ComputerActivity>;
  getComputerActivities(computerId: number): Promise<ComputerActivity[]>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalPCs: number;
    activePCs: number;
    maintenancePCs: number;
    expiringSoon: number;
  }>;
  
  getClientStats(clientId: number): Promise<{
    totalPCs: number;
axPCs: number;
    maintenancePCs: number;
    dismissedPCs: number;
    desktopPCs: number;
    laptopPCs: number;
  }>;
  
  getRecentActivity(): Promise<ComputerHistory[]>;
  getWarrantyAlerts(): Promise<ComputerWithClient[]>;

  // ==> NUOVI METODI PER GLI UTENTI <==
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // ... (tutti i metodi esistenti per clients, computers, ecc.) ...
  
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
    
    // Add creation history
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

    // Add update history
    if (updates.assignedTo) {
      await this.addComputerHistory({
        computerId: id,
        action: "assigned",
        description: `PC assigned to ${updates.assignedTo}`,
        newValue: updates.assignedTo,
      });
    }

    if (updates.status) {
      await this.addComputerHistory({
        computerId: id,
        action: "status_changed",
        description: `Status changed to ${updates.status}`,
        newValue: updates.status,
      });
    }

    if (updates.notes) {
      await this.addComputerHistory({
        computerId: id,
        action: "note_added",
        description: "Notes updated",
        newValue: updates.notes,
      });
    }

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

  async getDashboardStats(): Promise<{
    totalPCs: number;
    activePCs: number;
    maintenancePCs: number;
    expiringSoon: number;
  }> {
    const totalPCs = await db.select({ count: sql<number>`count(*)` }).from(computers);
    const activePCs = await db.select({ count: sql<number>`count(*)` }).from(computers).where(eq(computers.status, 'active'));
    const maintenancePCs = await db.select({ count: sql<number>`count(*)` }).from(computers).where(eq(computers.status, 'maintenance'));
    
    const expiringSoon = await db
      .select({ count: sql<number>`count(*)` })
      .from(computers)
      .where(
        and(
          sql`warranty_expiry > CURRENT_DATE`,
          sql`warranty_expiry <= CURRENT_DATE + INTERVAL '30 days'`
        )
      );

    return {
      totalPCs: totalPCs[0].count,
      activePCs: activePCs[0].count,
      maintenancePCs: maintenancePCs[0].count,
      expiringSoon: expiringSoon[0].count,
    };
  }

  async getClientStats(clientId: number): Promise<{
    totalPCs: number;
    activePCs: number;
    maintenancePCs: number;
    dismissedPCs: number;
    desktopPCs: number;
    laptopPCs: number;
  }> {
    const totalPCs = await db.select({ count: sql<number>`count(*)` }).from(computers).where(eq(computers.clientId, clientId));
    const activePCs = await db.select({ count: sql<number>`count(*)` }).from(computers).where(and(eq(computers.clientId, clientId), eq(computers.status, 'active')));
    const maintenancePCs = await db.select({ count: sql<number>`count(*)` }).from(computers).where(and(eq(computers.clientId, clientId), eq(computers.status, 'maintenance')));
    const dismissedPCs = await db.select({ count: sql<number>`count(*)` }).from(computers).where(and(eq(computers.clientId, clientId), eq(computers.status, 'dismissed')));
    const desktopPCs = await db.select({ count: sql<number>`count(*)` }).from(computers).where(and(eq(computers.clientId, clientId), eq(computers.type, 'desktop')));
    const laptopPCs = await db.select({ count: sql<number>`count(*)` }).from(computers).where(and(eq(computers.clientId, clientId), eq(computers.type, 'laptop')));

    return {
      totalPCs: totalPCs[0].count,
      activePCs: activePCs[0].count,
      maintenancePCs: maintenancePCs[0].count,
      dismissedPCs: dismissedPCs[0].count,
      desktopPCs: desktopPCs[0].count,
      laptopPCs: laptopPCs[0].count,
    };
  }

  async getRecentActivity(): Promise<ComputerHistory[]> {
    return await db
      .select()
      .from(computerHistory)
      .orderBy(desc(computerHistory.createdAt))
      .limit(10);
  }

  async getWarrantyAlerts(): Promise<ComputerWithClient[]> {
    return await db
      .select()
      .from(computers)
      .leftJoin(clients, eq(computers.clientId, clients.id))
      .where(
        and(
          sql`warranty_expiry > CURRENT_DATE`,
          sql`warranty_expiry <= CURRENT_DATE + INTERVAL '30 days'`
        )
      )
      .orderBy(computers.warrantyExpiry)
      .then(rows => rows.map(row => ({
        ...row.computers,
        client: row.clients!
      })));
  }

  // ==> NUOVI METODI PER GLI UTENTI <==
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
}

export const storage = new DatabaseStorage();