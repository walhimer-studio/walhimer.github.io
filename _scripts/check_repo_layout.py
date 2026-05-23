#!/usr/bin/env python3
"""Fail fast when root layout drifts from catalog rules."""

from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]

# Root folders that are allowed to exist.
ALLOWED_DIRS = {
    ".git",
    "_scripts",
    "bio",
    "contact",
    "data",
    "docs",
    "installations",
    "sketches",
}

# Root files that are allowed to exist.
ALLOWED_FILES = {
    ".gitignore",
    ".nojekyll",
    "CNAME",
    "README.md",
    "build_installations.sh",
    "build_shared_ground.py",
    "catalog-db.html",
    "google30c2271f536e3a7f.html",
    "index.html",
    "inject_salamander.py",
    "inline_libs.py",
    "page-sitemap.xml",
    "robots.txt",
    "sitemap.xml",
}

# Known legacy roots that should not come back.
FORBIDDEN_ROOTS = {
    "mangle",
    "traveling-landscape",
    "loop-art-critique-2026",
}


def main() -> int:
    errors: list[str] = []

    for name in sorted(FORBIDDEN_ROOTS):
        if (ROOT / name).exists():
            errors.append(f"Forbidden root path exists: `{name}`")

    for entry in sorted(ROOT.iterdir(), key=lambda p: p.name.lower()):
        name = entry.name
        if entry.is_dir():
            if name not in ALLOWED_DIRS:
                errors.append(f"Unexpected root directory: `{name}`")
        elif entry.is_file():
            if name not in ALLOWED_FILES:
                errors.append(f"Unexpected root file: `{name}`")
        else:
            errors.append(f"Unexpected root entry type: `{name}`")

    if errors:
        print("Layout check failed:")
        for err in errors:
            print(f"- {err}")
        print("\nMove/archive unexpected paths under `sketches/` or update this guard intentionally.")
        return 1

    print("Layout check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
