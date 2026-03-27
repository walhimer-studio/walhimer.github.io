# Mark Walhimer — Artist Site

**[mark-walhimer.com](https://mark-walhimer.com)** · GitHub Pages

---

## Structure

Two tiers, one manifest.

| Location | Purpose |
|----------|---------|
| `installations/` | Promoted work — 6 pieces on the homepage |
| `sketches/` | Full archive — 177 files organized by series |
| `artworks.json` | Source of truth — all pieces, paths, series |

The nav is: **Installations · Sketches · Bio/CV · Contact**

---

## Workflow

### Add a new sketch
1. Drop the self-contained HTML into `sketches/`
2. Add it to the right series in `artworks.json`
3. Add it to `sketches/index.html` in the SERIES array
4. Push

### Promote a sketch to installation
1. Copy the file to `installations/`
2. Add a card to `index.html` and `installations/index.html`
3. Update `artworks.json` — add to `installations` array
4. Push

### Push changes
```bash
cd ~/Desktop/walhimer.github.io
git add .
git commit -m "Description"
git push
```

---

## Self-contained rule

Every published file must work offline — no external CDNs, no required network. Test: turn off wifi and open the file. If it fails, it's not ready.

---

## Series (sketches)

Bloom · Surrender Machines · Technical Drawing · Emergent DNA · Living Commons · Traveling Landscape · Moon Dish · Spatial Orchestrator · Convergence Era · Walking Figure · Three.js/LVE · Numbered Pieces · Disc/String · Word Art/Text · Cubes · Shelves · Reading the Sky · Audioscape · Miradas Tangentes · Gradients & Color · Mint/NFT · Binary Partitions · Miscellaneous

---

*Updated March 2026. Projects/series/piece tiers retired — everything lives in sketches/ now.*
