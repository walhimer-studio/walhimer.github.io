#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PD_PATCH="$ROOT/pure-data/ghost-room.pd"
OF_PROJECT="$ROOT/openframeworks/GhostRoom77823"

echo "Ghost Room 77823 — Phase 1"
echo "  OSC UDP: 127.0.0.1:7400"
echo "  Pd:      $PD_PATCH"
echo "  OF:      $OF_PROJECT"
echo

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
echo "Walk: WASD · Shift run · drag to look · space nudge · G gold · R respawn · F fullscreen"
echo "Zone OSC is emitted from camera position (no keyboard bridge)."
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
