# Hosts — C++, OSC, openFrameworks, Pure Data, browser

**Thesis:** C++ builds the machine and runs the simulation. Running the machine is the artwork. Hosts draw and amplify it — they do not compose separate tracks.

## One kernel, many bodies

```
                    ┌─────────────────────────────┐
                    │  C++ machine kernel         │
                    │  build · simulate · express │
                    └──────────────┬──────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
   ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
   │ openFrameworks│      │  Pure Data    │      │  Three.js     │
   │  (visual)     │      │  (sound)      │      │  (browser)    │
   └───────────────┘      └───────────────┘      └───────────────┘
```

## Which answer is correct?

**All of the above — different layers, not either/or.**

| Question | Answer |
|----------|--------|
| Does C++ stay C++? | **Yes** for the machine graph + simulator (canonical). |
| Does C++ become OSC? | **No.** C++ *emits* OSC (or reads it) at process boundaries. |
| Does C++ become openFrameworks / Pure Data? | **No.** OF and PD are **hosts** that consume machine state. |

### Single-process install (C++ stays inside one app)

- openFrameworks app **links** the C++ kernel directly.
- Audio via OF + `ofSoundStream`, or embedded RT library.
- Good for: one machine, one machine, gallery PC, LED rig.

### Multi-process install (C++ + OSC + OF + PD)

- C++ simulator runs as **brain** (or lives inside OF and broadcasts).
- **OSC** carries machine state on LAN ([../docs/OSC.md](../docs/OSC.md)):
  - `/sm/gear/rpm`, `/sm/gear/jam`, `/sm/dna/generation`, etc.
- **Pure Data** patches oscillators / noise from gear Hz — not from FFT of visuals.
- **openFrameworks** draws armature / blueprint from same messages.
- Good for: separate audio rack, Teensy bridge, multi-room, your existing PD workflow.

### Browser (this demo)

- `examples/demo.html` = **one process** doing kernel + blueprint + Web Audio.
- JavaScript **stands in for** future C++ — proves build → run → see + hear.
- Production walkthroughs may stay Three.js (armature blueprint) reading same `express()` JSON or OSC bridge.

## What crosses each boundary

| Hot path (every frame / tick) | Slow path (Emergent DNA) |
|-------------------------------|---------------------------|
| Gear angles, RPM, jam flags | Seed, generation, scars |
| Tooth mesh frequencies | Firebase lineage (later) |
| Load from presence | Session logs, calibration |

**Never** stream pixels or audio over OSC. Stream **machine state**.

## `express()` for a machine (schema v2)

See `examples/demo.html` — snapshot includes `gears[]` with `rpm`, `hz`, `jammed`, `gold`, plus `platform`, `posts`, `arm`.

Hosts bind to that shape whether state arrives from:

- in-process C++ call
- OSC bundle
- JSON over Firebase (slow mutations only)

## Recommended order

1. **Browser machine demo** — `demo.html` (done)
2. **Armature Three.js** — port blueprint builder to read same seed rules
3. **C++ kernel** — same `build / simulate / express` API as JS
4. **OSC contract** — extend [../docs/OSC.md](../docs/OSC.md) with `/sm/gear/*`
5. **PD + OF hosts** — read OSC, no Firebase on audio thread

## One line

*C++ stays the machine. OSC wires rooms. openFrameworks and Pure Data are ears and eyes — not the organism.*
