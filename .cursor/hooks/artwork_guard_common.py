"""Shared protected-path logic for artwork guard hooks."""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
ALLOW_EDIT = REPO_ROOT / ".cursor" / "ALLOW_EDIT"

PROTECTED_PREFIXES = (
    "sketches/",
    "Palm/",
    "installations/",
    "machine-aesthetic/",
)

PROTECTED_EXACT = {
    "docs/wall-screen-edition/templates/portrait-wall.starter.html",
    "docs/wall-screen-edition/templates/portrait-wall.starter-square.html",
}


def load_allowed() -> set[str]:
    allowed: set[str] = set()
    if not ALLOW_EDIT.is_file():
        return allowed
    for line in ALLOW_EDIT.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        allowed.add(line.replace("\\", "/"))
    return allowed


def rel_path(raw: str) -> str:
    p = Path(raw)
    try:
        if p.is_absolute():
            return p.resolve().relative_to(REPO_ROOT).as_posix()
    except ValueError:
        pass
    return raw.replace("\\", "/")


def is_protected(rel: str) -> bool:
    if rel in PROTECTED_EXACT:
        return True
    return any(rel.startswith(prefix) for prefix in PROTECTED_PREFIXES)


def target_exists(rel: str) -> bool:
    """True when the path already holds a file — i.e. a write would overwrite work."""
    try:
        return (REPO_ROOT / rel).is_file()
    except OSError:
        return True


def permission_allow() -> None:
    print(json.dumps({"permission": "allow"}))
    sys.exit(0)


def permission_deny(user_message: str, agent_message: str) -> None:
    print(
        json.dumps(
            {
                "permission": "deny",
                "user_message": user_message,
                "agent_message": agent_message,
            }
        )
    )
    sys.exit(0)
