import type { Express } from "express";
import bcrypt from "bcryptjs";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    res.json(req.user);
  });

  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis." });
      }
      const user = await authStorage.getUserByEmail(email.trim().toLowerCase());
      if (!user || !user.password) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect." });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect." });
      }
      req.session.userId = user.id;
      const { password: _pw, ...safeUser } = user;
      res.json(safeUser);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
      }
      const existing = await authStorage.getUserByEmail(email.trim().toLowerCase());
      if (existing) {
        return res.status(409).json({ message: "Un compte existe déjà avec cet email." });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await authStorage.createLocalUser({
        email: email.trim().toLowerCase(),
        password: hashed,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      req.session.userId = user.id;
      const { password: _pw, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.json({ message: "Déconnecté" });
    });
  });

  app.get("/api/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}
