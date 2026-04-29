# Bentley Showcase Deployment

## Runtime Model
- Vercel: Frontend application
- Cloudflare Workers: Python FastAPI edge API

## Vercel
1. Import support371/Bentley-Showcase
2. Framework preset: Vite
3. Build command: npm run build
4. Output directory: dist

## Cloudflare
1. Ensure Wrangler authenticated
2. Run: wrangler deploy
3. Uses wrangler.toml and src/entry.py

## Health Checks
- Worker: /health
- Root: /

## CI
GitHub Actions verifies build integrity on each push.
