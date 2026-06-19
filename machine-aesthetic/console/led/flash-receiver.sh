#!/usr/bin/env bash
# Flash matrix-portal-receiver to Adafruit Matrix Portal M4
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SKETCH="$ROOT/matrix-portal-receiver"
FQBN="adafruit:samd:adafruit_matrixportal_m4"
PORT="${1:-}"

if ! command -v arduino-cli >/dev/null; then
  echo "arduino-cli not found" >&2
  exit 1
fi

arduino-cli lib install "Adafruit Protomatter" "Adafruit GFX Library" >/dev/null 2>&1 || true
arduino-cli compile --fqbn "$FQBN" "$SKETCH"

if [[ -z "$PORT" ]]; then
  PORT="$(arduino-cli board list | awk '/Matrix Portal M4/{print $1; exit}')"
fi

if [[ -z "$PORT" ]]; then
  echo "No Matrix Portal port found. Pass port: $0 /dev/cu.usbmodem101" >&2
  exit 1
fi

if lsof "$PORT" 2>/dev/null | grep -q .; then
  echo "Port $PORT is in use — close Chrome Web Serial (bridge tab) or Serial Monitor first:" >&2
  lsof "$PORT" 2>/dev/null | head -5 >&2
  exit 1
fi

arduino-cli upload -p "$PORT" --fqbn "$FQBN" "$SKETCH"
echo "Flashed to $PORT"
