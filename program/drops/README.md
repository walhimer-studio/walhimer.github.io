# Daily drops

One folder per drop date: `YYYY-MM-DD/drop.json`.

Schema: [../drops.schema.json](../drops.schema.json)

## Publish flow

1. Generate art → save sketch under `sketches/` (unchanged paths).
2. Write `drop.json` with `status: approved` (or `pending_review`).
3. After pin + mint: set `status: published`, `availability: available` or `minted`.
4. Run:

```bash
node program/scripts/build-work-pages.mjs
```

That merges drops into `data/available-works.json` and generates:

- `/available/index.html` (list)
- `/works/ws-NNNNNN/index.html` (per work)

## Example `drop.json`

```json
{
  "date": "2026-06-19",
  "series": "Letting Go",
  "seriesTier": 1,
  "dayOfYear": 170,
  "catalogNumber": "WS-000223",
  "title": "Letting Go · WS-000223",
  "slug": "ws-000223",
  "workUrl": "https://mark-walhimer.com/works/ws-000223/",
  "availability": "available",
  "status": "published",
  "skipped": false,
  "generator": "p5",
  "medium": "P5.js",
  "embedUrl": "/sketches/example-sketch.html",
  "openUrl": "/sketches/example-sketch.html",
  "metadata": {
    "description": "One-line description for the work page."
  },
  "mint": {
    "platform": "transient_labs",
    "priceEth": "0.003",
    "contract": null,
    "tokenId": null
  }
}
```

Skips: set `skipped: true`, `status: skipped` — no public page.
