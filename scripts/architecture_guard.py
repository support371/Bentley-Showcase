#!/usr/bin/env python3
"""Static production-readiness guard for Bentley Showcase.

The guard intentionally avoids network calls and secret lookups so it can run in
CI, local dev, and Vercel build environments. It validates the dual-runtime
contract: Vite/React frontend on Vercel plus Python/FastAPI backend on
Cloudflare Workers.
"""
from __future__ import annotations

from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
warnings: list[str] = []


def fail(message: str) -> None:
    errors.append(message)


def warn(message: str) -> None:
    warnings.append(message)


def require_file(path: str) -> None:
    if not (ROOT / path).is_file():
        fail(f"required file missing: {path}")


def require_dir(path: str) -> None:
    if not (ROOT / path).is_dir():
        fail(f"required directory missing: {path}")


def read(path: str) -> str:
    p = ROOT / path
    return p.read_text(encoding="utf-8", errors="ignore") if p.exists() else ""


def load_json(path: str) -> dict:
    text = read(path)
    if not text:
        return {}
    try:
        value = json.loads(text)
        return value if isinstance(value, dict) else {}
    except Exception as exc:
        fail(f"{path} is not valid JSON: {exc}")
        return {}


# Required dual-runtime contract.
for path in [
    "package.json",
    "vite.config.ts",
    "vercel.json",
    "wrangler.toml",
    "src/entry.py",
    "schema.sql",
    "BACKEND.md",
    "CLOUDFLARE_DEPLOY.md",
    ".env.example",
]:
    require_file(path)
require_dir("client")
require_dir("scripts")

# Cloudflare Python Worker contract.
wrangler = read("wrangler.toml")
if "main = \"src/entry.py\"" not in wrangler:
    fail("wrangler.toml must point main to src/entry.py")
if "python_workers" not in wrangler:
    fail("wrangler.toml must include python_workers compatibility flag")
if "[[d1_databases]]" not in wrangler:
    fail("wrangler.toml must define a D1 database binding")
if "[[kv_namespaces]]" not in wrangler:
    fail("wrangler.toml must define a KV namespace binding")
if "queues.producers" not in wrangler:
    fail("wrangler.toml must define a Queue producer binding")
if "REPLACE_WITH_D1_DATABASE_ID" in wrangler or "REPLACE_WITH_KV_NAMESPACE_ID" in wrangler:
    warn("wrangler.toml still contains Cloudflare placeholder IDs; run scripts/cloudflare_finalize.py or replace them before production deploy")

entry = read("src/entry.py")
for token in ["WorkerEntrypoint", "FastAPI", "asgi.fetch", "@app.get(\"/health\")", "@app.get(\"/status\")", "@app.post(\"/seed/initial-workspace\")"]:
    if token not in entry:
        fail(f"src/entry.py missing backend contract token: {token}")
for token in ["pbkdf2_hmac", "token_hash", "audit_logs", "organization_members", "project_members"]:
    if token not in entry:
        fail(f"src/entry.py missing security/RBAC token: {token}")

# Frontend/Vercel contract.
package = load_json("package.json")
package_text = read("package.json")
scripts = package.get("scripts", {}) if isinstance(package, dict) else {}
for script_name in ["build", "dev", "verify"]:
    if script_name not in scripts:
        fail(f"package.json must include a {script_name!r} script")
if "vite" not in package_text:
    fail("package.json must preserve Vite frontend runtime")
if "react" not in package_text:
    fail("package.json must preserve React frontend runtime")

vite = read("vite.config.ts")
for token in ["root:", "client", "dist", "public"]:
    if token not in vite:
        fail(f"vite.config.ts missing expected frontend build token: {token}")

vercel = read("vercel.json")
for token in ["dist/public", "vite", "rewrites", "X-Content-Type-Options"]:
    if token not in vercel:
        fail(f"vercel.json missing expected deployment token: {token}")

api_client = read("client/src/lib/api.ts")
for token in ["VITE_API_BASE_URL", "/auth/login", "/bootstrap", "/projects", "credentials: 'include'"]:
    if token not in api_client:
        fail(f"client/src/lib/api.ts missing API client token: {token}")

# Backend schema contract.
schema = read("schema.sql").lower()
required_tables = [
    "users",
    "sessions",
    "organizations",
    "organization_members",
    "projects",
    "project_members",
    "production_services",
    "project_tools",
    "marketing_campaigns",
    "automations",
    "jobs",
    "integrations",
    "activity_logs",
    "audit_logs",
]
for table in required_tables:
    if f"create table if not exists {table}" not in schema:
        fail(f"schema.sql missing table: {table}")

# Lockfile hygiene. A lockfile is allowed, but stale root metadata should be fixed.
lock = load_json("package-lock.json") if (ROOT / "package-lock.json").exists() else {}
if lock:
    root_pkg = (lock.get("packages") or {}).get("") or {}
    for field in ["name", "version"]:
        if root_pkg.get(field) != package.get(field):
            warn(f"package-lock.json root {field}={root_pkg.get(field)!r} does not match package.json {field}={package.get(field)!r}; regenerate lockfile or remove it")

# Secret hygiene.
for forbidden in [".env", ".env.local", ".env.production", "id_rsa", "id_dsa"]:
    if (ROOT / forbidden).exists():
        fail(f"secret-like file must not be committed: {forbidden}")

secret_patterns = [
    re.compile(r"CLOUDFLARE_API_TOKEN\s*=\s*['\"]?[A-Za-z0-9_\-]{20,}"),
    re.compile(r"API_KEY\s*=\s*['\"]?[A-Za-z0-9_\-]{20,}"),
    re.compile(r"SECRET\s*=\s*['\"]?[A-Za-z0-9_\-]{20,}"),
    re.compile(r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"),
]

scan_extensions = {".js", ".ts", ".tsx", ".py", ".toml", ".md", ".json", ".yml", ".yaml", ".sql"}
for path in ROOT.rglob("*"):
    if not path.is_file():
        continue
    if ".git" in path.parts or "node_modules" in path.parts or "dist" in path.parts:
        continue
    if path.suffix not in scan_extensions and path.name not in {"wrangler.toml", "package.json", "package-lock.json"}:
        continue
    content = path.read_text(encoding="utf-8", errors="ignore")
    if path.name == ".env.example":
    if path.suffix not in scan_extensions and path.name not in {"wrangler.toml", "package.json"}:
        continue
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        continue
    for pattern in secret_patterns:
        if pattern.search(content):
            fail(f"possible secret found in {path.relative_to(ROOT)}")

for warning in warnings:
    print(f"WARN: {warning}")

if errors:
    print("Architecture guard failed:")
    for error in errors:
        print(f" - {error}")
    sys.exit(1)

print("Architecture guard passed: frontend, backend, schema, deployment, and secret-hygiene contracts are intact.")
