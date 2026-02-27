# Production Launch Checklist (Vercel + Render + Neon)

Use this file to capture your real deployment values and finish launch in one pass.

## 1) Fill Actual URLs and IDs

- [ ] `PROD_WEB_URL`: `https://________________.vercel.app`
- [ ] `PROD_API_URL`: `https://________________.onrender.com`
- [ ] `NEON_PROD_DATABASE_URL`: `postgres://...sslmode=require`
- [ ] `VERCEL_ORG_ID`: `________________`
- [ ] `VERCEL_PROJECT_ID`: `________________`
- [ ] `RENDER_DEPLOY_HOOK_URL`: `https://api.render.com/deploy/...`

## 2) Neon (Production DB)

- [ ] Create Neon branch/database for production.
- [ ] Copy connection string with SSL enabled.
- [ ] Save it for Render `DATABASE_URL`.

## 3) Render (Production API)

- [ ] Create Render web service from this repo.
- [ ] Confirm build/start from monorepo root works.
- [ ] Set env vars:
  - [ ] `NODE_ENV=production`
  - [ ] `APP_ENV=production`
  - [ ] `DATABASE_URL=<NEON_PROD_DATABASE_URL>`
  - [ ] `APP_VERSION` (optional)
- [ ] Confirm API opens:
  - [ ] `GET /health`
  - [ ] `GET /api/version`
- [ ] Generate deploy hook URL.

## 4) Vercel (Production Web)

- [ ] Create Vercel project with root at `apps/web`.
- [ ] Set env var:
  - [ ] `VITE_API_URL=<PROD_API_URL>`
- [ ] Trigger deploy and confirm web URL loads.

## 5) GitHub Environment Secrets (`production`)

Go to repo settings -> Environments -> `production` -> Secrets, then set:

- [ ] `WEB_URL=<PROD_WEB_URL>`
- [ ] `API_URL=<PROD_API_URL>`
- [ ] `RENDER_DEPLOY_HOOK_URL=<RENDER_DEPLOY_HOOK_URL>`
- [ ] `VERCEL_TOKEN=<token>`
- [ ] `VERCEL_ORG_ID=<VERCEL_ORG_ID>`
- [ ] `VERCEL_PROJECT_ID=<VERCEL_PROJECT_ID>`

## 6) Release and Verify

- [ ] Merge/push deployment code to `main`.
- [ ] Confirm `CI` workflow succeeds.
- [ ] Confirm `Deploy Production` workflow succeeds.
- [ ] Confirm smoke checks pass in workflow:
  - [ ] web URL responds
  - [ ] `/health` returns `{ "ok": true }`
  - [ ] `/api/version` includes `version` and `env=production`

## 7) Public Validation

- [ ] Open web URL in incognito.
- [ ] Confirm app shows API version/environment.
- [ ] Share web URL publicly.
