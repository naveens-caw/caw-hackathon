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