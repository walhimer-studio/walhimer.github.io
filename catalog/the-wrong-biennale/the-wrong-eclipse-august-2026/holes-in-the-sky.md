# Listening to the Sky

**The Wrong Biennale · The Wrong Eclipse · August 2026**

| Field | Value |
|-------|--------|
| Title | Listening to the Sky |
| Year | 2026 |
| Medium | Generative soundscape (OpenFrameworks, Pure Data, OSC, DSP); Bandcamp stereo/binaural release |
| Species | New **Machine DNA** species (not Surrender Machines, not Bloom) |
| Astronomical anchor | The Wrong Biennale, Partida Maitino 2069c, Alicante, 03295, Spain |
| Exhibition | [The Wrong Eclipse](https://thewrong.org/) — 12 August 2026, 24 hours |
| Live hub | https://mark-walhimer.com/sketches/the-wrong-biennale/the-wrong-eclipse-august-2026/index.html |
| Studio pipeline | [Artwork pipeline](https://mark-walhimer.com/practice/artwork-pipeline.html) · [catalog direction](../../STUDIO-DIRECTION.md) |
| Mode | **Votive / witness** — listen; no visitor interactivity (see pipeline) |

---

## One line

Code that **listens to the eclipse through the atmosphere** above **Maitino** (The Wrong Biennale, Alicante); the artwork **happens at eclipse time**, not on Bandcamp alone.

---

## Work description

*Listening to the Sky* is a time-locked listening work for [The Wrong Eclipse](https://thewrong.org/). The sky is the exhibition space; this piece is its soundtrack.

The work does not illustrate the eclipse with visuals or translate image into sound. A **Machine DNA** lifeline drives the generative system: one clock, one genome, simultaneous expression in **sonification** and in the **generator** (life bar, state). Salamander Grand **pentatonic** piano samples — consonant subsets, Bloom-adjacent — are triggered and spatialized as the organism ages.

Atmospheric **variation** matters more than literal “holes.” Fossil fuels, clouds, gases, storms, aircraft, and satellites all perturb what would be a uniform sky. Live feeds (NOAA weather, METAR, flight data, satellite passes over **Partida Maitino 2069c, Alicante, 03295**) modulate the piece during the **live run on 12 August 2026**. The atmosphere above The Wrong’s Maitino site is the input; Machine DNA is the interpreter.

**Eclipse-as-listening:** listeners are asked to hear while watching the real sky. The Bandcamp entry is a **proof of concept** — screenshot of the generator plus a binaural recording made with placeholder or simulated inputs. The **authoritative artwork** is the **live re-recording** during the partial eclipse on 12 August 2026.

---

## Astronomical clock (Maitino · CEST)

The Wrong’s Maitino site (Alicante province) sees a **partial** eclipse peaking at **~99.1% obscuration** — the Sun is never fully covered. Times below use [Alicante city ephemeris](https://time.now/alicante/eclipses/2026-08-12/) (same province; within seconds of Maitino).

| Phase | Time | Obscuration | Lifeline |
|-------|------|-------------|----------|
| Forward build | ~19:40 → ~20:34 | 0% → 99% | Organism grows; notes accumulate |
| Deep sky | ~20:34 – 20:36 | >99% | ~2 minutes near maximum |
| **Reverse (~60 s)** | **~20:34:30 – 20:35:30** | centered on max | Crescendo then **backward** through accumulated material |
| Unwind | ~20:36 → ~21:26 | 99% → 0% | Decay to last contact |
| Full partial arc | ~1h 46m | — | Live recording spans the eclipse window |

Maximum eclipse: **~20:34:59 CEST**. There is no totality at Maitino; the ~60 s reversal is compositional, centered on maximum obscuration inside the ~2-minute band above 99%.

---

## Technical stack

| Layer | Role |
|-------|------|
| **Machine DNA kernel** | Seed, lifespan, traits, phases; `express()` snapshot each tick |
| **OpenFrameworks (C++)** | Host brain; **life bar**; OSC out |
| **Pure Data** | Sound engine; Salamander pentatonic sampler |
| **OSC** | Transport and state between OF and PD |
| **DSP** | Binaural note movement for **headphones / two speakers**; L/R stereo field |

Principle: **not** audio-reactive visuals or visual-reactive audio. Machine DNA drives **both** from the same state.

Reusable framework for future sampled sources or other embodiments of the same species.

---

## Bandcamp (submission)

Per [The Wrong Eclipse](https://thewrong.org/) open call:

- **Audio:** binaural / stereo L–R track (DSP-managed movement)
- **Cover:** screenshot of the generator UI (code in this catalog folder when built)
- **PoC recording:** made before August 2026 with development inputs
- **Live recording:** replaces or supersedes PoC as the canonical work after 12 August 2026

Submit Bandcamp link, title, cover, artist info, and contact to **thewrongbiennale@gmail.com** by **1 August 2026**, subject **The Wrong Eclipse**.

---

## Artist information

Mark Walhimer — digital installation and generative sound practice. Real-time systems, co-creation, lifespan, and code-as-artwork. See [mark-walhimer.com](https://mark-walhimer.com).

---

## Statement (short)

I treat eclipse day as a listening score. The machine reads the sky above Maitino — Partida Maitino 2069c, where The Wrong Biennale is based — weather, traffic, orbit — through a single DNA lifeline. Sound moves forward until the sky is almost gone, holds in the narrow band above ninety-nine percent obscuration, then runs backward for about a minute while the crescent hangs at its thinnest. Bandcamp holds a proof; the work is the air on the twelfth of August.

---

## Implementation status

| Item | Status |
|------|--------|
| Catalog statements | This file |
| Browser PoC host | `holes-in-the-sky.html` |
| Machine DNA kernel | `machine-dna-kernel.mjs` |
| OpenFrameworks brain | `openframeworks/HolesInTheSky/` — life bar + OSC `/hit` |
| Pure Data patch | `pure-data/holes-in-the-sky-vanilla.pd` — Salamander + binaural |
| Live feeds | `live-feeds.mjs` + `feed-bridge.mjs` (METAR / NOAA / OpenSky / ISS) |
| Bandcamp PoC recording | In-browser **Record PoC** + `bandcamp-poc.md` |
| Live re-record · 12 Aug 2026 | Scheduled |

**Code path (WIP):** `sketches/the-wrong-biennale/the-wrong-eclipse-august-2026/`
