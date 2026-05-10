#!/usr/bin/env python3
"""
Demo: unsupervised "component" visualization via SLIC superpixels + K-means
on LAB color and spatial features. Not semantic naming — illustrates how
clustering carves the artwork into regions.
"""
from __future__ import annotations

import colorsys
import os
import sys
from pathlib import Path

import cv2
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from skimage.segmentation import mark_boundaries, slic
from skimage.color import rgb2lab


def resolve_default_input() -> Path | None:
    """Prefer argv/env; else common locations for the conversation asset."""
    here = Path(__file__).resolve().parent
    home = Path.home()
    candidates = [
        here / "artifact_conversation.png",
        home
        / ".cursor/projects/Users-markwalhimer-Documents-GitHub-walhimer-github-io/assets/artifact-7c0ab8ca-47a3-4234-92cb-e8287b5455f9.png",
        home
        / ".cursor/projects/Users-markwalhimer-Documents-GitHub-walhimer-github-io/assets/artifact-2-7d83bb34-bdee-45d1-b65e-9d6b83224e25.png",
    ]
    for p in candidates:
        if p.is_file():
            return p
    return None


def distinct_colors(n: int, seed: int = 0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    # Golden-ratio hue sweep for visually separated colors
    hues = (rng.random() + np.arange(n) * 0.618033988749895) % 1.0
    cols = np.zeros((n, 3), dtype=np.float64)
    for i, h in enumerate(hues):
        cols[i] = colorsys.hsv_to_rgb(float(h), 0.85, 0.95)
    return (cols * 255).astype(np.uint8)


def main() -> int:
    if len(sys.argv) > 1:
        src = os.path.abspath(sys.argv[1])
    elif os.environ.get("ARTIFACT_PNG"):
        src = os.path.abspath(os.environ["ARTIFACT_PNG"])
    else:
        p = resolve_default_input()
        if p is None:
            print(
                "No input image. Pass path, set ARTIFACT_PNG, or add artifact_conversation.png next to this script.",
                file=sys.stderr,
            )
            return 1
        src = str(p)

    out_dir = os.path.dirname(os.path.abspath(__file__))
    if len(sys.argv) > 2:
        out_path = os.path.abspath(sys.argv[2])
    elif len(sys.argv) > 1 or os.environ.get("ARTIFACT_PNG"):
        out_path = os.path.join(
            out_dir, f"artifact_ml_vision_{Path(src).stem}.png"
        )
    else:
        out_path = os.path.join(out_dir, "artifact_ml_vision_demo.png")

    if not os.path.isfile(src):
        print(f"Input not found: {src}", file=sys.stderr)
        print("Usage: ml_vision_artifact_demo.py [path/to/image.png]", file=sys.stderr)
        return 1

    bgr = cv2.imread(src)
    if bgr is None:
        print(f"Could not read image: {src}", file=sys.stderr)
        return 1

    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    h, w = rgb.shape[:2]

    # SLIC: compactness balances color edges vs spatial smoothness (higher = less noisy bg)
    # Env overrides: SLIC_COMPACTNESS, SLIC_SIGMA, SLIC_N_SEGMENTS (approx target count)
    n_segments = int(os.environ.get("SLIC_N_SEGMENTS", "0"))
    if n_segments <= 0:
        n_segments = min(900, max(300, (h * w) // 1200))
    compactness = float(os.environ.get("SLIC_COMPACTNESS", "12"))
    sigma = float(os.environ.get("SLIC_SIGMA", "1"))
    labels = slic(
        rgb,
        n_segments=n_segments,
        compactness=compactness,
        sigma=sigma,
        start_label=0,
        channel_axis=-1,
    )
    n_sp = int(labels.max()) + 1

    lab = rgb2lab(rgb)

    # Per-superpixel features: mean Lab + normalized centroid (spatial grouping)
    feats = np.zeros((n_sp, 5), dtype=np.float64)
    yy, xx = np.mgrid[0:h, 0:w]
    flat_lab = lab.reshape(-1, 3)
    flat_x = (xx / max(w - 1, 1)).reshape(-1)
    flat_y = (yy / max(h - 1, 1)).reshape(-1)
    flat_l = labels.ravel()

    for sp in range(n_sp):
        m = flat_l == sp
        if not np.any(m):
            continue
        feats[sp, :3] = flat_lab[m].mean(axis=0)
        feats[sp, 3] = flat_x[m].mean()
        feats[sp, 4] = flat_y[m].mean()

    k = 28
    X = StandardScaler().fit_transform(feats)
    km = KMeans(n_clusters=k, n_init=10, random_state=42)
    sp_cluster = km.fit_predict(X)

    cluster_img = sp_cluster[labels]
    palette = distinct_colors(k, seed=7)
    colored = palette[cluster_img]

    # Boundaries on original (SLIC)
    marked = (mark_boundaries(rgb, labels, mode="thick", color=(1, 1, 0)) * 255).astype(np.uint8)
    marked_bgr = cv2.cvtColor(marked, cv2.COLOR_RGB2BGR)

    # Layout: original | SLIC boundaries | K-means pseudo-components
    orig_bgr = bgr.copy()
    colored_bgr = cv2.cvtColor(colored, cv2.COLOR_RGB2BGR)

    pad = 8
    total_w = w * 3 + pad * 2
    canvas = np.zeros((h, total_w, 3), dtype=np.uint8)
    canvas.fill(30)
    x0 = 0
    for tile in (orig_bgr, marked_bgr, colored_bgr):
        canvas[:, x0 : x0 + w] = tile
        x0 += w + pad

    cv2.putText(
        canvas,
        "original",
        (8, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (220, 220, 220),
        1,
        cv2.LINE_AA,
    )
    cv2.putText(
        canvas,
        f"SLIC superpixels (n~{n_segments})",
        (w + pad + 8, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (220, 220, 220),
        1,
        cv2.LINE_AA,
    )
    cv2.putText(
        canvas,
        f"K-means clusters (k={k})",
        (2 * w + 2 * pad + 8, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (220, 220, 220),
        1,
        cv2.LINE_AA,
    )

    ok = cv2.imwrite(out_path, canvas)
    if not ok:
        print(f"Failed to write {out_path}", file=sys.stderr)
        return 1
    print(out_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
