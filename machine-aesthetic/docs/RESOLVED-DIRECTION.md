
# Resolved direction — kit, Critique, sound, philosophy

**Mark Walhimer** — consolidated from studio thread (June 2026).  
Living plan: what to build, in what order, and what to defer. Not a sales doc.

Related: **[SURRENDER-MACHINES-PROJECT.md](./SURRENDER-MACHINES-PROJECT.md)** (master project doc) · [artist-statement-surrender-machines.md](./artist-statement-surrender-machines.md) · [essay-antimaterial-en-draft.md](./essay-antimaterial-en-draft.md) · [essay-antimaterial-outline.md](./essay-antimaterial-outline.md) · [OSC.md](./OSC.md) · [console/port/PHASES.md](../console/port/PHASES.md) · [emergent-dna/README.md](../emergent-dna/README.md) · [console/README.md](../console/README.md) · [console/STYLE-GUIDE.md](../console/STYLE-GUIDE.md)

---

## Thesis (one line)

**One species (MachineDNA / seed), many bodies** — browser, object, room, light, sound — connected by **machine state over OSC**; philosophy leads, hardware follows.

---

## Lead with philosophy (public face)

Do **not** open with Three.js, SO-101, Raspberry Pi, or LeRobot.

Lead with:

- **Surrender** over ego — the work must yield, drift, break; polish is not the goal.
- **Lifespan** — built to run down, not loop forever; terminal condition the visitor cannot override.
- **Mechanical Sigh** — release of the “desire to compute”; parallel to Zen movement from desire toward emptiness.
- **Ghost in the machine** (Ryle) — sliders labeled anger, ego, attachment are **ours**, projected onto code.
- **Counter-production** (Doreen Ríos) — mechanism taken past design intent toward its own end.
- **Simondon** — technical object with its own milieu and end.
- **Zero state** — one clean tone, no spectacle; surrender is recognizing the feeling was always yours.
- **Co-creation / kintsugi** — visitors load stress; breaks become scars, not bugs to hide.

**Three states** (same organism):

| State | Form |
|-------|------|
| 1 | **Digital** — immersive room (Loop Art Critique / Ghost 77823) |
| 2 | **Object** — Console-scale or singular artifact |
| 3 | **Physical installation** — walk-through room + light + sound (+ optional drawing body later) |

Tech stack belongs in an **appendix** (“Bodies / hosts”), not the first paragraph.

---

## Build order (resolved — do this sequence)

### Phase A — Loop Art Critique in Three.js (finish & freeze)

**Why first:** Proof of concept for the three-room votive machine; file size is already blocking further growth in place without a deliberate build-out pass.

**Goal:** Complete the Critique in **Three.js** to a defined “done,” then **freeze** browser artwork (no further feature churn unless explicitly authorized).

**Definition of done:**

- All three rooms/zones walkable; surrender machine runs to terminal / zero state in session.
- Museum / wall text readable in-world (ghost, sliders, lifespan, zero state).
- One captured walkthrough (video or stills) for curators — not for sale.
- File structure manageable (split only if needed for maintenance — wiring/docs OK; **do not** substitute or port artwork without authorization).

**Explicitly not blocking Phase A:**

- Selling anything.
- SO-101 arm purchase.
- Beelink / Pi / four-panel LED purchase (helpful for install, not required to **freeze** browser PoC).
- OF feature parity with every browser detail.

**Studio momentum (not hardware):** [ANTI]MATERIA essay for Doreen Ríos after freeze + video. **Artist Commons** residency — interview stage; treat as continuity workspace, not sole funding. **Lumen** / **ARS** — apply when relevant; long shots, do not block build.

---

### Phase B — Port to OpenFrameworks (after freeze)

**Why:** Same species, physical-adjacent host; canonical browser artwork stays untouched.

**Where port work lives:** `machine-aesthetic/console/` only (see [PHASES.md](../console/port/PHASES.md)).

**Already done (Ghost Room 77823, seed 77823):**

