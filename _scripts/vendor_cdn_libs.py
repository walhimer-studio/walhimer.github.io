#!/usr/bin/env python3
"""Vendor external CDN library references to local js/ paths across published HTML.

Mechanical CDN → local replacement only. Does not change sketch logic, seeds, or shaders.

Usage:
  python3 _scripts/vendor_cdn_libs.py           # download missing libs + rewrite HTML
  python3 _scripts/vendor_cdn_libs.py --dry-run # show planned changes
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIB_ROOT = ROOT / "sketches" / "js"

SCAN_ROOTS = (
    ROOT / "sketches",
    ROOT / "installations",
    ROOT / "machine-aesthetic",
    ROOT / "drafts",
)
SCAN_FILES = (ROOT / "index.html",)

# CDN URL → local filename under sketches/js/
LIB_FETCH: dict[str, str] = {
    "https://unpkg.com/three@0.128.0/build/three.min.js": "three-0.128.0.min.js",
    "https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js": "OrbitControls-0.128.0.js",
    "https://unpkg.com/three@0.128.0/examples/js/controls/PointerLockControls.js": "PointerLockControls-0.128.0.js",
    "https://unpkg.com/three@0.160.0/build/three.module.js": "three-0.160.0.module.js",
    "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js": "p5-1.4.0.js",
    "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js": "p5-1.7.0.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js": "p5-1.9.0.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/addons/p5.sound.min.js": "p5.sound-1.9.0.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.2/p5.min.js": "p5-1.11.2.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.min.js": "p5-1.11.3.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js": "three-0.128.0.min.js",
    "https://unpkg.com/three@0.160.0/build/three.min.js": "three-0.160.0.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js": "three-0.160.0.min.js",
    "https://unpkg.com/three@0.155.0/build/three.min.js": "three-0.155.0.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/r155/three.min.js": "three-0.155.0.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js": "Tone-14.7.77.js",
    "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js": "Tone-14.8.49.js",
    "https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js": "Tone-14.7.77.js",
    "https://unpkg.com/tone@14.8.49/build/Tone.js": "Tone-14.8.49.js",
    "https://unpkg.com/ml5@1/dist/ml5.min.js": "ml5-1.min.js",
    "https://unpkg.com/gif.js@0.2.0/dist/gif.js": "gif-0.2.0.js",
    "https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js": "gif.worker-0.2.0.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js": "jszip-3.10.1.min.js",
    "https://cdn.jsdelivr.net/npm/ccapture.js@1.1.0/build/CCapture.all.min.js": "CCapture-1.1.0.all.min.js",
    "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js": "ethers-5.7.2.umd.min.js",
    "https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js": "GLTFLoader-0.128.0.js",
    "https://cdn.jsdelivr.net/gh/walhimer-studio/EmergentDNA@v1.1.0/src/emergent-dna-core.js": "emergent-dna-core.js",
    "https://unpkg.com/three@0.170.0/build/three.module.js": "three-0.170.0.module.js",
    "https://unpkg.com/three@0.170.0/examples/jsm/": "three-0.170.0-jsm/",
    "https://esm.sh/tone@14.8.49": "tone-14.8.49.module.js",
    "https://unpkg.com/tone@14.8.49/build/Tone.js": "tone-14.8.49.module.js",
    "https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js": "p5-1.9.4.min.js",
    "https://cdn.jsdelivr.net/npm/p5@1.9.3/lib/p5.min.js": "p5-1.9.3.min.js",
    "https://unpkg.com/three@0.132.2/examples/js/loaders/FontLoader.js": "FontLoader-0.132.2.js",
    "https://unpkg.com/three@0.132.2/examples/js/geometries/TextGeometry.js": "TextGeometry-0.132.2.js",
    "https://unpkg.com/three@0.132.2/examples/js/exporters/STLExporter.js": "STLExporter-0.132.2.js",
}

P5_RE = re.compile(
    r"""https://cdnjs\.cloudflare\.com/ajax/libs/p5\.js/([^/"']+)/([^"']+)""",
    re.I,
)
THREE_SCRIPT_RE = re.compile(
    r"""https://unpkg\.com/three@0\.128\.0/(build/three\.min\.js|examples/js/controls/[^"']+)""",
    re.I,
)
THREE160_RE = re.compile(
    r"""https://unpkg\.com/three@0\.160\.0/([^"']+)""",
    re.I,
)
JSDELIVR_P5_RE = re.compile(
    r"""https://cdn\.jsdelivr\.net/npm/p5@([^/"']+)/lib/([^"']+)""",
    re.I,
)
THREE170_RE = re.compile(
    r"""https://unpkg\.com/three@0\.170\.0/([^"']+)""",
    re.I,
)
ESM_TONE_RE = re.compile(
    r"""https://esm\.sh/tone@[^"']+""",
    re.I,
)
JSDELIVR_THREE_RE = re.compile(
    r"""https://cdn\.jsdelivr\.net/npm/three@[^/"']+/([^"']+)""",
    re.I,
)
GENERIC_LIB_RE = re.compile(
    r"""https?://(?:unpkg\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)[^"']+""",
    re.I,
)


