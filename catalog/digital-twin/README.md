<!-- catalog-mirror: auto -->
# Digital twin — proof of concept

**Studio direction:** [Artwork pipeline](https://mark-walhimer.com/practice/artwork-pipeline.html) · [../STUDIO-DIRECTION.md](../STUDIO-DIRECTION.md)

**Mapping images to emotions** with **Markdown**, **JSON**, **HTML**, **JavaScript + ml5**, and **Cursor**.

A browser-based pipeline: capture face signals with machine learning, store them as JSON, pair each mood with a straight-ahead PNG, and crossfade between those images on keys **1–5**. First step toward **people in landscapes** who react to a visitor’s camera.

| Field | Value |
|-------|--------|
| Series | Digital twin |
| Catalog path | `catalog/digital-twin/` |
| WIP sketches | `sketches/digital-twin/` |
| Sessions | `sketches/digital-twin/sessions/` |

## Live URLs

| Page | URL |
|------|-----|
| **Hub** | https://mark-walhimer.com/sketches/digital-twin/index.html |
| **Capture** | https://mark-walhimer.com/sketches/digital-twin/face-signal-study.html |
| **Portrait replay** | https://mark-walhimer.com/sketches/digital-twin/face-signal-portrait-replay.html |
| **Wire replay** | https://mark-walhimer.com/sketches/digital-twin/face-signal-replay.html |

**Video:** ~24s screen recording — portrait replay crossfading neutral → sad → surprise (`digital-twin.mov`)

---

## What this is

| Piece | Role |
|-------|------|
| **Markdown** | This document — POC workflow and direction |
| **JSON** | `emotion-map.json` + session files — emotion → image + motion |
| **HTML** | Self-contained capture and replay pages |
| **JavaScript** | p5.js — draw, WebGL crossfade, UI |
| **ML (ml5.js)** | Face mesh + selfie segmentation (MediaPipe via ml5) |
| **Cursor** | IDE used to build and iterate |

**Two layers:** **PNG** = visible face · **JSON** = motion score (no photos inside JSON)

---

## Emotion → image map

[`sketches/digital-twin/sessions/emotion-map.json`](../../sketches/digital-twin/sessions/emotion-map.json)

| Key | Emotion | Image | JSON |
|-----|---------|-------|------|
| **1** | neutral | `neutral.png` | `neutral.json` |
| **2** | happy | `happy.png` | `happy.json` |
| **3** | sad | `sad.png` | `sad.json` |
| **4** | think | `think.png` | `think.json` |
| **5** | surprise | `surprise.png` | `surprise.json` |

See [face-signal-study.md](./face-signal-study.md) · [face-signal-portrait-replay.md](./face-signal-portrait-replay.md) · [face-signal-replay.md](./face-signal-replay.md).

---

## Where this is going

1. **Ask permission** — five photos per person (or one neutral to start)
2. **Capture** — straight-ahead cutouts per mood
3. **Map** — PNG + JSON in `emotion-map.json`
4. **Place** — portraits as figures in a landscape
5. **React** — visitor webcam via ml5 → crossfade inhabitant face

---

## Publish checklist

1. Update this README and `{artwork}.md` in this folder
2. WIP under `sketches/digital-twin/`
3. Register in `sketches/index.html` SERIES
4. `python3 _scripts/reorder_series_by_index_mtime.py`
5. `python3 _scripts/refresh_catalog.py`
6. `python3 _scripts/check_self_contained.py` (full repo, exit 0)

---

## Machine DNA

| Field | Value |
|-------|--------|
| Species | Digital twin |
| Mode | Capture / crossfade replay |
| Bodies | browser · ml5 · p5 |
