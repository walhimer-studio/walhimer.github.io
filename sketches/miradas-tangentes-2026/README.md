# Miradas Tangentes (Tangent Gazes) · Madrid 2026

**Read this file first.** This README is the source of truth. **Do not copy artwork into this folder.**

**Event bundle** — Artlab Siroco, Madrid, **13 February 2026, 21h**. Structure guide: [Submission & series structure](../../docs/submission-and-series-structure.md).

Group show — NFT & creative programming. **Curated and Organized by Luz Otxoa** ([@luzotxoa](https://www.instagram.com/luzotxoa/)). Mark Walhimer — screens 6 & 9.

## Live URL (hub)

https://mark-walhimer.com/sketches/miradas-tangentes-2026/index.html

## What lives IN this folder (only)

| File | Role |
|------|------|
| `index.html` | Exhibition hub |
| `screen-6.html` | Screen 6 video player — **917 (around)** |
| `screen-9.html` | Screen 9 video player — **918 (forward)** |
| `assets/` | Posters + transcoded screen videos |
| `README.md` | This file |

Redirect stubs under `miradas-tangentes-2026/` point **out** to canonical artwork paths — do not register stubs as catalog works.

## What does NOT live in this folder

| Work | Canonical path | Live URL |
|------|----------------|----------|
| Miradas Tangentes — paired organisms | `sketches/miradas-tangentes.html` | https://mark-walhimer.com/sketches/miradas-tangentes.html |
| Surrender Machine — Madrid | `sketches/surrender/surrender-machine-madrid.html` | https://mark-walhimer.com/sketches/surrender/surrender-machine-madrid.html |
| Surrender Machine — Madrid v2 | `sketches/surrender/surrender-machine-madrid-v2 2.html` | https://mark-walhimer.com/sketches/surrender/surrender-machine-madrid-v2.html |
| Exhibition Auto-Sync template | `sketches/exhibition_autosync.html` | https://mark-walhimer.com/sketches/exhibition_autosync.html |

Hub **Enter the work** links use `../` paths to these files.

## Source of truth (Desktop)

| Item | Path |
|------|------|
| Exhibition copy spec | `Desktop/miradas-tangentes-2026-madrid/text.rtfd` |
| Source masters | `Desktop/miradas-tangentes-2026-madrid/` |

## Hub page (`index.html`) — scope

Per `text.rtfd`: posters, roster, Screen 6 & 9 copy, **Screens** list, **Enter the work** links (to paths above), README, catalog back-link.

### Roster formatting

`<div class="roster">` with one `<p>` per artist. No `<ul>`. Name and @ on same line. No divider lines.

---

## Catalog (`sketches/index.html` → Miradas Tangentes — Madrid 2026)

**In folder:** `index.html`, `screen-6.html`, `screen-9.html`, assets, `README.md`

**At repo root (same series block, not in folder):**

- `miradas-tangentes.html`
- `exhibition_autosync.html`
- `surrender/surrender-machine-madrid.html`
- `surrender/surrender-machine-madrid-v2 2.html`

Do **not** register `miradas-tangentes-2026/miradas-tangentes.html` or other folder stubs.

After changes: `python3 _scripts/refresh_catalog.py` → commit `data/catalog.json`.

## Redirects

| Path | Points to |
|------|-----------|
| `miradas-tangentes-2026/miradas-tangentes.html` | `../miradas-tangentes.html` |
| `miradas-tangentes-2026/surrender-machine-madrid.html` | `../surrender/surrender-machine-madrid.html` |
| `miradas-tangentes-2026/surrender-machine-madrid-v2.html` | `../surrender/surrender-machine-madrid-v2 2.html` |
| `miradas-tangentes-2026/exhibition_autosync.html` | `../exhibition_autosync.html` |
| `sketches/surrender-machine-madrid.html` | `surrender/surrender-machine-madrid.html` |
| `sketches/surrender-machine-madrid-v2.html` | `surrender/surrender-machine-madrid-v2 2.html` |

## Change workflow

1. Update **this README**
2. Edit hub / catalog to match
3. `refresh_catalog.py` + `check_self_contained.py`
4. Push

**Never copy artwork into `miradas-tangentes-2026/` again.**

## Run locally

```bash
cd sketches/miradas-tangentes-2026
python3 -m http.server 8765
```

Open http://localhost:8765/index.html
