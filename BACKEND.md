# Bentley Showcase Backend

This repository now includes a Cloudflare Workers Python/FastAPI backend for the Bentley Showcase enterprise SaaS control plane.

## Runtime

- Cloudflare Workers Python
- FastAPI + Pydantic
- Cloudflare D1 for relational persistence
- Cloudflare KV for session/cache storage
- Cloudflare Queues for async job dispatch
- Wrangler deployment via `wrangler.toml`

The existing Vercel React frontend remains the frontend host and should not be removed or replaced.

## Core files

- `wrangler.toml` — Worker entrypoint and Cloudflare bindings.
- `src/entry.py` — FastAPI backend implementation.
- `schema.sql` — D1 schema and indexes.
- `client/src/lib/api.ts` — optional frontend API client.
- `.env.example` — environment variable examples.
- `scripts/cloudflare_finalize.py` — optional Cloudflare API finalization script.

## Public routes

- `GET /`
- `GET /health`
- `GET /status`

## Auth routes

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Authentication uses email/password, PBKDF2 password hashing, D1 session rows, and optional KV session cache entries. Clients can authenticate using the `Authorization: Bearer <token>` header or the `bentley_session` cookie.

## SaaS routes

- Organizations: `GET/POST /orgs`, `GET/PATCH/DELETE /orgs/{org_id}`
- Projects: `GET/POST /projects`, `GET/PATCH/DELETE /projects/{project_id}`
- Members: `GET/POST /projects/{project_id}/members`, `PATCH/DELETE /projects/{project_id}/members/{member_id}`
- Production services: `GET/POST /projects/{project_id}/production-services`, `PATCH/DELETE /projects/{project_id}/production-services/{service_id}`
- Production service actions: `POST /projects/{project_id}/production-services/{service_id}/actions`
- Tools: `GET/POST /projects/{project_id}/tools`, `PATCH/DELETE /projects/{project_id}/tools/{tool_id}`, `POST /projects/{project_id}/tools/{tool_id}/run`
- Marketing campaigns: `GET/POST /projects/{project_id}/marketing/campaigns`, `PATCH /projects/{project_id}/marketing/campaigns/{campaign_id}`, `POST /projects/{project_id}/marketing/campaigns/{campaign_id}/publish`
- Automations: `GET/POST /projects/{project_id}/automations`, `PATCH /projects/{project_id}/automations/{automation_id}`, `POST /projects/{project_id}/automations/{automation_id}/run`, `POST /webhooks/inbound`
- Jobs: `GET/POST /projects/{project_id}/jobs`, `PATCH /projects/{project_id}/jobs/{job_id}`, `POST /projects/{project_id}/jobs/{job_id}/retry`
- Integrations: `GET/POST /projects/{project_id}/integrations`, `PATCH/DELETE /projects/{project_id}/integrations/{integration_id}`
- Activity: `GET/POST /projects/{project_id}/activity`
- Audit: `GET /audit`
- Dashboard bootstrap: `GET /bootstrap`
- Seed workspace: `POST /seed/initial-workspace`

## RBAC

Supported roles:

- `owner`
- `admin`
- `developer`
- `operator`
- `marketing_manager`
- `viewer`
- `auditor`

Protected project and organization routes enforce role checks before reading or mutating data.

## Seed workspace

After D1/KV bindings and secrets are live, seed the initial workspace with:

```bash
curl -X POST "$WORKER_URL/seed/initial-workspace" \
  -H "X-Seed-Secret: $SEED_SECRET"
```

This creates the GEM Cybersecurity organization, Bentley Showcase project, owner user, default tools, default production services, default integrations, and default automation records.

## Frontend communication

Set the frontend environment variable in Vercel:

```bash
VITE_API_BASE_URL=https://bentley-webpage.<workers-subdomain>.workers.dev
```

The optional `client/src/lib/api.ts` file calls `/bootstrap`, `/projects`, `/projects/{project_id}/tools`, `/projects/{project_id}/production-services`, and `/projects/{project_id}/activity` without replacing existing screens.
