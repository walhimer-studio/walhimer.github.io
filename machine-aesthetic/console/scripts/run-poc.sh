#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PD_PATCH="$ROOT/pure-data/console-sound.pd"
OF_PROJECT="$ROOT/openframeworks/Console"

echo "Console POC"
echo "  OSC UDP port: 7400"
echo "  Pure Data:    $PD_PATCH"
echo "  openFrameworks: $OF_PROJECT"
echo

if command -v pd >/dev/null 2>&1; then
  echo "Starting Pure Data (background)…"
  pd "$PD_PATCH" &
  PD_PID=$!
  echo "  pd pid $PD_PID — turn DSP on in the patch window"
else
  echo "Pure Data not found on PATH — open $PD_PATCH manually"
fi

echo
echo "openFrameworks (copy project into OF apps/ if needed):"
echo "  cd \"\$OF_ROOT/apps/myApps/Console\"   # or symlink this folder"
echo "  make && make Run"
echo
echo "Keys: 1 room_a · 2 ghost · 3 surrender · space nudge · G gold · R re-seed · F fullscreen"
