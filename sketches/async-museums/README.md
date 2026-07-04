# Async Museums

**Catalog hub** — works published or submitted for [Async Museum](https://asyncmuseum.com). Structure guide: [Submission & series structure](../../docs/submission-and-series-structure.md).

**Do not copy artwork into this folder.** Canonical Bloom sketches live in `sketches/bloom/`.

## Live URL (hub)

https://mark-walhimer.com/sketches/async-museums/index.html

## Catalog position

**#4** in `sketches/index.html` → `SERIES`:

1. Artist Commons  
2. actz — June Myths & Legends 2026  
3. Loop Art Critique 2026  
4. **Async Museums**

## Works (canonical paths — not in this folder)

| Work | Path | Live URL |
|------|------|----------|
| Bloom / Release — Four Walls | `sketches/bloom/bloom-four-walls.html` | https://mark-walhimer.com/sketches/bloom/bloom-four-walls.html |

Also listed under **Bloom** series and Loop Art Critique 2026 bundle copy at `loop-art-critique-2026/bloom-four-walls.html`.

## External

| Link | URL |
|------|-----|
| Async Museum | https://asyncmuseum.com |

## GitHub

Path: `sketches/async-museums/`

## Change workflow

1. Update **this README**
2. Update hub + `SERIES` in `sketches/index.html`
3. `python3 _scripts/refresh_catalog.py` → commit `data/catalog.json`
4. Push

## Run locally

```bash
cd sketches/async-museums
python3 -m http.server 8765
```

Open http://localhost:8765/index.html
