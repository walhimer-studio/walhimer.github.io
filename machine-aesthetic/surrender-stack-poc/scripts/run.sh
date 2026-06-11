#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PD_PATCH="$ROOT/pure-data/surrender-dna.pd"
VENUE="${SM_VENUE_ID:-mac-local}"

echo "Surrender Stack POC"
echo "  venue:   $VENUE"
echo "  folder:  $ROOT"
echo

if [[ ! -f "$ROOT/config/firebase-config.local.mjs" ]] || [[ ! -f "$ROOT/config/supabase-config.local.mjs" ]]; then
  echo "Setup required:"
  echo "  cp config/firebase-config.example.mjs config/firebase-config.local.mjs"
  echo "  cp config/supabase-config.example.mjs config/supabase-config.local.mjs"
  echo "  Run schema/supabase.sql in Supabase SQL Editor"
  echo
fi

if [[ ! -d "$ROOT/node_modules" ]]; then
  echo "npm install…"
  (cd "$ROOT" && npm install)
fi

if command -v pd >/dev/null 2>&1; then
  echo "Starting Pure Data…"
  pd "$PD_PATCH" &
elif [[ "$(uname)" == "Darwin" ]]; then
  open -a Pd "$PD_PATCH" 2>/dev/null || echo "Open $PD_PATCH manually — turn DSP on."
else
  echo "Open $PD_PATCH in Pure Data — turn DSP on."
fi

cd "$ROOT"
SM_VENUE_ID="$VENUE" node bridge/dna-bridge.mjs &
BRIDGE_PID=$!
node web/serve.mjs &
WEB_PID=$!

cleanup() {
  kill "$BRIDGE_PID" "$WEB_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

sleep 0.8
PORT="${SURRENDER_WEB_PORT:-8791}"
if command -v open >/dev/null 2>&1; then
  open "http://127.0.0.1:${PORT}/display.html?venue=${VENUE}"
fi

echo
echo "Display:    http://127.0.0.1:${PORT}/display.html?venue=${VENUE}"
echo "Controller: http://127.0.0.1:${PORT}/controller.html?venue=${VENUE}"
echo "Press Ctrl+C to stop bridge + web (Pd stays open)."
wait
