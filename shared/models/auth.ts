import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, integer, text, serial } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const libraries = pgTable("libraries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  universityName: text("university_name").notNull(),
  logoUrl: text("logo_url"),
  description: text("description"),
  primaryColor: text("primary_color").default("#052c65"),
  secondaryColor: text("secondary_color").default("#C9A84C"),
  contactEmail: text("contact_email"),
  website: text("website"),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").default("student").notNull(),
  points: integer("points").default(0).notNull(),
  libraryId: integer("library_id").references(() => libraries.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Library = typeof libraries.$inferSelect;
export type InsertLibrary = typeof libraries.$inferInsert;
