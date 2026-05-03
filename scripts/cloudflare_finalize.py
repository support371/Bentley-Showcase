#!/usr/bin/env python3
"""Finalize Cloudflare resources and deploy the Bentley Showcase Worker.

This script is intentionally token-safe: provide CLOUDFLARE_API_TOKEN via the
process environment. Do not commit tokens or secrets.

Required env:
  CLOUDFLARE_API_TOKEN

Optional env:
  CLOUDFLARE_ACCOUNT_ID default 5918df72bfd0d0389a1894adec5db58f
  WORKER_NAME default bentley-webpage
  D1_NAME default bentley_webpage_db
  KV_TITLE default bentley-sessions
  QUEUE_NAME default bentley-jobs
  CORS_ORIGINS default production + localhost origins
  BACKEND_VERSION default 1.0.0
  SEED_OWNER_EMAIL default owner@example.com
  PASSWORD_SALT / SEED_SECRET / SEED_OWNER_PASSWORD are generated if omitted

Usage:
  python scripts/cloudflare_finalize.py
"""

from __future__ import annotations

import json
import mimetypes
import os
import secrets
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, Optional
from urllib import error, request

ROOT = Path(__file__).resolve().parents[1]
API_BASE = "https://api.cloudflare.com/client/v4"
ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID", "5918df72bfd0d0389a1894adec5db58f")
WORKER_NAME = os.getenv("WORKER_NAME", "bentley-webpage")
D1_NAME = os.getenv("D1_NAME", "bentley_webpage_db")
KV_TITLE = os.getenv("KV_TITLE", "bentley-sessions")
QUEUE_NAME = os.getenv("QUEUE_NAME", "bentley-jobs")


