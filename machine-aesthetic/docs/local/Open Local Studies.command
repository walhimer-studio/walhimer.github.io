#!/bin/bash
cd "$(dirname "$0")"
PORT=9878
URL="http://127.0.0.1:${PORT}/orthographic-translucent-cube-v10.html"

# Stop any prior server on this port
if lsof -ti :"${PORT}" >/dev/null 2>&1; then
  echo "Stopping existing server on port ${PORT}…"
  kill $(lsof -ti :"${PORT}") 2>/dev/null
  sleep 0.5
fi

echo "Starting local studies server…"
echo "Folder: $(pwd)"
python3 -m http.server "${PORT}" --bind 127.0.0.1 &
SERVER_PID=$!
sleep 0.8

if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
  echo "ERROR: server failed to start."
  read -r -p "Press Return to close."
  exit 1
fi

echo "Open: ${URL}"
open "${URL}" || open "http://localhost:${PORT}/"

echo ""
echo "Studies index: http://127.0.0.1:${PORT}/"
  echo "  · orthographic-translucent-cube-v10.html"
echo "  · orthographic-translucent-cube-v8.html"
echo "  · raster-spektrum-study-webgl.html"
echo ""
echo "Server PID ${SERVER_PID} — leave this window open. Ctrl+C to stop."

wait "${SERVER_PID}"
