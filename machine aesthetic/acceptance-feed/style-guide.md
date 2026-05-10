# Acceptance Feed — style guide

Conventions for copy, interface language, and docs inside **`acceptance-feed/`**. Technical implementation can change; these preferences should stay stable.

## Voice

- **Clear, calm, direct.** Prefer plain sentences over manifesto tone unless a labeled statement block calls for weight. The overall listening posture is **soothing and spacious** even when the underlying data is tense.
- **First person when it is yours** (artist statement, notes on intent). **Second person** sparingly, for controls (“Continue to start audio”).
- **Institutional candor is allowed**—economics, boards, donors, consultants—but avoid naming real individuals or identifiable situations. The work generalizes experience; it does not litigate cases.

## Optional participation (breath / camera)

- **Framing:** Invite attention and breath; **do not** promise health outcomes. A short line is enough: experimental artwork, not wellness advice.
- **Privacy:** Do **not** record, upload, or retain **identifying images**. If the camera is on, describe it as **live feedback** (e.g. motion or a point cloud people can read as breath) for **this session only**, processed **locally** when technically possible.
- **Agency:** Camera off should remain a **complete experience**—data and sound stand alone; breath only **modulates** or **reveals** when opted in.

## Words we use

| Prefer | Avoid |
|--------|--------|
| acceptance feed, feed (when meaning the piece or data stream) | viral, engagement bait |
| soundscape, layer, drift, envelope | track, drop, banger (unless ironic and clearly framed) |
| row, field, column (for spreadsheet-like UI) | dashboard KPI jargon unless diegetic |
| consultant, institution, board, donor (generic roles) | caricature or punch-down |

## Words for audio

- **Soundscape-first:** describe **density**, **brightness**, **wet/dry**, **blend (sample vs synth)**, **pause**, **crossfade**—not BPM or bar counts unless you explicitly add meter later.
- Piano layers: **soft**, **sparse**, **long decay**, **breathing room**—not “practice track” or grid language unless ironic.
- Say **synthesizer / oscillator / noise / sample player** as appropriate; avoid implying a full **DAW** workflow.

## UI

- **Dark, quiet backgrounds** for listening contexts; **high contrast** for essential labels (transport, accessibility).
- **Monospace** for time, technical labels, and data-like text; **serif or humanist sans** for titles and long reading—match whatever ship first in this folder and update this guide if the palette shifts.
- **One obvious primary action** per screen state (e.g. gate → Continue → Start).

## Markdown in this folder

- **`README.md`** — scope, intent, folder map; keep implementation detail in code comments or a separate dev note when needed.
- **`style-guide.md`** — human-facing rules only; no secrets or Firebase keys.
- **Filenames:** lowercase with hyphens for new assets (`acceptance-feed-main.html`), unless matching an existing Machine Aesthetic convention.

## Firebase (when used)

- Never commit live API keys; use ignored local config patterns consistent with `machine aesthetic/firebase-config.example.js`.
- Document in README **what** is stored (e.g. mix presets vs anonymous rows), not credentials.

## Versioning

- Tag or note meaningful states in git commit messages; if Firebase stores **build ids** or **preset names**, keep names readable and stable (`acceptance-feed-v0`, not hashes alone).
