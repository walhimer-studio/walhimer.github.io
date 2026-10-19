# Studio direction — all catalog artwork

Every work in **`catalog/`** follows the same pipeline. This file is the catalog-side anchor; the **living checklist** (updated ongoing) is on the site:

**[Artwork pipeline — mark-walhimer.com/practice/artwork-pipeline.html](https://mark-walhimer.com/practice/artwork-pipeline.html)**

Repo path: [`practice/artwork-pipeline.html`](../practice/artwork-pipeline.html)

---

## What this means for every piece

| Principle | Catalog implication |
|-----------|---------------------|
| **Title + seed** | Each artwork is **title · seed** — the organism is that seed. Document seed in `{artwork}.md`. Major revision → new seed; prior seed stays in archive. |
| **Machine DNA** | Species, lifeline, traits, `express()` snapshot — not ad-hoc randomness. **Canonical lifeline + `CanvasRecorder`:** `.cursor/MACHINE_DNA_CANON.md` (hook-enforced). Link kernel / species in statement and WIP paths. |
| **Same genome, many bodies** | Browser sketch → OpenFrameworks / Pure Data / LED / room mesh. State one **OSC contract** per species where applicable. |
| **Votive vs surrender** | Not every piece is interactive. **Votive / witness** (listen, awe) vs **surrender / mirror** (co-create, scars). State mode in `{artwork}.md`. |
| **Publish** | Self-contained HTML (no CDN for core libs; all local script/import paths exist), Chrome · Safari · Firefox, `python3 _scripts/check_self_contained.py` on full repo before commit, `refresh_catalog.py` when public. |

---

## Public series unit (show / year)

The long-term archive unit is a **show or year series** — not a pile of loose sketches.

| Piece | Path / URL |
|-------|------------|
| Catalog | `catalog/{name}/` |
| Hub + code | `sketches/{name}/` |
| Short URL | `https://mark-walhimer.com/{name}/` |
| Root stub | `{name}/index.html` → sketches (redirect only) |

**Examples:** [Marfa 2026](https://mark-walhimer.com/marfa-2026/) · [Miami 2026](https://mark-walhimer.com/miami-2026/). Next year = new folder (`marfa-2027`), same shape. Full checklist: [docs/submission-and-series-structure.md](../docs/submission-and-series-structure.md).

---

## When you add catalog entries

1. Read the [artwork pipeline](../practice/artwork-pipeline.html) checklist for the decision gate (species, seed, lifeline, mode, bodies, interactivity).
2. Prefer a **show/year series** path (`catalog/miami-2026/`, etc.); create `README.md` and `{artwork}.md` under the matching `sketches/{path}/`.
3. In `{artwork}.md`, record at minimum: **title**, **seed** (when minted), **species**, **mode** (votive or surrender), **bodies** (browser · OF · PD · install · etc.).
4. Ship the short URL + Available row when the series is public (see launch-pages rule).

---

## Related specs (repo)

| Doc | Role |
|-----|------|
| [Machine-DNA `docs/CHRONICLE.md`](https://github.com/walhimer-studio/Machine-DNA/blob/main/docs/CHRONICLE.md) | **Canonical Machine DNA meaning** |
| [`docs/machine-dna-chronicle.md`](../docs/machine-dna-chronicle.md) | Site mirror + worked examples |
| [`machine-aesthetic/emergent-dna/README.md`](../machine-aesthetic/emergent-dna/README.md) | Site organism / express() host notes |
| [`docs/submission-and-series-structure.md`](../docs/submission-and-series-structure.md) | **Show/year series** + prize/frozen secondary |
| [`docs/unified-catalog.md`](../docs/unified-catalog.md) | `data/catalog.json` refresh |
| [`docs/wall-screen-edition/README.md`](../docs/wall-screen-edition/README.md) | Wall screen editions — hub (plan · installer · art advisor) |
| [`docs/wall-screen-edition-plan.md`](../docs/wall-screen-edition-plan.md) | Full product & install technical plan |

---

*Living document — keep in sync with practice/artwork-pipeline.html.*
