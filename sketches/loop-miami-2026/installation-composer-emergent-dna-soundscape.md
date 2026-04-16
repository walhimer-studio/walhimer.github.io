# Installation Composer × Emergent DNA × Soundscape

**Thread review · April 2026**

**Project folder (local):** `/Users/markwalhimer/Desktop/Catalog/Loop Miami 2026/` — working summary for Loop / Miami 2026 planning.

**Canonical copy (site + GitHub):** repo folder [`sketches/loop-miami-2026/`](https://github.com/walhimer-studio/walhimer.github.io/tree/main/sketches/loop-miami-2026) — listed first in **[Catalog](https://mark-walhimer.com/sketches/index.html)** — static URL: `https://mark-walhimer.com/sketches/loop-miami-2026/installation-composer-emergent-dna-soundscape.md` (mirror: `https://walhimer.github.io/sketches/loop-miami-2026/installation-composer-emergent-dna-soundscape.md`). The same folder holds **copies of discussed prototypes** (Bloom, hybrid + GLB, walk/moon/audio, city gradient, technical drawing, traveling landscape, orchestrator); see [`index.html`](https://mark-walhimer.com/sketches/loop-miami-2026/). **Loop Art Critique room (verse):** [The Critique Club](https://verse.loop.onland.io/kfAkyqx/the-critique-club). **Presentation links:** [`critique-hub.html`](https://mark-walhimer.com/sketches/loop-miami-2026/critique-hub.html).

This document consolidates a working-session discussion: technical options for **Loop / Onland**, the **Bloom** line of work, **GLB vs runtime**, **sound**, **aesthetic references** from verses on MUD / Loop, possible **hub / lobby** patterns (now optional), and alignment with **mark-walhimer.com** / **GitHub** (`walhimer`, `walhimer-studio`).

---

## 1. Directional bundle (your ask)

| Layer | Role |
|--------|------|
| **Installation Composer** | A *composition* mindset: one install = layout + media + sound + rules — not "one monolithic engine per venue." Prefer **repeatable modules** (optional lobby + artist slot) and **duplicate scene** workflows over bespoke everything. Repo: `installation-composer` on GitHub (verify README for current intent: layout tool vs archive). |
| **Emergent DNA** | **Rules + seed + variation** so the work **differs each run** — not a single pre-rendered path. Lives in **code + parameters**, not in a static GLB. Studio-side: `EmergentDNA` and related shared utilities under `walhimer-studio` if applicable. |
| **Soundscape** | Sound as **part of the system**: ambient bed + triggered notes/samples tied to the same state as the visuals (as in **Bloom / Four Walls**: piano notes aligned with generative "blooms"). Centralize samples via an **`audio`** repo / shared assets to avoid duplicating huge embedded data in every HTML file. |

**Pieces that naturally fit this bundle**

- **Bloom / Release (Four Walls)** — Three.js room, **canvas-driven projections**, **Salamander piano** samples, emergent spawn/die lifecycle. Strongest **full** example of DNA + soundscape + spatial read.
- **Technical Drawing** — Generative **artifacts** (grid, elevation, notation); sound can be **sparse / typographic / mechanical** — a *different* soundscape personality than Bloom. Good **takeaway** or **side gallery** energy.
- **Traveling Landscape** (or a **variant**) — **World with an age**: growth, breath, return to white; camera moves; emergent **terrain of boxes**. Natural sibling to Bloom with **land** instead of **room**; soundscape could emphasize **drift, cycles, lifecycle** rather than discrete notes.

Together, these three suggest **one exhibition grammar**: *same DNA philosophy*, **three scales** — room (Bloom), flat document (Technical Drawing), world (Traveling Landscape).

---

## 2. Exhibition shape & scene vocabulary (where you are now)

**Group vs solo:** The show may be **one shared environment** that everyone builds together, or **ten artists each doing their own thing**. You **do not** need to design a **central lobby** unless the cohort commits to a **single shared world**. If people work independently, routing can stay simple: **individual pieces, URLs, QR on panels** — same creative core, less shared systems work.

**Goal for now:** **Play across the prototypes** (Bloom, Technical Drawing, walking sketches, hybrid tests, sound) until a **framework** feels clear — how scenes hand off, what varies each run, how audio attaches. Avoid over-building “architecture” before the scenes settle.

**Scene types you’re weaving (intentionally a lot; each pass can foreground one or two):**

| Scene / line | Role in the physical / immersive read |
|----------------|----------------------------------------|
| **Emergent DNA** | The rule: **seed + parameters + rules** → **it’s different every time** — not one looped video. |
| **Bloom + soundscape** | **Room-scale immersion**: lifecycle “blooms,” **ambient bed + triggered samples** locked to the same state as the visuals. |
| **Technical Drawing** | **Wall / document** energy: elevation, grid, notation — sound can stay **minimal, mechanical, plotter-like**. |
| **Traveling Landscape** (or variant) | **World / drift**: terrain, cycles, breath — **land** as the sibling to Bloom’s **room**. |
| **Walking** | **Motion and duration**: e.g. moon walk + generative audio; city-gradient **tunnel / corridor** — path as a scene, not only a static view. |
| **Takeaway (optional, later)** | **QR to a page**, **email yourself a still**, or (separate project) **on-chain souvenir** — proof of visit; does not need to ship with the first framework pass. |

**Visitor fantasy (north star):** Someone **walks into the room** and **this unfolds** — a sequence of scales (document → corridor → room → world, or another order) with **one DNA philosophy** and a **new outcome each visit**. The lobby is optional glue; **this unfolding** is the through-line.

---

## 3. Technical thread summary

### GLB and the platform

- **GLB** = mesh + materials (+ optional animation). Good for **room shell**, props, **collision / look** in XR Creator Studio.
- **Projections, canvas logic, interactive audio** do **not** live inside the GLB; they attach at **runtime** (scripts, materials, `AudioElement` / `audioListener` + `THREE.Audio`, per [Loop scripting docs](https://docs.loop.onland.io/xr-creator/scripting-api/)).
- **Named meshes** in the exported room (e.g. `Wall_North`, …) let scripts **find surfaces** to map textures onto.

### Hybrid workflow (validated in a local test)

- **Room** can be a small **GLB**; **full Bloom** can stay a **custom WebGL page** (same emergent pipeline).
- Local test artifacts (see also `Desktop/untitled folder 3/`): `bloom-hybrid-test.html` + `bloom_room_hybrid.glb` — GLB room + original canvas + piano logic. **Serve over HTTP** (not `file://`) so the GLB loads.
- **Pre-rendered video** on walls was rejected for the **core** Bloom intent: it kills **emergence**. If the platform cannot do **live** texture/canvas updates, the **faithful** home for the full piece remains the **open web build**.

### Tools (recap)

- **Blender** optional; **AI-to-GLB** tools (e.g. Tripo, Meshy, Luma, Rodin) for objects; **simple shells** often faster as **boxes** or **small scripts**.
- **Three.js** → **GLB** via **`GLTFExporter`** (`binary: true`) for bringing geometry *out* of a web pipeline.

### Scope and "what feels like art"

- Spending **hundreds of hours** on engine glue is **optional**; **framing, statement, and documentation** are valid centers of gravity.
- **Hub + ~10 artists** (as in Loop Art Critique browsing): **one world** + **legible artist modules** + **routing** — same pattern as **`walhimer.github.io/art`**: index → linked experiences. **If the cohort is solo-first, treat this as per-artist links, not a mandatory shared lobby.**
- **Tiers**: MVP = panels + links/QR to full pieces; stretch = shared lobby + one deeply integrated world (only if the group chooses it).

---

## 4. Aesthetic reference

### From your screenshots

Common traits in favorites:

- **White void / lab / specimen** staging; **technical callouts** (labels, QR, "prototype" language).
- **Modularity** (cells, nodes, auxetic units) — aligns with **Emergent DNA** language.
- **Dark cinema / screening room** and **bright atrium gallery** are **format** options, not mandates to build custom architecture for every artist.

### Lineage: unfolding, not “story”

A useful pole star for the **room that unfolds** (different each time, no required lobby-as-narrative):

- **Robert Wilson** — stage pictures in **duration**; light, posture, and scale do the work. You stay inside an image until it turns; **plot** is optional.
- **Philip Glass · *Einstein on the Beach*** (Wilson, 1976) — opera without conventional scenes; **tableaux + music + repetition** that **accrue** meaning instead of explaining. The experience is “it keeps opening” — **wow / wow / oh** — not “and then therefore.”
- **Pina Bausch** (Tanztheater Wuppertal) — **dance theater**: everyday gesture, repetition, emotional weather; the **accumulation** of images matters more than a single storyline. (A useful contrast to literal narrative when designing **emergent DNA** scenes.)

**Bridge to this bundle:** Your installs can aim for that **unfolding** quality — seed-driven variation, ambient + punctuated sound, scene handoffs — without forcing a **narrative arc**. Beauty and **recognition** (“this is yours / this moment”) can carry it.

---

## 5. GitHub / site alignment

| Asset | Use for this bundle |
|--------|----------------------|
| **mark-walhimer.com** | Canonical **selected works** and install URLs (Living Commons, Surrender Machines, Bloom, Traveling Landscape, Shared Ground, Technical Drawing). |
| **walhimer.github.io/art** | Proven **hub → many installs** structure; reuse mentally for **verse** layout. |
| **Repos** `bloom-release`, `audio`, `art`, `installation-composer`, **`EmergentDNA`** (org) | Bloom line, shared sound, portfolio shell, composer tooling, shared generative utilities. |

---

## 6. Suggested next moves (concrete)

1. **Open `installation-composer` and `EmergentDNA` READMEs** — confirm whether they are active **layout/DNA helpers** or legacy; decide what to actually depend on.
2. **Soundscape plan**: one **ambient layer** + one **event layer** (Bloom-style notes vs Technical Drawing "plotter" clicks vs Traveling Landscape **phase** changes).
3. **Scene mashups before lobby:** combine **two** lines at a time (e.g. Technical Drawing wall + walking corridor + Bloom room) until handoff rules feel natural; **defer shared lobby** until the group picks one world.
4. **Pick one "primary" for Loop** when ready: **Bloom** (immersive) *or* **Traveling Landscape** (world) *or* **Technical Drawing** (lightweight + artifact); others as **linked** full pages.
5. **Keep hybrid path**: GLB **or** platform primitives for **collision/look**; **emergent core** on the web or in script **only if** the runtime supports **live** textures + your audio triggers.

---

## 7. Files referenced in this thread

| File | Notes |
|------|-------|
| `bloom-four-walls.html` | Full Bloom / Release experience (embedded audio; large file). |
| `bloom-hybrid-test.html` | GLB room + same logic as four-walls. |
| `bloom_room_hybrid.glb` | Named quads for walls/floor/ceiling (test geometry). |
| `technical-drawing-with-elevation*.html` | Technical Drawing / elevation line of work. |
| `walk_moon_audio_standalone.html` | Walking + moon + generative audio (Three.js + Tone.js). |
| `city_gradient_standalone.html` | p5 WEBGL corridor / gradient boxes (walking / tunnel prototype). |

**Bundled in `sketches/loop-miami-2026/`:** working copies of the above (where applicable) for a single-folder Loop Miami bundle; the **Catalog** lists them under the **Loop Miami 2026** series.

---

## 8. Caveats

- **Cross-thread memory**: assistants do **not** automatically retain other chats; this file is the **portable** summary.
- **Loop APIs** evolve; verify **Canvas**, **ModelElement**, and **audio** patterns against current docs before locking a build.

---

*Compiled from conversation: platform mechanics, hybrid GLB/WebGL test, emergent vs video, optional group lobby vs solo artists, scene vocabulary (Bloom, Technical Drawing, Traveling Landscape, walking, soundscape, optional QR/email takeaway), aesthetic lineage (Wilson, Glass / *Einstein on the Beach*, Pina Bausch — unfolding without plot), GitHub/site inventory, and the Installation Composer × Emergent DNA × soundscape bundle.*
