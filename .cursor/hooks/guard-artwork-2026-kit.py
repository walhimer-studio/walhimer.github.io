#!/usr/bin/env python3
"""Block invented recorders when editing Desktop artwork-2026 from this repo workspace."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

KIT_SCRIPTS = Path("/Users/markwalhimer/Desktop/artwork-2026/_scripts")
sys.path.insert(0, str(KIT_SCRIPTS))

try:
    from no_invented_recorder_rules import hook_check_write, permission_allow  # noqa: E402
except ImportError:
    def permission_allow() -> None:
        print(json.dumps({"permission": "allow"}))
        sys.exit(0)

    def hook_check_write(tool_name: str, tool_input: dict) -> None:
        permission_allow()


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        if os.environ.get("CURSOR_HOOK_FAIL_CLOSED") == "1":
            print(
                json.dumps(
                    {
                        "permission": "deny",
                        "user_message": "Hook parse error.",
                        "agent_message": "artwork-2026 kit recorder guard could not parse stdin.",
                    }
                )
            )
            sys.exit(0)
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

    path_raw = str(
        tool_input.get("path")
        or tool_input.get("file_path")
        or tool_input.get("filePath")
        or ""
    )
    if "artwork-2026" not in path_raw.replace("\\", "/"):
        permission_allow()

    hook_check_write(tool_name, tool_input)


if __name__ == "__main__":
    main()
