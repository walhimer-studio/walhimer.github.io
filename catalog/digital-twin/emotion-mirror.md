# Emotion Mirror

ML video review tool — **ML5** live face tracking, **DeepFace** offline emotion analysis (**Python**), **HTML/JavaScript** scrub interface.

**Live:** https://mark-walhimer.com/sketches/digital-twin/emotion-mirror.html

Scrub testimony video with a blue face box and DeepFace labels beside the face. **ML now** shows moment scores; **Video share** shows % of the current file where each of the seven face words was dominant (sampled every ~5s).

| Layer | Stack |
|-------|--------|
| Offline ML | `python3 _scripts/analyze_testimony_emotions.py` → `sessions/testimony-emotion-ml.json` |
| Live face | ml5 face mesh — blue box on video |
| Review UI | `emotion-mirror.html` |

**Local video:** H.264 proxies in `sessions/testimony/*.mp4` (gitignored). Page loads on GitHub Pages; video plays when files are present locally.

See [face-signal-thought-replay.md](./face-signal-thought-replay.md) · [README](./README.md).
