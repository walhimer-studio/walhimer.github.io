# Face signal sessions

Digital twin POC — **mapping images to emotions** via JSON + PNG.

**Doc:** [`../../catalog/digital-twin/README.md`](../../catalog/digital-twin/README.md) · **Index:** [`emotion-map.json`](emotion-map.json)

Recorded from [`face-signal-study.html`](../face-signal-study.html) (geometry only — no images in session JSON).

## Mood images (visible skin)

One straight-ahead PNG per mood — face centered, no head turn:

| File | Key |
|------|-----|
| `neutral.png` | 1 |
| `happy.png` | 2 |
| `sad.png` | 3 |
| `think.png` | 4 |
| `surprise.png` | 5 |

Replay: [`face-signal-portrait-replay.html`](../face-signal-portrait-replay.html) — crossfade on keys 1–5.

## Session JSON (motion / skeleton data)

| File | Role |
|------|------|
| `*.json` | Smile, mouth, brow, tilt, yaw + landmarks over time |
| `mood-anchors.json` | Best yaw-centered sample per mood (for capture reference) |
| `emotion-map.json` | Master index — emotions, pages, pipeline stages |
| `thought-map.json` | Mind layer index — emotions → `thoughts/*.json` |
| `thoughts/*.json` | Stance + passage per mood (emotion testimony 2026-07-30) |

### Thought map (mind layer) — DeepFace 7 face words

| Key | Mood | Face PNG | ML samples (tapes 1–2) |
|-----|------|----------|------------------------|
| 1 | angry | surprise.png (fallback) | 2 |
| 2 | disgust | think.png (fallback) | 0 — record tape 3 |
| 3 | fear | sad.png (fallback) | 16 |
| 4 | happy | happy.png | 3 |
| 5 | sad | sad.png | 44 (dominant) |
| 6 | surprise | surprise.png | 1 |
| 7 | neutral | neutral.png | 19 |

Self-labeled testimony archived in `thoughts/legacy-self-labeled/`.

Replay: [`face-signal-thought-replay.html`](../face-signal-thought-replay.html) — keys **1–7**.

Session JSON does **not** contain photos. PNGs are the visible layer.

## Straight-ahead anchor times

| Mood | Anchor time |
|------|-------------|
| neutral | 12.4s |
| happy | 8.4s |
| sad | 21.3s |
| think | 0.5s |
| surprise | 5.9s |

Scrub [`face-signal-replay.html`](../face-signal-replay.html) to these times when re-capturing stills.

## Next assets (planned)

| File | Role |
|------|------|
| `walk-loop.mp4` | Body walking toward camera — landscape billboard |
| `sidewalk.mp4` | Third-person street view — environmental witness |

## Future

Wire skeleton from ml5 → wrap mood images onto skeleton (skinning) → visitor camera drives reaction in landscape.
