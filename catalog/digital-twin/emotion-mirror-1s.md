# Emotion Mirror (1s)

Same as [Emotion Mirror](./emotion-mirror.md) — ML5 face box + DeepFace bars — with **1-second** sample interval instead of 5s. Tighter sync between playhead and ML read (~±0.5s).

**Live:** https://mark-walhimer.com/sketches/digital-twin/emotion-mirror-1s.html

**Data:** `sessions/testimony-emotion-ml-1s.json` · regenerate:

```bash
python3 _scripts/analyze_testimony_emotions.py --interval 1 --out sketches/digital-twin/sessions/testimony-emotion-ml-1s.json
```

See [emotion-mirror.md](./emotion-mirror.md) · [README](./README.md).