def iter_html_files() -> list[Path]:
    files: list[Path] = []
    for path in SCAN_FILES:
        if path.is_file():
            files.append(path)
    for root in SCAN_ROOTS:
        if root.is_dir():
            for path in sorted(root.rglob("*.html")):
                if "node_modules" in path.parts:
                    continue
                files.append(path)
    return files


def rel_to_lib(html_path: Path, lib_name: str) -> str:
    trailing = lib_name.endswith("/")
    clean = lib_name.rstrip("/")
    target = LIB_ROOT / clean
    rel = Path(os.path.relpath(target, html_path.parent)).as_posix()
    return f"{rel}/" if trailing else rel


def local_name_for_three128(path_suffix: str) -> str:
    if path_suffix == "build/three.min.js":
        return "three-0.128.0.min.js"
    if path_suffix.endswith("OrbitControls.js"):
        return "OrbitControls-0.128.0.js"
    if path_suffix.endswith("PointerLockControls.js"):
        return "PointerLockControls-0.128.0.js"
    return f"three-0.128.0-{path_suffix.replace('/', '-')}"


def local_name_for_three160(path_suffix: str) -> str:
    safe = path_suffix.replace("/", "__")
    return f"three160-{safe}"


def fetch_three_jsm(version: str, dry_run: bool) -> None:
    dest_dir = LIB_ROOT / f"three-{version}-jsm"
    if dest_dir.is_dir() and any(dest_dir.iterdir()):
        return
    if dry_run:
        print(f"Would extract three@{version} examples/jsm → {dest_dir.relative_to(ROOT)}")
        return
    import io
    import tarfile

    url = f"https://registry.npmjs.org/three/-/three-{version}.tgz"
    print(f"Fetching {url} for examples/jsm …")
    try:
        with urllib.request.urlopen(url, timeout=120) as resp:
            data = resp.read()
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as tar:
            prefix = f"package/examples/jsm/"
            dest_dir.mkdir(parents=True, exist_ok=True)
            count = 0
            for member in tar.getmembers():
                if not member.name.startswith(prefix) or member.isdir():
                    continue
                rel = member.name[len(prefix) :]
                out = dest_dir / rel
                out.parent.mkdir(parents=True, exist_ok=True)
                extracted = tar.extractfile(member)
                if extracted:
                    out.write_bytes(extracted.read())
                    count += 1
            print(f"  extracted {count} jsm file(s)")
    except Exception as exc:
        print(f"  skip three jsm ({exc})")


def ensure_libs(dry_run: bool) -> None:
    LIB_ROOT.mkdir(parents=True, exist_ok=True)
    fetch_three_jsm("0.170.0", dry_run)

    # Reuse existing loop-snippets bundle if present.
    loop_three = ROOT / "sketches" / "loop-snippets" / "js" / "three.min.js"
    loop_orbit = ROOT / "sketches" / "loop-snippets" / "js" / "OrbitControls.js"
    pairs = (
        (loop_three, LIB_ROOT / "three-0.128.0.min.js"),
        (loop_orbit, LIB_ROOT / "OrbitControls-0.128.0.js"),
    )
    for src, dst in pairs:
        if src.is_file() and not dst.is_file() and not dry_run:
            shutil.copy2(src, dst)
            print(f"Copied {src.relative_to(ROOT)} → {dst.relative_to(ROOT)}")

    for url, filename in LIB_FETCH.items():
        dest = LIB_ROOT / filename
        if dest.is_file():
            continue
        if dry_run:
            print(f"Would fetch {url}")
            continue
        print(f"Fetching {url} …")
        try:
            urllib.request.urlretrieve(url, dest)
        except Exception as exc:
            print(f"  skip ({exc})")

    # Mirror to loop-snippets/js for files that use sibling js/ paths.
    loop_js = ROOT / "sketches" / "loop-snippets" / "js"
    loop_js.mkdir(parents=True, exist_ok=True)
    mirrors = (
        ("three-0.128.0.min.js", "three.min.js"),
        ("OrbitControls-0.128.0.js", "OrbitControls.js"),
    )
    for src_name, dst_name in mirrors:
        src = LIB_ROOT / src_name
        dst = loop_js / dst_name
        if src.is_file() and not dst.is_file() and not dry_run:
            shutil.copy2(src, dst)


