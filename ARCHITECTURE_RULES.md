# Bentley Showcase Architecture Rules

## Core Principle

Bentley Showcase is a dual-runtime SaaS control platform.

- Vercel owns the React SaaS frontend.
- Cloudflare Workers own the Python/FastAPI edge backend.
- GitHub is the shared source of truth.
- Changes must be additive unless explicitly approved.

## Non-Negotiable Rules

### 1. Preserve the Vercel frontend
Do not remove or replace the React/Vite frontend.

Protected paths:
- `client/`
- `package.json`
- `vite.config.ts`
- `vercel.json`

Allowed changes:
- additive UI modules
- API client additions
- bug fixes that do not change the deployment model

### 2. Preserve the Cloudflare backend
Do not remove or rename the Cloudflare Worker entry files.

Required files:
- `wrangler.toml`
- `src/entry.py`
- `schema.sql`

Cloudflare owns:
- FastAPI Worker API
- D1 schema
- KV/session bindings
- Queue/job bindings

### 3. No secret commits
Never commit API tokens, passwords, private keys, `.env`, or production credentials.

Allowed:
- `.env.example`
- placeholder values
- documentation for environment setup

### 4. No single-runtime takeover
Do not convert the repo into only Vercel or only Cloudflare.

This repo must remain dual-runtime unless explicitly approved.

### 5. Every backend mutation must be auditable
Any backend route that creates, updates, deletes, dispatches, queues, or executes work must write or route toward an audit/activity log.

### 6. Every project asset must be project-scoped
Operational entities must include or support `project_id`:

- tools
- services
- deployments
- jobs
- activity logs
- integrations
- automations
- marketing assets
- digital-twin assets

### 7. Frontend presents, backend executes
Frontend may call APIs but must not own production execution logic.

Examples:
- frontend can show a deploy button
- backend must process deploy intent
- frontend can show marketing tools
- backend must queue publish/run operations

### 8. CI must block architectural drift
The CI guard must fail if:
- required runtime files are missing
- frontend contract is missing
- Cloudflare contract is missing
- secret-like files are committed
- stale lockfiles or conflicting runtime files are introduced
- Vercel/Cloudflare split is broken

## Current Target Runtime

### Vercel
- React/Vite frontend
- Production URL: `https://bentley-showcase.vercel.app`

### Cloudflare
- Worker name: `bentley-webpage`
- Worker entry: `src/entry.py`
- Worker config: `wrangler.toml`
- D1 schema: `schema.sql`

## Change Review Checklist

Every PR/change must answer:

1. Does this preserve the frontend runtime?
2. Does this preserve the Cloudflare backend runtime?
3. Does this avoid secrets?
4. Does this preserve project-scoped operations?
5. Does this keep the platform operator-ready?
6. Does this pass architecture guard CI?
