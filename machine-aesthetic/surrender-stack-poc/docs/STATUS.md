# Surrender Stack POC — Status (June 2026)

Session summary: what was built, what works, what’s next.  
**Master doc:** [SURRENDER-MACHINES-PROJECT.md](../../docs/SURRENDER-MACHINES-PROJECT.md) · Related: [STACK.md](./STACK.md) · [AUTOMATION.md](./AUTOMATION.md) · [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) · [program/README.md](../../../program/README.md)

---

## What this proves

**One seed (`77823`) drives sight + sound + persistence** across cloud and local bodies — without editing artwork files.

```
Phone/browser (display.html)
    ↓ operator controls
Firebase Realtime DB          ← cube: L/R, U/D, speed, pause
    ↓
dna-bridge (Mac install brain)
    ↓ Emergent DNA kernel (read-only import)
    ├── Supabase — genomes + scars (system of record, cross-venue merge)
    ├── Firebase — genome snapshot for HUD
    ├── OSC UDP :7400 — install hot path (OF, Pis, Linux)
    └── Plain UDP :7401 — Mac Pd (vanilla, no OSC library)
Pure Data — ears on Mac
OpenFrameworks — not in this POC (Phase B install)
Transient Labs / Manifold — not wired yet (ops layer in `program/`)
```

---

## Accomplished

### Architecture & code (`machine-aesthetic/surrender-stack-poc/`)

| Component | Status | Notes |
|-----------|--------|-------|
| **`bridge/dna-bridge.mjs`** | ✅ Done | Genome authority; Firebase operator; Supabase persist + scar merge; OSC + plain Pd |
| **Emergent DNA kernel** | ✅ Imported | Read-only from `../emergent-dna/kernel/` — not copied |
| **Supabase schema** | ✅ Done | `schema/supabase.sql` — genomes, scars, venues |
| **`web/display.html`** | ✅ Done | Single screen: wireframe cube + operator panel |
| **`web/serve.mjs`** | ✅ Done | Local server :8791; `/api/ping`, `/api/firebase-config` |
| **`web/controller.html`** | ✅ Redirect | → `display.html` |
| **Firebase config** | ✅ Done | Operator + genome paths; example + rules JSON |
| **OSC lib** | ✅ Done | `/sm/*` namespace; stopMotion, vitality, hz |
| **Plain Pd UDP** | ✅ Done | FUDI lines; stop mutes; speed scales hz |
| **`pure-data/surrender-dna-vanilla.pd`** | ✅ Done | Mac dev — `netreceive 7401 1` |
| **`pure-data/surrender-dna.pd`** | ✅ Done | Install — OSC :7400 (needs osc externals) |
| **Docs** | ✅ Done | STACK, OSC, PD-SETUP, TROUBLESHOOTING, AUTOMATION |
| **Scripts** | ✅ Done | diagnose, network-check, status, unpause, reset-venue, deploy-controller |
| **Firebase Hosting deploy** | ✅ Script | `npm run deploy-controller` — phone HTTPS, no LAN |
| **Cloud brain (Render)** | 📋 Guide | [CLOUD-BRAIN.md](./CLOUD-BRAIN.md) — 24/7 `dna-bridge` via GitHub |

### Cloud (user-configured)

| Service | Status |
|---------|--------|
| **Supabase** | Project created; schema run; Realtime on genomes/scars |
| **Firebase** | `surrender-machines-pocv1`; RTDB rules applied; Hosting deploy path |
| **Local secrets** | `*.local.mjs` gitignored — not in repo |

### Verified working

- Supabase genome load (seed 77823, gen 0)
- Firebase operator read/write (phone + Mac sync)
- Genome HUD live (seed, stress, scars)
- Cube controls: left/right, up/down, speed, pause
- **Pause** freezes cube + mutes Pd (via bridge `stopMotion`)
- Pd receives FUDI on :7401 (`seed`, `hz`, `stop`, etc.)
- Phone via Firebase Hosting (no Mac firewall / LAN required)
- `npm run diagnose` — 6/6 when configured
- `npm run status` — process/port audit

### Operator model (current)

Old sliders (presence, calm, stress, mood) **removed** — POC uses cube controls only:

| Firebase field | Effect |
|----------------|--------|
| `leftRight` | Cube yaw offset |
| `upDown` | Cube pitch offset |
| `speed` | Spin rate + audio hz scale |
| `stopMotion` | Freeze cube + mute Pd |

Bridge no longer feeds operator into organism stress loop (avoids scar spam from UI).

---

## Known issues & workarounds

