# Mark Walhimer — artist site

**[mark-walhimer.com](https://mark-walhimer.com)** · GitHub Pages · repo: **[walhimer-studio/walhimer.github.io](https://github.com/walhimer-studio/walhimer.github.io)**

---

## Structure

Two tiers on the site, plus a JSON manifest and optional narrative archive pages.

| Location | Purpose |
|----------|---------|
| `installations/` | Promoted work — pieces linked from the homepage |
| `sketches/` | Full archive — HTML sketches by series, plus optional folders like `tezos-early-works/` (chronicle + images) |
| `sketches/index.html` | **Catalog UI** — series list, search, filters (**single source of truth** for sketch filenames; URL path remains `/sketches/`) |
| `data/catalog.json` | **Single manifest** — canonical **`works[]`**; **`installations`** and **`sketches_emit_order`** are editing views aligned on refresh; soundscape works are identified in **`works`** (no separate soundscapes section). See **[docs/unified-catalog.md](docs/unified-catalog.md)**. |
| `docs/unified-catalog.md` | Full workflow, recovery notes, DC fields. |
| `docs/archive-chronicle.md` | How the sketch index and narrative archives relate to the manifest. |

Site nav: **Recent · Catalog · Bio / CV · Contact**

**Organization profile** (GitHub): **[walhimer-studio/.github](https://github.com/walhimer-studio/.github)** — points here for archive docs.

---

## Workflow

### Add a new sketch

1. Add self-contained HTML under `sketches/`.
2. Register it in **`sketches/index.html`** → **`SERIES`** array (correct series and file row).
3. Refresh the catalog: `python3 _scripts/refresh_catalog.py` (or `python3 _scripts/sync_artworks_json.py`), then commit **`data/catalog.json`** and push.
4. Push the repo.

### Promote a sketch to installation

1. Copy or place the file under `installations/` as needed.
2. Add cards in `index.html` and `installations/index.html`.
3. Edit **`data/catalog.json`** — top-level **`installations`** array (slug, path, dates, tech, etc.), then run **`python3 _scripts/refresh_catalog.py`** so **`works`** and artifacts stay in sync.
4. Push.

### Narrative archive (e.g. Tezos / Objkt phase)

1. Add a folder under `sketches/` (e.g. `sketches/your-series/index.html` + `assets/`).
2. Add one entry to **`SERIES`** in `sketches/index.html` so it appears in search and the archive list.
3. Run **`refresh_catalog.py`** (or **`sync_artworks_json.py`**), commit **`data/catalog.json`**, push.

### Push

```bash
cd ~/Documents/GitHub/walhimer.github.io
git add .
git status
git commit -m "Description of change"
git push origin main
```

---

## Self-contained rule

Published files should work offline — no required external CDNs or network for core behavior. Test with Wi‑Fi off when in doubt.

---

## Walhimer Studio (organization)

Studio protocols, tools, and related repos live under **[github.com/walhimer-studio](https://github.com/walhimer-studio)**. The org profile README summarizes the archive and links to **`docs/unified-catalog.md`** and **`docs/archive-chronicle.md`**.

---

## Checklist (maintainers)

1. After changing **`SERIES`** in `sketches/index.html` or **`installations`** in `data/catalog.json`, run **`python3 _scripts/refresh_catalog.py`** and commit **`data/catalog.json`**.
2. Push **`walhimer.github.io`** so GitHub Pages and the public site stay in sync.
3. If you edit the org profile, push **`walhimer-studio/.github`** separately (another clone/repo).

Optional later: add marketplace or contract IDs under **`dublin_core.relation`** (or extra fields) so platform links are preserved in *your* manifest, not only on third-party sites.

---

*Updated April 2026.*
