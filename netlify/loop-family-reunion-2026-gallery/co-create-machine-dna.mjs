/**
 * Co-Create Machine DNA — Bloom four-wall garden host.
 * Seed · garden arc lifeline · pentatonic DNA notes · express() genome.
 */

export const SCHEMA_VERSION = 1;
export const SPECIES_ID = 'co-create';

export const GARDEN = Object.freeze({
  TOTAL_BLOOMS: 22,
  SPAWN_INTERVAL: 1800,
  HOLD_AFTER_FULL: 8000,
  FADE_TAIL_MS: 30000,
});

export function totalLifeMs() {
  const g = GARDEN;
  return g.TOTAL_BLOOMS * g.SPAWN_INTERVAL + g.HOLD_AFTER_FULL + g.FADE_TAIL_MS;
}

export const PENTA_POOL = Object.freeze([
  'C2', 'D2', 'E2', 'G2', 'A2',
  'C3', 'D3', 'E3', 'G3', 'A3',
  'C4', 'D4', 'E4', 'G4', 'A4',
  'C5', 'D5', 'E5', 'G5', 'A5',
  'C6', 'D6',
]);

const DEFAULT_TRAITS = Object.freeze({
  warmth: 0.58,
  machine: 0.74,
  surrender: 0.62,
  scar: 0,
  bloom: 0.85,
});

const PHASE_PERIODS = [41, 59, 67, 83, 101];

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function lifeStageFor(normalizedAge) {
  if (normalizedAge < 0.15) return 'juvenile';
  if (normalizedAge < 0.55) return 'mature';
  if (normalizedAge < 0.85) return 'senescent';
  if (normalizedAge < 1) return 'dying';
  return 'dead';
}

function phaseValue(age, period) {
  return (age / period) % 1;
}

export function birthSeed(fallback = 77823) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] >>> 0;
  }
  return (fallback ^ ((Date.now() & 0xffff) << 16)) >>> 0;
}

export function hashStringToSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** @param {URLSearchParams|{ get: (k: string) => string|null }} params */
export function parseSeed(params, roomId) {
  const raw = params?.get?.('seed');
  if (raw != null && raw !== '') {
    const n = Number(raw);
    if (Number.isFinite(n)) return n >>> 0;
    return hashStringToSeed(String(raw));
  }
  if (roomId) return hashStringToSeed(`co-create:${roomId}`);
  return birthSeed(20260729);
}

/** Fisher–Yates shuffle; rng must expose range(a, b). */
export function shuffleNotePool(rng) {
  const pool = [...PENTA_POOL];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng.range(0, i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function formatMachineDnaLine(express, lifePct) {
  const seed = express.seed >>> 0;
  const gen = express.generation;
  const stage = express.lifeStage;
  const vit = express.vitality.toFixed(2);
  const life = typeof lifePct === 'number' ? lifePct.toFixed(1) : '0.0';
  return `seed ${seed} · gen ${gen} · ${stage} · vit ${vit} · lifeline ${life}%`;
}

/**
 * @param {object} opts
 * @param {number} [opts.seed]
 * @param {string} [opts.label]
 * @param {number} [opts.generation]
 * @param {number} [opts.lifespanSeconds]
 */
export function createCoCreateMachineDna(opts = {}) {
  const seed = opts.seed != null ? opts.seed >>> 0 : birthSeed();
  const lifespanSeconds = opts.lifespanSeconds ?? totalLifeMs() / 1000;

  const state = {
    schemaVersion: SCHEMA_VERSION,
    speciesId: SPECIES_ID,
    label: opts.label ?? 'co-create',
    seed,
    generation: opts.generation ?? 0,
    parentId: opts.parentId ?? null,
    age: 0,
    lifespanSeconds,
    vitality: 1,
    stress: 0,
    traits: { ...DEFAULT_TRAITS, ...(opts.traits ?? {}) },
    scars: [],
    flags: { dead: false, listening: true },
    cycleCount: 0,
  };

  function normalizedAge() {
    return clamp01(state.age / state.lifespanSeconds);
  }

  return {
    get seed() { return state.seed; },

    /** Garden cycle ended — increment generation, rebirth same seed lineage. */
    onGardenCycleComplete() {
      state.cycleCount += 1;
      state.generation += 1;
      state.age = 0;
      state.vitality = 1;
      state.stress = 0;
      state.flags.dead = false;
    },

    /** Sync organism age to garden elapsed seconds within current cycle. */
    syncGardenAge(elapsedSeconds) {
      state.age = Math.max(0, elapsedSeconds);
      const norm = normalizedAge();
      if (norm >= 1) {
        state.flags.dead = true;
        state.vitality = 0;
        return;
      }
      state.flags.dead = false;
    },

    update(dt, input = {}) {
      if (state.flags.dead && state.age >= state.lifespanSeconds) return;

      const scarLoad = clamp01(input.scarLoad ?? state.traits.scar);
      state.traits.scar = scarLoad;
      state.traits.surrender = clamp01(0.45 + scarLoad * 0.55);
      state.traits.warmth = clamp01(0.52 + scarLoad * 0.2);
      state.traits.machine = clamp01(0.68 + (1 - normalizedAge()) * 0.12);

      const norm = normalizedAge();
      state.vitality = clamp01(1 - norm * 0.45 - state.stress * 0.15);
      state.stress = clamp01(state.stress - dt * 0.015 + scarLoad * dt * 0.004);
    },

    express() {
      const norm = normalizedAge();
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
        normalizedAge: norm,
        lifeStage: lifeStageFor(norm),
        vitality: state.vitality,
        stress: state.stress,
        traits: { ...state.traits },
        phases,
        scars: [...state.scars],
        cycleCount: state.cycleCount,
        flags: { ...state.flags },
      };
    },
  };
}
