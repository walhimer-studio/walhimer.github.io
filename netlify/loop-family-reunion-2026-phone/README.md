# Loop Family Reunion 2026 — Phone

Phone upload URL for the Family Reunion Co-Create gallery. Same Firebase room as [`loop-family-reunion-2026-gallery/`](../loop-family-reunion-2026-gallery/).

## Live URL (QR target)

https://mark-walhimer.com/netlify/loop-family-reunion-2026-phone/

The monitor QR encodes this URL at runtime (`?room=` when not default).

## Symlinks

This folder **must mirror** gallery modules so ES imports resolve under `/loop-family-reunion-2026-phone/`:

| Symlink | Target |
|---------|--------|
| `index.html` | `../loop-family-reunion-2026-gallery/index.html` |
| `bloom-four-walls-scene.mjs` | gallery |
| `co-create-machine-dna.mjs` | gallery |
| `bloom-pentatonic-piano.mjs` | gallery |
| `canvas-recorder.mjs` | gallery |
| `gallery-sync.mjs` | gallery |
| `firebase-config.mjs` | gallery |
| `js/` | gallery |
| `samples/` | gallery |

When adding new gallery `.mjs` or asset dirs, add a symlink here before push.

## Netlify deploy (optional)

| Setting | Value |
|---------|--------|
| Base directory | `netlify/loop-family-reunion-2026-phone` |
| Publish | `.` |
