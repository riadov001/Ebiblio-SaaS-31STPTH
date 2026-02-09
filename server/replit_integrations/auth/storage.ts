import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const superAdmins = ['sasmyjantes@gmail.com', 'bakengela.shamba@upc.ac.cd'];
    const role = superAdmins.includes(userData.email) ? 'super_admin' : (userData.role || 'student');
    const finalData = { ...userData, role };
    const [user] = await db
      .insert(users)
      .values(finalData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...finalData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
