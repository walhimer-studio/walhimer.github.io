# Mark Walhimer Studio — reference list

*July 2026 · studio identity, platforms, tracker*

---

## 1. Studio identity

**Name:** Mark Walhimer Studio  
**Primary site (target):** https://markwalhimer.com  
**Redirect:** https://mark-walhimer.com → markwalhimer.com *(CNAME still hyphenated today)*  
**Email:** mark@walhimer.com  
**Consulting (separate):** https://museumplanning.com — one line on site/footer only; not the art brand

---

## 2. Social

| Platform | URL |
|----------|-----|
| Instagram | https://www.instagram.com/markwalhimer/ |
| X / Twitter | https://x.com/WalhimerArt |

**Standardize:** always `www.instagram.com/markwalhimer/` (not `WalhimerArt` on IG)

---

## 3. Platform profiles (acquire / distribution)

| Platform | URL | Notes |
|----------|-----|-------|
| Objkt | https://objkt.com/@markwalhimer | Tezos · on contact |
| Verse | https://verse.works/mark-walhimer | **Add to contact** |
| Raster | https://www.raster.art/artist/mark-walhimer | On contact |
| Creative Applications | https://www.creativeapplications.net/people/mark-walhimer/ | On contact |
| Medium | https://medium.com/@markwalhimer | Footers only |
| fxhash | https://www.fxhash.xyz/u/MarkWalhimer | Optional |
| YouTube | https://www.youtube.com/@Mark-Walhimer | Optional |
| Manifold | https://manifold.xyz/@markwalhimer | Miradas Tangentes works |
| Transient Labs | — | **Setup / no public profile yet** — planned primary mint for `/available/` (Ethereum) |
| Rhizome | https://rhizome.org/ | **Join** (membership) — separate from Commissions calls |
| SuperRare | Apply | Re-apply · no profile yet |
| Art Blocks | https://www.artblocks.io/apply/artist | Apply · no artist page yet |
| Feral File | Apply | Apply · no profile yet |

**Legacy / per-work (not studio profiles):**

| Item | URL |
|------|-----|
| Teia | https://teia.art/objkt/878978 | technical 021 mint archive |
| Loop / Onland rooms | e.g. `verse.loop.onland.io/…` | Project rooms — not duplicate of Verse artist home |

**Suggested contact block when updated:** Site · Instagram · X · Objkt · Verse · Raster · Medium · Creative Applications *(optional: fxhash, YouTube, Manifold)*

---

## 4. Competitions & programs (studio tracker)

| Program | Role | Status / notes |
|---------|------|----------------|
| Prix Ars Electronica | Major prize | Submitted 2026 · announce Jun 22 · prep 2027 ~Jan–Mar |
| S+T+ARTS Prize | Paired with Prix | Same deadline rhythm as Ars |
| Lumen Prize | Major prize | Submitted 2026 · results fall · 2027 ~May |
| VH AWARD | Major prize | 2026 workspace in catalog |
| Share Prize (Turin) | Optional | Monitor |
| Japan Media Arts Festival | Optional | Monitor |
| Rhizome Commissions | Optional | Monitor calls |

**Live tracker:** `program/DEADLINES.md` · `program/CALENDAR.md`  
**Rule:** Submissions live in catalog + DEADLINES; **wins only** on public bio/CV.

---

## 5. Residencies, shows & calendar (not prizes)

| Item | Role | On bio? |
|------|------|---------|
| Loop Art Critique / ICA Miami · Cohort #21 | Residency / cohort | Yes |
| Artist Commons · Summer 2026 | One-year residency | Yes · https://www.artistcommons.art/ |
| Miradas Tangentes · Madrid Feb 2026 | Exhibition | Yes |
| ACTZ / Myths & Legends · Objkt Jun 2026 | Group commission | Yes |
| Async Museum · Bloom | Exhibition | Yes · https://asyncmuseum.com |
| Loop Alumni Show · Jul 2026 | Show | Catalog — add bio when confirmed |
| The Wrong Biennale · Eclipse Aug 2026 | Biennale | Catalog — add bio when confirmed |
| **Miami Art Week** · early Dec | Fair week / ICA / Loop / curator visits | **Add to DEADLINES** — relationship calendar, not an application |
| NFC Summit · Lisbon · Jun | Web3 / crypto-collector festival | **Optional** — attended 2026; only return if showing or specific invites |
| CERN Collide | Residency | Monitor late 2026 call |
| SIGGRAPH art program | Competition / exhibition | Confirm deadline |
| MTA Arts & Design | Public commission | Monitor — different from awards |

