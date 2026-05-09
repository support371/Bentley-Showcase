#!/usr/bin/env python3
"""Render wrangler.toml with deployment-time Cloudflare resource IDs.

The committed wrangler.toml intentionally uses non-secret placeholders so the
repository stays portable. This script replaces those placeholders from
environment variables during CI/CD or local deployment.

Required environment variables:
  CLOUDFLARE_D1_DATABASE_ID
  CLOUDFLARE_D1_PREVIEW_DATABASE_ID
  CLOUDFLARE_KV_NAMESPACE_ID
  CLOUDFLARE_KV_PREVIEW_NAMESPACE_ID

Usage:
  python3 scripts/render_wrangler.py
  python3 scripts/render_wrangler.py --output wrangler.production.toml
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "wrangler.toml"

REPLACEMENTS = {
    "__D1_DATABASE_ID__": "CLOUDFLARE_D1_DATABASE_ID",
    "__D1_PREVIEW_DATABASE_ID__": "CLOUDFLARE_D1_PREVIEW_DATABASE_ID",
    "__KV_NAMESPACE_ID__": "CLOUDFLARE_KV_NAMESPACE_ID",
    "__KV_PREVIEW_NAMESPACE_ID__": "CLOUDFLARE_KV_PREVIEW_NAMESPACE_ID",
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Render wrangler.toml for deployment")
    parser.add_argument("--output", default="wrangler.toml", help="Output path relative to repo root")
    parser.add_argument("--check", action="store_true", help="Validate env values without writing")
    args = parser.parse_args()

    content = TEMPLATE.read_text(encoding="utf-8")
    missing: list[str] = []

    for placeholder, env_name in REPLACEMENTS.items():
        value = os.getenv(env_name, "").strip()
        if not value:
            missing.append(env_name)
            continue
        content = content.replace(placeholder, value)

    if missing:
        print("Missing required Cloudflare environment variables:", file=sys.stderr)
        for name in missing:
            print(f"  - {name}", file=sys.stderr)
        return 1

    unresolved = [placeholder for placeholder in REPLACEMENTS if placeholder in content]
    if unresolved:
        print("Unresolved wrangler placeholders remain:", file=sys.stderr)
        for placeholder in unresolved:
            print(f"  - {placeholder}", file=sys.stderr)
        return 1

    if args.check:
        print("Wrangler deployment configuration can be rendered successfully.")
        return 0

    output = ROOT / args.output
    output.write_text(content, encoding="utf-8")
    print(f"Rendered {output.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
