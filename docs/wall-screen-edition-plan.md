# Wall screen edition — product & install plan

**Mark Walhimer** — studio planning doc (August 2026).  
Living plan for sellable wall-mounted screen works, museum hours, and the path from test bed to editions. Not a sales sheet.

**Docs hub:** [wall-screen-edition/README.md](./wall-screen-edition/README.md) · [Installer one-pager](./wall-screen-edition/installer-one-pager.md) · [Art advisor sheet](./wall-screen-edition/art-advisor-sheet.md)

Related: [STUDIO-DIRECTION.md](../catalog/STUDIO-DIRECTION.md) · [RESOLVED-DIRECTION.md](../machine-aesthetic/docs/RESOLVED-DIRECTION.md) · [Witness Mirror (DeepFace live)](../catalog/digital-twin/witness-mirror-deepface-live.md) · [OSC.md](../machine-aesthetic/docs/OSC.md)

---

## Thesis (one line)

**Plug-in wall objects** — dumb display, swappable compute, offline by default — four series as artist proofs, then numbered editions; room-scale (LED, projectors, distributed Pis) follows once the single-screen SKU works.

---

## What changed (distribution)

| De-prioritize | Lead with |
|---------------|-----------|
| NFTs (unless curated invite) | Physical screen editions (~$4–5k target) |
| High volume of award applications | Technical residency (still active) |
| Plotter-only outputs | Generative work on wall-mounted LCD |

---

## Four series (v1 lineup)

Oldest → newest. One **artist proof** per series first; gauge interest; then **editions of 10** (each numbered, distinct seed).

| Series | Repo / notes | Host today | Wall v1 |
|--------|--------------|------------|---------|
| **Centered** | `sketches/centered.html` (+ July 2026 variants) | p5 / Three.js | Generative loop · BLE optional |
| **Surrender Machines** | `sketches/surrender-machines.html` | p5 | Generative loop · BLE optional |
| **Invisible Layer** | e.g. `sketches/invisible-layer/invisible-layer-july-14-2026.html` | WebGL · sound · lifeline | Generative loop · audio on POC |
| **Witness Mirror** | `sketches/digital-twin/witness-mirror-*.html` | DeepFace · **seven emotions** | Session piece · ML camera · see below |

**Witness Mirror vocabulary (locked):** `angry`, `disgust`, `fear`, `happy`, `sad`, `surprise`, `neutral` — same in 1s, 5s, and DeepFace live.

Canonical file per series for first AP: **TBD** when framing each piece.

---

## v1 wall unit — what the buyer gets

- **43" dumb LCD** (test bed: Hisense **43QD5SV**) — HDMI only, **no network**, smart TV features unused.
- **Compute module** behind or beside display — boots automatically, runs one work fullscreen.
- **Museum hours:** on ~8:00, off ~21:00 (not 24/7).
- **No touch** on the wall — no touchscreen, no tap UI on the glass.
- **Optional phone link:** small **QR** in bottom corner → companion opens **Bluetooth (BLE)** to the box; short back-and-forth (seed, session start, point word). **No Firebase on the appliance.** Phone may use cellular/Wi‑Fi for its own UI if needed; the wall unit stays offline.
- **Audio:** included for proof of concept (existing sketch sound is enough; full Pure Data DSP later).
- **Service:** if screen or compute fails, ship replacement — plug HDMI / power; local installer mounts. Original TV box kept for re-ship.

Target price band: **~$4,000–5,000** per unit (hardware well under $1k; remainder is work, edition, certificate, support).

---

## Compute — what ships vs what stays in studio

| Role | Hardware | Notes |
|------|----------|--------|
| **Studio build / port** | Mac mini M1 (existing) | Dev parity, DeepFace lab, OF — **do not ship** in editions |
| **POC / test bed** | Raspberry Pi 5 + SSD, or N100/N150 mini PC | Pi proved slow + color loss in browser for Invisible Layer |
| **Ship in artwork (target)** | **New** N100 or N150 mini PC, 16 GB RAM, fanless case, imaged SSD | Field-replaceable “appliance brain” |
| **Avoid shipping** | 5-year-old M1 Mac mini | Capable but wrong product story at $5k; thermal/noise in enclosure |
| **Avoid for wall (v1)** | Pi 5 alone for heavy WebGL / Witness ML | OK for simplest loops only until native port |

### Realistic compute pricing (2026 — not $150)

Bare N100/N150 boxes at **$150** are uncommon. Budget these ranges:

| Item | Approx. |
|------|---------|
| N100 or N150 mini PC, 16 GB RAM | $180–280 |
| NVMe SSD (if not included) | $30–50 |
| Fanless case / VESA mount kit | $20–40 |
| Pi 5 + official PSU + case + SSD | $120–180 |
| **Compute module subtotal** | **~$250–350** |

Shop: Beelink, GMKtec, Trigkey, Minisforum — verify **16 GB RAM** and **fanless** for gallery silence.

---

## Display pipeline

```
[ Compute: Linux kiosk or native app ]
        │ HDMI (full vs limited RGB — calibrate; washed-out color often fixable here)
        ▼
[ Hisense or same SKU every edition — dumb panel ]
```

