# Acceptance Feed

A **Machine Aesthetic** sketch: soundscape-first browser audio, **soothing** sampled piano layers (e.g. Salamander-style assets copied into this folder), and room for a **live or curated data layer** (e.g. volatility / a custom index over time) whose meaning centers on **acceptance**—professional, institutional, and interpersonal—as material for the work.

**Shape:** Think kinship with the **Loop Art Critique → Technical Surrender** line of work: a **single-page orchestrated experience** (stage, transitions, clear progression) rather than a generic audio player—exact structure will emerge in code. Static pages and assets live in this repo (**GitHub Pages / GitHub**). **Firebase** is reserved for later: configuration, shared state, versioning, or feed snapshots—exact schema TBD.

## Intent

- **Soundscapes, not beats.** Sparse layers, long envelopes, occasional events—closer to slow generative atmosphere than grid-locked playback. Piano samples lean **calm and restorative** relative to whatever tension the data layer carries.
- **Optional breath (camera):** If implemented, the camera is used so participants can **see** subtle breathing-related motion and optionally **couple** it to the system. This is **not** for capturing or storing portraits; processing should stay **local/session**, with clear opt-in. No medical claims—see `style-guide.md`.
- **No DAW.** The browser (and existing bridge patterns elsewhere in `machine aesthetic/`) carries synthesis, playback, and mix.
- **GitHub = source of truth for the shipped template**; Firebase associates deployed builds with stored parameters or time-series when that layer ships.

## Contents (planned)

| Path | Role |
|------|------|
| `README.md` | This file — scope and principles |
| `style-guide.md` | Voice, UI, and documentation conventions for this piece |
| Samples / patches | Added incrementally (e.g. piano samples, Web Audio or p5.sound layers) |

**Prototype (camera breath + piano):** [`sketches/loop-art-critique-2026/webcam-point-cloud/v3-breath/`](../../sketches/loop-art-critique-2026/webcam-point-cloud/v3-breath/) — has its **own** `README.md` and `style-guide.md` next to `index.html` so the runnable sketch stays documented in place.

## Alignment

Where randomness or identity matters, prefer the canonical **EmergentDNA** [`Rand` / `SeedRng`](https://github.com/walhimer-studio/EmergentDNA) behavior. Room and slider vocabulary may eventually align with **`studio/light-art-osc`**; wire only when this sketch needs it.

## Salamander samples

This repo already holds `salamander-lite` WAV sets under `sketches/April 25/` and `osc-midi-bridge/public/`. For a self-contained **acceptance-feed** build, copy only the files you need into this folder (or document a single canonical path in code when you add playback).

## Author

Mark Walhimer · Walhimer Studio · part of [walhimer.github.io](https://github.com/walhimer-studio/walhimer.github.io).
