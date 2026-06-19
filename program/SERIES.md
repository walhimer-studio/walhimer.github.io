# Program — series registry

Maps **Program rotation series** (daily mints) to **catalog tiers** (public site) and **`data/catalog.json`** sketch series. Source mockup: `Desktop/rebrand/files (67)/markwalhimer-catalog.html`.

---

## Two layers

| Layer | What it is |
|-------|------------|
| **Catalog archive** | All series ever made — tier 1 / 2 / 3 on site |
| **Program rotation** | One **active** series per month (or block) for **new** daily mints |

Program series can be **new lines** (Letting Go, One by One) or **continuations** of catalog series (Surrender Machines).

---

## Tier 1 — Core (define the practice)

| Series | Program rotation | Catalog / repo notes |
|--------|------------------|----------------------|
| **Surrender Machines** | Sep–Oct 2026 | `machine-aesthetic/`, installations |
| **Bloom / Four Walls** | Optional anchor weeks | `sketches/bloom/`, installations |
| **Technical Drawing** | — | `sketches/technical/` |
| **Emergent DNA** | — | `machine-aesthetic/emergent-dna/` |
| **Traveling Landscape** | — | installations |

---

## Tier 2 — Active (distinct identity)

| Series | Program rotation | Notes |
|--------|------------------|-------|
| **Moon & Walking** | — | |
| **Living Commons** | — | installation |
| **Light Art** | CERN / Lumen anchor weeks | cloud chamber adjacency |
| **Breathing Columns** | — | |
| **Spatial Orchestration** | — | |
| **Shared Ground** | — | |
| **Emergent Discs** | — | |

---

## Tier 3 — Experiments & studies

Binary Partitions · Gradients & Color · Word Art / Text · Numbered Pieces · Autoscape · Reading the Sky · Convergence Era · Cubes · Shelves · Miradas Tangentes · Three.js / LAB · Mint / NFT

Not Program rotation candidates unless explicitly promoted.

---

## Program-only series (2026 pilot → rotation)

New daily-mint lines from `process.txt`. Assign `WS-NNNNNN` on first mint; add row to catalog on publish.

| Series | First use | Theme |
|--------|-----------|--------|
| **Letting Go** | Jun 2026 pilot | Surrender / release |
| **One by One** | Jul 2026 (planned) | Focus / perception |
| **2×2** | Nov 2026 (planned) | Focus / perception |
| **Pick Up Sticks** | Dec 2026 (planned) | Play / system / accumulation |

---

## Theme → series (rotation algorithm)

| Theme | Prefer |
|-------|--------|
| Focus / perception | One by One, 2×2, Light Art |
| Surrender / release | Letting Go, Surrender Machines |
| Invisible made visible | Light Art, Pick Up Sticks, cloud-chamber work |
| Quantum / CERN / science | Surrender Machines, Emergent DNA |
| Machine / agency | Surrender Machines, machine-aesthetic |

See [CALENDAR.md](CALENDAR.md) for month-by-month assignment.

---

## Display titles

| Field | Format | Example |
|-------|--------|---------|
| Catalog ID | `WS-NNNNNN` | WS-000087 |
| Public title | `{Series} · WS-{n}` | Letting Go · WS-000087 |
| Legacy shorthand | optional internal | LG-012, SM-013 |

**Site standard:** `WS-NNNNNN` in title and URL. Retire mockup-only IDs (`SM 001`) for new work.

---

## Adding a new Program series

1. Add row here (tier + theme).
2. Add to `drops.schema.json` `series` enum if active for mints.
3. Run `refresh_catalog.py` after first published work.
4. Update [CALENDAR.md](CALENDAR.md) rotation table.
