#!/usr/bin/env bash
# Start Ghost Room launcher UI + orchestration server (Pure Data · OSC · openFrameworks).
set -euo pipefail

export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:${PATH:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="$ROOT/.console-run"
PORT="${CONSOLE_LAUNCH_PORT:-8787}"
URL="http://127.0.0.1:${PORT}/"

mkdir -p "$RUN_DIR"

if [[ -f "$ROOT/launch.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/launch.env"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required for the Console launcher."
  echo "Install Node, then double-click Ghost Room 77823.command again."
  read -r -p "Press Enter to close…" _ || true
  exit 1
fi

server_running() {
  node -e "
    fetch('${URL}api/status')
      .then((r) => process.exit(r.ok ? 0 : 1))
      .catch(() => process.exit(1));
  " 2>/dev/null
}

port_in_use() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti "tcp:${PORT}" >/dev/null 2>&1
    return $?
  fi
  return 1
}

clear_stale_port() {
  if port_in_use && ! server_running; then
    echo "Clearing stale process on port ${PORT}…"
    bash "$ROOT/scripts/stop-launcher.sh" >/dev/null 2>&1 || true
    sleep 0.4
  fi
}

if server_running; then
  echo "Console launcher already running — $URL"
else
  clear_stale_port
  echo "Starting Console launcher on $URL"
  nohup node "$ROOT/launch/server.mjs" >>"$RUN_DIR/server.log" 2>&1 &
  echo $! >"$RUN_DIR/server.pid"
  ok=0
  for _ in $(seq 1 50); do
    if server_running; then ok=1; break; fi
    sleep 0.15
  done
  if [[ "$ok" -eq 0 ]]; then
    echo "  ✗ Server did not respond. Last log lines:"
    tail -8 "$RUN_DIR/server.log" 2>/dev/null || true
  fi
fi

if command -v open >/dev/null 2>&1; then
  open "$URL"
else
  echo "Open in your browser: $URL"
fi

echo
echo "Console launcher — $URL"
echo "  Pure Data + OSC :7400 + openFrameworks Ghost Room 77823"
echo
if server_running; then
  echo "  ✓ Server is running."
  echo "  → In the browser: click Launch browser room (easiest) or Launch native walkthrough."
  echo "  → Turn DSP ON in Pure Data when the patch opens."
else
  echo "  ✗ Server did not respond. Full log:"
  echo "    $RUN_DIR/server.log"
  echo
  echo "  Try in Terminal:"
  echo "    cd \"$ROOT\""
  echo "    ./scripts/stop-launcher.sh"
  echo "    node launch/server.mjs"
fi
echo
echo "  If no browser tab opened, paste this URL:"
echo "  $URL"
echo
read -r -p "Press Enter to close this window…" _ || true
