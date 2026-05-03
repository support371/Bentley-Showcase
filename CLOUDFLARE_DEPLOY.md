# Cloudflare Deployment Guide

This guide finalizes the Bentley Showcase backend on Cloudflare.

## Required resources

Create the following resources in account `5918df72bfd0d0389a1894adec5db58f`:

- D1 database: `bentley_webpage_db`
- KV namespace: `bentley-sessions`
- Queue: `bentley-jobs`
- Worker script: `bentley-webpage`

## 1. Create D1 database

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/d1/database" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"bentley_webpage_db"}'
```

Save the returned D1 database ID.

## 2. Create KV namespace

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/storage/kv/namespaces" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"title":"bentley-sessions"}'
```

Save the returned namespace ID.

## 3. Create Queue

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/queues" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"bentley-jobs"}'
```

## 4. Apply D1 schema

Use `schema.sql`:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/d1/database/$D1_DATABASE_ID/query" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @<(jq -Rs '{sql:.}' schema.sql)
```

## 5. Deploy Worker

The repo contains `wrangler.toml` with placeholders. Replace the D1 and KV IDs, then deploy:

```bash
wrangler deploy
```

Alternatively, use the included script:

```bash
python scripts/cloudflare_finalize.py
```

## 6. Set secrets

Set the following as Worker secrets or vars:

```bash
wrangler secret put PASSWORD_SALT
wrangler secret put SEED_SECRET
wrangler secret put SEED_OWNER_PASSWORD
wrangler secret put SEED_OWNER_EMAIL
wrangler secret put CORS_ORIGINS
wrangler secret put BACKEND_VERSION
```

Recommended values:

- `BACKEND_VERSION=1.0.0`
- `CORS_ORIGINS=https://bentley-showcase.vercel.app,http://localhost:3000,http://localhost:5173`
- `SEED_OWNER_EMAIL=<owner email>`
- `PASSWORD_SALT`, `SEED_SECRET`, and `SEED_OWNER_PASSWORD` should be strong secrets.

## 7. Verify

```bash
curl "$WORKER_URL/"
curl "$WORKER_URL/health"
curl "$WORKER_URL/status"
```

The health response should show D1, KV, and queue bindings as available/configured.

## 8. Seed workspace

```bash
curl -X POST "$WORKER_URL/seed/initial-workspace" \
  -H "X-Seed-Secret: $SEED_SECRET"
```

## 9. Connect Vercel frontend

In Vercel, set:

```bash
VITE_API_BASE_URL=$WORKER_URL
```

Do not change or remove the existing Vercel deployment at `https://bentley-showcase.vercel.app`.
