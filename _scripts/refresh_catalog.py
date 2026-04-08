#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Single manifest: data/catalog.json

- Canonical persisted data: `works[]` (Dublin Core, Linked Art, site, artifacts).
- Sketch series order and file lists come from `sketches/index.html` (const SERIES) on each run.
- Installation-tier HTML is discovered from `works[]` plus any `installations/*.html` on disk.

Run after changing sketches/index.html SERIES or adding installation HTML:

  python3 _scripts/refresh_catalog.py

One-time migration from legacy artworks.json (if present):

  python3 _scripts/refresh_catalog.py --from-artworks

Then remove artworks.json from the repo.
"""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

from catalog_lib import (
    ROOT,
    INDEX,
    assign_catalog_numbers,
    attach_artifacts_to_works,
    build_works,
    merge_catalog_works,
    merge_installation_sources,
    parse_series_from_index,
    soundscapes_summary,
)

CATALOG = ROOT / "data" / "catalog.json"
LEGACY_ARTWORKS = ROOT / "artworks.json"
CANONICAL = "https://mark-walhimer.com"


def load_or_bootstrap_catalog(from_artworks: bool) -> dict:
    if from_artworks and LEGACY_ARTWORKS.exists():
        data = json.loads(LEGACY_ARTWORKS.read_text(encoding="utf-8"))
        installations = data.get("installations") or []
        sketch_series = data.get("sketches") or []
        works = build_works(installations, sketch_series, CANONICAL)
        return {
            "version": 2,
            "updated": date.today().isoformat(),
            "profile": "Walhimer Studio unified catalog. Canonical rows are works[].",
            "canonical_base": CANONICAL,
            "works": works,
        }

    if not CATALOG.exists():
        raise SystemExit(
            f"Missing {CATALOG}. Run with --from-artworks once if artworks.json exists, "
            "or copy data/catalog.json from the repo."
        )

    return json.loads(CATALOG.read_text(encoding="utf-8"))


def refresh_catalog(from_artworks: bool = False) -> None:
    catalog = load_or_bootstrap_catalog(from_artworks)
    catalog.pop("soundscapes", None)
    catalog.pop("installations", None)
    catalog.pop("sketches_emit_order", None)

    sketch_series: list = []
    if INDEX.exists():
        sketch_series = parse_series_from_index(INDEX.read_text(encoding="utf-8"))
    if not sketch_series and LEGACY_ARTWORKS.exists():
        legacy = json.loads(LEGACY_ARTWORKS.read_text(encoding="utf-8"))
        sketch_series = legacy.get("sketches") or []

    works_old = catalog.get("works") or []

    inst = merge_installation_sources(works_old, ROOT)
    if not inst and from_artworks and LEGACY_ARTWORKS.exists():
        legacy = json.loads(LEGACY_ARTWORKS.read_text(encoding="utf-8"))
        inst = legacy.get("installations") or []

    works_new = build_works(inst, sketch_series, catalog.get("canonical_base", CANONICAL))
    catalog["works"] = merge_catalog_works(works_old, works_new)
    assign_catalog_numbers(catalog["works"])

    attach_artifacts_to_works(ROOT, catalog["works"])

    # Soundscape rows are not persisted; derive from works (site.surfaces / site.soundscape).
    ss = soundscapes_summary(catalog["works"], catalog.get("canonical_base", CANONICAL))

    catalog["updated"] = date.today().isoformat()
    catalog["version"] = max(int(catalog.get("version") or 1), 2)
    catalog["profile"] = (
        "Walhimer Studio unified catalog. Canonical rows are works[]. "
        "Sketch series order comes from sketches/index.html on refresh; "
        "installation HTML is merged from works[] and installations/*.html. "
        "Soundscape list is derived from works, not stored separately."
    )

    # Stable key order for humans (works[] is large - keep it last).
    ordered = {
        "version": catalog["version"],
        "updated": catalog["updated"],
        "profile": catalog["profile"],
        "canonical_base": catalog.get("canonical_base", CANONICAL),
        "works": catalog["works"],
    }

    CATALOG.parent.mkdir(parents=True, exist_ok=True)
    CATALOG.write_text(
        json.dumps(ordered, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {CATALOG.relative_to(ROOT)}: "
        f"{len(inst)} installation paths, "
        f"{len(sketch_series)} sketch series, "
        f"{len(catalog['works'])} works "
        f"(derived soundscape rows: {len(ss['entries'])}, not stored in JSON)"
    )


def main() -> None:
    ap = argparse.ArgumentParser(description="Refresh data/catalog.json")
    ap.add_argument(
        "--from-artworks",
        action="store_true",
        help="Bootstrap from legacy artworks.json (one-time migration)",
    )
    args = ap.parse_args()
    refresh_catalog(from_artworks=args.from_artworks)


if __name__ == "__main__":
    main()
