/**
 * Bloom Four Walls pentatonic piano — plain Web Audio API, Salamander samples.
 * Same NOTE_MAP / playback-rate mapping as sketches/bloom/bloom-four-walls.html.
 */

export const NOTE_MAP = Object.freeze({
  C2: { s: 'C2', r: 1.0 },
  D2: { s: 'Ds2', r: 0.943874 },
  E2: { s: 'Ds2', r: 1.059463 },
  G2: { s: 'Fs2', r: 1.059463 },
  A2: { s: 'A2', r: 1.0 },
  C3: { s: 'C3', r: 1.0 },
  D3: { s: 'Ds3', r: 0.943874 },
  E3: { s: 'Ds3', r: 1.059463 },
  G3: { s: 'Fs3', r: 1.059463 },
  A3: { s: 'A3', r: 1.0 },
  C4: { s: 'C4', r: 1.0 },
  D4: { s: 'Ds4', r: 0.943874 },
  E4: { s: 'Ds4', r: 1.059463 },
  G4: { s: 'Fs4', r: 1.059463 },
  A4: { s: 'A4', r: 1.0 },
  C5: { s: 'C5', r: 1.0 },
  D5: { s: 'Ds5', r: 0.943874 },
  E5: { s: 'Ds5', r: 1.059463 },
  G5: { s: 'Fs5', r: 1.059463 },
  A5: { s: 'A5', r: 1.0 },
  C6: { s: 'C6', r: 1.0 },
  D6: { s: 'Ds6', r: 0.943874 },
});

const SAMPLE_KEYS = [...new Set(Object.values(NOTE_MAP).map((m) => m.s))];

export function createBloomPentatonicPiano(opts = {}) {
  const baseUrl = opts.baseUrl ?? './samples/';
  let actx = null;
  const audioBuffers = {};
  let audioReady = false;
  let masterGain = null;
  let recDest = null;
  let loadPromise = null;

  async function loadAudio(onProgress) {
    if (audioReady) return true;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') await actx.resume();

      let done = 0;
      for (const key of SAMPLE_KEYS) {
        try {
          const res = await fetch(`${baseUrl}${key}.mp3`);
          if (!res.ok) {
            console.warn(`Piano sample missing: ${key}.mp3`);
            continue;
          }
          audioBuffers[key] = await actx.decodeAudioData(await res.arrayBuffer());
        } catch (err) {
          console.warn(`Piano sample failed: ${key}.mp3`, err);
        }
        done += 1;
        onProgress?.(done / SAMPLE_KEYS.length);
      }

      if (!Object.keys(audioBuffers).length) {
        console.warn('No piano samples loaded — run install_salamander_samples.py and copy mp3 roots into ./samples/');
        return false;
      }

      masterGain = actx.createGain();
      masterGain.gain.value = 0.4;
      masterGain.connect(actx.destination);
      audioReady = true;
      return true;
    })();

    return loadPromise;
  }

  function playNote(noteName, velocity) {
    if (!audioReady || !actx || !masterGain) return;
    const map = NOTE_MAP[noteName];
    if (!map) return;
    const buf = audioBuffers[map.s];
    if (!buf) return;

    const src = actx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = map.r;

    const gain = actx.createGain();
    gain.gain.setValueAtTime(velocity, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 6);

    src.connect(gain);
    gain.connect(masterGain);
    src.start(actx.currentTime);
    src.stop(actx.currentTime + 7);
  }

  async function getAudioStream() {
    await loadAudio();
    if (!recDest) {
      recDest = actx.createMediaStreamDestination();
      masterGain.connect(recDest);
    }
    return recDest.stream;
  }

  return {
    loadAudio,
    playNote,
    getAudioStream,
    isReady: () => audioReady,
  };
}
