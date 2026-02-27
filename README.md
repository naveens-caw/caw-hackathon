# CAW Hackathon Monorepo

## Quick start

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:migrate
pnpm dev
```

## Workspace layout

- `apps/web`: React + Vite frontend
- `apps/api`: NestJS backend
- `apps/e2e`: Playwright tests
- `packages/shared`: shared schemas/types
- `packages/db`: Drizzle schema/client/migrations
- `tooling/eslint-config`: shared ESLint config
- `tooling/tsconfig`: shared TS configs

## Scripts

- `pnpm dev`: run all app dev servers
- `pnpm lint`: run lint in all workspaces
- `pnpm typecheck`: strict type checks
- `pnpm test`: unit tests
- `pnpm test:e2e`: Playwright e2e
- `pnpm db:generate`: generate drizzle migrations
- `pnpm db:migrate`: apply drizzle migrations

## Deployment

This repo ships with staging + production deployment workflows:

- `.github/workflows/deploy-staging.yml` (auto from `develop` after CI passes)
- `.github/workflows/deploy-production.yml` (from `main` after CI passes + environment protection)

Required platform setup:

- Web: Vercel (`apps/web/vercel.json`)
- API: Render (`apps/api/render.yaml`)
- Database: Neon (separate staging/prod URLs)

Environment URLs (replace placeholders once provisioned):

- Staging web: `https://staging.example.com`
- Staging api: `https://staging-api.example.com`
- Production web: `https://app.example.com`
- Production api: `https://api.example.com`

Health and smoke endpoints:

- `GET /health` -> `{ "ok": true }`
- `GET /api/version` -> `{ version, env }`

Runbook and setup details:

- `docs/deployment.md`
