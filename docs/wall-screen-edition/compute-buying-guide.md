# Wall screen edition — compute buying guide

**Studio only** — August 2026. Read this **before** Amazon shopping so you do not re-litigate Pi vs N100, SD vs NVMe, or “why is it 2× the deal price?”

**Related:** [Product plan](../wall-screen-edition-plan.md) · [Docs hub](./README.md) · Centered AP kiosk: `.local/centered-july-17-kiosk/` (gitignored)

---

## Two roles — do not conflate

| Role | Hardware | When |
|------|----------|------|
| **Studio POC / test bed** | Raspberry Pi 5 + **NVMe boot**, or N100/N150 mini PC | Prove kiosk URL on Hisense 43″; iterate wiring only |
| **Ship in editions** | **Fanless** N100 or **N150**, **16 GB**, **512 GB** NVMe, golden Linux image | Artist proofs → editions of 10 |

**Centered July 17 2026** catalog copy (**Fanless N150 · 16 GB · 512 GB**) is the **edition target**, not what you must buy tonight for the studio TV.

---

## Golden rule — stop the Imager loop

| Storage | Small change (URL, seed, kiosk script) | New edition unit |
|---------|----------------------------------------|------------------|
| **SD card on Pi** | Often devolves into **full re-flash** | Unreliable clone source |
| **NVMe on Pi 5** | **SSH → edit → restart kiosk** — no Imager | Clone disk once golden |
| **Mini PC internal SSD** | Same as NVMe Pi | Clone or ship pre-imaged module |

**You do not re-image the drive for every art tweak.** You re-image only when minting a **new golden master** for cloning.

---

## Realistic prices (US, August 2026)

Deal prices are **coupons + in-stock ASINs**, not the permanent shelf price.

| Item | Deal band (watch for) | Buy-it-now / list | Notes |
|------|----------------------|-------------------|--------|
| N100 mini PC, 16 GB, ~500 GB | **$169–199** | **$280–340** | Beelink S12 Pro; coupon ASINs go OOS often |
| N150 mini PC, 16 GB, ~500 GB | **$280–400** | **$400–480** | Beelink EQ14, MeLE Quieter 4C |
| Fanless N150, 16 GB, 512 GB | — | **~$450–550** | MeLE Quieter 4C — gallery silence |
| BOSGAME B100 (N100 16/512) | — | **~$297** | In stock; fan-cooled; good “buy now” |
| Pi 5 (8 GB) + PSU + DeskPi Lite + 256 GB NVMe | — | **~$155–170** | Cheapest POC stack |
| 256 GB NVMe 2280 | **$20–35** (sale) | **$50–55** (official) | **Do not pay ~$70** from random sellers |

**Not AI tax:** the gap between **$179** and **$340** is usually **promo expired + different Amazon ASIN**, not datacenter demand for N100 wall kiosks.

**Price alerts:** CamelCamelCamel / Keepa on specific ASINs; Slickdeals “Beelink S12 Pro”. Buy from **Sold by: Beelink USA**, **BOSGAME Store**, **Official Patriot Memory** — not markup third parties.

---

## Mini PC — verified SKUs (check dropdown before cart)

### N100 · 16 GB · ~500 GB (edition-capable, fan-cooled)

| Product | ASIN | Notes |
|---------|------|--------|
| Beelink Mini S12 PRO | **B0GY42SQ3L** | ~$339 in stock when **B0BVFKN7ZL** (~$179) is OOS |
| BOSGAME B100 | **B0CWNY1MT9** | ~$297; N100 16/512 |

**Required in title:** Intel **N100** (or **N150**), **16 GB**, **500 GB** or **512 GB**, **4K HDMI**, auto power-on / WOL.

### N150 · 16 GB · ~500 GB

| Product | ASIN | Notes |
|---------|------|--------|
| Beelink EQ14 | **B0B3MSYJ8S** / **B0G1M7C1V9** | Stock rotates; verify Add to cart |
| MeLE Quieter 4C | **B0F5WVZDHY** / **B0F23WM4DY** | **Fanless**; edition-friendly |

### GMKtec — naming trap

| Name | CPU | Buy for wall? |
|------|-----|----------------|
| **G3** | N100 | Yes |
| **G3 Plus** | N150 | Yes — pick **N150 16GB/512GB** in dropdown |
| **G3 Pro** | Core **i3-10110U** (2019, 2C) | **No** — wrong chip; often 8 GB / 256 GB; HDMI 1.4 4K@24 Hz on some boards |

Same Amazon listing (**B0CQ4C9ZY1**) can default to the **i3 G3 Pro**. Read the variant line.

### Avoid for Centered POC unless desperate

- MeLE Quieter3C **N5105** ~$479 — older than N150, often **more** than fanless N150
- Any listing with **8 GB / 256 GB** only — tight for multi-series later

---

## Raspberry Pi 5 POC stack

### Shopping list

