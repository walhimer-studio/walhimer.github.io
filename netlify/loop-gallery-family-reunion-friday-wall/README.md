# Loop Gallery — Family Reunion Friday Wall

Copy of [`loop-gallery-family-reunion-friday-2/`](../loop-gallery-family-reunion-friday-2/) with the **Bloom / Release four-wall room** instead of the flat white wall.

## Live URL (GitHub Pages)

https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-wall/public/

Shorter redirect:

https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-wall/

Default Firebase room: **`family-reunion-friday-2`** (same project + room as Friday 2 — override with `?room=other-name`).

## Two URLs (same room, different screens)

| Screen | URL |
|--------|-----|
| **Wall** (projector / monitor — Bloom room + QR) | `https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-wall/public/` or `?view=wall` |
| **Phone** (participants upload images) | `https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-wall/public/?view=phone` |

**Wall view** shows the four-wall Bloom room (generative blooms + life bar), visitor JPEGs on all four walls, and a **QR code** for phone upload.

## Room vs Friday 2

| | `family-reunion-friday-2` | this copy |
|--|---------------------------|-----------|
| Scene | Flat white wall + OrbitControls | Bloom four walls + drag to look |
| Slot grid | 8×5 on one wall (`W-col-row`) | 4×2 on each wall (`N-col-row`, `E-…`, etc.) |
| Legacy slots | — | `W-col-row` maps to North wall |
| Firebase | `loop-gallery-family-reunion-3` | Same project + default room |

Firebase rules: see [Friday 2 README](../loop-gallery-family-reunion-friday-2/README.md).

## Netlify deploy (optional)

| Setting | Value |
|---------|--------|
| Base directory | `netlify/loop-gallery-family-reunion-friday-wall` |
| Publish / functions | from `netlify.toml` |
