# C++ / openFrameworks reference

Headers distilled from the AI Studio kernel sketches:

| File | Role |
|------|------|
| `SpeciesDNA.h` | Species identity — set once from seed |
| `MachineState.h` | Runtime metabolism (`energy`, `movementSpeed`) |
| `MachinePart.h` | Artist layer — mesh, friction, yield under low energy |
| `SpeciesKernel.h` | Kernel — `createSpecies`, `simulateMachine` |
| `ofApp.reference.cpp` | Example `setup` / `update` / OSC to Pure Data |

## Split (same as Emergent DNA)

- **Artist** — `MachinePart`: how a part looks and slows.
- **Kernel** — `createSpecies`: seeded body assembly.
- **Host** — `ofApp`: draw, audio bridge, OSC.

## OSC

Reference uses `/species/identity` on port `12345` (AI Studio default). Production installs should align with [`../../docs/OSC.md`](../../docs/OSC.md) (`/sm/dna/*`, `/sm/gear/*`).

## PRNG note

Species derivation uses `ofSeedRandom(seed)` so openFrameworks hosts match themselves. For numeric parity with the browser kernel (`kernel/rng.mjs`), port that 32-bit PRNG into C++ before calling `deriveSpeciesDNA`.

## Usage

Copy `cpp/` into an openFrameworks project (or add as include path). Add **ofxOsc** for the reference sender. Fixed-seed birth: pass `77823` instead of `ofGetUnixTime()` to `createSpecies`.
