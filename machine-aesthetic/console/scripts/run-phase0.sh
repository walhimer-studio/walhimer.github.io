#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PD_PATCH="$ROOT/pure-data/ghost-room.pd"
BRIDGE="$ROOT/bridge/ghost-room-zone-bridge.mjs"
GHOST_URL="https://mark-walhimer.com/sketches/loop-art-critique-2026/machine-aesthetic/ghost_dense_77823_room.html"

echo "Ghost Room 77823 — Phase 0"
echo "  OSC UDP: 127.0.0.1:7400"
echo "  Pd:      $PD_PATCH"
echo "  Bridge:  $BRIDGE"
echo "  Artwork: $GHOST_URL (unchanged — open in Chromium)"
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
echo "Starting zone bridge (keyboard → OSC)…"
echo "  Press keys while watching the ghost room in another window."
echo

exec node "$BRIDGE"
