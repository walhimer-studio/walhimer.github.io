#!/usr/bin/env python3
"""Fail when ANY published HTML depends on external CDNs for core libraries.

Source of truth: README.md § Self-contained rule, docs/archive-chronicle.md.

Every HTML file under sketches/, installations/, machine-aesthetic/, and root
index.html must pass — no exceptions, no incremental mode on publish/CI.

Usage:
  python3 _scripts/check_self_contained.py           # full repo — fails if any violation
  python3 _scripts/check_self_contained.py --report  # audit only, exit 0
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SCAN_ROOTS = (
    ROOT / "sketches",
    ROOT / "installations",
    ROOT / "machine-aesthetic",
)

SCAN_FILES = (ROOT / "index.html",)

CDN_PATTERNS = (
    re.compile(r"""<script[^>]+src\s*=\s*["']https?://[^"']+["']""", re.I),
    re.compile(r"""<link[^>]+href\s*=\s*["']https?://[^"']+["'][^>]*rel\s*=\s*["']modulepreload["']""", re.I),
    re.compile(r"""["']https?://[^"']+["']\s*:\s*["']https?://[^"']+["']""", re.I),  # import maps
)

KNOWN_LIB_HOSTS = (
    "unpkg.com",
    "cdnjs.cloudflare.com",
    "cdn.jsdelivr.net",
    "esm.sh",
    "skypack.dev",
    "esm.run",
    "jspm.io",
    "ga.jspm.io",
    "ajax.googleapis.com/ajax/libs",
    "code.jquery.com",
)


def is_lib_cdn(tag: str) -> bool:
    lower = tag.lower()
    return any(host in lower for host in KNOWN_LIB_HOSTS)


def iter_html_files() -> list[Path]:
    files: list[Path] = []
    for path in SCAN_FILES:
        if path.is_file():
            files.append(path)
    for root in SCAN_ROOTS:
        if root.is_dir():
            for path in sorted(root.rglob("*.html")):
                if "node_modules" in path.parts:
                    continue
                files.append(path)
    return files


def find_violations(path: Path) -> list[str]:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        return [f"unreadable: {exc}"]

    hits: list[str] = []
    for pattern in CDN_PATTERNS:
        for match in pattern.finditer(text):
            snippet = match.group(0).strip()
            if is_lib_cdn(snippet):
                hits.append(snippet)
    return hits


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--report",
        action="store_true",
        help="Print violations but exit 0 (audit mode).",
    )
    args = parser.parse_args()

    files = iter_html_files()
    violations: list[tuple[Path, list[str]]] = []
    for path in files:
        hits = find_violations(path)
        if hits:
            violations.append((path, hits))

    if not violations:
        print(f"Self-contained check passed — all {len(files)} published HTML file(s).")
        return 0

    print("Self-contained check FAILED — external CDN dependency in published HTML:")
    print("Rule: README.md § Self-contained rule (works offline; no required CDNs).")
    print(f"Files scanned: {len(files)}  |  Violations: {len(violations)}")
    print()
    for path, hits in violations:
        rel = path.relative_to(ROOT) if path.is_relative_to(ROOT) else path
        print(f"- {rel}")
        for hit in hits[:3]:
            print(f"    {hit}")
        if len(hits) > 3:
            print(f"    … and {len(hits) - 3} more")
    print()
    print("Fix: python3 _scripts/vendor_cdn_libs.py  (vendors libs locally)")
    print("Then re-run: python3 _scripts/check_self_contained.py")

    return 0 if args.report else 1


if __name__ == "__main__":
    raise SystemExit(main())
