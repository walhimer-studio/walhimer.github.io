# OSC contract — Surrender Stack POC

**Namespace:** `/sm` · **Transport:** UDP · **Default:** `127.0.0.1:7400` (LAN brain IP in install)

The **dna-bridge** is the sole emitter. Hosts listen only — never Firebase/Supabase on audio thread.

Parent spec: [../../docs/OSC.md](../../docs/OSC.md)

---

## Ports

| Port | Format | Consumer |
|------|--------|----------|
| **7400** | OSC binary (this table) | openFrameworks, Pis, `surrender-dna.pd` |
| **7401** | FUDI plain text (`seed 77823;`) | Mac Pd fallback — `surrender-dna-vanilla.pd` |

Production install uses **7400 only**. Port 7401 exists because Mac Pd OSC externals are unreliable in dev.

---

## Emission rate

| Source | Rate |
|--------|------|
| `/sm/heartbeat` | 1 Hz |
| Genome state (`/sm/console/seed`, `/sm/state/*`, `/sm/dna/*`, `/sm/gear/hz`) | `SM_TICK_HZ` default 30 Hz |
| `/sm/event/gold`, `/sm/audio/macro` | on change |

---

## Addresses (dna-bridge → hosts)

### Ready / health

| Address | Args | Notes |
|---------|------|--------|
| `/sm/poc/ready` | `i` (1) | stack POC boot |
| `/sm/poc/venue` | `s` | venue id |
| `/sm/console/ready` | `i` (1) | same boot |
| `/sm/heartbeat` | — | 1 Hz |

### Seed / DNA

| Address | Args | Notes |
|---------|------|--------|
| `/sm/console/seed` | `i` | species seed |
| `/sm/dna/generation` | `i` | generation |
| `/sm/dna/weights` | `fffff` | warmth · machine · surrender · scar · gold |
| `/sm/dna/param/{name}` | `f` | named trait |

### Machine state

| Address | Args | Notes |
|---------|------|--------|
| `/sm/state/energy` | `f` | vitality 0–1 |
| `/sm/state/stress` | `f` | stress 0–1 |
| `/sm/gear/hz` | `i` `f` | gear index, frequency |

### Events

| Address | Args | Notes |
|---------|------|--------|
| `/sm/event/gold` | `f` | on gold flag |
| `/sm/audio/macro` | `s` `f` | e.g. `breaking 1` |
| `/sm/console/branch` | `s` | `surrender-machines` |

---

## Environment

| Variable | Default |
|----------|---------|
| `SM_OSC_HOST` | `127.0.0.1` |
| `SM_OSC_PORT` | `7400` |
| `SM_PLAIN_PD_PORT` | `7401` |
| `SM_TICK_HZ` | `30` |

---

## Rules

1. **Machine state only** — no pixels, no audio buffers over OSC.
2. **One bridge per venue** — one kernel authority.
3. **Linux install:** bind `SM_OSC_HOST=0.0.0.0`, Pis subscribe to brain IP on LAN.
4. **Pd on Mac:** prefer `surrender-dna-vanilla.pd` (7401); use `surrender-dna.pd` (7400) when `oscparse`/`routeOSC` externals load.

---

## Plain UDP (7401) — FUDI lines

```
seed 77823;
generation 0;
stress 0.3100;
energy 0.8500;
hz 266.50;
```

One UDP packet per line, semicolon-terminated.
