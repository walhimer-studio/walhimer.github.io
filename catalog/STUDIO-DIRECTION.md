# Studio direction — all catalog artwork

Every work in **`catalog/`** follows the same pipeline. This file is the catalog-side anchor; the **living checklist** (updated ongoing) is on the site:

**[Artwork pipeline — mark-walhimer.com/practice/artwork-pipeline.html](https://mark-walhimer.com/practice/artwork-pipeline.html)**

Repo path: [`practice/artwork-pipeline.html`](../practice/artwork-pipeline.html)

---

## What this means for every piece

| Principle | Catalog implication |
|-----------|---------------------|
| **Title + seed** | Each artwork is **title · seed** — the organism is that seed. Document seed in `{artwork}.md`. Major revision → new seed; prior seed stays in archive. |
| **Machine DNA** | Species, lifeline, traits, `express()` snapshot — not ad-hoc randomness. Link kernel / species in statement and WIP paths. |
| **Same genome, many bodies** | Browser sketch → OpenFrameworks / Pure Data / LED / room mesh. State one **OSC contract** per species where applicable. |
| **Votive vs surrender** | Not every piece is interactive. **Votive / witness** (listen, awe) vs **surrender / mirror** (co-create, scars). State mode in `{artwork}.md`. |
| **Publish** | Self-contained HTML (no CDN for core libs; all local script/import paths exist), Chrome · Safari · Firefox, `python3 _scripts/check_self_contained.py` on full repo before commit, `refresh_catalog.py` when public. |

---

## When you add catalog entries

1. Read the [artwork pipeline](../practice/artwork-pipeline.html) checklist for the decision gate (species, seed, lifeline, mode, bodies, interactivity).
2. Create `catalog/{path}/README.md` and `{artwork}.md` under the matching `sketches/{path}/`.
3. In `{artwork}.md`, record at minimum: **title**, **seed** (when minted), **species**, **mode** (votive or surrender), **bodies** (browser · OF · PD · install · etc.).

---

## Related specs (repo)

| Doc | Role |
|-----|------|
| [`machine-aesthetic/emergent-dna/README.md`](../machine-aesthetic/emergent-dna/README.md) | Machine DNA kernel vocabulary |
| [`docs/submission-and-series-structure.md`](../docs/submission-and-series-structure.md) | Folder layout, frozen submissions |
| [`docs/unified-catalog.md`](../docs/unified-catalog.md) | `data/catalog.json` refresh |

---

*Living document — keep in sync with practice/artwork-pipeline.html.*
