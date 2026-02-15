import { 
  resources, rewards, userRewards, users, suggestions,
  type Resource, type InsertResource, type UpdateResourceRequest,
  type Reward, type InsertReward, type UserReward, type User,
  type Suggestion, type InsertSuggestion
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, sql, count, ilike } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  getResources(filters?: { status?: string, type?: string, source?: string, discipline?: string, search?: string }): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: any): Promise<Resource>;
  updateResource(id: number, updates: any): Promise<Resource>;
  deleteResource(id: number): Promise<void>;

  getSuggestions(filters?: { status?: string }): Promise<Suggestion[]>;
  getUserSuggestions(userId: string): Promise<Suggestion[]>;
  createSuggestion(suggestion: any): Promise<Suggestion>;
  updateSuggestion(id: number, updates: any): Promise<Suggestion>;

  getRewards(): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  redeemReward(userId: string, rewardId: number): Promise<UserReward>;

  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserPoints(id: string, points: number): Promise<User>;
  deleteUser(id: string): Promise<void>;
  addPoints(userId: string, points: number): Promise<User>;

  getStats(): Promise<{
    totalUsers: number;
    totalResources: number;
    pendingResources: number;
    approvedResources: number;
    totalRewards: number;
    totalSuggestions: number;
    pendingSuggestions: number;
    usersByRole: Record<string, number>;
    resourcesByType: Record<string, number>;
    resourcesByDiscipline: Record<string, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getResources(filters?: { status?: string, type?: string, source?: string, discipline?: string, search?: string }): Promise<Resource[]> {
    let query = db.select().from(resources).orderBy(desc(resources.createdAt));
    const conditions = [];

    if (filters?.status) conditions.push(eq(resources.status, filters.status));
    if (filters?.type) conditions.push(eq(resources.type, filters.type));
    if (filters?.source) conditions.push(eq(resources.source, filters.source));
    if (filters?.discipline) conditions.push(eq(resources.discipline, filters.discipline));
    if (filters?.search) conditions.push(ilike(resources.title, `%${filters.search}%`));

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

  async createResource(insertResource: any): Promise<Resource> {
    const [resource] = await db.insert(resources).values(insertResource).returning();
    return resource;
  }

  async updateResource(id: number, updates: any): Promise<Resource> {
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

  async getSuggestions(filters?: { status?: string }): Promise<Suggestion[]> {
    let query = db.select().from(suggestions).orderBy(desc(suggestions.createdAt));
    if (filters?.status) {
      // @ts-ignore
      query = query.where(eq(suggestions.status, filters.status));
    }
    return await query;
  }

  async getUserSuggestions(userId: string): Promise<Suggestion[]> {
    return await db.select().from(suggestions)
      .where(eq(suggestions.submittedBy, userId))
      .orderBy(desc(suggestions.createdAt));
  }

  async createSuggestion(data: any): Promise<Suggestion> {
    const [suggestion] = await db.insert(suggestions).values(data).returning();
    return suggestion;
  }

  async updateSuggestion(id: number, updates: any): Promise<Suggestion> {
    const [updated] = await db
      .update(suggestions)
      .set(updates)
      .where(eq(suggestions.id, id))
      .returning();
    return updated;
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

      await tx.update(users)
        .set({ points: user.points - reward.pointsRequired })
        .where(eq(users.id, userId));

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

  async getStats() {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [resourceCount] = await db.select({ count: count() }).from(resources);
    const [pendingCount] = await db.select({ count: count() }).from(resources).where(eq(resources.status, 'pending'));
    const [approvedCount] = await db.select({ count: count() }).from(resources).where(eq(resources.status, 'approved'));
    const [rewardCount] = await db.select({ count: count() }).from(rewards);
    const [suggestionCount] = await db.select({ count: count() }).from(suggestions);
    const [pendingSuggestionCount] = await db.select({ count: count() }).from(suggestions).where(eq(suggestions.status, 'pending'));

    const roleGroups = await db.select({ role: users.role, count: count() }).from(users).groupBy(users.role);
    const usersByRole: Record<string, number> = {};
    roleGroups.forEach(r => { usersByRole[r.role] = r.count; });

    const typeGroups = await db.select({ type: resources.type, count: count() }).from(resources).groupBy(resources.type);
    const resourcesByType: Record<string, number> = {};
    typeGroups.forEach(r => { resourcesByType[r.type] = r.count; });

    const disciplineGroups = await db.select({ discipline: resources.discipline, count: count() }).from(resources).groupBy(resources.discipline);
    const resourcesByDiscipline: Record<string, number> = {};
    disciplineGroups.forEach(r => { if (r.discipline) resourcesByDiscipline[r.discipline] = r.count; });

    return {
      totalUsers: userCount.count,
      totalResources: resourceCount.count,
      pendingResources: pendingCount.count,
      approvedResources: approvedCount.count,
      totalRewards: rewardCount.count,
      totalSuggestions: suggestionCount.count,
      pendingSuggestions: pendingSuggestionCount.count,
      usersByRole,
      resourcesByType,
      resourcesByDiscipline,
    };
  }
}

export const storage = new DatabaseStorage();