def die(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    sys.exit(1)


def token() -> str:
    value = os.getenv("CLOUDFLARE_API_TOKEN")
    if not value:
        die("Set CLOUDFLARE_API_TOKEN in your environment before running this script.")
    return value


def cf(method: str, path: str, payload: Optional[Dict[str, Any]] = None, *, raw_body: bytes | None = None, content_type: str = "application/json") -> Dict[str, Any]:
    url = f"{API_BASE}{path}"
    headers = {"Authorization": f"Bearer {token()}"}
    data = None
    if raw_body is not None:
        data = raw_body
        headers["Content-Type"] = content_type
    elif payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = request.Request(url, data=data, headers=headers, method=method)
    try:
        with request.urlopen(req, timeout=60) as resp:
            text = resp.read().decode("utf-8")
            return json.loads(text) if text else {"success": True, "result": None}
    except error.HTTPError as exc:
        text = exc.read().decode("utf-8", errors="replace")
        try:
            body = json.loads(text)
        except Exception:
            body = {"raw": text}
        # Some resources may already exist. Return the response so callers can
        # decide whether to list/reuse instead of failing.
        return {"success": False, "status": exc.code, "errors": body.get("errors", []), "messages": body.get("messages", []), "result": body.get("result"), "raw": body}


def require_success(response: Dict[str, Any], step: str) -> Dict[str, Any]:
    if not response.get("success"):
        die(f"{step} failed: {json.dumps(response.get('errors') or response, indent=2)}")
    return response


def find_d1() -> Optional[str]:
    resp = cf("GET", f"/accounts/{ACCOUNT_ID}/d1/database")
    if not resp.get("success"):
        return None
    for item in resp.get("result", []):
        if item.get("name") == D1_NAME:
            return item.get("uuid") or item.get("id")
    return None


def create_or_get_d1() -> str:
    resp = cf("POST", f"/accounts/{ACCOUNT_ID}/d1/database", {"name": D1_NAME})
    if resp.get("success"):
        result = resp["result"]
        return result.get("uuid") or result.get("id")
    existing = find_d1()
    if existing:
        print(f"D1 database already exists: {existing}")
        return existing
    require_success(resp, "Create D1 database")
    raise AssertionError("unreachable")


def find_kv() -> Optional[str]:
    resp = cf("GET", f"/accounts/{ACCOUNT_ID}/storage/kv/namespaces")
    if not resp.get("success"):
        return None
    for item in resp.get("result", []):
        if item.get("title") == KV_TITLE:
            return item.get("id")
    return None


def create_or_get_kv() -> str:
    resp = cf("POST", f"/accounts/{ACCOUNT_ID}/storage/kv/namespaces", {"title": KV_TITLE})
    if resp.get("success"):
        return resp["result"]["id"]
    existing = find_kv()
    if existing:
        print(f"KV namespace already exists: {existing}")
        return existing
    require_success(resp, "Create KV namespace")
    raise AssertionError("unreachable")


def find_queue() -> Optional[str]:
    resp = cf("GET", f"/accounts/{ACCOUNT_ID}/queues")
    if not resp.get("success"):
        return None
    for item in resp.get("result", []):
        if item.get("queue_name") == QUEUE_NAME or item.get("name") == QUEUE_NAME:
            return item.get("queue_id") or item.get("id")
    return None


def create_or_get_queue() -> str:
    resp = cf("POST", f"/accounts/{ACCOUNT_ID}/queues", {"name": QUEUE_NAME})
    if resp.get("success"):
        result = resp["result"]
        return result.get("queue_id") or result.get("id") or QUEUE_NAME
    existing = find_queue()
    if existing:
        print(f"Queue already exists: {existing}")
        return existing
    require_success(resp, "Create queue")
    raise AssertionError("unreachable")


def apply_schema(database_id: str) -> None:
    schema = (ROOT / "schema.sql").read_text(encoding="utf-8")
    resp = cf("POST", f"/accounts/{ACCOUNT_ID}/d1/database/{database_id}/query", {"sql": schema})
    require_success(resp, "Apply D1 schema")


def multipart(fields: Dict[str, tuple[str, bytes, str]]) -> tuple[bytes, str]:
    boundary = "----BentleyShowcase" + secrets.token_hex(16)
    chunks: list[bytes] = []
    for name, (filename, data, ctype) in fields.items():
        chunks.append(f"--{boundary}\r\n".encode())
        chunks.append(f'Content-Disposition: form-data; name="{name}"'.encode())
        if filename:
            chunks.append(f'; filename="{filename}"'.encode())
        chunks.append(f"\r\nContent-Type: {ctype}\r\n\r\n".encode())
        chunks.append(data)
        chunks.append(b"\r\n")
    chunks.append(f"--{boundary}--\r\n".encode())
    return b"".join(chunks), f"multipart/form-data; boundary={boundary}"


def deploy_worker(database_id: str, namespace_id: str) -> None:
    script = (ROOT / "src" / "entry.py").read_bytes()
    metadata = {
        "body_part": "script",
        "bindings": [
            {"type": "d1", "name": "DB", "id": database_id},
            {"type": "kv_namespace", "name": "SESSIONS", "namespace_id": namespace_id},
            {"type": "queue", "name": "JOB_QUEUE", "queue_name": QUEUE_NAME},
            {"type": "plain_text", "name": "BACKEND_VERSION", "text": os.getenv("BACKEND_VERSION", "1.0.0")},
            {"type": "plain_text", "name": "CORS_ORIGINS", "text": os.getenv("CORS_ORIGINS", "https://bentley-showcase.vercel.app,http://localhost:3000,http://localhost:5173")},
        ],
        "compatibility_date": "2026-04-29",
        "compatibility_flags": ["python_workers"],
    }
    body, ctype = multipart({
        "metadata": ("", json.dumps(metadata).encode("utf-8"), "application/json"),
        "script": ("entry.py", script, mimetypes.guess_type("entry.py")[0] or "text/x-python"),
    })
    resp = cf("PUT", f"/accounts/{ACCOUNT_ID}/workers/scripts/{WORKER_NAME}", raw_body=body, content_type=ctype)
    require_success(resp, "Deploy Worker")


def set_secret(name: str, value: str) -> None:
    payload = {"name": name, "text": value, "type": "secret_text"}
    # Cloudflare currently uses PUT for script secrets; try PUT first and POST
    # as a compatibility fallback.
    path = f"/accounts/{ACCOUNT_ID}/workers/scripts/{WORKER_NAME}/secrets"
    resp = cf("PUT", path, payload)
    if not resp.get("success"):
        resp = cf("POST", path, payload)
    require_success(resp, f"Set secret {name}")


def configure_secrets() -> Dict[str, str]:
    values = {
        "PASSWORD_SALT": os.getenv("PASSWORD_SALT", secrets.token_hex(32)),
        "SEED_SECRET": os.getenv("SEED_SECRET", secrets.token_urlsafe(32)),
        "SEED_OWNER_PASSWORD": os.getenv("SEED_OWNER_PASSWORD", secrets.token_urlsafe(24)),
        "SEED_OWNER_EMAIL": os.getenv("SEED_OWNER_EMAIL", "owner@example.com"),
        "CORS_ORIGINS": os.getenv("CORS_ORIGINS", "https://bentley-showcase.vercel.app,http://localhost:3000,http://localhost:5173"),
        "BACKEND_VERSION": os.getenv("BACKEND_VERSION", "1.0.0"),
    }
    for key, value in values.items():
        set_secret(key, value)
    return values


def main() -> None:
    print("Creating or reusing Cloudflare resources...")
    database_id = create_or_get_d1()
    namespace_id = create_or_get_kv()
    queue_id = create_or_get_queue()
    print(f"D1 database ID: {database_id}")
    print(f"KV namespace ID: {namespace_id}")
    print(f"Queue ID/name: {queue_id}")

    print("Applying D1 schema...")
    apply_schema(database_id)

    print("Deploying Worker...")
    deploy_worker(database_id, namespace_id)

    print("Setting Worker secrets...")
    secrets_used = configure_secrets()

    print("\nFinalization complete.")
    print(f"Worker name: {WORKER_NAME}")
    print("Worker URL will be shown in the Cloudflare dashboard or Wrangler output.")
    print("Seed endpoint header value was generated or sourced from SEED_SECRET.")
    print("Save this owner email for login:", secrets_used["SEED_OWNER_EMAIL"])
    if "SEED_OWNER_PASSWORD" not in os.environ:
        print("A SEED_OWNER_PASSWORD was generated and set as a Worker secret; rerun with your own env var if you need to know it.")


if __name__ == "__main__":
    main()
