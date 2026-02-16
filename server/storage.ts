import { 
  resources, rewards, userRewards, users, suggestions, libraries, media,
  type Resource, type InsertResource, type UpdateResourceRequest,
  type Reward, type InsertReward, type UserReward, type User,
  type Suggestion, type InsertSuggestion, type Library, type InsertLibrary,
  type Media, type InsertMedia
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, sql, count, ilike, isNull } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  getResources(filters?: { status?: string, type?: string, source?: string, discipline?: string, search?: string, libraryId?: number }): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: any): Promise<Resource>;
  updateResource(id: number, updates: any): Promise<Resource>;
  deleteResource(id: number): Promise<void>;

  getSuggestions(filters?: { status?: string, libraryId?: number }): Promise<Suggestion[]>;
  getUserSuggestions(userId: string): Promise<Suggestion[]>;
  createSuggestion(suggestion: any): Promise<Suggestion>;
  updateSuggestion(id: number, updates: any): Promise<Suggestion>;

  getRewards(libraryId?: number): Promise<Reward[]>;
  createReward(reward: InsertReward & { libraryId?: number }): Promise<Reward>;
  redeemReward(userId: string, rewardId: number): Promise<UserReward>;

  getUser(id: string): Promise<User | undefined>;
  getAllUsers(libraryId?: number): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserPoints(id: string, points: number): Promise<User>;
  deleteUser(id: string): Promise<void>;
  addPoints(userId: string, points: number): Promise<User>;
  updateUserProfile(id: string, updates: Partial<{ firstName: string; lastName: string; phone: string; address: string; discipline: string; bio: string; profileImageUrl: string; email: string }>): Promise<User>;
  createUser(data: any): Promise<User>;

  getLibraries(): Promise<Library[]>;
  getLibrary(id: number): Promise<Library | undefined>;
  getLibraryBySlug(slug: string): Promise<Library | undefined>;
  createLibrary(lib: InsertLibrary): Promise<Library>;
  updateLibrary(id: number, updates: Partial<InsertLibrary>): Promise<Library>;
  deleteLibrary(id: number): Promise<void>;

  createMedia(data: InsertMedia): Promise<Media>;
  getMedia(filters?: { libraryId?: number, resourceId?: number }): Promise<Media[]>;
  deleteMedia(id: number): Promise<void>;

  getStats(libraryId?: number): Promise<{
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

  getGlobalStats(): Promise<{
    totalLibraries: number;
    totalUsers: number;
    totalResources: number;
    totalMedia: number;
    libraryStats: Array<{ id: number; name: string; universityName: string; users: number; resources: number }>;
  }>;

  exportLibraryData(libraryId: number): Promise<any>;
  exportAllData(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getResources(filters?: { status?: string, type?: string, source?: string, discipline?: string, search?: string, libraryId?: number }): Promise<Resource[]> {
    let query = db.select().from(resources).orderBy(desc(resources.createdAt));
    const conditions = [];

    if (filters?.status) conditions.push(eq(resources.status, filters.status));
    if (filters?.type) conditions.push(eq(resources.type, filters.type));
    if (filters?.source) conditions.push(eq(resources.source, filters.source));
    if (filters?.discipline) conditions.push(eq(resources.discipline, filters.discipline));
    if (filters?.search) conditions.push(ilike(resources.title, `%${filters.search}%`));
    if (filters?.libraryId) conditions.push(eq(resources.libraryId, filters.libraryId));

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
    await db.delete(media).where(eq(media.resourceId, id));
    await db.delete(resources).where(eq(resources.id, id));
  }

  async getSuggestions(filters?: { status?: string, libraryId?: number }): Promise<Suggestion[]> {
    let query = db.select().from(suggestions).orderBy(desc(suggestions.createdAt));
    const conditions = [];
    if (filters?.status) conditions.push(eq(suggestions.status, filters.status));
    if (filters?.libraryId) conditions.push(eq(suggestions.libraryId, filters.libraryId));
    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
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

  async getRewards(libraryId?: number): Promise<Reward[]> {
    if (libraryId) {
      return await db.select().from(rewards)
        .where(eq(rewards.libraryId, libraryId))
        .orderBy(desc(rewards.pointsRequired));
    }
    return await db.select().from(rewards).orderBy(desc(rewards.pointsRequired));
  }

  async createReward(insertReward: InsertReward & { libraryId?: number }): Promise<Reward> {
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

  async getAllUsers(libraryId?: number): Promise<User[]> {
    if (libraryId) {
      return await db.select().from(users)
        .where(eq(users.libraryId, libraryId))
        .orderBy(desc(users.createdAt));
    }
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

  async updateUserProfile(id: string, updates: Partial<{ firstName: string; lastName: string; phone: string; address: string; discipline: string; bio: string; profileImageUrl: string; email: string }>): Promise<User> {
    const [updated] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new Error("User not found");
    return updated;
  }

  async createUser(data: any): Promise<User> {
    const [created] = await db.insert(users).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    return created;
  }

  async getLibraries(): Promise<Library[]> {
    return await db.select().from(libraries).orderBy(desc(libraries.createdAt));
  }

  async getLibrary(id: number): Promise<Library | undefined> {
    const [lib] = await db.select().from(libraries).where(eq(libraries.id, id));
    return lib;
  }

  async getLibraryBySlug(slug: string): Promise<Library | undefined> {
    const [lib] = await db.select().from(libraries).where(eq(libraries.slug, slug));
    return lib;
  }

  async createLibrary(data: InsertLibrary): Promise<Library> {
    const [lib] = await db.insert(libraries).values(data).returning();
    return lib;
  }

  async updateLibrary(id: number, updates: Partial<InsertLibrary>): Promise<Library> {
    const [updated] = await db.update(libraries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(libraries.id, id))
      .returning();
    if (!updated) throw new Error("Library not found");
    return updated;
  }

  async deleteLibrary(id: number): Promise<void> {
    await db.delete(media).where(eq(media.libraryId, id));
    await db.delete(userRewards).where(
      sql`user_id IN (SELECT id FROM users WHERE library_id = ${id})`
    );
    await db.delete(suggestions).where(eq(suggestions.libraryId, id));
    await db.delete(resources).where(eq(resources.libraryId, id));
    await db.delete(rewards).where(eq(rewards.libraryId, id));
    await db.delete(users).where(eq(users.libraryId, id));
    await db.delete(libraries).where(eq(libraries.id, id));
  }

  async createMedia(data: InsertMedia): Promise<Media> {
    const [m] = await db.insert(media).values(data).returning();
    return m;
  }

  async getMedia(filters?: { libraryId?: number, resourceId?: number }): Promise<Media[]> {
    const conditions = [];
    if (filters?.libraryId) conditions.push(eq(media.libraryId, filters.libraryId));
    if (filters?.resourceId) conditions.push(eq(media.resourceId, filters.resourceId));

    if (conditions.length > 0) {
      return await db.select().from(media)
        .where(and(...conditions))
        .orderBy(desc(media.createdAt));
    }
    return await db.select().from(media).orderBy(desc(media.createdAt));
  }

  async deleteMedia(id: number): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  async getStats(libraryId?: number) {
    const libCondition = libraryId ? eq(users.libraryId, libraryId) : undefined;
    const resLibCondition = libraryId ? eq(resources.libraryId, libraryId) : undefined;
    const sugLibCondition = libraryId ? eq(suggestions.libraryId, libraryId) : undefined;
    const rewLibCondition = libraryId ? eq(rewards.libraryId, libraryId) : undefined;

    const [userCount] = await db.select({ count: count() }).from(users).where(libCondition);
    const [resourceCount] = await db.select({ count: count() }).from(resources).where(resLibCondition);
    const [pendingCount] = await db.select({ count: count() }).from(resources).where(
      resLibCondition ? and(eq(resources.status, 'pending'), resLibCondition) : eq(resources.status, 'pending')
    );
    const [approvedCount] = await db.select({ count: count() }).from(resources).where(
      resLibCondition ? and(eq(resources.status, 'approved'), resLibCondition) : eq(resources.status, 'approved')
    );
    const [rewardCount] = await db.select({ count: count() }).from(rewards).where(rewLibCondition);
    const [suggestionCount] = await db.select({ count: count() }).from(suggestions).where(sugLibCondition);
    const [pendingSuggestionCount] = await db.select({ count: count() }).from(suggestions).where(
      sugLibCondition ? and(eq(suggestions.status, 'pending'), sugLibCondition) : eq(suggestions.status, 'pending')
    );

    const roleGroups = libraryId 
      ? await db.select({ role: users.role, count: count() }).from(users).where(eq(users.libraryId, libraryId)).groupBy(users.role)
      : await db.select({ role: users.role, count: count() }).from(users).groupBy(users.role);
    const usersByRole: Record<string, number> = {};
    roleGroups.forEach(r => { usersByRole[r.role] = r.count; });

    const typeGroups = libraryId
      ? await db.select({ type: resources.type, count: count() }).from(resources).where(eq(resources.libraryId, libraryId)).groupBy(resources.type)
      : await db.select({ type: resources.type, count: count() }).from(resources).groupBy(resources.type);
    const resourcesByType: Record<string, number> = {};
    typeGroups.forEach(r => { resourcesByType[r.type] = r.count; });

    const disciplineGroups = libraryId
      ? await db.select({ discipline: resources.discipline, count: count() }).from(resources).where(eq(resources.libraryId, libraryId)).groupBy(resources.discipline)
      : await db.select({ discipline: resources.discipline, count: count() }).from(resources).groupBy(resources.discipline);
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

  async getGlobalStats() {
    const [libCount] = await db.select({ count: count() }).from(libraries);
    const [userCount] = await db.select({ count: count() }).from(users);
    const [resourceCount] = await db.select({ count: count() }).from(resources);
    const [mediaCount] = await db.select({ count: count() }).from(media);

    const allLibs = await db.select().from(libraries);
    const libraryStats = [];
    for (const lib of allLibs) {
      const [uCount] = await db.select({ count: count() }).from(users).where(eq(users.libraryId, lib.id));
      const [rCount] = await db.select({ count: count() }).from(resources).where(eq(resources.libraryId, lib.id));
      libraryStats.push({
        id: lib.id,
        name: lib.name,
        universityName: lib.universityName,
        users: uCount.count,
        resources: rCount.count,
      });
    }

    return {
      totalLibraries: libCount.count,
      totalUsers: userCount.count,
      totalResources: resourceCount.count,
      totalMedia: mediaCount.count,
      libraryStats,
    };
  }

  async exportLibraryData(libraryId: number) {
    const lib = await this.getLibrary(libraryId);
    const libUsers = await this.getAllUsers(libraryId);
    const libResources = await this.getResources({ libraryId });
    const libSuggestions = await this.getSuggestions({ libraryId });
    const libRewards = await this.getRewards(libraryId);
    const libMedia = await this.getMedia({ libraryId });

    return {
      exportedAt: new Date().toISOString(),
      library: lib,
      users: libUsers.map(u => ({ ...u, profileImageUrl: undefined })),
      resources: libResources,
      suggestions: libSuggestions,
      rewards: libRewards,
      media: libMedia,
    };
  }

  async exportAllData() {
    const allLibs = await this.getLibraries();
    const allData = [];
    for (const lib of allLibs) {
      const data = await this.exportLibraryData(lib.id);
      allData.push(data);
    }
    return {
      exportedAt: new Date().toISOString(),
      platform: "E-Biblio SaaS",
      libraries: allData,
    };
  }
}

export const storage = new DatabaseStorage();
