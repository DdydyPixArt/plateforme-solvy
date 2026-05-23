import { pgTable, text, integer, real, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  statut: text("statut").notNull().default("actif"),
  derniereConnexion: text("derniere_connexion"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dossiersTable = pgTable("dossiers", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull(),
  status: text("status").notNull().default("incomplet"),
  score: integer("score"),
  decision: text("decision"),
  tauxEndettement: real("taux_endettement").notNull().default(0),
  capaciteEmprunt: real("capacite_emprunt").notNull().default(0),
  resteAVivre: real("reste_a_vivre").notNull().default(0),
  incidents: integer("incidents").notNull().default(0),
  ficp: boolean("ficp").notNull().default(false),
  fcc: boolean("fcc").notNull().default(false),
  ppe: boolean("ppe").notNull().default(false),
  lcbft: boolean("lcbft").notNull().default(false),
  dateCreation: text("date_creation").notNull(),
  conseiller: text("conseiller").notNull(),
  conseillerEmail: text("conseiller_email"),
  analysteAssigne: text("analyste_assigne"),
  analysteCommentaire: text("analyste_commentaire"),
  transmisAt: text("transmis_at"),
  client: jsonb("client").notNull(),
  situationPro: jsonb("situation_pro").notNull(),
  finances: jsonb("finances").notNull(),
  demande: jsonb("demande").notNull(),
  documents: jsonb("documents").notNull().default([]),
  historique: jsonb("historique").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  titre: text("titre").notNull(),
  message: text("message").notNull(),
  dossierRef: text("dossier_ref"),
  dossierId: text("dossier_id"),
  userEmail: text("user_email").notNull(),
  lue: boolean("lue").notNull().default(false),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  heure: text("heure").notNull(),
  utilisateur: text("utilisateur").notNull(),
  role: text("role").notNull(),
  dossierRef: text("dossier_ref").notNull().default("—"),
  action: text("action").notNull(),
  statut: text("statut").notNull().default("info"),
  details: text("details").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDossierSchema = createInsertSchema(dossiersTable);
export type InsertDossier = z.infer<typeof insertDossierSchema>;
export type Dossier = typeof dossiersTable.$inferSelect;

export const insertNotificationSchema = createInsertSchema(notificationsTable);
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;

export const insertAuditLogSchema = createInsertSchema(auditLogsTable);
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;

export const insertUserSchema = createInsertSchema(usersTable);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
