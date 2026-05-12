#!/usr/bin/env python3
"""Local production-readiness checklist for Bentley Showcase.

This script checks the static repo state plus optional live environment inputs.
It intentionally does not print secret values.
"""
from __future__ import annotations

from pathlib import Path
import json
import os
import re
import sys
from urllib import request, error

ROOT = Path(__file__).resolve().parents[1]
required_files = [
    "package.json",
    "vite.config.ts",
    "vercel.json",
    "wrangler.toml",
    "src/entry.py",
    "schema.sql",
    "BACKEND.md",
    "BACKEND_DEPLOYMENT.md",
    ".env.example",
    "client/src/lib/api.ts",
]

required_env = [
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "SEED_SECRET",
    "SEED_OWNER_EMAIL",
    "SEED_OWNER_PASSWORD",
    "PASSWORD_SALT",
    "WORKER_URL",
]

checks: list[tuple[str, bool, str]] = []


def add(name: str, ok: bool, detail: str = "") -> None:
    checks.append((name, ok, detail))


def read(path: str) -> str:
    p = ROOT / path
    return p.read_text(encoding="utf-8", errors="ignore") if p.exists() else ""


for file in required_files:
    add(f"file:{file}", (ROOT / file).is_file(), "present" if (ROOT / file).is_file() else "missing")

wrangler = read("wrangler.toml")
add("wrangler:d1 binding", "[[d1_databases]]" in wrangler and "binding = \"DB\"" in wrangler, "DB binding configured")
add("wrangler:kv binding", "[[kv_namespaces]]" in wrangler and "binding = \"SESSIONS\"" in wrangler, "SESSIONS binding configured")
add("wrangler:queue producer", "queues.producers" in wrangler and "JOB_QUEUE" in wrangler, "JOB_QUEUE binding configured")
add("wrangler:no placeholder ids", "REPLACE_WITH_" not in wrangler, "replace Cloudflare IDs before direct wrangler deploy")

schema = read("schema.sql").lower()
for table in ["users", "sessions", "organizations", "projects", "production_services", "project_tools", "jobs", "audit_logs"]:
    add(f"schema:{table}", f"create table if not exists {table}" in schema, "table exists")

entry = read("src/entry.py")
for route in ["/health", "/status", "/auth/login", "/bootstrap", "/seed/initial-workspace"]:
    add(f"backend route:{route}", route in entry, "route present")

try:
    pkg = json.loads(read("package.json"))
except Exception:
    pkg = {}
for script in ["dev", "build", "verify"]:
    add(f"npm script:{script}", script in (pkg.get("scripts") or {}), "script exists")

for name in required_env:
    value = os.getenv(name)
    add(f"env:{name}", bool(value), "set" if value else "missing")

worker_url = os.getenv("WORKER_URL", "").rstrip("/")
if worker_url:
    for path in ["/", "/health", "/status"]:
        url = worker_url + path
        try:
            with request.urlopen(url, timeout=15) as resp:
                body = resp.read().decode("utf-8", errors="replace")[:500]
                add(f"live:{path}", 200 <= resp.status < 300, f"HTTP {resp.status} {body}")
        except error.HTTPError as exc:
            add(f"live:{path}", False, f"HTTP {exc.code}")
        except Exception as exc:
            add(f"live:{path}", False, str(exc))
else:
    add("live checks", False, "WORKER_URL not set")

passed = sum(1 for _, ok, _ in checks if ok)
failed = len(checks) - passed
for name, ok, detail in checks:
    icon = "PASS" if ok else "WARN"
    print(f"{icon}: {name} - {detail}")

print(f"\nProduction readiness: {passed}/{len(checks)} checks passed")
if failed:
    print("Some checks require live Cloudflare/Vercel settings that cannot be committed to the repo.")
    sys.exit(1)
