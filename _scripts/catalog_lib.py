#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Shared helpers for data/catalog.json: SERIES parse, merge works, local file artifacts."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "sketches" / "index.html"

# src="..." href="..." - capture local refs (exclude obvious non-file schemes)
LOCAL_ATTR_RE = re.compile(
    r"""(?:src|href)\s*=\s*["']([^"'#?]+)["']""",
    re.I,
)


def extract_bracket_array(html: str, marker: str) -> str:
    pos = html.index(marker) + len(marker)
    while pos < len(html) and html[pos] in " \t\n":
        pos += 1
    if pos >= len(html) or html[pos] != "[":
        raise ValueError("Expected [ after " + marker)
    start = pos
    depth = 0
    j = start
    while j < len(html):
        c = html[j]
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                return html[start : j + 1]
        j += 1
    raise ValueError("Unbalanced [ in SERIES array")


def parse_series_from_index(html: str) -> list[dict[str, list[str]]]:
    if "const SERIES = " not in html:
        raise SystemExit("Could not find SERIES block in sketches/index.html")
    body = extract_bracket_array(html, "const SERIES = ")

    chunks = re.split(r"\n  \{\n    name: ", body)
    out: list[dict[str, list[str]]] = []
    for raw in chunks[1:]:
        sm = re.match(r"'([^']*)',\s*\n\s*files:\s*\[", raw, re.DOTALL)
        if not sm:
            continue
        series_name = sm.group(1)
        rest = raw[sm.end() :]
        fm = re.search(r"^([\s\S]*?)\n    \],\s*\n  \}", rest)
        if not fm:
            fm = re.search(r"^([\s\S]*?)\n    \],\s*\n  \},", rest)
        files_body = fm.group(1) if fm else rest
        filenames = re.findall(r"\{name:\s*'([^']*)'", files_body)
        out.append({"series": series_name, "files": filenames})

    if not out:
        raise SystemExit("Parsed zero series - check index.html format.")
    return out


def slug_from_install_path(path: str) -> str:
    base = Path(path).stem
    return re.sub(r"[^a-zA-Z0-9_-]+", "-", base).strip("-").lower()


def installation_dict_from_work(w: dict) -> dict:
    site = w.get("site") or {}
    inst = site.get("installation")
    if not inst:
        raise ValueError("work has no installation")
    path = inst["path"]
    slug = slug_from_install_path(path)
    return {
        "slug": slug,
        "title": w["dublin_core"]["title"],
        "path": path,
        "homepage": bool(inst.get("homepage")),
        "date": (w.get("dublin_core") or {}).get("date") or "",
        "tech": list(site.get("tech") or []),
    }


def extract_installations_from_works(works: list[dict]) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for w in works:
        site = w.get("site") or {}
        if not site.get("installation"):
            continue
        row = installation_dict_from_work(w)
        key = row["path"]
        if key not in seen:
            seen.add(key)
            out.append(row)
    return out


def installation_dict_from_path(path: str) -> dict:
    """Minimal installation row for HTML under installations/ not yet in works[]."""
    slug = slug_from_install_path(path)
    stem = Path(path).stem.replace("-", " ").replace("_", " ").strip() or slug
    title = stem[:1].upper() + stem[1:] if stem else slug
    return {
        "slug": slug,
        "title": title,
        "path": path,
        "homepage": False,
        "date": "",
        "tech": [],
    }


def _skip_installation_html(rel_posix: str) -> bool:
    """Listing page and iframe-only helpers are not catalog works."""
    if rel_posix == "installations/index.html":
        return True
    base = Path(rel_posix).name
    if base.endswith("-artwork.html"):
        return True
    return False


def merge_installation_sources(works: list[dict], root: Path) -> list[dict]:
    """
    Rows with full metadata from works[]; plus any installations/*.html on disk
    not yet represented in works (minimal defaults until the next merge).
    """
    by_path: dict[str, dict] = {}
    for row in extract_installations_from_works(works):
        if _skip_installation_html(row["path"]):
            continue
        by_path[row["path"]] = row
    inst_dir = root / "installations"
    if inst_dir.is_dir():
        for p in sorted(inst_dir.glob("*.html")):
            rel = p.relative_to(root).as_posix()
            if _skip_installation_html(rel):
                continue
            if rel not in by_path:
                by_path[rel] = installation_dict_from_path(rel)
    return sorted(by_path.values(), key=lambda r: r["path"])


def la_object(canonical_base: str, work_id: str, label: str) -> dict:
    return {
        "@context": "https://linked.art/ns/v1/linked-art.json",
        "id": f"{canonical_base}/#work/{work_id}",
        "type": "HumanMadeObject",
        "_label": label,
        "classified_as": [
            {
                "id": "http://vocab.getty.edu/aat/300375748",
                "type": "Type",
                "_label": "digital art",
            }
        ],
    }


