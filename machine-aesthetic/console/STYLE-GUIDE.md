# Console — style guide & prototype hardware

Living document: **Console** concept, **Mac + Linux laptop** workflow, **portable install kit**, and **sellable numbered editions** (May 2026).

Related: [Console README](README.md) · [Emergent DNA](../emergent-dna/README.md) · [OSC](../docs/OSC.md) · [Hosts](../emergent-dna/docs/HOSTS.md)

---

## Confirmed understanding

This is the plan as decided:

1. **Stay on MacBook Pro** — keep authoring exactly as now. Iterate loop-scale work (Loop Art Critique, Ghost 77823, surrender machines, openFrameworks, Pure Data). The browser/Three.js room path stays valid; OF + Console is the physical port layer.

2. **Buy a Linux laptop** (~$300–400 refurb ThinkPad class) — **prototype runtime**. Mac pushes to GitHub; Linux pulls and runs. You look at the Linux machine to know if the piece works.

3. **Add install peripherals to the Linux laptop** — USB **Teensy**, **Electrosmith Daisy SP**, optional **projector** on HDMI, **Raspberry Pi** peers for motors/interface boards, **Ethernet switch** — together this is the **hardware for a full room installation**, packable in a **small box**.

4. **Sell numbered pieces separately** — off-the-shelf **HDMI touchscreen** + **x86 mini PC** (16 GB) + your locked software image → one generative Console artwork, edition of *n*. Same code family; different form factor and factory setup.

**One codebase. Mac writes. Linux runs. Kit scales to gallery. Mini PC + touch sells.**

---

## Name

**Console** — noun (control surface you watch) and verb (*to console* — tend a living species).

---

## Principles (Emergent DNA)

Co-creation · surrender over ego · kintsugi breaks · one clock (image + sound) · species not file copy.

Full spec: [emergent-dna/README.md](../emergent-dna/README.md).

---

## Three hardware modes (same software)

```
                    ┌─────────────────────────────────┐
                    │  MacBook Pro — AUTHOR (always)   │
                    │  Loop · OF · Pd · git push       │
                    └───────────────┬─────────────────┘
                                    │ GitHub
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│  MODE A — Prototype / travel (now)                                 │
│  Linux laptop · pull · kiosk/OF · built-in screen · HDMI out       │
└───────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│  MODE B — Portable install kit (small box)                       │
│  + switch · projector · Teensy · Daisy SP · Raspberry Pi peers     │
└───────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│  MODE C — Sellable numbered edition (product)                      │
│  x86 mini PC + off-shelf touchscreen · locked image · serial no.    │
└───────────────────────────────────────────────────────────────────┘
```

| Mode | Buyer / user | Brain | Display |
|------|--------------|-------|---------|
| **A** | You, prototyping | Linux laptop | Laptop + HDMI |
| **B** | You, venue | Linux laptop (or mini PC later) | Projector + LED/motors via OSC |
| **C** | Collector | x86 mini PC in enclosure | Integrated touch panel |

---

## Mode A — Mac + Linux laptop (daily)

```
MacBook Pro  ──push──►  GitHub  ──pull──►  Linux laptop
                                              │
                                         run artwork
                                         judge result
```

- **Mac:** Cursor, openFrameworks, loop sketches under `sketches/loop-art-critique-2026/`, `machine-aesthetic/`.
- **Linux:** honest runtime — Pd, OSC, Chromium (Loop room) or OF Console.
- **Travel:** both laptops; HDMI from Linux to hotel TV or venue projector.
- **Touch on laptop:** not required; keyboard branches (`1` `2` `3`).

---

## Mode B — Portable full-room kit (small box)

The Linux laptop remains **brain** until you drop in a fixed mini PC for permanent venues. Everything speaks **OSC** ([`OSC.md`](../docs/OSC.md)); never push pixels over Wi‑Fi.

### Kit BOM (approximate USD)

| Item | Purpose | Approx. |
|------|---------|---------|
| **Linux laptop** (16 GB, HDMI) | Brain, already owned | **$300–400** |
| **Gigabit switch** (5–8 port) | LAN | **$20–40** |
| **Teensy 4.1** | LED / DMX / fast USB I/O | **~$30** |
| **Electrosmith Daisy SP** | Embedded audio path; companion to Pd | **~$40–50** |
| **Raspberry Pi 5** (4–8 GB) | Motor drivers, interface boards, helper node | **~$80–100** |
| **Projector** (optional) | Room-scale image; HDMI from Linux | **$300–800+** (or rent) |
| **Road case / pelican** | Small box transport | **$50–150** |
| **Cables, USB hub, power strip** | — | **$50–100** |

