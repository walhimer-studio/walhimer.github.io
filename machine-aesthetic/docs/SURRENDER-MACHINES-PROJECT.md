# Surrender Machines — Project Document (June 2026)

**Mark Walhimer · Walhimer Studio**  
Single reference for philosophy, architecture, what is built, prototyping hardware, and next steps.  
Consolidates studio thread, stack POC session, object sketch (2026-06-11), and [RESOLVED-DIRECTION.md](./RESOLVED-DIRECTION.md).

## Interactive overview (HTML)

| View | Open |
|------|------|
| **Project overview** | [overview/surrender-machines-project-overview.html](./overview/surrender-machines-project-overview.html) |
| **Loop Art Critique** (includes live work link) | [overview/surrender-machines-loop-art-critique-overview.html](./overview/surrender-machines-loop-art-critique-overview.html) |
| **Prototyping board layout** (24×24 zone + wiring diagrams) | [overview/surrender-machines-prototyping-board-layout.html](./overview/surrender-machines-prototyping-board-layout.html) |
| **Studio dashboard** (mint · catalog · social) | [../../program/dashboard/studio-dashboard.html](../../program/dashboard/studio-dashboard.html) |
| **Stack POC runtime status** | [../surrender-stack-poc/docs/STATUS.md](../surrender-stack-poc/docs/STATUS.md) |

This markdown file is the **canonical text**; the HTML pages are the **curator/studio presentation layer** (same content, navigable UI).

| Deep dives | Path |
|------------|------|
| Stack POC runtime + session status | [surrender-stack-poc/docs/STATUS.md](../surrender-stack-poc/docs/STATUS.md) |
| Build phases A–H (purchase plan) | [RESOLVED-DIRECTION.md](./RESOLVED-DIRECTION.md) |
| Console / Ghost Room OF port | [console/README.md](../console/README.md) · [console/port/PHASES.md](../console/port/PHASES.md) |
| Emergent DNA kernel | [emergent-dna/README.md](../emergent-dna/README.md) |
| Daily mint / catalog ops | [program/README.md](../../program/README.md) |
| Mint automation bridge | [surrender-stack-poc/docs/AUTOMATION.md](../surrender-stack-poc/docs/AUTOMATION.md) |

---

## 1. Thesis

**One species (`surrender-machines`), one seed, many bodies** — browser room, console object, installation — connected by **Machine DNA** (Emergent kernel) and **machine state over OSC**. Philosophy leads; hardware follows.

Public face: surrender, lifespan, mechanical sigh, scars/kintsugi, zero state — not Three.js or Raspberry Pi in the first sentence.

---

## 2. Three bodies (same organism)

| State | Form | Status (June 2026) |
|-------|------|---------------------|
| **1 · Digital** | Loop Art Critique / Ghost 77823 (immersive browser) | In progress — **Phase A: finish & freeze** |
| **2 · Object** | Console-scale enclosure (24×24 plywood, LCD, touch, sound, LED) | Concept + BOM sketched; stack POC proves spine |
| **3 · Installation** | Walk-through room, projectors, LED wall, multi-venue scars | OF port started; full room **Phase H** |

Seed **77823** is the reference species instance across all three.

---

