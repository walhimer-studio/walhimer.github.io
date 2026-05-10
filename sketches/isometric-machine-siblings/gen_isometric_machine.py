#!/usr/bin/env python3
"""
Procedural SVG siblings in a flat-shaded isometric / machine-cluster style.
Palette: pink / orange / greys, black strokes, medium-grey ground (not a trace of any specific artwork).
"""

from __future__ import annotations

import argparse
import math
import random
from dataclasses import dataclass
from typing import Iterable, List, Sequence, Tuple

Vec3 = Tuple[float, float, float]


# --- isometric projection (camera toward origin from (+++)); Z is up ---
def iso_project(x: float, y: float, z: float) -> Tuple[float, float]:
    sx = (x - y) * (math.sqrt(3) / 2)
    sy = (x + y) * 0.5 - z
    return sx, sy


VIEW = math.sqrt(3) / 3, math.sqrt(3) / 3, math.sqrt(3) / 3


def dot3(a: Vec3, b: Vec3) -> float:
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def cuboid_faces(
    ox: float, oy: float, oz: float, dx: float, dy: float, dz: float
) -> List[Tuple[Sequence[Vec3], Vec3]]:
    """Six faces as (quad vertices CCW when seen from outside, outward normal)."""
    x1, x2 = ox, ox + dx
    y1, y2 = oy, oy + dy
    z1, z2 = oz, oz + dz
    faces: List[Tuple[Sequence[Vec3], Vec3]] = [
        # +Z top
        (((x1, y1, z2), (x2, y1, z2), (x2, y2, z2), (x1, y2, z2)), (0, 0, 1)),
        # -Z bottom (usually hidden)
        (((x1, y1, z1), (x1, y2, z1), (x2, y2, z1), (x2, y1, z1)), (0, 0, -1)),
        # +X
        (((x2, y1, z1), (x2, y2, z1), (x2, y2, z2), (x2, y1, z2)), (1, 0, 0)),
        # -X
        (((x1, y1, z1), (x1, y1, z2), (x1, y2, z2), (x1, y2, z1)), (-1, 0, 0)),
        # +Y
        (((x1, y2, z1), (x1, y2, z2), (x2, y2, z2), (x2, y2, z1)), (0, 1, 0)),
        # -Y
        (((x1, y1, z1), (x2, y1, z1), (x2, y1, z2), (x1, y1, z2)), (0, -1, 0)),
    ]
    return faces


def face_visible(normal: Vec3) -> bool:
    return dot3(normal, VIEW) > 1e-6


def face_depth(corners: Sequence[Vec3]) -> float:
    return sum(x + y + z for x, y, z in corners) / len(corners)


@dataclass
class FaceDraw:
    depth: float
    points: List[Tuple[float, float]]
    fill: str


def poly_path(points: Sequence[Tuple[float, float]]) -> str:
    if not points:
        return ""
    head = points[0]
    rest = " ".join(f"L {px:.3f},{py:.3f}" for px, py in points[1:])
    return f"M {head[0]:.3f},{head[1]:.3f} {rest} Z"


RNG_COLORS_PINK = ("#eb4f9f", "#e93d8f", "#d62878")
RNG_COLORS_GREY = ("#5c5c5c", "#6a6a6a", "#4a4a4a")
ORANGE = "#ff7a2e"


def pick_fill(rng: random.Random, *, accent_orange: bool, face_normal: Vec3) -> str:
    if accent_orange and rng.random() < 0.55:
        return ORANGE
    # Slight tonal separation by dominant axis of normal
    nz = abs(face_normal[2])
    if nz > 0.85:
        return rng.choice(("#f062b8", "#ea4caf", "#fce4ec"))
    if rng.random() < 0.28:
        return rng.choice(RNG_COLORS_GREY)
    return rng.choice(RNG_COLORS_PINK)


def emit_cuboid(
    rng: random.Random,
    ox: float,
    oy: float,
    oz: float,
    dx: float,
    dy: float,
    dz: float,
    *,
    accent_orange: bool,
    tx: float,
    ty: float,
    scale: float,
    bucket: List[FaceDraw],
) -> None:
    for corners, normal in cuboid_faces(ox, oy, oz, dx, dy, dz):
        if not face_visible(normal):
            continue
        depth = face_depth(corners)
        pts: List[Tuple[float, float]] = []
        for x, y, z in corners:
            px, py = iso_project(x, y, z)
            pts.append((px * scale + tx, py * scale + ty))
        fill = pick_fill(rng, accent_orange=accent_orange, face_normal=normal)
        bucket.append(FaceDraw(depth=depth, points=pts, fill=fill))


