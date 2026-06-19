#!/usr/bin/env bash
# Stop Console launcher server on port 8787 (if stuck after a crash).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${CONSOLE_LAUNCH_PORT:-8787}"

if [[ -f "$ROOT/.console-run/server.pid" ]]; then
  kill "$(cat "$ROOT/.console-run/server.pid")" 2>/dev/null || true
  rm -f "$ROOT/.console-run/server.pid"
fi

if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti "tcp:${PORT}" 2>/dev/null || true)
  if [[ -n "$PIDS" ]]; then
    echo "Stopping process(es) on port ${PORT}: $PIDS"
    kill $PIDS 2>/dev/null || true
    sleep 0.3
  fi
fi

echo "Console launcher port ${PORT} cleared. Double-click Ghost Room 77823.command again."
