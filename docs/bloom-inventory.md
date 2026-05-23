# Bloom series — inventory & folder system

**Canonical sketch tree:** everything listed for the **Bloom** series in `SERIES` should live under **`sketches/bloom/`** (plus optional redirect stubs at `sketches/` root for old URLs).

**Last consolidated:** 2026-04-20 — `bloom-release-cathedral` moved into `sketches/bloom/bloom-release-cathedral/`; **Bloom Release Cathedral** merged into the **Bloom** series block in `sketches/index.html`.

---

## Under `sketches/bloom/` (canonical)

| Path | Role |
|------|------|
| `index.html` | Bloom — series index (links to all sketches in this folder; also first row under **Bloom** in `sketches/index.html`) |
| `bloom.html` | Bloom — radial gradient |
| `bloom-four-walls.html` | Bloom / Four Walls (large sketch) |
| `bloom-release.html` | Bloom / Release |
| `bloom-garden.html` | Bloom Garden |
| `bloom-surrender.html` | Bloom Surrender |
| `radial-gradient.html` | Radial Gradient |
| `installation-builder-bloom.html` | Installation Builder |
| `orchestrator-bloom.html` | Orchestrator — Bloom |
| `bloom-release-cathedral/index.html` | Bloom Release Cathedral (WebGL + local `tedagame-pentatonic/*.ogg`) |
| `bloom-release-cathedral/tedagame-pentatonic/*.ogg` | Local audio samples |

---

## Redirect stubs (`sketches/` root, not duplicates)

These are **small HTML files** (~600 bytes) that **redirect** to the canonical file under `bloom/`. Keep them so old bookmarks and links keep working:

- `bloom.html` → `bloom/bloom.html`
- `bloom-four-walls.html` → `bloom/bloom-four-walls.html`
- `bloom-release.html` → `bloom/bloom-release.html`
- `bloom-garden.html` → `bloom/bloom-garden.html`
- `bloom-surrender.html` → `bloom/bloom-surrender.html`
- `installation-builder-bloom.html` → `bloom/installation-builder-bloom.html`
- `orchestrator-bloom.html` → `bloom/orchestrator-bloom.html`

---

## Old Bloom Release Cathedral URL

- **Previous:** `/sketches/bloom-release-cathedral/` (full bundle)
- **Now:** `/sketches/bloom/bloom-release-cathedral/`
- **Stub:** `/sketches/bloom-release-cathedral/index.html` redirects to the new path (folder otherwise empty).

---

## Not under `sketches/bloom/` (by design)

| Location | Why |
|----------|-----|
| **`installations/bloom-*.html`** | Installation-tier pages; stay in `installations/`. Catalog links **sketches** under `bloom/` to these where applicable. |
| **`sketches/loop-art-critique-2026/*bloom*`** | Bundle / critique copies for Loop Art Critique 2026 — separate “chapter”; still listed under **Loop Art Critique 2026** in `SERIES`. |
| **`drafts/bloom-*`** | Drafts and previews; prune or promote into `sketches/bloom/` when ready. |

---

## Pruning (your next step)

1. Compare **draft** cathedral vs **`bloom/bloom-release-cathedral`** — merge or delete duplicates.
2. Decide whether **Loop Miami** Bloom copies stay duplicated or become links only.
3. Remove redirect stubs **only** after you are sure no external links use the old paths (optional; stubs are cheap to keep).

---

## Catalog

- **`SERIES`:** **Bloom** block in `sketches/index.html` (and later `catalog-work.html`) lists `bloom/...` paths.
- Refresh: `python3 _scripts/refresh_catalog.py` then commit `data/catalog.json`.
