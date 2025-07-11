import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
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
  type: text("type").notNull(), // desktop, laptop, workstation, server, tablet
  clientId: integer("client_id").references(() => clients.id).notNull(),
  assignedTo: text("assigned_to"),
  status: text("status").notNull().default("active"), // active, maintenance, dismissed, preparation, storage
  warrantyExpiry: timestamp("warranty_expiry"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const computerHistory = pgTable("computer_history", {
  id: serial("id").primaryKey(),
  computerId: integer("computer_id").references(() => computers.id).notNull(),
  action: text("action").notNull(), // assigned, unassigned, maintenance, returned, note_added, status_changed
  description: text("description").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
}));

export const computerHistoryRelations = relations(computerHistory, ({ one }) => ({
  computer: one(computers, {
    fields: [computerHistory.computerId],
    references: [computers.id],
  }),
}));

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertComputerSchema = createInsertSchema(computers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  warrantyExpiry: z.string().optional().nullable().transform((val) => {
    if (!val || val === '') return null;
    return new Date(val);
  }),
});

export const insertComputerHistorySchema = createInsertSchema(computerHistory).omit({
  id: true,
  createdAt: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Computer = typeof computers.$inferSelect;
export type InsertComputer = z.infer<typeof insertComputerSchema>;
export type ComputerHistory = typeof computerHistory.$inferSelect;
export type InsertComputerHistory = z.infer<typeof insertComputerHistorySchema>;

export type ComputerWithClient = Computer & {
  client: Client;
};

export type ComputerWithHistory = Computer & {
  client: Client;
  history: ComputerHistory[];
};
