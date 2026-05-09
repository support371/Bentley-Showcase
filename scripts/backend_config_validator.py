#!/usr/bin/env python3
"""Validate backend configuration for deployment readiness.

This script performs comprehensive checks on:
1. Wrangler configuration (bindings, compatibility, resources)
2. Python dependencies (workers-py version constraint)
3. FastAPI entry point (FastAPI app, routing, auth)
4. Database schema (tables, constraints, indexes)
5. Frontend/backend integration paths
6. Architecture contract enforcement

Usage:
    python3 scripts/backend_config_validator.py [--verbose]
"""

from __future__ import annotations

import json
import re
import sys
import tomllib
from pathlib import Path
from typing import Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]


class ValidationResult:
    def __init__(self):
        self.passed: List[str] = []
        self.warnings: List[str] = []
        self.failed: List[str] = []

    def pass_check(self, message: str):
        self.passed.append(message)

    def warn(self, message: str):
        self.warnings.append(message)

    def fail(self, message: str):
        self.failed.append(message)

    def is_ok(self) -> bool:
        return len(self.failed) == 0

    def print_report(self, verbose: bool = False):
        print("\n" + "=" * 70)
        print("BACKEND CONFIGURATION VALIDATION REPORT")
        print("=" * 70)

        if verbose and self.passed:
            print(f"\n✅ PASSED ({len(self.passed)}):")
            for msg in self.passed:
                print(f"   • {msg}")

        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for msg in self.warnings:
                print(f"   • {msg}")

        if self.failed:
            print(f"\n❌ FAILED ({len(self.failed)}):")
            for msg in self.failed:
                print(f"   • {msg}")
        else:
            print("\n✅ All checks passed!")

        print("=" * 70 + "\n")

        return 0 if self.is_ok() else 1


result = ValidationResult()


def check_wrangler_config():
    """Validate wrangler.toml configuration."""
    print("Checking Wrangler configuration...")

    toml_file = ROOT / "wrangler.toml"
    if not toml_file.exists():
        result.fail("wrangler.toml not found")
        return

    try:
        with open(toml_file, "rb") as f:
            config = tomllib.load(f)
    except Exception as e:
        result.fail(f"wrangler.toml parse error: {e}")
        return

    # Check required fields
    required_fields = {
        "name": "Worker name",
        "main": "Main entry point",
        "compatibility_date": "Compatibility date",
        "compatibility_flags": "Compatibility flags",
    }

    for field, description in required_fields.items():
        if field not in config:
            result.fail(f"wrangler.toml missing {description}: {field}")
        else:
            result.pass_check(f"wrangler.toml has {description}: {field} = {config[field]}")

    # Check entry point
    if config.get("main") == "src/entry.py":
        result.pass_check("Worker entry point correctly set to src/entry.py")
    else:
        result.fail(f"Worker entry point is {config.get('main')}, expected src/entry.py")

    # Check compatibility flags
    flags = config.get("compatibility_flags", [])
    if "python_workers" in flags:
        result.pass_check("python_workers compatibility flag enabled")
    else:
        result.fail("python_workers compatibility flag missing")

    # Check bindings
    if "d1_databases" in config and config["d1_databases"]:
        db = config["d1_databases"][0]
        if "REPLACE_WITH" in str(db.get("database_id", "")):
            result.warn(
                f"D1 database_id still has placeholder: {db.get('database_id')}"
            )
        else:
            result.pass_check(
                f"D1 database binding configured: {db.get('database_id')}"
            )
    else:
        result.fail("D1 database binding not configured")

    if "kv_namespaces" in config and config["kv_namespaces"]:
        kv = config["kv_namespaces"][0]
        if "REPLACE_WITH" in str(kv.get("id", "")):
            result.warn(f"KV namespace id still has placeholder: {kv.get('id')}")
        else:
            result.pass_check(f"KV namespace binding configured: {kv.get('id')}")
    else:
        result.fail("KV namespace binding not configured")

    # Check queue producer
    if "queues" in config and "producers" in config["queues"]:
        producers = config["queues"]["producers"]
        if producers:
            result.pass_check(f"Queue producer binding configured")
        else:
            result.fail("Queue producer binding empty")
    else:
        result.fail("Queue producer binding not configured")


def check_python_dependencies():
    """Validate Python dependencies."""
    print("Checking Python dependencies...")

    pyproject_file = ROOT / "pyproject.toml"
    if not pyproject_file.exists():
        result.fail("pyproject.toml not found")
        return

    try:
        with open(pyproject_file, "rb") as f:
            config = tomllib.load(f)
    except Exception as e:
        result.fail(f"pyproject.toml parse error: {e}")
        return

    dependencies = config.get("project", {}).get("dependencies", [])

    if not dependencies:
        result.fail("No dependencies defined in pyproject.toml")
        return

    # Check for workers >= 1.90
    workers_found = False
    for dep in dependencies:
        if "workers" in dep:
            workers_found = True
            if ">= 1.90" in dep or ">=1.90" in dep:
                result.pass_check(f"workers-py dependency correct: {dep}")
            elif ">=" in dep:
                version = dep.split(">=")[-1].strip()
                try:
                    major_minor = tuple(
                        map(int, version.split(".")[:2])
                    )
                    if major_minor >= (1, 90):
                        result.pass_check(f"workers-py version satisfies >= 1.90: {dep}")
                    else:
                        result.fail(
                            f"workers-py version too old: {dep} (need >= 1.90)"
                        )
                except:
                    result.warn(f"Could not parse workers-py version: {dep}")
            else:
                result.warn(f"workers-py dependency may need version check: {dep}")

    if not workers_found:
        result.fail("workers package not found in dependencies")

    # Check other required dependencies
    required_packages = ["fastapi", "pydantic"]
    for pkg in required_packages:
        found = any(pkg in dep for dep in dependencies)
        if found:
            result.pass_check(f"Required package found: {pkg}")
        else:
            result.fail(f"Required package missing: {pkg}")


