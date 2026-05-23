# Walhimer Studio - archive chronicle

This document describes how **generative work, the public site, and the manifest** fit together. It is meant for the **[Walhimer Studio](https://github.com/walhimer-studio)** organization and for anyone maintaining **[mark-walhimer.com](https://mark-walhimer.com)** (repo: [`walhimer-studio/walhimer.github.io`](https://github.com/walhimer-studio/walhimer.github.io)).

---

## What "archive" means here

There are **three** layers to the story (plus a **registration** shortcut table):

### 1. Catalog index (public, searchable)

- **URL:** [mark-walhimer.com/sketches/](https://mark-walhimer.com/sketches/) (or `/sketches/index.html`)
- **Role:** The **public** archive of sketch files: every HTML entry is listed by **series**, with **search**, **expand/collapse**, and filters (All / Works only / Versions).
- **Manifest refresh:** Sketch order for **`data/catalog.json`** is read from **`const SERIES`** in **`sketches/catalog-work.html`**. While that array is **empty**, the refresh script uses the legacy **`SERIES`** in **`sketches/index.html`** so rows are not dropped. When you populate **`catalog-work.html`**, copy the full **`SERIES`** from the index first, then edit—otherwise only listed series appear in the manifest.
- **Internal workspace:** **`sketches/catalog-work.html`** (`noindex`) — layout experiments and a **sample catalog entry** (HTML only; not a second JSON manifest). Not linked from primary nav.

### 1b. Where to register new sketches (summary)

| You are… | Edit **`SERIES` in…** |
|----------|------------------------|
| Still using empty **`catalog-work`** | **`sketches/index.html`** (legacy; drives refresh via fallback) |
| Ready to own the new list | **`sketches/catalog-work.html`** (then refresh no longer uses empty fallback for sketches) |

- **Collection DB access:** Catalog footer includes a low-visibility link to `/catalog-db.html` for internal-style browsing.

### 2. `data/catalog.json` (single manifest)

- **Role:** The **only** JSON manifest: canonical **`works[]`** (Dublin Core + Linked Art + **`artifacts`**). Sketch series order comes from **`sketches/catalog-work.html`** on refresh, with **fallback** to **`sketches/index.html`** when **`catalog-work`** has an empty **`SERIES`**. Installation HTML is merged from **`works[]`** plus **`installations/*.html`** on disk. Soundscape pieces are rows in **`works`** (not a duplicate list).
- **Sketches list:** Refreshed by the same script; do **not** hand-edit long file lists in JSON — edit **`SERIES`** in **`catalog-work.html`** (or **`index.html`** while using fallback) instead.
- **Details:** See **[unified-catalog.md](./unified-catalog.md)**.

```bash
cd ~/Documents/GitHub/walhimer.github.io
python3 _scripts/refresh_catalog.py
```

That rebuilds **`works`** from **`SERIES`** + installation paths (merged from **`works[]`** and **`installations/*.html`**), preserves your metadata edits, and refreshes **`artifacts`**. The legacy script name **`sync_artworks_json.py`** runs the same refresh.

### 3. Narrative archive pages (chronicle + images)

- **Role:** Long-form **chronological** pages (text + images) for a phase of work, e.g. early Tezos / Objkt pieces.
- **Example:** `sketches/tezos-early-works/index.html` with assets under `sketches/tezos-early-works/assets/`.
- **Role:** Complements the index: the index lists **files**; narrative pages explain **progression** and show **stills**.

These are **not** nested Git repos; they are folders in the site repo, linked from the Catalog index like any other entry.

### 4. Prize, residency, and event bundles

- **Role:** **Frozen snapshots** for a specific opportunity (Lumen Prize, Loop Miami, ARS, etc.) — separate from the **living workspace** where you keep developing.
- **Naming:** `{year}-{opportunity}-{project}` (e.g. `2026-lumen-prize-machine-aesthetic`) or `{event}-{year}` (e.g. `loop-miami-2026`).
- **Public entry URL:** descriptive filename (e.g. `seed-77823-rooms.html`), not internal build names.
- **Details:** See **[submission-and-series-structure.md](./submission-and-series-structure.md)**.

---

## Workflow (short)

| Step | Action |
|------|--------|
| Add a sketch file | Put self-contained HTML in `sketches/` (per site rules: works offline). |
| Register it | Add it to **`SERIES`** in **`sketches/catalog-work.html`** (or **`sketches/index.html`** while **`catalog-work`** is still empty). |
| Sync catalog | Run `python3 _scripts/refresh_catalog.py`, then commit `data/catalog.json`. |
| Promote to installation | Copy to `installations/`, update homepage cards, run **`refresh_catalog.py`**, then edit **`works[]`** in `data/catalog.json` if you need custom titles or dates. |
| Push | `git add`, `git commit`, `git push` to `main`. |

---

## GitHub backup

What is backed up for the site is whatever is **committed and pushed** to **`walhimer-studio/walhimer.github.io`**. Local-only files on a laptop are not on GitHub until you push.

---

## For the GitHub organization profile

To show an **Archive** section on **[github.com/walhimer-studio](https://github.com/walhimer-studio)**:

1. Open the org's **`.github`** repository: [`walhimer-studio/.github`](https://github.com/walhimer-studio/.github).
2. Edit **`profile/README.md`** (see [GitHub docs: custom organization profile](https://docs.github.com/en/organizations/creating-a-custom-profile-page-for-your-organization)).
3. Add a section (you can copy the **"What archive means here"** and **Workflow** summaries above, or link to this file in the website repo):

   - Raw / permanent link to this doc on GitHub:  
     `https://github.com/walhimer-studio/walhimer.github.io/blob/main/docs/archive-chronicle.md`

That keeps the chronicle in the **website repo** as the canonical doc and lets the org page point to it or mirror a short blurb.

---

*Walhimer Studio - generative art, protocols, and interactive tools.*
