import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createLocalUser(data: { email: string; password: string; firstName: string; lastName: string }): Promise<User>;
}

const SUPER_ADMIN_EMAILS = ["sasmyjantes@gmail.com", "bakengela.shamba@upc.ac.cd"];

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const role = SUPER_ADMIN_EMAILS.includes(userData.email || "")
      ? "super_admin"
      : userData.role || "student";
    const finalData = { ...userData, role, libraryId: userData.libraryId || 1 };

    if (finalData.email) {
      const [existingByEmail] = await db.select().from(users).where(eq(users.email, finalData.email));
      if (existingByEmail && existingByEmail.id !== finalData.id) {
        const [updated] = await db
          .update(users)
          .set({
            id: finalData.id,
            firstName: finalData.firstName,
            lastName: finalData.lastName,
            profileImageUrl: finalData.profileImageUrl,
            role: finalData.role,
            updatedAt: new Date(),
          })
          .where(eq(users.email, finalData.email))
          .returning();
        return updated;
      }
    }

    const [user] = await db
      .insert(users)
      .values(finalData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          email: finalData.email,
          profileImageUrl: finalData.profileImageUrl,
          role: finalData.role,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createLocalUser(data: { email: string; password: string; firstName: string; lastName: string }): Promise<User> {
    const role = SUPER_ADMIN_EMAILS.includes(data.email) ? "super_admin" : "student";
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role,
        points: 0,
        libraryId: 1,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