def cluster_boxes(
    rng: random.Random,
    cx: float,
    cy: float,
    z0: float,
    n: int,
    spread: float,
    z_spread: float,
    *,
    accent_orange: float,
    scale: float,
    tx: float,
    ty: float,
    bucket: List[FaceDraw],
) -> None:
    for _ in range(n):
        bx = cx + rng.uniform(-spread, spread)
        by = cy + rng.uniform(-spread, spread)
        bz = z0 + rng.uniform(0, z_spread)
        dx = rng.uniform(2.8, 9.5)
        dy = rng.uniform(2.8, 9.5)
        dz = rng.uniform(2.8, 11.5)
        use_orange = rng.random() < accent_orange
        emit_cuboid(
            rng, bx, by, bz, dx, dy, dz, accent_orange=use_orange, tx=tx, ty=ty, scale=scale, bucket=bucket
        )


def connector_beams(
    rng: random.Random,
    p1: Vec3,
    p2: Vec3,
    thickness: float,
    *,
    scale: float,
    tx: float,
    ty: float,
    bucket: List[FaceDraw],
    accent_orange: bool,
) -> None:
    """Chain of small cuboids along p1→p2 (loose wiring / struts)."""
    x1, y1, z1 = p1
    x2, y2, z2 = p2
    span = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2)
    steps = max(5, min(24, int(span / 2.8) + 3))
    for s in range(steps):
        t0 = s / steps
        t1 = (s + 1) / steps
        xa, ya, za = (
            x1 + (x2 - x1) * t0,
            y1 + (y2 - y1) * t0,
            z1 + (z2 - z1) * t0,
        )
        xb, yb, zb = (
            x1 + (x2 - x1) * t1,
            y1 + (y2 - y1) * t1,
            z1 + (z2 - z1) * t1,
        )
        ox = min(xa, xb)
        oy = min(ya, yb)
        oz = min(za, zb)
        emit_cuboid(
            rng,
            ox - thickness * 0.12,
            oy - thickness * 0.12,
            oz - thickness * 0.12,
            abs(xa - xb) + thickness,
            abs(ya - yb) + thickness,
            abs(za - zb) + thickness * 1.15,
            accent_orange=accent_orange,
            tx=tx,
            ty=ty,
            scale=scale,
            bucket=bucket,
        )


def bubble_stack(
    rng: random.Random,
    cx: float,
    cy: float,
    cz: float,
    r: float,
    *,
    scale: float,
    tx: float,
    ty: float,
    bucket: List[FaceDraw],
) -> None:
    """Layered slabs suggesting a spherical housing (orange / pink)."""
    layers = rng.randint(4, 7)
    for i in range(layers):
        u = (i + 0.5) / layers * 2.0 - 1.0
        zslab = cz + u * r * 0.75
        rw = max(1.8, r * math.sqrt(max(0.03, 1.0 - u * u)) * rng.uniform(0.85, 1.08))
        th = max(1.6, r * 0.32)
        accent = rng.random() < 0.55
        emit_cuboid(
            rng,
            cx - rw * 0.5,
            cy - rw * 0.48,
            zslab - th * 0.5,
            rw,
            rw * rng.uniform(0.88, 1.06),
            th,
            accent_orange=accent,
            tx=tx,
            ty=ty,
            scale=scale,
            bucket=bucket,
        )


def minmax_xy(projected: Iterable[Tuple[float, float]]) -> Tuple[float, float, float, float]:
    pts = list(projected)
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return min(xs), max(xs), min(ys), max(ys)


