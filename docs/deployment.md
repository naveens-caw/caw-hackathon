# Deployment Runbook (Vercel + Render + Neon)

## Goal

Deploy `apps/web` and `apps/api` with isolated `staging` and `production` environments. Both environments must expose:

- Web app URL (`WEB_URL`)
- API URL (`API_URL`)
- API health endpoint: `GET /health`
- API version endpoint: `GET /api/version`

## One-time setup (production-first)

For fastest launch, complete production first, then add staging.

1. Create Neon project and production database/branch:

- `production`

Optional later:

- `staging`

2. Create Render API production service and capture deploy hook:

- production deploy hook URL

Optional later:

- staging deploy hook URL

3. Create Vercel production project for `apps/web`:

- production web project

Optional later:

- staging web project

4. In each Vercel project, set `VITE_API_URL` to the matching API URL.
5. Create Clerk application and copy keys for both environments:

- `CLERK_SECRET_KEY` (API private key)
- `CLERK_PUBLISHABLE_KEY` (API-side reference key)
- `VITE_CLERK_PUBLISHABLE_KEY` (web public key)

5. In GitHub repository settings, create environments:

- `staging`
- `production`

## GitHub environment secrets

Set these secrets in `production` first. Add `staging` values later when enabling staging:

- `WEB_URL`: public URL of deployed web app
- `API_URL`: public URL of deployed API
- `RENDER_DEPLOY_HOOK_URL`: Render deploy hook for matching env
- `VERCEL_TOKEN`: Vercel token with deploy permissions
- `VERCEL_ORG_ID`: Vercel org ID
- `VERCEL_PROJECT_ID`: Vercel project ID (staging/prod project per environment)
- `CLERK_SECRET_KEY`: Clerk backend secret for API auth verification
- `CLERK_PUBLISHABLE_KEY`: Clerk publishable key for API config parity
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk publishable key for web runtime

## Render env vars

Set these on Render production service:

- `NODE_ENV=production`
- `APP_ENV=production`
- `APP_VERSION` (optional default; workflow/commit can override later)
- `DATABASE_URL` (Neon staging/prod URL)
- `WEB_ORIGIN` (web app origin for CORS, for example `https://app.example.com`)
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`

Render provides `PORT` automatically. API bootstrap supports this for runtime binding.

## Branch and workflow behavior

- `develop` -> `Deploy Production` (after `CI` succeeds + production environment protection rules)
- `staging` -> `Deploy Staging` (optional follow-up when staging is enabled)

CI checks live in `.github/workflows/ci.yml` and must pass before deploy workflows run.

## Smoke checks (automatic in deploy workflows)

Each deploy workflow validates:

1. `WEB_URL` responds with HTTP 200.
2. `API_URL/health` responds with HTTP 200 and `{ "ok": true }`.
3. `API_URL/api/version` returns JSON containing `version` and `env`.

If any smoke check fails, deployment workflow fails.

## Rollback

1. Web rollback:

- In Vercel dashboard, promote previous successful deployment for the affected environment.

2. API rollback:

- In Render dashboard, redeploy the last known healthy build.

3. Re-run smoke checks:

- `GET {API_URL}/health`
- `GET {API_URL}/api/version`
- `GET {WEB_URL}`

4. If root cause is configuration, fix environment secrets and redeploy.

## DNS notes

- Point staging domain (for example `staging.<domain>`) to staging Vercel project.
- Point production domain (for example `app.<domain>`) to production Vercel project.
- Point API domains similarly to matching Render services.
- Never share staging/prod DB URLs or deploy hooks across environments.

## Launch checklist

Use this file while filling real values from dashboards:

- `docs/production-launch-checklist.md`
