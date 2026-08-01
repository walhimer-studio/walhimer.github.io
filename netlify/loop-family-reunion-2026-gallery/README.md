# Loop Family Reunion 2026 — Gallery

Bloom four-wall **Co-Create** room for **Loop Art Critique · Family Reunion · ICA Miami**. Firebase room: **`family-reunion-friday-2`**.

## Live URLs

| Screen | URL |
|--------|-----|
| **Gallery** (monitor) | https://mark-walhimer.com/netlify/loop-family-reunion-2026-gallery/ |
| **Phone** (upload · QR) | https://mark-walhimer.com/netlify/loop-family-reunion-2026-phone/ |

Legacy paths (`loop-gallery-family-reunion-friday-gallery`, `…-phone`, `…-wall`) redirect here.

## Machine DNA

| Piece | Implementation |
|-------|------------------|
| Seed | `co-create-machine-dna.mjs` · `?seed=` or room hash |
| Lifeline | Garden arc → `#lifebar` above footer |
| Garden | 22 blooms · spawn · hold · fade · reset |
| DNA notes | Pentatonic pool · one note per bloom |
| Piano | `bloom-pentatonic-piano.mjs` · Salamander samples in `samples/` |
| Scars | Visitor uploads on walls → trait load |

## Monitor UI

- QR encodes `PHONE_URL` at runtime (same room as monitor)
- **Record MP4** button (or **R**) · WebGL + piano audio
- Co-Create credit · machine-dna line · wall counter

## Netlify deploy (optional)

| Setting | Value |
|---------|--------|
| Base directory | `netlify/loop-family-reunion-2026-gallery` |
| Publish | `.` |
| Functions | `netlify/functions` |

GitHub Pages serves the same paths under `mark-walhimer.com/netlify/…`.

## Phone deploy

[`loop-family-reunion-2026-phone/`](../loop-family-reunion-2026-phone/) symlinks gallery assets so the QR URL resolves all modules. When adding gallery files, **add matching symlinks** in the phone folder.

## Catalog

[loop-family-reunion-co-create-gallery.md](../../catalog/loop-art-critique-alumni-show-2026/loop-family-reunion-co-create-gallery.md)

Firebase rules: [Friday 2 README](../loop-gallery-family-reunion-friday-2/README.md).

## Upload resolution (2026-08-01)

| Setting | Value |
|---------|--------|
| `PX_PER_UNIT` | 1024 (was 320) |
| Max texture edge | 4096 px |
| Max exported JPEG | 8 MB |

**Firebase Storage rule** must allow 8 MB writes:

```
allow write: if request.resource.size < 8 * 1024 * 1024
  && request.resource.contentType.matches('image/jpeg');
```

Publish in [Firebase Console](https://console.firebase.google.com/project/loop-gallery-family-reunion-3/storage/rules) before the event if uploads fail after “Hanging…”.
