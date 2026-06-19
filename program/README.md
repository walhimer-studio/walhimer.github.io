# Program — daily publishing & world-building

Operational home for **mark-walhimer.com**: **365/year** mints (when approved), **Kapoor-style numbered catalog**, daily social, weekly newsletter, and path from **fragments → objects → installation commissions**.

Aligned with `Desktop/rebrand/process.txt` and mockup `markwalhimer-catalog.html`. This folder is **ops + docs**; art stays in `sketches/` and `machine-aesthetic/`.

---

## What this is for

| Layer | Role |
|-------|------|
| **Daily fragments** | Up to 365 Ethereum mints/year (~$10 primary); subsidized publishing |
| **Numbered catalog** | `WS-NNNNNN` — every work, series tier, dedicated page |
| **World** | Program series + full archive — see [SERIES.md](SERIES.md) |
| **Objects** | LED panel, LCD console |
| **Monumental** | Site-specific commission ($100k+ on site) |

**Consulting** (books, museumplanning.com) parallel — art site leads.

---

## Files in this folder

| File | Purpose |
|------|---------|
| [README.md](README.md) | This overview |
| [CATALOG.md](CATALOG.md) | Public site IA, rebrand tokens, buy flow, catalog.json sync |
| [SERIES.md](SERIES.md) | Tier 1/2/3 archive + Program rotation series |
| [CALENDAR.md](CALENDAR.md) | Daily cadence, monthly rotation, festival context |
| [DEADLINES.md](DEADLINES.md) | Competitions, residencies, conferences |
| [ADMIN.md](ADMIN.md) | Approval queue, social queue, newsletter, analytics |
| [STYLE-GUIDE.md](STYLE-GUIDE.md) | Voice, visuals, posts |
| [drops.schema.json](drops.schema.json) | Per-day drop JSON |
| [dashboard/](dashboard/) | Studio dashboard POC — local admin UI |

**Next:** `drops/YYYY-MM-DD/`, `post-templates/`, `scripts/`

---

## Daily workflow

```
~06:00    Generate (p5 / Three.js) → drops/YYYY-MM-DD/
~08:00    Approve / skip / regenerate — [ADMIN.md](ADMIN.md)
~10:00    Pin metadata (Arweave or IPFS)
~12:00    Mint (Transient Labs) · publish work page · Post 1 (X + IG)
Weekly    Newsletter — 7 works + world paragraph
Optional  Context post · TL Story Inscription
```

**Drop time:** **12:00 ET** daily. **365/year** is the goal; **skips logged**, no backfill.

---

## Channels

| Channel | Cadence |
|---------|---------|
| **mark-walhimer.com/catalog** | Work page + buy on-site per mint |
| **X / Instagram** | Daily Post 1 on mint days |
| **Newsletter** | **Weekly** digest |
| **Link in bio** | → catalog |

Context posts: ~weekly or anchor weeks only.

---

## Economics (365/year)

- Primary ~$10 + gas (honest in FAQ)
- Secondary **10%** royalty (on-chain cap)
- Full subsidy ~**$3,650/year** at $10/day — studio marketing, not revenue
- **Mint:** Transient Labs ERC721TL, **Ethereum mainnet**, checkout **on site** (not Manifold-first)

---

## Catalog & data

| Source | Role |
|--------|------|
| `data/catalog.json` | Canonical `works[]`, `WS-NNNNNN` |
| `program/drops/` | Daily pipeline state |
| Rebrand mockup | UX reference only — not data |

Refresh: `_scripts/refresh_catalog.py` — [docs/unified-catalog.md](../docs/unified-catalog.md)

---

## Automation order

1. Manual daily drops (Letting Go pilot, 2–4 weeks)
2. `drops/` + schema
3. Admin approve + post copy scripts
4. Weekly newsletter aggregator
5. TL mint script (viem)
6. Catalog site from JSON ([CATALOG.md](CATALOG.md))
7. Full generate → approve → pin → mint → publish → social

---

## Related

- [machine-aesthetic/README.md](../machine-aesthetic/README.md)
- `~/Desktop/rebrand/process.txt`
- `~/Desktop/rebrand/files (67)/markwalhimer-catalog.html`