| Part | Example | ~Price |
|------|---------|--------|
| Pi 5 8 GB | official | ~$80 |
| **27 W USB-C PSU** | official Pi 5 PSU | ~$12–15 |
| **Case + M.2 NVMe** | GeeekPi DeskPi Lite **B0DPH2DYBP** | ~$36 |
| **NVMe 256 GB+** M.2 **2280** | Patriot P320 **B0D4S1F5R6** ~$55 | ~$30–55 |
| *(alt HAT only)* | Geekworm X1001 **B0CPPGGDQT** | need separate case + cooler |

**DeskPi Lite** includes: NVMe slot, active cooler, power button, full-size HDMI.  
**Do not boot the kiosk from SD** once NVMe is set up.

### Pi limits (unchanged)

- **Centered** (p5 1000×1000 WEBGL): OK on Pi 5 + NVMe for POC
- **Invisible Layer**: Pi was **slow** + **color loss** in browser — signal to use N100+ for that series
- **Witness Mirror / heavy ML**: not Pi v1

---

## Display (locked for v1)

- **Hisense 43QD5SV** — 43″ 4K, portrait mount, **dumb HDMI**
- Calibrate **HDMI full vs limited RGB** if colors look washed out

---

## Software — one setup, then edit

1. **Golden image name (TBD):** e.g. `wall-edition-v1.img` — Linux + Chromium kiosk + local HTTP + autostart + museum hours cron
2. **Centered URL (studio POC):** `http://127.0.0.1:8765/?seed=867535358&d=2&layout=portrait&rotate=90` (see `.local/centered-july-17-kiosk/`)
3. **Do not edit** `sketches/centered-july-17-2026.html` for wiring — kiosk/wiring only in `.local/` or future `wall-edition/` scripts

### What triggers a re-flash vs a file edit

| Change | Action |
|--------|--------|
| Seed, layout query params, rotation | Launcher URL or kiosk config — **restart browser** |
| Kiosk shell, systemd, Chromium flags | SSH + edit — **reboot or restart service** |
| OS / driver / new piece promoted to golden | Update **master** once → **clone** to edition drives |
| “Nothing boots” / corrupted SD | Re-flash — **avoid by using NVMe** |

---

## Decision shortcut (when exhausted)

| Goal | Buy |
|------|-----|
| **Cheapest POC this week** | Pi 5 + DeskPi Lite + 256 GB NVMe (~$55 drive, not $70) |
| **Buy now, no Pi pain** | BOSGAME B100 ~$297 |
| **Wait for deal** | Price alert on Beelink S12 Pro **B0BVFKN7ZL** / **B0GY42SQ3L** — target **≤$220** |
| **Fanless edition brain** | MeLE Quieter 4C N150 16/512 ~$450+ |
| **Do not** | SD-only Pi for appliance; GMKtec G3 **Pro** i3; $70 256 GB SSD |

---

## Studio prototyping setup (locked Aug 2026)

**Centered** — p5 WEBGL · AP seed **`867535358`** · wall kiosk in `.local/centered-july-17-kiosk/` (gitignored).

**Ghost 77823 gravity · sliders · 43″ portrait** — wall chronicle for Surrender/Ghost on **43″ and 55″**: use **`…_43_portrait.html`** (software rotate for landscape HDMI). Art core `…_43.html`. [Catalog](../../catalog/loop-snippets/ghost_dense_77823_gravity_sliders_43.md).

| Display | Role | Compute |
|---------|------|---------|
| **Hisense 43″** (43QD5SV) | Wall POC · portrait · Instagram stills · Ghost gravity 43″ | Pi 5 + NVMe **or** Mac serve + kiosk URL; **N100/N150 when a deal hits** |
| **Hisense 55″** (same series — TBD exact SKU) | Scale test · same framing chronicle as 43″ | Same pattern — do **not** block on mini PC |
| **Two touchscreens** | Separate desk / touch experiments | **Second Raspberry Pi 5** — one Pi per screen; OK to use **SD for touch bring-up** (not the wall appliance disk) |

**Workflow:** Set up POC on screen → photograph → post Instagram. **43″ and 55″** are both valid prototype surfaces; edition catalog can reference scale later.

**Do not buy tonight unless rested:** second Pi 5 + PSU; 55″ Hisense same line as 43QD5SV; DeskPi/NVMe only when building the **wall** Pi (not required for touchscreens on SD).

**Artwork file (GitHub):** `sketches/centered-july-17-2026.html` — committed, unchanged. **Seed on wall:** `?seed=867535358` via kiosk (see `seeds-ap.md` in `.local/…`). Published sketch still uses random seed unless `manualSeed` is set — ask with `AUTHORIZE EDIT` if you want 867535358 baked into the public HTML.

---

## Open items (studio)

- [ ] **55″ Hisense** — same model series as 43QD5SV (lock SKU before buy)
- [ ] **Second Pi 5** — dedicate to two touchscreens (SD OK for touch lab)
- [ ] Lock **one** edition SKU (fanless N150 vs N100 + fan behind panel)
- [ ] Name and freeze **golden image** after first 7-day museum-hours pass
- [ ] Document clone procedure (NVMe USB dock + `dd` or Imager clone)
- [ ] Align catalog `{artwork}.md` **Unit** row when SKU purchased

---

*Last updated: August 2026 — from studio thread (Hisense 43″, Centered seed 867535358, Amazon SKU / pricing traps).*
