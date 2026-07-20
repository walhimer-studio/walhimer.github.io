#!/usr/bin/env python3
"""Fail when data/catalog.json is stale vs SERIES + installations.

Run after refresh_catalog.py and before commit/push:

  python3 _scripts/check_catalog_sync.py

Also fails when staged new sketch HTML is not registered in SERIES.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

if str(ROOT / "_scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "_scripts"))

from catalog_lib import INDEX, parse_series_from_index, sketch_entry_repo_path  # noqa: E402
from refresh_catalog import CATALOG, LEGACY_SERIES_INDEX, compute_catalog  # noqa: E402

SERIES_HUB_NAMES = {"index.html", "catalog-work.html"}


def series_index_path() -> Path:
    if INDEX.is_file():
        primary = parse_series_from_index(INDEX.read_text(encoding="utf-8"))
        if primary:
            return INDEX
    return LEGACY_SERIES_INDEX


def normalize_catalog(catalog: dict) -> dict:
    out = deepcopy(catalog)
    out.pop("updated", None)
    return out


def catalog_json_equal(on_disk: dict, expected: dict) -> bool:
    return normalize_catalog(on_disk) == normalize_catalog(expected)


def load_series_html_paths() -> set[str]:
    series_index = series_index_path()
    if not series_index.is_file():
        return set()
    series = parse_series_from_index(series_index.read_text(encoding="utf-8"))
    paths: set[str] = set()
    for block in series:
        for fn in block.get("files") or []:
            if not fn.lower().endswith(".html"):
                continue
            repo_path = sketch_entry_repo_path(fn)
            paths.add(repo_path.replace("\\", "/"))
    return paths


def staged_paths() -> list[str]:
    proc = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACMR"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        return []
    return [line.strip() for line in proc.stdout.splitlines() if line.strip()]


def is_series_hub(repo_rel: str) -> bool:
    parts = Path(repo_rel).parts
    if parts[0] != "sketches":
        return False
    return parts[-1] in SERIES_HUB_NAMES


def check_staged_series_registration(series_html: set[str]) -> list[str]:
    errors: list[str] = []
    for rel in staged_paths():
        rel = rel.replace("\\", "/")
        if not rel.startswith("sketches/") or not rel.endswith(".html"):
            continue
        if is_series_hub(rel):
            continue
        if rel not in series_html:
            series_index = series_index_path()
            errors.append(
                f"{rel} is staged but not listed in SERIES "
                f"({series_index.relative_to(ROOT)}). Register it, then refresh catalog."
            )
    return errors


def main() -> int:
    ap = argparse.ArgumentParser(description="Verify data/catalog.json matches refresh output")
    ap.add_argument("--report", action="store_true", help="Print status only; exit 0")
    args = ap.parse_args()

    if not CATALOG.is_file():
        msg = f"Missing {CATALOG.relative_to(ROOT)} — run: python3 _scripts/refresh_catalog.py"
        if args.report:
            print(msg)
            return 0
        print(msg, file=sys.stderr)
        return 1

    on_disk = json.loads(CATALOG.read_text(encoding="utf-8"))
    expected, _stats = compute_catalog()

    errors: list[str] = []
    if not catalog_json_equal(on_disk, expected):
        errors.append(
            f"{CATALOG.relative_to(ROOT)} is stale. Run:\n"
            "  python3 _scripts/reorder_series_by_index_mtime.py\n"
            "  python3 _scripts/refresh_catalog.py\n"
            "Then commit the updated catalog.json with your sketch/SERIES changes."
        )

    errors.extend(check_staged_series_registration(load_series_html_paths()))

    if errors:
        if args.report:
            for err in errors:
                print(err)
            return 0
        for err in errors:
            print(err, file=sys.stderr)
        return 1

    print(
        f"Catalog sync OK — {len(expected.get('works') or [])} works in "
        f"{CATALOG.relative_to(ROOT)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
