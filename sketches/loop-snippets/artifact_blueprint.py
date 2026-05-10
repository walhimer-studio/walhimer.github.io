#!/usr/bin/env python3
"""
Seed-based blueprint wireframe generator — matches “artifact” look:
  • Background ~#6C94D1 (reference), crisp white linework, tiered stroke weights
  • Isometric axonometric (no perspective)
  • Every edge drawn (no hidden-line removal) — dense transparent-machine read
  • Render pipeline: frozen layout → passes (structure → housing detail → right cluster →
    reel → arcs → top → conduit → regional clutter → jumper). Per-pass RNG substreams;
    RegionBudget scales interiors / lens texture / clutter distribution.
  • This script emits real stroke geometry (fill=none). For raster tracing limits see COMPONENTS.md.

Dependencies:
  pip install svgwrite
Optional PNG (needs a Cairo-capable rasterizer on macOS):
  pip install cairosvg && brew install cairo
  Python.org builds often need Homebrew’s lib on DYLD_FALLBACK_LIBRARY_PATH — this script
  prepends $(brew --prefix cairo)/lib automatically when libcairo.2.dylib is found there.
  — or —  brew install librsvg   (rsvg-convert fallback; no libcairo in Python process)

Usage:
  python artifact_blueprint.py 1001 --style reference    # procedural PNG/SVG (approximate family)
  python artifact_blueprint.py 1001 --pixel-match-reference  # exact pixels: copies pinned PNG
  python artifact_blueprint.py 1001 --glow               # optional soft bloom (off by default)
  python artifact_blueprint.py 1001 --svg-only

Open artifact_blueprint_<seed>.png — NOT ghost_machine_*.svg (those are black strokes on white).

Pixel-identical “reference” artwork requires the bundled PNG (see reference/artifact_blueprint_target.png)
or --reference-png; procedural output cannot match a specific authored image by tuning alone.
"""

from __future__ import annotations

import argparse
import hashlib
import math
import os
import random
import shutil
import subprocess
import sys
from dataclasses import dataclass
from typing import Optional

import svgwrite

# ── Blueprint palette (reference artifact — cooler medium blue, pure white) ─
REFERENCE_BG = "#6B92D6"  # cornflower / cyanotype-adjacent (attachment sample)
BP_BG = REFERENCE_BG

_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PIXEL_MATCH_REFERENCE_FILE = os.path.join(_SCRIPT_DIR, "reference", "artifact_blueprint_target.png")
BP_FG = "#FFFFFF"
BP_FG_SOFT = "#B9CEEE"  # pipe inner read on BP_BG (still light; reads as hollow tube)

GLOW_FILTER_ID = "artifactGlow"

# ── Canvas & isometric (aligned with ghost_1001.py / ghost_dense.py) ─────────
W = H = 1000
SCALE = 76
OX, OY = 468, 642
# Line tiers — reference: fine schematic strokes; outlines slightly heavier only.
SW = 0.88
SW_MAIN = SW * 1.28  # outer structural boxes / dominant rings
SW_MED = SW * 0.92
SW_FINE = SW * 0.52
SW_HAIR = SW * 0.30

_C30 = math.cos(math.radians(30))
_S30 = 0.5


def _subrng(seed: int, *parts: str) -> random.Random:
    """Deterministic RNG stream for a render pass (labelled substreams don't steal each other's draws)."""
    key = "|".join(["artifact_blueprint", str(seed)] + [str(p) for p in parts])
    h = hashlib.sha256(key.encode()).digest()
    return random.Random(int.from_bytes(h[:8], "big"))


@dataclass(frozen=True)
class RegionBudget:
    """
    Relative complexity budgets by compositional region (multiplies loop counts / weights).
    Tune these instead of growing one global density knob.
    """

    base_detail: float = 1.0
    housing_internals: float = 1.0
    lens_texture: float = 1.0
    drum: float = 1.0
    reel: float = 1.0
    clutter: float = 1.0


def _region_budget_for_style(style: str) -> RegionBudget:
    if style == "reference":
        return RegionBudget(
            base_detail=1.08,
            housing_internals=1.38,
            lens_texture=1.22,
            drum=1.05,
            reel=1.06,
            clutter=1.28,
        )
    return RegionBudget()


@dataclass
class MachineLayout:
    """Frozen layout parameters for one seed (world units). Built once; passes only draw."""

    jx: float
    jz: float
    bx: float
    bz: float
    bw: float
    bd: float
    bh_floor: float
    rc_base: float
    tier_inset: float
    bx2: float
    bz2: float
    bh2: float
    bw2: float
    bd2: float
    hx0: float
    hz0: float
    hbw: float
    hbh: float
    hbd: float
    hy: float
    shelf_y: float
    div_x: float
    zf: float
    n_extra_shelves: int
    extra_shelf_ys: list[float]
    n_scan_l: int
    n_scan_r: int
    port_r1: float
    port_r2: float
    port_r3: float
    rx: float
    RX: float
    RY: float
    RZ: float
    rr: float
    teeth: int
    gth: float
    n_conc: int
    n_rad_ticks: int
    n_lens_scribbles: int
    n_spoke: int
    DX: float
    DY: float
    DZ: float
    dr: float
    ribs_big: int
    n_conc_drum: int
    lx: float
    ly: float
    lz: float
    lr: float
    bx_arm: float
    mast_x: float
    mast_z: float
    mast_h: float
    bracket_box: tuple[float, float, float, float, float, float]


