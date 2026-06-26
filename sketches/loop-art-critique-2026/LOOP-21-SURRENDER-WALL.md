# Loop 21 — clickable wall → Surrender Machines (HTML)

**Verse:** [Loop 21 | Loop Art Critique](https://verse.loop.onland.io/Ag5pK2U/loop-21)  
**Artwork URL (Link Href target):**  
`https://mark-walhimer.com/sketches/loop-snippets/rgb-xyz-vol3d-code.html`

Optional seed in query string, e.g. `?seed=77823`.

---

## Quick setup in XR Creator (wall + click → browser)

This is the simplest path before embedding machines inside the verse.

1. Open **XR Creator Studio** for verse `Ag5pK2U` / **Loop 21**.
2. **Add a wall** — either:
   - **Primitive → Box** (thin, wide, tall), or
   - Upload `machine-aesthetic/loop_21_surrender_portal.glb` (build: `node machine-aesthetic/build-loop-21-surrender-portal-glb.mjs` from this folder), or
3. Position and scale the wall where visitors can reach it.
4. Select the wall mesh in **Hierarchy**.
5. In **Properties**, set **Link Href** (or **Advanced URL** on media frames) to the artwork URL above.
6. Enable **collidable** so raycasts / clicks register.
7. **Preview** (Cmd/Ctrl+Shift+P) — click the wall; the HTML piece should open in a new tab or in-world browser panel (platform-dependent).
8. **Publish** (Cmd/Ctrl+Alt+P).

### Optional label on the wall

Loop displays **images/video/PDF** on quads more reliably than live HTML textures. Common pattern:

- Upload a PNG label (e.g. “Surrender Machines”) to Archive.
- Apply as texture on the wall for legibility.
- Keep **Link Href** on the same object so click still opens the HTML page.

See also [`critique-hub-simple.html`](critique-hub-simple.html) — same “screen texture + click URL” note.

---

## Artwork naming

The HTML page title and on-canvas HUD update to **`Surrender Machines · {seed}`** on load and after each rebirth (**N** = new seed).

---

## Next (not in this step)

- Add **Surrender Machines** geometry inside the verse (machines on machines) — separate from the link-out wall.
- Or deep-link from wall to a specific seed: `rgb-xyz-vol3d-code.html?seed=77823`.
