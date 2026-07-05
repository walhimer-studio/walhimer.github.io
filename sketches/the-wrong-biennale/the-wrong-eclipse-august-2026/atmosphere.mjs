/**
 * Atmospheric inputs — simulated drift or live feeds (METAR / NOAA / OpenSky / ISS).
 */

import { makeRng } from "../../../machine-aesthetic/emergent-dna/kernel/rng.mjs";
import { createLivePoller } from "./live-feeds.mjs";

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export function createAtmosphere(seed = 120826, opts = {}) {
  const rng = makeRng(seed);
  const liveMode = Boolean(opts.live);

  const state = {
    cloud: 0.35,
    wind: 0.2,
    humidity: 0.5,
    aircraft: 0,
    satellite: 0,
    particulate: 0.15,
    live: false,
    feedLabel: liveMode ? "live · waiting" : "simulate",
  };

  let poller = null;
  if (liveMode) {
    poller = createLivePoller((data) => {
      state.cloud = data.cloud ?? state.cloud;
      state.wind = data.wind ?? state.wind;
      state.humidity = data.humidity ?? state.humidity;
      state.aircraft = data.aircraft ?? state.aircraft;
      state.satellite = data.satellite ?? state.satellite;
      state.particulate = data.particulate ?? state.particulate;
      state.live = Boolean(data.live);
      state.feedLabel = data.live
        ? `live · ${(data.sources ?? []).join("+")}`
        : `live partial · ${data.errors?.length ?? 0} fail`;
    });
    poller.start();
  }

  function tick(dt, obscuration = 0, phase = "forward") {
    if (!liveMode) {
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
    }

    if (phase === "reverse") {
      state.wind = clamp01(state.wind + dt * 0.03);
    }

    return snapshot();
  }

  function snapshot() {
    const density = clamp01(
      (state.cloud + state.particulate + state.aircraft * 0.4 + state.satellite * 0.2) / 2.2
    );
    return {
      cloud: state.cloud,
      wind: state.wind,
      humidity: state.humidity,
      aircraft: state.aircraft,
      satellite: state.satellite,
      particulate: state.particulate,
      density,
      live: state.live,
      feedLabel: state.feedLabel,
    };
  }

  function dispose() {
    poller?.stop();
  }

  return { tick, snapshot, dispose, setLiveMode(on) {
    if (on && !poller) {
      poller = createLivePoller((data) => {
        Object.assign(state, {
          cloud: data.cloud ?? state.cloud,
          wind: data.wind ?? state.wind,
          aircraft: data.aircraft ?? state.aircraft,
          satellite: data.satellite ?? state.satellite,
          live: Boolean(data.live),
          feedLabel: data.live ? "live" : "live partial",
        });
      });
      poller.start();
    } else if (!on && poller) {
      poller.stop();
      poller = null;
      state.feedLabel = "simulate";
      state.live = false;
    }
  }};
}
