# SOLVY – Plateforme d'aide à la décision bancaire

Application web bancaire premium simulant un logiciel de scoring de solvabilité client pour conseillers et analystes risque.

## Run & Operate

- `pnpm --filter @workspace/solvy run dev` — run the SOLVY frontend (Vite, reads PORT)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter (routing), Recharts (charts), Tailwind CSS, shadcn/ui
- No real backend — all data is fictional and hardcoded in `src/data/mockData.ts`
- API: Express 5 (shared api-server, currently only /healthz)
- DB: PostgreSQL + Drizzle ORM (not used in this mockup)

## Where things live

- `artifacts/solvy/src/data/mockData.ts` — all fictional data (clients, dossiers, audit logs)
- `artifacts/solvy/src/pages/` — all 8 pages (Login, Dashboard, NouveauDossier, DossierDetail, Score, Analyste, Audit, Admin)
- `artifacts/solvy/src/components/Layout.tsx` — sidebar + page header shared by all pages
- `artifacts/solvy/src/App.tsx` — router with auth state
- `artifacts/solvy/src/index.css` — dark-only theme variables (gold/black/champagne palette)

## Architecture decisions

- Frontend-only mockup: no real DB or API calls — all data in mockData.ts for demo/presentation
- Dark mode enforced globally via `document.documentElement.classList.add("dark")` in App.tsx
- Auth state held in React state (not persisted) — login page with 3 quick-access role profiles
- SVG semicircle gauge built from scratch (no canvas, no library) using arc paths and stroke-dasharray
- Wouter router with base URL from Vite's `import.meta.env.BASE_URL`

## Product

SOLVY is a fictional banking decision-support platform with 8 navigable screens:
1. **Login** — premium login with 3 role profiles (Conseiller, Analyste, Admin)
2. **Dashboard** — KPI cards, filterable dossier table, monthly activity chart
3. **Nouveau dossier** — 5-step multi-page form with document status tracking
4. **Fiche dossier** — consolidated client file with all financial and regulatory data
5. **Score** — SVG semicircle gauge, per-criterion breakdown, recommendation banner
6. **Analyste** — risk analyst dashboard with 3-panel layout and decision validation
7. **Audit** — full audit trail with status filtering and RGPD compliance notices
8. **Administration** — user management, scoring thresholds, system logs

## User preferences

- French-language UI throughout
- Dark mode only (near-black background, gold accents #c9a84c)
- No real data — fictional data only, suitable for university presentation
- Score presented as decision-support tool with mandatory human validation disclaimer

## Gotchas

- The app is frontend-only: no API calls are made, everything is mocked in mockData.ts
- Do NOT run `pnpm dev` at workspace root — use workflow or `--filter`
- To add more dossiers, edit `artifacts/solvy/src/data/mockData.ts`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