| Phase | Status | Deliverable |
|-------|--------|-------------|
| 0 | Done | Pd + OSC zone bridge |
| 1 | Done | OF white room + ghost wireframe |
| 2 | Done | OF Room A code mural + text cylinder |
| 3 | Done | OF Room C surrender machine embed |

**After Critique freeze:** extend OF port to match **finished** Critique scope (not an endless chase of live browser edits).

**Rule:** C++ / OF is **eyes** (and optionally local audio); **Pure Data** is primary **ears** on multi-process installs. One machine state drives both ([HOSTS.md](../emergent-dna/docs/HOSTS.md)).

---

### Phase C — OSC bus (habit, not a new project)

- Document every cross-boundary address in [OSC.md](./OSC.md) (`/sm/*`).
- Stream **machine state** (zones, gear, stress, DNA) — never pixels or audio over OSC.
- Default habit: UDP **7400** on loop/console work unless table says otherwise.
- LED success pattern: repeat for Pd and Roland — **same spine**, different host.

---

### Phase D — Pure Data + DSP + Roland S-1

**Pd:** Primary soundscape engine; friction of mechanism, not soundtrack.

- Zone + stress + surrender band → macros.
- Smooth telemetry (`line~` / low-pass); raw servo-like streams avoided for Zen aesthetic.
- **Zero state:** single clean tone documented as “77823 score.”

**Roland S-1:** **Performer / voicing**, not a second brain.

- MIDI → Pd to modulate macros; or print takes into patch for autonomous hours.
- One clock: machine → OSC → Pd; S-1 guest only.

---

### Phase E — LED wall (Pi gateway + panels)

**Role:** Light is a **body** of the species — driven by machine state over OSC, not a second creative stack.

**Planned hardware (resolved June 2026):**

| Item | Role | Notes |
|------|------|--------|
| **4× LED panels** | Tile into large surface (e.g. 2×2 → **500×500** at 250×250 each) | Vendor (China): **P1.95**, **250×250**, ~**$40–50**/panel — confirm HUB75 pinout + scan before order |
| **Raspberry Pi 5** (4–8 GB) | **LED gateway only** — matrix driver + OSC subscriber | **Not** Loop/WebGL/OF brain; sits **between** Mac studio and install brain |
| **Pi LED HAT** (vendor 3-cable / HUB75 interface) | Drive up to **500×500** per vendor spec | Verify max pixels, power injection, and **5 V PSU** (amps for 4 panels) with supplier; prefer **external brick**, not sealed internal PSU for long runs |
| **5 V power** + data ribbons | Panel + hat wiring | Budget separately from panel quote |

**Already proven on Mac:** Teensy + minimal receiver pattern — same **OSC** addresses (`/sm/led/*`); Pi implements receiver + mapper for the big wall.

**Test:** Zone/stress from brain → OSC → Pi → panels; Pd on brain machine still hears same `/sm/*`; optional browser/OF UI agrees.

**Mac (now):** Author Loop Critique, prototype OSC → LED until Pi is wired.

**Defer:** CircuitPython generative logic on panels (brain stays Mac / Beelink; Pi runs receiver/mapper only).

---

### Phase F — Pi bodies on LAN (LED wall + touch objects)

**Show brain for this phase: MacBook Pro** — OF, Pd, Chromium (Loop), OSC hub. No Beelink required until projection-scale install (Phase H).

