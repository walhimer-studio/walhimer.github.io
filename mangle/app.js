/**
 * Mangle: Loop, Garden pulse, Soundscape (Painting-with-John-style bed + long reverb).
 */
(function () {
  "use strict";

  /** @type {Tone.Player | null} */
  let player = null;
  /** @type {Tone.Players | null} */
  let playersObj = null;
  /** @type {Tone.Loop | null} */
  let melodyLoop = null;
  /** @type {Tone.Loop | null} */
  let textureLoop = null;
  /** @type {Tone.Reverb | null} */
  let reverbNode = null;
  /** @type {Tone.Reverb | null} */
  let reverbBass = null;
  /** @type {Tone.Reverb | null} */
  let reverbLine = null;
  /** @type {Tone.Reverb | null} */
  let reverbPerc = null;
  /** @type {Tone.Loop | null} */
  let bassDriftLoop = null;
  /** @type {Tone.Oscillator | null} */
  let clarinetOsc = null;
  /** @type {Tone.Gain | null} */
  let clarinetGain = null;
  /** @type {Tone.Oscillator | null} */
  let droneOsc = null;
  /** @type {Tone.Gain | null} */
  let droneGain = null;
  /** @type {Tone.Noise | null} */
  let noiseSrc = null;
  /** @type {Tone.Gain | null} */
  let noiseGain = null;

  let bloomOrder = [];
  let bloomStep = 0;

  /** @type {Tone.Gain | null} */
  let master = null;
  /** @type {Tone.Recorder | null} */
  let recorder = null;

  let audioReady = false;
  let recording = false;

  /** @type {string[]} */
  let bankBlobUrls = [];
  const bank = { urls: /** @type {string[]} */ ([]), names: /** @type {string[]} */ ([]) };

  const statusEl = document.getElementById("status");
  const btnStart = document.getElementById("btn-start");
  const btnPause = document.getElementById("btn-pause");
  const btnStop = document.getElementById("btn-stop");
  const btnRecord = document.getElementById("btn-record");
  const fileInput = document.getElementById("sample-file");
  const folderInput = document.getElementById("sample-folder");
  const bankSelect = document.getElementById("sample-bank");
  const pulseInput = document.getElementById("pulse-interval");
  const pulseLabel = document.getElementById("pulse-label");
  const pentatonicOnly = document.getElementById("pentatonic-only");
  const bankWrap = document.getElementById("bank-wrap");
  const bloomOpts = document.getElementById("bloom-opts");
  const scOpts = document.getElementById("sc-opts");
  const pentaRow = document.getElementById("penta-row");
  const scMelody = document.getElementById("sc-melody");
  const scTexture = document.getElementById("sc-texture");
  const scMelodyLabel = document.getElementById("sc-melody-label");
  const scTextureLabel = document.getElementById("sc-texture-label");
  const scDrone = document.getElementById("sc-drone");
  const scTextureOn = document.getElementById("sc-texture-on");
  const scTriangle = document.getElementById("sc-triangle");
  const scSketchReverb = document.getElementById("sc-sketch-reverb");
  const scBassDrift = document.getElementById("sc-bass-drift");

  const DEFAULT_SAMPLE =
    "https://tonejs.github.io/audio/casio/A1.mp3";

  const AUDIO_EXT = /\.(wav|mp3|flac|aiff|aif|ogg|m4a)$/i;

  const PENTA_LETTERS = new Set(["C", "D", "E", "G", "A"]);

  /** C minor pentatonic (sketch.js notes array) */
  const SKETCH_CM_PENTA = [48, 50, 53, 55, 57, 60];
  const SKETCH_BASS_START = [36, 40, 43];
  const SKETCH_BASS_DRIFT = [36, 38, 41, 43];

  function mtof(midi) {
    return Tone.Frequency(midi, "midi").toFrequency();
  }

  function getMode() {
    const el = document.querySelector('input[name="mode"]:checked');
    const v = el && el.value;
    if (v === "bloom" || v === "soundscape") return v;
    return "loop";
  }

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function setTransportButtons(playing) {
    btnStart.disabled = playing;
    btnPause.disabled = !playing;
    btnStop.disabled = !playing;
  }

  async function ensureAudio() {
    if (audioReady) return;
    await Tone.start();
    audioReady = true;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function extractNoteFromFilename(name) {
    const matches = name.match(/([A-Ga-g])(\d+)/g);
    if (!matches || !matches.length) return null;
    const last = matches[matches.length - 1];
    const m = last.match(/([A-Ga-g])(\d+)/i);
    if (!m) return null;
    return { letter: m[1].toUpperCase(), oct: parseInt(m[2], 10) };
  }

  function getBloomIndices() {
    const onlyPenta = pentatonicOnly.checked;
    const n = bank.urls.length;
    const out = [];
    for (let i = 0; i < n; i++) {
      if (!onlyPenta) {
        out.push(i);
        continue;
      }
      const ex = extractNoteFromFilename(bank.names[i]);
      if (ex && PENTA_LETTERS.has(ex.letter)) {
        out.push(i);
      }
    }
    return out.length ? out : bank.urls.map((_, i) => i);
  }

  function revokeBank() {
    bankBlobUrls.forEach((u) => URL.revokeObjectURL(u));
    bankBlobUrls = [];
    bank.urls = [];
    bank.names = [];
    bankSelect.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "\u2014 Load a folder or file \u2014";
    bankSelect.appendChild(opt);
    bankSelect.disabled = true;
    bankSelect.value = "";
  }

  function fillBankFromFiles(files) {
    revokeBank();
    const audioFiles = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (AUDIO_EXT.test(f.name)) {
        audioFiles.push(f);
      }
    }
    audioFiles.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );
    if (!audioFiles.length) {
      setStatus("No audio files in that folder.");
      return;
    }
    audioFiles.forEach((f) => {
      const url = URL.createObjectURL(f);
      bankBlobUrls.push(url);
      bank.urls.push(url);
      bank.names.push(f.name);
      const opt = document.createElement("option");
      opt.value = String(bank.urls.length - 1);
      opt.textContent = f.name;
      bankSelect.appendChild(opt);
    });
    bankSelect.disabled = false;
    bankSelect.selectedIndex = 1;
    setStatus(audioFiles.length + " files loaded.");
  }

  function stopAndDisposeLoop(loop) {
    if (!loop) return;
    try {
      loop.stop(0);
      loop.dispose();
    } catch (e) {
      console.warn(e);
    }
  }

  function disposePulsedLayers() {
    stopAndDisposeLoop(melodyLoop);
    melodyLoop = null;
    stopAndDisposeLoop(textureLoop);
    textureLoop = null;
    stopAndDisposeLoop(bassDriftLoop);
    bassDriftLoop = null;
    if (clarinetOsc) {
      try {
        clarinetOsc.stop();
        clarinetOsc.dispose();
      } catch (e) {
        console.warn(e);
      }
      clarinetOsc = null;
    }
    if (clarinetGain) {
      try {
        clarinetGain.dispose();
      } catch (e) {
        console.warn(e);
      }
      clarinetGain = null;
    }
    if (playersObj) {
      try {
        playersObj.dispose();
      } catch (e) {
        console.warn(e);
      }
      playersObj = null;
    }
    if (droneOsc) {
      try {
        droneOsc.stop();
        droneOsc.dispose();
      } catch (e) {
        console.warn(e);
      }
      droneOsc = null;
    }
    if (droneGain) {
      try {
        droneGain.dispose();
      } catch (e) {
        console.warn(e);
      }
      droneGain = null;
    }
    if (noiseSrc) {
      try {
        noiseSrc.stop();
        noiseSrc.dispose();
      } catch (e) {
        console.warn(e);
      }
      noiseSrc = null;
    }
    if (noiseGain) {
      try {
        noiseGain.dispose();
      } catch (e) {
        console.warn(e);
      }
      noiseGain = null;
    }
    if (reverbNode) {
      try {
        reverbNode.dispose();
      } catch (e) {
        console.warn(e);
      }
      reverbNode = null;
    }
    if (reverbBass) {
      try {
        reverbBass.dispose();
      } catch (e) {
        console.warn(e);
      }
      reverbBass = null;
    }
    if (reverbLine) {
      try {
        reverbLine.dispose();
      } catch (e) {
        console.warn(e);
      }
      reverbLine = null;
    }
    if (reverbPerc) {
      try {
        reverbPerc.dispose();
      } catch (e) {
        console.warn(e);
      }
      reverbPerc = null;
    }
    bloomOrder = [];
    bloomStep = 0;
  }

  function disposeAllGraph() {
    disposePulsedLayers();
    if (player) {
      try {
        player.dispose();
      } catch (e) {
        console.warn(e);
      }
      player = null;
    }
    if (master) {
      try {
        master.dispose();
      } catch (e) {
        console.warn(e);
      }
      master = null;
    }
    if (recorder) {
      try {
        recorder.dispose();
      } catch (e) {
        console.warn(e);
      }
      recorder = null;
    }
  }

  function buildLoopGraph(url) {
    disposeAllGraph();

    master = new Tone.Gain(1);
    master.toDestination();

    recorder = new Tone.Recorder();
    master.connect(recorder);

    player = new Tone.Player({
      url,
      loop: true,
      onerror: function (e) {
        console.error(e);
        setStatus("Could not load audio.");
      },
    });
    player.connect(master);
    player.sync().start(0);
  }

  async function buildBloomGraph() {
    disposeAllGraph();
    const indices = getBloomIndices();
    if (!indices.length) {
      throw new Error("No samples.");
    }

    bloomOrder = shuffle(indices);
    bloomStep = 0;

    const urls = {};
    for (let k = 0; k < bank.urls.length; k++) {
      urls["s" + k] = bank.urls[k];
    }

    master = new Tone.Gain(0.85);
    master.toDestination();

    recorder = new Tone.Recorder();
    master.connect(recorder);

    playersObj = new Tone.Players({
      urls: urls,
      fadeOut: 0.06,
      onerror: function (e) {
        console.error(e);
      },
    }).connect(master);

    await Tone.loaded();

    const sec = parseFloat(pulseInput.value) || 1.8;

    melodyLoop = new Tone.Loop(function (time) {
      if (!playersObj || !bloomOrder.length) return;
      const bankIdx = bloomOrder[bloomStep % bloomOrder.length];
      bloomStep += 1;
      const pl = playersObj.player("s" + bankIdx);
      pl.volume.value = -16 + Math.random() * 9;
      pl.start(time);
    }, sec + "s");

    melodyLoop.start(0);
  }

  async function buildSoundscapeGraph() {
    disposeAllGraph();
    const indices = getBloomIndices();
    if (!indices.length) {
      throw new Error("No samples.");
    }

    bloomOrder = shuffle(indices);
    bloomStep = 0;

    const urls = {};
    for (let k = 0; k < bank.urls.length; k++) {
      urls["s" + k] = bank.urls[k];
    }

    const useSketchReverbs = scSketchReverb.checked;

    master = new Tone.Gain(0.92);
    master.toDestination();

    recorder = new Tone.Recorder();
    master.connect(recorder);

    if (useSketchReverbs) {
      reverbBass = new Tone.Reverb({ decay: 6, wet: 0.5 });
      reverbLine = new Tone.Reverb({ decay: 5, wet: 0.7 });
      reverbPerc = new Tone.Reverb({ decay: 2, wet: 0.3 });
      await Promise.all([
        reverbBass.generate(),
        reverbLine.generate(),
        reverbPerc.generate(),
      ]);
      reverbBass.connect(master);
      reverbLine.connect(master);
      reverbPerc.connect(master);
    } else {
      reverbNode = new Tone.Reverb({
        decay: 8,
        wet: 0.52,
      });
      await reverbNode.generate();
      reverbNode.connect(master);
    }

    /** @type {Tone.Reverb} */
    const busLine = useSketchReverbs ? reverbLine : reverbNode;
    /** @type {Tone.Reverb} */
    const busBass = useSketchReverbs ? reverbBass : reverbNode;
    /** @type {Tone.Reverb} */
    const busPerc = useSketchReverbs ? reverbPerc : reverbNode;

    playersObj = new Tone.Players({
      urls: urls,
      fadeOut: 0.14,
      onerror: function (e) {
        console.error(e);
      },
    }).connect(busLine);

    await Tone.loaded();

    if (scDrone.checked) {
      const startMidi =
        SKETCH_BASS_START[Math.floor(Math.random() * SKETCH_BASS_START.length)];
      droneOsc = new Tone.Oscillator({
        type: "sine",
        frequency: mtof(startMidi),
      }).start();
      droneGain = new Tone.Gain(0.05);
      droneOsc.connect(droneGain);
      droneGain.connect(busBass);
      if (scBassDrift.checked) {
        bassDriftLoop = new Tone.Loop(function (time) {
          if (!droneOsc) return;
          const m =
            SKETCH_BASS_DRIFT[
              Math.floor(Math.random() * SKETCH_BASS_DRIFT.length)
            ];
          droneOsc.frequency.setValueAtTime(mtof(m), time);
        }, "10s");
        bassDriftLoop.start(0);
      }
    }

    if (scTriangle.checked) {
      clarinetOsc = new Tone.Oscillator({
        type: "triangle",
        frequency: mtof(SKETCH_CM_PENTA[0]),
      }).start();
      clarinetGain = new Tone.Gain(0.001);
      clarinetOsc.connect(clarinetGain);
      clarinetGain.connect(busLine);
    }

    if (scTextureOn.checked) {
      noiseSrc = new Tone.Noise("pink").start();
      noiseGain = new Tone.Gain(0);
      noiseSrc.connect(noiseGain);
      noiseGain.connect(busPerc);
    }

    const mSec = parseFloat(scMelody.value) || 4;
    const tSec = parseFloat(scTexture.value) || 7;

    melodyLoop = new Tone.Loop(function (time) {
      if (!playersObj || !bloomOrder.length) return;
      const bankIdx = bloomOrder[bloomStep % bloomOrder.length];
      bloomStep += 1;
      const pl = playersObj.player("s" + bankIdx);
      pl.volume.value = -14 + Math.random() * 8;
      pl.start(time);

      if (scTriangle.checked && clarinetOsc && clarinetGain) {
        const n =
          SKETCH_CM_PENTA[
            Math.floor(Math.random() * SKETCH_CM_PENTA.length)
          ];
        clarinetOsc.frequency.setValueAtTime(mtof(n), time);
        clarinetGain.gain.cancelScheduledValues(time);
        clarinetGain.gain.setValueAtTime(0.001, time);
        clarinetGain.gain.linearRampToValueAtTime(0.1, time + 0.5);
        clarinetGain.gain.setValueAtTime(0.1, time + 1.5);
        clarinetGain.gain.linearRampToValueAtTime(0.001, time + 3.5);
      }
    }, mSec + "s");

    melodyLoop.start(0);

    if (noiseGain) {
      textureLoop = new Tone.Loop(function (time) {
        noiseGain.gain.cancelScheduledValues(time);
        noiseGain.gain.setValueAtTime(0.001, time);
        noiseGain.gain.linearRampToValueAtTime(0.05, time + 0.01);
        noiseGain.gain.linearRampToValueAtTime(0.05, time + 0.2);
        noiseGain.gain.linearRampToValueAtTime(0.001, time + 0.7);
      }, tSec + "s");
      textureLoop.start(0);
    }
  }

  async function loadSampleUrl(url, opts) {
    const silent = opts && opts.silent;
    if (!silent) {
      setStatus("Loading sample...");
    }
    Tone.Transport.stop(0);
    setTransportButtons(false);
    btnStart.disabled = false;
    buildLoopGraph(url);
    await Tone.loaded();
    if (!silent) {
      setStatus("Ready \u2014 press Start.");
    }
  }

  async function switchToBankIndex(index) {
    const url = bank.urls[index];
    if (url == null) return;
    const wasPlaying = Tone.Transport.state === "started";
    if (wasPlaying) {
      Tone.Transport.pause();
      setTransportButtons(false);
      btnStart.disabled = false;
    }
    await loadSampleUrl(url, { silent: true });
    if (wasPlaying) {
      Tone.Transport.start();
      setTransportButtons(true);
      setStatus("Playing: " + (bank.names[index] || ""));
    } else {
      setStatus("Loaded: " + (bank.names[index] || ""));
    }
  }

  function syncModeUi() {
    const mode = getMode();
    const loop = mode === "loop";
    const bloom = mode === "bloom";
    const sc = mode === "soundscape";

    bankWrap.style.opacity = loop ? "1" : "0.45";
    bankSelect.disabled = !loop || bank.urls.length === 0;

    bloomOpts.classList.toggle("hidden", !bloom);
    scOpts.classList.toggle("hidden", !sc);
    pentaRow.style.display = loop ? "none" : "block";

    pulseInput.disabled = !bloom;
    pentatonicOnly.disabled = loop;
    scMelody.disabled = !sc;
    scTexture.disabled = !sc;
    scDrone.disabled = !sc;
    scTextureOn.disabled = !sc;
    scTriangle.disabled = !sc;
    scSketchReverb.disabled = !sc;
    scBassDrift.disabled = !sc;
  }

  document.querySelectorAll('input[name="mode"]').forEach(function (r) {
    r.addEventListener("change", syncModeUi);
  });

  pulseInput.addEventListener("input", function () {
    pulseLabel.textContent = pulseInput.value;
  });

  scMelody.addEventListener("input", function () {
    scMelodyLabel.textContent = scMelody.value;
  });

  scTexture.addEventListener("input", function () {
    scTextureLabel.textContent = scTexture.value;
  });

  btnStart.addEventListener("click", async () => {
    try {
      await ensureAudio();
      await Tone.getContext().resume();
      const mode = getMode();

      if (mode === "bloom") {
        if (!bank.urls.length) {
          setStatus("Load a folder first (e.g. pentatonic piano).");
          return;
        }
        Tone.Transport.stop(0);
        setTransportButtons(false);
        btnStart.disabled = false;
        setStatus("Loading Garden pulse...");
        await buildBloomGraph();
        Tone.Transport.start();
        setTransportButtons(true);
        setStatus(
          "Garden pulse: " +
            bloomOrder.length +
            " steps, " +
            pulseInput.value +
            " s."
        );
        return;
      }

      if (mode === "soundscape") {
        if (!bank.urls.length) {
          setStatus(
            "Soundscape needs your samples \u2014 load a long-decay pentatonic folder."
          );
          return;
        }
        Tone.Transport.stop(0);
        setTransportButtons(false);
        btnStart.disabled = false;
        setStatus("Loading Soundscape (reverb + bed)...");
        await buildSoundscapeGraph();
        Tone.Transport.start();
        setTransportButtons(true);
        setStatus(
          "Soundscape: samples + optional sketch layers (triangle, 3 reverbs, bass drift, noise)."
        );
        return;
      }

      if (!player) {
        await loadSampleUrl(DEFAULT_SAMPLE);
      }
      Tone.Transport.start();
      setTransportButtons(true);
      const idx = parseInt(bankSelect.value, 10);
      const name =
        !Number.isNaN(idx) && bank.names[idx] != null
          ? bank.names[idx]
          : "";
      setStatus(name ? "Loop: " + name : "Playing.");
    } catch (err) {
      console.error(err);
      setStatus("Error starting \u2014 see console.");
    }
  });

  btnPause.addEventListener("click", async () => {
    if (!audioReady) return;
    if (!player && !playersObj) return;
    Tone.Transport.pause();
    try {
      await Tone.getContext().suspend();
    } catch (e) {
      console.warn(e);
    }
    setTransportButtons(false);
    btnStart.disabled = false;
    setStatus("Paused.");
  });

  btnStop.addEventListener("click", async () => {
    if (!audioReady) return;
    if (!player && !playersObj) return;
    try {
      await Tone.getContext().resume();
    } catch (e) {
      console.warn(e);
    }
    Tone.Transport.stop(0);
    stopAndDisposeLoop(melodyLoop);
    melodyLoop = null;
    stopAndDisposeLoop(textureLoop);
    textureLoop = null;
    const mode = getMode();
    if (mode === "bloom" || mode === "soundscape") {
      disposePulsedLayers();
      if (master) {
        try {
          master.dispose();
        } catch (e) {
          console.warn(e);
        }
        master = null;
      }
      if (recorder) {
        try {
          recorder.dispose();
        } catch (e) {
          console.warn(e);
        }
        recorder = null;
      }
    }
    setTransportButtons(false);
    btnStart.disabled = false;
    setStatus("Stopped.");
  });

  btnRecord.addEventListener("click", async () => {
    try {
      await ensureAudio();
      if (!recorder) {
        setStatus("Start playback first, then record.");
        return;
      }

      if (!recording) {
        await recorder.start();
        recording = true;
        btnRecord.textContent = "Stop recording";
        btnRecord.classList.add("recording");
        const playing =
          Tone.Transport.state === "started" && (!!player || !!playersObj);
        setStatus(playing ? "Recording..." : "Recording (silent)...");
      } else {
        const blob = await recorder.stop();
        recording = false;
        btnRecord.textContent = "Record";
        btnRecord.classList.remove("recording");

        const ext = blob.type.includes("wav") ? "wav" : "webm";
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mangle-recording." + ext;
        a.click();
        URL.revokeObjectURL(a.href);

        setStatus("Recording saved.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Recording failed.");
      recording = false;
      btnRecord.textContent = "Record";
      btnRecord.classList.remove("recording");
    }
  });

  folderInput.addEventListener("change", async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    try {
      await ensureAudio();
      fillBankFromFiles(files);
      if (bank.urls.length && getMode() === "loop") {
        await loadSampleUrl(bank.urls[0], { silent: true });
      }
      e.target.value = "";
      syncModeUi();
    } catch (err) {
      console.error(err);
      setStatus("Could not load folder.");
    }
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      await ensureAudio();
      revokeBank();
      const url = URL.createObjectURL(file);
      bankBlobUrls.push(url);
      bank.urls.push(url);
      bank.names.push(file.name);
      const opt = document.createElement("option");
      opt.value = "0";
      opt.textContent = file.name;
      bankSelect.appendChild(opt);
      bankSelect.disabled = false;
      bankSelect.value = "0";
      await loadSampleUrl(url);
      e.target.value = "";
      syncModeUi();
    } catch (err) {
      console.error(err);
      setStatus("Could not load file.");
    }
  });

  bankSelect.addEventListener("change", async () => {
    const v = bankSelect.value;
    if (v === "" || bank.urls.length === 0) return;
    const idx = parseInt(v, 10);
    if (Number.isNaN(idx) || !bank.urls[idx]) return;
    try {
      await ensureAudio();
      await switchToBankIndex(idx);
    } catch (err) {
      console.error(err);
      setStatus("Could not switch sample.");
    }
  });

  syncModeUi();
})();
