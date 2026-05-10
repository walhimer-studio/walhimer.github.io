#!/usr/bin/env python3
"""
Raster → SVG via potrace (bitmap trace).

  LIMIT: potrace outputs **filled** <path> regions, not single-pixel strokes. For “pen” linework
  use artifact_blueprint.py, hand tracing in Inkscape, or try --edges for thinner edge-based traces.

Workflow (recommended):
  1) Trace QC — tune --threshold / --median / potrace flags until the SVG matches the PNG.
  2) Component groups — open the SVG in Inkscape (or Figma/Illustrator): assign layers or
     named groups (lens, reel, base, …). Tracing does not produce semantic parts automatically.
  3) Remix — load grouped SVG in Three.js / p5.js / Python and transform groups independently.

Requires:
  brew install potrace
  pip install pillow

Example:
  python3 trace_png_to_svg.py reference/artifact_blueprint_target_traced.svg \\
    --input reference/artifact_blueprint_target.png --threshold 190 --median 3

Use --polarity bright for white linework on darker blue.
Use --polarity dark for dark linework on light backgrounds (e.g. artifact_pair_1).

Optional --edges: PIL FIND_EDGES + autocontrast before threshold — often **clearer** boundaries
(still filled paths, not SVG stroke attributes). Usually pair with --polarity bright and a lower -t.

Foreground artwork uses white (#FFFFFF); background uses REFERENCE_BG or --bg-color.

See COMPONENTS.md in this folder for the full file map.
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile

REFERENCE_BG = "#6B92D6"


def main() -> None:
    p = argparse.ArgumentParser(description="Trace a PNG to SVG using potrace")
    p.add_argument(
        "output_svg",
        nargs="?",
        default=None,
        help="Output .svg path (default: next to input, .svg extension)",
    )
    p.add_argument(
        "--input",
        "-i",
        default=None,
        help="Input PNG (default: reference/artifact_blueprint_target.png beside this script)",
    )
    p.add_argument(
        "--polarity",
        choices=("bright", "dark"),
        default="bright",
        help="bright: luminance > threshold = ink (white strokes). "
        "dark: luminance < threshold = ink (dark strokes on light BG).",
    )
    p.add_argument(
        "--threshold",
        "-t",
        type=int,
        default=200,
        metavar="0-255",
        help="With bright polarity: ink when luminance exceeds this (default 200). "
        "With dark polarity: ink when luminance is below this (try 120–170).",
    )
    p.add_argument(
        "--bg-color",
        default=None,
        metavar="#RRGGBB",
        help=f"Background rect fill for output SVG (default: {REFERENCE_BG})",
    )
    p.add_argument(
        "--turdsize",
        type=int,
        default=2,
        help="Potrace speckle suppression (default: 2)",
    )
    p.add_argument(
        "--median",
        type=int,
        default=0,
        metavar="N",
        help="If > 0, apply median filter before threshold (odd size 3 or 5; reduces noise / doubles)",
    )
    p.add_argument(
        "--alphamax",
        type=float,
        default=None,
        metavar="N",
        help="Potrace corner smoothness (default: potrace built-in; try 1.0–1.334)",
    )
    p.add_argument(
        "--opttolerance",
        type=float,
        default=None,
        metavar="N",
        help="Potrace curve optimization (default: 0.2); higher = simpler paths",
    )
    p.add_argument(
        "--edges",
        action="store_true",
        help="Run FIND_EDGES + autocontrast before threshold (thinner boundaries; still filled paths)",
    )
    args = p.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    in_path = args.input or os.path.join(script_dir, "reference", "artifact_blueprint_target.png")
    if not os.path.isfile(in_path):
        print(f"Input not found: {in_path}", file=sys.stderr)
        sys.exit(1)

    out_path = args.output_svg
    if not out_path:
        base = os.path.splitext(in_path)[0]
        out_path = base + "_traced.svg"

    potrace = shutil.which("potrace")
    if not potrace:
        print("potrace not found. Install:  brew install potrace", file=sys.stderr)
        sys.exit(1)

    try:
        from PIL import Image, ImageFilter, ImageOps
    except ImportError:
        print("pip install pillow", file=sys.stderr)
        sys.exit(1)

    im = Image.open(in_path).convert("L")
    if args.median and args.median > 0:
        size = args.median if args.median % 2 == 1 else args.median + 1
        size = max(3, min(size, 5))
        im = im.filter(ImageFilter.MedianFilter(size=size))
    if args.edges:
        im = im.filter(ImageFilter.FIND_EDGES)
        im = ImageOps.autocontrast(im, cutoff=1)
    th = args.threshold
    if args.polarity == "bright":
        bw = im.point(lambda x, t=th: 0 if x > t else 255, mode="1")
    else:
        bw = im.point(lambda x, t=th: 0 if x < t else 255, mode="1")

    with tempfile.TemporaryDirectory() as td:
        pbm = os.path.join(td, "trace.pbm")
        bw.save(pbm)
        raw_svg = os.path.join(td, "raw.svg")
        cmd = [
            potrace,
            "-s",
            "-o",
            raw_svg,
            "--turdsize",
            str(args.turdsize),
            "-C",
            "#FFFFFF",
            "--fillcolor",
            "#FFFFFF",
        ]
        if args.alphamax is not None:
            cmd.extend(["--alphamax", str(args.alphamax)])
        if args.opttolerance is not None:
            cmd.extend(["--opttolerance", str(args.opttolerance)])
        cmd.append(pbm)
        subprocess.run(cmd, check=True)

        with open(raw_svg, encoding="utf-8") as f:
            svg = f.read()

    bg = args.bg_color or REFERENCE_BG
    svg = _inject_blueprint_background(svg, bg)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(svg)

    print(f"Wrote {out_path}")
    hint = "edge-enhanced bitmap → " if args.edges else ""
    print(
        f"  Note: potrace outputs filled paths ({hint}not stroke-only); see COMPONENTS.md."
    )


def _inject_blueprint_background(svg: str, bg_fill: str) -> str:
    """Prepend a full-bleed rect after opening <svg ...>."""
    m = re.search(r"<svg\b[^>]*>", svg, re.I)
    if not m:
        return svg
    insert_at = m.end()
    # Match width/height from svg tag for rect (fallback 100%)
    tag = m.group(0)
    wm = re.search(r"\bwidth=\"([^\"]+)\"", tag)
    hm = re.search(r"\bheight=\"([^\"]+)\"", tag)
    w = wm.group(1) if wm else "100%"
    h = hm.group(1) if hm else "100%"
    rect = f'<rect width="{w}" height="{h}" fill="{bg_fill}" x="0" y="0"/>'
    return svg[:insert_at] + rect + svg[insert_at:]


if __name__ == "__main__":
    main()
