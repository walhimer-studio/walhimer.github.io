/**
 * Maitino / Alicante partial eclipse · 12 August 2026 (CEST).
 * Times from catalog statement; same province as Maitino within seconds.
 */

export const MAITINO = Object.freeze({
  label: "Partida Maitino 2069c, Alicante, 03295, Spain",
  lat: 38.3452,
  lon: -0.481,
  timezone: "Europe/Madrid",
  eclipseDate: "2026-08-12",
  firstContact: { h: 19, m: 39, s: 59 },
  maximum: { h: 20, m: 34, s: 59 },
  lastContact: { h: 21, m: 25, s: 59 },
  maxObscuration: 0.991,
  reverseHalfSeconds: 30,
  deepObscuration: 0.99,
});

const CEST_OFFSET_MS = 2 * 60 * 60 * 1000;

function wallPartsToUtcMs(dateStr, parts) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const utcMs =
    Date.UTC(y, mo - 1, d, parts.h - 2, parts.m, parts.s);
  return utcMs;
}

export function eclipseTimeline() {
  const t0 = wallPartsToUtcMs(MAITINO.eclipseDate, MAITINO.firstContact);
  const tMax = wallPartsToUtcMs(MAITINO.eclipseDate, MAITINO.maximum);
  const t1 = wallPartsToUtcMs(MAITINO.eclipseDate, MAITINO.lastContact);
  return {
    startMs: t0,
    maxMs: tMax,
    endMs: t1,
    durationMs: t1 - t0,
    reverseStartMs: tMax - MAITINO.reverseHalfSeconds * 1000,
    reverseEndMs: tMax + MAITINO.reverseHalfSeconds * 1000,
  };
}

export function obscurationAtProgress(p) {
  const t = Math.max(0, Math.min(1, p));
  const peak = 0.5;
  if (t <= peak) return MAITINO.maxObscuration * (t / peak);
  return MAITINO.maxObscuration * ((1 - t) / (1 - peak));
}

export function phaseAtProgress(p, reverseHalf = 0.05) {
  const t = Math.max(0, Math.min(1, p));
  const rev0 = 0.5 - reverseHalf;
  const rev1 = 0.5 + reverseHalf;
  if (t < rev0) return "forward";
  if (t <= rev1) {
    const obs = obscurationAtProgress(t);
    if (obs >= MAITINO.deepObscuration && t < 0.5) return "deep";
    return "reverse";
  }
  return "unwind";
}

export function createEclipseClock(mode = "simulate") {
  const live = eclipseTimeline();
  const simulateDurationSec = 600;
  const simulateReverseHalf = 30 / (live.durationMs / 1000) * simulateDurationSec;

  let running = false;
  let startedAt = 0;
  let pausedElapsed = 0;

  function progress(nowMs = Date.now()) {
    if (mode === "live") {
      if (nowMs < live.startMs) return 0;
      if (nowMs > live.endMs) return 1;
      return (nowMs - live.startMs) / live.durationMs;
    }
    if (!running) return pausedElapsed / simulateDurationSec;
    const elapsed = (performance.now() - startedAt) / 1000;
    return Math.min(1, elapsed / simulateDurationSec);
  }

  return {
    mode,
    live,
    simulateDurationSec,

    start() {
      running = true;
      startedAt = performance.now();
    },

    stop() {
      if (running) {
        pausedElapsed = Math.min(
          simulateDurationSec,
          (performance.now() - startedAt) / 1000
        );
      }
      running = false;
    },

    reset() {
      running = false;
      pausedElapsed = 0;
      startedAt = 0;
    },

    isRunning() {
      return running;
    },

    snapshot(nowMs = Date.now()) {
      const p = progress(nowMs);
      const reverseHalf =
        mode === "live"
          ? MAITINO.reverseHalfSeconds / (live.durationMs / 1000)
          : simulateReverseHalf / simulateDurationSec;
      const phase = phaseAtProgress(p, reverseHalf);
      const obscuration = obscurationAtProgress(p);
      const elapsedSec =
        mode === "live"
          ? Math.max(0, (nowMs - live.startMs) / 1000)
          : p * simulateDurationSec;

      return {
        progress: p,
        phase,
        obscuration,
        elapsedSec,
        running: mode === "live" ? nowMs >= live.startMs && nowMs <= live.endMs : running,
        reverseActive: phase === "reverse",
        label:
          mode === "live"
            ? "Live · 12 Aug 2026 CEST"
            : running
              ? "Simulate · compressed arc"
              : "Simulate · paused",
      };
    },
  };
}
