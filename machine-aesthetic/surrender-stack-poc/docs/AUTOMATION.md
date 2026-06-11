# Automation — Transient Labs & Manifold

**Separate from runtime stack.** Mint platforms do not replace Firebase, Supabase, or OSC.

## What the stack POC proves (runtime)

```
Phone → Firebase (operator)
Brain → Emergent DNA → Supabase (genome) + OSC (local bodies)
Display / Pd / OF (expression)
```

## What Transient Labs / Manifold add (ops)

| Layer | Role |
|-------|------|
| **Transient Labs** | Primary mint — ERC721TL on Ethereum, on-site checkout ([program/README.md](../../../program/README.md)) |
| **Manifold** | Optional alternate mint path |
| **`program/dashboard/`** | Approve → mint → social queue (POC today) |
| **`program/drops/`** | Per-drop JSON (`drops.schema.json`) |
| **`data/catalog.json`** | Public numbered catalog WS-NNNNNN |

Mint answers: **who owns drop #N, when, on-chain provenance.**  
Stack answers: **what seed/genome the live organism runs.**

---

## What still needs to be built (automation bridge)

| # | Component | Connects |
|---|-----------|----------|
| 1 | **Drop JSON generator** | seed + genome snapshot → `program/drops/YYYY-MM-DD/drop.json` |
| 2 | **Mint script (viem + TL)** | dashboard Approve → Transient Labs contract → tokenId |
| 3 | **Post-mint hook** | mint tx → write `seed` + `tokenId` to Supabase `genomes` or Firebase `sessions/` |
| 4 | **Catalog sync** | mint success → update `data/catalog.json` + work page |
| 5 | **Scheduler** | `program/CALENDAR.md` cadence → cron or manual dashboard |
| 6 | **Work page template** | seed, scar count, link to live display URL (optional) |

None of this blocks the install stack POC. Build **after** Mac brain + phone + genome loop is green.

---

## Minimal automation flow (target)

```
1. Artist approves drop in dashboard
2. Script mints on Transient Labs (seed = 77823 + generation in metadata)
3. Hook writes genome row to Supabase with mint provenance fields
4. dna-bridge at venue loads that seed on next session
5. Social post queued (IG/X) from drop JSON
```

---

## Manifold vs Transient Labs

Per [program/CATALOG.md](../../../program/CATALOG.md): **Transient Labs first.** Manifold only if explicitly chosen for a drop.

Same hook pattern — only mint API changes.

---

## Do not automate yet until

- [ ] `node scripts/diagnose.mjs` — all green
- [ ] Phone controller green dot on LAN
- [ ] Display **genome live**
- [ ] Pd `RAW: seed` or defer audio to Linux install

Then wire **one** test mint → Supabase seed row manually before full TL script.
