#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Reorder SERIES in sketches/index.html by catalog folder index file mtime (newest first).

Sort key per series (first match):
  catalog/{mirror-path}/index.html
  catalog/{mirror-path}/README.md   ← interim until every folder has index.html
  sketches/{hub}/index.html

Within each series, files are sorted newest-first by repo file mtime.

Also updates catalog/README.md Entries table to the same series order.

Run after adding or touching a catalog/sketches index page:

  python3 _scripts/reorder_series_by_index_mtime.py
  python3 _scripts/refresh_catalog.py
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKETCHES_INDEX = ROOT / "sketches" / "index.html"
CATALOG_README = ROOT / "catalog" / "README.md"

FILE_ENTRY_RE = re.compile(
    r"\{name:'((?:\\'|[^'])*)',\s*title:'((?:\\'|[^'])*)',\s*version:(true|false)\}"
)


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

    def sort_key_mtime(self) -> float:
        p = series_catalog_index_path(self.files)
        if p and p.exists():
            return p.stat().st_mtime
        return 0.0

    def serialize(self) -> str:
        lines = [f"  {{\n    name: '{self.name.replace(chr(39), chr(92)+chr(39))}',", "    files: ["]
        for f in self.files:
            lines.append(f.serialize())
        lines.append("    ]")
        lines.append("  },")
        return "\n".join(lines)


def series_catalog_index_path(files: list[FileEntry]) -> Path | None:
    hub = None
    for f in files:
        if f.name.endswith("index.html") and not f.name.startswith("../"):
            hub = f.name
            break
    if not hub:
        for f in files:
            if f.name.endswith("index.html"):
                hub = f.name
                break
    if not hub:
        return None

    if hub.startswith("../catalog/"):
        rel = hub.removeprefix("../")
        p = ROOT / rel
        if p.exists():
            return p
        parent = p.parent
    else:
        parent = ROOT / "catalog" / Path(hub).parent

    for name in ("index.html", "README.md"):
        cand = parent / name
        if cand.exists():
            return cand

    sketch_index = ROOT / "sketches" / hub
    if sketch_index.exists():
        return sketch_index
    return None


def file_repo_path(name: str) -> Path:
    name = name.replace("\\", "/")
    if name.startswith("../"):
        return ROOT / name.removeprefix("../")
    return ROOT / "sketches" / name


def file_mtime(name: str) -> float:
    p = file_repo_path(name)
    try:
        return p.stat().st_mtime if p.is_file() else 0.0
    except OSError:
        return 0.0


def parse_series(html: str) -> list[SeriesBlock]:
    marker = "const SERIES = "
    start = html.index(marker) + len(marker)
    end = html.index("\n];\n\nlet currentFilter")
    body = html[start:end]
    if not body.lstrip().startswith("["):
        raise SystemExit("SERIES block malformed")
    # Keep leading newline/indent — strip() here drops the first block on re-parse.
    inner = body[1:]

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
        files_body = sm.group(2)
        files = [
            FileEntry(n.replace("\\'", "'"), t.replace("\\'", "'"), v == "true")
            for n, t, v in FILE_ENTRY_RE.findall(files_body)
        ]
        blocks.append(SeriesBlock(name, files))
    return blocks


def serialize_series(blocks: list[SeriesBlock]) -> str:
    inner = "\n".join(b.serialize() for b in blocks)
    return f"const SERIES = [\n{inner}\n];"


def reorder_blocks(blocks: list[SeriesBlock]) -> list[SeriesBlock]:
    out: list[SeriesBlock] = []
    for b in sorted(blocks, key=lambda s: s.sort_key_mtime(), reverse=True):
        files = sorted(b.files, key=lambda f: file_mtime(f.name), reverse=True)
        out.append(SeriesBlock(b.name, files))
    return out


def patch_sort_ui(html: str) -> str:
    old = """  const orderedPairs = sortOrder === 'desc'
    ? [...SERIES.entries()].map(([si, s]) => ({ si, s })).reverse()
    : [...SERIES.entries()].map(([si, s]) => ({ si, s }));"""
    new = """  const orderedPairs = sortOrder === 'asc'
    ? [...SERIES.entries()].map(([si, s]) => ({ si, s })).reverse()
    : [...SERIES.entries()].map(([si, s]) => ({ si, s }));"""
    if old in html:
        return html.replace(old, new)
    return html


