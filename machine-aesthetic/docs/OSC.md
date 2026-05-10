# OSC contract — Surrender Machines (draft)

All processes share one LAN. Prefer **UDP**. Document every address that crosses a boundary (PD ↔ OF ↔ Python ↔ Teensy bridge).

## Transport defaults (edit when fixed)

| Setting | Value |
|---------|--------|
| Listen host | `0.0.0.0` or single machine IP |
| Send host | target IP or broadcast (avoid unless needed) |
| Port (client A → B) | *TBD* — keep one port per direction or one multiplexed port with distinct paths |

## Namespace

Prefix: **`/sm`** (Surrender Machines). Extend with role segments.

### Heartbeat / health

| Address | Args | Rate | Notes |
|---------|------|------|--------|
| `/sm/heartbeat` | — | 1 Hz | Source tags via separate sender IP or `/sm/source` |
| `/sm/ready` | `i` (1=ready) | on change | |

### Seat / presence (physical → host)

| Address | Args | Notes |
|---------|------|--------|
| `/sm/seat/present` | `i` (0/1) | optional |
| `/sm/seat/calm` | `f` 0–1 | derived metric |

### DNA / parameters (slow — prefer Python or OF, not PD audio thread)

| Address | Args | Notes |
|---------|------|--------|
| `/sm/dna/generation` | `i` | monotonic or hash bucket |
| `/sm/dna/weights` | `ffff…` | packed floats; **or** split into named `/sm/dna/param/name` |

### LED / visuals (OF or mapper → panels)

| Address | Args | Notes |
|---------|------|--------|
| `/sm/led/brightness` | `f` | global master |
| `/sm/led/scene` | `s` | scene id |

### Audio (PD)

| Address | Args | Notes |
|---------|------|--------|
| `/sm/audio/macro` | `s` `f` | name + value |

## Rules

1. **Units** in argument names or this table — not ambiguous raw floats.
2. **Do not** push Firebase I/O inside PD’s audio callback; bridge via Python or OF.
3. Version this file when addresses change (`OSC.md` in commit messages).
