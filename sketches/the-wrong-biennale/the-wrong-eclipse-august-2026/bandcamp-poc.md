# Bandcamp PoC — Holes in the Sky

Submission for [The Wrong Eclipse](https://thewrong.org/) · deadline **1 Aug 2026** · **thewrongbiennale@gmail.com** · subject **The Wrong Eclipse**.

## Deliverables

| Item | Source |
|------|--------|
| **Audio** | Binaural / stereo L–R track (headphones) |
| **Cover** | Screenshot of generator UI (`holes-in-the-sky.html` or OF brain window) |
| **Title** | Holes in the Sky |
| **Artist** | Mark Walhimer |

## Record PoC (browser)

1. Open [holes-in-the-sky.html](./holes-in-the-sky.html) · **headphones**
2. Tap **Start**
3. Tap **Record PoC** — runs with simulate arc (~10 min) or stop early
4. Tap **Stop record** — downloads `holes-in-the-sky-poc-{timestamp}.webm`
5. Import to DAW · export ** stereo WAV** for Bandcamp if needed

## Record PoC (eclipse-day stack — canonical path)

1. Pure Data `pure-data/holes-in-the-sky-vanilla.pd` · DSP on
2. OpenFrameworks brain + `feed-bridge.mjs` · live Maitino feeds
3. Record PD master bus (BlackHole / Soundflower / hardware out)
4. Full partial arc **~19:40–21:26 CEST** · 12 Aug 2026

## After 12 Aug 2026

Live re-record during eclipse replaces PoC as the authoritative work. Bandcamp upload updated; PoC retained as process artifact if desired.

## Checklist before send

- [ ] Stereo/binaural WAV or Bandcamp-hosted track
- [ ] Cover image (generator screenshot)
- [ ] Bandcamp link public or unlisted
- [ ] Email with title, artist info, contact
