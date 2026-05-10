# Bloom / Release — Four Walls (`bloom-four-walls-sketch.html`)

**Draft** (see HTML comment: analytics stripped vs production under `/installations/`).

## What it is

- **Three.js** first-person room (white box): four walls + soft floor/ceiling planes; **drag** (or touch) to look; slow **auto-rotate** until the user interacts.
- **2D “garden”** on an offscreen canvas (`4096×1024`): radial-gradient **blooms** spawn over a life cycle (**22** blooms, pentatonic note assignment, breathe animation, then a staged **release** phase).
- That panorama is mapped onto the walls as **four UV slices** (North / East / South / West labels + wall counter).
- **Sound:** embedded **MP3** buffers (base64 in page JSON) + **Web Audio** `BufferSource` playback with velocity and long decay; **click / key** starts load + optional fullscreen (overlay copy: piano).
- **UI:** intro overlay (“Bloom / Release”, artist line), life bar, hints, credits **2025–2026**.

## Why the file is large (~2.2 MB)

The HTML inlines **minified Three.js** and **many sample snippets** in one document so it can ship as a single file—fine for a draft, heavy for git diffs.

## Relation to other work

- **`osc-midi-bridge/public/meditative/`** — quiet **p5 WEBGL** breathing planes + URL personalization + optional bridge **mood**.
- **This sketch** — immersive **room + blooms + sampled piano**; same “gentle / contemplative” family but **spectacle-first** (fullscreen install), not MIDI-bridge-driven unless you extend it later.

## Possible next steps (if you want)

- Load **three.min.js** from a CDN and move samples to `/audio/*.mp3` to shrink HTML.
- Optionally drive **spawn timing or hue** from WebSocket **state** (same bridge as S-1) for a live hybrid.
