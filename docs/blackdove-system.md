# Black Dove — system spec & process

How work gets made, rendered, and delivered for **Black Dove**. Repeatable per piece.

**Related:** [Machine-DNA chronicle](https://github.com/walhimer-studio/Machine-DNA/blob/main/docs/CHRONICLE.md) (meaning · life vs slice) · [SPEC-LOCK.md](./SPEC-LOCK.md) (user law) · [submission-and-series-structure.md](./submission-and-series-structure.md) · [`.cursor/MACHINE_DNA_CANON.md`](../.cursor/MACHINE_DNA_CANON.md) · [Machine DNA essay](https://mark-walhimer.com/practice/machine-dna.html) · [ICA Miami statement](https://mark-walhimer.com/machine%20aesthetic/machine-dna.html)

**Status:** four decisions still open — see [§9](#9-open-decisions-blocking). Do not render the ten-piece pack until they are closed.

---

## 1. What this is

Black Dove is a **distribution network** — roughly 8,000 screens that play **video files**. It is not a live-code platform.

Commitments made to Marc Billings (2026-08-07 meeting, follow-up message sent same day):

| Commitment |
|---|
| ~10 works from **Centered** |
| Revised series write-up |
| Speed of **719** |
| Square grid + horizontal & vertical orientation |
| **No white background** |
| **Non-moving camera** |

---

## 2. Delivery spec (platform requirement)

| Field | Value |
|-------|-------|
| Landscape | **3840 × 2160** |
| Portrait | **2160 × 3840** |
| Square | **2160 × 2160** (not in their public FAQ — exists in their hardware; landscape/portrait are the published submit sizes) |
| Frame rate | **30 or 60** |
| Container | **MP4** — MOV is rejected |
| Codec | **H.265 preferred**, H.264 accepted |
| Bitrate | Higher is better |
| Length | **30 s – 2 min** |
| Looping | **Do not pre-loop** — platform handles seamless loop |
| Camera | Fixed preferred (meditative / long viewing) |
| Cuts | None preferred |
| Resolution floor | 4K only — under 4K is rejected |

SPEC-LOCK already anticipates this: `rotate=90` is described there as **"Black Dove / AbelSign normal,"** and the V3 recorder composite is already **2160 × 3840**.

---

## 3. Position on video (provenance gate)

The ICA Miami statement says: *"A video of the work is not the work. Showing something more legible … in place of the running code is a betrayal of the intent."* It also says: *"The system is the work. Everything else is an output."*

The operative words are **in place of**. Outputs are permitted; substitution is not. So every Black Dove delivery must satisfy all three:

1. **The seed travels with the file.** The seed is the work's identity, so it appears in the filename and in the per-piece note.
2. **The running code stays public and is named** alongside each piece, so the file points back at the machine.
3. **The write-up states these are outputs** of a live system.

Miss these and the delivery is the thing the statement disavows. The V3 recorder already names files `one-row-v3-seed{seed}-{timestamp}` — keep that.

---

## 4. Architecture — a role, not an export

Machine DNA is *"a single kernel, a single genome, expressed across many bodies as one species rather than many copies,"* and *"the dimension is written into the code as a role, not imposed from outside."*

Black Dove is therefore a **fourth role** beside digital, object, and spatial.

**One HTML file per piece**, parameterised:

```
?role=blackdove&format=square|landscape|portrait&seed=xxxxxx
```

When `role=blackdove`, the piece knows to run locked camera, no white, canvas at the format's 4K size, recorder armed. **Clip length (30s–2min) is a solidified slice** of the organism’s lifeline by default — not a requirement that lifeline equal clip length (see Machine-DNA chronicle · life vs slice). Short-life loops where lifespan equals clip remain allowed when deliberately chosen.

**Forbidden:** three separate HTML files per piece. That is "many copies," which the framework rules out.

---

## 5. Genome (Machine DNA)

### Canonical RNG — the hash machine

Use the splitmix32 generator in [`machine-aesthetic/emergent-dna/kernel/rng.mjs`](../machine-aesthetic/emergent-dna/kernel/rng.mjs).

**Not** the sine generator in `sketches/js/emergent-dna-core.js`, for two reasons:

1. Its state is `s++`, so the stream for seed N is the stream for seed N+1 **shifted by one draw**. With `rebirth(artSeed + 1)` every child is the parent slid one slot over. Demonstrated:

```
SINE   seed 500: 0.2819  0.2830  0.7989  0.6176  0.5539
       seed 501: 0.2830  0.7989  0.6176  0.5539  0.5535
HASH   seed 500: 0.2666  0.7284  0.3597  0.8714  0.9447
       seed 501: 0.8652  0.1807  0.7718  0.9439  0.4921
```

2. The ICA statement requires *"the same seed on any machine produces the same output."* JavaScript does not specify `Math.sin` precision, so the sine machine cannot guarantee that across engines or architectures. `Math.imul` integer arithmetic is bit-exact everywhere.

**Do not retrofit** already-published locked seeds (e.g. Invisible Layer `719026`). Switching generators changes what a seed produces; a retrofitted edition stops being that artwork.

### Seed format

**Six-character hex**, per the ICA statement: *"A six-character hex seed governs the entire visual composition."* One Row's nine-digit decimal seeds (`275737489`) do not conform.

### Gene schema is part of the DNA

`expressIndividual` draws from one shared stateful RNG in key order. Adding a gene shifts every value after it, and a delivered seed stops reproducing its work.

**Freeze and version the gene schema per piece** before delivery. Record the version next to the seed.

### Named genes (replace hand-tuned constants)

Every piece inherits the same named genes rather than per-file magic numbers — `SPEED` (the 719 target), palette, `breathAmp` / `breathPhase`. Breathing is already a default trait in the library, which matches Marc's requested language ("experiments, breathing, geometric").

---

## 6. Lifeline

Two delivery modes (document which per piece):

| Mode | Lifeline | Black Dove file |
|------|----------|-----------------|
| **Slice (default for narrative Type 1)** | Full organism life (e.g. One Row 8 min / N150 all day) | 30s–2min **excerpt** of a solidified run |
| **Short-life loop** | Lifespan = clip length (30s–2min) | One complete life, birth→death; platform loop ≈ reincarnation |

Do not assume clip length is the organism’s only life. See [Machine-DNA chronicle · life vs slice](https://github.com/walhimer-studio/Machine-DNA/blob/main/docs/CHRONICLE.md).

This does not conflict with SPEC-LOCK: that document sets `LIFESPAN_MS = 480000` as the **One Row wall value** and states explicitly that lifespan is per species / per catalog entry.

**The HUD never appears in a deliverable.** The lifeline bar, title, and seed readout are DOM elements; `CanvasRecorder` composites only the p5 canvas. Burned-in HUD means someone screen-recorded instead of using the recorder — see [§10](#10-hard-stops).

---

## 7. Composition

- **Square is the unit.** Compose square, then add squares: one square for square screens, two side by side for landscape, two stacked for portrait. Marc arrived at this for distribution; the object dimension (20 in² LED panel, LCD, projector) needs the same discipline, so it is the shared body plan.
- **Fixed camera.** Also removes the two failure modes of a dolly: running out of geometry, and never looping cleanly.
- **No white.**
- **Slow.** LED/LCD makes motion read faster than it does on a desk monitor. Err slower.

**Type discipline:** Black Dove pieces are **Type 1 Seeded** — no input, fully determined by the seed. The prototyping board work is **Type 2 Relational** and must not carry a seed for uniqueness. One piece cannot be both. Do not plan for the Black Dove ten to double as board pieces.

---

## 8. Process (repeatable, per piece)

### Render

1. **Choose the seed** — six-character hex. Record it and the gene schema version.
2. **Open the piece** at `?role=blackdove&format=portrait&seed=xxxxxx`.
3. **Verify before recording:** canvas is the format's 4K size, camera is locked, no white, lifespan equals intended clip length.
4. **Record with the built-in recorder** (`rec.toggle()` / **R**). Never screen-record.
5. **Repeat for all three formats with the same seed.** Same seed plus frozen schema is what makes them one artwork in three bodies.

### Transcode

MediaRecorder may hand back WebM. Convert once — this is an export step and touches no artwork:

```bash
# H.265 (preferred)
ffmpeg -i in.webm -c:v libx265 -crf 18 -tag:v hvc1 -pix_fmt yuv420p -an \
  -movflags +faststart out.mp4

# H.264 (fallback)
ffmpeg -i in.webm -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -an \
  -movflags +faststart out.mp4
```

### Verify (every file, before it goes in the folder)

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,codec_name,duration,bit_rate \
  -of default=noprint_wrappers=1 out.mp4
```

Confirm: exact target dimensions · `30/1` or `60/1` · `hevc` or `h264` · duration 30–120 s · MP4 container · no HUD visible in the first and last frames.

### Name and document

```
{piece}-{seed}-{format}.mp4      e.g. one-row-7a3f10-portrait.mp4
```

Per piece, record: title · seed · gene schema version · live code URL · one-line note.

### Publish (repo side)

`sketches/blackdove/` mirrors `catalog/blackdove/`.

```bash
python3 _scripts/reorder_series_by_index_mtime.py
python3 _scripts/refresh_catalog.py          # commit data/catalog.json
python3 _scripts/check_catalog_mirror.py     # must exit 0
python3 _scripts/check_catalog_sync.py       # must exit 0
python3 _scripts/check_self_contained.py     # must exit 0
python3 _scripts/check_machine_dna.py        # must exit 0
```

Register new paths in `sketches/index.html` → `SERIES`.

`catalog/blackdove/` does not exist yet, and the mirror check currently passes (43 catalog folders, 43 SERIES blocks). It validates **catalog → SERIES**, so the folder's absence is not what breaks it — adding `catalog/blackdove/README.md` **without** a matching `SERIES` block in the same commit is. Add both together.

---

## 9. Open decisions (blocking)

| # | Decision | Detail |
|---|---|---|
| 1 | **What is 719?** | No Centered 719 exists in the repo. Hypothesis: it refers to Invisible Layer seed `719026` (six hex-valid characters), and the tempo is that piece's speed. Its only speed constant is `MANUAL_SPEED = 34`, which is keyboard movement — not an auto tempo. Needs your answer before `SPEED` can be a house constant. |
| 2 | **Heredity or pure determinism?** | The practice essay says scars are *"heritable — kintsugi, not reset."* The ICA statement says *"the same seed on any machine produces the same output."* Proposed reconciliation: keep heredity but load it from a **committed snapshot file** rather than `localStorage`, so the work inherits and stays reproducible. Confirm or choose purely seeded. |
| 3 | **Additive square pixel math** | Two 2160 squares side by side is 4320 × 2160, not 3840 × 2160. Exact tiling makes each square 1920 × 1920 in landscape while the standalone square is 2160 × 2160. Choose: square unit renders at different pixel sizes per format, or accept a gutter/crop. |
| 4 | **White cards vs SPEC-LOCK** | SPEC-LOCK §"V3 art" mandates *"white cards behind cubes."* Marc asked for white removed. SPEC-LOCK is user law, so this needs an explicit amendment from you — not an agent decision. |

---

## 10. Hard stops

1. **No screen recording.** Use `CanvasRecorder`. A screen capture produces wrong resolution, wrong frame rate, and burned-in HUD — that is exactly what the first work-in-progress file did (1614 × 3082 @ 27.27 fps MOV with the seed readout visible).
2. **No MOV, no under-4K** delivery.
3. **No pre-baked loop** — the platform loops.
4. **No CDN** for core libraries; vendor locally (`check_self_contained.py`).
5. **No artwork edit** under `sketches/` without `AUTHORIZE EDIT @<full-path>: <exact change>`.
6. **No three-copies-per-piece** — role plus format on one file.
7. **No retrofitting published seeds** to the new RNG.
8. **Nothing ships** while §9 is open.
