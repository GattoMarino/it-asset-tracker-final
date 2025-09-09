import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const computers = pgTable("computers", {
  id: serial("id").primaryKey(),
  serial: text("serial").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  type: text("type").notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  assignedTo: text("assigned_to"),
  status: text("status").notNull().default("active"),
  warrantyExpiry: timestamp("warranty_expiry"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const computerHistory = pgTable("computer_history", {
  id: serial("id").primaryKey(),
  computerId: integer("computer_id").references(() => computers.id).notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const computerActivities = pgTable("computer_activities", {
  id: serial("id").primaryKey(),
  computerId: integer("computer_id").references(() => computers.id).notNull(),
  type: text("type").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // --- MODIFICA QUI: Aggiunti i campi per la 2FA ---
  twoFactorCode: text("two_factor_code"),
  twoFactorCodeExpiresAt: timestamp("two_factor_code_expires_at"),
});

export const userSessions = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { mode: "date" }).notNull(),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  computers: many(computers),
}));

export const computersRelations = relations(computers, ({ one, many }) => ({
  client: one(clients, {
    fields: [computers.clientId],
    references: [clients.id],
  }),
  history: many(computerHistory),
  activities: many(computerActivities),
}));

export const computerHistoryRelations = relations(computerHistory, ({ one }) => ({
  computer: one(computers, {
    fields: [computerHistory.computerId],
    references: [computers.id],
  }),
}));

export const computerActivitiesRelations = relations(computerActivities, ({ one }) => ({
  computer: one(computers, {
    fields: [computerActivities.computerId],
    references: [computers.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
}));

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

const baseInsertComputerSchema = createInsertSchema(computers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertComputerSchema = baseInsertComputerSchema.extend({
  type: z.enum(['desktop', 'laptop', 'workstation', 'server', 'tablet']),
  warrantyExpiry: z.coerce.date().nullable().optional(),
});

export const insertComputerHistorySchema = createInsertSchema(computerHistory).omit({
  id: true,
  createdAt: true,
});

export const insertComputerActivitySchema = createInsertSchema(computerActivities).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Computer = typeof computers.$inferSelect;
export type InsertComputer = z.infer<typeof insertComputerSchema>;
export type ComputerHistory = typeof computerHistory.$inferSelect;
export type InsertComputerHistory = z.infer<typeof insertComputerHistorySchema>;
export type ComputerActivity = typeof computerActivities.$inferSelect;
export type InsertComputerActivity = z.infer<typeof insertComputerActivitySchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ComputerWithClient = Computer & {
  client: Client;
};

export type ComputerWithHistory = Computer & {
  client: Client;
  history: ComputerHistory[];
  activities: ComputerActivity[];
};