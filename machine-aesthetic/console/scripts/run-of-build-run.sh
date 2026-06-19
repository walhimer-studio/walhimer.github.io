#!/usr/bin/env bash
# Build and run GhostRoom77823 when no prebuilt binary exists.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OF_PROJECT="$ROOT/openframeworks/GhostRoom77823"

if [[ -z "${OF_ROOT:-}" || ! -d "$OF_ROOT" ]]; then
  echo "Set OF_ROOT to your openFrameworks install (see launch.env.example)." >&2
  exit 1
fi

TARGET="$OF_ROOT/apps/myApps/GhostRoom77823"
if [[ ! -e "$TARGET" ]]; then
  ln -sf "$OF_PROJECT" "$TARGET"
fi

cd "$TARGET"
make -j4
make Run
