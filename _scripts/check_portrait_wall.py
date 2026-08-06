#!/usr/bin/env python3
"""Fail if published portrait wall files use fetch/iframe runtime art loading."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKETCHES = ROOT / "sketches"

LEGACY_ALLOWLIST = {
    "sketches/loop-snippets/ghost_dense_77823_gravity_sliders_43_portrait.html",
}

FORBIDDEN = [
    (re.compile(r"\bfetch\s*\(", re.I), "fetch("),
    (re.compile(r"\bART_CORE\b"), "ART_CORE"),
    (re.compile(r"<iframe\b", re.I), "<iframe"),
    (re.compile(r"document\.write\s*\(", re.I), "document.write("),
]


def main() -> int:
    errors: list[str] = []
    portrait_files = sorted(SKETCHES.rglob("*_portrait.html"))

    if not portrait_files:
        print("check_portrait_wall: no *_portrait.html under sketches/ (ok)")
        return 0

    for path in portrait_files:
        rel_posix = path.relative_to(ROOT).as_posix()
        if rel_posix in LEGACY_ALLOWLIST:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for pattern, label in FORBIDDEN:
            if pattern.search(text):
                errors.append(f"{rel_posix}: forbidden {label} — use copy+paste starter")

    if errors:
        print("check_portrait_wall FAILED:", file=sys.stderr)
        for err in errors:
            print(f"  {err}", file=sys.stderr)
        return 1

    print(f"check_portrait_wall: ok ({len(portrait_files)} file(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