def dc_shell(
    title: str,
    identifier: str,
    date: str | None = None,
    desc: str = "",
) -> dict:
    # identifier = stable URN (work id); catalog_number set by assign_catalog_numbers()
    return {
        "title": title,
        "creator": "Mark Walhimer",
        "date": date or "",
        "description": desc,
        "identifier": identifier,
        "type": "InteractiveResource",
        "format": "text/html",
        "language": "en",
        "relation": "",
    }


def _parse_catalog_seq(catalog_number: str | None) -> int | None:
    if not catalog_number or not str(catalog_number).strip().upper().startswith("WS-"):
        return None
    rest = str(catalog_number).strip()[3:].lstrip("-")
    try:
        return int(rest)
    except ValueError:
        return None


def assign_catalog_numbers(works: list[dict]) -> None:
    """
    Series-independent accession numbers: WS-000001, WS-000002, ...
    Preserves existing catalog_number on refresh; new works get max+1.
    identifier (URN) stays separate in dublin_core.identifier.
    """
    max_seq = 0
    for w in works:
        dc = w.get("dublin_core") or {}
        n = _parse_catalog_seq(dc.get("catalog_number"))
        if n is not None:
            max_seq = max(max_seq, n)
    for w in works:
        dc = w.setdefault("dublin_core", {})
        existing = (dc.get("catalog_number") or "").strip()
        if existing and _parse_catalog_seq(existing) is not None:
            continue
        max_seq += 1
        dc["catalog_number"] = f"WS-{max_seq:06d}"


def build_works(
    installations: list[dict],
    sketch_series: list[dict],
    canonical_base: str,
) -> list[dict]:
    sketch_by_file: dict[str, tuple[str, str]] = {}
    for block in sketch_series:
        sname = block["series"]
        for f in block.get("files") or []:
            sketch_by_file[f] = (sname, f)

    used_sketch_files: set[str] = set()
    works: list[dict] = []

    for inst in installations:
        path = inst["path"]
        slug = inst.get("slug") or slug_from_install_path(path)
        title = inst["title"]
        wid = f"urn:walhimer:work:{slug}"
        base_file = Path(path).name
        sketch_name = base_file
        site: dict = {
            "installation": {
                "path": path,
                "homepage": bool(inst.get("homepage")),
            },
            "tech": list(inst.get("tech") or []),
        }
        if sketch_name in sketch_by_file:
            series, fn = sketch_by_file[sketch_name]
            site["sketch"] = {"series": series, "file": fn}
            used_sketch_files.add(fn)
            if series.strip().lower() == "audioscape":
                site["soundscape"] = {
                    "sketch_file": fn,
                    "note": "Sound-oriented sketch; may also appear under /audio/ if deployed separately.",
                }

        surfaces = ["installation"]
        if "sketch" in site:
            surfaces.append("sketch")
        if site.get("soundscape"):
            surfaces.append("soundscape")
        site["surfaces"] = surfaces

        works.append(
            {
                "id": wid,
                "dublin_core": dc_shell(title, wid, date=inst.get("date")),
                "linked_art": la_object(canonical_base, slug, title),
                "site": site,
            }
        )

    for block in sketch_series:
        series = block["series"]
        for fn in block.get("files") or []:
            if fn in used_sketch_files:
                continue
            stem = Path(fn).stem
            sid = re.sub(r"[^a-zA-Z0-9_-]+", "-", stem).strip("-").lower() or "work"
            wid = f"urn:walhimer:sketch:{series}:{sid}"[:120]
            title = fn.replace(".html", "").replace("_", " ")
            site: dict = {
                "surfaces": ["sketch"],
                "sketch": {"series": series, "file": fn},
            }
            if series.strip().lower() == "audioscape":
                site["surfaces"] = ["sketch", "soundscape"]
                site["soundscape"] = {
                    "sketch_file": fn,
                    "note": "Sound-oriented sketch; may also appear under /audio/ if deployed separately.",
                }
            works.append(
                {
                    "id": wid,
                    "dublin_core": dc_shell(title, wid),
                    "linked_art": la_object(canonical_base, f"{series}-{sid}"[:80], title),
                    "site": site,
                }
            )

    return works


def merge_work_metadata(prior: dict | None, new: dict) -> dict:
    """Prefer non-empty Dublin Core / linked_art from prior (user edits)."""
    if not prior:
        return new
    out = json.loads(json.dumps(new))
    pdc = prior.get("dublin_core") or {}
    ndc = out.get("dublin_core") or {}
    for k, v in pdc.items():
        if v not in (None, ""):
            ndc[k] = v
    out["dublin_core"] = ndc
    if prior.get("linked_art") and isinstance(prior["linked_art"], dict):
        pla = prior["linked_art"]
        if any(pla.get(x) for x in ("_label", "classified_as")):
            out["linked_art"] = {**out.get("linked_art", {}), **pla}
    ps = prior.get("site") or {}
    ns = out.get("site") or {}
    if ps.get("tech"):
        ns["tech"] = list(ps["tech"])
    if ps.get("soundscape"):
        ns["soundscape"] = {**ns.get("soundscape", {}), **ps["soundscape"]}
    out["site"] = ns
    return out


