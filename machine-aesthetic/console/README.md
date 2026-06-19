# Console

**Console** — a portable generative body for Emergent DNA. Same word as *to console*: the device watches a living species; the visitor tends it.

**Vision, hardware kit, sellable editions, costs:** [STYLE-GUIDE.md](STYLE-GUIDE.md)

Stack: **openFrameworks** + **Pure Data** + **OSC** (`/sm/*`). Seed **77823** (Ghost room). Loop Art Critique: [Ghost 77823 room](https://mark-walhimer.com/sketches/loop-art-critique-2026/machine-aesthetic/ghost_dense_77823_room.html).

---

## One-click launch (Mac)

| File | Action |
|------|--------|
| **[Ghost Room 77823.command](Ghost%20Room%2077823.command)** | Double-click — starts launcher server + opens control panel in browser |
| **[Ghost Room 77823.html](Ghost%20Room%2077823.html)** | Double-click — reconnects to control panel if launcher is already running |

1. Copy `launch.env.example` → `launch.env` and set `OF_ROOT` (your openFrameworks path).
2. Double-click **`Ghost Room 77823.command`**.
3. In the browser panel, click **Launch native walkthrough** (or **Launch browser room** for Phase 0).
4. Turn **DSP on** in Pure Data.

Control panel: `http://127.0.0.1:8787/` · OSC `127.0.0.1:7400` · seed **77823**

Terminal equivalent:

```bash
cd machine-aesthetic/console
./scripts/launch-ghost-room.sh
```

Optional: drop a built `GhostRoom77823.app` into `console/bin/` to skip compile on launch.

---

## Your workflow (confirmed)

| Step | What |
|------|------|
| **1. Author on MacBook Pro** | Keep working the way you do — iterate loop-scale projects (Three.js rooms, openFrameworks, Pd, emergent DNA). Push to GitHub. |
| **2. Prototype on Linux laptop** | Pull, run, listen, look. Built-in screen + **HDMI** (TV, **projector**, wall). Same code as install. |
| **3. Grow the install kit** | USB **Teensy** + **Daisy SP** on the Linux laptop; optional **Raspberry Pi** peers for motors / interface boards; **switch** on LAN — **full room in a small box**. |
| **4. Sell numbered pieces** | Off-the-shelf **touchscreen** + **x86 mini PC** + your locked image → one generative artwork, edition of *n*. |

One repo, one species, many bodies — Mac writes; Linux runs; hardware scales up or down.

---

## Two machines, one repo

```
MacBook Pro                         GitHub                    Linux laptop
────────────                        ──────                    ────────────
Loop art critique · OF · Pd   ──►  push  ──►  pull
Iterate as you do today                                  Run · evaluate · install brain
                                                              │
                    ┌─────────────────────────────────────────┤
                    │                                         │
              Built-in screen                          HDMI → projector
                    │                                         │
                    └────────────── LAN (switch) ───────────────┘
                              │              │
                         Teensy +       Raspberry Pi
                         Daisy SP       (motors / I/O)
                         LED / OSC
```

| Machine | Role |
|---------|------|
| **MacBook Pro** | Primary studio — no change to how you work |
| **Linux laptop** | Runtime prototype; travel; install brain until fixed rack |
| **HDMI / projector** | Plugs into **Linux** — room-scale expression |
| **Teensy + Daisy SP** | USB to Linux — OSC → LEDs; Daisy for analog sound path (optional alongside Pd) |
| **Pi + switch** | Peers on LAN — motors, mapping, bridges; not the main Loop brain |

---

## Portable install kit (small box)

Everything below shares **`/sm/*` OSC** — same kernel, same loop logic:

| Item | Role |
|------|------|
| **Linux laptop** | Brain — kiosk / OF / Loop HTML + Pd |
| **Ethernet switch** | LAN between brain, Pi, optional second screen |
| **Projector** (optional) | HDMI from Linux — full room |
| **Teensy 4.1** (or ESP32) | LED panel, DMX, fast I/O |
| **Electrosmith Daisy SP** | Embedded audio I/O / synthesis peer (USB or UART from Teensy/Linux) |
| **Raspberry Pi 5** | Motor drivers, interface boards, projection helper — OSC subscriber |

Fits a **small road case**: plug in at a venue, power the switch, run.

---

## Sellable numbered edition (separate SKU)

For collectors — not the travel/install kit, a **finished object**:

| Part | Role |
|------|------|
| **Off-the-shelf HDMI touchscreen** (8–15″) | Domestic Console surface |
| **x86 mini PC** (16 GB, N100–i3 class) | Hidden behind panel; kiosk on boot |
| **Your image** | Locked seed, numbered edition, certificate |

Same codebase as prototype; factory image + serial number. See [STYLE-GUIDE.md — Sellable editions](STYLE-GUIDE.md#sellable-numbered-editions).

---

## Daily loop

1. Edit on **MacBook** — loop folders, `machine-aesthetic/console/`, emergent-dna.  
2. `git push`.  
3. **Linux laptop:** `git pull` → restart Pd + artwork.  
4. Judge on Linux screen (and projector if connected).  
5. At install: add switch, Teensy, Daisy, Pi as needed — no rewrite.

---

## What runs on the Linux body

```
openFrameworks Console  —or—  Chromium → Loop Art Critique
            │
            ▼ OSC :7400
       Pure Data (+ optional Daisy SP path)
            │
     ┌──────┴──────┐
  HDMI          USB / LAN
 projector      Teensy · Daisy · Pi
```

Details: [`../docs/OSC.md`](../docs/OSC.md) · [`../emergent-dna/cpp/`](../emergent-dna/cpp/)

| Port | UDP `127.0.0.1:7400` | Default for Console + Ghost Room Phase 0 |

---

## Ghost Room 77823 port (Phases 0–3)

Browser artwork stays at `sketches/loop-art-critique-2026/machine-aesthetic/` — **not modified**.

| Phase | Docs | Run |
|-------|------|-----|
| **0** | **Done** — [port/PHASES.md](port/PHASES.md) · [port/ROOM-MAP.md](port/ROOM-MAP.md) | `./scripts/run-phase0.sh` |
| **1** | **Done** — OF walk + ghost wireframe + auto zone OSC | `./scripts/run-phase1.sh` |
| **2** | **Done** — Room A code mural walls + text cylinder | `./scripts/run-phase2.sh` |
| **3** | **Done** — Room C surrender machine (full walkthrough) | `./scripts/run-phase3.sh` |

### Phase 0 — Pd + OSC (now)

1. Open [Ghost 77823 room](https://mark-walhimer.com/sketches/loop-art-critique-2026/machine-aesthetic/ghost_dense_77823_room.html) in **Chromium** (unchanged artwork).
2. Terminal:

```bash
cd machine-aesthetic/console
./scripts/run-phase0.sh
```

3. **DSP on** in Pure Data (`pure-data/ghost-room.pd`).
4. Press zone keys in the bridge terminal while you walk the room (`1`/`a` Room A, `2`/`b` ghost, `3`/`c` surrender, etc. — see [ROOM-MAP.md](port/ROOM-MAP.md)).
5. Hear zone-driven tone; Pd prints branch / zone / heartbeat.

Manual start:

```bash
pd machine-aesthetic/console/pure-data/ghost-room.pd
node machine-aesthetic/console/bridge/ghost-room-zone-bridge.mjs
```

### Phase 1 — OF white room + ghost wireframe (now)

Native openFrameworks host replaces Chromium for visuals. Camera position drives zone OSC (same addresses as Phase 0).

```bash
cd machine-aesthetic/console
./scripts/run-phase1.sh
```

Build manually (symlink or copy `openframeworks/GhostRoom77823/` into `$OF_ROOT/apps/myApps/`):

```bash
cd "$OF_ROOT/apps/myApps/GhostRoom77823"
make && make Run
```

Walk **WASD** · **Shift** run · drag to look · **space** nudge · **G** gold · **R** respawn · **F** fullscreen. Room C = white placeholder (Surrender = Phase 3).

### Phase 2 — Room A code mural + text cylinder (now)

Adds readable source wallpaper on Room A + hall A–B walls and the rotating **text11** word cylinder at Room A center.

```bash
cd machine-aesthetic/console
./scripts/run-phase2.sh
```

Regenerate code mural texture after browser kernel changes:

```bash
cd sketches/loop-art-critique-2026/machine-aesthetic
npm install   # once — @napi-rs/canvas
node ../../../machine-aesthetic/console/port/generate-code-wallpaper.mjs
```

Output: `openframeworks/GhostRoom77823/bin/data/code-wallpaper-77823.png`

### Phase 3 — Room C surrender machine (now)

Procedural **Surrender Machines** embed in Room C — seed **77823**, default sliders (50/50/50), spins when camera is in the surrender band. Port of `surrender-machines-three-core.js`.

```bash
cd machine-aesthetic/console
./scripts/run-phase3.sh
```

Phases 0–3 complete: native OF replaces Chromium for the full Ghost 77823 walkthrough.

---

## Console OSC (POC)

| Address | Args | Notes |
|---------|------|--------|
| `/sm/console/seed` | `i` | default `77823` |
| `/sm/console/branch` | `s` | `room_a` · `ghost` · `surrender` |
| `/sm/gear/hz` | `i` `f` | Pd + Daisy routing |
| `/sm/state/energy` | `f` | visuals + sound |
| `/sm/heartbeat` | — | LAN health |

Full table in [STYLE-GUIDE.md](STYLE-GUIDE.md) and prior README revisions — see git history.

---

## Run the POC

**MacBook:** develop, `./machine-aesthetic/console/scripts/run-poc.sh` for smoke tests.

**Linux laptop:** Pd → `console-sound.pd` (DSP on) → OF Console or Chromium kiosk. See [STYLE-GUIDE.md](STYLE-GUIDE.md).

---

## Hardware timeline

| Phase | Hardware |
|-------|----------|
| **Now** | MacBook Pro + Linux laptop (~$300–400) |
| **Next** | Teensy + Daisy SP, switch, HDMI projector cable |
| **Install** | + Raspberry Pi peers; road case |
| **Product** | Touchscreen + x86 mini PC → numbered Console edition |

---

## Files

| Path | Role |
|------|------|
| [STYLE-GUIDE.md](STYLE-GUIDE.md) | Full vision, kit BOM, sellable edition |
| `openframeworks/Console/` | OF kernel host |
| `pure-data/console-sound.pd` | Sound host |
| `scripts/run-poc.sh` | macOS dev launcher |
| `scripts/run-phase0.sh` | Ghost Room Phase 0 — Pd + zone bridge |
| `scripts/run-phase1.sh` | Ghost Room Phase 1 — Pd + OF walkthrough |
| `scripts/run-phase2.sh` | Ghost Room Phase 2 — code mural + text cylinder |
| `launch/` | Packaged HTML control panel + launcher server |
| `Ghost Room 77823.command` | macOS double-click entry |
| `Ghost Room 77823.html` | Browser entry / reconnect page |
| `launch.env.example` | Local `OF_ROOT` template → copy to `launch.env` |
| `scripts/launch-ghost-room.sh` | Start server + open control panel |
| `port/generate-code-wallpaper.mjs` | Rasterize Room A code mural PNG from browser kernel |
| `openframeworks/GhostRoom77823/` | Phase 1 OF host (rooms + ghost wireframe) |
| `bridge/ghost-room-zone-bridge.mjs` | Keyboard → OSC (Phase 0) |
| `pure-data/ghost-room.pd` | Ghost Room soundscape |
| `port/PHASES.md` | Port phase tracker |
| `port/ROOM-MAP.md` | Zone → OSC map |

---

## One line

*MacBook writes the species. Linux laptop runs the room. The kit fits in a box. The numbered Console is the same soul in a touch frame.*
