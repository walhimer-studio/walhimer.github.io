# Matrix Portal M4 — LED pipeline

Mac brain → Web Serial (Chrome) or Python → Matrix Portal M4 → 64×64 HUB75 panel.

**Protocol:** `0xAA 0x55` + 12288 bytes RGB (64×64×3) @ 115200 baud.

## 1. Flash receiver firmware

```bash
cd machine-aesthetic/console/led
chmod +x flash-receiver.sh
./flash-receiver.sh
# or: ./flash-receiver.sh /dev/cu.usbmodem101
```

Requires [arduino-cli](https://arduino.github.io/arduino-cli/) and `adafruit:samd` core.

## 2. Test panel (no sketch)

**Browser (Web Serial):**

Serve the repo root (required for ES modules):

```bash
cd /path/to/walhimer.github.io
python3 -m http.server 8080
```

Open [http://127.0.0.1:8080/machine-aesthetic/console/led/vol3d-led-bridge.html](http://127.0.0.1:8080/machine-aesthetic/console/led/vol3d-led-bridge.html) in **Chrome** → **Connect serial** → **Run test pattern**.

**Terminal (Python):**

```bash
cd machine-aesthetic/console/led
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python send-test-frames.py /dev/cu.usbmodem101 20
```

## 3. Live vol3d → LED (screen mirror)

Source sketch:

`sketches/loop-snippets/raster-spektrum-study-combined-vol3d-living-copy-code.html`

**What the panel shows:** 64×64 re-render of the **same scene + travel camera** as on screen (center of view), not the internal volume slice.

Expect **~8 fps** — USB serial cannot match canvas smoothness.

Plumbing: [`forward-slice-export.mjs`](forward-slice-export.mjs) — `L` toggles stream after `gpu.render()` each frame.

## Files

| File | Role |
|------|------|
| `matrix-portal-receiver/` | C++ receiver on Portal (Protomatter) |
| `forward-slice-export.mjs` | Web Serial + forward-slice downscale |
| `vol3d-led-bridge.html` | Connect + test pattern in Chrome |
| `send-test-frames.py` | CLI test sender |
| `flash-receiver.sh` | One-shot upload |

## Panel size

Firmware assumes **64×64** (5 address pins). If your panel is 64×32, change `NUM_ADDR_PINS` to 4 and `MATRIX_H` to 32 in the `.ino`.