---

## 6. Bio / CV credentials (not platforms)

- *Museums 101* and *Designing Museum Experiences* (Bloomsbury Publishing)
- Fulbright Specialist

---

## 7. Site status — good shape

- Homepage, practice, bio, installations, catalog, contact, self-contained HTML
- Thesis, commission language, selected works, studio archive
- Core platforms mostly linked (gaps in §8)

**Not a rebuild.** Cleanup + applications + outcomes.

---

## 8. Link & site fixes (housekeeping)

- [ ] **Domain:** migrate canonicals + `CNAME` to **markwalhimer.com**
- [ ] **Contact:** add Verse (+ Medium, fxhash if you want)
- [ ] **Objkt:** replace generic `objkt.com` with `objkt.com/@markwalhimer` on installation footers
- [ ] **Living Commons:** stop using `walhimer.github.io/art/` — use your domain paths
- [ ] **Instagram URLs:** one canonical form site-wide
- [ ] **Schema `sameAs` on homepage:** add Objkt, Verse, Raster, Creative Applications when domain is settled
- [ ] **Remove / verify stale:** LinkedIn `company/mark-walhimer-artist` in catalog metadata if dead

---

## 9. Catalog cleanup

- [ ] Trim duplicate README / catalog-statement rows (esp. Invisible Layer, Loop/Machine Aesthetic overlap)
- [ ] Fix corrupt Tezos index metadata row in `data/catalog.json`
- [ ] Run `python3 _scripts/refresh_catalog.py` after `SERIES` edits
- [ ] Keep submissions in catalog; promote to bio only when public/confirmed

**Docs:** `docs/unified-catalog.md` · `program/DEADLINES.md`

---

## 10. Applications in flight (platforms, not awards)

- [ ] **Art Blocks** — apply (`drafts/art-blocks-application.md`, `sketches/artblocks-2026/`)
- [ ] **Feral File** — apply → add URL to contact when live
- [ ] **SuperRare** — re-apply → add URL when live
- [ ] **Transient Labs** — finish `/available/` mint pipeline → add creator URL when live

---

## 11. Instagram (curator / collector goal)

- [ ] Bio: thesis + commissions + markwalhimer.com + email
- [ ] Pin one post (Machine DNA carousel or Invisible Layer or install photo)
- [ ] Highlights: Works · Install · Process · About
- [ ] Caption rule: named work + one conceptual line — not dev-log only
- [ ] Hashtags: 3 max on institutional posts
- [ ] Grid front-load: named works + scale, not only daily sketches

---

## 12. What you're not missing

**Major prizes:** Ars, Lumen, VH (+ Share / Japan Media optional)  
**Major residencies:** Loop/ICA, Artist Commons, CERN on monitor  
**Fair / relationship calendar:** Miami Art Week  
**Platforms:** Objkt, Verse, Raster, CA — plus apply queue for Art Blocks, Feral File, SuperRare, Transient Labs setup  

**Optional, not gaps:** Eyebeam, NEW INC, EMAP, Creative Capital  
**Deprioritize:** NFC Summit unless you have a concrete show/meeting reason  

---

## 13. Priority order (next 90 days)

1. Small link/contact fixes (§8)
2. Apply Art Blocks · Feral File · SuperRare
3. Wait on Ars (Jun 22) + Lumen results
4. Instagram bio + pin + highlights
5. Add **Miami Art Week** to DEADLINES; plan ICA/Loop in-town if relevant
6. Catalog trim + refresh when you have a quiet block
7. Domain migration when DNS/GitHub ready

---

## 14. One-line status

**Studio site and platform map are in good shape;** remaining work is **cleanup, three platform applications + Transient Labs pipeline, competition outcomes, Miami Art Week on the calendar, and Instagram as commission front door** — not missing a major residency or award in your lane.
