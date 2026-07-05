# The Wrong Eclipse · August 2026 (WIP)

Work in progress — generative soundscape for [The Wrong Eclipse](https://thewrong.org/), 12 August 2026.

| | |
|--|--|
| **Hub** | https://mark-walhimer.com/sketches/the-wrong-biennale/the-wrong-eclipse-august-2026/index.html |
| **Artwork (PoC)** | [`holes-in-the-sky.html`](./holes-in-the-sky.html) |
| **Archive** | [`catalog/the-wrong-biennale/the-wrong-eclipse-august-2026/`](../../../catalog/the-wrong-biennale/the-wrong-eclipse-august-2026/) |
| **Statement** | [`holes-in-the-sky.md`](../../../catalog/the-wrong-biennale/the-wrong-eclipse-august-2026/holes-in-the-sky.md) |

## Run locally

Open `holes-in-the-sky.html` in a browser (or serve from repo root). **Headphones recommended.**

- **Start** — compressed 10-minute eclipse arc (forward → deep → ~60s reverse → unwind)
- **Stop / Reset** — pause or clear note history

## v0 stack (this folder)

| File | Role |
|------|------|
| `machine-dna-kernel.mjs` | Machine DNA species — `express()` each tick |
| `eclipse-clock.mjs` | Maitino 12 Aug 2026 timing + simulate mode |
| `atmosphere.mjs` | PoC atmospheric inputs (live APIs TBD) |
| `audio-engine.mjs` | Salamander pentatonic + binaural L/R |
| `osc-map.mjs` | `/hit` OSC namespace |
| `holes-in-the-sky-app.mjs` | Host loop |
| `holes-in-the-sky.pd` | PD receive stub (port 9000) |
| `samples/salamander-lite/` | Local Salamander Grand samples |

Next: OpenFrameworks brain + live NOAA / METAR / flight / satellite feeds on eclipse day.
