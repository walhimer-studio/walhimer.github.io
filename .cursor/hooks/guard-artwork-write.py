#!/usr/bin/env python3
"""Block agent Write/StrReplace/Delete on protected paths unless ALLOW_EDIT lists the path."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
_SCRIPTS = Path(__file__).resolve().parents[2] / "_scripts"
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))

from artwork_guard_common import (
    load_allowed,
    permission_allow,
    permission_deny,
    rel_path,
    is_protected,
    target_exists,
)

from machine_dna_rules import (  # noqa: E402
    DNA_FORBIDDEN_IN_SKETCHES,
    ONE_ROW_V3,
    ROOT,
    one_row_v3_blob_errors,
    seed_rule_errors,
)

FORBIDDEN_PORTRAIT_SNIPPETS = (
    "fetch(",
    "ART_CORE",
    "document.write(",
    "<iframe",
)

# Machine DNA — see .cursor/MACHINE_DNA_CANON.md (shared with check_machine_dna.py)

def check_machine_dna(rel: str, text: str) -> str | None:
    if not rel.startswith("sketches/") or not rel.endswith(".html"):
        return None
    for token in DNA_FORBIDDEN_IN_SKETCHES:
        if token in text:
            return token
    if "new MediaRecorder" in text and "CanvasRecorder" not in text:
        return "inline MediaRecorder without CanvasRecorder"
    if "function updateLifeline" in text and "LIFESPAN_MS" not in text:
        return "updateLifeline without LIFESPAN_MS"
    return None


def resulting_text(rel: str, tool_name: str, tool_input: dict) -> str:
    """The whole file as it will read after this write, so fragments are judged in context."""
    if tool_name == "Write":
        return str(tool_input.get("contents") or tool_input.get("content") or "")
    path = ROOT / rel
    try:
        current = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        current = ""
    old = str(tool_input.get("old_string") or tool_input.get("oldString") or "")
    new = str(tool_input.get("new_string") or tool_input.get("newString") or "")
    if not old:
        return current
    if tool_input.get("replace_all") or tool_input.get("replaceAll"):
        return current.replace(old, new)
    return current.replace(old, new, 1)


def check_portrait_content(rel: str, text: str) -> str | None:
    if not rel.endswith("_portrait.html"):
        return None
    lowered = text
    for snippet in FORBIDDEN_PORTRAIT_SNIPPETS:
        if snippet.lower() in lowered.lower():
            return snippet
    return None


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        if os.environ.get("CURSOR_HOOK_FAIL_CLOSED") == "1":
            permission_deny("Hook parse error.", "preToolUse hook could not parse stdin JSON.")
        permission_allow()

    tool_name = str(payload.get("tool_name") or payload.get("toolName") or "")
    if tool_name not in {"Write", "StrReplace", "Delete"}:
        permission_allow()

    tool_input = payload.get("tool_input") or payload.get("toolInput") or {}
    if isinstance(tool_input, str):
        try:
            tool_input = json.loads(tool_input)
        except json.JSONDecodeError:
            tool_input = {}

    path_raw = (
        tool_input.get("path")
        or tool_input.get("file_path")
        or tool_input.get("filePath")
        or ""
    )
    if not path_raw:
        permission_allow()

    rel = rel_path(str(path_raw))
    allowed = load_allowed()

    if not is_protected(rel):
        permission_allow()

    # New files are not exempt: creating one needs the same ALLOW_EDIT entry and
    # user approval as changing or deleting existing work.
    is_new_file = tool_name == "Write" and not target_exists(rel)

    if rel not in allowed:
        verb = "Deleting" if tool_name == "Delete" else "Creating" if is_new_file else "Changing"
        permission_deny(
            f"Blocked: {rel} is not in .cursor/ALLOW_EDIT.",
            (
                f"{verb} protected file {rel} denied. "
                "The user must add this exact path to .cursor/ALLOW_EDIT (one path per line) "
                "and send AUTHORIZE EDIT @path: exact change. "
                "New files are not exempt."
            ),
        )

    # Canon checks apply to authorized edits and to new files alike.
    content = tool_input.get("contents") or tool_input.get("content") or ""
    new_string = tool_input.get("new_string") or tool_input.get("newString") or ""
    blob = f"{content}\n{new_string}"
    hit = check_portrait_content(rel, blob)
    if hit:
        permission_deny(
            f"Portrait file blocked: forbidden `{hit}` (copy+paste workflow only).",
            (
                f"Edit to {rel} denied: contains `{hit}`. "
                "Use copy+paste from template starter — no fetch/iframe/runtime art load. "
                "See docs/wall-screen-edition/templates/README.md"
            ),
        )
    dna_hit = check_machine_dna(rel, blob)
    if dna_hit:
        permission_deny(
            f"Machine DNA violation: `{dna_hit}`.",
            (
                f"Edit to {rel} denied: `{dna_hit}`. "
                "See docs/SPEC-LOCK.md and .cursor/MACHINE_DNA_CANON.md"
            ),
        )
    if tool_name != "Delete":
        seed_errors = seed_rule_errors(rel, resulting_text(rel, tool_name, tool_input))
        if seed_errors:
            permission_deny(
                "Machine DNA violation: seeded piece without the canonical Rand.",
                (
                    f"Edit to {rel} denied. " + " ".join(seed_errors) + " "
                    "See Machine-DNA docs/SPEC.md and docs/SPEC-LOCK.md."
                ),
            )
    if rel == ONE_ROW_V3:
        incoming = tool_input.get("new_string") or tool_input.get("newString") or ""
        check_blob = incoming if tool_name == "StrReplace" and incoming else blob
        v3_hit = one_row_v3_blob_errors(check_blob)
        if v3_hit:
            permission_deny(
                f"SPEC-LOCK violation: `{v3_hit}`.",
                (
                    f"Edit to {rel} denied: `{v3_hit}`. "
                    "See docs/SPEC-LOCK.md — no viewport canvas, no scale wrappers."
                ),
            )
    permission_allow()


if __name__ == "__main__":
    main()
