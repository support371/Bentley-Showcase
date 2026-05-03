#!/usr/bin/env python3
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []
warnings = []


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
    return p.read_text(encoding="utf-8") if p.exists() else ""


# Required dual-runtime contract.
require_file("package.json")
require_file("vite.config.ts")
require_file("vercel.json")
require_dir("client")
require_file("wrangler.toml")
require_file("src/entry.py")
require_file("schema.sql")

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

entry = read("src/entry.py")
for token in ["WorkerEntrypoint", "FastAPI", "asgi.fetch"]:
    if token not in entry:
        fail(f"src/entry.py missing Cloudflare FastAPI token: {token}")

# Frontend contract.
package_text = read("package.json")
try:
    package = json.loads(package_text)
except Exception as exc:
    fail(f"package.json is not valid JSON: {exc}")
    package = {}

scripts = package.get("scripts", {}) if isinstance(package, dict) else {}
if "build" not in scripts:
    fail("package.json must include a build script for Vercel")
if "vite" not in package_text:
    fail("package.json must preserve Vite frontend runtime")
if "react" not in package_text:
    fail("package.json must preserve React frontend runtime")

vercel = read("vercel.json")
if "dist" not in vercel:
    fail("vercel.json must preserve a dist output directory")
if "npm install --package-lock=false" not in vercel:
    warn("vercel.json should keep npm install --package-lock=false while package-lock.json is absent")

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
    if table not in schema:
        fail(f"schema.sql missing table or reference: {table}")

# Forbidden files and secret hygiene.
for forbidden in ["package-lock.json", "requirements.txt"]:
    if (ROOT / forbidden).exists():
        fail(f"forbidden root file present: {forbidden}")

secret_file_patterns = [".env", ".env.local", ".env.production", "id_rsa", "id_dsa"]
for pattern in secret_file_patterns:
    if (ROOT / pattern).exists():
        fail(f"secret-like file must not be committed: {pattern}")

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
    if path.suffix not in scan_extensions and path.name not in {"wrangler.toml", "package.json"}:
        continue
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        continue
    for pattern in secret_patterns:
        if pattern.search(content):
            fail(f"possible secret found in {path.relative_to(ROOT)}")

# Output.
for warning in warnings:
    print(f"WARN: {warning}")

if errors:
    print("Architecture guard failed:")
    for error in errors:
        print(f" - {error}")
    sys.exit(1)

print("Architecture guard passed: dual-runtime contract is intact.")
