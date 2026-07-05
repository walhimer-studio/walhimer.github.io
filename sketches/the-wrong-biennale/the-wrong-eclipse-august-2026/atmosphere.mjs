/**
 * Atmospheric inputs for Holes in the Sky — PoC simulators.
 * Live run (12 Aug 2026): replace fetch* stubs with NOAA, METAR, flight, satellite APIs.
 */

import { makeRng } from "../../../machine-aesthetic/emergent-dna/kernel/rng.mjs";

export function createAtmosphere(seed = 120826) {
  const rng = makeRng(seed);

  const state = {
    cloud: 0.35,
    wind: 0.2,
    humidity: 0.5,
    aircraft: 0,
    satellite: 0,
    particulate: 0.15,
  };

  function tick(dt, obscuration = 0, phase = "forward") {
    const drift = 0.04 * dt;
    state.cloud = clamp01(state.cloud + (rng.random() - 0.48) * drift);
    state.wind = clamp01(state.wind + (rng.random() - 0.5) * drift * 0.8);
    state.humidity = clamp01(state.humidity + (rng.random() - 0.45) * drift * 0.5);
    state.particulate = clamp01(
      0.12 + obscuration * 0.35 + state.cloud * 0.25 + rng.random() * 0.02
    );

    if (rng.random() < dt * (0.08 + obscuration * 0.12)) {
      state.aircraft = clamp01(0.4 + rng.random() * 0.6);
    } else {
      state.aircraft = clamp01(state.aircraft - dt * 0.35);
    }

    if (rng.random() < dt * 0.025) {
      state.satellite = clamp01(0.55 + rng.random() * 0.45);
    } else {
      state.satellite = clamp01(state.satellite - dt * 0.2);
    }

    if (phase === "reverse") {
      state.wind = clamp01(state.wind + dt * 0.03);
    }

    return snapshot();
  }

  function snapshot() {
    return {
      cloud: state.cloud,
      wind: state.wind,
      humidity: state.humidity,
      aircraft: state.aircraft,
      satellite: state.satellite,
      particulate: state.particulate,
      density: clamp01(
        (state.cloud + state.particulate + state.aircraft * 0.4 + state.satellite * 0.2) / 2.2
      ),
    };
  }

  return { tick, snapshot };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

/** Placeholders for live API wiring on eclipse day. */
export async function fetchMetarPlaceholder() {
  return { source: "stub", ceiling: null, windKt: null };
}

export async function fetchNoaaPlaceholder() {
  return { source: "stub", cloudCover: null };
}

export async function fetchFlightsPlaceholder() {
  return { source: "stub", count: 0 };
}

export async function fetchSatellitesPlaceholder() {
  return { source: "stub", passes: [] };
}
