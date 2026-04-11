# Critique frame GLB (16×9, ~9 ft tall)

Single **`critique-frame-16x9-9ft.glb`**: thin slab + four front bezel pieces (the “eye” frame around the opening). Units are **meters** (glTF default).

| Quantity | Value |
|----------|--------|
| Height | **9 ft** ? 2.7432 m |
| Width | 16?9 ? **4.8768 m** |
| Panel depth | ~**2 in** (0.0508 m) |
| Frame | ~3.8% of height per bar, slightly proud of the front face |

## Regenerate

```bash
npm install
npm run build
```

Requires **Node 18+** (for `Blob` / `arrayBuffer`).

## If HTML cannot go on a map

Ideas while you wait on tech:

1. **Bake a snapshot** of the critique page as a **PNG/JPG** and use it as a **texture** on the inner quad in Blender (replace the gray panel with a UV-mapped plane), then export GLB again.
2. **Loop / Verse** may allow a **URL object** or **link** near the frame—same content, different affordance than live HTML on geometry.
3. **Short link + QR** texture on a small plaque mesh beside the screen.
4. **Video texture** (MP4) on the surface if the platform supports video materials.

## Hosted copy

After `git push`, the file is available at:

`https://mark-walhimer.com/sketches/loop-miami-2026/critique-frame-glb/critique-frame-16x9-9ft.glb`
