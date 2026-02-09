import { 
  resources, rewards, userRewards, users,
  type Resource, type InsertResource, type UpdateResourceRequest,
  type Reward, type InsertReward, type UserReward, type User
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, sql, count } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Resources
  getResources(filters?: { status?: string, type?: string, source?: string, search?: string }): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, updates: UpdateResourceRequest): Promise<Resource>;
  deleteResource(id: number): Promise<void>;

  // Rewards
  getRewards(): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  redeemReward(userId: string, rewardId: number): Promise<UserReward>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserPoints(id: string, points: number): Promise<User>;
  deleteUser(id: string): Promise<void>;
  addPoints(userId: string, points: number): Promise<User>;

  // Stats
  getStats(): Promise<{
    totalUsers: number;
    totalResources: number;
    pendingResources: number;
    approvedResources: number;
    totalRewards: number;
    usersByRole: Record<string, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getResources(filters?: { status?: string, type?: string, source?: string, search?: string }): Promise<Resource[]> {
    let query = db.select().from(resources).orderBy(desc(resources.createdAt));
    const conditions = [];

    if (filters?.status) conditions.push(eq(resources.status, filters.status));
    if (filters?.type) conditions.push(eq(resources.type, filters.type));
    if (filters?.source) conditions.push(eq(resources.source, filters.source));
    if (filters?.search) conditions.push(like(resources.title, `%${filters.search}%`));

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db.insert(resources).values(insertResource).returning();
    return resource;
  }

  async updateResource(id: number, updates: UpdateResourceRequest): Promise<Resource> {
    const [updated] = await db
      .update(resources)
      .set(updates)
      .where(eq(resources.id, id))
      .returning();
    return updated;
  }

  async deleteResource(id: number): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }

  async getRewards(): Promise<Reward[]> {
    return await db.select().from(rewards).orderBy(desc(rewards.pointsRequired));
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const [reward] = await db.insert(rewards).values(insertReward).returning();
    return reward;
  }

  async redeemReward(userId: string, rewardId: number): Promise<UserReward> {
    return await db.transaction(async (tx) => {
      const [reward] = await tx.select().from(rewards).where(eq(rewards.id, rewardId));
      if (!reward) throw new Error("Reward not found");

      const [user] = await tx.select().from(users).where(eq(users.id, userId));
      if (!user) throw new Error("User not found");

      if (user.points < reward.pointsRequired) {
        throw new Error("Insufficient points");
      }

      // Deduct points
      await tx.update(users)
        .set({ points: user.points - reward.pointsRequired })
        .where(eq(users.id, userId));

      // Create redemption record
      const [redemption] = await tx.insert(userRewards).values({
        userId,
        rewardId,
      }).returning();

      return redemption;
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return await authStorage.getUser(id);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [updated] = await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new Error("User not found");
    return updated;
  }

  async updateUserPoints(id: string, points: number): Promise<User> {
    const [updated] = await db.update(users)
      .set({ points, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new Error("User not found");
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(userRewards).where(eq(userRewards.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async addPoints(userId: string, points: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const [updated] = await db.update(users)
      .set({ points: user.points + points })
      .where(eq(users.id, userId))
      .returning();
      
    return updated;
  }

  async getStats(): Promise<{
    totalUsers: number;
    totalResources: number;
    pendingResources: number;
    approvedResources: number;
    totalRewards: number;
    usersByRole: Record<string, number>;
  }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [resourceCount] = await db.select({ count: count() }).from(resources);
    const [pendingCount] = await db.select({ count: count() }).from(resources).where(eq(resources.status, 'pending'));
    const [approvedCount] = await db.select({ count: count() }).from(resources).where(eq(resources.status, 'approved'));
    const [rewardCount] = await db.select({ count: count() }).from(rewards);

    const roleGroups = await db.select({ role: users.role, count: count() }).from(users).groupBy(users.role);
    const usersByRole: Record<string, number> = {};
    roleGroups.forEach(r => { usersByRole[r.role] = r.count; });

    return {
      totalUsers: userCount.count,
      totalResources: resourceCount.count,
      pendingResources: pendingCount.count,
      approvedResources: approvedCount.count,
      totalRewards: rewardCount.count,
      usersByRole,
    };
  }
}

export const storage = new DatabaseStorage();
