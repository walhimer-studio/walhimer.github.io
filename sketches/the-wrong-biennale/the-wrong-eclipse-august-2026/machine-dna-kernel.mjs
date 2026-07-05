/**
 * Machine DNA — Holes in the Sky species.
 * Same express() contract as Emergent DNA hosts; distinct traits and temperament.
 */

import { makeRng, birthSeed } from "../../../machine-aesthetic/emergent-dna/kernel/rng.mjs";

export const SCHEMA_VERSION = 1;
export const SPECIES_ID = "holes-in-the-sky";

const DEFAULT_TRAITS = Object.freeze({
  sky: 0.62,
  obscuration: 0,
  atmosphere: 0.4,
  listening: 0.55,
  machine: 0.68,
});

const PHASE_PERIODS = [41, 59, 67, 83, 101];

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function phaseValue(age, period) {
  return (age / period) % 1;
}

function lifeStageFor(norm) {
  if (norm < 0.15) return "juvenile";
  if (norm < 0.55) return "mature";
  if (norm < 0.85) return "senescent";
  if (norm < 1) return "dying";
  return "dead";
}

export function createMachineDna(opts = {}) {
  const seed = opts.seed != null ? opts.seed >>> 0 : birthSeed(120826);
  const lifespanSeconds = opts.lifespanSeconds ?? 6360;

  const state = {
    schemaVersion: SCHEMA_VERSION,
    speciesId: SPECIES_ID,
    label: opts.label ?? "maitino-eclipse-2026",
    seed,
    generation: opts.generation ?? 0,
    parentId: opts.parentId ?? null,
    age: 0,
    lifespanSeconds,
    vitality: 1,
    stress: 0,
    traits: { ...DEFAULT_TRAITS, ...(opts.traits ?? {}) },
    eclipsePhase: "idle",
    obscuration: 0,
    flags: { dead: false, listening: true },
    _rng: makeRng(seed),
  };

  function normalizedAge() {
    return clamp01(state.age / state.lifespanSeconds);
  }

  return {
    update(dt, input = {}) {
      if (state.flags.dead) return;

      state.age += dt;
      const norm = normalizedAge();
      if (norm >= 1) {
        state.flags.dead = true;
        state.vitality = 0;
        return;
      }

      const obscuration = clamp01(input.obscuration ?? state.obscuration);
      const atmosphere = clamp01(input.atmosphere ?? state.traits.atmosphere);
      const eclipsePhase = input.eclipsePhase ?? state.eclipsePhase;

      state.obscuration = obscuration;
      state.eclipsePhase = eclipsePhase;
      state.traits.obscuration = obscuration;
      state.traits.atmosphere = clamp01(atmosphere * 0.7 + state.traits.atmosphere * 0.3);
      state.traits.sky = clamp01(1 - obscuration * 0.85 + state.traits.listening * 0.1);
      state.traits.listening = clamp01(
        state.traits.listening + dt * (0.01 + obscuration * 0.02) - dt * (input.aircraft ?? 0) * 0.008
      );
      state.traits.machine = clamp01(
        0.55 + state.traits.atmosphere * 0.25 + obscuration * 0.15
      );

      if (eclipsePhase === "reverse") {
        state.stress = clamp01(state.stress + dt * 0.04);
        state.vitality = clamp01(state.vitality - dt * 0.008);
      } else if (eclipsePhase === "deep") {
        state.vitality = clamp01(1 - norm * 0.2);
      } else {
        state.vitality = clamp01(1 - norm * 0.45);
        state.stress = clamp01(state.stress - dt * 0.02);
      }
    },

    express() {
      const phases = PHASE_PERIODS.map((p) => phaseValue(state.age, p));
      return {
        schemaVersion: SCHEMA_VERSION,
        speciesId: state.speciesId,
        label: state.label,
        seed: state.seed,
        generation: state.generation,
        parentId: state.parentId,
        age: state.age,
        lifespanSeconds: state.lifespanSeconds,
        normalizedAge: normalizedAge(),
        lifeStage: lifeStageFor(normalizedAge()),
        vitality: state.vitality,
        stress: state.stress,
        traits: { ...state.traits },
        phases,
        scars: [],
        eclipsePhase: state.eclipsePhase,
        obscuration: state.obscuration,
        flags: { ...state.flags, breaking: false, recentGold: false },
      };
    },
  };
}
