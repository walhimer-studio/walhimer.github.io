#!/usr/bin/env python3
"""Build self-contained Objkt interactive ZIP for actz June Myths & Legends gravity sliders.

Output: sketches/actz-june-myths-legends-2026/objkt-bundle/
  index.html, js/three.min.js, js/OrbitControls.js
  actz-gravity-sliders-objkt.zip (upload this to Objkt)

See https://docs.objkt.com/product/product-guides/minting-a-token/interactive-tokens
"""

from __future__ import annotations

import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHOW = ROOT / "sketches" / "actz-june-myths-legends-2026"
SRC_HTML = SHOW / "gravity-sliders.html"
JS_SRC = ROOT / "sketches" / "loop-snippets" / "js"
OUT = SHOW / "objkt-bundle"
ZIP_PATH = OUT / "actz-gravity-sliders-objkt.zip"

# Edition seed — hash of "actz myths legends" (not Ghost Dense 77823)
ACTZ_EDITION_SEED = 1909113409


def patch_html(html: str) -> str:
    html = re.sub(
        r"<script src=\"\.\./loop-snippets/js/three\.min\.js\"></script>",
        "<script src=\"js/three.min.js\"></script>",
        html,
        count=1,
    )
    html = re.sub(
        r"<script src=\"\.\./loop-snippets/js/OrbitControls\.js\"></script>",
        "<script src=\"js/OrbitControls.js\"></script>",
        html,
        count=1,
    )
    html = re.sub(
        r"const INITIAL_SEED = \(\(\) => \{[\s\S]*?\}\)\(\);",
        f"const INITIAL_SEED = {ACTZ_EDITION_SEED};",
        html,
        count=1,
    )
    html = re.sub(
        r"\n  if \(VIEW === 'display'\) \{[\s\S]*?\n  \}\n\}\)\(\);",
        "\n})();",
        html,
        count=1,
    )
    html = re.sub(
        r"<title>.*?</title>",
        "<title>actz — Surrender Machines · Gravity Sliders</title>",
        html,
        count=1,
    )
    html = re.sub(
        r"<link rel=\"canonical\" href=\"[^\"]+\" />\n",
        "",
        html,
        count=1,
    )
    return html


def main() -> None:
    if not SRC_HTML.is_file():
        raise SystemExit(f"Missing source: {SRC_HTML}")
    for name in ("three.min.js", "OrbitControls.js"):
        if not (JS_SRC / name).is_file():
            raise SystemExit(f"Missing {JS_SRC / name}")

    if OUT.exists():
        shutil.rmtree(OUT)
    js_out = OUT / "js"
    js_out.mkdir(parents=True)
    for name in ("three.min.js", "OrbitControls.js"):
        shutil.copy2(JS_SRC / name, js_out / name)

    html = patch_html(SRC_HTML.read_text(encoding="utf-8"))
    (OUT / "index.html").write_text(html, encoding="utf-8")

    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(OUT.rglob("*")):
            if path.is_file() and path != ZIP_PATH:
                zf.write(path, path.relative_to(OUT).as_posix())

    print(f"Edition seed: {ACTZ_EDITION_SEED}")
    print(f"Bundle: {OUT.relative_to(ROOT)}")
    print(f"Upload: {ZIP_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
