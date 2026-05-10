# Loop snippets — blueprint / artifact SVG pipeline

This folder combines **procedural** SVG (`artifact_blueprint.py`), **raster tracing** (`trace_png_to_svg.py`), **DSPG grouping** (`dspg_wrap.py`), **component bundling** (`build_svg_components.py`), and a **demo assembly** (`machine-from-components.html`).

---

## Linework vs fills (important)

| Source | What the SVG contains |
|--------|------------------------|
| **`artifact_blueprint.py`** | Real **strokes**: `<line>`, `<path … stroke="…" fill="none">`. Clean schematic linework. |
| **`trace_png_to_svg.py` + potrace** | **Filled closed paths** that *look* like lines. Potrace traces bitmap **regions**, not centerlines. Anti-aliased PNG edges become **fuzzy bands** of tiny fills — this is why traced art often feels less “crisp” than native vector. |

**Crisp stroke-only SVG from a PNG is possible only if you:**

1. Draw or trace **by hand** in Inkscape / Illustrator (stroke tools), or  
2. Use **edge-first** tracing (see `--edges` in `trace_png_to_svg.py`) — still **fills**, but usually **thinner** than region-fill tracing, or  
3. Keep the **procedural** generator for true stroke geometry.

---

## Script inventory

| File | Role |
|------|------|
| `artifact_blueprint.py` | CLI: seeded isometric wireframe → SVG (+ optional PNG). **Stroke-based** linework. |
| `trace_png_to_svg.py` | PNG → PBM → **potrace** → SVG + background rect. Options: `--polarity`, `--edges`, `--bg-color`. |
| `dspg_wrap.py` | Wraps a traced SVG in **DSPG** groups (`dspg-*-root`, `slot-*`, `traced`) for Inkscape partitioning. |
| `build_svg_components.py` | Scans `reference/*.svg`, writes `reference/svg-components/registry.json`, `artifacts.mjs`, and **splits** each `*_dspg.svg` by `<g id="dspg-…">`. |
| `machine-from-components.html` | Static page that **layers** several `reference/*.svg` assets into one “machine” layout. |

## Reference assets (inputs / outputs)

| Path | Meaning |
|------|---------|
| `reference/*.png` | Source artwork for tracing (you replace / add as needed). |
| `reference/*_traced.svg` | Potrace output only (no DSPG wrapper). |
| `reference/*_dspg.svg` | Traced + DSPG group scaffolding from `dspg_wrap.py`. |
| `reference/svg-components/registry.json` | Machine-readable list of all SVGs + split group files. |
| `reference/svg-components/artifacts.mjs` | `fetchArtifactSvg`, `getArtifact`, `DSPG_GROUPS`. |
| `reference/svg-components/split/<bundle>/` | One mini-SVG per `dspg-*` group id. |

## Other files in this folder (legacy / unrelated to DSPG)

| File | Note |
|------|------|
| `ghost_machine_*.svg`, `ghost_*.html` | Earlier ghost-machine experiments; not part of the DSPG pipeline. |
| `milling_machine.html`, `milling_machine.svg` | Separate sketch. |
| `artifact_blueprint_1001.svg/png` | Example output from `artifact_blueprint.py` (regenerable). |

---

## Commands (cheat sheet)

```bash
# Procedural blueprint (true strokes)
python3 artifact_blueprint.py 1001

# Raster → SVG (filled contours; add --edges for edge-first traces — clearer boundaries)
python3 trace_png_to_svg.py out.svg -i reference/foo.png --polarity bright --threshold 80 --edges

# DSPG wrap (use a short slug, e.g. artifact3, to avoid dspg-dspg_3-style ids)
python3 dspg_wrap.py reference/foo_traced.svg reference/foo_dspg.svg --slug artifact3 --variant 3

# Rebuild registry + split components + artifacts.mjs
python3 build_svg_components.py
```

Preview bundled SVGs (needs local server):

```bash
cd reference && python3 -m http.server 8765
# open http://localhost:8765/svg-components/preview.html
```

---

## ID naming quirk

If you pass `--slug dspg_3` to `dspg_wrap.py`, XML ids look like `dspg-dspg_3-root`. Prefer `--slug artifact3` or `pair1` for readable ids.
