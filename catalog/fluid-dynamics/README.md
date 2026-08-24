<!-- catalog-mirror: auto -->
# Fluid Dynamics

**Studio direction:** [Artwork pipeline](https://mark-walhimer.com/practice/artwork-pipeline.html) · [../STUDIO-DIRECTION.md](../STUDIO-DIRECTION.md)

| Field | Value |
|-------|--------|
| Series | Fluid Dynamics |
| Catalog path | `catalog/fluid-dynamics/` |
| WIP sketches | `sketches/fluid-dynamics/` |

## Works

| Work | File | Date |
|------|------|------|
| Ink Bloom — reference study (4K portrait) | `sketches/fluid-dynamics/ink-bloom-ref.html` | August 24, 2026 |
| Two Viscosities — 1000×1000 | `sketches/fluid-dynamics/fluid-mix-two-viscosities-v2.html` | August 15, 2026 |
| Two Viscosities — 2160×3840 | `sketches/fluid-dynamics/fluid-mix-two-viscosities-portrait.html` | August 15, 2026 |
| Two Viscosities — 3840×2160 | `sketches/fluid-dynamics/fluid-mix-two-viscosities-landscape.html` | August 15, 2026 |
| Two Viscosities — rock landscape 3840×2160 | `sketches/fluid-dynamics/fluid-mix-two-viscosities-landscape-rock.html` | August 21, 2026 |

## Two Viscosities

Two fluids of different viscosities in a 1000 × 1000 vessel, vivid pink and
vivid blue, meeting along a single boundary that cannot come apart.

The boundary holds for a structural reason rather than a tuned one. The usual
way to carry two fluids on a grid is a phase field — a number per cell saying
how much of each fluid is present — and that representation permits the
boundary to change topology: a neck thins until it severs, a fold closes and
seals a pocket. Those changes are one-way, so any amount of flow slowly grinds
two fluids into droplets and foam. Surface tension, viscosity and damping only
slow it down. Here the boundary is stored instead as one height per column. A
height is single valued, so the boundary is always exactly one connected curve
running wall to wall, and there is no arrangement of those numbers that
represents a droplet or a bubble. Fragmenting is not discouraged, it is
unrepresentable.

The fluid itself is a real 2D solve, so the difference in viscosity is real:
one fluid is forty times thicker than the other, and striations frozen into
each and carried by the flow show the thin one racing while the thick one
barely creeps. The vessel rocks slowly to keep it moving.

**Medium:** WebGL2, GLSL, HTML, created in Cursor
**Controls:** `R` record · `N` reset · `SPACE` pause · drag to nudge · `H` hide

## Publish checklist

1. Update this README and any `{artwork}.md` in this folder
2. WIP under matching `sketches/{path}/`
3. Register catalog links in `sketches/index.html` SERIES
4. `python3 _scripts/reorder_series_by_index_mtime.py`
5. `python3 _scripts/refresh_catalog.py`
6. `python3 _scripts/check_self_contained.py` (full repo, exit 0)

## Machine DNA (fill in for new work)

| Field | Value |
|-------|--------|
| Species | TBD |
| Seed | TBD |
| Mode | votive / witness · or surrender / mirror |
| Bodies | browser |
