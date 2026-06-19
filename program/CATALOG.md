# Program — public catalog (site IA)

Target UX from rebrand mockup **`markwalhimer-catalog.html`**. Catalog-first site on **mark-walhimer.com** — Kapoor-scale numbered archive + daily pipeline status.

**Data source (production):** `data/catalog.json` + `program/drops/`. Mockup `SERIES_DATA` is placeholder only.

---

## Page structure

| Section | Nav | Purpose |
|---------|-----|---------|
| Header | — | Name, thesis, **pipeline status** (last minted, work count, pulse) |
| Recent works | — | 6 or 12 most recent; Buy / Minted |
| **Available** | Available | 6–12 purchasable works; links to work pages |
| **Catalog** | Catalog | Series archive; expand rows; filters |
| **Practice** | Practice | Code→Objects→Installations→Monumental; themes; tools; references |
| **Calendar** | Calendar | Public subset of [DEADLINES.md](DEADLINES.md) |
| Books & consulting | Books | Museum practice; museumplanning.com |
| Contact | Contact | Email, social, **newsletter** (weekly digest) |
| Admin | Private | See [ADMIN.md](ADMIN.md) |

**URLs (live):**

- Available index: `/available/`
- Work page: `/works/ws-NNNNNN/` (slug = lowercase catalog number)
- Studio archive: `/sketches/index.html`
- Installations (commissions): `/installations/`

**Generate pages:** `node program/scripts/build-work-pages.mjs` after each published drop.

---

## Per-work page (required — not in mockup v1)

Each minted work gets a dedicated URL:

- `WS-NNNNNN`, series, date, media (embed or still)
- Description, tools (p5, Three.js, OF, …)
- **Acquire** — on-site checkout (Transient Labs), not external marketplace as primary CTA
- Provenance footer — Etherscan / OpenSea secondary

Series catalog row links to work page, not only `#manifold`.

---

## Catalog UI (from mockup)

- **Filters:** All · Available · Minted
- **Sort:** Featured order · Newest · Oldest
- **Series rows:** name, work count, last updated, expand `+`
- **Tier labels:** Core series · Active series · Experiments & studies
- **Footer:** `{n} series · {m} works · Updated {month}`

---

## Pipeline status (header)

```
Pipeline active · last minted {date} · {n} works in catalog
```

Fed from: latest `drops/*/drop.json` with `status: published` + `catalog.json` work count.

---

## Visual system (rebrand)

| Token | Value | Use |
|-------|-------|-----|
| `--paper` | `#f5f0e8` | Background |
| `--ink` | `#111010` | Text |
| `--rule` | `#c8b89a` | Borders |
| `--accent` | `#8b2020` | Links, Buy, emphasis |
| `--muted` | `#7a7060` | Meta, labels |
| `--pale` | `#ece6d8` | Thumbs, panels |
| `--green` | `#2a6b3a` | Pipeline active, approve |

**Type:** Cormorant Garamond (body/display) + DM Mono (labels, meta).  
Differs from current live homepage (white + DM Sans) — intentional rebrand.

Full tokens: [STYLE-GUIDE.md](STYLE-GUIDE.md).

---

## Buy flow

1. User on work page or recent grid → **Buy ↗**
2. Wallet connect on **mark-walhimer.com**
3. Mint via **Transient Labs** ERC721TL (Ethereum mainnet)
4. Page status → Minted; catalog.json + drop JSON updated

Manifold referenced in mockup — **deprecated** unless explicitly chosen over TL.

---

## Sync with `data/catalog.json`

| Event | Catalog action |
|-------|----------------|
| Approve drop | Stage row (or draft in drop JSON) |
| Mint + publish | Add/update `works[]`: `catalog_number`, `dublin_core`, on-chain fields |
| Skip day | No catalog row |

On-chain fields to add per work (extend refresh merge):

```json
"program": {
  "series": "Letting Go",
  "dropDate": "2026-06-13",
  "dayOfYear": 164,
  "mint": {
    "platform": "transient_labs",
    "contract": "0x…",
    "tokenId": 42,
    "txHash": "0x…",
    "status": "available"
  }
}
```

---

## Rebrand file reference

| File | Location |
|------|----------|
| Catalog mockup | `~/Desktop/rebrand/files (67)/markwalhimer-catalog.html` |
| Process spec | `~/Desktop/rebrand/process.txt` |
| Multi-site styleguide | `~/Desktop/rebrand/styleguide.html` |

When mockup changes, update this doc + [SERIES.md](SERIES.md) + [DEADLINES.md](DEADLINES.md) public table.
