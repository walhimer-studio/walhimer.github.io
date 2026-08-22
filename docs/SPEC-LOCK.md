# SPEC-LOCK — non-negotiable (user law)

**If a sketch file disagrees with this document, the file is wrong — not the spec.**

Enforced on commit: `python3 _scripts/check_machine_dna.py`  
Agent entry point: `AGENTS.md`

---

## One Row V3 portrait (`sketches/one-row-v3_portrait.html`)

### Canvas & render

| Constant | Value |
|----------|-------|
| `CANVAS_W` × `CANVAS_H` | **3840 × 2160** |
| `PIXEL_DENSITY` | **4** |
| `RECORD_FPS` | **60** |

- `createCanvas(CANVAS_W, CANVAS_H, WEBGL)` — **only** these constants.
- **Forbidden:** `windowWidth`, `windowHeight`, `resizeCanvas`, `windowResized`, viewport sizing, fit/uhd/display modes, quarter-scale, `?display=`.
- **Forbidden:** display scale systems — no `#art-stage`, no `layoutArtStage`, no CSS/JS `scale()` to fit the buffer.
- `#stage` fills the rotated shell (`width/height: 100%`). Canvas **buffer** stays 3840×2160; canvas CSS uses `object-fit: contain` so aspect is preserved (no tall/thin stretch).

### Portrait shell / orientation

**One view — always portrait.** Mac, local server, and wall stick use the same layout.

| Rule | Value |
|------|-------|
| **Rotation** | `rotate=90` always (default; Black Dove / AbelSign normal) |
| **At `rotate=90`** | **bottom of landscape on left** |
| **Buffer** | Stays **3840×2160** landscape pixels — shell rotates HDMI only, not art composition |

- **Forbidden:** `auto`, UHD/viewport heuristics, `?rotate=0` as a “desk / Mac” mode, or any second layout for preview.

### Lifeline (One Row family)

**Copy from:** `sketches/one-row.html`

- `const LIFESPAN_MS = 480000` (One Row catalog value — not universal for all species).
- Time-driven `updateLifeline()` → at 100% `rebirth(artSeed + 1)`.
- `lifeStart = millis()` in `rebirth()`.
- `draw()` calls `updateLifeline()`.

**Forbidden:** `lifeEnded`, `rowEndZ`, `function lifespanMs`, camera-based lifeline.

### Recording

- `const CanvasRecorder = (getCanvas) => { … }` — **video-only** (no `getAudioStream`).
- **Export matches on-screen portrait view:** composite **2160 × 3840** (`CANVAS_H` × `CANVAS_W`), landscape buffer rotated 90° (bottom of landscape on left — same as shell).
- WebGL **render buffer** stays `CANVAS_W` × `CANVAS_H`; only the recorder composite is portrait.
- `captureStream(RECORD_FPS)` + `videoTrack.requestFrame()` via `notifyFrame()` each `draw()` while recording.
- `rec.toggle()` · **R** key.

**Forbidden:** landscape export (`compositeCanvas.width = CANVAS_W` with unrotated `drawImage`), `setupRecording`, `tickRecording`, `recWarmup`, inline `MediaRecorder` without `CanvasRecorder`, `captureStream(30)`, audio-mux MIME without audio track.

### V3 art (this file only)

- `rows = 10`, `REF_ROWS = 30` — **10 cubes evenly spaced** across the full `REF_ROWS` z extent (same span as 30-row One Row). **Forbidden:** tail-slice placement (`rowZIndexRange`, indices 5–14 only).
- Dark field `#0a0a0a`, white cards behind cubes.
- `camSpeed = 0.5`.

---

## Machine DNA (all work)

- **Meaning:** [Machine-DNA chronicle](https://github.com/walhimer-studio/Machine-DNA/blob/main/docs/CHRONICLE.md) — genotype vs ecology vs phenotype. Do not equate “species” with the phrase “Machine DNA.”
- **Genotype package:** [walhimer-studio/Machine-DNA](https://github.com/walhimer-studio/Machine-DNA).
- **Lifespan / lifeline duration** = per species / per catalog entry — read `catalog/{piece}.md`, do not assume one global duration.

---

## Agent rules

1. Read this file before editing any locked sketch.
2. `.cursor/ALLOW_EDIT` is **empty by default** — add one path per session only.
3. Do not describe canvas size from code; cite **this file**.
4. Violation → revert + session lock per `.cursor/rules/artwork-violation-enforcement.mdc`.
