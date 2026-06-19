#!/usr/bin/env bash
# Copy browser room assets into GhostRoom77823 bin/data (read-only from sketches).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/../../sketches/loop-art-critique-2026/machine-aesthetic"
DEST="$ROOT/openframeworks/GhostRoom77823/bin/data"

mkdir -p "$DEST"

for f in walk-moon-wall-panel.png building-outline-wall-panel.png surrender-machine-ibm-mono.pdf; do
  if [[ -f "$SRC/$f" ]]; then
    cp "$SRC/$f" "$DEST/"
    echo "copied $f"
  else
    echo "missing $SRC/$f" >&2
  fi
done

echo "Assets → $DEST"
