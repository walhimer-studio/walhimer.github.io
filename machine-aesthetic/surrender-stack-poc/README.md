# Surrender Stack POC — Machine DNA · Firebase · Supabase · OSC · Pd

**Self-contained proof of concept.** Does not modify artwork or other console files.

**Session status:** [docs/STATUS.md](./docs/STATUS.md) — accomplished vs remaining (June 2026).

Proves the full install spine for **Surrender Machines** (`speciesId: surrender-machines`):

| Layer | Role |
|-------|------|
| **iPhone** | Operator input only → Firebase |
| **dna-bridge** (Mac brain) | Emergent DNA kernel, Supabase persistence, scar merge, OSC broadcast |
| **Supabase** | Genome + scars system of record; Realtime for cross-venue sync |
| **OSC :7400** | Hot path → openFrameworks, Pis, Pd (`surrender-dna.pd`) |
| **Plain :7401** | Mac Pd fallback (`surrender-dna-vanilla.pd`) |
| **display.html** | Wireframe cube · white bg · genome-driven rotation |

MacBook Pro now → same `dna-bridge` on AMD Linux later (see [STACK.md](./docs/STACK.md)).

---

## New cloud projects (recommended)

Create **new** Firebase + Supabase projects for this POC (not production `interactive-artwork`).

### Firebase Realtime Database

1. Create project → Realtime Database → test rules (or restrict to `surrender-stack-poc/**`).
2. Copy web config to `config/firebase-config.local.mjs`.

Paths (written by this POC only):

```
surrender-stack-poc/operator/{venueId}   ← phone writes here (operator only)
surrender-stack-poc/genome/{venueId}     ← bridge writes kernel snapshot (read-only for phone)
```

### Supabase

1. Create project → SQL Editor → run [schema/supabase.sql](./schema/supabase.sql).
2. Enable **Realtime** on `scars` and `genomes` tables (Database → Replication).
3. Copy Project URL + **service role** key (bridge runs server-side) to `config/supabase-config.local.mjs`.

Seed venues (included in SQL): `tokyo`, `california`, `mac-local`.

---

## Install

```bash
cd machine-aesthetic/surrender-stack-poc
cp config/firebase-config.example.mjs config/firebase-config.local.mjs
cp config/supabase-config.example.mjs config/supabase-config.local.mjs
# edit both with your keys
npm install
```

---

## Run (MacBook POC)

```bash
./scripts/run.sh
```

Or step by step:

```bash
# Pure Data — turn DSP on (Mac: vanilla patch on 7401)
open -a Pd pure-data/surrender-dna-vanilla.pd

# Brain bridge (pick venue)
SM_VENUE_ID=mac-local node bridge/dna-bridge.mjs

# UI
node web/serve.mjs
```

Open:

- Display: http://127.0.0.1:8791/display.html
- Controller (iPhone): http://\<lan-ip\>:8791/controller.html

### Simulate Tokyo + California on one Mac

Terminal A:

```bash
SM_VENUE_ID=tokyo SM_OSC_PORT=7400 node bridge/dna-bridge.mjs
```

Terminal B:

```bash
SM_VENUE_ID=california SM_OSC_PORT=7401 node bridge/dna-bridge.mjs
```

Break the machine in one venue (high stress slider + nudge). Within **15 minutes** (or on Supabase Realtime), the other venue merges scars.

---

## Environment

| Variable | Default | Notes |
|----------|---------|--------|
| `SM_VENUE_ID` | `mac-local` | `tokyo` · `california` · `mac-local` |
| `SM_SEED` | `77823` | Birth seed if no genome in Supabase |
| `SM_OSC_HOST` | `127.0.0.1` | Later: LAN IP of install brain |
| `SM_OSC_PORT` | `7400` | OSC binary bus |
| `SM_PLAIN_PD_PORT` | `7401` | Mac Pd FUDI fallback |
| `SM_SCAR_SYNC_MS` | `900000` | 15 min periodic merge |
| `SM_TICK_HZ` | `30` | Kernel + OSC rate |
| `SURRENDER_WEB_PORT` | `8791` | Static UI port |

---

## Success criteria

- [ ] Phone changes **operator** fields only; genome traits change via kernel, not direct Firebase edits.
- [ ] `seed` in HUD matches `/sm/console/seed` in Pd print console.
- [ ] Break → gold → scar row in Supabase `scars` table.
- [ ] Other venue merges scar within 15 min (or Realtime push).
- [ ] Kill phone Wi‑Fi — local OSC + Pd keep running on last genome.

---

## Folder map

```
surrender-stack-poc/
  bridge/dna-bridge.mjs      ← install brain (genome authority)
  lib/                       ← OSC, scar merge, express mapping
  config/                    ← gitignored *.local.mjs
  schema/supabase.sql
  web/                       ← controller + display + serve.mjs
  pure-data/surrender-dna.pd          ← OSC :7400 (install)
  pure-data/surrender-dna-vanilla.pd  ← plain :7401 (Mac dev)
  docs/OSC.md
  docs/STACK.md
  scripts/run.sh
```

Emergent DNA kernel is **imported** from `../emergent-dna/kernel/` (read-only).
