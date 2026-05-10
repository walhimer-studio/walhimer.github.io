/**
 * “Telescope” into wave shape driven by the same MIDI stream as the hardware synth:
 * Web Audio oscillators follow note on/off + pitch; an AnalyserNode exposes the
 * actual PCM waveform (no microphone — not the hardware DAC, but real samples).
 *
 * MIDI is control data only; this reconstructs a simple sine voice per key so the
 * scope has something to show. Timbral accuracy vs the synth is not claimed.
 */
function createMidiWaveTelescope() {
  let ctx = null;
  let master = null;
  let silentOut = null;
  let analyser = null;
  let floatBuf = null;
  /** @type {Map<number, { osc: OscillatorNode, gain: GainNode, offTimer: number|null }>} */
  const voices = new Map();

  function midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  async function resume() {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.55;
      silentOut = ctx.createGain();
      silentOut.gain.value = 0;
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.28;
      master.connect(analyser);
      analyser.connect(silentOut);
      silentOut.connect(ctx.destination);
      floatBuf = new Float32Array(analyser.fftSize);
    }
    if (ctx.state === "suspended") await ctx.resume();
    return true;
  }

  function noteOn(note, velocity) {
    if (!ctx) return;
    const n = Math.floor(Number(note));
    const vel = Math.max(1, Math.min(127, Number(velocity) || 90));
    noteOff(n);
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = midiToFreq(n);
    const g = ctx.createGain();
    const peak = (vel / 127) * 0.28;
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.004);
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    voices.set(n, { osc, gain: g, offTimer: null });
  }

  function noteOff(note) {
    if (!ctx) return;
    const n = Math.floor(Number(note));
    const voice = voices.get(n);
    if (!voice) return;
    if (voice.offTimer != null) {
      clearTimeout(voice.offTimer);
      voice.offTimer = null;
    }
    const { osc, gain } = voice;
    const now = ctx.currentTime;
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(1e-4, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.1);
      osc.stop(now + 0.12);
    } catch (_) {}
    voices.delete(n);
  }

  /**
   * Bridge `event` carries pitch but no note-off — treat as a short keyed blip.
   */
  function notePulse(note, velocity, gateMs) {
    const ms = Math.max(40, Math.min(800, gateMs || 130));
    noteOn(note, velocity);
    const n = Math.floor(Number(note));
    const v = voices.get(n);
    if (v && ctx) {
      if (v.offTimer) clearTimeout(v.offTimer);
      v.offTimer = window.setTimeout(() => noteOff(n), ms);
    }
  }

  /** RMS ~0..1 from the synthesized bus (feeds visuals). */
  function level() {
    if (!analyser || !floatBuf) return 0;
    analyser.getFloatTimeDomainData(floatBuf);
    let sum = 0;
    for (let i = 0; i < floatBuf.length; i++) sum += floatBuf[i] * floatBuf[i];
    return Math.min(1, Math.sqrt(sum / floatBuf.length) * 5);
  }

  /** Latest mono snapshot (same buffer reused each call). */
  function getWaveformBuffer() {
    if (!analyser || !floatBuf) return null;
    analyser.getFloatTimeDomainData(floatBuf);
    return floatBuf;
  }

  function silenceAll() {
    for (const n of [...voices.keys()]) noteOff(n);
  }

  return {
    resume,
    noteOn,
    noteOff,
    notePulse,
    level,
    getWaveformBuffer,
    silenceAll
  };
}
