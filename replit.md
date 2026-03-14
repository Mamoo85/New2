# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (Replit Auth OIDC + Stripe)
│   └── mobile/             # Expo React Native app (M² Training)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection (users, sessions tables)
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/mobile` (`@workspace/mobile`)

Full-featured **M² Training** mobile app built with Expo React Native and Expo Router.

**Features:**
- Public home screen: split nav (Client Portal + Trainer), hero with credibility copy, "By the numbers" stats row (20+ years, 50+ college athletes, thousands trained, zero injuries), "Already a client?" portal card, quote banner, Team & Youth Programs card with "I Can Do That" CTA, Words from Matt, Monthly Focus, active challenges leaderboard, Matt's Never Wrong CTA, footer quotes
- Client auth: username/password login, signup with goal setting
- Trainer auth: password-protected dashboard (`coach123`)
- Client area (tab navigation):
  - Progress screen: lift PRs, chart per lift (SVG), session log
  - Schedule screen: 3-step booking flow, session types, history
  - Challenges screen: log progress, leaderboard modal, opt-in toggle
  - Programs screen: request custom programs, view delivered programs with exercise details in a modal viewer
  - Messages screen: send categorized messages to Matt, see replies
- Trainer dashboard (tab navigation):
  - Clients tab: search clients, view detail, log lifts, chart, trainer note, reply to messages, view assessments, build/edit/deliver custom programs
  - Bookings tab: manage bookings, set status, manage availability slots
  - Challenges tab: create/edit/delete challenges, toggle active, view leaderboard
  - Settings tab: edit home content, toggle session types, manage Matt's Never Wrong help requests
- Teams screen: Team & Youth Programs pitch page with flexible delivery options, credibility copy, "Get in touch" CTA
- Help screen: Matt's Never Wrong - anyone can submit, pay-what-you-feel
- Store screen: Workouts on the Road digital pack ($20, 10 workouts), Stripe Payment Link checkout, workout preview list, Matt's guarantee card
- Group Classes screen: interest signups for Weekend Rolling Classes, Youth 14-16, Youth 17-18; athlete info fields for youth programs; data saved to AppData.groupClassInterests
- Trainer dashboard: 3 tabs (Clients / Mailing List / Class Sign-ups); Mailing List deduplicates all emails, "Quick Email" opens mailto with BCC; Class Sign-ups shows all group interest entries grouped by program
- Easter egg: animated trippy screen (pyramid + stars + grid) accessible via "DO NOT CLICK THIS!" button in footer

**Tech:**
- State: AsyncStorage via `utils/storage.ts` + `context/AppContext.tsx`
- Navigation: Stack + nested Tabs (Expo Router), liquid glass on iOS 26+
- Charts: react-native-svg (hand-drawn, no library)
- Icons: @expo/vector-icons (Feather, Ionicons, SymbolView)
- Theme: dark (#111110 bg, #e8621a orange, #4caf7d green)

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health`; `src/routes/checkout.ts` exposes `POST /api/checkout/road-workouts`
- Stripe: `src/stripeClient.ts` — thin wrapper for direct Stripe REST API calls using `STRIPE_SECRET_KEY` env var; falls back gracefully to the payment link URL if key is absent
- Stripe products: `prod_U959ypqspVNVlW` (Workouts on the Road, $20, `price_1TAmz1ExKk6XaaWgWpTBxlIs`)
- Stripe Payment Link: `https://buy.stripe.com/test_cNi3cvggre7Y2ISe0ffbq00` (TEST MODE — switch to live when going to production)
- Depends on: `@workspace/db`, `@workspace/api-zod`, `@replit/connectors-sdk`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
