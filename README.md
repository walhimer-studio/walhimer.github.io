# Mark Walhimer — artist site

**[mark-walhimer.com](https://mark-walhimer.com)** · GitHub Pages · repo: **[walhimer-studio/walhimer.github.io](https://github.com/walhimer-studio/walhimer.github.io)**

---

## Structure

Two tiers on the site, plus a JSON manifest and optional narrative archive pages.

| Location | Purpose |
|----------|---------|
| `index.html` (site root) | **Homepage** — featured carousel; live sketch embeds on desktop; still images + **tap-to-open** full piece on touch stills; iOS uses stills + links to reduce WebGL load. |
| `installations/` | Promoted work — pieces linked from the homepage |
| `studio/` | **Studio tooling** (OSC bridges, local scripts). **Not** a second catalog — see **[Studio tooling outside the catalog](docs/unified-catalog.md#studio-tooling-outside-the-catalog)** in **unified-catalog.md**. |
| `sketches/` | Full archive — HTML sketches by series, plus optional folders like `tezos-early-works/` (chronicle + images) |
| `sketches/index.html` | **Public catalog UI** — series list, search, filters (URL `/sketches/`). Legacy **SERIES** data used by refresh when `catalog-work.html` is still empty. |
| `sketches/catalog-work.html` | **Internal catalog workspace** (`noindex`, not in main nav). **`const SERIES`** feeds **`refresh_catalog.py`** when populated; includes a **sample entry template** (layout only). While **`SERIES`** is `[]`, refresh falls back to **`sketches/index.html`** so **`catalog.json`** does not drop sketches. **URL:** `/sketches/catalog-work.html` |
| `images/homepage-featured/` | **Homepage carousel stills** — `001.png`–`007.png` for the seven featured works (replacing live embeds on iOS/touch where needed). |
| `catalog-db.html` | **Collection DB viewer** — lightweight browser tool for `data/catalog.json` (search/filter/sort + Installation/Sketch/Linked Art links). |
| `sketches/mangle/` | **Mangle** — Tone.js sample player (Start / Pause / Stop / Record + local folder audition). Vendored `Tone.js` in `sketches/mangle/vendor/`. Live: **[mark-walhimer.com/sketches/mangle/](https://mark-walhimer.com/sketches/mangle/)** |
| `data/catalog.json` | **Single manifest** — canonical **`works[]`** only. Refresh merges **`SERIES`** from **`sketches/catalog-work.html`** (fallback: **`sketches/index.html`** when **`SERIES`** is empty) and **`installations/*.html`**. See **[docs/unified-catalog.md](docs/unified-catalog.md)**. |
| `docs/unified-catalog.md` | Full workflow, recovery notes, DC fields. |
| `docs/archive-chronicle.md` | How the sketch index, catalog workspace, and narrative archives relate to the manifest. |
| `docs/submission-and-series-structure.md` | **Prize / residency / event folders** — living workspace vs dated submission snapshots, naming, README template, catalog checklist. |
| `docs/bloom-inventory.md` | **Bloom** series: canonical paths under `sketches/bloom/`, redirect stubs, what stays outside (installations, Loop Miami, drafts). |

Site nav: **Selected Works · Catalog · Bio / CV · Contact**

Catalog footer includes a low-visibility link to **Collection DB** (`/catalog-db.html`).

**Organization profile** (GitHub): **[walhimer-studio/.github](https://github.com/walhimer-studio/.github)** — points here for archive docs.

---

## Workflow

### Add a new sketch

1. Add self-contained HTML under `sketches/`.
2. Register it in **`sketches/catalog-work.html`** → **`SERIES`** when that file is your source (or **`sketches/index.html`** while **`catalog-work`** is still empty).
3. Refresh the catalog: `python3 _scripts/refresh_catalog.py` (or `python3 _scripts/sync_artworks_json.py`), then commit **`data/catalog.json`** and push.
4. Push the repo.

### Promote a sketch to installation

1. Copy or place the file under `installations/` as needed.
2. Add cards in `index.html` and `installations/index.html`.
3. Run **`python3 _scripts/refresh_catalog.py`** so **`works[]`** and artifacts stay in sync (new HTML is picked up automatically; refine titles, dates, and **`site.tech`** in **`works[]`** if needed).
4. Push.

### Narrative archive (e.g. Tezos / Objkt phase)

1. Add a folder under `sketches/` (e.g. `sketches/your-series/index.html` + `assets/`).
2. Add one entry to **`SERIES`** in **`sketches/catalog-work.html`** (or **`sketches/index.html`** while the workspace **`SERIES`** is empty).
3. Run **`refresh_catalog.py`** (or **`sync_artworks_json.py`**), commit **`data/catalog.json`**, push.

### Push to GitHub

From your machine (repo path may differ):

```bash
cd ~/Documents/GitHub/walhimer.github.io
git status
git add -A
git status
git commit -m "Describe your change in a short sentence."
git push origin main
```

Confirm **`origin`** points at **`git@github-walhimer:walhimer-studio/walhimer.github.io.git`** (see **Git remote** below). After a successful push, **GitHub Pages** rebuilds the site from **`main`** in a minute or two.

Fast option (stages everything, commits, pushes):

```bash
cd ~/Documents/GitHub/walhimer.github.io
./_scripts/safe_publish.sh "Describe your change in a short sentence."
```

### Collection DB workflow

1. Keep `data/catalog.json` current via `python3 _scripts/refresh_catalog.py`.
2. Open `catalog-db.html` to browse/search/filter the collection as a mini database.
3. If links or labels need adjustment, update `catalog-db.html` only (no manifest schema change required).
4. Run `python3 _scripts/check_catalog_mirror.py` and `python3 _scripts/check_repo_layout.py` before commit to catch layout drift.
5. Run `python3 _scripts/check_self_contained.py` before commit — **all** published HTML must pass (or `_scripts/install_pre_commit_hook.sh` once).

---

## Self-contained rule

Published files should work offline — no required external CDNs or network for core behavior. Test with Wi‑Fi off when in doubt.

---

## Walhimer Studio (organization)

Studio protocols, tools, and related repos live under **[github.com/walhimer-studio](https://github.com/walhimer-studio)**. The org profile README summarizes the archive and links to **`docs/unified-catalog.md`** and **`docs/archive-chronicle.md`**.

---

## Checklist (maintainers)

1. After changing **`SERIES`** in **`sketches/catalog-work.html`** (or **`sketches/index.html`** when using fallback) or adding HTML under **`installations/`**, run **`python3 _scripts/refresh_catalog.py`** and commit **`data/catalog.json`**.
2. Verify sitemap/robots remain current for indexing (`robots.txt`, `sitemap.xml`, `page-sitemap.xml`).
3. Push **`walhimer.github.io`** so GitHub Pages and the public site stay in sync.
4. If you edit the org profile, push **`walhimer-studio/.github`** separately (another clone/repo).

Optional later: add marketplace or contract IDs under **`dublin_core.relation`** (or extra fields) so platform links are preserved in *your* manifest, not only on third-party sites.

---

## Git remote (this Mac)

Push with your SSH host alias (see `.cursor/rules/github-account-routing.mdc`):

```bash
git remote -v
# expect: git@github-walhimer:walhimer-studio/walhimer.github.io.git
```

---

*Updated April 2026.*
