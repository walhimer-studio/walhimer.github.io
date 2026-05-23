# Emergent DNA — style guide & kernel

Living specification for **Surrender Machines** and related species: one small **kernel** drives digital objects, soundscapes, and physical installs. Language and host are interchangeable; the genome is not.

## What this is

| Layer | Role |
|-------|------|
| **Kernel** | Age, traits, scars, phases, break → gold, lifespan. Emits a state snapshot each tick. |
| **Host** | Reads snapshot → Three.js room, openFrameworks install, Pure Data patch, LED mapper, etc. |
| **Sync** | Firebase / OSC (later) carries lineage between bodies — not pixels or audio streams. |

This folder holds the **style guide**, **reference kernel** (JavaScript, v0), and examples. Host code stays in sibling paths (`surrender-machines/`, Loop sketches, PD, OF).

---

## Principles (non‑negotiables)

### 1. Co-creation

Visitors are **co-authors**, not an audience. The artist curates temperament, materials, and limits; users materially change outcome — locally and (later) in the shared lineage.

### 2. Surrender over ego

If the work only runs beautifully, it becomes a monument to the builder. The machine must **yield**: drift, misread input, stall, break. Polish is not the goal; **biased situations** are.

### 3. Kintsugi breaks

When something breaks, it should often become **more beautiful** — gold in the crack, not a reset. Scars are **heritable** traits, not bugs to patch.

### 4. Emergent DNA (species)

Installations are **bodies** of one species, not copies of a file. Shared genome + events propagate between sites (NY ↔ CA). Same DNA, different **expression** per room, screen, or speaker array.

### 5. Sound and image together

One state drives both. **Not** audio-reactive visuals or visuals-reactive audio. Same clock, same traits, same scars — two outputs.

### 6. Lifespan

Nothing runs forever as a perfect loop. Works **age**, mutate, senesce, and may **seed** or **die**. Scarcity and meaning live in time.

---

## Vocabulary

| Term | Meaning |
|------|--------|
| **Genome** | Current heritable state: seed, traits, scars, generation, parent link. |
| **Organism** | Runtime instance of a genome (age, stress, life stage, phase clocks). |
| **Trait** | Named 0–1 tendency (warmth, machine, surrender, scar, gold, …). |
| **Scar** | Permanent shift after a break; may propagate to other nodes. |
| **Phase** | Slow periodic clock (Eno-style mismatched loop lengths). |
| **Expression** | Host-specific rendering of `express()` — meshes, shaders, oscillators, DMX. |
| **Event** | Discrete input: `break`, `gold`, `visitor_nudge`, `seed`, `death`, … |

**Surrender Machines** — first species under Emergent DNA. Name keeps *surrender* in the contract.

---

## Randomness

Almost all digital “random” is **pseudo-random (PRNG)**. That is correct.

- **Seed** at birth → reproducible identity (e.g. `77823`).
- **Thereafter** → deterministic updates from `(genome + event history + time)`.
- Optional hardware entropy **once** to pick a seed; do not rely on unseeded `Math.random()` for lineage.

The reference kernel uses the same 32-bit seeded PRNG as `ghost-machine-core.mjs` so web hosts can match numbers.

---

## Kernel API (reference)

```js
import { createOrganism } from "./kernel/index.mjs";

const organism = createOrganism({ seed: 77823, speciesId: "surrender-machines" });

// each frame / tick
organism.update(dtSeconds, { presence: 0.4, calm: 0.6, stressNudge: 0.1 });

// discrete events (co-creation, breaks)
organism.applyEvent({ type: "break", intensity: 0.75 });
organism.applyEvent({ type: "gold" });

// hosts read this — visuals, audio, OSC, Firebase diff
const snapshot = organism.express();

// persistence / sync
const json = organism.serialize();
organism.deserialize(json);
```

### `express()` snapshot (stable keys for hosts)

Hosts should bind to these names; add fields only with a **schema version** bump.

| Field | Type | Host use |
|-------|------|----------|
| `schemaVersion` | int | compatibility |
| `speciesId` | string | routing |
| `seed` | int | identity / replay |
| `generation` | int | lineage |
| `lifeStage` | string | `juvenile` \| `mature` \| `senescent` \| `dying` |
| `age` | float | seconds since birth |
| `vitality` | float 0–1 | overall life force |
| `stress` | float 0–1 | break pressure |
| `traits.*` | floats 0–1 | warmth, machine, surrender, scar, gold, … |
| `phases[]` | floats 0–1 | slow clocks for generative drift |
| `scars[]` | objects | heritable marks `{ id, trait, delta, atAge }` |
| `flags.breaking` | bool | in active break episode |
| `flags.recentGold` | bool | kintsugi window |

---

## Authoring in human terms (not math)

Design in **temperament**, not equations:

- **Warmth**, **Machine**, **Surrender**, **Tension**, **Decay**
- **Movements**: Approach, Overload, Let go, Afterglow
- **Materials**: visual motifs + timbres tagged by mood

The kernel maps names to numbers; artists tune behaviors until the world feels right, then **listen to it run**.

---

## Host workflow

1. **Kernel first** — run `node examples/step.mjs` or import from a host.
2. **One host** — wire `express()` into existing Three.js / OF / PD.
3. **Second body** — LED crop, physical rig; same snapshot schema.
4. **Sync last** — Firebase / OSC when two sites share DNA ([../docs/FIREBASE_DNA.md](../docs/FIREBASE_DNA.md), [../docs/OSC.md](../docs/OSC.md)).

Do not block audio or frame loop on network I/O. Sync is slow path; expression is hot path.

---

## Fast iteration (without shipping a full browser world)

Edit `kernel/*.mjs` → run:

```bash
cd ~/Documents/GitHub/walhimer.github.io/machine-aesthetic/emergent-dna
node examples/step.mjs
```

**Browser demo (machine-first):** open [`examples/demo.html`](examples/demo.html) — kernel **builds** platform/posts/gears, simulation drives blueprint + tooth-pitch audio. Click to run. See [`docs/HOSTS.md`](docs/HOSTS.md) for C++ / OSC / OF / PD roles.

Optional: import the same module from a minimal HTML page or Three.js host when wiring World One. The kernel has **zero** Three.js dependency.

Port the same spec to C++ (openFrameworks) or Pure Data by matching **serialize JSON** and PRNG algorithm — not by sharing language.

---

## Propagation (deferred)

Gentle vs volatile sync between nodes is an artistic choice — not fixed in v0. When ready:

- Push **events + trait deltas + scars**, not frames.
- Each host merges into local organism and **expresses locally**.

---

## File layout

```
emergent-dna/
  README.md           ← this guide
  package.json
  kernel/
    rng.mjs           ← seeded PRNG (shared with ghost-machine-core)
    organism.mjs      ← Emergent DNA v0
    index.mjs
  schema/
    genome.example.json
  examples/
    step.mjs          ← CLI tick demo
```

---

## Versioning

- `schemaVersion` in every serialized genome.
- Bump when trait names or event types change; document in commit message.
- OSC `/sm/dna/*` and Firebase collections follow [../docs/FIREBASE_DNA.md](../docs/FIREBASE_DNA.md).

---

## One-line statement

*Emergent DNA is a connected species of works: they break, scar with gold, learn from hosts and visitors, and die — so the work never settles into one perfect masterpiece.*
