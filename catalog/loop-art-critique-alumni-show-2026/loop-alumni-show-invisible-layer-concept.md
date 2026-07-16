<!-- catalog-mirror: auto -->
# Loop Alumni Show — Invisible Layer (participatory landscape)

**Status:** Concept draft — for direction approval (Ariel)  
**Author:** Mark Walhimer  
**Date:** 2026-07-15

---

## One-line pitch

A **shared living landscape** built from the *Invisible Layer* line: visitors on their phones **offer images and gestures** into one organism on the ICA monitor; at the end of the show, a **cumulative artwork** remains from everyone’s participation.

---

## Exhibition context

| Field | Value |
|-------|--------|
| Show | Loop Art Critique Alumni Show #3 |
| Exhibition title | *Technological Counterproduction: System Misuse and Reinvention* |
| Venue | ICA Miami (dedicated monitor) · Loop Metaverse (Onland) |
| Run | June 11 – October 5, 2026 |
| Family Reunion | Loop Art Critique online · July 31 – August 2, 2026 |
| Curator | Doreen A. Ríos |

This piece is proposed as a **second alumni work** alongside the existing Surrender Machine entry (`sketches/loop-art-critique-2026/loop-21-surrender-machine/`). It is a **new artwork**, not a edit of prior sketches.

---

## Creative direction

### Lineage

- **Visual / sonic engine:** *Invisible Layer July-14-2026* — seed-born organism, invisible RGB motion map, fluoro palette anchored on seed **77823**, Machine DNA lifeline, surrender / rebirth cycle, sonification.
- **Spatial model:** *Invisible Layer July-13-2026 · landscape* — same driver, but experienced as a **walkable terrain** (horizon, forward motion) instead of wandering inside a volumetric **box**.

### Why landscape for this show

| Box (studio July 14) | Landscape (proposed show version) |
|----------------------|-----------------------------------|
| Camera inside an enclosed volume | Camera at eye height, walking an open field |
| Feels like inspecting an object | Feels like entering a shared world |
| Strong for solo studio study | Strong for a room full of people + a public monitor |

The monitor becomes a **vista everyone shares**; phones become **ways to feed the world**.

### Participatory model

Visitors do not passively watch. They **add to and change** the organism during the run of the show.

**Proposed contribution types** (exact UX TBD after approval):

1. **Offer** — upload a JPEG from phone (same ingest logic as COMPOSE: image → invisible RGB → volume / terrain).
2. **Nudge** — optional light controls (seed drift, rebirth trigger, or motion pulse) so the room can feel collective without breaking the piece.

Each contribution is **logged** so the show has memory.

### Aftermath (end of show)

When the exhibition closes, what remains:

| Artifact | Description |
|----------|-------------|
| **Cumulative artwork** | One composed state from the full contribution log — composite landscape, replay, or frozen final organism (format TBD). |
| **Contributor record** | Append-only log of offers + metadata (name / cohort optional). |
| **Documentation** | Screen recording of the monitor journey for press / portfolio. |

The dimensional experience is **time-bound**; the cumulative record is the **honest aftermath** of collective participation.

---

## Presentation (same pattern as July 3 opening)

Mirrors the Loop 21 opening setup:

| Surface | Role |
|---------|------|
| **ICA monitor** | Main display — the shared landscape organism, synced in real time |
| **Loop Metaverse** | Link-out from verse (wall / QR) → simple page in visitor browser |
| **Phone page** | Lightweight “offer / participate” UI — opens in **new tab**, browser-based world |

No requirement to embed live HTML inside the verse geometry; **click → URL** is the proven path (see `sketches/loop-art-critique-2026/LOOP-21-SURRENDER-WALL.md`).

---

## Technical approach (high level)

| Layer | Tool | Notes |
|-------|------|-------|
| Hosting | **Netlify** | Separate site for show (display + phone), same pattern as `netlify/gravity-77823/` |
| Sync | **Firebase Realtime Database** | Config via Netlify function; no API keys in repo |
| Display | New alumni HTML fork | July 14 organism + July 13 landscape renderer |
| Phone | Compose-style offer page | Already prototyped in `sketches/loop-art-critique-alumni-show-2026/compose.html` |
| Archive | RTDB `contributions` tree | Feeds end-of-show cumulative export |

Studio sketches stay self-contained on mark-walhimer.com; the **live participatory layer** runs on Netlify (CDN Firebase acceptable for that host).

---

## Machine DNA (proposed)

| Field | Value |
|-------|--------|
| Title | Loop Alumni Show — Invisible Layer |
| Species | Invisible Layer |
| Seed | 77823 (show default; collective drift via participation) |
| Mode | **Live / participatory / surrender / rebirth** |
| Bodies | browser (Netlify display + phone) · ICA monitor |
| Sound | Yes (MotionSoundscape) |

---

## Work in progress (after concept approval)

| Item | Path (planned) |
|------|----------------|
| Catalog entry (this doc) | `catalog/loop-art-critique-alumni-show-2026/loop-alumni-show-invisible-layer-concept.md` |
| Sketches / build | `sketches/loop-art-critique-alumni-show-2026/` |
| Netlify site | `netlify/` (new site TBD, e.g. `alumni-invisible-layer-2026`) |
| Hub | `sketches/loop-art-critique-alumni-show-2026/index.html` |

**Do not copy artwork into the alumni sketch folder** — canonical engine forks get explicit paths once build starts (per series README).

---

## Open questions (for approval conversation)

1. **Contribution scope** — image offer only, or also rebirth / nudge controls on phone?
2. **Cumulative form** — single frozen composite, scrubbable replay, contributor gallery, or all three?
3. **Relationship to Surrender Machine** — clearly separate second piece, or framed as companion in the same room?
4. **Naming for public / wall label** — “Loop Alumni Show,” “Invisible Layer,” or combined title?
5. **Family Reunion (July 31–Aug 2)** — soft target for first public participatory test?

---

## Related studio work (reference only — not the show build)

- `sketches/invisible-layer/invisible-layer-july-14-2026.html` — box / vol3d organism
- `sketches/invisible-layer/invisible-layer-july-13-2026-landscape.html` — walking landscape
- `sketches/loop-art-critique-alumni-show-2026/compose.html` — ephemeral offer prototype
- `drafts/surrender-machine-alumni-show-concept-2026-07-03.md` — earlier participatory machine notes

---

## Approval

- [ ] Direction approved — Ariel
- [ ] Direction approved — Mark
- [ ] Build authorized
