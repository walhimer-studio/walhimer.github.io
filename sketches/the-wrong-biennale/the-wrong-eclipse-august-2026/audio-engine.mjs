/**
 * Pentatonic Salamander sampler + binaural stereo field.
 * Bloom-adjacent note pool; L/R pan from DNA phases and note index.
 */

const PENTA_POOL = [
  "C2", "D2", "E2", "G2", "A2",
  "C3", "D3", "E3", "G3", "A3",
  "C4", "D4", "E4", "G4", "A4",
  "C5", "D5", "E5", "G5", "A5",
  "C6",
];

/** Pentatonic mapping — D/E/G from Ds/Fs roots (Salamander minor-thirds pack). */
const NOTE_MAP = {
  C2: { s: "C2", r: 1.0 },
  D2: { s: "Ds2", r: 0.943874 },
  E2: { s: "Ds2", r: 1.059463 },
  G2: { s: "Fs2", r: 1.059463 },
  A2: { s: "A2", r: 1.0 },
  C3: { s: "C3", r: 1.0 },
  D3: { s: "Ds3", r: 0.943874 },
  E3: { s: "Ds3", r: 1.059463 },
  G3: { s: "Fs3", r: 1.059463 },
  A3: { s: "A3", r: 1.0 },
  C4: { s: "C4", r: 1.0 },
  D4: { s: "Ds4", r: 0.943874 },
  E4: { s: "Ds4", r: 1.059463 },
  G4: { s: "Fs4", r: 1.059463 },
  A4: { s: "A4", r: 1.0 },
  C5: { s: "C5", r: 1.0 },
  D5: { s: "Ds5", r: 0.943874 },
  E5: { s: "Ds5", r: 1.059463 },
  G5: { s: "Fs5", r: 1.059463 },
  A5: { s: "A5", r: 1.0 },
  C6: { s: "C6", r: 1.0 },
};

/** Unique mp3 roots in samples/salamander/pentatonic/ */
export const SALAMANDER_PENTATONIC_FILES = [
  "C2", "C3", "C4", "C5", "C6",
  "A2", "A3", "A4", "A5",
  "Ds2", "Ds3", "Ds4", "Ds5", "Ds6",
  "Fs2", "Fs3", "Fs4", "Fs5", "Fs6",
];

export function createAudioEngine(
  sampleBase = "samples/salamander/pentatonic/",
  opts = {}
) {
  let ctx = null;
  let master = null;
  let buffers = {};
  let ready = false;
  const noteHistory = [];
  let reverseIndex = -1;
  const onNote = opts.onNote ?? null;

  async function load(onProgress) {
    if (ready) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.72;
    master.connect(ctx.destination);

    const needed = SALAMANDER_PENTATONIC_FILES;
    let loaded = 0;
    for (const sample of needed) {
      const url = `${sampleBase}${sample}.mp3`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Salamander sample missing: ${url} (${res.status})`);
      }
      const ab = await res.arrayBuffer();
      buffers[sample] = await ctx.decodeAudioData(ab);
      loaded += 1;
      if (onProgress) onProgress(loaded, needed.length, sample);
    }
    ready = true;
  }

  function panFromSnapshot(snapshot, noteIdx) {
    const p0 = snapshot.phases?.[0] ?? 0.5;
    const p1 = snapshot.phases?.[2] ?? 0.5;
    const listen = snapshot.traits?.listening ?? 0.5;
    const base = (noteIdx * 0.137 + p0 * 0.4 + listen * 0.2) % 1;
    const spread = 0.35 + (snapshot.traits?.atmosphere ?? 0.3) * 0.4;
    return Math.max(-1, Math.min(1, (base - 0.5) * 2 * spread + (p1 - 0.5) * 0.5));
  }

  function playNote(noteName, velocity, pan, record = true) {
    if (!ready || !ctx) return null;
    const map = NOTE_MAP[noteName];
    if (!map) return null;
    const buf = buffers[map.s];
    if (!buf) return null;

    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = map.r;

    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));

    const v = Math.max(0.02, Math.min(0.55, velocity));
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(v, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

    src.connect(gain);
    gain.connect(panner);
    panner.connect(master);
    src.start(now);
    src.stop(now + 4.2);

    const event = { noteName, velocity: v, pan, at: performance.now() };
    if (record) noteHistory.push(event);
    if (onNote) onNote(event);
    return event;
  }

  function pickNote(snapshot, rng) {
    const obsc = snapshot.obscuration ?? 0;
    const idxBase = Math.floor(
      (snapshot.normalizedAge ?? 0) * PENTA_POOL.length * 0.6 +
        (snapshot.phases?.[1] ?? 0) * 7 +
        obsc * 5
    );
    const jitter = Math.floor(rng() * 3) - 1;
    return PENTA_POOL[Math.max(0, Math.min(PENTA_POOL.length - 1, idxBase + jitter))];
  }

  function triggerForward(snapshot, rng, atmosphere) {
    const density =
      0.35 +
      (snapshot.traits?.atmosphere ?? 0.3) * 0.4 +
      (atmosphere?.aircraft ?? 0) * 0.25 +
      (snapshot.obscuration ?? 0) * 0.3;
    if (rng() > density * 0.08) return null;
    const note = pickNote(snapshot, rng);
    const vel = 0.08 + (snapshot.traits?.listening ?? 0.4) * 0.12 + rng() * 0.06;
    const pan = panFromSnapshot(snapshot, noteHistory.length);
    return playNote(note, vel, pan, true);
  }

  function triggerReverse(snapshot) {
    if (noteHistory.length === 0) return null;
    if (reverseIndex < 0) reverseIndex = noteHistory.length - 1;
    if (reverseIndex < 0) return null;
    const ev = noteHistory[reverseIndex];
    reverseIndex -= 1;
    const vel = ev.velocity * (0.85 + (snapshot.stress ?? 0) * 0.2);
    return playNote(ev.noteName, vel, -ev.pan * 0.9, false);
  }

  function resetReverse() {
    reverseIndex = -1;
  }

  function resume() {
    if (ctx && ctx.state === "suspended") return ctx.resume();
    return Promise.resolve();
  }

  return {
    load,
    resume,
    isReady: () => ready,
    getContext: () => ctx,
    getMaster: () => master,
    triggerForward,
    triggerReverse,
    resetReverse,
    noteCount: () => noteHistory.length,
    clearHistory: () => {
      noteHistory.length = 0;
      reverseIndex = -1;
    },
  };
}
