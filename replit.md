# E-Biblio UPC

## Overview

E-Biblio is a **multi-tenant SaaS** digital library management platform. Originally built for Université Protestante au Congo (UPC), it now supports multiple universities/libraries. Students browse, search, and submit academic resources; professors/directors approve submissions. The platform includes gamification (points/rewards) and is 100% French UI.

Key features:
- **Multi-tenant architecture** — `libraries` table as tenant model, all data scoped by libraryId
- **Super Admin library management** — Create, edit, delete, toggle libraries with global stats & data export
- **Resource catalog** with internal and advanced external search (OpenLibrary, DOAJ) — author, year range, language, discipline, sort, pagination
- **Resource submission & approval workflow** (pending -> approved/rejected) with server-side role enforcement
- **Role-based access control** (student, professor, director, super_admin) enforced on both frontend and backend
- **Points & rewards system** for student engagement (+50 pts approved resource, +10 pts suggestion)
- **Admin dashboard** with user management, statistics, and full CRUD on resources/rewards
- **Academic Sources Directory** — 40+ curated open access databases in 9 categories with search/filter
- **Suggestions system** — Users propose new resources, admins approve/reject with notes
- **Discipline filtering** — 17 academic disciplines for resource categorization
- **Object Storage** — File uploads via Replit Object Storage with presigned URL flow
- **Data export/backup** — Per-library and global JSON export for super admins
- **User library assignment** — Super admins can transfer users between libraries
- **Replit Auth** integration via OpenID Connect for authentication

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **React** with TypeScript, using **Vite** as the build tool
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack React Query** for server state management and data fetching
- **Shadcn/ui** component library (new-york style) built on Radix UI primitives
- **Tailwind CSS** for styling with custom CSS variables for theming (UPC brand colors: deep blue & gold)
- **Framer Motion** for animations
- **Recharts** for dashboard data visualization
- **date-fns** for date formatting (French locale)
- Path aliases: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Express.js** server running on Node.js with TypeScript (via `tsx`)
- **HTTP server** created manually with `createServer` to support potential WebSocket upgrades
- API routes are prefixed with `/api/` and defined in `server/routes.ts`
- Shared API contract in `shared/routes.ts` using Zod schemas for type-safe request/response validation
- Development uses Vite middleware for HMR; production serves static files from `dist/public`

### Database
- **PostgreSQL** database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM** for type-safe database queries and schema management
- **drizzle-zod** for generating Zod schemas from Drizzle table definitions
- Schema defined in `shared/schema.ts` and `shared/models/auth.ts`
- Migrations output to `./migrations` directory
- Use `npm run db:push` (drizzle-kit push) to sync schema to database

### Database Tables
- **users** — id (UUID), email, firstName, lastName, profileImageUrl, role, points, timestamps
- **sessions** — Passport/express-session storage in PostgreSQL via connect-pg-simple
- **resources** — Academic resources with title, type, source, status (pending/approved/rejected), submittedBy (FK to users)
- **rewards** — Redeemable rewards with title, description, pointsRequired
- **user_rewards** — Junction table tracking which users redeemed which rewards

### Authentication
- **Replit Auth** via OpenID Connect (OIDC) with Passport.js
- Session stored in PostgreSQL using `connect-pg-simple`
- Auth module is self-contained in `server/replit_integrations/auth/`
- User upsert on login — certain emails are auto-assigned `super_admin` role
- Protected routes check `req.user` for authentication and role for authorization

### Role-Based Access
- **student** — Browse catalog, search externally, submit resources, earn/redeem points
- **professor** — All student abilities + approve/reject pending resources
- **director** — Same as professor
- **super_admin** — Full control: manage users, roles, points, resources, rewards

### Build Process
- Client: Vite builds to `dist/public`
- Server: esbuild bundles `server/index.ts` to `dist/index.cjs` with selective dependency bundling (allowlisted deps are bundled, others externalized)
- Production start: `node dist/index.cjs`

## External Dependencies

### Required Services
- **PostgreSQL** — Primary database (must have `DATABASE_URL` environment variable set)
- **Replit Auth (OIDC)** — Authentication provider (uses `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET` environment variables)

### External APIs (Search)
- **OpenLibrary API** — Search for books
- **DOAJ (Directory of Open Access Journals)** — Search for academic articles

### Key Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Secret for express-session (required)
- `REPL_ID` — Replit environment identifier (set automatically on Replit)
- `ISSUER_URL` — OIDC issuer URL (defaults to `https://replit.com/oidc`)

### NPM Package Highlights
- `drizzle-orm` + `drizzle-kit` — ORM and migration tooling
- `express` + `express-session` + `passport` — Server framework and auth
- `connect-pg-simple` — PostgreSQL session store
- `@tanstack/react-query` — Client data fetching
- `recharts` — Charts/graphs
- `framer-motion` — Animations
- `zod` — Schema validation (shared between client and server)
- `wouter` — Client-side routing
- `lucide-react` — Icon library