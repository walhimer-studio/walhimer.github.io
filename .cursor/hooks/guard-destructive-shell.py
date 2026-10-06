#!/usr/bin/env python3
"""Block destructive shell commands on portrait templates and protected trees."""

from __future__ import annotations

import json
import re
import sys

BLOCK_PATTERNS = [
    re.compile(r"\brm\s+(-[^\s]*\s+)*-[^\s]*r[^\s]*\s+.*templates", re.I),
    re.compile(r"\brm\s+(-[^\s]*\s+)*-[^\s]*r[^\s]*\s+.*wall-screen-edition/templates", re.I),
    re.compile(r"\bgit\s+checkout\s+.*sketches/", re.I),
    re.compile(r"\bgit\s+restore\s+.*sketches/", re.I),
]


def deny(msg: str) -> None:
    print(
        json.dumps(
            {
                "permission": "deny",
                "user_message": msg,
                "agent_message": msg,
            }
        )
    )
    sys.exit(0)


def allow() -> None:
    print(json.dumps({"permission": "allow"}))
    sys.exit(0)


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        allow()

    command = str(payload.get("command") or "")
    for pattern in BLOCK_PATTERNS:
        if pattern.search(command):
            deny(f"Blocked shell command: {command}")
    allow()


if __name__ == "__main__":
    main()
