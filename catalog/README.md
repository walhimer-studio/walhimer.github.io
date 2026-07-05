# Catalog — Mark Walhimer archive

**Public archive** of works. Each entry is a folder; each folder has a **markdown file for that folder**. Artworks add a **markdown file for the artwork**. Work in progress (HTML, code) lives in the matching path under **`sketches/`** until a piece is canonical → **`installations/`** and/or homepage.

Repo: [walhimer-studio/walhimer.github.io](https://github.com/walhimer-studio/walhimer.github.io) · Site: [mark-walhimer.com](https://mark-walhimer.com)

---

## Studio direction (all artwork)

**Every catalog entry follows one pipeline:** Machine DNA · title + seed · lifeline · sketch → ship → publish. Votive witness or surrender mirror — not all pieces are interactive. **Publish gate:** every public HTML file must be self-contained — full repo passes `python3 _scripts/check_self_contained.py` before commit (see artwork pipeline checklist).

| | |
|--|--|
| **Living checklist (site)** | [Artwork pipeline](https://mark-walhimer.com/practice/artwork-pipeline.html) — updated ongoing |
| **Catalog summary** | [STUDIO-DIRECTION.md](./STUDIO-DIRECTION.md) |

When you write `{artwork}.md`, align with that direction (seed, species, mode, bodies). New series and submissions still use [docs/submission-and-series-structure.md](../docs/submission-and-series-structure.md).

---

## Structure (same for every entry)

```
catalog/
├── README.md                 ← this file — the catalog section
└── {folder}/
    ├── README.md             ← markdown for this folder
    ├── {subfolder}/          ← optional (series, opportunity, year, …)
    │   ├── README.md         ← markdown for this folder
    │   ├── {artwork}.md      ← artwork statement (when applicable)
    │   └── …
    └── …

sketches/{same-path}/        ← WIP code (mirrors catalog project folders)
```

**When you start a new work:** read [STUDIO-DIRECTION.md](./STUDIO-DIRECTION.md) and the [artwork pipeline](https://mark-walhimer.com/practice/artwork-pipeline.html). Create a folder under `catalog/` and write its folder `README.md` (or `index.html` when the folder hub is HTML). Add `{artwork}.md` when the piece has a name. Add WIP files under `sketches/{same-path}/`.

---

## Catalog order (newest first)

Series on the [public catalog](../sketches/index.html) and the **Entries** table below stay in sync.

| Rule | Detail |
|------|--------|
| **Series order** | Newest → oldest by **mtime of the catalog folder index file** |
| **Index file** | `catalog/{folder}/index.html` when present; until then `README.md` |
| **Files in a series** | Newest → oldest by file mtime |
| **Refresh** | `python3 _scripts/reorder_series_by_index_mtime.py` then `python3 _scripts/refresh_catalog.py` |

After every catalog folder has an `index.html`, the sort key is always that file — not the sketches mirror alone.

---

## Entries

Ordered **newest first** by catalog folder index file mtime (see `_scripts/reorder_series_by_index_mtime.py`).

| Folder | Description |
|--------|-------------|
| [the-wrong-biennale/](./the-wrong-biennale/) | The Wrong Biennale — submissions and opportunities |
| [the-wrong-biennale/the-wrong-eclipse-august-2026/](./the-wrong-biennale/the-wrong-eclipse-august-2026/) | The Wrong Biennale — The Wrong Eclipse · August 2026 · *Holes in the Sky* |
