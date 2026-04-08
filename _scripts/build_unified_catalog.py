#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Deprecated: use _scripts/refresh_catalog.py instead."""

from __future__ import annotations

import sys


def main() -> None:
    print(
        "This script was replaced by _scripts/refresh_catalog.py\n"
        "  python3 _scripts/refresh_catalog.py\n"
        "One-time migration from legacy artworks.json:\n"
        "  python3 _scripts/refresh_catalog.py --from-artworks",
        file=sys.stderr,
    )
    sys.exit(1)


if __name__ == "__main__":
    main()
