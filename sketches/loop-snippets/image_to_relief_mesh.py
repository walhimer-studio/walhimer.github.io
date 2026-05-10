#!/usr/bin/env python3
"""
Turn a high-contrast blueprint-style image (strokes vs flat field) into a 3D mesh.

This is a *relief* / height-field interpretation: strokes become ridges (or grooves).
It does NOT recover true mechanical 3D from an isometric wireframe — that needs depth
priors (e.g. Meshy) or authored CAD.

Outputs OBJ always; GLB if `trimesh` is installed.

Example:
  .venv-mlviz/bin/python image_to_relief_mesh.py \\
    ~/.cursor/.../artifact.png -o machine_relief.obj --stride 3 --z-scale 2.5
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import cv2
import numpy as np
from scipy.ndimage import distance_transform_edt, gaussian_filter


def resolve_default_input() -> Path | None:
    here = Path(__file__).resolve().parent
    home = Path.home()
    candidates = [
        here / "artifact_input.png",
        home
        / ".cursor/projects/Users-markwalhimer-Documents-GitHub-walhimer-github-io/assets/artifact-c4fe97ad-cf98-42bc-adf5-2e9f296c2fdb.png",
        home
        / ".cursor/projects/Users-markwalhimer-Documents-GitHub-walhimer-github-io/assets/artifact-7c0ab8ca-47a3-4234-92cb-e8287b5455f9.png",
    ]
    for p in candidates:
        if p.is_file():
            return p
    return None


def stroke_mask_lab(bgr: np.ndarray, l_thresh: float, morph_close: int) -> np.ndarray:
    """White/light strokes on colored field: threshold on L* channel."""
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    L = lab[:, :, 0].astype(np.float64) / 255.0
    mask = L >= l_thresh
    mask_u8 = (mask.astype(np.uint8) * 255)
    if morph_close > 0:
        k = morph_close * 2 + 1
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
        mask_u8 = cv2.morphologyEx(mask_u8, cv2.MORPH_CLOSE, kernel)
    return mask_u8 > 127


def heightmap_ridge(line_mask: np.ndarray, sigma: float) -> np.ndarray:
    """
    Peaks along strokes: high near lines, lower on background.
    Uses Euclidean distance-to-stroke (inverted).
    """
    fg = (~line_mask).astype(np.uint8)
    dist = distance_transform_edt(fg)
    z = dist.max() - dist
    z = z.astype(np.float64)
    if sigma > 0:
        z = gaussian_filter(z, sigma=sigma)
    z -= z.min()
    denom = z.max() + 1e-9
    z /= denom
    return z


def heightmap_emboss(line_mask: np.ndarray, sigma: float) -> np.ndarray:
    """Softer lump: blurred stroke mask as height."""
    m = line_mask.astype(np.float64)
    if sigma > 0:
        m = gaussian_filter(m, sigma=sigma)
    z = m - m.min()
    z /= z.max() + 1e-9
    return z


def heightmap_to_mesh(
    z: np.ndarray,
    stride: int,
    xy_scale: float,
    z_scale: float,
    flip_y: bool,
) -> tuple[np.ndarray, np.ndarray]:
    """Regular grid triangulation. z shape (H, W)."""
    z_s = z[::stride, ::stride]
    h, w = z_s.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    xs = xx * xy_scale * stride
    ys = yy * xy_scale * stride
    if flip_y:
        ys = -ys
    zs = z_s * z_scale
    verts = np.column_stack([xs.ravel(), ys.ravel(), zs.ravel()])

    faces = []
    for i in range(h - 1):
        for j in range(w - 1):
            i00 = i * w + j
            i10 = i * w + (j + 1)
            i01 = (i + 1) * w + j
            i11 = (i + 1) * w + (j + 1)
            faces.append([i00, i01, i11])
            faces.append([i00, i11, i10])
    faces_arr = np.array(faces, dtype=np.int64)
    return verts, faces_arr


def write_obj(path: Path, verts: np.ndarray, faces: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        f.write("# relief mesh from image_to_relief_mesh.py\n")
        for x, y, z in verts:
            f.write(f"v {x:.6f} {y:.6f} {z:.6f}\n")
        for a, b, c in faces:
            f.write(f"f {a + 1} {b + 1} {c + 1}\n")


def try_write_glb(path: Path, verts: np.ndarray, faces: np.ndarray) -> bool:
    try:
        import trimesh
    except ImportError:
        return False
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
    mesh.export(path)
    return True


def main() -> int:
    ap = argparse.ArgumentParser(description="Blueprint PNG → relief OBJ/GLB mesh.")
    ap.add_argument(
        "input",
        nargs="?",
        default=None,
        help="Input PNG/JPG (default: known artifact path if present)",
    )
    ap.add_argument("-o", "--output", type=str, default=None, help="Output .obj path")
    ap.add_argument(
        "--glb",
        type=str,
        default=None,
        help="Also write GLB here (needs: pip install trimesh)",
    )
    ap.add_argument(
        "--mode",
        choices=("ridge", "emboss"),
        default="ridge",
        help="ridge=sharp crest along strokes; emboss=softer thickened strokes",
    )
    ap.add_argument("--stride", type=int, default=4, help="Pixel stride for mesh (larger=fewer polys)")
    ap.add_argument("--sigma", type=float, default=1.25, help="Gaussian smooth on height (0=off)")
    ap.add_argument("--l-thresh", type=float, default=0.72, help="LAB L* threshold for strokes [0-1]")
    ap.add_argument("--morph-close", type=int, default=2, help="Morph close radius (0=skip)")
    ap.add_argument("--xy-scale", type=float, default=1.0, help="World units per pixel (horizontal)")
    ap.add_argument("--z-scale", type=float, default=25.0, help="Vertical exaggeration")
    args = ap.parse_args()

    if args.input:
        src = Path(args.input).expanduser().resolve()
    else:
        d = resolve_default_input()
        if d is None:
            print("No input file; pass a PNG path.", file=sys.stderr)
            return 1
        src = d

    if not src.is_file():
        print(f"Not found: {src}", file=sys.stderr)
        return 1

    out_obj = (
        Path(args.output).expanduser().resolve()
        if args.output
        else src.with_suffix("").parent / f"{src.stem}_relief.obj"
    )

    bgr = cv2.imread(str(src))
    if bgr is None:
        print(f"Could not read image: {src}", file=sys.stderr)
        return 1

    mask = stroke_mask_lab(bgr, l_thresh=args.l_thresh, morph_close=args.morph_close)
    if args.mode == "ridge":
        z = heightmap_ridge(mask, sigma=args.sigma)
    else:
        z = heightmap_emboss(mask, sigma=max(args.sigma, 0.8))

    verts, faces = heightmap_to_mesh(
        z,
        stride=max(1, args.stride),
        xy_scale=args.xy_scale,
        z_scale=args.z_scale,
        flip_y=True,
    )

    write_obj(out_obj, verts, faces)
    print(out_obj)

    if args.glb:
        glb_path = Path(args.glb).expanduser().resolve()
        if try_write_glb(glb_path, verts, faces):
            print(glb_path)
        else:
            print(
                "Install trimesh for GLB: pip install trimesh",
                file=sys.stderr,
            )
            return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
