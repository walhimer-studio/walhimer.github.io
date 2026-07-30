# Loop Art Critique Alumni Show #3 · July 2026

**Catalog hub** — ICA Miami alumni exhibition (*Technological Counterproduction*), Loop cohort #21. Structure guide: [Submission & series structure](../../docs/submission-and-series-structure.md).

**Do not copy artwork into this folder.** Canonical Surrender Machine alumni piece lives in `sketches/loop-art-critique-2026/loop-21-surrender-machine/`.

## Live URL (hub)

https://mark-walhimer.com/sketches/loop-art-critique-alumni-show-2026/index.html

## Participatory gallery (Family Reunion)

| Deploy | URL |
|--------|-----|
| Bloom four walls + Firebase (gallery / monitor) | https://mark-walhimer.com/netlify/loop-family-reunion-2026-gallery/ |
| Phone upload (same room) | https://mark-walhimer.com/netlify/loop-family-reunion-2026-phone/ |
| Flat wall (earlier) | https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-2/public/ |

Firebase project: `loop-gallery-family-reunion-3` · room: `family-reunion-friday-2`

Monitor QR → phone URL above (generated at runtime). Catalog: [loop-family-reunion-co-create-gallery.md](../../catalog/loop-art-critique-alumni-show-2026/loop-family-reunion-co-create-gallery.md).

## Works (canonical paths — not in this folder)

| Work | Status | Path |
|------|--------|------|
| **Loop Family Reunion — Co-Create gallery** | Live | [catalog](../../catalog/loop-art-critique-alumni-show-2026/loop-family-reunion-co-create-gallery.md) · [gallery README](../../netlify/loop-family-reunion-2026-gallery/README.md) |
| Surrender Machine — Loop 21 | Live | `sketches/loop-art-critique-2026/loop-21-surrender-machine/index.html` |
| Loop 21 surrender wall notes | Live | `sketches/loop-art-critique-2026/LOOP-21-SURRENDER-WALL.md` |
| **Loop Alumni Show — Invisible Layer** | **Concept / POC** | [catalog concept](../../catalog/loop-art-critique-alumni-show-2026/loop-alumni-show-invisible-layer-concept.md) · [POC](loop-alumni-show-invisible-layer-poc.html) |

## Assets (in this folder)

| Asset | Path |
|-------|------|
| Family Reunion poster | `assets/family-reunion-poster.png` |

## Context

| Field | Value |
|-------|--------|
| Show | Loop Art Critique Alumni Show #3 |
| Family Reunion | Loop Art Critique online · July 31 – August 2, 2026 |
| Venue | ICA Miami · Loop Metaverse (Onland) |
| Run | June 11 – October 5, 2026 |
| Opening | July 3, 2026 |
| Curator | Doreen A. Ríos |

## Change workflow

1. Update **this README**
2. Update hub + `SERIES` in `sketches/index.html`
3. `python3 _scripts/reorder_series_by_index_mtime.py`
4. `python3 _scripts/refresh_catalog.py` → commit `data/catalog.json`
5. `python3 _scripts/check_catalog_mirror.py` + `check_catalog_sync.py` + `check_self_contained.py`
6. Push

Repo-root `loop-art-critique-alumni-show-2026/index.html` is a **redirect stub** to this folder only.