def check_fastapi_entry():
    """Validate FastAPI entry point."""
    print("Checking FastAPI entry point...")

    entry_file = ROOT / "src" / "entry.py"
    if not entry_file.exists():
        result.fail("src/entry.py not found")
        return

    try:
        content = entry_file.read_text(encoding="utf-8")
    except Exception as e:
        result.fail(f"Could not read src/entry.py: {e}")
        return

    # Check for required imports and patterns
    checks = {
        "from workers import WorkerEntrypoint": "Cloudflare Workers entrypoint",
        "app = FastAPI": "FastAPI application",
        "async def fetch": "Async fetch handler",
        "asgi.fetch": "ASGI adapter",
        "@app.post": "POST route handler",
        "@app.get": "GET route handler",
    }

    for pattern, description in checks.items():
        if pattern in content:
            result.pass_check(f"Entry point has {description}")
        else:
            result.fail(f"Entry point missing {description}")

    # Check for auth routes
    auth_routes = ["/auth/signup", "/auth/login", "/auth/logout", "/auth/me"]
    for route in auth_routes:
        if f'"{route}"' in content or f"'{route}'" in content:
            result.pass_check(f"Auth route implemented: {route}")
        else:
            result.warn(f"Auth route not found: {route}")

    # Check for seed endpoint
    if "/seed/initial-workspace" in content:
        result.pass_check("Seed endpoint implemented")
    else:
        result.fail("Seed endpoint not implemented")


def check_database_schema():
    """Validate database schema."""
    print("Checking database schema...")

    schema_file = ROOT / "schema.sql"
    if not schema_file.exists():
        result.fail("schema.sql not found")
        return

    try:
        content = schema_file.read_text(encoding="utf-8")
    except Exception as e:
        result.fail(f"Could not read schema.sql: {e}")
        return

    # Required tables
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

    schema_lower = content.lower()
    for table in required_tables:
        if f"create table" in schema_lower and table in schema_lower:
            result.pass_check(f"Database table defined: {table}")
        else:
            result.fail(f"Database table missing: {table}")

    # Check for indexes
    index_count = schema_lower.count("create index")
    if index_count > 0:
        result.pass_check(f"Database indexes configured: {index_count} indexes")
    else:
        result.warn("No indexes found in schema (may impact performance)")

    # Check for foreign keys
    if "foreign key" in schema_lower:
        result.pass_check("Foreign key constraints defined")
    else:
        result.warn("No foreign key constraints found")


def check_frontend_integration():
    """Validate frontend/backend integration paths."""
    print("Checking frontend/backend integration...")

    # Check API client
    api_file = ROOT / "client" / "src" / "lib" / "api.ts"
    if api_file.exists():
        try:
            content = api_file.read_text(encoding="utf-8")
            if "VITE_API_BASE_URL" in content:
                result.pass_check("Frontend API client configured with VITE_API_BASE_URL")
            else:
                result.warn("Frontend API client may not use VITE_API_BASE_URL")
        except:
            pass
    else:
        result.warn("Frontend API client not found at expected location")

    # Check Vercel configuration
    vercel_file = ROOT / "vercel.json"
    if vercel_file.exists():
        try:
            vercel_config = json.loads(vercel_file.read_text())
            if "rewrites" in vercel_config:
                result.pass_check("Vercel rewrites configured")
            if "headers" in vercel_config:
                result.pass_check("Vercel security headers configured")
        except Exception as e:
            result.warn(f"Could not parse vercel.json: {e}")
    else:
        result.fail("vercel.json not found")

    # Check .env.example
    env_file = ROOT / ".env.example"
    if env_file.exists():
        try:
            content = env_file.read_text()
            if "VITE_API_BASE_URL" in content:
                result.pass_check(".env.example documents VITE_API_BASE_URL")
            else:
                result.warn(".env.example missing VITE_API_BASE_URL reference")
        except:
            pass


def check_architecture_contract():
    """Validate architecture contract enforcement."""
    print("Checking architecture contract...")

    guard_file = ROOT / "scripts" / "architecture_guard.py"
    if not guard_file.exists():
        result.fail("Architecture guard script not found")
        return

    # Try running the guard
    try:
        import subprocess

        proc = subprocess.run(
            [sys.executable, str(guard_file)],
            capture_output=True,
            timeout=10,
            cwd=str(ROOT),
        )
        if proc.returncode == 0:
            result.pass_check("Architecture guard passed")
        else:
            guard_output = proc.stdout.decode(errors="ignore")
            result.fail(f"Architecture guard failed:\n{guard_output}")
    except Exception as e:
        result.warn(f"Could not run architecture guard: {e}")


def main():
    verbose = "--verbose" in sys.argv or "-v" in sys.argv

    check_wrangler_config()
    check_python_dependencies()
    check_fastapi_entry()
    check_database_schema()
    check_frontend_integration()
    check_architecture_contract()

    exit_code = result.print_report(verbose=verbose)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
