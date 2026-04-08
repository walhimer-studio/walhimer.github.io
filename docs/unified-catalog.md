# Unified catalog (`data/catalog.json`)

There is **one** persisted dataset: **`works[]`** - each row is a work with **Dublin Core**, **Linked Art**, **`site`** (surfaces such as installation / sketch / soundscape), and **`artifacts`** for recovery.

**Refresh inputs** (not stored as top-level JSON arrays):

- **Sketch series + file order** - read from **`const SERIES`** in `sketches/index.html` on every run.
- **Installation-tier HTML** - merged from existing **`works[]`** rows that have **`site.installation`**, plus any new **`installations/*.html`** files on disk (excluding `installations/index.html` and auxiliary `*-artwork.html` embeds).

**Soundscapes** are **not** a separate block in JSON. Filter **`works`** where **`soundscape`** appears in **`site.surfaces`** (or **`site.soundscape`** is set). The refresh script logs how many such rows exist; optional **`site.soundscape.public_url`** can point at **`/audio/`** when you mirror pieces there.

**`artworks.json` has been removed**; do not reintroduce a second manifest.

## Workflow

### After changing sketch listings

1. Edit **`SERIES`** in `sketches/index.html`.
2. Run:

   ```bash
   python3 _scripts/refresh_catalog.py
   ```

   The legacy name **`sync_artworks_json.py`** calls the same refresh.

3. Commit **`data/catalog.json`** and push.

Refresh **merges** your existing Dublin Core / Linked Art edits into rebuilt rows (matched by work id or sketch file).

### Collection DB viewer

- **`catalog-db.html`** is a lightweight browser view over **`data/catalog.json`** for collection management.
- It supports search/filter/sort and links out to installation, sketch, and linked-art URLs.
- It is intentionally low-visibility on the public site (linked from the Catalog footer, not primary nav).

### After changing installations

1. Add or change files under **`installations/`** (and update homepage cards in HTML as needed).
2. Run **`python3 _scripts/refresh_catalog.py`** so **`works`**, **`surfaces`**, and **`artifacts`** stay aligned. Edit **`works[]`** in **`data/catalog.json`** for titles, dates, **`site.installation.homepage`**, **`site.tech`**, etc.

### One-time migration from an old `artworks.json`

If you still have a copy of the legacy file in the repo root:

```bash
python3 _scripts/refresh_catalog.py --from-artworks
```

Then delete **`artworks.json`** and commit.

## Disaster recovery (stolen laptop)

- **Source of truth for files:** this Git repository. If you **commit and push** sketches, installations, images, and `data/catalog.json`, you can **`git clone`** on a new machine and have everything.
- **`artifacts.repo_paths`** lists repo-relative paths for each work's HTML and **local** linked assets. Folders like `sketches/tezos-early-works/` are listed as a **full subtree** (HTML + `assets/` images).
- **`artifacts.external_urls`** records CDN or external links (e.g. p5.js on cdnjs) so you know what was not stored in-repo; consider vendoring critical libraries if you want zero external dependency for recovery.

## Dublin Core (`dublin_core`)

| Field | Role |
|-------|------|
| `title` | Work title |
| `creator` | Creator string |
| `date` | Date or range |
| `description` | Short description |
| `identifier` | Stable **URN** (same as work `id`) - does not encode series |
| `catalog_number` | Accession-style code **`WS-000001`** - **`WS-NNNNNN`** - series-independent; stable across refresh once assigned; new works get the next free number |
| `type` | e.g. `InteractiveResource` |
| `format` | e.g. `text/html` |
| `language` | e.g. `en` |
| `relation` | Related resource URIs |

## Linked Art

Each work includes **`linked_art`**: JSON-LD with `@context`, `id`, `type` (`HumanMadeObject`), `_label`, and a starter `classified_as`. Extend toward CIDOC-CRM / Linked Art as needed.

## Export elsewhere

Map `dublin_core.*` and identifiers to CSV for Omeka, CollectiveAccess, or spreadsheets; keep `artifacts` as a column or sidecar if you need a file manifest for migration.
