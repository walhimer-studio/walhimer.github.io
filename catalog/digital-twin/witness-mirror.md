# Witness Mirror

Testimony on video — the machine **witnesses** your face; you scrub, mute, and learn where your words and your body disagree. ML5 live face box + DeepFace offline analysis (Python) + HTML/JavaScript review.

**Live (5s — evaluation):** https://mark-walhimer.com/sketches/digital-twin/witness-mirror.html

**Live (1s — moment audit):** https://mark-walhimer.com/sketches/digital-twin/witness-mirror-1s.html

| Layer | Stack |
|-------|--------|
| Offline ML | `python3 _scripts/analyze_testimony_emotions.py` → `sessions/witness-mirror-ml.json` |
| Live face | ml5 face mesh — blue box on video |
| Review UI | `witness-mirror.html` · `witness-mirror-1s.html` |

**5s** — Video share: what % of this take was each face word (evaluation). **1s** — scrub to a second, dispute or confirm the read (masking, grief vs fear, etc.).

**Local video:** H.264 proxies in `sessions/testimony/*.mp4` (gitignored).

See [witness-mirror-1s.md](./witness-mirror-1s.md) · [face-signal-thought-replay.md](./face-signal-thought-replay.md) · [README](./README.md).