def build_scene(seed: int) -> Tuple[List[FaceDraw], Tuple[float, float, float, float]]:
    rng = random.Random(seed)
    bucket: List[FaceDraw] = []

    # Base platforms (two clusters)
    emit_cuboid(rng, 12, 10, 0, 38, 32, 3.2, accent_orange=False, tx=0, ty=0, scale=10, bucket=bucket)
    emit_cuboid(rng, 58, 36, 0, 34, 28, 3.5, accent_orange=rng.random() < 0.25, tx=0, ty=0, scale=10, bucket=bucket)

    cluster_boxes(
        rng, 18, 18, 3.2, 85, 22, 14, accent_orange=0.12, scale=10, tx=0, ty=0, bucket=bucket
    )
    cluster_boxes(
        rng, 72, 48, 3.5, 70, 16, 12, accent_orange=0.22, scale=10, tx=0, ty=0, bucket=bucket
    )

    # Tall spindles in upper cluster
    for _ in range(28):
        bx = rng.uniform(14, 48)
        by = rng.uniform(12, 38)
        h = rng.uniform(18, 52)
        w = rng.uniform(0.6, 1.4)
        emit_cuboid(
            rng, bx, by, 3.2, w, w, h, accent_orange=False, tx=0, ty=0, scale=10, bucket=bucket
        )

    # Big orange-accent block(s)
    if rng.random() < 0.85:
        emit_cuboid(
            rng,
            78 + rng.uniform(0, 4),
            44 + rng.uniform(0, 4),
            3.5,
            10 + rng.uniform(0, 4),
            10 + rng.uniform(0, 3),
            14 + rng.uniform(0, 8),
            accent_orange=True,
            tx=0,
            ty=0,
            scale=10,
            bucket=bucket,
        )

    # Rounded masses (layered slabs)
    for _ in range(rng.randint(2, 5)):
        bubble_stack(
            rng,
            rng.uniform(20, 88),
            rng.uniform(15, 60),
            rng.uniform(20, 45),
            rng.uniform(3.5, 8.5),
            scale=10,
            tx=0,
            ty=0,
            bucket=bucket,
        )

    # Loose connectors between clusters
    for _ in range(rng.randint(4, 9)):
        p1 = (rng.uniform(40, 52), rng.uniform(24, 36), rng.uniform(8, 40))
        p2 = (rng.uniform(62, 76), rng.uniform(42, 52), rng.uniform(6, 28))
        connector_beams(rng, p1, p2, 1.0, scale=10, tx=0, ty=0, bucket=bucket, accent_orange=False)

    # Depth sort (painter)
    bucket.sort(key=lambda f: f.depth)

    # Bounds in projected space
    all_pts: List[Tuple[float, float]] = []
    for f in bucket:
        all_pts.extend(f.points)
    if not all_pts:
        return bucket, (0, 1000, 0, 1000)
    mm = minmax_xy(all_pts)
    pad = 40.0
    return bucket, (mm[0] - pad, mm[1] + pad, mm[2] - pad, mm[3] + pad)


def to_svg(faces: List[FaceDraw], bounds: Tuple[float, float, float, float]) -> str:
    minx, maxx, miny, maxy = bounds
    w = maxx - minx
    h = maxy - miny
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.2f}" height="{h:.2f}" '
        f'viewBox="{minx:.3f} {miny:.3f} {w:.3f} {h:.3f}">',
        f'<rect x="{minx:.3f}" y="{miny:.3f}" width="{w:.3f}" height="{h:.3f}" fill="#949494"/>',
        '<g stroke="#000000" stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round">',
    ]
    for f in faces:
        parts.append(f'<path d="{poly_path(f.points)}" fill="{f.fill}"/>')
    parts.append("</g>")
    parts.append("</svg>")
    return "\n".join(parts)


def main() -> None:
    ap = argparse.ArgumentParser(description="Generate isometric machine-cluster SVG sibling.")
    ap.add_argument("--seed", type=int, default=None, help="Random seed (default: random)")
    ap.add_argument(
        "-o",
        "--output",
        default="isometric-machine-sibling.svg",
        help="Output .svg path",
    )
    args = ap.parse_args()
    seed = args.seed if args.seed is not None else random.randint(0, 2**31 - 1)
    faces, bounds = build_scene(seed)
    svg = '<?xml version="1.0" encoding="UTF-8"?>\n'
    svg += f"<!-- seed={seed} procedural sibling; not a trace of commissioned work -->\n"
    svg += to_svg(faces, bounds)
    with open(args.output, "w", encoding="utf-8") as fp:
        fp.write(svg)
    print(args.output, "seed=", seed, "faces=", len(faces))


if __name__ == "__main__":
    main()
