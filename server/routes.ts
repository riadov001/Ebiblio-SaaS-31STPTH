import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Resources API ===

  app.get(api.resources.list.path, async (req, res) => {
    const filters = {
      status: req.query.status as string,
      type: req.query.type as string,
      source: req.query.source as string,
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
        status: "pending", // Default to pending
      });

      // Award points for submission? Optional.
      // await storage.addPoints((req.user as any).claims.sub, 10);

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
      // Check if admin/director?
      // For MVP, we'll allow it but in production check role.
      // const user = await storage.getUser((req.user as any).claims.sub);
      // if (user?.role !== 'director') ...

      const id = Number(req.params.id);
      const input = api.resources.update.input.parse(req.body);
      const updated = await storage.updateResource(id, input);
      
      // If approved, maybe award points to submitter?
      if (input.status === 'approved' && updated.submittedBy) {
        await storage.addPoints(updated.submittedBy, 50); // 50 points for approved resource
      }

      res.json(updated);
    } catch (err) {
       return res.status(404).json({ message: "Resource not found" });
    }
  });

  app.delete(api.resources.delete.path, async (req, res) => {
    try {
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

    const results = [];

    try {
      // OpenLibrary
      if (source === 'all' || source === 'openlibrary') {
        const olRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`);
        if (olRes.ok) {
          const data = await olRes.json();
          const books = (data.docs || []).slice(0, 10).map((doc: any) => ({
            externalId: doc.key,
            title: doc.title,
            author: doc.author_name?.[0] || 'Unknown',
            year: doc.first_publish_year,
            source: 'openlibrary',
            type: 'book',
            url: `https://openlibrary.org${doc.key}`,
            coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined
          }));
          results.push(...books);
        }
      }

      // DOAJ
      if (source === 'all' || source === 'doaj') {
        const doajRes = await fetch(`https://doaj.org/api/search/articles/${encodeURIComponent(q)}?pageSize=10`);
        if (doajRes.ok) {
          const data = await doajRes.json();
          const articles = (data.results || []).map((item: any) => ({
            externalId: item.id,
            title: item.bibjson.title,
            author: item.bibjson.author?.[0]?.name || 'Unknown',
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

  // Seed data function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getRewards();
  if (existing.length === 0) {
    await storage.createReward({
      title: "Cafeteria Voucher",
      description: "Get a free meal at the university cafeteria.",
      pointsRequired: 500,
      imageUrl: "https://images.unsplash.com/photo-1554679665-f5537f187268?w=800&auto=format&fit=crop"
    });
    await storage.createReward({
      title: "Library Fine Waiver",
      description: "Waive up to $10 in library late fees.",
      pointsRequired: 300,
      imageUrl: "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop"
    });
    await storage.createReward({
      title: "Access to Premium Journals",
      description: "One month access to premium locked content.",
      pointsRequired: 1000,
      imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop"
    });
  }
}