def _darwin_find_cairo_lib_dir() -> Optional[str]:
    """Directory containing libcairo.2.dylib (Homebrew Apple Silicon / Intel)."""
    if sys.platform != "darwin":
        return None
    # Prefer fixed paths first — works when `brew` is not on PATH (IDE terminals).
    candidates = ["/opt/homebrew/lib", "/usr/local/lib"]
    try:
        r = subprocess.run(
            ["brew", "--prefix", "cairo"],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        if r.returncode == 0:
            brew_lib = os.path.join(r.stdout.strip(), "lib")
            if brew_lib not in candidates:
                candidates.insert(0, brew_lib)
    except FileNotFoundError:
        pass
    for libdir in candidates:
        dy = os.path.join(libdir, "libcairo.2.dylib")
        if os.path.isfile(dy):
            return libdir
    return None


def _darwin_preload_cairo(libdir: str) -> bool:
    """
    Load libcairo by absolute path before cairocffi imports.
    DYLD_FALLBACK_LIBRARY_PATH is often ignored when set from inside a signed
    Python binary; CDLL preloads the dylib into the process so dlopen succeeds.
    """
    import ctypes

    dy = os.path.join(libdir, "libcairo.2.dylib")
    if not os.path.isfile(dy):
        return False
    try:
        global_now = getattr(ctypes, "RTLD_GLOBAL", 0) | getattr(ctypes, "RTLD_NOW", 0)
        if global_now:
            ctypes.CDLL(dy, mode=global_now)
        else:
            ctypes.CDLL(dy)
        return True
    except OSError:
        return False


def _darwin_prepend_dyld_fallback(libdir: str) -> None:
    """Let cairocffi dlopen libcairo when Python was not linked with Homebrew rpaths."""
    cur = os.environ.get("DYLD_FALLBACK_LIBRARY_PATH", "")
    parts = [p for p in cur.split(":") if p]
    if libdir not in parts:
        parts.insert(0, libdir)
    os.environ["DYLD_FALLBACK_LIBRARY_PATH"] = ":".join(parts)


def iso(x: float, y: float, z: float) -> tuple[float, float]:
    return (
        OX + (x - z) * SCALE * _C30,
        OY - y * SCALE + (x + z) * SCALE * _S30,
    )


def circle_pts(cx: float, cy: float, cz: float, r: float, plane: str = "xz", n: int = 48):
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        if plane == "xz":
            pts.append((cx + r * math.cos(a), cy, cz + r * math.sin(a)))
        elif plane == "xy":
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a), cz))
        else:  # yz
            pts.append((cx, cy + r * math.sin(a), cz + r * math.cos(a)))
    return pts


