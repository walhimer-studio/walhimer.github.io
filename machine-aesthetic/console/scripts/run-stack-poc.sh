#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STACK="$ROOT/stack-poc"
PD_PATCH="$ROOT/pure-data/stack-poc.pd"

echo "Stack POC — seed · Firebase · OSC · Pure Data"
echo "  UI:      http://127.0.0.1:8790/display.html"
echo "  Bridge:  Firebase → OSC 127.0.0.1:7400"
echo "  Pd:      $PD_PATCH"
echo

if [[ ! -f "$STACK/firebase-config.local.mjs" ]]; then
  echo "⚠  Copy $STACK/firebase-config.example.mjs → firebase-config.local.mjs"
  echo "   (or reuse keys from machine aesthetic/interactive-artwork/)"
  echo
fi

if [[ ! -d "$STACK/node_modules" ]]; then
  echo "Installing stack-poc npm deps…"
  (cd "$STACK" && npm install)
fi

if command -v pd >/dev/null 2>&1; then
  echo "Starting Pure Data…"
  pd "$PD_PATCH" &
  echo "  Turn DSP on in the Pd window."
elif [[ "$(uname)" == "Darwin" ]]; then
  open -a Pd "$PD_PATCH" 2>/dev/null || echo "Open $PD_PATCH in Pure Data manually."
else
  echo "Pure Data not found — open $PD_PATCH manually."
fi

echo "Starting Firebase bridge + UI server…"
cd "$STACK"
node firebase-bridge.mjs &
BRIDGE_PID=$!
node serve.mjs &
SERVE_PID=$!

cleanup() {
  kill "$BRIDGE_PID" "$SERVE_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

sleep 0.5
if command -v open >/dev/null 2>&1; then
  open "http://127.0.0.1:8790/display.html"
fi

echo
echo "Press Ctrl+C to stop bridge + server (Pd stays open)."
wait
