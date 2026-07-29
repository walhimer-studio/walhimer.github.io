#!/usr/bin/env python3
"""Remove study cutout fringe and composite face PNGs on black."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageFilter

# Study page background + common cutout fringe
BG_RGB = (248, 247, 245)
BLACK = (0, 0, 0)


def is_background(r: int, g: int, b: int) -> float:
    """Return 0..1 how much this pixel looks like keyed background."""
    dr = abs(r - BG_RGB[0])
    dg = abs(g - BG_RGB[1])
    db = abs(b - BG_RGB[2])
    dist = (dr * dr + dg * dg + db * db) ** 0.5
    if dist < 18:
        return 1.0
    if dist < 42:
        return (42 - dist) / 24.0
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    if lum > 230 and max(r, g, b) - min(r, g, b) < 28:
        return max(0.0, min(1.0, (lum - 220) / 35.0))
    return 0.0


def clean_cutout(path: Path, feather: float = 1.4) -> None:
    im = Image.open(path).convert("RGBA")
    px = im.load()
    w, h = im.size
    alpha = Image.new("L", (w, h), 0)
    apx = alpha.load()

    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            bg = is_background(r, g, b)
            apx[x, y] = int(255 * (1.0 - bg))

    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=feather))
    im.putalpha(alpha)

    out = Image.new("RGBA", (w, h), BLACK + (255,))
    out = Image.alpha_composite(out, im).convert("RGB")
    out.save(path, optimize=True)
    print(f"cleaned {path.name} ({w}x{h})")


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("Usage: clean_face_cutouts.py <file-or-dir> [...]")
        return 1
    for arg in argv[1:]:
        p = Path(arg)
        if p.is_dir():
            for png in sorted(p.glob("*.png")):
                clean_cutout(png)
        elif p.suffix.lower() == ".png":
            clean_cutout(p)
        else:
            print(f"skip {p}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
