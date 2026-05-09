#!/usr/bin/env python3
"""Local production-readiness checklist for Bentley Showcase."""
from __future__ import annotations

from pathlib import Path
import json
import os
import sys

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

checks = []


def add(name: str, ok: bool, detail: str = "") -> None:
    checks.append((name, ok, detail))


def read(path: str) -> str:
    p = ROOT / path
    return p.read_text(encoding="utf-8", errors="ignore") if p.exists() else ""


for file in required_files:
    add(f"file:{file}", (ROOT / file).is_file(), "present" if (ROOT / file).is_file() else "missing")

wrangler = read("wrangler.toml")
add("wrangler:python_workers", "python_workers" in wrangler, "python runtime enabled")
add("wrangler:d1", "[[d1_databases]]" in wrangler, "D1 binding configured")
add("wrangler:kv", "[[kv_namespaces]]" in wrangler, "KV binding configured")
add("wrangler:queue", "JOB_QUEUE" in wrangler, "Queue producer configured")

entry = read("src/entry.py")
for route in ["/health", "/status", "/auth/login", "/bootstrap"]:
    add(f"route:{route}", route in entry, "implemented")

pkg = json.loads(read("package.json")) if read("package.json") else {}
for script in ["verify", "validate:backend", "readiness"]:
    add(f"npm:{script}", script in (pkg.get("scripts") or {}), "available")

required_env = [
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "SEED_SECRET",
]

for name in required_env:
    add(f"env:{name}", bool(os.getenv(name)), "set" if os.getenv(name) else "missing")

passed = sum(1 for _, ok, _ in checks if ok)

for name, ok, detail in checks:
    print(f"{'PASS' if ok else 'WARN'}: {name} - {detail}")

print(f"\nProduction readiness: {passed}/{len(checks)} checks passed")

if passed < len(checks):
    sys.exit(1)