| Issue | Workaround |
|-------|------------|
| Mac firewall blocks LAN :8791 | Use Firebase Hosting URL for phone |
| Pd `Address already in use` | One vanilla patch only; quit duplicate Pd windows |
| Pd log floods RAW lines | Normal (~30/sec); not an error |
| Vitality → 0 after old stress tests | `node scripts/reset-venue.mjs` or `npm run unpause` |
| Two tones | One bridge + one Pd patch on 7401 only |
| OSC patch on Mac | Skip — use vanilla :7401 |
| `serve.mjs` wrong path | Run from `surrender-stack-poc/` folder |

---

## Not accomplished (runtime)

| Item | Priority | Notes |
|------|----------|-------|
| **OpenFrameworks install body** | Phase B | Replace browser cube; OSC :7400 consumer |
| **Linux AMD brain** | Install | Same `dna-bridge`, different venue |
| **Multi-venue scar merge test** | Medium | Schema supports; needs second venue running |
| **Display = final artwork** | Explicitly no | Canvas cube is POC placeholder only |
| **Pd log throttling** | Low | Cosmetic |
| **Commit / CI for stack** | This session | Pushed with STATUS doc |

---

## Not accomplished (ops / mint)

Per [AUTOMATION.md](./AUTOMATION.md) and [program/README.md](../../../program/README.md):

| # | Component | Status |
|---|-----------|--------|
| 1 | Drop JSON generator | ❌ Not built |
| 2 | Transient Labs mint script (viem) | ❌ Not built |
| 3 | Post-mint hook → Supabase seed row | ❌ Not built |
| 4 | Catalog sync (`data/catalog.json`) | ❌ Not built |
| 5 | Dashboard → Approve → mint flow | ❌ POC only in `program/dashboard/` |
| 6 | Metadata pinning (IPFS/Arweave) | ❌ Workflow documented, not automated |
| 7 | Manifold path | ❌ Deferred; TL primary |

**Recommended next ops step:** one manual TL mint → write seed to Supabase → confirm bridge loads it → then automate.

---

## How to run (daily)

### Required

```bash
cd machine-aesthetic/surrender-stack-poc
node bridge/dna-bridge.mjs          # Terminal 1 — brain + DNA
```

Pure Data: open `pure-data/surrender-dna-vanilla.pd` → **Media → DSP on**

### Optional (local Mac browser)

```bash
node web/serve.mjs
# http://127.0.0.1:8791/display.html?venue=mac-local
```

### Phone (hosted — recommended)

```bash
npm run deploy-controller
# https://surrender-machines-pocv1.web.app/display.html?venue=mac-local
```

### Health checks

```bash
npm run diagnose
npm run status
npm run unpause          # clear stuck pause
```

---

## Terminal count (correct setup)

| Process | Count |
|---------|-------|
| `node bridge/dna-bridge.mjs` | **1** |
| `node web/serve.mjs` | 0–1 (local display only) |
| Pd vanilla patch | **1** |
| Phone page | 1 (hosted or LAN) |

---

## Position in larger plan

From [RESOLVED-DIRECTION.md](../../docs/RESOLVED-DIRECTION.md):

| Phase | Status |
|-------|--------|
| **A** — Freeze Loop Art Critique (browser artwork) | In progress (separate from this POC) |
| **B** — OpenFrameworks port | After freeze |
| **Stack POC** (this folder) | ✅ Proves cloud + DNA + Pd spine |
| **Program / TL mints** | Next ops track |

---

## Comparable work (context)

Others do **pieces** of this (OSC installs, seed generative, dynamic NFTs, responsive rooms). The combined braid — **Machine DNA kernel + multi-venue scars + Firebase operator + Supabase genome + OSC bodies + daily mint ops** — is still largely open field. See thread notes in this doc’s git history.

---

## File map

```
surrender-stack-poc/
├── bridge/dna-bridge.mjs       ← install brain
├── lib/                        ← OSC, plain Pd, scar merge, config
├── web/display.html            ← cube + controls (one screen)
├── web/serve.mjs               ← local :8791
├── pure-data/                  ← vanilla (7401) + OSC (7400)
├── schema/supabase.sql
├── config/*.example.mjs        ← copy to *.local.mjs (gitignored)
├── scripts/                    ← diagnose, status, deploy, unpause, reset
├── docs/                       ← STACK, STATUS, AUTOMATION, TROUBLESHOOTING, …
└── firebase.json               ← Hosting deploy config
```

---

*Last updated: 2026-06-11 — Surrender Stack POC session.*
