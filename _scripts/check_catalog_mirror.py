#!/usr/bin/env python3
"""Fail when catalog layout drifts from catalog/README.md mirror rules.

Enforced on every commit (pre-commit + CI):
  1. No repo-root `{name}/` when `catalog/{name}/` exists (hub belongs in sketches/)
  2. SERIES HTML only under sketches/ or installations/ (+ legacy allowlist)
  3. When SERIES lists `{name}/…` for catalog series `name`, `sketches/{name}/` must exist

Source of truth: catalog/README.md · docs/submission-and-series-structure.md
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

if str(ROOT / "_scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "_scripts"))

from catalog_lib import parse_series_from_index, sketch_entry_repo_path  # noqa: E402
from check_catalog_sync import series_index_path  # noqa: E402

# Legacy SERIES HTML roots (predate strict mirror rule — do not add new entries here).
LEGACY_SERIES_HTML_PREFIXES = (
    "sketches/",
    "installations/",
    "machine aesthetic/",
    "machine-aesthetic/",
    "practice/",
)

LEGACY_SERIES_MD_PREFIXES = (
    "sketches/",
    "catalog/",
    "machine-aesthetic/",
    "machine aesthetic/",
    "practice/",
    "docs/",
)


def catalog_top_level_names() -> set[str]:
    names: set[str] = set()
    cat = ROOT / "catalog"
    if not cat.is_dir():
        return names
    for child in cat.iterdir():
        if child.is_dir() and (child / "README.md").is_file():
            names.add(child.name)
    return names


def load_series() -> list[dict]:
    series_index = series_index_path()
    if not series_index.is_file():
        return []
    return parse_series_from_index(series_index.read_text(encoding="utf-8"))


def staged_paths() -> list[str]:
    proc = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACDMR"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        return []
    return [line.strip().replace("\\", "/") for line in proc.stdout.splitlines() if line.strip()]


def load_grandfathered_roots() -> set[str]:
    path = ROOT / "_scripts" / "catalog_mirror_grandfathered_roots.txt"
    if not path.is_file():
        return set()
    out: set[str] = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.split("#", 1)[0].strip()
        if line:
            out.add(line)
    return out


def is_sketches_redirect_stub(catalog_name: str) -> bool:
    """True when repo-root/{name}/ only redirects into sketches/{name}/."""
    stub_dir = ROOT / catalog_name
    if not stub_dir.is_dir():
        return False
    html_files = [p for p in stub_dir.rglob("*") if p.is_file() and p.suffix.lower() == ".html"]
    if len(html_files) != 1 or html_files[0].name != "index.html":
        return False
    text = html_files[0].read_text(encoding="utf-8", errors="replace")
    target = f"sketches/{catalog_name}/"
    return target in text and "refresh" in text.lower()


def check_repo_root_catalog_duplicates(catalog_names: set[str]) -> list[str]:
    errors: list[str] = []
    grandfathered = load_grandfathered_roots()
    for name in sorted(catalog_names):
        root_copy = ROOT / name
        if not root_copy.is_dir():
            continue
        if name in grandfathered:
            continue
        if is_sketches_redirect_stub(name):
            continue
        errors.append(
            f"Forbidden repo-root `{name}/` — mirror is `sketches/{name}/` "
            f"(catalog/{name}/). Remove repo-root copy or leave a redirect-only "
            f"`{name}/index.html` stub to sketches."
        )
    return errors


def check_series_paths(series: list[dict], catalog_names: set[str]) -> list[str]:
    errors: list[str] = []
    series_touched: set[str] = set()

    for block in series:
        series_name = block.get("series") or "?"
        for fn in block.get("files") or []:
            rel = sketch_entry_repo_path(fn).replace("\\", "/")
            top = rel.split("/", 1)[0] if "/" in rel else rel

            if rel.endswith(".html"):
                if not rel.startswith(LEGACY_SERIES_HTML_PREFIXES):
                    errors.append(
                        f"SERIES HTML must be under sketches/ (or legacy allowlist): "
                        f"`{fn}` → `{rel}` (series: {series_name})."
                    )
                if top in catalog_names:
                    series_touched.add(top)

            elif rel.endswith(".md"):
                if not rel.startswith(LEGACY_SERIES_MD_PREFIXES):
                    errors.append(
                        f"SERIES markdown must be under sketches/ or catalog/: "
                        f"`{fn}` → `{rel}` (series: {series_name})."
                    )
                if top in catalog_names:
                    series_touched.add(top)

    for name in sorted(series_touched):
        if not (ROOT / "sketches" / name).is_dir():
            errors.append(
                f"SERIES references `{name}/` but `sketches/{name}/` is missing "
                f"(catalog/{name}/ mirror required)."
            )

    return errors


def check_staged_layout(catalog_names: set[str]) -> list[str]:
    errors: list[str] = []
    for rel in staged_paths():
        top = rel.split("/", 1)[0]
        if top in catalog_names and not rel.startswith("sketches/"):
            if rel.endswith((".html", ".md", ".mjs", ".js")) or "/assets/" in rel:
                errors.append(
                    f"Staged `{rel}` — catalog series `{top}` must live under "
                    f"`sketches/{top}/`, not repo root."
                )
    return errors


def main() -> int:
    ap = argparse.ArgumentParser(description="Verify catalog ↔ sketches mirror layout")
    ap.add_argument("--report", action="store_true", help="Print issues; exit 0")
    args = ap.parse_args()

    catalog_names = catalog_top_level_names()
    series = load_series()

    errors: list[str] = []
    errors.extend(check_repo_root_catalog_duplicates(catalog_names))
    errors.extend(check_series_paths(series, catalog_names))
    errors.extend(check_staged_layout(catalog_names))

    if errors:
        if args.report:
            for err in errors:
                print(err)
            return 0
        print("Catalog mirror check failed:", file=sys.stderr)
        for err in errors:
            print(f"- {err}", file=sys.stderr)
        print(
            "\nSee catalog/README.md · docs/submission-and-series-structure.md",
            file=sys.stderr,
        )
        return 1

    print(
        f"Catalog mirror OK — {len(catalog_names)} catalog folders, "
        f"{len(series)} SERIES blocks."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