## 3. System architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  OPERATOR LAYER                                                  │
│  Phone / touch / buttons / camera+ML → Firebase (controls only)  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  INSTALL BRAIN (Mac now → AMD 7 / Beelink later)                 │
│  dna-bridge — genome authority, one instance per venue           │
│    · Emergent DNA kernel (seed, generation, scars, vitality)     │
│    · reads Firebase operator                                     │
│    · optional vision sidecar (camera → motion/presence signals)  │
└───┬─────────────┬──────────────┬──────────────┬───────────────────┘
    │             │              │              │
    ▼             ▼              ▼              ▼
 Supabase      Firebase       OSC :7400      Plain :7401
 genomes+      genome HUD     OF · Pis ·     Mac Pd vanilla
 scars         for displays   Linux Pd       (dev ears)
 merge
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  BODIES (expression only — no second creative brain)             │
│  Browser · OF room · LCD console · Pd/DSP · LED (Pi/Teensy)     │
│  Projectors · fans/silk · (later) SO-101 drawing arm             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  OPS LAYER (separate)                                            │
│  program/ · Transient Labs mint · catalog WS-NNNNNN · social     │
│  Post-mint hook → seed row in Supabase (not built yet)           │
└─────────────────────────────────────────────────────────────────┘
```

**Rules**

- Firebase = **operator input only** (remote control, pause, cube, future vision scalars).
- Supabase = **genome + scars** system of record; cross-venue merge ~15 min + Realtime.
- OSC = **hot path** for local bodies (`/sm/*`); never pixels or audio over OSC.
- Mint platforms = **provenance + checkout**; they do not replace DNA or the brain.

---

## 4. Accomplished (stack POC — pushed `f991d72`)

Location: [`machine-aesthetic/surrender-stack-poc/`](../surrender-stack-poc/)

| Area | Done |
|------|------|
| **dna-bridge** | Emergent DNA kernel, Supabase persist, scar merge, Firebase genome writes |
| **Cloud** | Firebase `surrender-machines-pocv1` + Supabase project (user-configured) |
| **Display** | Single screen: wireframe cube + operator panel (`display.html`) |
| **Operator** | `leftRight`, `upDown`, `speed`, `stopMotion` — syncs phone/Mac; pause mutes Pd |
| **Audio** | Plain UDP → Pd vanilla :7401; `stop` mutes; speed scales hz |
| **OSC** | Binary `/sm/*` on :7400 for install path |
| **Hosting** | `npm run deploy-controller` → phone HTTPS (no Mac LAN/firewall) |
| **Scripts** | diagnose, status, unpause, reset-venue, network-check |
| **Docs** | STATUS, STACK, OSC, TROUBLESHOOTING, AUTOMATION |

**Daily run**

```bash
cd machine-aesthetic/surrender-stack-poc
node bridge/dna-bridge.mjs          # required — brain + DNA
# Pd: surrender-dna-vanilla.pd, DSP on
# Phone: Firebase Hosting display URL
# Optional Mac browser: node web/serve.mjs
```

**Also done elsewhere (pre-POC):** Ghost Room OF phases 0–3, emergent-dna kernel, console launcher scripts.

---

## 5. Object prototype — hardware sketch (2026-06-11)

**Board layout (SVG):** [overview/surrender-machines-prototyping-board-layout.html](./overview/surrender-machines-prototyping-board-layout.html) — zone map, brain/network wiring, hand-hold cutouts.

Hand-drawn BOM + notes (studio scan). These are **prototyping components for the next build phase** — the physical **State 2 object**, not the final monumental install.

### 5.1 Enclosure & brain (page 1)

| Component | Role in stack |
|-----------|----------------|
| **AMD 7** (mini PC) | Install brain — replaces MacBook; runs `dna-bridge`, OF, Pd, vision |
| **Switch + WiFi** | LAN for OSC, Pis, Teensy receivers |
| **Din rail** | Mount PSUs, relays, fan controllers inside enclosure |
| **Maple plywood 24×24** + **Sintra** | Enclosure; cutouts, handle |
| **Power strip** | Bench / object power |
| **LCD** | Status surface — sketch: **“ON” / “OSC Active”** |
| **Touch screen** | On-object operator (alternative/complement to phone) |
| **Buttons** (×5) | Hard controls — pause, zone, nudge |
| **Teensy 4.1** | Dumb pixel/actuator receiver (LED matrix path) |
| **Novastar + LED panel** | Light body — `/sm/led/*` |
| **Small projector + projector ×2** | Object / room scale image (Phase H) |
| **Speakers + DSP speakers** | Pd or OF → amplification |
| **Motors** | Kinetic elements |
| **S01 robot arm** | Drawing body — **parked** until Phase H / OSC stroke model |
| **Fans** | Cooling enclosure; also concept: **fans + silk + sensors** (kinetic) |

### 5.2 Sound & concept (page 2)

| Item | Role |
|------|------|
| **Roland S-1** | Performer / voicing — MIDI guest to Pd, not second brain |
| **PO-33** | Sample / noise layer |
| **M8 headless** | Tracker / generative sequences |
| **Generative audio/visuals** | Species output across bodies |
| **Noise machine — remote control** | Firebase operator (built in stack POC) |
| **Mini cameras** | “Inside machine” POV; feeds for projection or ML |
| **Chutes and Ladders** | Structural / narrative metaphor |
| **“Inside Machine”** | Concept title / interior viewpoint |
| **Metropolis II (Chris Burden)** | Reference — kinetic systemic motion |
| **Steam for tornado** | Atmospheric / kinetic idea |
| **Dance with octopus — fans, silk, sensors** | Pneumatic/fabric layer; sensors trigger fans |

### 5.3 Camera + machine learning (added)

| Layer | Where | Output |
|-------|-------|--------|
| **Cameras** | USB / CSI / mini cams in enclosure | Raw frames stay on brain |
| **Vision / ML** | AMD brain (OF OpenCV or Python sidecar) | **Signals only** — motion, presence, zone |
| **Integration** | Firebase `operator/vision` or OSC `/sm/vision/*` | Feeds operator; **DNA kernel stays authority** |

**Phase vision-1:** motion energy → one float → speed or fan trigger.  
**Phase vision-2:** zones (Leonel Moura–style canvas-aware feedback).  
**Do not:** run ML on Teensy/Portal; do not send video over Firebase.

---

## 6. Build order (integrated)

| Phase | What | Status |
|-------|------|--------|
| **A** | Finish & freeze Loop Art Critique (browser artwork) | In progress |
| **Stack POC** | Firebase + DNA + Supabase + Pd + display | **Done** |
| **B** | OpenFrameworks port (console/) after freeze | Phases 0–3 done; extend to Critique scope |
| **C** | OSC bus habit — document all `/sm/*` | Ongoing |
| **D** | Pd + DSP + Roland S-1 voicing | Pd POC done; S-1 integration next |
| **Object prototype** | Enclosure BOM §5 — AMD brain, LCD, touch, sound, one LED path | **Next hardware track** |
| **E–F** | Pi LED gateway + touch Pi kiosk | Per RESOLVED-DIRECTION purchase table |
| **Vision** | Camera + ML sidecar on brain | After object shell or parallel on Mac |
| **G** | Deferred ops (mapping, multi-site, sellable edition) | Later |
| **H** | Beelink / room scale, projector, arm | Later |
| **Ops** | Transient Labs mint, drop JSON, catalog, post-mint → Supabase | **Next software ops track** |

---

## 7. Prototyping priorities (next 90 days)

### Track 1 — Software spine (extend POC)

1. Commit habit: stack POC on `main` ✅  
2. **Vision sidecar** — one camera, motion scalar → Firebase or OSC  
3. Wire vision into fan relay or organism `presence` (when ready)  
4. **Post-mint hook** — manual TL mint → Supabase seed row → bridge reload  
5. Automate: `program/dashboard` → TL script → catalog  

### Track 2 — Object prototype (hardware)

Minimum viable object (before projectors / arm):

| Priority | Buy / build |
|----------|-------------|
| 1 | **AMD 7** mini PC as brain |
| 2 | **24×24 enclosure** (maple + Sintra) |
| 3 | **LCD** — OSC Active status |
| 4 | **Touch OR buttons** + keep phone Firebase path |
| 5 | **USB camera** (vision-1) |
| 6 | **Pd + DSP speakers** (or reuse Mac Pd until AMD stable) |
| 7 | **Teensy OR Pi** — one LED receiver path |
| 8 | **Switch** + din rail + fans (thermal) |

Defer to Phase H: dual projectors, Novastar wall, S01 arm, steam/tornado full build.

### Track 3 — Artwork & public

1. **Phase A freeze** — Critique walkthrough for curators  
2. **[ANTI]MATERIA essay** — Doreen Ríos  
3. Artist Commons — Mac + object PoC video  
4. First **Transient Labs** drop with seed in metadata + Supabase row  

---

## 8. Operator & data model (current)

**Firebase** (`surrender-stack-poc/operator/{venue}`)

| Field | Effect |
|-------|--------|
| `leftRight` | Cube yaw |
| `upDown` | Cube pitch |
| `speed` | Spin + audio hz scale |
| `stopMotion` | Pause cube + mute Pd |

**Future:** `vision.motion`, `vision.presence`, `vision.zone` from camera ML.

**Supabase** — `genomes`, `scars`, `venues` — see [schema/supabase.sql](../surrender-stack-poc/schema/supabase.sql).

**OSC** — `/sm/*` — see [OSC.md](./OSC.md) and [surrender-stack-poc/docs/OSC.md](../surrender-stack-poc/docs/OSC.md).

---

## 9. What this is not (yet)

- Not the final artwork (browser cube is POC placeholder)  
- Not OpenFrameworks on the object (Phase B/C)  
- Not automated minting (ops track)  
- Not multi-venue scar merge tested in production  
- Not projection mapping or robotic drawing  
- Not a Manifold-first strategy ( **Transient Labs primary** per program)  

---

## 10. Comparable context (short)

Others do **pieces**: OSC installs, seed generative art, dynamic NFTs, responsive rooms. This project’s braid — **DNA kernel + cross-venue scars + Firebase operator + Supabase genome + OSC bodies + daily mint ops + three physical scales** — is still largely open field.

References worth study: deafbeef (generative AV + crypto), Econtinuum / Woven Studio (eco-responsive install), Tjo on Transient Labs (evolving token narrative), Chris Burden Metropolis II (kinetic systemic scale).

---

## 11. Document index

| Question | Read |
|----------|------|
| What runs today? | [surrender-stack-poc/README.md](../surrender-stack-poc/README.md) |
| Session accomplishments? | [surrender-stack-poc/docs/STATUS.md](../surrender-stack-poc/docs/STATUS.md) |
| Troubleshooting phone/Pd/firewall? | [surrender-stack-poc/docs/TROUBLESHOOTING.md](../surrender-stack-poc/docs/TROUBLESHOOTING.md) |
| TL / Manifold automation? | [surrender-stack-poc/docs/AUTOMATION.md](../surrender-stack-poc/docs/AUTOMATION.md) |
| Purchase order & phases? | [RESOLVED-DIRECTION.md](./RESOLVED-DIRECTION.md) |
| Philosophy & statement? | [artist-statement-surrender-machines.md](./artist-statement-surrender-machines.md) |
| Daily publishing? | [program/README.md](../../program/README.md) |

---

## 12. One-page summary

**Built:** Machine DNA brain (`dna-bridge`), cloud operator (Firebase), genome persistence (Supabase), Mac Pd ears, phone-ready display, pause/sync, OSC spine documented.

**Sketching now:** 24×24 console object — AMD brain, LCD, touch, cameras+ML, sound, LED, fans/silk — as prototyping kit for State 2.

**Next:** (1) object prototype shell + AMD brain, (2) camera motion → operator, (3) first Transient Labs drop wired to Supabase seed, (4) freeze browser Critique, (5) extend OF port.

---

*Last updated: 2026-06-11 · Walhimer Studio · species `surrender-machines` · seed `77823`.*