**Kit subtotal (excl. projector):** roughly **$570–870** on top of laptop (much already incremental).

### Topology

```
Linux laptop (brain)
    │ HDMI ──────────────► projector / large display
    │ USB ───────────────► Teensy ──► LED panel
    │                      Daisy SP ──► analog audio / I/O
    │ Ethernet ──► switch ◄──► Raspberry Pi ──► motor / interface boards
    │ OSC /sm/*  (UDP LAN)
    └── Pure Data (local or rack)
```

**Raspberry Pi role:** bridge and real-time I/O — **not** primary Loop/WebGL brain. Pi subscribes to `/sm/gear/*`, `/sm/led/*`, drives hardware.

**Daisy SP role:** optional dedicated audio body ( synthesis / I/O ) alongside or instead of laptop audio; still driven by same organism state via OSC or serial bridge.

---

## Mode C — Sellable numbered editions

For **selling a screen running generative code** at Console / Loop lineage quality:

| Component | Spec |
|-----------|------|
| **Touchscreen** | Off-the-shelf 8–15″ **HDMI + USB touch** (Elecrow-class, commercial panel) |
| **Computer** | **x86 mini PC**, 16 GB RAM, 512 GB SSD, N100–i3 N305 minimum |
| **Software** | Locked kiosk: your seed, your species, autostart Pd + artwork |
| **Identity** | Serial number, certificate, edition *n* of *m* |

### COGS vs retail (rough)

| | Approx. USD |
|--|-------------|
| Mini PC 16 GB | **$160–220** |
| Touch panel 10″ | **$80–150** |
| Enclosure, power, assembly | **$50–200** (DIY → fabricated) |
| **COGS** | **$300–570** |
| **Art edition retail** (typical) | **$1,500–5,000+** depending on edition size, Loop vs Console expression, gallery |

**Loop-full-fidelity** in the sold object needs the **x86 mini PC** tier (not Pi). **Console OF expression** can use the same hardware with headroom.

No consumer art frame ships your repo out of the box — you ship **appliance + artwork**.

---

## Linux laptop spec (prototype, no touch)

| Spec | Minimum |
|------|---------|
| RAM | **16 GB** |
| Storage | **512 GB** NVMe preferred |
| CPU | i5 10th gen · Ryzen 5 PRO 4650U · i3-N305 |
| Ports | **HDMI**, USB-A, USB-C, audio; Ethernet preferred |
| OS | Ubuntu 24.04 LTS |

**ThinkPad T14 Gen 1**, 16 GB / 512 GB: commonly **$300–400** (~$350 typical with charger).

---

## Git sync loop

```bash
# MacBook Pro
git push

# Linux laptop
git pull && ./restart-console.sh   # Pd + kiosk or OF
```

Mac = studio. Linux = truth for “does the piece run.”

---

## Kiosk autostart (Linux)

1. Network up (Ethernet to switch at install).  
2. Pure Data — `console-sound.pd`, DSP on.  
3. Chromium kiosk (Loop) **or** openFrameworks Console fullscreen.  
4. HDMI / projector as connected.

---

## Install profile (same code, different site)

**Prototype laptop:**

```json
{
  "siteId": "linux-laptop-prototype",
  "seed": 77823,
  "outputs": ["built-in", "hdmi", "pd-local"],
  "osc": { "listen": 7400, "peers": [] }
}
```

**Portable kit (small box):**

```json
{
  "siteId": "road-case-v1",
  "seed": 77823,
  "outputs": ["projector", "led-teensy", "daisy-audio", "pd-local"],
  "osc": {
    "listen": 7400,
    "peers": ["10.0.0.21", "10.0.0.22"]
  }
}
```

**Numbered edition (sold object):**

```json
{
  "siteId": "console-edition-003-of-025",
  "seed": 77823,
  "outputs": ["touch-panel"],
  "osc": { "listen": 7400, "peers": [] }
}
```

Kernel, room logic, Pd patch, OSC addresses: **unchanged**.

---

## Decision summary

| Question | Answer |
|----------|--------|
| Keep working on MacBook Pro? | **Yes — same iteration style (loop-scale projects)** |
| Linux laptop purpose? | **Prototype runtime; install brain; travel** |
| Full install in a small box? | **Yes — laptop + switch + Teensy + Daisy SP + Pi (+ projector)** |
| Pi runs Loop room? | **No — Pi is peer / motor / I/O bridge** |
| Sell a generative screen? | **Touch panel + x86 mini PC + locked image, numbered** |
| Same code everywhere? | **Yes — install profile + hardware routing only** |

---

## One line

*MacBook writes the species. Linux laptop runs the room in a box. Numbered Console editions sell the same soul in a touch frame.*
