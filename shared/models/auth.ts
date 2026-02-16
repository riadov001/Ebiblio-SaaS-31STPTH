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

export const SUBSCRIPTION_TIERS = ['free', 'standard', 'premium'] as const;
export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number];

export const TIER_LABELS: Record<string, string> = {
  free: 'Gratuit',
  standard: 'Standard',
  premium: 'Premium',
};

export const TIER_PRICES: Record<string, number> = {
  free: 0,
  standard: 39.99,
  premium: 69.99,
};

export const TIER_STORAGE_LIMITS_TB: Record<string, number> = {
  free: 1,
  standard: 3,
  premium: 6,
};

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
  subscriptionTier: text("subscription_tier").default("free").notNull(),
  subscriptionStatus: text("subscription_status").default("active").notNull(),
  premiumSupport: integer("premium_support").default(0).notNull(),
  storageLimitTb: integer("storage_limit_tb").default(1).notNull(),
  storageUsedBytes: text("storage_used_bytes").default("0"),
  extraStorageTb: integer("extra_storage_tb").default(0).notNull(),
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
