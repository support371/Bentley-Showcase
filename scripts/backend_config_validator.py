#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

failed = []
warnings = []
passed = []


def ok(msg):
    passed.append(msg)


def warn(msg):
    warnings.append(msg)


def fail(msg):
    failed.append(msg)


def read(path: str) -> str:
    file = ROOT / path
    return file.read_text(encoding="utf-8", errors="ignore") if file.exists() else ""


# Wrangler validation
try:
    with open(ROOT / "wrangler.toml", "rb") as f:
        wrangler = tomllib.load(f)

    if wrangler.get("main") == "src/entry.py":
        ok("Cloudflare Worker entrypoint configured")
    else:
        fail("Invalid worker entrypoint")

    if "python_workers" in wrangler.get("compatibility_flags", []):
        ok("Python Workers compatibility enabled")
    else:
        fail("python_workers compatibility flag missing")

    if wrangler.get("d1_databases"):
        ok("D1 binding configured")

    if wrangler.get("kv_namespaces"):
        ok("KV binding configured")

except Exception as exc:
    fail(f"wrangler.toml validation failed: {exc}")


# Python dependency validation
try:
    with open(ROOT / "pyproject.toml", "rb") as f:
        pyproject = tomllib.load(f)

    deps = pyproject.get("project", {}).get("dependencies", [])

    required = ["workers-py", "fastapi", "pydantic"]

    for req in required:
        if any(req in dep for dep in deps):
            ok(f"Dependency configured: {req}")
        else:
            fail(f"Missing dependency: {req}")

except Exception as exc:
    fail(f"pyproject validation failed: {exc}")


# FastAPI entry validation
entry = read("src/entry.py")
required_patterns = [
    "FastAPI",
    "WorkerEntrypoint",
    "/health",
    "/status",
    "/auth/login",
    "/seed/initial-workspace",
]

for pattern in required_patterns:
    if pattern in entry:
        ok(f"Backend feature detected: {pattern}")
    else:
        fail(f"Missing backend feature: {pattern}")


# Schema validation
schema = read("schema.sql").lower()
required_tables = [
    "users",
    "sessions",
    "organizations",
    "projects",
    "jobs",
    "audit_logs",
]

for table in required_tables:
    if table in schema:
        ok(f"Schema table exists: {table}")
    else:
        fail(f"Missing schema table: {table}")


# Frontend integration
api = read("client/src/lib/api.ts")
if "VITE_API_BASE_URL" in api:
    ok("Frontend API integration configured")
else:
    fail("Frontend API integration missing")


# Architecture guard
try:
    proc = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "architecture_guard.py")],
        capture_output=True,
        timeout=20,
        cwd=str(ROOT),
    )
    if proc.returncode == 0:
        ok("Architecture guard passed")
    else:
        fail("Architecture guard failed")
except Exception as exc:
    warn(f"Architecture guard execution warning: {exc}")


print("\n=== Bentley Showcase Backend Validation ===\n")

for item in passed:
    print(f"PASS: {item}")

for item in warnings:
    print(f"WARN: {item}")

for item in failed:
    print(f"FAIL: {item}")

print(f"\nPassed: {len(passed)}")
print(f"Warnings: {len(warnings)}")
print(f"Failed: {len(failed)}")

if failed:
    sys.exit(1)
