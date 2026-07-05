#!/usr/bin/env python3
"""
Install Salamander Grand Piano samples for Holes in the Sky (and reuse elsewhere).

Extracts the Tone.js / Bloom web pack (mp3 + ogg per minor-third root) from
salamander.zip into:

  sketches/the-wrong-biennale/the-wrong-eclipse-august-2026/samples/salamander/
  sketches/the-wrong-biennale/the-wrong-eclipse-august-2026/samples/salamander/pentatonic/

Also copies v8 WAV roots from samples/salamander-lite/ into pentatonic/wav-v8/
when present.

Source zip search order (first hit wins):
  - SALAMANDER_ZIP env var
  - ~/Desktop/2026/Competitions/2026/ARS Prix 2026/005_bloom_release/audio-master/salamander.zip
  - ~/Desktop/ARS Prix 2026/005_bloom_release/audio-master/salamander.zip

License: Salamander Grand Piano — Alexander Holm, CC BY 3.0
https://sfzinstruments.github.io/pianos/salamander/

  python3 _scripts/install_salamander_samples.py
"""

from __future__ import annotations

import os
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = (
    ROOT
    / "sketches/the-wrong-biennale/the-wrong-eclipse-august-2026/samples/salamander"
)
LITE = TARGET.parent / "salamander-lite"

# Bloom / inject_salamander pentatonic roots (mp3 in zip)
PENTATONIC_MP3 = [
    "C2", "C3", "C4", "C5", "C6",
    "A2", "A3", "A4", "A5",
    "Ds2", "Ds3", "Ds4", "Ds5", "Ds6",
    "Fs2", "Fs3", "Fs4", "Fs5", "Fs6",
]

# v8 WAV shipped in salamander-lite (C + A roots only)
PENTATONIC_WAV_V8 = [
    "C2", "C3", "C4", "C5", "C6", "A2", "A3", "A4", "A5",
]

ZIP_CANDIDATES = [
    Path(os.environ.get("SALAMANDER_ZIP", "")),
    Path.home()
    / "Desktop/2026/Competitions/2026/ARS Prix 2026/005_bloom_release/audio-master/salamander.zip",
    Path.home()
    / "Desktop/ARS Prix 2026/005_bloom_release/audio-master/salamander.zip",
]

README = """# Salamander Grand Piano samples

**Salamander Grand Piano** (Yamaha C5) — Alexander Holm, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).

| Folder | Contents |
|--------|----------|
| `./` | Full web pack — all minor-third roots (`A0`–`C8`), `.mp3` and `.ogg` |
| `pentatonic/` | C-major pentatonic subset (19 mp3 roots for Bloom-style mapping) |
| `pentatonic/wav-v8/` | Optional v8 velocity WAV (C + A roots from `../salamander-lite/`) |

Reinstall after samples go missing:

```bash
python3 _scripts/install_salamander_samples.py
```

Set `SALAMANDER_ZIP=/path/to/salamander.zip` if the zip moves.
"""


def find_zip() -> Path:
    for p in ZIP_CANDIDATES:
        if p and p.is_file():
            return p
    raise SystemExit(
        "salamander.zip not found. Set SALAMANDER_ZIP or place zip at:\n"
        "  ~/Desktop/2026/Competitions/2026/ARS Prix 2026/005_bloom_release/audio-master/salamander.zip"
    )


def extract_all(zip_path: Path, dest: Path) -> int:
    dest.mkdir(parents=True, exist_ok=True)
    count = 0
    with zipfile.ZipFile(zip_path, "r") as zf:
        for name in zf.namelist():
            if not name.startswith("salamander/") or name.endswith("/"):
                continue
            base = Path(name).name
            if base.startswith(".") or base == "README":
                continue
            out = dest / base
            out.write_bytes(zf.read(name))
            count += 1
    return count


def build_pentatonic(dest: Path) -> tuple[int, int]:
    penta = dest / "pentatonic"
    wav_v8 = penta / "wav-v8"
    penta.mkdir(parents=True, exist_ok=True)
    wav_v8.mkdir(parents=True, exist_ok=True)

    mp3_count = 0
    for key in PENTATONIC_MP3:
        src = dest / f"{key}.mp3"
        if not src.is_file():
            raise SystemExit(f"Missing {src.name} in extracted salamander/")
        shutil.copy2(src, penta / f"{key}.mp3")
        mp3_count += 1

    wav_count = 0
    if LITE.is_dir():
        for key in PENTATONIC_WAV_V8:
            src = LITE / f"{key}v8.wav"
            if src.is_file():
                shutil.copy2(src, wav_v8 / f"{key}v8.wav")
                wav_count += 1

    return mp3_count, wav_count


def main() -> None:
    zip_path = find_zip()
    print(f"Using {zip_path}")

    if TARGET.exists():
        for child in TARGET.iterdir():
            if child.is_file():
                child.unlink()
            elif child.is_dir():
                shutil.rmtree(child)

    total = extract_all(zip_path, TARGET)
    mp3_n, wav_n = build_pentatonic(TARGET)
    (TARGET / "README.md").write_text(README, encoding="utf-8")

    print(f"Extracted {total} files → {TARGET.relative_to(ROOT)}")
    print(f"  pentatonic/: {mp3_n} mp3, wav-v8/: {wav_n} wav")
    print("Done.")


if __name__ == "__main__":
    main()
