# Artist Commons

**Living workspace** — Artist Commons residency. Structure guide: [Submission & series structure](../../docs/submission-and-series-structure.md).

Mac + gigabit switch + Pi LED / touch object pipeline. PoC video and documentation for interview and build continuity — not a frozen submission folder unless you snapshot a dated copy later.

## Live URL (hub)

https://mark-walhimer.com/sketches/artist-commons/index.html

## Works

| File | Live URL |
|------|----------|
| `walhimer-artist-commons-deck.html` | https://mark-walhimer.com/sketches/artist-commons/walhimer-artist-commons-deck.html |

## External

| Link | URL |
|------|-----|
| Artist Commons program | https://www.artistcommons.art/ |
| Apply | https://www.artistcommons.art/apply |

## Opportunity

| Field | Value |
|-------|--------|
| Program | [Artist Commons](https://www.artistcommons.art/) |
| Cohort | Summer 2026 |
| Folder | `sketches/artist-commons/` |
| Status | Interview / application stage |
| Related build docs | `machine-aesthetic/docs/RESOLVED-DIRECTION.md` |

## GitHub

Repo: [walhimer-studio/walhimer.github.io](https://github.com/walhimer-studio/walhimer.github.io)

Path: `sketches/artist-commons/`

## Catalog entries

Register in **`sketches/index.html`** → **`Artist Commons`** series (top of catalog). After adding files:

1. Update this README — paths + live URLs
2. Update `index.html` file list
3. `python3 _scripts/refresh_catalog.py` → commit `data/catalog.json`
4. `python3 _scripts/check_self_contained.py`
5. Push

## Likely sources elsewhere in the repo

| Work / doc | Path |
|------------|------|
| Surrender Machines project | `machine-aesthetic/docs/SURRENDER-MACHINES-PROJECT.md` |
| Resolved direction | `machine-aesthetic/docs/RESOLVED-DIRECTION.md` |
| Surrender Machines (sketch) | `sketches/surrender/` |
| Living Commons (separate series) | `sketches/living-commons.html` |

Copy into this folder only when you want a residency-specific entry URL — do not move canonical artwork without updating this README first.

## Run locally

```bash
cd sketches/artist-commons
python3 -m http.server 8765
```

Open http://localhost:8765/index.html
