#!/usr/bin/env python3
"""Block shell commands that write to protected paths unless ALLOW_EDIT lists the path."""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from artwork_guard_common import (
    load_allowed,
    permission_allow,
    permission_deny,
    rel_path,
    is_protected,
)

# Shell writes: redirects, tee, cp/mv, in-place sed, Python/Node file writes.
WRITE_INDICATOR = re.compile(
    r"""
    >>?                               |  # shell redirect
    \btee\s                           |  # tee
    \bcp\s                            |  # copy into tree
    \bmv\s                            |  # move into tree
    \bsed\s+-(?:i(?:\s+|[\'"])?)      |  # sed -i
    \.write_text\s*\(                 |  # Path.write_text(
    \.write_bytes\s*\(                |
    open\s*\([^)]*[\'"]w              |  # open(..., "w")
    shutil\.(?:copy|move)\s*\(        |
    \bos\.replace\s*\(                |
    \bcat\s+>                         |
    \bdd\s+.*\bof=
    """,
    re.I | re.X,
)

REDIRECT_RE = re.compile(
    r'>>?\s*(?:'
    r'([\'"])([^\1]+)\1'  # quoted path
    r'|'
    r'([^\s|;&<>]+)'  # unquoted path
    r')'
)

QUOTED_PATH_RE = re.compile(r'''['"]([^'"]+)['"]''')

PROTECTED_IN_TEXT = re.compile(
    r"(?:sketches/|installations/|machine-aesthetic/|Palm/)[^\s'\"|;&<>]+"
)


def extract_paths(command: str) -> set[str]:
    paths: set[str] = set()

    for match in REDIRECT_RE.finditer(command):
        raw = match.group(2) or match.group(3) or ""
        if raw:
            paths.add(raw)

    for match in QUOTED_PATH_RE.finditer(command):
        raw = match.group(1)
        if raw and ("/" in raw or raw.startswith(("sketches/", "installations/", "machine-aesthetic/", "Palm/"))):
            paths.add(raw)

    for match in PROTECTED_IN_TEXT.finditer(command):
        paths.add(match.group(0))

    return paths


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        if os.environ.get("CURSOR_HOOK_FAIL_CLOSED") == "1":
            permission_deny(
                "Hook parse error.",
                "beforeShellExecution artwork guard could not parse stdin JSON.",
            )
        permission_allow()

    command = str(payload.get("command") or "")
    if not command.strip():
        permission_allow()

    if not WRITE_INDICATOR.search(command):
        permission_allow()

    allowed = load_allowed()
    for raw in extract_paths(command):
        rel = rel_path(raw)
        if not is_protected(rel):
            continue
        if rel in allowed:
            continue
        permission_deny(
            f"Blocked shell write to protected path: {rel}",
            (
                f"Shell command denied: would write to protected path {rel}. "
                "Add this exact path to .cursor/ALLOW_EDIT (one path per line), "
                "or send AUTHORIZE EDIT @path: exact change. "
                "Do not bypass with cat/python/heredoc — use allowed Write after ALLOW_EDIT."
            ),
        )

    permission_allow()


if __name__ == "__main__":
    main()
