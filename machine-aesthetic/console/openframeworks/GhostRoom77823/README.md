# Ghost Room 77823 — Phase 3 (complete)

Native openFrameworks walkthrough — all three rooms:

| Room | Content |
|------|---------|
| A | Code mural walls + **walk moon / building outline panels** + text cylinder (click links) |
| B | Ghost wireframe machine (seed 77823) |
| C | Surrender Machines embed (seed 77823) |

Browser artwork under `sketches/loop-art-critique-2026/` is **not** modified.

## Run

```bash
./machine-aesthetic/console/scripts/run-phase3.sh
```

Or build from `$OF_ROOT/apps/myApps/GhostRoom77823`.

## Phase 3 source

| File | Browser reference |
|------|-------------------|
| `SurrenderMath.h` | HSB fill, stress/richness helpers |
| `SurrenderMachine.*` | `surrender-machines-three-core.js` embed |

Placement matches browser: `(ROOM_C_X, 0.04, 0)`, scale `surrenderScaleForRoom(9)`, flat mode, sliders 50/50/50.

Spinners animate when camera is in the Room C surrender band (`surrenderBandActive`); material colors animate continuously.

## Controls

WASD · Shift run · drag look · space nudge · G gold · R respawn · F fullscreen

## Optional assets

Wall panel PNGs and PDF live in `bin/data/`. Refresh from browser artwork:

```bash
./machine-aesthetic/console/scripts/sync-room-assets.sh
```

Browser artwork under `sketches/loop-art-critique-2026/` is **not** modified.
