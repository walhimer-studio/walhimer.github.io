# Miradas Tangentes (Tangent Gazes) · Madrid 2026

**Read this file first.** This README is the source of truth for this folder. Do not move files, edit the hub, or touch the catalog until this document matches what you are about to ship.

**Event bundle** — Artlab Siroco, Madrid, **13 February 2026, 21h**. Structure guide: [Submission & series structure](../../docs/submission-and-series-structure.md).

Group show — NFT & creative programming. **Curated and Organized by Luz Otxoa** ([@luzotxoa](https://www.instagram.com/luzotxoa/)). Mark Walhimer — screens 6 & 9.

## Live URL (hub)

https://mark-walhimer.com/sketches/miradas-tangentes-2026/index.html

## Source of truth (Desktop)

| Item | Path |
|------|------|
| Exhibition copy spec | `Desktop/miradas-tangentes-2026-madrid/text.rtfd` |
| Source masters | `Desktop/miradas-tangentes-2026-madrid/` |
| Mark promo poster | `625256828_…jpg` → `assets/miradas-tangentes-mark-walhimer-poster.jpg` |
| Show static poster | `miradasestatic.png` → `assets/miradasestatic.png` |
| Screen 6 video | `06_01_Mark_Walhimer.mp4` → `assets/06-01-mark-walhimer.mp4` |
| Screen 9 video | `P9_01_Mark_Walhimer.mp4` → `assets/09-01-mark-walhimer.mp4` |

## Opportunity

| Field | Value |
|-------|--------|
| Title | Miradas Tangentes (Tangent Gazes) |
| Venue | Artlab Siroco, c/ San Dimas 3, Madrid |
| Date | 13 February 2026, 21h |
| Curator / organizer | Luz Otxoa — [@luzotxoa](https://www.instagram.com/luzotxoa/) |
| Folder | `sketches/miradas-tangentes-2026/` |

## GitHub

Repo: [walhimer-studio/walhimer.github.io](https://github.com/walhimer-studio/walhimer.github.io)

Path: `sketches/miradas-tangentes-2026/`

---

## Hub page (`index.html`) — exact scope

**Authority:** `Desktop/miradas-tangentes-2026-madrid/text.rtfd`

The hub is the **public exhibition page only**. It contains **exactly** these sections, in this order:

1. Kicker — `Catalog · Miradas Tangentes · 13 February 2026`
2. Title — `Miradas Tangentes`
3. Lede — Artlab Siroco, 13 Feb 2026 21h, NFT & creative programming, **Curated and Organized by Luz Otxoa**, links to main catalog + Bio/CV
4. Poster — `assets/miradas-tangentes-mark-walhimer-poster.jpg`
5. Poster — `assets/miradasestatic.png` + caption (San Dimas 3, 13.02.26, 21h)
6. **Miradas Tangentes — group show artists**
   - Line: Mark Walhimer — screens 6 & 9: *917 (around)*, *918 (forward)*
   - Artist roster (see below)
7. **Screen 6 — 917 (around)** — description + links to `screen-6.html` + Manifold
8. **Screen 9 — 918 (forward)** — description + links to `screen-9.html` + Manifold
9. **Screens** — `screen-6.html`, `screen-9.html`
10. **Enter the work** — `miradas-tangentes.html`, `surrender-machine-madrid.html`, `surrender-machine-madrid-v2.html`
11. **Exhibition tools** — `exhibition_autosync.html`
12. README link
13. ← Full catalog

### Do NOT put on the hub

- “Tangent Gazes” subtitle
- Venue meta block
- Extra sections invented by agents

Sketch descriptions belong in the **Enter the work** links — not as duplicate prose blocks on the hub.

### Roster formatting (hub)

Simple list — one artist per `<p>`, no `<ul>`. Name and @ handle on the same line, e.g. `Gaudi Ramone (@gaudiramone)`. No divider lines.

Use `<div class="roster">` with `<p>` lines — **not** `<ul><li>` (global catalog list styles break roster layout).

Roster copy:

```
Gaudi Ramone (@gaudiramone)
Pedro Pitillas (@piti2048)
Luiz André Gama (@luizandregama)
Rapha Mey (@rapha_nyc)
Solize / Zilian Robin (@ZilianRobin)
Luz Otxoa (@luzotxoa) organizer
Edux (@eduxdux_)
Mark Walhimer (@WalhimerArt) screens 6, 9
```

---

## Catalog entries (canonical paths)

All Madrid show files live in **this folder**. Register **only** these paths in `sketches/index.html` → **`Miradas Tangentes — Madrid 2026`**. Do **not** duplicate under Surrender Machines — old URLs are redirect stubs.

| File | Role | Live URL |
|------|------|----------|
| `index.html` | Exhibition hub (see scope above) | https://mark-walhimer.com/sketches/miradas-tangentes-2026/index.html |
| `screen-6.html` | Screen 6 — **917 (around)** video player | https://mark-walhimer.com/sketches/miradas-tangentes-2026/screen-6.html |
| `screen-9.html` | Screen 9 — **918 (forward)** video player | https://mark-walhimer.com/sketches/miradas-tangentes-2026/screen-9.html |
| `assets/06-01-mark-walhimer.mp4` | Screen 6 video (1080×1920 · ~63s loop) | — |
| `assets/09-01-mark-walhimer.mp4` | Screen 9 video (1080×1920 · ~94s loop) | — |
| `assets/miradas-tangentes-mark-walhimer-poster.jpg` | Mark Walhimer promo poster | — |
| `assets/miradasestatic.png` | Show static poster | — |
| `miradas-tangentes.html` | Miradas Tangentes — paired organisms (1080×1920 · 3 min loop) | https://mark-walhimer.com/sketches/miradas-tangentes-2026/miradas-tangentes.html |
| `surrender-machine-madrid.html` | Surrender Machine — Madrid lifecycle edition | https://mark-walhimer.com/sketches/miradas-tangentes-2026/surrender-machine-madrid.html |
| `surrender-machine-madrid-v2.html` | Surrender Machine — Madrid v2 | https://mark-walhimer.com/sketches/miradas-tangentes-2026/surrender-machine-madrid-v2.html |
| `exhibition_autosync.html` | Exhibition Auto-Sync template | https://mark-walhimer.com/sketches/miradas-tangentes-2026/exhibition_autosync.html |
| `README.md` | This file | — |

### Screen 6 — 917 (around)

Meditative translucency and orbital motion. Twelve WebGL boxes in a vertical void.

- Manifold: https://manifold.xyz/@markwalhimer/id/4109553904

### Screen 9 — 918 (forward)

Wavering translucent progression; breathing monoliths in a generative corridor.

- Manifold: https://manifold.xyz/@markwalhimer/id/4109555952

Web videos transcoded from Desktop masters (2160×3840 HEVC).

## Redirects (stubs — not catalog entries)

| Old path | Redirects to |
|----------|----------------|
| `sketches/miradas-tangentes.html` | `miradas-tangentes-2026/miradas-tangentes.html` |
| `sketches/exhibition_autosync.html` | `miradas-tangentes-2026/exhibition_autosync.html` |
| `sketches/surrender-machine-madrid.html` | `miradas-tangentes-2026/surrender-machine-madrid.html` |
| `sketches/surrender-machine-madrid-v2.html` | `miradas-tangentes-2026/surrender-machine-madrid-v2.html` |
| `sketches/surrender/surrender-machine-madrid.html` | `miradas-tangentes-2026/surrender-machine-madrid.html` |
| `sketches/surrender/surrender-machine-madrid-v2 2.html` | `miradas-tangentes-2026/surrender-machine-madrid-v2.html` |

`sketches/surrender/index.html` links to this folder for Madrid editions — does not list them as files in `sketches/surrender/`.

---

## Change workflow (mandatory)

1. **Update this README first** — paths, hub scope, roster, copy.
2. **Then** edit `index.html` to match this README and `text.rtfd`.
3. **Then** update `SERIES` in `sketches/index.html` if files changed.
4. Run `python3 _scripts/refresh_catalog.py` → commit `data/catalog.json`.
5. Run `python3 _scripts/check_self_contained.py` — must pass.
6. Push.

**Do not:** move artwork without updating this README; add hub sections not listed above; register Madrid files under Surrender Machines; edit sketch bodies without explicit `AUTHORIZE EDIT`.

## Run locally

```bash
cd sketches/miradas-tangentes-2026
python3 -m http.server 8765
```

Open http://localhost:8765/index.html
