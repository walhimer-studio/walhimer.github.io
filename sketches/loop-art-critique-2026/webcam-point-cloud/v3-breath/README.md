# Webcam point cloud · v3 breath

Live sketch under **`sketches/loop-art-critique-2026/webcam-point-cloud/v3-breath/`**.

## Files

| File | Role |
|------|------|
| `index.html` | Face-masked brightness → Z point cloud (p5 WEBGL), ml5 Face Mesh, lip-based breath estimate, optional Web Audio (Salamander **C2** sample + synth fallback, exhale-linked). |
| `C2v8.wav` | Bundled deep piano note (Salamander lite C2) — folder is **self-contained** for deploy. |
| `OVERVIEW.md` | Short orientation — links to the other markdown files. |
| `README.md` | This file — behavior and run instructions for **this** folder. |
| `style-guide.md` | Voice / UX copy conventions for **this** sketch; aligns with the Acceptance Feed project doc. |

## Why the main Acceptance Feed docs aren’t only here

Project-level README + style guide for **Acceptance Feed** live under **`machine aesthetic/acceptance-feed/`** because that folder was created first as the umbrella for the artwork (GitHub template + Firebase later + conceptual framing). **`v3-breath`** is a **concrete prototype** in the Loop Miami sketch tree; it carries its **own** README and style notes **here** so the artifact and docs sit together for anyone opening only this folder.

Canonical longer narrative: [`machine aesthetic/acceptance-feed/README.md`](../../../../machine%20aesthetic/acceptance-feed/README.md)

## Run locally

Browsers block camera + `fetch` for samples unless you use **`http://` or `https://`** (not raw `file://`).

From repo root:

```bash
python3 -m http.server 8080
```

Open:

`/sketches/loop-art-critique-2026/webcam-point-cloud/v3-breath/index.html`

Click **Enable sound** — you should hear a short test tone; exhale with lips slightly open for breath-linked audio.

## Author

Mark Walhimer · Walhimer Studio · [walhimer.github.io](https://github.com/walhimer-studio/walhimer.github.io)
