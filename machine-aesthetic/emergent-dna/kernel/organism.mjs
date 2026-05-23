import { makeRng, birthSeed } from "./rng.mjs";

export const SCHEMA_VERSION = 1;
export const LIFE_STAGE = Object.freeze({
  JUVENILE: "juvenile",
  MATURE: "mature",
  SENESCENT: "senescent",
  DYING: "dying",
  DEAD: "dead",
});

const DEFAULT_TRAITS = Object.freeze({
  warmth: 0.45,
  machine: 0.72,
  surrender: 0.38,
  scar: 0.0,
  gold: 0.0,
});

/** Eno-style mismatched loop lengths (seconds). */
const PHASE_PERIODS = [47, 53, 71, 89, 97];

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function lifeStageFor(normalizedAge) {
  if (normalizedAge < 0.2) return LIFE_STAGE.JUVENILE;
  if (normalizedAge < 0.65) return LIFE_STAGE.MATURE;
  if (normalizedAge < 0.9) return LIFE_STAGE.SENESCENT;
  if (normalizedAge < 1) return LIFE_STAGE.DYING;
  return LIFE_STAGE.DEAD;
}

function phaseValue(age, period) {
  return (0.5 + 0.5 * Math.sin(((age / period) * Math.PI * 2))) % 1;
}

/**
 * @param {object} opts
 * @param {number} [opts.seed]
 * @param {string} [opts.speciesId]
 * @param {number} [opts.lifespanSeconds]
 * @param {string} [opts.label]
 * @param {number} [opts.generation]
 * @param {string|null} [opts.parentId]
 */
