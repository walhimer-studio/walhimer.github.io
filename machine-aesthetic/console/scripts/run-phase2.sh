#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PD_PATCH="$ROOT/pure-data/ghost-room.pd"
OF_PROJECT="$ROOT/openframeworks/GhostRoom77823"
WALLPAPER_SCRIPT="$ROOT/port/generate-code-wallpaper.mjs"
WALLPAPER_PNG="$OF_PROJECT/bin/data/code-wallpaper-77823.png"

echo "Ghost Room 77823 — Phase 2"
echo "  OSC UDP: 127.0.0.1:7400"
echo "  Pd:      $PD_PATCH"
echo "  OF:      $OF_PROJECT"
echo

if [[ ! -f "$WALLPAPER_PNG" ]]; then
  echo "Generating code mural texture…"
  if command -v node >/dev/null 2>&1; then
    (cd "$ROOT/../../sketches/loop-art-critique-2026/machine-aesthetic" && node "$WALLPAPER_SCRIPT") || {
      echo "  Could not generate wallpaper — install deps in loop-art-critique machine-aesthetic:"
      echo "    npm install"
    }
  else
    echo "  node not found — run: node $WALLPAPER_SCRIPT"
  fi
fi

if command -v pd >/dev/null 2>&1; then
  echo "Starting Pure Data…"
  pd "$PD_PATCH" &
  PD_PID=$!
  echo "  pd pid $PD_PID — turn DSP on in the patch window"
  sleep 1
else
  echo "Pure Data not on PATH — open $PD_PATCH manually and enable DSP"
fi

echo
echo "openFrameworks (symlink or copy into OF apps/, then build):"
echo "  cd \"\$OF_ROOT/apps/myApps/GhostRoom77823\""
echo "  make && make Run"
echo
echo "Room A: code mural walls + text cylinder · WASD walk · drag look"
echo

if [[ -n "${OF_ROOT:-}" && -d "$OF_ROOT" ]]; then
  TARGET="$OF_ROOT/apps/myApps/GhostRoom77823"
  if [[ ! -e "$TARGET" ]]; then
    echo "Linking project into OF apps…"
    ln -sf "$OF_PROJECT" "$TARGET"
  fi
  if [[ -d "$TARGET" ]]; then
    echo "Building GhostRoom77823…"
    (cd "$TARGET" && make -j4 && make Run)
    exit 0
  fi
fi

echo "Set OF_ROOT and re-run, or build manually from the path above."
