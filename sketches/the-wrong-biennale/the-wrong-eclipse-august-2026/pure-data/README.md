# Pure Data — Holes in the Sky

## Mac dev (recommended)

**`holes-in-the-sky-vanilla.pd`**

- Port **9001** · FUDI plain text · **no OSC externals**
- **`netreceive 9001 1`** (UDP + FUDI parse)
- **Media → DSP on**
- Samples: `../samples/salamander/pentatonic/wav-v8/*.wav` (relative to this folder)

### Start stack

```bash
# Terminal 1 — live feeds → FUDI + live-cache.json
node feed-bridge.mjs

# Terminal 2 — open patch in Pd
open pure-data/holes-in-the-sky-vanilla.pd
```

Send test note from Pd message box:

```
pan 0.25; vel 0.2; trigger 1;
```

## Production OSC (optional)

**`holes-in-the-sky.pd`** — stub on port **9000** for OpenFrameworks brain (`/hit/*`). Install **osc** externals (`oscparse`, `routeOSC`) or use vanilla FUDI bridge.

## Binaural

Pan **-1…1** scales stereo L/R gains: `L = (pan+1)*0.5`, `R = (1-pan)*0.5`.

Extend patch with one `soundfiler` table per pentatonic note (see browser `audio-engine.mjs` NOTE_MAP).

## Eclipse day · 12 Aug 2026

1. OpenFrameworks `HolesInTheSky` — OSC `/hit` port 9000
2. `node feed-bridge.mjs` — METAR LEAL, NOAA grid, OpenSky bbox, ISS pass
3. This patch — authoritative Salamander + binaural output
4. Record stereo bus for Bandcamp (see `bandcamp-poc.md`)
