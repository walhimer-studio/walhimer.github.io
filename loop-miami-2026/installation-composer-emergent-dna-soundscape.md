# Installation Composer × Emergent DNA × Soundscape

**Thread review · April 2026**

**Project folder (local):** `/Users/markwalhimer/Desktop/Catalog/Loop Miami 2026/` — working summary for Loop / Miami 2026 planning.

**Canonical copy (site + GitHub):** repo folder [`walhimer.github.io/loop-miami-2026/`](https://github.com/walhimer-studio/walhimer.github.io/tree/main/loop-miami-2026) — static URL: `https://walhimer.github.io/loop-miami-2026/installation-composer-emergent-dna-soundscape.md`

This document consolidates a working-session discussion: technical options for **Loop / Onland**, the **Bloom** line of work, **GLB vs runtime**, **sound**, **aesthetic references** from verses on MUD / Loop, **hub-and-artist exhibition structure**, and alignment with **mark-walhimer.com** / **GitHub** (`walhimer`, `walhimer-studio`).

---

## 1. Directional bundle (your ask)

| Layer | Role |
|--------|------|
| **Installation Composer** | A *composition* mindset: one install = layout + media + sound + rules — not "one monolithic engine per venue." Prefer **repeatable modules** (lobby + artist slot) and **duplicate scene** workflows over bespoke everything. Repo: `installation-composer` on GitHub (verify README for current intent: layout tool vs archive). |
| **Emergent DNA** | **Rules + seed + variation** so the work **differs each run** — not a single pre-rendered path. Lives in **code + parameters**, not in a static GLB. Studio-side: `EmergentDNA` and related shared utilities under `walhimer-studio` if applicable. |
| **Soundscape** | Sound as **part of the system**: ambient bed + triggered notes/samples tied to the same state as the visuals (as in **Bloom / Four Walls**: piano notes aligned with generative "blooms"). Centralize samples via an **`audio`** repo / shared assets to avoid duplicating huge embedded data in every HTML file. |

**Pieces that naturally fit this bundle**

- **Bloom / Release (Four Walls)** — Three.js room, **canvas-driven projections**, **Salamander piano** samples, emergent spawn/die lifecycle. Strongest **full** example of DNA + soundscape + spatial read.
- **Technical Drawing** — Generative **artifacts** (grid, elevation, notation); sound can be **sparse / typographic / mechanical** — a *different* soundscape personality than Bloom. Good **takeaway** or **side gallery** energy.
- **Traveling Landscape** (or a **variant**) — **World with an age**: growth, breath, return to white; camera moves; emergent **terrain of boxes**. Natural sibling to Bloom with **land** instead of **room**; soundscape could emphasize **drift, cycles, lifecycle** rather than discrete notes.

Together, these three suggest **one exhibition grammar**: *same DNA philosophy*, **three scales** — room (Bloom), flat document (Technical Drawing), world (Traveling Landscape).

---

## 2. Technical thread summary

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
- **Hub + ~10 artists** (as in Loop Art Critique browsing): **one world** + **legible artist modules** + **routing** — same pattern as **`walhimer.github.io/art`**: index → linked experiences.
- **Tiers**: MVP = lobby + panels + links/QR to full pieces; stretch = one deeply integrated room.

---

## 3. Aesthetic reference (from your screenshots)

Common traits in favorites:

- **White void / lab / specimen** staging; **technical callouts** (labels, QR, "prototype" language).
- **Modularity** (cells, nodes, auxetic units) — aligns with **Emergent DNA** language.
- **Dark cinema / screening room** and **bright atrium gallery** are **format** options, not mandates to build custom architecture for every artist.

---

## 4. GitHub / site alignment

| Asset | Use for this bundle |
|--------|----------------------|
| **mark-walhimer.com** | Canonical **selected works** and install URLs (Living Commons, Surrender Machines, Bloom, Traveling Landscape, Shared Ground, Technical Drawing). |
| **walhimer.github.io/art** | Proven **hub → many installs** structure; reuse mentally for **verse** layout. |
| **Repos** `bloom-release`, `audio`, `art`, `installation-composer`, **`EmergentDNA`** (org) | Bloom line, shared sound, portfolio shell, composer tooling, shared generative utilities. |

---

## 5. Suggested next moves (concrete)

1. **Open `installation-composer` and `EmergentDNA` READMEs** — confirm whether they are active **layout/DNA helpers** or legacy; decide what to actually depend on.
2. **Soundscape plan**: one **ambient layer** + one **event layer** (Bloom-style notes vs Technical Drawing "plotter" clicks vs Traveling Landscape **phase** changes).
3. **Pick one "primary" for Loop**: **Bloom** (immersive) *or* **Traveling Landscape** (world) *or* **Technical Drawing** (lightweight + artifact); others as **linked** full pages.
4. **Keep hybrid path**: GLB **or** platform primitives for **collision/look**; **emergent core** on the web or in script **only if** the runtime supports **live** textures + your audio triggers.

---

## 6. Files referenced in this thread

| File | Notes |
|------|--------|
| `bloom-four-walls.html` | Full Bloom / Release experience (embedded audio; large file). |
| `bloom-hybrid-test.html` | GLB room + same logic as four-walls. |
| `bloom_room_hybrid.glb` | Named quads for walls/floor/ceiling (test geometry). |

---

## 7. Caveats

- **Cross-thread memory**: assistants do **not** automatically retain other chats; this file is the **portable** summary.
- **Loop APIs** evolve; verify **Canvas**, **ModelElement**, and **audio** patterns against current docs before locking a build.

---

*Compiled from conversation: platform mechanics, hybrid GLB/WebGL test, emergent vs video, exhibition format, GitHub/site inventory, and the Installation Composer × Emergent DNA × soundscape bundle (Bloom, Technical Drawing, Traveling Landscape).*