class Blueprint:
    def __init__(
        self,
        seed: int,
        glow: bool = False,
        glow_blur: float = 1.0,
        bg_color: Optional[str] = None,
        density: float = 1.0,
        sketch_px: float = 0.0,
        style: str = "reference",
        region_budget: Optional[RegionBudget] = None,
    ):
        self.seed = seed
        self.rng = random.Random(seed)
        self.style = style
        self.region_budget = region_budget or _region_budget_for_style(style)
        self.bg_color = bg_color or BP_BG
        self.density = max(0.5, density)
        self.sketch_px = max(0.0, sketch_px)
        self.fname = f"artifact_blueprint_{seed}.svg"
        self.dwg = svgwrite.Drawing(self.fname, size=(W, H), profile="full")
        self.dwg.viewbox(0, 0, W, H)
        if glow:
            self._add_line_glow_filter(glow_blur)
        self.dwg.add(self.dwg.rect((0, 0), (W, H), fill=self.bg_color))
        self.g = self.dwg.add(self.dwg.g(id="machine"))
        if glow:
            self.g["filter"] = f"url(#{GLOW_FILTER_ID})"

    def _proj(self, x: float, y: float, z: float) -> tuple[float, float]:
        """Screen projection; optional tiny jitter for hand-drawn generative feel."""
        px, py = iso(x, y, z)
        j = self.sketch_px
        if j <= 0:
            return px, py
        h = hashlib.md5(f"{self.seed}|{x:.7f}|{y:.7f}|{z:.7f}".encode()).digest()
        ux = int.from_bytes(h[0:4], "big") / (2**32)
        uy = int.from_bytes(h[4:8], "big") / (2**32)
        return px + (ux * 2 - 1) * j, py + (uy * 2 - 1) * j

    def _add_line_glow_filter(self, std_dev: float) -> None:
        """Soft white halo (Gaussian blur under crisp strokes). Background rect is unfiltered."""
        flt = self.dwg.defs.add(
            self.dwg.filter(
                id=GLOW_FILTER_ID,
                start=("-55%", "-55%"),
                size=("210%", "210%"),
            )
        )
        flt.feGaussianBlur(
            in_="SourceGraphic",
            stdDeviation=str(std_dev),
            result="blur",
        )
        flt.feMerge(["blur", "SourceGraphic"])

    def seg(self, a3, b3, w: float = SW, dash=None):
        kw = dict(stroke=BP_FG, stroke_width=w, fill="none", stroke_linecap="round")
        if dash:
            kw["stroke_dasharray"] = dash
        self.g.add(self.dwg.line(self._proj(*a3), self._proj(*b3), **kw))

    def spoly(self, pts3, w: float = SW, dash=None, close: bool = True):
        pts2 = [self._proj(*p) for p in pts3]
        kw = dict(fill="none", stroke=BP_FG, stroke_width=w, stroke_linejoin="round")
        if dash:
            kw["stroke_dasharray"] = dash
        el = self.dwg.polygon(pts2, **kw) if close else self.dwg.polyline(pts2, **kw)
        self.g.add(el)

    def disk(self, cx, cy, cz, r, plane="xz", n=48, w=SW):
        self.spoly(circle_pts(cx, cy, cz, r, plane, n), w)

    def box_all_edges(self, x, y, z, bw, bh, bd, w=SW):
        """12 edges — nothing culled (blueprint / X-ray)."""
        c = [
            (x, y, z),
            (x + bw, y, z),
            (x + bw, y, z + bd),
            (x, y, z + bd),
            (x, y + bh, z),
            (x + bw, y + bh, z),
            (x + bw, y + bh, z + bd),
            (x, y + bh, z + bd),
        ]
        edges = [
            (0, 1),
            (1, 2),
            (2, 3),
            (3, 0),
            (4, 5),
            (5, 6),
            (6, 7),
            (7, 4),
            (0, 4),
            (1, 5),
            (2, 6),
            (3, 7),
        ]
        for a, b in edges:
            self.seg(c[a], c[b], w)

    def cyl_skeleton(self, cx, cy, cz, r, h, n=40, w=SW, ribs=0):
        bot = circle_pts(cx, cy, cz, r, "xz", n)
        top = circle_pts(cx, cy + h, cz, r, "xz", n)
        bsc = [iso(*p) for p in bot]
        li = min(range(n), key=lambda i: bsc[i][0])
        ri = max(range(n), key=lambda i: bsc[i][0])
        self.spoly(bot, w)
        self.spoly(top, w)
        self.seg(bot[li], top[li], w)
        self.seg(bot[ri], top[ri], w)
        if ribs:
            step = max(1, n // ribs)
            for i in range(0, n, step):
                self.seg(bot[i], top[i], w * 0.35, "2,8")

    def gear_ring(self, cx, cy, cz, r_out, r_in, teeth: int, th: float, w=SW):
        for yy in (cy, cy + th):
            self.spoly(circle_pts(cx, yy, cz, r_out, "xz", 64), w)
            self.spoly(circle_pts(cx, yy, cz, r_in, "xz", 64), w * 0.65)
        bot_o = circle_pts(cx, cy, cz, r_out, "xz", 64)
        top_o = circle_pts(cx, cy + th, cz, r_out, "xz", 64)
        bsc = [iso(*p) for p in bot_o]
        li = min(range(64), key=lambda i: bsc[i][0])
        ri = max(range(64), key=lambda i: bsc[i][0])
        self.seg(bot_o[li], top_o[li], w)
        self.seg(bot_o[ri], top_o[ri], w)
        bot_i = circle_pts(cx, cy, cz, r_in, "xz", 64)
        top_i = circle_pts(cx, cy + th, cz, r_in, "xz", 64)
        self.seg(bot_i[li], top_i[li], w * 0.65)
        self.seg(bot_i[ri], top_i[ri], w * 0.65)
        th_r = r_out * 0.085
        for i in range(teeth):
            a1 = 2 * math.pi * (i - 0.4) / teeth
            a2 = 2 * math.pi * (i + 0.4) / teeth

            def tp(a, rr, yv):
                return (cx + rr * math.cos(a), yv, cz + rr * math.sin(a))

            self.spoly(
                [
                    tp(a1, r_out, cy + th),
                    tp(a2, r_out, cy + th),
                    tp(a2, r_out + th_r, cy + th),
                    tp(a1, r_out + th_r, cy + th),
                ],
                w * 0.55,
            )
            self.seg(tp(a1, r_out + th_r, cy), tp(a1, r_out + th_r, cy + th), w * 0.45)

    def pipe(self, a3, b3, r=0.065, w=None):
        pw = max(2.4, r * SCALE * 2)
        if w is not None:
            pw = max(pw, w)
        a2, b2 = self._proj(*a3), self._proj(*b3)
        self.g.add(
            self.dwg.line(
                a2,
                b2,
                stroke=BP_FG,
                stroke_width=pw,
                fill="none",
                stroke_linecap="round",
            )
        )
        self.g.add(
            self.dwg.line(
                a2,
                b2,
                stroke=BP_FG_SOFT,
                stroke_width=pw * 0.42,
                fill="none",
                stroke_linecap="round",
            )
        )

    def spokes_xz(self, cx, cy, cz, r, nsp: int, w=SW):
        for i in range(nsp):
            a = math.pi * i / nsp
            self.seg(
                (cx + r * math.cos(a), cy, cz + r * math.sin(a)),
                (cx - r * math.cos(a), cy, cz - r * math.sin(a)),
                w * 0.45,
                "2,6",
            )

    def rounded_plate_footprint(self, x, y, z, bw, bd, rc, w, n_corner=12):
        """Rounded-rectangle outline in xz at height y (reference base plate corners)."""
        x0, x1 = x, x + bw
        z0, z1 = z, z + bd
        rmax = min(bw, bd) * 0.5 - 1e-6
        rc = max(0.0, min(rc, rmax))
        if rc <= 1e-6:
            c = [(x, y, z), (x + bw, y, z), (x + bw, y, z + bd), (x, y, z + bd)]
            for i in range(4):
                self.seg(c[i], c[(i + 1) % 4], w)
            return

        def arc(cx: float, cz: float, a0: float, a1: float):
            out = []
            for i in range(n_corner):
                t = i / max(1, n_corner - 1)
                a = a0 + (a1 - a0) * t
                out.append((cx + rc * math.cos(a), y, cz + rc * math.sin(a)))
            return out

        pts = []
        # Walk CCW on outer boundary (viewed from +y): bottom → right → top → left
        pts.append((x0 + rc, y, z0))
        pts.append((x1 - rc, y, z0))
        pts.extend(arc(x1 - rc, z0 + rc, -math.pi / 2, 0)[1:])
        pts.append((x1, y, z0 + rc))
        pts.append((x1, y, z1 - rc))
        pts.extend(arc(x1 - rc, z1 - rc, 0, math.pi / 2)[1:])
        pts.append((x1 - rc, y, z1))
        pts.append((x0 + rc, y, z1))
        pts.extend(arc(x0 + rc, z1 - rc, math.pi / 2, math.pi)[1:])
        pts.append((x0, y, z1 - rc))
        pts.append((x0, y, z0 + rc))
        pts.extend(arc(x0 + rc, z0 + rc, math.pi, 3 * math.pi / 2)[1:])
        self.spoly(pts, w, close=True)

    def concentric_disks_xz(self, cx, cy, cz, r_max, n_rings, w):
        for i in range(1, n_rings + 1):
            rr = r_max * (i / (n_rings + 1))
            self.disk(cx, cy, cz, rr, "xz", n=56, w=w)

    def radial_ticks_xy(self, cx, cy, cz, r_inner, r_outer, n_ticks, w):
        for i in range(n_ticks):
            a = 2 * math.pi * i / n_ticks
            self.seg(
                (cx + r_inner * math.cos(a), cy + r_inner * math.sin(a), cz),
                (cx + r_outer * math.cos(a), cy + r_outer * math.sin(a), cz),
                w,
            )

    def lens_face_scribbles(
        self,
        cx: float,
        cy: float,
        cz: float,
        r_max: float,
        n_strokes: int,
        w,
        rng: random.Random,
    ):
        """Illegible faux handwriting / ticks inside lens circle (reference attachment)."""
        rlim = r_max * 0.9
        for _ in range(n_strokes):
            npts = rng.randint(5, 14)
            a0 = rng.uniform(0, 2 * math.pi)
            pts = []
            rad = rng.uniform(0.08, 0.38) * r_max
            px, py = cx + rad * math.cos(a0), cy + rad * math.sin(a0)
            pts.append((px, py, cz))
            for _k in range(npts - 1):
                a0 += rng.uniform(-0.95, 0.95)
                rad *= rng.uniform(0.8, 1.06)
                rad = min(rad, rlim)
                px = cx + rad * math.cos(a0)
                py = cy + rad * math.sin(a0)
                d = math.hypot(px - cx, py - cy)
                if d > rlim:
                    s = rlim / max(d, 1e-6)
                    px = cx + (px - cx) * s
                    py = cy + (py - cy) * s
                pts.append((px, py, cz))
            self.spoly(pts, w, close=False)

    def grid_face_xy(self, x0, x1, y0, y1, z, nx, ny, w, dash="2,6"):
        """Light grid on a face in the xy plane at fixed z (e.g. housing front)."""
        if nx > 1:
            for i in range(1, nx):
                t = i / nx
                xx = x0 + (x1 - x0) * t
                self.seg((xx, y0, z), (xx, y1, z), w, dash)
        if ny > 1:
            for j in range(1, ny):
                t = j / ny
                yy = y0 + (y1 - y0) * t
                self.seg((x0, yy, z), (x1, yy, z), w, dash)

    @staticmethod
    def _j(L: MachineLayout, x: float, y: float, z: float) -> tuple[float, float, float]:
        return (x + L.jx, y, z + L.jz)

    def _build_layout(self) -> MachineLayout:
        """Single place for seed-derived dimensions (world units)."""
        rng = _subrng(self.seed, "layout")
        dc = self.density

        jx = rng.uniform(-0.12, 0.12)
        jz = rng.uniform(-0.12, 0.12)

        bx = -2.85 + rng.uniform(-0.18, 0.18)
        bz = -1.88 + rng.uniform(-0.12, 0.12)
        bw = 5.75 + rng.uniform(-0.15, 0.28)
        bd = 3.85 + rng.uniform(-0.12, 0.22)
        bh_floor = 0.26 + rng.uniform(-0.02, 0.06)
        rc_base = min(bw, bd) * rng.uniform(0.09, 0.14)

        tier_inset = 0.36 + rng.uniform(-0.04, 0.05)
        bx2 = bx + tier_inset + rng.uniform(-0.05, 0.05)
        bz2 = bz + tier_inset
        bh2 = 0.11 + rng.uniform(-0.015, 0.028)
        bw2 = bw - 2 * tier_inset + rng.uniform(-0.12, 0.12)
        bd2 = bd - 2 * tier_inset + rng.uniform(-0.12, 0.12)

        hx0 = -2.22 + rng.uniform(-0.1, 0.1)
        hz0 = -1.12 + rng.uniform(-0.06, 0.06)
        hbw = 2.72 + rng.uniform(-0.12, 0.16)
        hbh = 2.32 + rng.uniform(-0.08, 0.18)
        hbd = 2.32 + rng.uniform(-0.08, 0.16)
        hy = bh_floor + 0.13 + rng.uniform(-0.02, 0.04)

        shelf_y = hy + hbh * rng.uniform(0.42, 0.52)
        div_x = hx0 + hbw * rng.uniform(0.38, 0.48)
        zf = hz0 + 0.02

        n_extra_shelves = rng.randint(2, 4)
        extra_shelf_ys = [hy + hbh * rng.uniform(0.18, 0.88) for _ in range(n_extra_shelves)]

        rb = self.region_budget
        hi_w = rb.housing_internals
        lo_l, hi_l = int(8 * dc * hi_w), int(14 * dc * hi_w)
        if hi_l < lo_l:
            lo_l, hi_l = hi_l, lo_l
        n_scan_l = rng.randint(lo_l, max(lo_l, hi_l))
        lo_r, hi_r = int(6 * dc * hi_w), int(11 * dc * hi_w)
        if hi_r < lo_r:
            lo_r, hi_r = hi_r, lo_r
        n_scan_r = rng.randint(lo_r, max(lo_r, hi_r))

        port_r1 = 0.38 + rng.uniform(-0.04, 0.05)
        port_r2 = 0.22 + rng.uniform(-0.03, 0.03)
        port_r3 = 0.22 + rng.uniform(-0.03, 0.03)

        rx = hx0 + hbw - 0.05 + rng.uniform(-0.04, 0.08)
        bracket_bh = 1.72 + rng.uniform(-0.08, 0.12)
        bracket_box = (rx, hy, hz0 + 0.14, 0.92, bracket_bh, 1.52)

        RX = 1.72 + rng.uniform(-0.12, 0.16)
        RY = hy + hbh * rng.uniform(0.36, 0.46)
        RZ = rng.uniform(-0.12, 0.12)
        rr = 1.18 + rng.uniform(-0.1, 0.12)
        teeth = rng.choice([24, 26, 28, 30])
        gth = 0.19 + rng.uniform(-0.02, 0.03)
        n_conc = rng.randint(4, 7)
        n_rad_ticks = rng.randint(24, 40)
        n_lens_scribbles = max(
            4,
            int(rng.randint(18, 36) * rb.lens_texture),
        )
        n_spoke = rng.choice([6, 8, 10])

        DX = 1.98 + rng.uniform(-0.1, 0.12)
        DY = hy + 0.04
        DZ = 0.34 + rng.uniform(-0.1, 0.1)
        dr = 0.98 + rng.uniform(-0.06, 0.08)
        ribs_big = rng.randint(8, 14)
        n_conc_drum = rng.randint(5, 9)

        lx = hx0 - 0.02
        ly = hy + hbh * rng.uniform(0.34, 0.44)
        lz = hz0 + hbd * rng.uniform(0.52, 0.72)
        lr = 1.12 + rng.uniform(-0.05, 0.12)

        bx_arm = hx0 + hbw * 0.15
        mast_x = hx0 + hbw * 0.08 + rng.uniform(-0.06, 0.06)
        mast_z = hz0 + hbd * 0.78 + rng.uniform(-0.06, 0.06)
        mast_h = rng.uniform(0.55, 0.85)

        return MachineLayout(
            jx=jx,
            jz=jz,
            bx=bx,
            bz=bz,
            bw=bw,
            bd=bd,
            bh_floor=bh_floor,
            rc_base=rc_base,
            tier_inset=tier_inset,
            bx2=bx2,
            bz2=bz2,
            bh2=bh2,
            bw2=bw2,
            bd2=bd2,
            hx0=hx0,
            hz0=hz0,
            hbw=hbw,
            hbh=hbh,
            hbd=hbd,
            hy=hy,
            shelf_y=shelf_y,
            div_x=div_x,
            zf=zf,
            n_extra_shelves=n_extra_shelves,
            extra_shelf_ys=extra_shelf_ys,
            n_scan_l=n_scan_l,
            n_scan_r=n_scan_r,
            port_r1=port_r1,
            port_r2=port_r2,
            port_r3=port_r3,
            rx=rx,
            RX=RX,
            RY=RY,
            RZ=RZ,
            rr=rr,
            teeth=teeth,
            gth=gth,
            n_conc=n_conc,
            n_rad_ticks=n_rad_ticks,
            n_lens_scribbles=n_lens_scribbles,
            n_spoke=n_spoke,
            DX=DX,
            DY=DY,
            DZ=DZ,
            dr=dr,
            ribs_big=ribs_big,
            n_conc_drum=n_conc_drum,
            lx=lx,
            ly=ly,
            lz=lz,
            lr=lr,
            bx_arm=bx_arm,
            mast_x=mast_x,
            mast_z=mast_z,
            mast_h=mast_h,
            bracket_box=bracket_box,
        )

    def compose(self):
        """
        Multi-pass draw (deterministic):
          1) structure — footprint, housings, volumes
          2) housing detail — shelves, scanlines, grids, ports
          3) right cluster — lens gear + drum (texture budgets applied inside)
          4) left reel + arcs + top + conduit
          5) clutter — micro geometry split by regional weights (separate RNG stream)
          6) optional short jumper
        Sketch jitter still applies in projection (_proj) last.
        """
        L = self._build_layout()
        self._pass_structure(L)
        self._pass_housing_detail(L)
        self._pass_right_cluster(L)
        self._pass_left_reel(L)
        self._pass_arcs(L)
        self._pass_top_bridge(L)
        self._pass_conduit(L)
        self._pass_clutter(L)
        self._pass_jumper(L)

    def _pass_structure(self, L: MachineLayout) -> None:
        J = lambda x, y, z: self._j(L, x, y, z)
        bx, bz, bw, bd = L.bx, L.bz, L.bw, L.bd
        bh_floor, rc_base = L.bh_floor, L.rc_base
        self.box_all_edges(*J(bx, 0, bz), bw, bh_floor, bd, SW_MAIN)
        self.rounded_plate_footprint(J(bx, 0, bz)[0], bh_floor, J(bx, 0, bz)[2], bw, bd, rc_base, SW_MED)

        bx2, bz2, bh2, bw2, bd2 = L.bx2, L.bz2, L.bh2, L.bw2, L.bd2
        self.box_all_edges(*J(bx2, bh_floor, bz2), bw2, bh2, bd2, SW_MED)
        for tx, tz in [
            (bx2, bz2),
            (bx2 + bw2, bz2),
            (bx2 + bw2, bz2 + bd2),
            (bx2, bz2 + bd2),
        ]:
            self.seg(J(tx, bh_floor, tz), J(tx, bh_floor + bh2, tz), SW_FINE, "2,5")

        hx0, hz0, hbw, hbh, hbd, hy = L.hx0, L.hz0, L.hbw, L.hbh, L.hbd, L.hy
        self.box_all_edges(*J(hx0, hy, hz0), hbw, hbh, hbd, SW_MAIN)

        shelf_y = L.shelf_y
        for zz in (hz0, hz0 + hbd):
            self.seg(J(hx0, shelf_y, zz), J(hx0 + hbw * 0.72, shelf_y, zz), SW_FINE, "5,4")
        self.seg(J(hx0, shelf_y, hz0), J(hx0, shelf_y, hz0 + hbd), SW_FINE, "5,4")
        self.seg(
            J(hx0 + hbw * 0.72, shelf_y, hz0),
            J(hx0 + hbw * 0.72, shelf_y, hz0 + hbd),
            SW_FINE,
            "5,4",
        )

        div_x = L.div_x
        for zz in (hz0, hz0 + hbd):
            self.seg(J(div_x, hy, zz), J(div_x, hy + hbh, zz), SW_FINE, "3,5")
        self.seg(J(div_x, hy, hz0), J(div_x, hy, hz0 + hbd), SW_FINE, "3,5")
        self.seg(J(div_x, hy + hbh, hz0), J(div_x, hy + hbh, hz0 + hbd), SW_FINE, "3,5")

        rb_x, rb_y, rb_z, rb_bw, rb_bh, rb_bd = L.bracket_box
        self.box_all_edges(*J(rb_x, rb_y, rb_z), rb_bw, rb_bh, rb_bd, SW_MED)

        RX, RY, RZ, rr, teeth, gth = L.RX, L.RY, L.RZ, L.rr, L.teeth, L.gth
        self.gear_ring(RX, RY, RZ, rr, rr * 0.82, teeth, gth, w=SW_MED)

    def _pass_housing_detail(self, L: MachineLayout) -> None:
        J = lambda x, y, z: self._j(L, x, y, z)
        hx0, hz0, hbw, hbh, hbd, hy = L.hx0, L.hz0, L.hbw, L.hbh, L.hbd, L.hy
        div_x = L.div_x

        for sy in L.extra_shelf_ys:
            for zz in (hz0, hz0 + hbd):
                self.seg(J(hx0 + 0.06, sy, zz), J(div_x - 0.05, sy, zz), SW_HAIR, "4,5")

        rng_sl = _subrng(self.seed, "scan_l")
        for _ in range(L.n_scan_l):
            yy = hy + rng_sl.uniform(0.12, 0.92) * hbh
            self.seg(J(hx0 + 0.06, yy, hz0), J(div_x - 0.05, yy, hz0), SW_HAIR, "2,7")
        rng_r = _subrng(self.seed, "scan_r")
        for _ in range(L.n_scan_r):
            yy = hy + rng_r.uniform(0.12, 0.92) * hbh
            self.seg(J(div_x + 0.05, yy, hz0), J(hx0 + hbw - 0.06, yy, hz0), SW_HAIR, "2,7")

        self.grid_face_xy(
            hx0 + 0.07,
            div_x - 0.04,
            hy + 0.12,
            hy + hbh - 0.1,
            L.zf,
            5,
            6,
            SW_HAIR,
        )
        self.grid_face_xy(
            div_x + 0.05,
            hx0 + hbw - 0.07,
            hy + 0.12,
            hy + hbh - 0.1,
            L.zf,
            4,
            5,
            SW_HAIR,
        )

        self.disk(*J(hx0 + hbw * 0.28, hy + hbh * 0.38, hz0), L.port_r1, "xy", w=SW_MED)
        self.disk(*J(hx0 + hbw * 0.28, hy + hbh * 0.38, hz0), L.port_r2, "xy", w=SW_FINE)
        self.disk(*J(hx0 + hbw * 0.72, hy + hbh * 0.55, hz0), L.port_r3, "xy", w=SW_FINE)

    def _pass_right_cluster(self, L: MachineLayout) -> None:
        J = lambda x, y, z: self._j(L, x, y, z)
        RX, RY, RZ, rr, gth = L.RX, L.RY, L.RZ, L.rr, L.gth
        self.concentric_disks_xz(RX, RY + 0.02, RZ, rr * 0.76, L.n_conc, SW_HAIR)
        self.radial_ticks_xy(RX, RY + gth * 0.5, RZ, rr * 0.18, rr * 0.72, L.n_rad_ticks, SW_HAIR)

        rng_lens = _subrng(self.seed, "lens_scribbles")
        self.lens_face_scribbles(
            RX,
            RY + gth * 0.48,
            RZ,
            rr * 0.62,
            L.n_lens_scribbles,
            SW_HAIR,
            rng_lens,
        )

        rng_sp = _subrng(self.seed, "lens_spokes")
        for i in range(L.n_spoke):
            a = math.pi * i / L.n_spoke + rng_sp.uniform(0, 0.25)
            rs = rr * rng_sp.uniform(0.84, 0.94)
            self.seg(
                J(RX + rs * math.cos(a), RY + 0.07, RZ + rs * math.sin(a)),
                J(RX - rs * math.cos(a), RY + 0.07, RZ - rs * math.sin(a)),
                SW_FINE,
                "2,7",
            )
        self.cyl_skeleton(RX, RY - 0.02, RZ, 0.16, 0.26, ribs=0, w=SW_MED)

        DX, DY, DZ, dr = L.DX, L.DY, L.DZ, L.dr
        self.cyl_skeleton(DX, DY, DZ, dr, 0.76, ribs=L.ribs_big, w=SW_MED)
        self.cyl_skeleton(DX, DY, DZ, dr * 0.74, 0.58, ribs=0, w=SW_FINE)
        self.cyl_skeleton(DX, DY, DZ, dr * 0.36, 0.42, ribs=0, w=SW_FINE)
        self.disk(DX, DY + 0.36, DZ, dr, "xz", w=SW_HAIR)
        self.concentric_disks_xz(DX, DY + 0.02, DZ, dr * 0.92, L.n_conc_drum, SW_HAIR)

    def _pass_left_reel(self, L: MachineLayout) -> None:
        J = lambda x, y, z: self._j(L, x, y, z)
        lx, ly, lz, lr = L.lx, L.ly, L.lz, L.lr
        lxc, lyc, lzc = J(lx, ly, lz)
        self.disk(lxc, lyc, lzc, lr * 1.05, "yz", n=72, w=SW_HAIR)
        self.disk(lxc, lyc, lzc, lr, "yz", n=64, w=SW_MED)
        self.disk(lxc, lyc, lzc, lr * 0.92, "yz", n=56, w=SW_HAIR)
        self.disk(lxc, lyc, lzc, lr * 0.58, "yz", w=SW_FINE)
        self.disk(lxc, lyc, lzc, lr * 0.22, "yz", w=SW_HAIR)
        for i in range(8):
            a = math.pi * i / 8
            rs = lr * 0.52
            self.seg(
                J(lx, ly + rs * math.sin(a), lz + rs * math.cos(a)),
                J(lx, ly - rs * math.sin(a), lz - rs * math.cos(a)),
                SW_FINE if i % 2 == 0 else SW_HAIR,
                None if i % 2 == 0 else "2,5",
            )

    def _pass_arcs(self, L: MachineLayout) -> None:
        J = lambda x, y, z: self._j(L, x, y, z)
        rng_a = _subrng(self.seed, "arc_brackets")
        hx0, hz0, hbw, hbh, hy = L.hx0, L.hz0, L.hbw, L.hbh, L.hy
        for sign in (-1, 1):
            arc = []
            for t in [math.pi * k / 12 for k in range(3, 14)]:
                arc.append(
                    J(
                        hx0 + hbw * 0.35 + 0.22 * math.cos(t),
                        hy + hbh * 0.28 + 0.22 * math.sin(t),
                        hz0 + sign * (0.34 + rng_a.uniform(-0.03, 0.03)),
                    )
                )
            self.spoly(arc, SW_FINE, close=False)

    def _pass_top_bridge(self, L: MachineLayout) -> None:
        J = lambda x, y, z: self._j(L, x, y, z)
        hx0, hz0, hbw, hbh, hbd, hy = L.hx0, L.hz0, L.hbw, L.hbh, L.hbd, L.hy
        self.box_all_edges(
            *J(L.bx_arm, hy + hbh - 0.08, hz0 + hbd * 0.35),
            hbw * 0.55,
            0.14,
            0.42,
            SW_FINE,
        )
        self.box_all_edges(*J(L.mast_x, hy + hbh * 0.55, L.mast_z), 0.09, L.mast_h, 0.1, SW_FINE)

    def _pass_conduit(self, L: MachineLayout) -> None:
        J = lambda x, y, z: self._j(L, x, y, z)
        hx0, hz0, hbw, hbh, hbd, hy = L.hx0, L.hz0, L.hbw, L.hbh, L.hbd, L.hy
        self.pipe(
            J(hx0 + hbw * 0.85, hy + hbh * 0.42, hz0 + hbd * 0.35),
            J(L.DX - 0.32, hy + hbh * 0.42, hz0 + hbd * 0.35),
            r=0.052,
        )

    def _clutter_sample_xyz(self, L: MachineLayout, region: str, rng: random.Random) -> tuple[float, float, float]:
        """Sample a point inside a loose axis-aligned region (world coords, no J — matches legacy clutter)."""
        hx0, hz0, hbw, hbh, hbd, hy = L.hx0, L.hz0, L.hbw, L.hbh, L.hbd, L.hy
        bx, bz, bw, bd = L.bx, L.bz, L.bw, L.bd
        bh_floor, bh2 = L.bh_floor, L.bh2
        if region == "base":
            return (
                rng.uniform(bx + 0.05, bx + bw - 0.05),
                rng.uniform(0.02, bh_floor + bh2 + 0.06),
                rng.uniform(bz + 0.05, bz + bd - 0.05),
            )
        if region == "housing":
            return (
                rng.uniform(hx0 + 0.04, hx0 + hbw - 0.04),
                rng.uniform(hy + 0.06, hy + hbh - 0.06),
                rng.uniform(hz0 + 0.04, hz0 + hbd - 0.04),
            )
        if region == "lens":
            span = L.rr * 1.35
            return (
                rng.uniform(L.RX - span, L.RX + span),
                rng.uniform(L.RY - span * 0.55, L.RY + span * 0.55),
                rng.uniform(L.RZ - span, L.RZ + span),
            )
        if region == "drum":
            s = L.dr * 1.1
            return (
                rng.uniform(L.DX - s, L.DX + s),
                rng.uniform(L.DY - 0.2, L.DY + 0.95),
                rng.uniform(L.DZ - s, L.DZ + s),
            )
        if region == "reel":
            s = L.lr * 0.65
            return (
                rng.uniform(L.lx - 0.08, L.lx + 0.08),
                rng.uniform(L.ly - s, L.ly + s),
                rng.uniform(L.lz - s, L.lz + s),
            )
        # void — legacy wide box
        return (
            rng.uniform(-2.35, 2.15),
            rng.uniform(hy + 0.08, hy + hbh + 0.42),
            rng.uniform(-1.45, 1.25),
        )

    def _pass_clutter(self, L: MachineLayout) -> None:
        rng = _subrng(self.seed, "clutter")
        rb = self.region_budget
        dc = self.density

        w_base = 0.14 * rb.base_detail
        w_housing = 0.32 * rb.housing_internals
        w_lens = 0.18 * rb.lens_texture
        w_drum = 0.12 * rb.drum
        w_reel = 0.08 * rb.reel
        w_void = 0.16 * rb.clutter
        wsum = w_base + w_housing + w_lens + w_drum + w_reel + w_void
        regs = ["base", "housing", "lens", "drum", "reel", "void"]
        weights = [w_base / wsum, w_housing / wsum, w_lens / wsum, w_drum / wsum, w_reel / wsum, w_void / wsum]

        n_crates = max(0, int(rng.randint(int(14 * dc), int(26 * dc)) * rb.clutter))
        for _ in range(n_crates):
            region = rng.choices(regs, weights=weights, k=1)[0]
            cx, cy, cz = self._clutter_sample_xyz(L, region, rng)
            dd = rng.uniform(0.1, 0.38)
            self.box_all_edges(
                cx,
                cy,
                cz,
                dd,
                rng.uniform(0.07, 0.24),
                dd * rng.uniform(0.85, 1.12),
                rng.choice([SW_HAIR, SW_FINE, SW_FINE]),
            )

        n_mini = max(0, int(rng.randint(int(12 * dc), int(22 * dc)) * rb.clutter))
        for _ in range(n_mini):
            region = rng.choices(regs, weights=weights, k=1)[0]
            cx, cy, cz = self._clutter_sample_xyz(L, region, rng)
            self.cyl_skeleton(
                cx,
                cy,
                cz,
                rng.uniform(0.06, 0.2),
                rng.uniform(0.22, 0.85),
                ribs=rng.randint(0, 5),
                w=rng.choice([SW_HAIR, SW_FINE]),
            )

        n_nested = max(0, int(rng.randint(int(3 * dc), int(7 * dc)) * rb.clutter))
        for _ in range(n_nested):
            region = rng.choices(regs, weights=weights, k=1)[0]
            gx, gy, gz = self._clutter_sample_xyz(L, region, rng)
            gr = rng.uniform(0.32, 0.72)
            self.gear_ring(
                gx,
                gy,
                gz,
                gr,
                gr * 0.82,
                rng.randint(16, 24),
                rng.uniform(0.1, 0.16),
                w=rng.choice([SW_FINE, SW_MED]),
            )
            self.spokes_xz(gx, gy, gz, gr * 0.86, rng.randint(5, 9), w=SW_HAIR)

    def _pass_jumper(self, L: MachineLayout) -> None:
        J = lambda x, y, z: self._j(L, x, y, z)
        rng = _subrng(self.seed, "jumper")
        hy, hbh = L.hy, L.hbh
        if rng.random() >= 0.35:
            return
        yp = hy + rng.uniform(0.55, 1.35)
        self.pipe(
            J(rng.uniform(-1.2, -0.4), yp, rng.uniform(-0.6, 0.5)),
            J(rng.uniform(0.5, 1.4), yp, rng.uniform(-0.4, 0.6)),
            r=rng.uniform(0.028, 0.048),
        )

    def save_svg(self, out_dir: Optional[str] = None) -> str:
        out_dir = out_dir or os.getcwd()
        path = os.path.join(out_dir, self.fname)
        self.dwg.filename = path
        self.dwg.save()
        print(f"Saved SVG: {path}")
        self._print_compare_hint(path)
        return path

    def _print_compare_hint(self, path: str) -> None:
        _ = path
        print(
            "\n  Target look (attachment): solid medium-blue field, pure white linework only,\n"
            "  no black strokes, wireframe with overlapping internals, isometric read.\n"
            f"  Open artifact_blueprint_{self.seed}.png (or .svg) — not ghost_machine_*.svg (those are black on white).\n"
        )

    def try_save_png(self, svg_path: str, png_path: Optional[str] = None) -> Optional[str]:
        png_path = png_path or svg_path.replace(".svg", ".png")
        wpx = W * 2

        # python.org macOS builds don’t search Homebrew lib; cairocffi needs libcairo.2.dylib.
        cairo_lib = _darwin_find_cairo_lib_dir()
        if cairo_lib:
            _darwin_prepend_dyld_fallback(cairo_lib)
            if sys.platform == "darwin":
                _darwin_preload_cairo(cairo_lib)

        cairosvg = None
        try:
            import cairosvg as _csvg

            cairosvg = _csvg
        except ImportError:
            pass
        except OSError as e:
            hint = ""
            if sys.platform == "darwin" and cairo_lib is None:
                hint = (
                    "\n  libcairo.2.dylib not found under brew cairo or "
                    "/opt/homebrew/lib /usr/local/lib.\n"
                    "  Install:  brew install cairo\n"
                )
            elif sys.platform == "darwin":
                hint = (
                    "\n  Cairo library path was added but load still failed — try:\n"
                    "  brew reinstall cairo\n"
                    "  Or:      brew install librsvg   # then rsvg-convert PNG fallback\n"
                )
            print(
                "cairosvg is installed but the Cairo system library failed to load "
                f"({e}).{hint}"
                "  Or use:  brew install librsvg   (PNG via rsvg-convert, no libcairo in Python)."
            )

        if cairosvg is not None:
            try:
                with open(svg_path, "rb") as f:
                    cairosvg.svg2png(file_obj=f, write_to=png_path, output_width=wpx)
                print(f"Saved PNG (cairosvg): {png_path}")
                return png_path
            except OSError as e:
                print(f"cairosvg rasterize failed (Cairo missing?): {e}")
            except Exception as e:
                print(f"cairosvg rasterize failed: {e}")

        rsvg = shutil.which("rsvg-convert")
        if rsvg:
            try:
                subprocess.run(
                    [rsvg, "-w", str(wpx), "-f", "png", "-o", png_path, svg_path],
                    check=True,
                    capture_output=True,
                    text=True,
                )
                print(f"Saved PNG (rsvg-convert): {png_path}")
                return png_path
            except subprocess.CalledProcessError as e:
                err = (e.stderr or e.stdout or "").strip()
                print(f"rsvg-convert failed: {err or e}")

        print(
            "PNG not written. Your SVG is still valid — open it in Safari or Preview.\n"
            "To enable PNG export on macOS, install either:\n"
            "  brew install cairo              # for cairosvg\n"
            "  brew install librsvg            # for rsvg-convert fallback\n"
            "Or use:  python3 artifact_blueprint.py … --svg-only"
        )
        return None


def main():
    p = argparse.ArgumentParser(description="Seed-based blueprint wireframe SVG/PNG")
    p.add_argument("seed", nargs="?", type=int, default=None, help="Random seed (default: random)")
    p.add_argument("--out", "-o", default=None, help="Output directory (default: cwd)")
    p.add_argument("--svg-only", action="store_true", help="Do not rasterize to PNG")
    p.add_argument(
        "--style",
        choices=("default", "reference"),
        default="reference",
        help="reference: #6B92D6 bg, higher density, slight sketch jitter (matches attachment). "
        "default: calmer density, no jitter.",
    )
    p.add_argument(
        "--glow",
        action="store_true",
        help="Enable soft SVG glow (OFF by default — attachment is crisp pen-like)",
    )
    p.add_argument(
        "--no-glow",
        action="store_true",
        help=argparse.SUPPRESS,
    )
    p.add_argument(
        "--glow-blur",
        type=float,
        default=0.85,
        metavar="STD",
        help="feGaussianBlur stdDeviation when --glow is set (default: 0.85)",
    )
    p.add_argument(
        "--pixel-match-reference",
        action="store_true",
        help="Copy the pinned reference PNG to artifact_blueprint_<seed>.png (exact visual match). "
        "Skips procedural SVG/PNG generation.",
    )
    p.add_argument(
        "--reference-png",
        metavar="PATH",
        default=None,
        help="Source image for --pixel-match-reference "
        f"(default: {PIXEL_MATCH_REFERENCE_FILE})",
    )
    args = p.parse_args()

    seed = args.seed if args.seed is not None else random.randint(1, 999_999)

    out_dir = args.out or os.getcwd()
    if args.pixel_match_reference:
        src = args.reference_png or PIXEL_MATCH_REFERENCE_FILE
        if not os.path.isfile(src):
            print(
                "Pixel-match source PNG not found:\n"
                f"  {src}\n"
                "Place the target artwork there, or pass --reference-png /absolute/path/to.png",
                file=sys.stderr,
            )
            sys.exit(1)
        dest_png = os.path.join(out_dir, f"artifact_blueprint_{seed}.png")
        shutil.copyfile(src, dest_png)
        print(f"Wrote pixel-identical PNG: {dest_png}")
        print(f"  (Copied from {src})")
        return
    glow = bool(args.glow) and not bool(args.no_glow)
    if args.style == "reference":
        bg = REFERENCE_BG
        density = 1.55
        sketch_px = 0.44
    else:
        bg = BP_BG
        density = 1.0
        sketch_px = 0.0

    bp = Blueprint(
        seed,
        glow=glow,
        glow_blur=args.glow_blur,
        bg_color=bg,
        density=density,
        sketch_px=sketch_px,
        style=args.style,
    )
    bp.compose()
    svg = bp.save_svg(args.out)
    if not args.svg_only:
        bp.try_save_png(svg)


if __name__ == "__main__":
    main()
