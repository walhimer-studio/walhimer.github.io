# Verse Version (v2)

This version removes browser-only runtime dependencies (live webcam + ml5 FaceMesh) and focuses on a portable data pipeline:

1. Load an image.
2. Generate a point cloud from pixel brightness.
3. Download `points.json`.
4. Use that JSON in Verse scripts to spawn/render points using native scene elements.

## Why this exists

The `v1` sketch is a great live browser artwork, but it depends on:

- `p5.js`
- `ml5 FaceMesh`
- browser camera permissions

Those are not directly importable as an in-archive Verse runtime experience.

## Suggested Verse pipeline

- Keep this folder as your point-cloud generator.
- Export `points.json` assets per artwork version (`light-art-023`, etc.).
- In Verse scripts, load/parse the data and instantiate native mesh/point proxies.
- Tune density with `step` and depth with `zDepth`.

## Loop Miami workflow

- Keep `v1` as your browser-native edition.
- Keep `v2-verse` as your Verse-target edition.
- Publish both from the same repository so updates stay synchronized.
