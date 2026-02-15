import { pgTable, text, serial, integer, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, libraries } from "./models/auth";

export * from "./models/auth";

export const RESOURCE_TYPES = [
  'book', 'article', 'journal', 'thesis', 'database', 'archive', 'manual', 'video', 'mooc'
] as const;

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  book: "Livre",
  article: "Article",
  journal: "Revue scientifique",
  thesis: "Thèse / Mémoire",
  database: "Base de données",
  archive: "Archive ouverte",
  manual: "Manuel",
  video: "Vidéo",
  mooc: "MOOC",
};

export const DISCIPLINES = [
  'droit', 'medecine', 'theologie', 'informatique', 'sciences_economiques',
  'sciences_politiques', 'lettres', 'philosophie', 'psychologie', 'sociologie',
  'sciences_naturelles', 'mathematiques', 'histoire', 'geographie', 'education',
  'communication', 'autre'
] as const;

export const DISCIPLINE_LABELS: Record<string, string> = {
  droit: "Droit",
  medecine: "Médecine",
  theologie: "Théologie",
  informatique: "Informatique",
  sciences_economiques: "Sciences Économiques",
  sciences_politiques: "Sciences Politiques",
  lettres: "Lettres & Langues",
  philosophie: "Philosophie",
  psychologie: "Psychologie",
  sociologie: "Sociologie",
  sciences_naturelles: "Sciences Naturelles",
  mathematiques: "Mathématiques",
  histoire: "Histoire",
  geographie: "Géographie",
  education: "Éducation",
  communication: "Communication",
  autre: "Autre",
};

export const RESOURCE_SOURCES = [
  'internal', 'openlibrary', 'doaj', 'persee', 'core', 'arxiv', 'pubmed',
  'hal', 'oatd', 'ajol', 'scielo', 'zenodo', 'other'
] as const;

export const SOURCE_LABELS: Record<string, string> = {
  internal: "Interne",
  openlibrary: "OpenLibrary",
  doaj: "DOAJ",
  persee: "Persée",
  core: "CORE",
  arxiv: "arXiv",
  pubmed: "PubMed Central",
  hal: "HAL Archives",
  oatd: "OATD",
  ajol: "AJOL",
  scielo: "SciELO",
  zenodo: "Zenodo",
  other: "Autre",
};

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  source: text("source").notNull(),
  discipline: text("discipline"),
  language: text("language").default("fr"),
  externalId: text("external_id"),
  url: text("url"),
  description: text("description"),
  author: text("author"),
  publisher: text("publisher"),
  isbn: text("isbn"),
  publicationYear: integer("publication_year"),
  status: text("status").default("pending").notNull(),
  submittedBy: varchar("submitted_by").references(() => users.id),
  libraryId: integer("library_id").references(() => libraries.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url"),
  description: text("description"),
  type: text("type"),
  discipline: text("discipline"),
  status: text("status").default("pending").notNull(),
  submittedBy: varchar("submitted_by").references(() => users.id),
  adminNote: text("admin_note"),
  libraryId: integer("library_id").references(() => libraries.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  pointsRequired: integer("points_required").notNull(),
  imageUrl: text("image_url"),
  libraryId: integer("library_id").references(() => libraries.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  rewardId: integer("reward_id").notNull().references(() => rewards.id),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  objectPath: text("object_path").notNull(),
  url: text("url"),
  resourceId: integer("resource_id").references(() => resources.id),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  libraryId: integer("library_id").references(() => libraries.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resourcesRelations = relations(resources, ({ one }) => ({
  submitter: one(users, {
    fields: [resources.submittedBy],
    references: [users.id],
  }),
  library: one(libraries, {
    fields: [resources.libraryId],
    references: [libraries.id],
  }),
}));

export const suggestionsRelations = relations(suggestions, ({ one }) => ({
  submitter: one(users, {
    fields: [suggestions.submittedBy],
    references: [users.id],
  }),
  library: one(libraries, {
    fields: [suggestions.libraryId],
    references: [libraries.id],
  }),
}));

export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(users, {
    fields: [userRewards.userId],
    references: [users.id],
  }),
  reward: one(rewards, {
    fields: [userRewards.rewardId],
    references: [rewards.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  resource: one(resources, {
    fields: [media.resourceId],
    references: [resources.id],
  }),
  uploader: one(users, {
    fields: [media.uploadedBy],
    references: [users.id],
  }),
  library: one(libraries, {
    fields: [media.libraryId],
    references: [libraries.id],
  }),
}));

export const insertResourceSchema = createInsertSchema(resources).omit({ 
  id: true, 
  createdAt: true, 
  status: true,
  submittedBy: true,
  libraryId: true,
});

export const insertSuggestionSchema = createInsertSchema(suggestions).omit({
  id: true,
  createdAt: true,
  status: true,
  submittedBy: true,
  adminNote: true,
  libraryId: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({ 
  id: true, 
  createdAt: true,
  libraryId: true,
});

export const insertLibrarySchema = createInsertSchema(libraries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type UserReward = typeof userRewards.$inferSelect;
export type Suggestion = typeof suggestions.$inferSelect;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type CreateResourceRequest = InsertResource;
export type UpdateResourceRequest = Partial<InsertResource> & { status?: string };