def catalog_folder_entries() -> list[tuple[str, float, str]]:
    """All catalog project folders, newest first by index file mtime."""
    seen: dict[str, Path] = {}
    for path in list(ROOT.glob("catalog/**/index.html")) + list(
        ROOT.glob("catalog/**/README.md")
    ):
        if path == CATALOG_README:
            continue
        folder = path.parent
        try:
            folder.relative_to(ROOT / "catalog")
        except ValueError:
            continue
        rel = folder.relative_to(ROOT / "catalog").as_posix()
        idx = folder / "index.html"
        key_path = idx if idx.exists() else folder / "README.md"
        if not key_path.exists():
            continue
        if rel in seen:
            existing = seen[rel]
            if key_path == idx or existing.name != "index.html":
                seen[rel] = key_path
        else:
            seen[rel] = key_path

    rows: list[tuple[str, float, str]] = []
    for rel, key_path in seen.items():
        desc = rel.replace("-", " ").replace("/", " · ")
        if "wrong-eclipse" in rel:
            desc = "The Wrong Biennale — The Wrong Eclipse · August 2026 · *Holes in the Sky*"
        elif rel == "the-wrong-biennale":
            desc = "The Wrong Biennale — submissions and opportunities"
        rows.append((rel, key_path.stat().st_mtime, desc))
    rows.sort(key=lambda r: r[1], reverse=True)
    return rows


def update_catalog_readme(blocks: list[SeriesBlock]) -> None:
    if not CATALOG_README.exists():
        return
    text = CATALOG_README.read_text(encoding="utf-8")
    rows_html = [
        f"| [{rel}/](./{rel}/) | {desc} |"
        for rel, _mt, desc in catalog_folder_entries()
    ]

    header = "## Entries"
    if header not in text:
        return
    before, rest = text.split(header, 1)
    rest_lines = rest.split("\n")
    i = 0
    while i < len(rest_lines) and not rest_lines[i].strip().startswith("---"):
        i += 1
    after = "\n".join(rest_lines[i:]) if i < len(rest_lines) else ""
    table = (
        f"{header}\n\n"
        "Ordered **newest first** by catalog folder index file mtime "
        "(see `_scripts/reorder_series_by_index_mtime.py`).\n\n"
        "| Folder | Description |\n"
        "|--------|-------------|\n"
        + "\n".join(rows_html)
        + "\n"
    )
    CATALOG_README.write_text(before + table + after, encoding="utf-8")


def main() -> None:
    html = SKETCHES_INDEX.read_text(encoding="utf-8")
    blocks = parse_series(html)
    if not blocks:
        raise SystemExit("No SERIES blocks parsed")
    if len(blocks) < 30:
        raise SystemExit(f"SERIES parse suspiciously short ({len(blocks)} blocks) — aborting")

    reordered = reorder_blocks(blocks)
    new_series = serialize_series(reordered)

    # Round-trip guard — never write a partial SERIES
    reparsed = parse_series(new_series + "\n\nlet currentFilter = 'all';")
    if len(reparsed) != len(blocks):
        raise SystemExit(
            f"SERIES round-trip failed ({len(blocks)} -> {len(reparsed)} blocks) — aborting"
        )

    marker = "const SERIES = "
    start = html.index(marker)
    end = html.index("\n];\n\nlet currentFilter") + len("\n];")
    html = html[:start] + new_series + html[end:]

    html = patch_sort_ui(html)
    SKETCHES_INDEX.write_text(html, encoding="utf-8")
    update_catalog_readme(reordered)

    print(f"Reordered {len(reordered)} series in {SKETCHES_INDEX.relative_to(ROOT)}")
    top = reordered[0]
    p = series_catalog_index_path(top.files)
    ts = datetime.fromtimestamp(p.stat().st_mtime).isoformat(sep=" ", timespec="seconds") if p else "?"
    print(f"  Newest: {top.name}")
    print(f"  Index:  {p.relative_to(ROOT) if p else '?'} · {ts}")


if __name__ == "__main__":
    main()
