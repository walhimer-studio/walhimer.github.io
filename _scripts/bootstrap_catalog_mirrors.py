#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create catalog/{path}/README.md mirrors for every SERIES block in sketches/index.html
(Wrong Eclipse pattern), register catalog links in SERIES, then run reorder + refresh.

Skips overwriting rich existing READMEs (e.g. holes-in-the-sky opportunity docs).
Adds minimal {artwork}.md stubs when a primary HTML entry exists and no statement yet.

  python3 _scripts/bootstrap_catalog_mirrors.py
  python3 _scripts/reorder_series_by_index_mtime.py
  python3 _scripts/refresh_catalog.py
  python3 _scripts/check_self_contained.py
"""

from __future__ import annotations

import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKETCHES_INDEX = ROOT / "sketches" / "index.html"

FILE_ENTRY_RE = re.compile(
    r"\{name:'((?:\\'|[^'])*)',\s*title:'((?:\\'|[^'])*)',\s*version:(true|false)\}"
)

AUTO_MARKER = "<!-- catalog-mirror: auto -->"

# Authoritative catalog/{path}/ for each SERIES name (sketches/index.html)
SERIES_CATALOG_PATH: dict[str, str] = {
    "Machine DNA — studio system": "machine-dna-studio",
    "The Wrong Biennale · The Wrong Eclipse · August 2026": "the-wrong-biennale/the-wrong-eclipse-august-2026",
    "BYOB CDMX": "byob-cdmx",
    "ACTZ — Myths & Legends June 2026": "actz-june-myths-legends-2026",
    "Loop Art Critique Alumni Show #3 July 2026": "loop-art-critique-alumni-show-2026",
    "Artblocks 2026": "artblocks-2026",
    "The 7th VH AWARD 2026": "vhawards-2026",
    "Async Museum": "async-museums",
    "ArtistCommons": "artist-commons",
    "Miradas Tangentes, February 2026": "miradas-tangentes-2026",
    "Surrender Machines": "surrender",
    "Light Art": "light-art",
    "Tezos / Objkt — archive": "tezos-early-works",
    "Machine DNA · Lumen Prize 2026 (project: Machine Aesthetic · frozen submission)": "2026-lumen-prize-machine-aesthetic",
    "Prix Ars Electronica 2026": "2026-ars-electronica",
    "Machine DNA · Loop Art Critique 2026 (project: Machine Aesthetic · frozen submission)": "loop-art-critique-2026",
    "Technical": "technical",
    "Emergent Discs": "emergent-discs",
    "Moon & Walking": "moon-walking",
    "Bloom": "bloom",
    "Machine DNA · Loop workspace (project: Machine Aesthetic)": "loop-machine-aesthetic",
    "Loop Snippets": "loop-snippets",
    "Machine DNA — early sketches": "machine-dna-early-sketches",
    "Living Commons": "living-commons",
    "Traveling Landscape": "traveling-landscape",
    "Convergence Era": "convergence-era",
    "Three.js / LVE": "three-js-lve",
    "Numbered Pieces": "numbered-pieces",
    "Word Art / Text": "word-art-text",
    "Cubes": "cubes",
    "Shelves": "shelves",
    "Reading the Sky": "reading-the-sky",
    "Audioscape": "audioscape",
    "Gradients & Color": "gradients-color",
    "Mint / NFT": "mint-nft",
    "Binary Partitions": "binary-partitions",
    "Miscellaneous": "miscellaneous",
    "Spatial Orchestrator": "spatial-orchestrator",
    "Breathing Columns": "breathing-columns",
    "April 25": "april-25",
}

# Auto-generated mirrors placed under wrong nested paths (redirect stubs) — remove on re-run
ORPHAN_CATALOG_DIRS = [
    "catalog/loop-snippets/loop-machine-aesthetic",
    "catalog/emergent-dna",
    "catalog/technical/technical-drawing-chronicle",
    "catalog/light-art-023",
    "catalog/April 25",
    "catalog/loop-art-critique-2026/webcam-point-cloud",
]

# Primary artwork HTML → catalog {artwork}.md (when missing)
ARTWORK_STUBS: dict[str, list[tuple[str, str, dict[str, str]]]] = {
    "the-wrong-biennale/the-wrong-eclipse-august-2026": [],  # holes-in-the-sky.md exists
    "actz-june-myths-legends-2026": [
        (
            "surrender-machine-dna",
            "Surrender Machine — Machine DNA · Lifeline",
            {
                "seed": "TBD",
                "species": "Surrender Machines",
                "mode": "Surrender / mirror",
                "bodies": "browser",
            },
        ),
        (
            "gravity-sliders",
            "Surrender Machine — Gravity · Sliders",
            {
                "seed": "1909113409",
                "species": "Surrender Machines",
                "mode": "Surrender / mirror",
                "bodies": "browser",
            },
        ),
    ],
    "2026-lumen-prize-machine-aesthetic": [
        (
            "seed-77823-rooms",
            "Seed 77823 — Rooms walkthrough",
            {
                "seed": "77823",
                "species": "Surrender Machines / Machine Aesthetic (frozen project)",
                "mode": "Surrender / mirror",
                "bodies": "browser · room walkthrough",
            },
        ),
    ],
}


@dataclass
class FileEntry:
    name: str
    title: str
    version: bool

    def serialize(self, indent: str = "      ") -> str:
        v = "true" if self.version else "false"
        name = self.name.replace("'", "\\'")
        title = self.title.replace("'", "\\'")
        return f"{indent}{{name:'{name}', title:'{title}', version:{v}}},"


@dataclass
class SeriesBlock:
    name: str
    files: list[FileEntry]

    def serialize(self) -> str:
        lines = [f"  {{\n    name: '{self.name.replace(chr(39), chr(92)+chr(39))}',", "    files: ["]
        for f in self.files:
            lines.append(f.serialize())
        lines.append("    ]")
        lines.append("  },")
        return "\n".join(lines)


def parse_series(html: str) -> list[SeriesBlock]:
    marker = "const SERIES = "
    start = html.index(marker) + len(marker)
    end = html.index("\n];\n\nlet currentFilter")
    inner = html[start:end][1:]
    chunks = re.split(r"\n  \{\n    name: ", inner)
    blocks: list[SeriesBlock] = []
    for raw in chunks:
        if not raw.strip():
            continue
        sm = re.match(
            r"'((?:\\'|[^'])*)',\s*\n\s*files:\s*\[([\s\S]*?)\n    \]\s*\n  \},?",
            raw,
        )
        if not sm:
            continue
        name = sm.group(1).replace("\\'", "'")
        files = [
            FileEntry(n.replace("\\'", "'"), t.replace("\\'", "'"), v == "true")
            for n, t, v in FILE_ENTRY_RE.findall(sm.group(2))
        ]
        blocks.append(SeriesBlock(name, files))
    return blocks


def serialize_series(blocks: list[SeriesBlock]) -> str:
    return "const SERIES = [\n" + "\n".join(b.serialize() for b in blocks) + "\n];"


def resolve_catalog_path(block: SeriesBlock) -> str:
    path = SERIES_CATALOG_PATH.get(block.name)
    if not path:
        raise SystemExit(f"No catalog path mapped for series: {block.name!r}")
    return path


def infer_sketch_readme(catalog_rel: str, files: list[FileEntry]) -> str:
    for f in files:
        if not f.name.startswith("../") and f.name.endswith("README.md"):
            return f"`sketches/{f.name}`"
    flat_roots = {
        "living-commons",
        "traveling-landscape",
        "convergence-era",
        "three-js-lve",
        "numbered-pieces",
        "word-art-text",
        "cubes",
        "shelves",
        "reading-the-sky",
        "audioscape",
        "gradients-color",
        "mint-nft",
        "binary-partitions",
        "miscellaneous",
        "spatial-orchestrator",
        "breathing-columns",
        "machine-dna-early-sketches",
        "loop-snippets",
    }
    if catalog_rel in flat_roots:
        return f"`sketches/` (files listed in catalog series **{catalog_rel}**)"
    return f"`sketches/{catalog_rel}/`"


def studio_direction_link(catalog_rel: str) -> str:
    depth = catalog_rel.count("/") + 1
    prefix = "../" * depth
    return (
        f"**Studio direction:** [Artwork pipeline](https://mark-walhimer.com/practice/artwork-pipeline.html)"
        f" · [{prefix}STUDIO-DIRECTION.md]({prefix}STUDIO-DIRECTION.md)"
    )


def live_hub_url(catalog_rel: str, files: list[FileEntry]) -> str | None:
    for f in files:
        if f.name.startswith("../"):
            continue
        if f.name.endswith("index.html"):
            return f"https://mark-walhimer.com/sketches/{f.name}"
    return None


def readme_body(block: SeriesBlock, catalog_rel: str) -> str:
    frozen = "frozen submission" in block.name.lower() or "frozen" in block.name.lower()
    hub_url = live_hub_url(catalog_rel, block.files)
    sketch_ref = infer_sketch_readme(catalog_rel, block.files)

    lines = [
        AUTO_MARKER,
        f"# {block.name}",
        "",
        studio_direction_link(catalog_rel),
        "",
        "| Field | Value |",
        "|-------|--------|",
        f"| Series | {block.name} |",
        f"| Catalog path | `catalog/{catalog_rel}/` |",
        f"| WIP sketches | {sketch_ref} |",
    ]
    if frozen:
        lines.append("| Status | **Frozen submission** — project title unchanged; built on Machine DNA where applicable |")
    if hub_url:
        lines.extend(["", "## Live URL (hub)", "", hub_url])
    lines.extend(
        [
            "",
            "## Publish checklist",
            "",
            "1. Update this README and any `{artwork}.md` in this folder",
            "2. WIP under matching `sketches/{path}/`",
            "3. Register catalog links in `sketches/index.html` SERIES",
            "4. `python3 _scripts/reorder_series_by_index_mtime.py`",
            "5. `python3 _scripts/refresh_catalog.py`",
            "6. `python3 _scripts/check_self_contained.py` (full repo, exit 0)",
            "",
            "## Machine DNA (fill in for new work)",
            "",
            "| Field | Value |",
            "|-------|--------|",
            "| Species | TBD |",
            "| Seed | TBD |",
            "| Mode | votive / witness · or surrender / mirror |",
            "| Bodies | browser · OF · PD · install · … |",
            "",
        ]
    )
    return "\n".join(lines)


def artwork_md_body(title: str, catalog_rel: str, fields: dict[str, str]) -> str:
    depth = catalog_rel.count("/") + 1
    prefix = "../" * depth
    return f"""{AUTO_MARKER}
