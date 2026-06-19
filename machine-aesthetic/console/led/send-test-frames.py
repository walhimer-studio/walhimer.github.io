#!/usr/bin/env python3
"""Send 64x64 RGB test frames to matrix-portal-receiver over USB serial."""

import math
import sys
import time

try:
    import serial
except ImportError:
    print("Install: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt", file=sys.stderr)
    sys.exit(1)

PORT = "/dev/cu.usbmodem101"
BAUD = 921600
W, H = 64, 64
FRAME_BYTES = W * H * 3
HDR = bytes((0xAA, 0x55))


def frame_bytes(phase: float) -> bytes:
    buf = bytearray(FRAME_BYTES)
    i = 0
    for y in range(H):
        for x in range(W):
            t = phase * 0.08
            r = int((math.sin(x * 0.15 + t) * 0.5 + 0.5) * 255)
            g = int((math.sin(y * 0.12 + t * 1.3) * 0.5 + 0.5) * 255)
            b = int((math.sin((x + y) * 0.09 - t) * 0.5 + 0.5) * 255)
            if (y % 8) < 2:
                r = 255
                g = int((math.sin(t * 2) * 0.5 + 0.5) * 220)
                b = 180
            buf[i] = r
            buf[i + 1] = g
            buf[i + 2] = b
            i += 3
    return bytes(buf)


def main() -> None:
    port = sys.argv[1] if len(sys.argv) > 1 else PORT
    duration = float(sys.argv[2]) if len(sys.argv) > 2 else 30.0

    print(f"Opening {port} @ {BAUD} for {duration:.0f}s …")
    with serial.Serial(port, BAUD, timeout=0) as ser:
        time.sleep(2.0)
        ser.reset_input_buffer()
        start = time.time()
        phase = 0.0
        frames = 0
        while time.time() - start < duration:
            ser.write(HDR + frame_bytes(phase))
            phase += 1.0
            frames += 1
            time.sleep(1 / 15)
        print(f"Sent {frames} frames")


if __name__ == "__main__":
    main()
