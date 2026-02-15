import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { api } from "@shared/routes";
import { users } from "@shared/schema";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Resources API ===

  app.get(api.resources.list.path, async (req, res) => {
    const filters = {
      status: req.query.status as string,
      type: req.query.type as string,
      source: req.query.source as string,
      discipline: req.query.discipline as string,
      search: req.query.search as string,
    };
    const resources = await storage.getResources(filters);
    res.json(resources);
  });

  app.get(api.resources.get.path, async (req, res) => {
    const resource = await storage.getResource(Number(req.params.id));
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
  });

  app.post(api.resources.create.path, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const input = api.resources.create.input.parse(req.body);
      const resource = await storage.createResource({
        ...input,
        submittedBy: (req.user as any).claims.sub,
        status: "pending",
      });

      res.status(201).json(resource);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.resources.update.path, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !['professor', 'director', 'super_admin'].includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
      }

      const id = Number(req.params.id);
      const input = api.resources.update.input.parse(req.body);
      const updated = await storage.updateResource(id, input);
      
      if (input.status === 'approved' && updated.submittedBy) {
        await storage.addPoints(updated.submittedBy, 50);
      }

      res.json(updated);
    } catch (err) {
       return res.status(404).json({ message: "Resource not found" });
    }
  });

  app.delete(api.resources.delete.path, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !['professor', 'director', 'super_admin'].includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
      }
      await storage.deleteResource(Number(req.params.id));
      res.status(204).end();
    } catch (err) {
      res.status(404).json({ message: "Resource not found" });
    }
  });

  // === External Search API ===

  app.get(api.external.search.path, async (req, res) => {
    const q = req.query.q as string;
    const source = req.query.source as string || 'all';
    
    if (!q) return res.json([]);

    const results: any[] = [];

    try {
      if (source === 'all' || source === 'openlibrary') {
        const olRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`);
        if (olRes.ok) {
          const data = await olRes.json();
          const books = (data.docs || []).slice(0, 10).map((doc: any) => ({
            externalId: doc.key,
            title: doc.title,
            author: doc.author_name?.[0] || 'Inconnu',
            year: doc.first_publish_year,
            source: 'openlibrary',
            type: 'book',
            url: `https://openlibrary.org${doc.key}`,
            coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined
          }));
          results.push(...books);
        }
      }

      if (source === 'all' || source === 'doaj') {
        const doajRes = await fetch(`https://doaj.org/api/search/articles/${encodeURIComponent(q)}?pageSize=10`);
        if (doajRes.ok) {
          const data = await doajRes.json();
          const articles = (data.results || []).map((item: any) => ({
            externalId: item.id,
            title: item.bibjson.title,
            author: item.bibjson.author?.[0]?.name || 'Inconnu',
            year: Number(item.bibjson.year),
            source: 'doaj',
            type: 'article',
            url: item.bibjson.link?.[0]?.url,
            coverUrl: undefined
          }));
          results.push(...articles);
        }
      }
    } catch (e) {
      console.error("External search error:", e);
    }

    res.json(results);
  });

  // === Suggestions API ===

  app.get(api.suggestions.list.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).claims.sub;
    const user = await storage.getUser(userId);
    if (!user || !['professor', 'director', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const filters = { status: req.query.status as string };
    const list = await storage.getSuggestions(filters);
    res.json(list);
  });

  app.get(api.suggestions.mySuggestions.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).claims.sub;
    const list = await storage.getUserSuggestions(userId);
    res.json(list);
  });

  app.post(api.suggestions.create.path, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const input = api.suggestions.create.input.parse(req.body);
      const suggestion = await storage.createSuggestion({
        ...input,
        submittedBy: (req.user as any).claims.sub,
        status: "pending",
      });

      await storage.addPoints((req.user as any).claims.sub, 10);

      res.status(201).json(suggestion);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.suggestions.update.path, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !['professor', 'director', 'super_admin'].includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
      }
      const id = Number(req.params.id);
      const input = api.suggestions.update.input.parse(req.body);
      const updated = await storage.updateSuggestion(id, input);
      res.json(updated);
    } catch (err) {
      res.status(404).json({ message: "Suggestion not found" });
    }
  });

  // === Rewards API ===

  app.get(api.rewards.list.path, async (req, res) => {
    const rewards = await storage.getRewards();
    res.json(rewards);
  });

  app.post(api.rewards.create.path, async (req, res) => {
    const input = api.rewards.create.input.parse(req.body);
    const reward = await storage.createReward(input);
    res.status(201).json(reward);
  });

  app.post(api.rewards.redeem.path, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const userId = (req.user as any).claims.sub;
      const rewardId = Number(req.params.id);
      
      const redemption = await storage.redeemReward(userId, rewardId);
      res.json(redemption);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // === Admin API ===

  const requireSuperAdmin = async (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    if (!user || (user.role !== 'super_admin' && user.role !== 'director')) {
      return res.status(403).json({ message: "Forbidden: Super Admin access required" });
    }
    next();
  };

  app.get(api.admin.users.list.path, requireSuperAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.patch(api.admin.users.updateRole.path, requireSuperAdmin, async (req, res) => {
    try {
      const input = api.admin.users.updateRole.input.parse(req.body);
      const updated = await storage.updateUserRole(req.params.id, input.role);
      res.json(updated);
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  });

  app.patch(api.admin.users.updatePoints.path, requireSuperAdmin, async (req, res) => {
    try {
      const input = api.admin.users.updatePoints.input.parse(req.body);
      const updated = await storage.updateUserPoints(req.params.id, input.points);
      res.json(updated);
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  });

  app.delete(api.admin.users.delete.path, requireSuperAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).end();
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  });

  app.get(api.admin.stats.path, requireSuperAdmin, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  await seedDatabase();
  await createTestAccounts();

  return httpServer;
}

async function createTestAccounts() {
  const testUsers = [
    { id: "demo-director", email: "director@example.com", firstName: "Jean", lastName: "Directeur", role: "director" },
    { id: "demo-professor", email: "professor@example.com", firstName: "Marie", lastName: "Professeur", role: "professor" },
    { id: "demo-student", email: "student@example.com", firstName: "Luc", lastName: "Etudiant", role: "student" },
  ];

  for (const u of testUsers) {
    const existing = await storage.getUser(u.id);
    if (!existing) {
      await db.insert(users).values({
        ...u,
        points: u.role === 'student' ? 100 : 0,
        updatedAt: new Date()
      }).onConflictDoNothing();
    }
  }
}

async function seedDatabase() {
  const existing = await storage.getRewards();
  if (existing.length === 0) {
    await storage.createReward({
      title: "Bon Cafétéria",
      description: "Obtenez un repas gratuit à la cafétéria universitaire.",
      pointsRequired: 500,
      imageUrl: null,
    });
    await storage.createReward({
      title: "Exonération Frais de Retard",
      description: "Annulation des frais de retard de la bibliothèque.",
      pointsRequired: 300,
      imageUrl: null,
    });
    await storage.createReward({
      title: "Accès Revues Premium",
      description: "Un mois d'accès aux revues scientifiques premium.",
      pointsRequired: 1000,
      imageUrl: null,
    });
  }
}
