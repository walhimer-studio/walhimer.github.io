# The Wrong Eclipse · August 2026 (WIP)

Work in progress — generative soundscape for [The Wrong Eclipse](https://thewrong.org/), 12 August 2026.

| | |
|--|--|
| **Hub** | https://mark-walhimer.com/sketches/the-wrong-biennale/the-wrong-eclipse-august-2026/index.html |
| **Artwork (PoC)** | [`holes-in-the-sky.html`](./holes-in-the-sky.html) |
| **Archive** | [`catalog/the-wrong-biennale/the-wrong-eclipse-august-2026/`](../../../catalog/the-wrong-biennale/the-wrong-eclipse-august-2026/) |
| **Statement** | [`holes-in-the-sky.md`](../../../catalog/the-wrong-biennale/the-wrong-eclipse-august-2026/holes-in-the-sky.md) |

## Run browser PoC

Open `holes-in-the-sky.html` · **headphones** · **Start** · optional **Live feeds** · **Record PoC** for Bandcamp draft.

Salamander samples: `samples/salamander/` (full pack) · `samples/salamander/pentatonic/` (PoC). Reinstall:

```bash
python3 _scripts/install_salamander_samples.py
```

## Full stack (eclipse day)

| Layer | Path |
|-------|------|
| OpenFrameworks brain | `openframeworks/HolesInTheSky/` |
| Pure Data audio | `pure-data/holes-in-the-sky-vanilla.pd` |
| Live feed bridge | `node feed-bridge.mjs` |
| OSC contract | `osc-contract.md` |
| Bandcamp checklist | `bandcamp-poc.md` |

```bash
# Terminal 1
node feed-bridge.mjs

# Terminal 2 — build & run OF brain (see openframeworks/HolesInTheSky/README.md)

# Pure Data — open pure-data/holes-in-the-sky-vanilla.pd · Media → DSP on
```

## Modules

| File | Role |
|------|------|
| `machine-dna-kernel.mjs` | Machine DNA · `express()` |
| `eclipse-clock.mjs` | Maitino 12 Aug 2026 timing |
| `atmosphere.mjs` | Sim + live feed merge |
| `live-feeds.mjs` | METAR LEAL · NOAA · OpenSky · ISS |
| `audio-engine.mjs` | Salamander pentatonic · binaural |
| `bandcamp-recorder.mjs` | Stereo PoC capture |
