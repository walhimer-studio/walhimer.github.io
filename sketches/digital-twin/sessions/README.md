# Face signal sessions

Digital twin POC — **mapping images to emotions** via JSON + PNG.

**Doc:** [`../../catalog/digital-twin/README.md`](../../catalog/digital-twin/README.md) · **Index:** [`emotion-map.json`](emotion-map.json)

Recorded from `sketches/digital-twin/face-signal-study.html` (geometry only — no images in JSON).

## The workflow (5 moods → 5 images)

Your JSON sessions include **head turns** (yaw left/right). That is fine for exploration but **too noisy** to warp one photo.

Instead:

1. **One straight-ahead PNG per mood** — same framing, face centered:
   - `neutral.png`, `happy.png`, `sad.png`, `think.png`, `surprise.png`
2. **Press 1–5** in portrait replay → **crossfade** between those images.
3. JSON is optional — drives signal bars and helps you find the straight-ahead moment.

### Straight-ahead anchor times

See **`mood-anchors.json`** — best yaw-centered sample per mood in your recordings:

| Mood | Anchor time | Notes |
|------|-------------|--------|
| neutral | 12.4s | yaw ~center |
| happy | 8.4s | yaw ~center |
| sad | 21.3s | yaw ~center |
| think | 0.5s | yaw ~center |
| surprise | 5.9s | yaw ~center |

Scrub JSON replay in `face-signal-replay.html` to those times when capturing screenshots from the live study, or re-record **short straight-ahead takes** (no head turns).

## Files

| File | Role |
|------|------|
| `*.json` | Motion / signal recordings |
| `mood-anchors.json` | Straight-ahead frame hints |
| `*.png` | One portrait per mood (the visible face) |

Replay: `https://mark-walhimer.com/sketches/digital-twin/face-signal-portrait-replay.html`