def index_works_by_id_and_file(old_works: list[dict]) -> tuple[dict[str, dict], dict[str, dict]]:
    by_id: dict[str, dict] = {}
    by_file: dict[str, dict] = {}
    for w in old_works:
        wid = w.get("id")
        if wid:
            by_id[wid] = w
        sk = (w.get("site") or {}).get("sketch")
        if sk and sk.get("file"):
            by_file[sk["file"]] = w
    return by_id, by_file


def merge_catalog_works(old_works: list[dict], new_works: list[dict]) -> list[dict]:
    by_id, by_file = index_works_by_id_and_file(old_works)
    merged: list[dict] = []
    for nw in new_works:
        key = nw.get("id")
        prior = by_id.get(key)
        if not prior:
            sk = (nw.get("site") or {}).get("sketch")
            if sk and sk.get("file"):
                prior = by_file.get(sk["file"])
        merged.append(merge_work_metadata(prior, nw))
    return merged


def collect_artifacts(root: Path, entry_rel: str) -> dict:
    """
    Repo-relative paths that belong to this entry (HTML + local JS/CSS/images).
    Narrative bundles: sketches/foo/index.html includes every file under sketches/foo/.
    """
    entry_rel = entry_rel.replace("\\", "/")
    out: dict = {"repo_paths": [], "external_urls": []}
    full = root / entry_rel
    if not full.exists():
        out["repo_paths"] = [entry_rel]
        return out

    p = Path(entry_rel)
    # Whole subtree for .../something/index.html (e.g. tezos-early-works)
    if p.name == "index.html" and len(p.parts) >= 3:
        folder = root / p.parent
        if folder.is_dir():
            acc: list[str] = []
            for f in sorted(folder.rglob("*")):
                if f.is_file():
                    acc.append(f.relative_to(root).as_posix())
            out["repo_paths"] = acc
            return out

    seen: set[str] = set()
    paths: list[str] = [entry_rel]
    seen.add(entry_rel)

    try:
        text = full.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        out["repo_paths"] = [entry_rel]
        return out

    base = full.parent
    root_res = root.resolve()

    for m in LOCAL_ATTR_RE.finditer(text):
        u = m.group(1).strip()
        if u.startswith(
            ("http://", "https://", "//", "data:", "mailto:", "javascript:")
        ):
            if u.startswith("http"):
                out["external_urls"].append(u.split("#")[0])
            continue
        u = u.split("?")[0].strip()
        if not u or u.startswith("#"):
            continue
        cand = (base / u).resolve()
        try:
            cand.relative_to(root_res)
        except ValueError:
            continue
        if cand.is_file():
            rp = cand.relative_to(root).as_posix()
            if rp not in seen:
                seen.add(rp)
                paths.append(rp)

    out["repo_paths"] = sorted(set(paths))
    out["external_urls"] = sorted(set(out["external_urls"]))
    return out


def attach_artifacts_to_works(root: Path, works: list[dict]) -> None:
    for w in works:
        site = w.get("site") or {}
        arts: list[dict] = []

        sk = site.get("sketch")
        if sk and sk.get("file"):
            rel = f"sketches/{sk['file']}"
            arts.append(collect_artifacts(root, rel))

        inst = site.get("installation")
        if inst and inst.get("path"):
            arts.append(collect_artifacts(root, inst["path"]))

        if arts:
            # Single bundle if only sketch or only installation; else label
            if len(arts) == 1:
                w["artifacts"] = arts[0]
            else:
                w["artifacts"] = {"sketch_entry": arts[0], "installation_entry": arts[1]}


def soundscapes_summary(works: list[dict], canonical_base: str) -> dict:
    entries: list[dict] = []
    for w in works:
        site = w.get("site") or {}
        if "soundscape" not in site.get("surfaces", []) and not site.get("soundscape"):
            continue
        sk = site.get("sketch") or {}
        url = (
            f"{canonical_base}/sketches/{sk['file']}" if sk.get("file") else None
        )
        entries.append(
            {
                "work_id": w.get("id"),
                "catalog_number": (w.get("dublin_core") or {}).get("catalog_number"),
                "title": (w.get("dublin_core") or {}).get("title"),
                "sketch_file": sk.get("file"),
                "url": url,
            }
        )
    return {
        "note": "Sketches tagged as soundscapes (Audioscape series). Add site.soundscape.public_url when mirrored on /audio/.",
        "entries": entries,
    }
