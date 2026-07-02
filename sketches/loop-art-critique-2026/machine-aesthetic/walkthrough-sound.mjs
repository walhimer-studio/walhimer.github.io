/**
 * Walkthrough sound — extract from sketches/loop-snippets/surrender-machines-three.html
 * Active in all rooms and hallways once toggled on.
 */
const SURR_DURATION = 14;

export function attachWalkthroughSound(opts = {}) {
  const getSliders = opts.getSliders || (() => ({ anger: 50, ego: 50, attachment: 50 }));
  const isSurrendering = opts.isSurrendering || (() => false);
  const soundBtn = opts.soundBtn;

  let ctx = null;
  let soundOn = false;
  let masterGain = null;
  let angerGain, angerOsc1, angerOsc2;
  let egoGain, egoOsc1, egoOsc2;
  let attachGain, attachOsc1, attachOsc2;
  let zeroGain, zeroOsc;
  let surrGain, surrOsc;
  let sndSurrendering = false;
  let sndSurrStart = null;

  function initAudio() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    function makeDrone(type, freq, filterType, filterFreq, filterQ) {
      const osc = ctx.createOscillator();
      const filt = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      filt.type = filterType;
      filt.frequency.value = filterFreq;
      if (filterQ) filt.Q.value = filterQ;
      gain.gain.value = 0;
      osc.connect(filt);
      filt.connect(gain);
      gain.connect(masterGain);
      osc.start();
      return { osc, filt, gain };
    }

    const a1 = makeDrone("sawtooth", 55, "bandpass", 140, 0.9);
    const a2 = makeDrone("sawtooth", 56.8, "bandpass", 140, 0.9);
    angerGain = a1.gain;
    angerOsc1 = a1.osc;
    angerOsc2 = a2.osc;
    a2.gain.gain.value = 0;
    angerOsc2.disconnect();
    angerOsc2.connect(a1.filt);

    const e1 = makeDrone("sine", 880, "highpass", 700);
    const e2 = makeDrone("sine", 887, "highpass", 700);
    egoGain = e1.gain;
    egoOsc1 = e1.osc;
    egoOsc2 = e2.osc;
    e2.gain.gain.value = 0;
    egoOsc2.disconnect();
    egoOsc2.connect(e1.filt);

    const at1 = makeDrone("triangle", 110, "lowpass", 280);
    const at2 = makeDrone("triangle", 111.4, "lowpass", 280);
    attachGain = at1.gain;
    attachOsc1 = at1.osc;
    attachOsc2 = at2.osc;
    at2.gain.gain.value = 0;
    attachOsc2.disconnect();
    attachOsc2.connect(at1.filt);
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 0.055;
    lfoG.gain.value = 0.007;
    lfo.connect(lfoG);
    lfoG.connect(attachGain.gain);
    lfo.start();

    const z = makeDrone("sine", 220, "lowpass", 800);
    zeroGain = z.gain;
    zeroOsc = z.osc;

    const s = makeDrone("sine", 432, "lowpass", 600);
    surrGain = s.gain;
    surrOsc = s.osc;

    setInterval(() => {
      if (!soundOn) return;
      const anger = getSliders().anger / 100;
      const stress = Math.max(0, (anger - 0.65) / 0.35);
      if (stress < 0.05 || Math.random() > stress * stress * 0.9) return;
      const bufLen = Math.floor(ctx.sampleRate * 0.025);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2.5);
      }
      const src = ctx.createBufferSource();
      const env = ctx.createGain();
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 180 + Math.random() * 260;
      bp.Q.value = 1.8;
      src.buffer = buf;
      env.gain.setValueAtTime(0.12 * stress, ctx.currentTime);
      env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);
      src.connect(bp);
      bp.connect(env);
      env.connect(masterGain);
      src.start();
      src.stop(ctx.currentTime + 0.04);
    }, 110);

    runUpdateLoop();
  }

  function runUpdateLoop() {
    if (!ctx) return;
    const now = ctx.currentTime;
    const RAMP = 0.18;
    const s = getSliders();
    const anger = s.anger / 100;
    const ego = s.ego / 100;
    const attach = s.attachment / 100;
    const angerRich = Math.min(anger / 0.65, 1);
    const egoRich = Math.min(ego / 0.65, 1);
    const attachRich = Math.min(attach / 0.65, 1);
    const angerStr = Math.max(0, (anger - 0.65) / 0.35);
    const egoStr = Math.max(0, (ego - 0.65) / 0.35);
    const attachStr = Math.max(0, (attach - 0.65) / 0.35);
    const allZero = anger < 0.01 && ego < 0.01 && attach < 0.01;
    const surrendering = isSurrendering();

    if (soundOn) {
      angerGain.gain.setTargetAtTime(
        surrendering ? 0 : angerRich * 0.16 + angerStr * 0.1,
        now,
        RAMP
      );
      angerOsc2.frequency.setTargetAtTime(55 + 1.8 + angerStr * 9, now, RAMP);
      egoGain.gain.setTargetAtTime(
        surrendering ? 0 : egoRich * 0.035 + egoStr * 0.07,
        now,
        RAMP
      );
      egoOsc2.frequency.setTargetAtTime(880 + 7 + egoStr * 28, now, RAMP);
      attachGain.gain.setTargetAtTime(
        surrendering ? 0 : attachRich * 0.09 + attachStr * 0.11,
        now,
        RAMP
      );
      zeroGain.gain.setTargetAtTime(!surrendering && allZero ? 0.055 : 0, now, RAMP);

      if (surrendering) {
        if (!sndSurrendering) {
          sndSurrendering = true;
          sndSurrStart = now;
        }
        const p = Math.min((now - sndSurrStart) / SURR_DURATION, 1);
        const g = p < 0.25 ? (p / 0.25) * 0.065 : p < 0.75 ? 0.065 : ((1 - p) / 0.25) * 0.065;
        surrGain.gain.setTargetAtTime(g, now, 0.6);
      } else {
        sndSurrendering = false;
        surrGain.gain.setTargetAtTime(0, now, RAMP);
      }
    }

    setTimeout(runUpdateLoop, 80);
  }

  function setUiOn(on) {
    if (!soundBtn) return;
    const iMute = soundBtn.querySelector("#icon-mute");
    const iOn = soundBtn.querySelector("#icon-on");
    soundBtn.classList.toggle("on", on);
    if (iMute) iMute.style.display = on ? "none" : "";
    if (iOn) iOn.style.display = on ? "" : "none";
  }

  function toggle() {
    initAudio();
    if (ctx.state === "suspended") ctx.resume();
    soundOn = !soundOn;
    if (soundOn) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.8);
      setUiOn(true);
    } else {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      setUiOn(false);
    }
  }

  let recDest = null;

  async function ensureAudio() {
    initAudio();
    if (ctx.state === "suspended") await ctx.resume();
    if (!soundOn) {
      soundOn = true;
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.4);
      setUiOn(true);
    }
  }

  async function getAudioStream() {
    await ensureAudio();
    if (!recDest) {
      recDest = ctx.createMediaStreamDestination();
      masterGain.connect(recDest);
    }
    return recDest.stream;
  }

  if (soundBtn) {
    soundBtn.addEventListener("click", toggle);
  }

  return { toggle, initAudio, ensureAudio, getAudioStream, isOn: () => soundOn };
}
