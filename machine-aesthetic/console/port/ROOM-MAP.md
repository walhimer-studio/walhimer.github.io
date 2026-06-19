# Ghost Room 77823 — zone map (reference)

Maps spatial regions in the **browser walkthrough** (read from `ghost_dense_77823_room.mjs` HUD logic) to Phase 0 OSC. The loop files are not modified.

## Fine zones → OSC

| Zone id | When (approx. camera X) | HUD label | Branch |
|---------|-------------------------|-----------|--------|
| `approach_a` | west of Room A | Approach · Room A | `room_a` |
| `room_a` | Room A interior | Room A · black · code mural | `room_a` |
| `hall_ab` | Hall A–B | Hall A–B | `ghost` |
| `room_b` | Room B | Room B · ghost wireframe | `ghost` |
| `hall_bc` | Hall B–C | Hall B–C | `surrender` |
| `room_c` | Room C | Room C · surrender machine | `surrender` |

## Flags (from browser behavior)

| OSC | When true in browser |
|-----|----------------------|
| `/sm/ghost/spin_active` | Camera in ghost spin band (hall / room B wireframe) |
| `/sm/ghost/surrender_active` | Camera in Room C surrender zone |

Phase 0 bridge sets these when you press matching keys while watching Chromium.

## Phase 0 bridge keys

| Key | Zone |
|-----|------|
| `0` | `approach_a` |
| `1` / `a` | `room_a` |
| `4` | `hall_ab` |
| `2` / `b` | `room_b` |
| `5` | `hall_bc` |
| `3` / `c` | `room_c` |
| `space` | visitor nudge → `/sm/state/stress` |
| `g` | gold → `/sm/event/gold` |

## Sound (Phase 0)

Bridge sends `/sm/gear/hz` 0 `<freq>` per zone (warm → bright → tense). Pd patch [`../pure-data/ghost-room.pd`](../pure-data/ghost-room.pd) plays fundamental; stress scales amplitude.

Future OF host (Phases 1–3) emits the same addresses from camera position instead of manual keys. **Phase 1 implements this** in `openframeworks/GhostRoom77823/`.
