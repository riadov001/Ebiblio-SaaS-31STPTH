import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { api } from "@shared/routes";
import { users } from "@shared/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

async function getUserFromReq(req: any) {
  if (!req.user) return null;
  const userId = req.user.claims.sub;
  return await storage.getUser(userId);
}

const requireAuth = async (req: any, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  next();
};

const requireSuperAdmin = async (req: any, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const user = await getUserFromReq(req);
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ message: "Forbidden: Super Admin access required" });
  }
  next();
};

const requireAdminRole = async (req: any, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const user = await getUserFromReq(req);
  if (!user || !['professor', 'director', 'super_admin'].includes(user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient permissions" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  // === Library Info (public for current library context) ===
  app.get('/api/library/current', async (req, res) => {
    const user = await getUserFromReq(req);
    const libraryId = user?.libraryId || 1;
    const library = await storage.getLibrary(libraryId);
    res.json(library || null);
  });

  // === Resources API ===

  app.get(api.resources.list.path, async (req, res) => {
    const user = await getUserFromReq(req);
    const filters = {
      status: req.query.status as string,
      type: req.query.type as string,
      source: req.query.source as string,
      discipline: req.query.discipline as string,
      search: req.query.search as string,
      libraryId: user?.libraryId || undefined,
    };
    const resources = await storage.getResources(filters);
    res.json(resources);
  });

  app.get(api.resources.get.path, async (req, res) => {
    const resource = await storage.getResource(Number(req.params.id));
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    res.json(resource);
  });

  app.post(api.resources.create.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.resources.create.input.parse(req.body);
      const user = await getUserFromReq(req);
      const resource = await storage.createResource({
        ...input,
        submittedBy: req.user.claims.sub,
        status: "pending",
        libraryId: user?.libraryId || 1,
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

  app.patch(api.resources.update.path, requireAdminRole, async (req: any, res) => {
    try {
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

  app.delete(api.resources.delete.path, requireAdminRole, async (req: any, res) => {
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
    const author = req.query.author as string || '';
    const yearFrom = req.query.yearFrom ? Number(req.query.yearFrom) : undefined;
    const yearTo = req.query.yearTo ? Number(req.query.yearTo) : undefined;
    const language = req.query.language as string || '';
    const subject = req.query.subject as string || '';
    const sort = req.query.sort as string || 'relevance';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(5, Number(req.query.limit) || 20));
    
    if (!q) return res.json({ results: [], totalResults: 0, page: 1, totalPages: 0 });

    const allResults: any[] = [];
    let olTotal = 0;
    let doajTotal = 0;

    try {
      const perSourceLimit = source === 'all' ? Math.ceil(limit / 2) : limit;
      const perSourceOffset = source === 'all' ? Math.ceil((page - 1) * limit / 2) : (page - 1) * limit;

      if (source === 'all' || source === 'openlibrary') {
        const olParams = new URLSearchParams();
        let olQuery = q;
        if (author) olQuery += ` author:${author}`;
        if (subject) olQuery += ` subject:${subject}`;
        olParams.set('q', olQuery);
        olParams.set('limit', String(source === 'all' ? perSourceLimit : limit));
        olParams.set('offset', String(source === 'all' ? perSourceOffset : (page - 1) * limit));
        if (language) olParams.set('language', language);
        if (yearFrom || yearTo) {
          const from = yearFrom || 1800;
          const to = yearTo || new Date().getFullYear();
          olParams.set('first_publish_year', `[${from} TO ${to}]`);
        }
        if (sort === 'newest') olParams.set('sort', 'new');
        else if (sort === 'oldest') olParams.set('sort', 'old');
        else if (sort === 'title') olParams.set('sort', 'title');

        const olRes = await fetch(`https://openlibrary.org/search.json?${olParams.toString()}`);
        if (olRes.ok) {
          const data = await olRes.json();
          olTotal = data.numFound || 0;
          const books = (data.docs || []).map((doc: any) => ({
            externalId: doc.key,
            title: doc.title,
            author: doc.author_name?.[0] || 'Inconnu',
            year: doc.first_publish_year,
            source: 'openlibrary',
            type: 'book',
            url: `https://openlibrary.org${doc.key}`,
            coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
            language: doc.language?.[0],
            subject: doc.subject?.slice(0, 5),
            publisher: doc.publisher?.[0],
            isbn: doc.isbn?.[0],
          }));
          allResults.push(...books);
        }
      }

      if (source === 'all' || source === 'doaj') {
        let doajQuery = q;
        if (author) doajQuery += ` AND bibjson.author.name:${author}`;
        if (subject) doajQuery += ` AND bibjson.subject.term:${subject}`;
        if (yearFrom && yearTo) doajQuery += ` AND bibjson.year:[${yearFrom} TO ${yearTo}]`;
        else if (yearFrom) doajQuery += ` AND bibjson.year:[${yearFrom} TO *]`;
        else if (yearTo) doajQuery += ` AND bibjson.year:[* TO ${yearTo}]`;

        const doajParams = new URLSearchParams();
        doajParams.set('pageSize', String(source === 'all' ? perSourceLimit : limit));
        doajParams.set('page', String(page));
        if (sort === 'newest') doajParams.set('sort', 'created_date:desc');
        else if (sort === 'oldest') doajParams.set('sort', 'created_date:asc');
        else if (sort === 'title') doajParams.set('sort', 'bibjson.title:asc');

        const doajRes = await fetch(`https://doaj.org/api/search/articles/${encodeURIComponent(doajQuery)}?${doajParams.toString()}`);
        if (doajRes.ok) {
          const data = await doajRes.json();
          doajTotal = data.total || 0;
          const articles = (data.results || []).map((item: any) => ({
            externalId: item.id,
            title: item.bibjson.title,
            author: item.bibjson.author?.[0]?.name || 'Inconnu',
            year: Number(item.bibjson.year),
            source: 'doaj',
            type: 'article',
            url: item.bibjson.link?.[0]?.url,
            coverUrl: undefined,
            language: item.bibjson.journal?.language?.[0],
            subject: item.bibjson.subject?.map((s: any) => s.term).slice(0, 5),
            journal: item.bibjson.journal?.title,
            abstract: item.bibjson.abstract?.substring(0, 300),
            publisher: item.bibjson.journal?.publisher,
            isbn: item.bibjson.journal?.issns?.[0],
          }));
          allResults.push(...articles);
        }
      }
    } catch (e) {
      console.error("External search error:", e);
    }

    if (sort === 'newest') allResults.sort((a, b) => (b.year || 0) - (a.year || 0));
    else if (sort === 'oldest') allResults.sort((a, b) => (a.year || 0) - (b.year || 0));
    else if (sort === 'title') allResults.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    const totalResults = source === 'all' ? olTotal + doajTotal : (source === 'openlibrary' ? olTotal : doajTotal);
    const trimmedResults = allResults.slice(0, limit);
    const totalPages = Math.ceil(totalResults / limit);

    res.json({ results: trimmedResults, totalResults, page, totalPages });
  });

  // === Suggestions API ===

  app.get(api.suggestions.list.path, requireAdminRole, async (req: any, res) => {
    const user = await getUserFromReq(req);
    const filters = {
      status: req.query.status as string,
      libraryId: user?.role === 'super_admin' ? undefined : user?.libraryId || undefined,
    };
    const list = await storage.getSuggestions(filters);
    res.json(list);
  });

  app.get(api.suggestions.mySuggestions.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const list = await storage.getUserSuggestions(userId);
    res.json(list);
  });

  app.post(api.suggestions.create.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.suggestions.create.input.parse(req.body);
      const user = await getUserFromReq(req);
      const suggestion = await storage.createSuggestion({
        ...input,
        submittedBy: req.user.claims.sub,
        status: "pending",
        libraryId: user?.libraryId || 1,
      });

      await storage.addPoints(req.user.claims.sub, 10);

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

  app.patch(api.suggestions.update.path, requireAdminRole, async (req: any, res) => {
    try {
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
    const user = await getUserFromReq(req);
    const rewards = await storage.getRewards(user?.libraryId || undefined);
    res.json(rewards);
  });

  app.post(api.rewards.create.path, requireAdminRole, async (req: any, res) => {
    const input = api.rewards.create.input.parse(req.body);
    const user = await getUserFromReq(req);
    const reward = await storage.createReward({
      ...input,
      libraryId: user?.libraryId || 1,
    });
    res.status(201).json(reward);
  });

  app.post(api.rewards.redeem.path, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rewardId = Number(req.params.id);
      
      const redemption = await storage.redeemReward(userId, rewardId);
      res.json(redemption);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // === Admin API ===

  app.get(api.admin.users.list.path, requireAdminRole, async (req: any, res) => {
    const user = await getUserFromReq(req);
    const libraryId = user?.role === 'super_admin' ? undefined : user?.libraryId || undefined;
    const allUsers = await storage.getAllUsers(libraryId);
    res.json(allUsers);
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

  app.patch(api.admin.users.updatePoints.path, requireAdminRole, async (req: any, res) => {
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

  app.get(api.admin.stats.path, requireAdminRole, async (req: any, res) => {
    const user = await getUserFromReq(req);
    const libraryId = user?.role === 'super_admin' ? undefined : user?.libraryId || undefined;
    const stats = await storage.getStats(libraryId);
    res.json(stats);
  });

  // === Library Management API (Super Admin) ===

  app.get('/api/admin/libraries', requireSuperAdmin, async (req, res) => {
    const libs = await storage.getLibraries();
    res.json(libs);
  });

  app.post('/api/admin/libraries', requireSuperAdmin, async (req, res) => {
    try {
      const data = req.body;
      if (!data.name || !data.slug || !data.universityName) {
        return res.status(400).json({ message: "name, slug, and universityName are required" });
      }
      const existing = await storage.getLibraryBySlug(data.slug);
      if (existing) {
        return res.status(400).json({ message: "A library with this slug already exists" });
      }
      const lib = await storage.createLibrary(data);
      res.status(201).json(lib);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch('/api/admin/libraries/:id', requireSuperAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updated = await storage.updateLibrary(id, req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  });

  app.delete('/api/admin/libraries/:id', requireSuperAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (id === 1) return res.status(400).json({ message: "Cannot delete the default library" });
      await storage.deleteLibrary(id);
      res.status(204).end();
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  });

  // === Global Stats (Super Admin) ===

  app.get('/api/admin/global-stats', requireSuperAdmin, async (req, res) => {
    const stats = await storage.getGlobalStats();
    res.json(stats);
  });

  // === Backup / Export API (Super Admin) ===

  app.get('/api/admin/export/library/:id', requireSuperAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const data = await storage.exportLibraryData(id);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="ebiblio-export-library-${id}-${Date.now()}.json"`);
      res.json(data);
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  });

  app.get('/api/admin/export/all', requireSuperAdmin, async (req, res) => {
    try {
      const data = await storage.exportAllData();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="ebiblio-export-all-${Date.now()}.json"`);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // === User Library Assignment (Super Admin) ===

  app.patch('/api/admin/users/:id/library', requireSuperAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { libraryId } = req.body;
      const [updated] = await db.update(users)
        .set({ libraryId, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  await seedDatabase();
  await createTestAccounts();

  return httpServer;
}

async function createTestAccounts() {
  const testUsers = [
    { id: "demo-director", email: "director@example.com", firstName: "Jean", lastName: "Directeur", role: "director", libraryId: 1 },
    { id: "demo-professor", email: "professor@example.com", firstName: "Marie", lastName: "Professeur", role: "professor", libraryId: 1 },
    { id: "demo-student", email: "student@example.com", firstName: "Luc", lastName: "Etudiant", role: "student", libraryId: 1 },
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
      libraryId: 1,
    });
    await storage.createReward({
      title: "Exonération Frais de Retard",
      description: "Annulation des frais de retard de la bibliothèque.",
      pointsRequired: 300,
      imageUrl: null,
      libraryId: 1,
    });
    await storage.createReward({
      title: "Accès Revues Premium",
      description: "Un mois d'accès aux revues scientifiques premium.",
      pointsRequired: 1000,
      imageUrl: null,
      libraryId: 1,
    });
  }
}