**Three roles — do not collapse into one Pi:**

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 1 — STUDIO + SHOW BRAIN (now → medium install)         │
│  MacBook Pro · author · Loop build-out/freeze · git push       │
│  Runs OF + Pd + OSC · HDMI to monitor only (no projector yet)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ OSC /sm/*  (switch or 127.0.0.1)
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  TIER 3a — Pi #1 LED      │    │  TIER 3b — Pi #2 touch    │
│  Pi 5 + HAT · 4× panels   │    │  Pi 5 + 7–10″ HDMI USB    │
│  /sm/led/* · matrix only  │    │  touch · object / kiosk   │
│  NOT main browser host    │    │  lightweight page or OF   │
└──────────────────────────┘    └──────────────────────────┘
```

- **One Pi = one job** — do not drive 500×500 LED timing and heavy kiosk on the same board.
- **Touch LCD** (~$40–80 panel) **before Beelink** — inexpensive **State 2 object** body; same OSC species as LEDs.
- **Gigabit switch** + Cat6 when Mac + two Pis run together (home test, Artist Commons).

**Phase F done when:** Mac runs Critique or OF phase scripts + Pd; Pi #1 drives tiled wall from `/sm/led/*`; Pi #2 (or second phase) shows touch object from same `/sm/*`; zero state readable in room **without** projector or Beelink.

---

### Phase G — Deferred ops (not blocking PoC)

| Item | When |
|------|------|
| **USB fans** | When Pi/gear lives in a closed pedestal or case |
| **Projector** (rent Epson-class first) | Phase H — room-scale image |
| **Projection mapping** | After projector + frozen content + stable brain |
| Firebase / multi-site lineage | When two sites share scars |
| Sellable numbered Console (Mode C) | After PoC + in-person zero state; **not** NFT / dollar screenshots |

---

### Phase H — Large install brain (Beelink + room scale) — later

**Beelink SER5-class** (~$250–380, **16 GB**, external power brick) — buy when entering **projection, projection mapping, or robotic arm** work, or when Mac cannot stay tethered 24/7 at a venue.

| Trigger | Why Beelink then |
|---------|------------------|
| **Projector / mapping** | Needs dedicated HDMI brain, hours-long kiosk, OF + Pd without Mac in the room |
| **Robotic arm (SO-101+)** | Reliable LAN host + serial/OSC bridge alongside show |
| **24/7 venue** | Mac leaves; install PC stays ([STYLE-GUIDE](../console/STYLE-GUIDE.md)) |

Until Phase H: **Mac + Pis** is the full stack for LED wall, touch objects, sound, and Loop/OF port.

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 2 — INSTALL BRAIN (Phase H only)                       │
│  Beelink · Ubuntu · OF · Pd · Chromium · HDMI → projector    │
└──────────────────────────────┬──────────────────────────────┘
                               │ OSC → Pi LED · Pi touch · (later arm)
```

**Also parked in Phase H:** SO-101 / Sumi-e scroll — drawing **body** after OSC stroke model exists.

---

## Purchase plan (resolved priority)

| Priority | Buy | Approx. | When |
|----------|-----|---------|------|
| **1** | Loop Critique build-out on **Mac** (software only) | $0 | **Now** — finish + freeze for antimaterial / residencies |
| **2** | **4×** 250×250 **P1.95** panels + **5 V PSU** + cables | ~**$160–200** + PSU | Vendor spec confirmed |
| **3** | **Pi #1** — Pi 5 + **LED HAT** + case/PSU/SD | ~**$100–150** | With panels; `/sm/led/*` receiver |
| **4** | **Pi #2** — Pi 5 (or 4) + **7–10″ HDMI USB touch** LCD | ~**$120–180** Pi + display | **Before Beelink** — object/kiosk body |
| **5** | **Gigabit switch** + 2–3× Cat6 | ~**$35–55** | Mac brain + Pi(s) on LAN |
| **6** | USB fans (optional) | ~**$10–20** | Closed pedestal / case |
| **—** | **Beelink SER5** | ~**$250–380** | **Phase H only** — projection, mapping, arm, or 24/7 without Mac |
| **—** | Projector (rent → buy) | $300–800+ | Phase H with Beelink |
| **—** | Second laptop | — | **No** |
| **—** | SO-101 arm | — | Phase H / parked |

**Residency fit:** Artist Commons = **Mac + switch + Pi LED (+ Pi touch)**; PoC video + essay first. Beelink **not** required for residency unless they provide projector and you commit to mapping.

**Supersedes for Pi roles:** [STYLE-GUIDE](../console/STYLE-GUIDE.md) kit BOM (laptop brain, Pi as generic I/O) — use this table instead.

Do not lead grants or wall text with this table.

---

## Robotic drawing arm (SO-101 — parked)

- **R0 testbed** ~$200–300 if needed later; not upgradable servos — future arm reuses **OSC + seeds**, new kinematics layer.
- **Art lineage:** Cohen (rules/seed), Tresset (performance), Pfeffer (ink/material), Chung/Moura (feedback) — optional citations, not headline.
- Control: thin **Python or OF serial** bridge; creative layer stays **OF / Pd / OSC**; LeRobot/ML **not** required for generative Zen painting.
- Safety: software cage, spring brush, continuous ink, E-stop for public install.

---

## Selling (explicitly deferred)

**Now:** No product SKUs, no screenshot NFTs, no “dollar prints.”

**Later possibilities (maybe):**

- Numbered **Console** object (touch + mini PC + locked seed).
- Commissioned **room** install.
- Grant / fellowship (philosophy + walkthrough + OSC doc).

**Now metric:** Someone else can walk the votive room and hear **zero state**.

---

## Artist / curator references (short)

| Name | Use |
|------|-----|
| Harold Cohen (AARON) | Code as artwork; plotter as output |
| Patrick Tresset | Performative arm; embrace limit |
| Arnaud Pfeffer | Ink, gravity, material finish |
| Sougwen Chung | Live duet (optional mode) |
| Leonel Moura | Canvas-aware feedback (camera on scroll) |

---

## Vocabulary (Emergent DNA)

| Term | Meaning |
|------|---------|
| **MachineDNA** | Seeded blueprint: body, metabolism, decay |
| **Kernel** | Virtual mechatronics — one state → sight + sound |
| **Species** | Same genome, different **expression** per host |
| **Mechanical Sigh** | Final low-energy release |
| **Zero state** | Surrender of projection; minimal tone |
| **Host** | Three.js, OF, Pd, Teensy, Pi — not the organism |

Principles: co-creation · surrender over ego · kintsugi breaks · one clock · lifespan.

---

## What not to do (incident lessons)

- Do not edit Loop / Critique **artwork files** for “wiring” without explicit authorization.
- Do not substitute three-core ports, iframes, or installation pages for user-named sketches.
- Do not open with Hugging Face / ACT / VLA when describing the work to curators.
- Do not conflate installation brain (Mac/Linux + OF + Pd) with CircuitPython on LED path.

---

## Immediate next actions

1. **Build out** Loop Art Critique in Three.js to Phase A “done.”
2. **Freeze** browser Critique → walkthrough **video** + link for [ANTI]MATERIA / Doreen Ríos.
3. **Artist Commons** — prepare for interview; same PoC story (votive room, not hardware deck).
4. **Port / align** OpenFrameworks under `console/` to frozen Critique (phases 0–3 already exist for Ghost 77823).
5. **Expand Pd** on `/sm/*`; Roland S-1 as voicing on brain tier.
6. **Order panels + Pi #1 + HAT** when pinout/PSU confirmed; map `/sm/led/*` Mac → Pi.
7. **Pi #2 + touch LCD** before any Beelink purchase; kiosk page or light OF from OSC.
8. **Switch + LAN test** with Mac as brain (Commons-friendly stack).
9. **Beelink + projector + mapping + arm** — Phase H only; do not block 1–8.
10. **Ignore retail sales**; Lumen / ARS optional.

---

## Document map

| Doc | Role |
|-----|------|
| This file | Resolved direction & build order |
| [artist-statement-surrender-machines.md](./artist-statement-surrender-machines.md) | Public philosophy |
| [OSC.md](./OSC.md) | Network contract |
| [console/port/PHASES.md](../console/port/PHASES.md) | OF port status |
| [console/README.md](../console/README.md) | Launcher, Linux kit, daily loop |
| [emergent-dna/README.md](../emergent-dna/README.md) | Kernel principles & API |

---

*Updated June 2026: Mac brain through medium install; Pi LED + Pi touch before Beelink; Beelink = Phase H (projection, mapping, arm); 4× P1.95 panels; antimaterial + Commons path.*
