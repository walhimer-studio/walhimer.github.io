# Loop · Machine Aesthetic

**Living workspace** — ongoing development. For prize submissions, copy this folder to a dated snapshot (see [Submission & series structure](../../docs/submission-and-series-structure.md)).

Walkthrough: Room A (code mural + essay panel) → ghost 77823 → Surrender Machines in Room C.

## Live URL (workspace)

https://mark-walhimer.com/sketches/loop-machine-aesthetic/ghost_dense_77823_room.html

## Frozen submission (example)

The Lumen Prize 2026 snapshot lives separately — do not submit this folder for Lumen:

- **Path:** `sketches/2026-lumen-prize-machine-aesthetic/`
- **Submit URL:** https://mark-walhimer.com/sketches/2026-lumen-prize-machine-aesthetic/seed-77823-rooms.html

## GitHub

Repo: [walhimer-studio/walhimer.github.io](https://github.com/walhimer-studio/walhimer.github.io)

Path: `sketches/loop-machine-aesthetic/`

| File | Role |
|------|------|
| `ghost_dense_77823_room.html` | Entry page (workspace) |
| `ghost_dense_77823_room.mjs` | Walkthrough app |
| `ghost-machine-core.mjs` | Rooms + ghost wireframe |
| `surrender-machines-three-core.js` | Surrender machine embed |
| `surrender-machine-core.mjs` | Surrender build (GLB export) |
| `counterproduction-essay-v2.md` | Doreen Rios essay (draft, markdown) |
| `counterproduction-essay-v2.pdf` | Doreen Rios essay (draft, PDF) |

## Run locally

```bash
cd sketches/loop-machine-aesthetic
python3 -m http.server 8765
```

Open http://localhost:8765/ghost_dense_77823_room.html