# {title}

| Field | Value |
|-------|--------|
| Title | {title} |
| Studio pipeline | [Artwork pipeline](https://mark-walhimer.com/practice/artwork-pipeline.html) · [{prefix}STUDIO-DIRECTION.md]({prefix}STUDIO-DIRECTION.md) |
| Species | {fields.get('species', 'TBD')} |
| Seed | {fields.get('seed', 'TBD')} |
| Mode | **{fields.get('mode', 'TBD')}** |
| Bodies | {fields.get('bodies', 'browser')} |

## WIP

`sketches/{catalog_rel}/` — see matching HTML in catalog SERIES block.
"""


def is_catalog_statement_entry(f: FileEntry) -> bool:
    return f.name.startswith("../catalog/") and "catalog statement" in f.title


def is_artwork_statement_entry(f: FileEntry) -> bool:
    return f.name.startswith("../catalog/") and f.name.endswith(".md") and "artwork statement" in f.title


def patch_series_files(block: SeriesBlock, catalog_rel: str) -> SeriesBlock:
    files = [
        f
        for f in block.files
        if not is_catalog_statement_entry(f) and not is_artwork_statement_entry(f)
    ]
    readme_catalog = f"../catalog/{catalog_rel}/README.md"
    title_catalog = f"{block.name} — catalog statement"
    files.insert(0, FileEntry(readme_catalog, title_catalog, False))

    for slug, art_title, fields in ARTWORK_STUBS.get(catalog_rel, []):
        art_path = ROOT / "catalog" / catalog_rel / f"{slug}.md"
        if not art_path.exists() or (
            art_path.exists() and AUTO_MARKER in art_path.read_text(encoding="utf-8")
        ):
            write_if_stub(art_path, artwork_md_body(art_title, catalog_rel, fields))
        files.insert(
            1,
            FileEntry(
                f"../catalog/{catalog_rel}/{slug}.md",
                f"{art_title} — artwork statement",
                False,
            ),
        )
    return SeriesBlock(block.name, files)


def write_if_stub(path: Path, body: str) -> bool:
    if path.exists():
        text = path.read_text(encoding="utf-8")
        if AUTO_MARKER not in text and len(text.splitlines()) > 18:
            return False
        if text.strip() == body.strip():
            return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body, encoding="utf-8")
    return True


def cleanup_orphan_mirrors() -> None:
    import shutil

    for rel in ORPHAN_CATALOG_DIRS:
        path = ROOT / rel
        if not path.exists():
            continue
        readme = path / "README.md"
        if readme.exists() and AUTO_MARKER in readme.read_text(encoding="utf-8"):
            shutil.rmtree(path)
            print(f"Removed orphan mirror: {rel}")


def patch_search(html: str) -> str:
    old = "if (q && !f.title.toLowerCase().includes(q) && !f.name.toLowerCase().includes(q)) show = false;"
    new = "if (q && !s.name.toLowerCase().includes(q) && !f.title.toLowerCase().includes(q) && !f.name.toLowerCase().includes(q)) show = false;"
    if old in html and new not in html:
        html = html.replace(old, new)
    return html


def main() -> int:
    cleanup_orphan_mirrors()
    html = SKETCHES_INDEX.read_text(encoding="utf-8")
    blocks = parse_series(html)
    if len(blocks) < 30:
        print(f"Abort: only {len(blocks)} SERIES blocks parsed", file=sys.stderr)
        return 1

    created_readmes = 0
    updated_blocks: list[SeriesBlock] = []

    for block in blocks:
        catalog_rel = resolve_catalog_path(block)
        readme_path = ROOT / "catalog" / catalog_rel / "README.md"
        if write_if_stub(readme_path, readme_body(block, catalog_rel)):
            created_readmes += 1
        updated_blocks.append(patch_series_files(block, catalog_rel))

    new_series = serialize_series(updated_blocks)
    start = html.index("const SERIES = ")
    end = html.index("\n];\n\nlet currentFilter") + len("\n];")
    html = html[:start] + new_series + html[end:]
    html = patch_search(html)
    SKETCHES_INDEX.write_text(html, encoding="utf-8")

    print(f"Catalog mirrors: wrote/updated {created_readmes} README stubs under catalog/")
    print(f"Patched SERIES in {SKETCHES_INDEX.relative_to(ROOT)}")

    for cmd in (
        ["python3", "_scripts/reorder_series_by_index_mtime.py"],
        ["python3", "_scripts/refresh_catalog.py"],
        ["python3", "_scripts/check_self_contained.py"],
    ):
        print(f"\n→ {' '.join(cmd)}")
        subprocess.run(cmd, cwd=ROOT, check=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
