# Digital twin — WIP

**Mapping images to emotions** — Markdown + JSON + HTML + JavaScript + ml5, built in Cursor.

Catalog statement: [`../../catalog/digital-twin/README.md`](../../catalog/digital-twin/README.md)  
Machine index: [`sessions/emotion-map.json`](./sessions/emotion-map.json)

## Pages

| File | Role | Status |
|------|------|--------|
| [index.html](./index.html) | Series hub | live |
| [face-signal-study.html](./face-signal-study.html) | Capture — camera + ml5 + record + save still | **done** |
| [face-signal-portrait-replay.html](./face-signal-portrait-replay.html) | Replay — mood crossfade (keys 1–5) | **done** |
| [face-signal-replay.html](./face-signal-replay.html) | Wire-head replay — skeleton, no photo wrap | **done** |
| [face-signal-thought-replay.html](./face-signal-thought-replay.html) | Thought replay — face crossfade + mind layer | **done** |
| [witness-mirror.html](./witness-mirror.html) | Witness Mirror (5s) — testimony + machine witness | **done** |
| [witness-mirror-1s.html](./witness-mirror-1s.html) | Witness Mirror (1s) — moment audit, 1s samples | **done** |

## Sessions (`sessions/`)

| File | Role |
|------|------|
| `emotion-map.json` | Emotion → image + JSON index + pipeline stages |
| `thought-map.json` | Emotion → stance + passage (mind layer) |
| `thoughts/*.json` | Per-mood thinking — parallel to mood PNGs |
| `witness-mirror-ml.json` | DeepFace samples for Witness Mirror (every ~5s) |
| `witness-mirror-ml-1s.json` | DeepFace samples for Witness Mirror (1s) |
| `testimony/*.mp4` | Local H.264 proxies (gitignored) |
| `mood-anchors.json` | Straight-ahead frame times per mood |
| `neutral.png` … `surprise.png` | Visible face per mood |
| `neutral.json` … `surprise.json` | Motion recordings (geometry only) |
| `walk-loop.mp4` | *Next* — walking body loop |
| `sidewalk.mp4` | *Next* — third-person / street witness clip |

## Next

1. Billboard test in [Invisible Layer July-13 landscape](../invisible-layer/invisible-layer-july-13-2026-landscape.html)
2. Capture walking + sidewalk video
3. Future: wrap mood images onto ml5 wire skeleton (skinning)
