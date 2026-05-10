/**
 * RMS level from mic input — drives visuals from actual air pressure / speakers,
 * not MIDI schedule or CC “potential” changes.
 */
function createAudioMeter() {
  let audioCtx = null;
  let analyser = null;
  let timeData = null;
  let stream = null;

  async function start() {
    if (audioCtx) return true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      audioCtx = new AudioContext();
      if (audioCtx.state === "suspended") await audioCtx.resume();
      const src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.55;
      src.connect(analyser);
      timeData = new Uint8Array(analyser.fftSize);
      return true;
    } catch (e) {
      console.warn("[audio-meter]", e);
      return false;
    }
  }

  /** ~0..1 envelope (quiet room ≈ low; loud synth ≈ higher) */
  function level() {
    if (!analyser || !timeData) return 0;
    analyser.getByteTimeDomainData(timeData);
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / timeData.length);
    return Math.min(1, rms * 5.5);
  }

  return { start, level };
}
