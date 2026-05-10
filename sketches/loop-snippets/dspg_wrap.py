#!/usr/bin/env python3
"""
Wrap a potrace-produced SVG in DSPG (document structure path groups) scaffolding:

  dspg-<slug>-root
    dspg-<slug>-slot-<name>   (empty — duplicate/move paths here in Inkscape)
    dspg-<slug>-traced       (full potrace <g transform>… — partition from here)

Example (prefer a short slug so ids stay readable, e.g. artifact3 not dspg_3):
  python3 dspg_wrap.py reference/artifact_dspg_3_traced.svg reference/artifact_dspg_3_dspg.svg \\
    --slug artifact3 --variant 3
"""

from __future__ import annotations

import argparse
import re
import sys

VARIANT_SLOTS: dict[str, list[tuple[str, str]]] = {
    "3": [
        ("layer-turbines", "Circular / turbine assemblies"),
        ("layer-supports", "Vertical columns & horizontal platforms"),
        ("layer-wiring", "Thin conduits / interconnect lines"),
        ("layer-base", "Footprint / base frame"),
    ],
    "4": [
        ("layer-orange-solids", "Orange fills (may need separate color trace)"),
        ("layer-wireframe", "Black wireframe shell"),
        ("layer-central-core", "Dense middle cluster"),
        ("layer-base", "Bottom / grounding geometry"),
    ],
}


def main() -> None:
    p = argparse.ArgumentParser(description="Wrap traced SVG in DSPG group scaffolding")
    p.add_argument("input_svg")
    p.add_argument("output_svg")
    p.add_argument("--slug", required=True, help="Short id, e.g. dspg_3")
    p.add_argument("--variant", choices=("3", "4"), required=True)
    args = p.parse_args()

    try:
        with open(args.input_svg, encoding="utf-8") as f:
            svg = f.read()
    except OSError as e:
        print(e, file=sys.stderr)
        sys.exit(1)

    slots = VARIANT_SLOTS[args.variant]
    sid = re.sub(r"[^\w\-]", "-", args.slug)
    root_id = f"dspg-{sid}-root"

    slot_lines = []
    for slot_key, desc in slots:
        slot_lines.append(f'  <!-- {desc} -->')
        slot_lines.append(f'  <g id="dspg-{sid}-slot-{slot_key}"></g>')
    slots_block = "\n".join(slot_lines)

    comment = (
        f"\n  <!-- DSPG: move paths from dspg-{sid}-traced into slot-* groups (Inkscape Objects panel) -->\n"
    )
    traced_open = (
        f"{comment}  <g id=\"dspg-{sid}-traced\">\n"
    )

    m = re.search(r"<g\s+transform\s*=", svg)
    if not m:
        print("Could not find potrace <g transform=…> group.", file=sys.stderr)
        sys.exit(1)
    i = m.start()
    inner = (
        f'<g id="{root_id}">\n'
        f"{slots_block}\n"
        f"{traced_open}"
    )
    svg = svg[:i] + inner + svg[i:]

    # … </g> (potrace) </svg>  →  add closes for dspg-traced and dspg-root
    svg2 = re.sub(r"</g>\s*</svg>\s*$", "</g>\n  </g>\n</g>\n</svg>\n", svg, count=1)
    if svg2 == svg:
        print("Could not find closing </g></svg> tail to extend.", file=sys.stderr)
        sys.exit(1)
    svg = svg2

    with open(args.output_svg, "w", encoding="utf-8") as f:
        f.write(svg)

    print(f"Wrote {args.output_svg}")
    print(f"  Root id: {root_id} — empty slot-* groups are ready for your partitions.")


if __name__ == "__main__":
    main()