- Browser on Pi was **slow** and **lost color** on small-screen Invisible Layer test — treat as signal to use **stronger compute** and/or **HDMI range fix** before committing to C++ rewrite.
- **OpenFrameworks C++ port:** long-term, not blocking POC.
- Near-term: N100/N150 + kiosk or minimal native shell; one piece at a time when SKU is chosen.

---

## Interaction architecture

```
[ Phone ]  ── BLE ──►  [ Compute box ]  ── localhost OSC ──►  OF / Pd / display
                              │
                              └── HDMI ──► [ Dumb TV — no Wi‑Fi ]
```

- **Firebase does not run over Bluetooth.** Cloud is optional later for phone-side only; wall unit does not depend on it.
- QR encodes link to companion (app or PWA) that speaks BLE to the box.
- Witness Mirror: BLE may start session / point word; **camera + ML run on the box**.

---

## Witness Mirror — wall session (target)

Flow (timing tunable; lab used 15s story; studio finding ~**10s** before stable reads):

1. Viewer at screen (no touch).
2. **Warmup** — camera / witness settling (~10s); honest on-screen copy optional.
3. **Story** — read bounded script using seven face words.
4. **Review** — point word vs ML counterpoint (session share).

**ML camera — plug-in preference**

| Option | Verdict |
|--------|---------|
| **Luxonis OAK-1 Lite** (~$120) | USB, emotion pipeline on **camera VPU**; Pi/box gets labels not full DeepFace load. POC candidate. |
| **Luxonis OAK-D Lite** (~$170) | Adds depth (viewer distance) for future “step into zone” logic. |
| **USB webcam + DeepFace on box** | Works in Mac lab (`witness_mirror_deepface_live.py`); heavy on shipped compute. |
| **Sony IMX500 / Pi AI Camera** | **Rejected for product** — raw module, custom housing, not “plug in nothing else.” |

OAK demo models may use **5** emotion classes; Witness Mirror uses **7** (DeepFace parity). For POC: map vocabulary or convert custom model to OAK later.

---

## Museum / install operations

| Requirement | Approach |
|-------------|----------|
| Auto boot | systemd service or kiosk autostart |
| 8:00–21:00 | cron / systemd timer; optional display power via CEC or timed outlet on whole unit |
| No owner IT | Single power cord + HDMI internal; installer sheet only |
| Replacement | Pre-imaged SSD or whole compute module; standardized TV SKU |

---

## Edition strategy

1. **Phase 0:** Hisense 43" + compute test bed in studio (current).
2. **Phase 1:** Four **artist proofs** — one work per series (four units or four images on one rotating box).
3. **Phase 2:** Consultant feedback → pick series with most interest.
4. **Phase 3:** **Edition of 10** per chosen work — unique seed, number engraved or on certificate.
5. **Phase 4:** Scale toward **7×43"** and **3×55"** if SKU holds; same TV model, same compute image.

**Provenance (future):** [Transient Labs](https://transientlabs.com/) — RFID/NFC tag on monitor or compute module for chain-of-custody without cloud on the piece.

---

## Future direction (not v1 — documented so it does not collide with wall SKU)

Room-scale **distributed system**: LEDs, projectors, LCDs, **Teensy 4.1**, multiple Raspberry Pis, motors — reacts to room and people. Same OSC / species DNA as browser and wall editions ([RESOLVED-DIRECTION.md](../machine-aesthetic/docs/RESOLVED-DIRECTION.md)).

**Interactive LCD (future):** infrared touch frame around panel; **Gorilla Glass** over face; IR frame mounts on glass edge — not v1 (v1 explicitly **no wall touch**).

---

## Software roadmap (ordered)

1. N100/N150 + Hisense — Invisible Layer (or chosen piece) — fix speed + color.
2. BLE stub — one OSC command from phone (seed bump).
3. Schedule 8–21 on box — one week unattended in studio.
4. Audio pass-through for POC (sketch sound, not full PD DSP).
5. Witness Mirror — OAK-1 Lite + session state machine when 1–4 are boring.
6. OpenFrameworks ports — per series when edition is locked, not before.

---

## Open decisions

- [ ] Canonical HTML/sketch path per series for AP #1
- [ ] N100 vs N150 SKU (either fine; prioritize 16 GB + fanless)
- [ ] Linux distro + golden image name (e.g. `wall-edition-v1.img`)
- [ ] Witness story duration (10s vs 15s) and warmup UX copy
- [ ] Frame / flush mount vs bare TV on wall
- [ ] Certificate + numbering physical design
- [ ] Transient Labs tag placement (screen vs compute)

---

## Pre-ship checklist (when first AP leaves studio)

- [ ] TV never joined Wi‑Fi; smart features disabled or unused
- [ ] Boots to art without keyboard within 60s
- [ ] 8:00 on / 21:00 off verified 7 days
- [ ] Audio level set; no clip in typical lobby SPL
- [ ] QR + BLE tested on iOS and Android (companion TBD)
- [x] Replacement procedure written (one page for installer) → [installer-one-pager.md](./wall-screen-edition/installer-one-pager.md)
- [ ] Seed + edition number recorded in catalog `{artwork}.md`

---

*Last updated: August 2026 — from studio thread on wall editions, Hisense test bed, and museum install constraints.*
