# Holes in the Sky — OpenFrameworks brain

C++ host: **life bar**, **obscuration bar**, Machine DNA tick, **OSC `/hit`** to Pure Data (port **9000**).

## Build

From openFrameworks `apps/myApps/` (or symlink this folder):

```bash
# copy or symlink:
# walhimer.github.io/sketches/the-wrong-biennale/the-wrong-eclipse-august-2026/openframeworks/HolesInTheSky

make Release -C HolesInTheSky
./HolesInTheSky/bin/HolesInTheSky
```

Requires **ofxOsc** (`addons.make`).

## Controls

| Key | Action |
|-----|--------|
| Space | Start / stop simulate arc |
| R | Reset |

## Stack on eclipse day (12 Aug 2026)

1. `./HolesInTheSky` — brain + OSC
2. `node feed-bridge.mjs` — METAR / NOAA / OpenSky / ISS → `live-cache.json` + FUDI to PD **9001**
3. Open `pure-data/holes-in-the-sky-vanilla.pd` — Salamander + binaural (DSP on)
4. Browser `listening-to-the-sky.html` optional monitor; authoritative audio from PD + live re-record

Kernel logic mirrors `machine-dna-kernel.mjs` and `eclipse-clock.mjs`.
