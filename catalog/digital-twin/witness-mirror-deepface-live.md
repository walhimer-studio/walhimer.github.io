# Witness Mirror (DeepFace live)

**Trusted live witness** — same DeepFace emotion stack as [1s](./witness-mirror-1s.md) / [5s](./witness-mirror.md) testimony review, on webcam. Browser sends frames to a **local Python server**; not shareable on GitHub Pages alone.

**Lab URL:** https://mark-walhimer.com/sketches/digital-twin/witness-mirror-deepface-live.html (requires local server)

| Layer | Stack |
|-------|--------|
| **Witness ML** | [DeepFace](https://github.com/serengil/deepface) emotion · MIT · Sefik Ilkin Serengil |
| **Server** | `_scripts/witness_mirror_deepface_live.py` · `POST /analyze` |
| **Browser** | Webcam capture · point-word counterpoint · 15s story mode |
| **Contrast** | [face-api live](./witness-mirror-live.md) — browser lab, not trusted for sharing |

## Run locally

```bash
# Terminal 1 — static server
cd walhimer.github.io && python3 -m http.server 8080

# Terminal 2 — DeepFace witness (venv with deepface + opencv)
python3 _scripts/witness_mirror_deepface_live.py
```

Open `http://localhost:8080/sketches/digital-twin/witness-mirror-deepface-live.html` in Chrome or Safari.

## Studio notes

- **15s story** — bounded session: read a script using the seven face words, then read session share (point vs counterpoint).
- Next: annotation layer (`you: surprise / ml: sad / note: masking`).
- Public share surface remains **1s/5s** on recorded testimony; live DeepFace is Mac lab.

See [witness-mirror-live.md](./witness-mirror-live.md) · [README](./README.md).
