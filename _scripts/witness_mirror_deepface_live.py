#!/usr/bin/env python3
"""Local DeepFace witness server for witness-mirror-deepface-live.html.

Browser captures webcam frames; this process runs DeepFace.analyze (same stack as
analyze_testimony_emotions.py). Not for production hosting — Mac lab only.

Usage (venv with deepface + opencv):
  python3 _scripts/witness_mirror_deepface_live.py
  python3 _scripts/witness_mirror_deepface_live.py --port 8765
"""

import argparse
import base64
import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

import cv2
import numpy as np
from deepface import DeepFace


def analyze_frame(frame):
    result = DeepFace.analyze(
        frame,
        actions=["emotion"],
        enforce_detection=False,
        silent=True,
    )
    if isinstance(result, list):
        result = result[0]
    region = result.get("region") or {}
    return {
        "dominant": result.get("dominant_emotion"),
        "scores": {k: round(float(v), 2) for k, v in result.get("emotion", {}).items()},
        "region": {
            "x": int(region.get("x", 0)),
            "y": int(region.get("y", 0)),
            "width": int(region.get("w", 0)),
            "height": int(region.get("h", 0)),
        },
    }


class WitnessHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path != "/health":
            self.send_error(404)
            return
        payload = json.dumps({"ok": True, "model": "DeepFace emotion (enforce_detection=False)"}).encode()
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_POST(self):
        if self.path != "/analyze":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            image_b64 = body.get("image", "")
            if not image_b64:
                raise ValueError("missing image")
            if "," in image_b64:
                image_b64 = image_b64.split(",", 1)[1]
            raw = base64.b64decode(image_b64)
            arr = np.frombuffer(raw, dtype=np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is None:
                raise ValueError("could not decode jpeg")
            result = analyze_frame(frame)
            payload = json.dumps(result).encode()
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except Exception as err:
            payload = json.dumps({"error": str(err)}).encode()
            self.send_response(422)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)


def main():
    parser = argparse.ArgumentParser(description="DeepFace live witness server (local lab)")
    parser.add_argument("--host", default="127.0.0.1", help="Bind address (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8765, help="Port (default: 8765)")
    args = parser.parse_args()
    server = HTTPServer((args.host, args.port), WitnessHandler)
    print(f"DeepFace witness server http://{args.host}:{args.port}")
    print("  GET  /health")
    print("  POST /analyze  {\"image\": \"data:image/jpeg;base64,...\"}")
    print("Open witness-mirror-deepface-live.html with this running.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()


if __name__ == "__main__":
    main()