def rewrite_content(html_path: Path, text: str) -> tuple[str, int]:
    changes = 0

    def sub_p5(match: re.Match[str]) -> str:
        nonlocal changes
        version, rest = match.group(1), match.group(2)
        if rest == "p5.js":
            lib = f"p5-{version}.js"
        elif rest.endswith(".min.js"):
            lib = f"p5-{version}.min.js"
        else:
            lib = f"p5-{version}-{rest.replace('/', '-')}"
        url_key = match.group(0)
        if url_key not in LIB_FETCH:
            LIB_FETCH[url_key] = lib
        changes += 1
        return rel_to_lib(html_path, lib)

    text = P5_RE.sub(sub_p5, text)

    def sub_three128(match: re.Match[str]) -> str:
        nonlocal changes
        suffix = match.group(1)
        lib = local_name_for_three128(suffix)
        changes += 1
        return rel_to_lib(html_path, lib)

    text = THREE_SCRIPT_RE.sub(sub_three128, text)

    def sub_three160(match: re.Match[str]) -> str:
        nonlocal changes
        suffix = match.group(1)
        lib = local_name_for_three160(suffix)
        url = match.group(0)
        if url not in LIB_FETCH:
            LIB_FETCH[url] = lib
        changes += 1
        return rel_to_lib(html_path, lib)

    text = THREE160_RE.sub(sub_three160, text)

    def sub_jsdelivr_p5(match: re.Match[str]) -> str:
        nonlocal changes
        version, rest = match.group(1), match.group(2)
        lib = f"p5-{version}.min.js" if rest.endswith(".min.js") else f"p5-{version}-{rest.replace('/', '-')}"
        url_key = match.group(0)
        if url_key not in LIB_FETCH:
            LIB_FETCH[url_key] = lib
        changes += 1
        return rel_to_lib(html_path, lib)

    text = JSDELIVR_P5_RE.sub(sub_jsdelivr_p5, text)

    def sub_three170(match: re.Match[str]) -> str:
        nonlocal changes
        suffix = match.group(1)
        if suffix == "build/three.module.js":
            lib = "three-0.170.0.module.js"
        elif suffix == "examples/jsm/":
            lib = "three-0.170.0-jsm/"
        else:
            lib = f"three-0.170.0-jsm/{suffix.replace('examples/jsm/', '')}"
        changes += 1
        return rel_to_lib(html_path, lib)

    text = THREE170_RE.sub(sub_three170, text)

    def sub_esm_tone(_: re.Match[str]) -> str:
        nonlocal changes
        changes += 1
        return rel_to_lib(html_path, "tone-14.8.49.module.js")

    text = ESM_TONE_RE.sub(sub_esm_tone, text)

    def sub_jsdelivr_three(match: re.Match[str]) -> str:
        nonlocal changes
        suffix = match.group(1)
        if suffix == "build/three.min.js":
            lib = "three-0.128.0.min.js"
        elif "OrbitControls" in suffix:
            lib = "OrbitControls-0.128.0.js"
        else:
            lib = local_name_for_three160(suffix)
        changes += 1
        return rel_to_lib(html_path, lib)

    text = JSDELIVR_THREE_RE.sub(sub_jsdelivr_three, text)

    for url, lib in sorted(LIB_FETCH.items(), key=lambda x: -len(x[0])):
        count = text.count(url)
        if count:
            text = text.replace(url, rel_to_lib(html_path, lib))
            changes += count

    # loop-snippets convention: js/three.min.js when file is in loop-snippets/
    if "loop-snippets" in html_path.parts:
        text = text.replace(
            rel_to_lib(html_path, "three-0.128.0.min.js"),
            "js/three.min.js",
        )
        text = text.replace(
            rel_to_lib(html_path, "OrbitControls-0.128.0.js"),
            "js/OrbitControls.js",
        )
        text = text.replace(
            rel_to_lib(html_path, "PointerLockControls-0.128.0.js"),
            "js/PointerLockControls.js",
        )

    return text, changes


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    ensure_libs(args.dry_run)
    if not args.dry_run:
        ensure_libs(False)  # fetch anything discovered during dry patterns

    total_files = 0
    total_changes = 0
    for html_path in iter_html_files():
        original = html_path.read_text(encoding="utf-8", errors="replace")
        updated, n = rewrite_content(html_path, original)
        if n:
            total_files += 1
            total_changes += n
            rel = html_path.relative_to(ROOT)
            print(f"{'Would update' if args.dry_run else 'Updated'} {rel} ({n} CDN ref(s))")
            if not args.dry_run and updated != original:
                html_path.write_text(updated, encoding="utf-8")

    print(f"\nDone — {total_files} file(s), {total_changes} CDN reference(s) replaced.")
    if not args.dry_run:
        print("Run: python3 _scripts/check_self_contained.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
