# Stack POC — seed · Firebase · OSC · Pure Data · (optional) openFrameworks

**This is not artwork.** It proves the wiring stack works end-to-end before you invest in install bodies.

## What it proves

| Layer | Role |
|-------|------|
| **iPhone / browser controller** | Writes `seed`, `energy`, `mood` to Firebase Realtime Database |
| **firebase-bridge.mjs** | Firebase → local OSC (`127.0.0.1:7400`) — hot path stays off the network |
| **display.html** | Same seed drives visuals in the browser (EmergentDNA RNG) |
| **stack-poc.pd** | Same OSC drives audio in Pure Data |
| **Console OF app** (optional) | Already listens on `/sm/console/seed`, `/sm/state/energy`, `/sm/gear/hz` |

One seed → shared machine state → sight + sound. Firebase is the **remote control**, not the audio thread.

## Firebase vs Supabase (for this project)

Use **Firebase Realtime Database** for iPhone interactivity here:

- You already have a working pattern in `machine aesthetic/interactive-artwork/`.
- Phone → cloud → Mac bridge → OSC matches [FIREBASE_DNA.md](../../docs/FIREBASE_DNA.md) (slow path only).
- [RESOLVED-DIRECTION.md](../../docs/RESOLVED-DIRECTION.md) defers multi-site lineage to Phase G — not blocking this POC.

**Supabase** fits later if you want SQL analytics, program dashboard mirrors, or installation logs (`living-commons` mentions it as a data layer). It does not replace Firebase for sub-100ms phone sliders unless you add another local bridge anyway.

## Setup (once)

1. Firebase Console → Realtime Database → **test mode** (or rules that allow read/write on `stack-poc/`).
2. Copy config:

```bash
cp firebase-config.example.mjs firebase-config.local.mjs
# paste your web app config from Firebase Console
```

3. Install bridge deps (one time):

```bash
cd machine-aesthetic/console/stack-poc
npm install
```

## Run

```bash
./scripts/run-stack-poc.sh   # from machine-aesthetic/console/
```

Or manually:

```bash
# terminal 1 — Pure Data (turn DSP on)
pd ../pure-data/stack-poc.pd

# terminal 2 — Firebase → OSC bridge
node firebase-bridge.mjs

# terminal 3 — static server (controller + display)
node serve.mjs
```

Open:

- **Display (projector / Mac):** http://127.0.0.1:8790/display.html
- **Controller (iPhone, same Wi‑Fi):** http://\<your-mac-lan-ip\>:8790/controller.html  
  QR code shown on display page when LAN IP is detected.

Optional — openFrameworks Console app (receives same OSC):

```bash
cd ../openframeworks/Console && make Run
```

## Firebase path

```
stack-poc/state
  seed    (int)
  energy  (float 0–1)
  mood    (float 0–1)
  ts      (timestamp ms)
```

## OSC addresses (stack POC)

| Address | Args | Notes |
|---------|------|--------|
| `/sm/poc/ready` | `i` | bridge boot |
| `/sm/poc/seed` | `i` | species seed |
| `/sm/poc/energy` | `f` | 0–1 |
| `/sm/poc/mood` | `f` | 0–1 |

Bridge also mirrors to existing Console addresses: `/sm/console/seed`, `/sm/state/energy`, `/sm/gear/hz`.

## Success criteria

- Change seed on phone → display pattern **and** Pd pitch timbre change together.
- Kill Wi‑Fi on phone → local display keeps last frame; Pd keeps last OSC (hot path decoupled).
- OF Console app (if running) HUD shows new seed / energy.