export function createOrganism(opts = {}) {
  const seed = opts.seed != null ? opts.seed >>> 0 : birthSeed();
  const lifespanSeconds = opts.lifespanSeconds ?? 3600;
  const speciesId = opts.speciesId ?? "surrender-machines";

  const state = {
    schemaVersion: SCHEMA_VERSION,
    speciesId,
    label: opts.label ?? null,
    seed,
    generation: opts.generation ?? 0,
    parentId: opts.parentId ?? null,
    age: 0,
    lifespanSeconds,
    vitality: 1,
    stress: 0,
    traits: { ...DEFAULT_TRAITS, ...(opts.traits ?? {}) },
    scars: [],
    flags: {
      breaking: false,
      recentGold: false,
      dead: false,
    },
    _goldTimer: 0,
    _breakTimer: 0,
    _rng: makeRng(seed),
  };

  function normalizedAge() {
    return clamp01(state.age / state.lifespanSeconds);
  }

  function lifeStage() {
    if (state.flags.dead) return LIFE_STAGE.DEAD;
    return lifeStageFor(normalizedAge());
  }

  function addScar(trait, delta, reason = "break") {
    const scar = {
      id: `${state.scars.length}-${state.seed}`,
      trait,
      delta: clamp01(delta),
      reason,
      atAge: state.age,
    };
    state.scars.push(scar);
    if (trait in state.traits) {
      state.traits[trait] = clamp01(state.traits[trait] + delta);
    }
    state.traits.scar = clamp01(state.traits.scar + delta * 0.5);
  }

  function applyGold(intensity = 0.6) {
    const delta = clamp01(intensity * 0.35);
    addScar("gold", delta, "gold");
    state.traits.warmth = clamp01(state.traits.warmth + delta * 0.25);
    state.traits.surrender = clamp01(state.traits.surrender + delta * 0.15);
    state.flags.recentGold = true;
    state._goldTimer = 8;
    state.stress = clamp01(state.stress * 0.55);
    state.flags.breaking = false;
    state._breakTimer = 0;
  }

  return {
    update(dt, input = {}) {
      if (state.flags.dead) return;

      state.age += dt;
      const norm = normalizedAge();
      const stage = lifeStage();

      if (norm >= 1) {
        state.flags.dead = true;
        state.vitality = 0;
        return;
      }

      const presence = clamp01(input.presence ?? 0);
      const calm = clamp01(input.calm ?? 0.5);
      const stressNudge = clamp01(input.stressNudge ?? 0);

      state.stress = clamp01(
        state.stress +
          dt * (0.015 + presence * 0.02) -
          dt * calm * 0.025 +
          stressNudge * 0.1
      );

      if (stage === LIFE_STAGE.SENESCENT || stage === LIFE_STAGE.DYING) {
        state.stress = clamp01(state.stress + dt * 0.01);
        state.vitality = clamp01(1 - norm * 0.85);
      } else {
        state.vitality = clamp01(1 - norm * 0.35);
      }

      if (state._goldTimer > 0) {
        state._goldTimer = Math.max(0, state._goldTimer - dt);
        if (state._goldTimer === 0) state.flags.recentGold = false;
      }

      if (state.flags.breaking) {
        state._breakTimer = Math.max(0, state._breakTimer - dt);
        if (state._breakTimer === 0) state.flags.breaking = false;
      }

      const breakThreshold = stage === LIFE_STAGE.MATURE ? 0.82 : 0.68;
      if (!state.flags.breaking && state.stress > breakThreshold && state._rng.random() < dt * 0.4) {
        this.applyEvent({ type: "break", intensity: state.stress });
      }
    },

    applyEvent(event) {
      if (state.flags.dead || !event?.type) return;

      switch (event.type) {
        case "visitor_nudge": {
          const n = clamp01(event.intensity ?? 0.2);
          state.traits.surrender = clamp01(state.traits.surrender + n * 0.05);
          state.stress = clamp01(state.stress + n * 0.08);
          break;
        }
        case "break": {
          const intensity = clamp01(event.intensity ?? 0.6);
          state.flags.breaking = true;
          state._breakTimer = 2 + intensity * 3;
          state.traits.machine = clamp01(state.traits.machine + intensity * 0.08);
          addScar("scar", intensity * 0.2, "break");
          if (state._rng.random() < 0.35 + intensity * 0.45) {
            applyGold(intensity);
          } else {
            state.stress = clamp01(state.stress + 0.12);
          }
          break;
        }
        case "gold":
          applyGold(clamp01(event.intensity ?? 0.7));
          break;
        case "seed": {
          state.generation += 1;
          state.parentId = event.parentId ?? String(state.seed);
          state.seed = state._rng.randint(1, 999999) >>> 0;
          state._rng = makeRng(state.seed);
          state.age = 0;
          state.stress = 0;
          state.vitality = 1;
          state.flags.dead = false;
          state.flags.breaking = false;
          state.flags.recentGold = false;
          break;
        }
        case "death":
          state.flags.dead = true;
          state.vitality = 0;
          break;
        default:
          break;
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
        lifeStage: lifeStage(),
        vitality: state.vitality,
        stress: state.stress,
        traits: { ...state.traits },
        phases,
        scars: state.scars.map((s) => ({ ...s })),
        flags: { ...state.flags },
      };
    },

    serialize() {
      return JSON.stringify({
        ...this.express(),
        _internal: {
          _goldTimer: state._goldTimer,
          _breakTimer: state._breakTimer,
        },
      });
    },

    deserialize(json) {
      const data = typeof json === "string" ? JSON.parse(json) : json;
      if (data.seed != null) state.seed = data.seed >>> 0;
      if (data.speciesId) state.speciesId = data.speciesId;
      if (data.label !== undefined) state.label = data.label;
      if (data.generation != null) state.generation = data.generation;
      if (data.parentId !== undefined) state.parentId = data.parentId;
      if (data.age != null) state.age = data.age;
      if (data.lifespanSeconds != null) state.lifespanSeconds = data.lifespanSeconds;
      if (data.vitality != null) state.vitality = data.vitality;
      if (data.stress != null) state.stress = data.stress;
      if (data.traits) state.traits = { ...DEFAULT_TRAITS, ...data.traits };
      if (data.scars) state.scars = data.scars.map((s) => ({ ...s }));
      if (data.flags) state.flags = { ...state.flags, ...data.flags };
      if (data._internal) {
        state._goldTimer = data._internal._goldTimer ?? 0;
        state._breakTimer = data._internal._breakTimer ?? 0;
      }
      state._rng = makeRng(state.seed);
    },
  };
}
