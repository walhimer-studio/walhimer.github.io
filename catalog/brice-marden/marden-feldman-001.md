<!-- catalog-mirror: auto -->
# Marden / Feldman 001

| Field | Value |
|-------|--------|
| Title | Marden / Feldman 001 |
| Studio pipeline | [Artwork pipeline](https://mark-walhimer.com/practice/artwork-pipeline.html) · [../STUDIO-DIRECTION.md](../STUDIO-DIRECTION.md) |
| Species | Continuous weaving line (after Brice Marden) |
| Seed | URL `?seed=` (default 2) |
| Format | `?format=square\|portrait\|landscape` (omit → fill viewport) |
| Mode | live · record · rebirth |
| Bodies | browser · p5.js WebGL · Tone.js |
| Sound | Sampled piano, mallets, violin (Feldman-sparse scheduling on Arc sample set) |
| Record | Frame-step **60 fps** · save-first WebM → **ffmpeg `setpts=N/(60*TB)`** → H.265 MP4 |

## Description

p5.js WebGL Tone.js with sampled piano, mallets, and violin. 60 seconds, 60 fps, HEVC 265.

One continuous pencil line on linen, after Brice Marden’s Attendant lineage. Sonification uses Morton Feldman character — soft, sparse, slow — on Sampled Arc instruments. Record (**R**): August-29 save-first frame-step; deliverable offline ffmpeg to HEVC.

Controls: click canvas to load sound · **R** record · **N** / space rebirth · **M** mute · `?seconds=` (default 60)

## WIP

`sketches/brice-marden/attendant-no-2.html`

## Related

[Brice Marden — series](./README.md) · Sampled Arc instruments: `sketches/coupled-av-portal/samples/`
