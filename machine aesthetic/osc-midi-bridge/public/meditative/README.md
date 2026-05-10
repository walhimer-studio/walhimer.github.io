# Centered still — meditative

Soft **p5.js WEBGL** breathing gradients (same spirit as `923_centered.html`), tuned slower and quieter. Personal lines come from the URL, not from code.

## Open

With the bridge running: `http://localhost:8787/meditative/index.html`

Or open `index.html` directly (WebSocket bridge optional).

## Related

**Bloom / Release — Four Walls** (`drafts/bloom-four-walls-sketch.html` in this repo): immersive Three.js room + panoramic bloom garden + pentatonic piano; draft notes in `drafts/bloom-four-walls-notes.md`. Not served by the bridge server unless copied under `public/`; on GitHub Pages use your site path to `/drafts/…` if that folder is published.

## Personalize (query string)

| Param | Meaning |
|--------|--------|
| `seed` | Numeric seed (combined with `for` when present) |
| `for` / `dedicated` / `you` | Short dedication — mixes into seed & shows “for …” |
| `intention` / `note` / `line` | Optional reflective line at the bottom |
| `bridge=1` | Gentle breath modulation from OSC **mood** via WebSocket |
| `minimal=1` | Fade top controls for a cleaner frame |

Example:

`/meditative/index.html?seed=923000001&for=this+morning&intention=Nothing+to+prove,+only+to+be+here.&bridge=1`
