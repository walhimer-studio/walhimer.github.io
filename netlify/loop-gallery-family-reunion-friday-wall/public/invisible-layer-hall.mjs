/**
 * Invisible Layer hallway engine for Loop Gallery (from Alumni Show POC).
 * Self-contained module — code walls rasterize this file's source.
 */
export async function createInvisibleLayerHall(options = {}) {
  if (!window.THREE) throw new Error('THREE required on window');

/**
 * Loop Alumni Show — Invisible Layer · proof of concept.
 * Self-contained walking landscape; corridor walls are rasterized from this script's own source.
 * Participatory Netlify/Firebase layer is not wired in this POC.
 */
const DEFAULT_SEED = 77823;
const LIFESPAN_MS = 480000;
const SURRENDER_MS = 4200;

const makeRng = (seed) => {
  let s = seed >>> 0;
  return {
    random() {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    uniform(a, b) { return a + this.random() * (b - a); },
    randint(a, b) { return a + Math.floor(this.random() * (b - a + 1)); },
    choice(arr) { return arr[this.randint(0, arr.length - 1)]; },
    chance(p) { return this.random() < p; },
  };
};

const { floor, min, max, sqrt, sin, cos, pow } = Math;
const THREE = window.THREE;

/** Snapshot this script while it executes — walls and volume read this text. */
let ART_SOURCE_RAW = '';
const loadArtSource = async () => {
  if (ART_SOURCE_RAW) return ART_SOURCE_RAW;
  const res = await fetch(new URL('./invisible-layer-hall.mjs', import.meta.url));
  ART_SOURCE_RAW = (await res.text()).trim();
  return ART_SOURCE_RAW;
};

const BASE_PAL = {
  white: [255, 255, 255],
  pink: [255, 16, 240],
  yellow: [255, 244, 0],
  orange: [255, 120, 0],
  skyBlue: [199, 225, 250],
  mint: [120, 200, 255],
  violet: [180, 140, 255],
  blend: [255, 48, 200],
};

const PAL = {};
const SPECTRUM = [];
let orgRng = makeRng(DEFAULT_SEED);
const rnd = () => orgRng.random();

const resetPalFromBase = () => {
  for (const [k, v] of Object.entries(BASE_PAL)) PAL[k] = v.slice();
};

const rebuildSpectrum = () => {
  SPECTRUM.length = 0;
  for (const k of ['pink', 'yellow', 'orange', 'mint', 'violet', 'skyBlue', 'blend']) {
    SPECTRUM.push(PAL[k] ?? BASE_PAL[k]);
  }
};

resetPalFromBase();
rebuildSpectrum();

const rgbToHsl = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) * 0.5;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
};

const hslToRgb = (h, s, l) => {
  if (s === 0) return [l, l, l];
  const hue2rgb = (p, q, t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
};

const hueRotateRgb = (rgb, deg) => {
  const [h, s, l] = rgbToHsl(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
  const nh = (h + deg / 360 + 1) % 1;
  const ns = min(1, max(0.35, s * 1.05));
  const [r, g, b] = hslToRgb(nh, ns, l);
  return [floor(r * 255), floor(g * 255), floor(b * 255)];
};

const buildSeedProfile = (seed) => {
  const r = makeRng(seed);
  const hueShift = r.uniform(0, 360);
  const palette = {};
  const paletteIdentity = (seed >>> 0) === (DEFAULT_SEED >>> 0);
  for (const [k, v] of Object.entries(BASE_PAL)) {
    if (k === 'white' || paletteIdentity) palette[k] = v.slice();
    else palette[k] = hueRotateRgb(v, hueShift + r.uniform(-24, 24));
  }
  return {
    seed: seed >>> 0,
    palette,
    volDepth: r.choice([24, 28, 32, 40, 48]),
    heightScale: 28 + r.uniform(0, 1) * 28,
    codeVeil: r.uniform(0.42, 0.78),
    canvas: {
      cell: r.choice([8, 16, 32]),
      grid: r.choice([8, 16, 32]) * r.choice([1, 2, 4]),
      depthSpawn: r.uniform(0.06, 0.22),
      scannerSpawn: r.uniform(0.1, 0.28),
      layerSpawn: r.uniform(0.06, 0.22),
      maxLayers: r.randint(3, 10),
      depthCap: r.uniform(0.22, 0.55),
      capMul: r.uniform(0.32, 0.62),
    },
  };
};

const rgb01 = (c) => [c[0] / 255, c[1] / 255, c[2] / 255];

/** Fluoro monospace — transparent bg; used for corridor walls and volume veil. */
const rasterizeCodeArtLayer = (size = 2048) => {
  const lines = (ART_SOURCE_RAW || '').split('\n');
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  const fontSize = max(9, floor(size / 64));
  const lineH = floor(fontSize * 1.26);
  const pad = floor(fontSize * 0.45);
  const maxW = size - pad * 2;
  ctx.font = `${fontSize}px ui-monospace, Menlo, Consolas, monospace`;
  ctx.textBaseline = 'top';

  const inks = [PAL.pink, PAL.yellow, PAL.mint, PAL.orange, PAL.violet, PAL.skyBlue, PAL.blend];

  let y = pad;
  let lineIdx = 0;
  for (const raw of lines) {
    let rest = raw;
    while (rest.length > 0 && y < size - pad) {
      let n = rest.length;
      while (n > 1 && ctx.measureText(rest.slice(0, n)).width > maxW) n--;
      const line = rest.slice(0, n);
      const isComment = /^\s*(\/\/|\*|\/\*\*)/.test(line);
      const ink = isComment ? PAL.skyBlue : inks[lineIdx % inks.length];
      ctx.fillStyle = `rgb(${ink[0]},${ink[1]},${ink[2]})`;
      ctx.fillText(line, pad, y);
      rest = rest.slice(n);
      y += lineH;
      lineIdx++;
    }
    if (y >= size - pad) break;
  }

  const imgData = ctx.getImageData(0, 0, size, size);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const a = max(d[i], d[i + 1], d[i + 2]);
    d[i + 3] = a > 10 ? 255 : 0;
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
};

const Canvas2d = () => {
  let ctx, width, height, scanners = [], layers = [], depthProbes = [];
  let profile = {
    cell: 16,
    grid: 32,
    depthSpawn: 0.09,
    scannerSpawn: 0.14,
    layerSpawn: 0.1,
    maxLayers: 4,
    depthCap: 0.35,
    capMul: 0.4,
  };

  const setProfile = (p) => { profile = { ...profile, ...p }; };

  const depthProbe = (x, y, size, life, b) => () => {
    ctx.fillStyle = `rgba(0,0,${b},1)`;
    ctx.fillRect(x, y, size, size);
    return --life > 0;
  };

  const greenLevel = (time, opt) => {
    if (!opt?.auto) return [1, 2, 4][opt?.mode ?? 0] ?? 1;
    return [1, 2, 4][floor(time / 90000) % 3];
  };

  const scanner = (x, y, size, dir, speed, life, g) => {
    const d = [...dir];
    return () => {
      ctx.fillStyle = `rgba(0,${g},0,1)`;
      ctx.fillRect(x, y, size, size);
      x += d[0] * speed;
      y += d[1] * speed;
      if (d[0]) {
        if (x < 0 || x > width - size) {
          x = x < 0 ? 0 : width - size;
          y += size * d[0];
          d[0] *= -1;
        }
        if (y < -size || y >= height) life = 0;
      }
      if (d[1]) {
        if (y < 0 || y > height - size) {
          y = y < 0 ? 0 : height - size;
          x += size * d[1];
          d[1] *= -1;
        }
        if (x < -size || x >= width) life = 0;
      }
      return --life > 0;
    };
  };

  const layer = (x, y, w, h, grid, life, c) => {
    const pts = [[x, y]];
    let yp = y;
    let xp = x + w;
    const edgeX = () => {
      const s = 1 + floor(rnd() * 3);
      const xs = Array.from({ length: s }, () => floor(rnd() * (w - grid) / grid) * grid).sort((a, b) => a - b);
      for (let i = 0; i < s; i++) {
        pts.push([x + xs[i], yp]);
        yp += rnd() < 0.5 ? grid : -grid;
        pts.push([x + xs[i], yp]);
      }
    };
    const edgeY = (reverse) => {
      const s = 1 + floor(rnd() * 3);
      const ys = Array.from({ length: s }, () => floor(rnd() * (h - grid) / grid) * grid)
        .sort((a, b) => (reverse ? b - a : a - b));
      for (let i = 0; i < s; i++) {
        pts.push([xp, y + ys[i]]);
        xp += rnd() < 0.5 ? grid : -grid;
        pts.push([xp, y + ys[i]]);
      }
    };
    if (y !== 0) edgeX();
    pts.push([x + w, yp]);
    xp = x + w;
    if (x + w !== width) edgeY(false);
    pts.push([xp, y + h]);
    yp = y + h;
    if (y + h !== height) {
      const s = 1 + floor(rnd() * 3);
      const xs = Array.from({ length: s }, () => floor(rnd() * (w - grid) / grid) * grid).sort((a, b) => b - a);
      for (let i = 0; i < s; i++) {
        pts.push([x + xs[i], yp]);
        yp += rnd() < 0.5 ? grid : -grid;
        pts.push([x + xs[i], yp]);
      }
    }
    pts.push([x, yp]);
    xp = x;
    if (x !== 0) {
      edgeY(true);
      pts[0] = [xp, y];
    }
    return () => {
      ctx.fillStyle = `rgba(${c},0,0,1)`;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fill();
      return --life > 0;
    };
  };

  const init = () => {
    const c = document.createElement('canvas');
    ctx = c.getContext('2d', { willReadFrequently: true });
    document.body.appendChild(c);
    c.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
    return c;
  };

  const setup = () => {
    width = max(64, floor(window.innerWidth));
    height = max(64, floor(window.innerHeight));
    ctx.canvas.width = width;
    ctx.canvas.height = height;
  };

  const draw = (time, options = { auto: true, mode: 0 }) => {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    scanners = scanners.filter((fn) => fn());
    ctx.globalCompositeOperation = 'lighter';
    layers = layers.filter((fn) => fn());
    depthProbes = depthProbes.filter((fn) => fn());

    const cell = profile.cell;
    const cap = floor(sqrt(floor(width / cell) * floor(height / cell)) * profile.capMul);

    if (depthProbes.length < cap * profile.depthCap && rnd() < profile.depthSpawn) {
      const x = floor(rnd() * floor((width - cell) / cell)) * cell;
      const y = floor(rnd() * floor((height - cell) / cell)) * cell;
      const b = pow(2, floor(rnd() * 4));
      depthProbes.push(depthProbe(x, y, cell, (10 + floor(rnd() * 18)) * 32, b));
    }

    if (scanners.length < cap && rnd() < profile.scannerSpawn) {
      const x = floor(rnd() * floor((width - cell) / cell)) * cell;
      const y = floor(rnd() * floor((height - cell) / cell)) * cell;
      const dir = rnd() < 0.5 ? [floor(rnd() * 2) * 2 - 1, 0] : [0, floor(rnd() * 2) * 2 - 1];
      const speed = pow(2, floor(rnd() * 2));
      const stride = pow(2, floor(rnd() * 2));
      const g = greenLevel(time, options);
      const n = dir[0]
        ? 1 + floor(rnd() * ((dir[0] < 0 ? y : height - y) / (cell * stride)))
        : 1 + floor(rnd() * ((dir[1] < 0 ? x : width - x) / (cell * stride)));
      const life = (14 + floor(rnd() * 20)) * 32;
      for (let i = 0; i < n; i++) {
        scanners.push(scanner(x + dir[1] * stride * cell * i, y + dir[0] * stride * cell * i, cell, dir, speed, life, g));
      }
    }

    const grid = profile.grid;
    if (layers.length < profile.maxLayers && rnd() < profile.layerSpawn) {
      const cols = floor(width / grid);
      const rows = floor(height / grid);
      const vert = rnd() < 0.5;
      const w = vert ? floor(cols * (0.2 + rnd() * 0.5)) * grid : width;
      const h = vert ? height : floor(rows * (0.2 + rnd() * 0.5)) * grid;
      let lx = rnd() < 0.5 ? 0 : width - w;
      let ly = rnd() < 0.5 ? 0 : height - h;
      if (rnd() < 0.3) {
        lx = floor(rnd() * floor((width - w) / grid)) * grid;
        ly = floor(rnd() * floor((height - h) / grid)) * grid;
      }
      layers.push(layer(lx, ly, w, h, grid, (8 + floor(rnd() * 16)) * 32, pow(2, floor(rnd() * 6))));
    }

    ctx.globalCompositeOperation = 'source-over';
    return ctx.getImageData(0, 0, width, height);
  };

  const reset = () => {
    scanners = [];
    layers = [];
    depthProbes = [];
  };

  return { init, setup, draw, reset, setProfile };
};

const MotionSoundscape = () => {
  const MOTION_SAMPLE_MS = 48;
  let ctx, master, ready = false, on = false;
  let rGain, gGain, bGain, rOsc, rOsc2, gOsc, gOsc2, bOsc, rFilt, gFilt, bFilt;
  let clickGain, lastAt = 0;
  let recDest = null;
  const smooth = { r: 0, g: 0, b: 0 };

  const init = () => {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const chain = (type, freq, filtType, filtFreq, filtQ) => {
      const osc = ctx.createOscillator();
      const filt = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      filt.type = filtType;
      filt.frequency.value = filtFreq;
      if (filtQ) filt.Q.value = filtQ;
      gain.gain.value = 0;
      osc.connect(filt);
      filt.connect(gain);
      gain.connect(master);
      osc.start();
      return { osc, filt, gain };
    };

    const ra = chain('sawtooth', 72, 'bandpass', 220, 1.2);
    const rb = chain('sawtooth', 74.5, 'bandpass', 220, 1.2);
    rOsc = ra.osc;
    rOsc2 = rb.osc;
    rGain = ra.gain;
    rFilt = ra.filt;
    rb.gain.gain.value = 0;
    rOsc2.disconnect();
    rOsc2.connect(rFilt);

    const ga = chain('sine', 330, 'bandpass', 900, 0.6);
    const gb = chain('sine', 337, 'bandpass', 900, 0.6);
    gOsc = ga.osc;
    gOsc2 = gb.osc;
    gGain = ga.gain;
    gFilt = ga.filt;
    gb.gain.gain.value = 0;
    gOsc2.disconnect();
    gOsc2.connect(gFilt);

    const ba = chain('triangle', 55, 'lowpass', 140);
    bOsc = ba.osc;
    bGain = ba.gain;
    bFilt = ba.filt;

    clickGain = ctx.createGain();
    clickGain.gain.value = 1;
    clickGain.connect(master);
    ready = true;
  };

  const resume = async () => {
    init();
    if (ctx.state === 'suspended') await ctx.resume();
  };

  const ensureOn = async () => {
    await resume();
    if (on) return true;
    on = true;
    master.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.08);
    return true;
  };

  const toggle = async () => {
    await resume();
    on = !on;
    master.gain.linearRampToValueAtTime(on ? 0.22 : 0, ctx.currentTime + 0.08);
    return on;
  };

  const motionEnergy = (pixels) => {
    const d = pixels.data;
    let r = 0, g = 0, b = 0, n = 0;
    const stride = 4 * 24;
    for (let i = 0; i < d.length; i += stride) {
      r += d[i];
      g += d[i + 1];
      b += d[i + 2];
      n++;
    }
    return { r: r / n / 255, g: g / n / 255, b: b / n / 255 };
  };

  const maybeClick = (rAmt) => {
    if (!on || rAmt < 0.04 || rnd() > rAmt * 0.35) return;
    const len = floor(ctx.sampleRate * 0.018);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (rnd() * 2 - 1) * pow(1 - i / len, 2.2);
    const src = ctx.createBufferSource();
    const env = ctx.createGain();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 160 + rAmt * 400;
    bp.Q.value = 2;
    src.buffer = buf;
    env.gain.value = 0.08 + rAmt * 0.2;
    src.connect(bp);
    bp.connect(env);
    env.connect(clickGain);
    src.start();
  };

  const update = (pixels, time) => {
    if (!ready || !on) return;
    if (time - lastAt < MOTION_SAMPLE_MS) return;
    lastAt = time;

    const raw = motionEnergy(pixels);
    const k = 0.18;
    smooth.r += (raw.r - smooth.r) * k;
    smooth.g += (raw.g - smooth.g) * k;
    smooth.b += (raw.b - smooth.b) * k;

    const t = ctx.currentTime;
    const ci = floor(time * 0.00035) % SPECTRUM.length;
    const spec = SPECTRUM[ci];
    const specHz = 220 + (spec[0] + spec[1] + spec[2]) / 765 * 280;

    rGain.gain.linearRampToValueAtTime(pow(smooth.r, 0.7) * 0.42, t + 0.05);
    rOsc.frequency.linearRampToValueAtTime(58 + smooth.r * 90, t + 0.05);
    rOsc2.frequency.linearRampToValueAtTime(60 + smooth.r * 92, t + 0.05);
    rFilt.frequency.linearRampToValueAtTime(140 + smooth.r * 520, t + 0.05);
    maybeClick(smooth.r);

    gGain.gain.linearRampToValueAtTime(pow(smooth.g, 0.65) * 0.38, t + 0.05);
    gOsc.frequency.linearRampToValueAtTime(specHz * (0.9 + smooth.g * 0.5), t + 0.05);
    gOsc2.frequency.linearRampToValueAtTime(specHz * (0.93 + smooth.g * 0.52), t + 0.05);
    gFilt.frequency.linearRampToValueAtTime(500 + smooth.g * 1800, t + 0.05);

    bGain.gain.linearRampToValueAtTime(pow(smooth.b, 0.75) * 0.45, t + 0.05);
    bOsc.frequency.linearRampToValueAtTime(38 + smooth.b * 110, t + 0.05);
    bFilt.frequency.linearRampToValueAtTime(90 + smooth.b * 220, t + 0.05);
  };

  const setMasterGain = (scale) => {
    if (!ready) return;
    master.gain.linearRampToValueAtTime(max(0, scale) * 0.22, ctx.currentTime + 0.06);
  };

  const getAudioStream = async () => {
    await ensureOn();
    if (!recDest) {
      recDest = ctx.createMediaStreamDestination();
      master.connect(recDest);
    }
    return recDest.stream;
  };

  return { resume, ensureOn, toggle, update, getAudioStream, setMasterGain, isOn: () => on };
};

const CanvasRecorder = (getCanvas, getAudioStream, filePrefix = 'loop-gallery') => {
  let recorder = null;
  let chunks = [];
  let active = false;

  const pickMime = () => {
    const types = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
  };

  const recExt = (mimeType) => (mimeType.startsWith('video/mp4') ? 'mp4' : 'webm');

  const setRecHint = (on) => {
    const hint = document.getElementById('hint');
    if (hint) hint.dataset.rec = on ? '1' : '';
  };

  const start = async () => {
    if (active) return false;
    const canvas = getCanvas();
    if (!canvas?.captureStream) return false;

    const mimeType = pickMime();
    if (!mimeType) {
      console.warn('MediaRecorder: no supported mp4/webm mime type');
      return false;
    }

    const videoStream = canvas.captureStream(60);
    const audioStream = await getAudioStream();
    const stream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    chunks = [];
    recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 16_000_000,
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `${filePrefix}-${ts}.${recExt(mimeType)}`;
      a.click();
      URL.revokeObjectURL(url);
      stream.getTracks().forEach((t) => t.stop());
      active = false;
      setRecHint(false);
    };

    recorder.start(1000);
    active = true;
    setRecHint(true);
    return true;
  };

  const stop = () => {
    if (!active || !recorder) return;
    if (recorder.state !== 'inactive') recorder.stop();
    recorder = null;
  };

  const toggle = async () => {
    if (active) {
      stop();
      return false;
    }
    return start();
  };

  return { toggle, isActive: () => active };
};

const VERT = [
  'varying vec2 vUv;',
  'void main() {',
  '  vUv = uv;',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
  '}',
].join('\n');

const SLICE_FRAG = [
  'precision highp float;',
  'uniform sampler2D buf, img, mot, codeImg;',
  'uniform float time;',
  'uniform vec3 dims;',
  'uniform float uSlice;',
  'uniform int doRaster;',
  'uniform int doSpectrum;',
  'uniform vec3 specA, specB, specInk;',
  'uniform float specAlphaAB, specAlphaInk, paletteVeil, codeVeil;',
  'uniform float walkZ, wallSide;',
  'varying vec2 vUv;',
  'vec2 atlasUV(vec2 uv, float z) { return vec2(uv.x, (z + uv.y) / dims.z); }',
  'vec3 sampleVol(vec2 uv, float dz) { return texture2D(buf, atlasUV(uv, uSlice + dz)).rgb; }',
  'void main() {',
  '  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);',
  '  vec2 pos = floor(uv * dims.xy);',
  '  vec3 col = sampleVol(uv, 0.0);',
  '  vec4 m = texture2D(mot, uv);',
  '  float dr = floor(m.r * 255.0 + 0.5);',
  '  float dg = floor(m.g * 255.0 + 0.5);',
  '  float db = floor(m.b * 255.0 + 0.5);',
  '  vec2 oxy = vec2(0.0);',
  '  float oz = 0.0;',
  '  if (doRaster == 1) {',
  '    if (mod(dr, 2.0) >= 1.0) oxy.y += 1.0 / dims.y;',
  '    if (mod(dr, 4.0) >= 2.0) oxy.x += 1.0 / dims.x;',
  '    if (mod(dr, 8.0) >= 4.0) oxy.y -= 1.0 / dims.y;',
  '    if (mod(dr, 16.0) >= 8.0) oxy.x -= 1.0 / dims.x;',
  '    if (mod(dr, 32.0) >= 16.0) oxy.y += 2.0 / dims.y;',
  '    if (mod(dr, 64.0) >= 32.0) oxy.x += 2.0 / dims.x;',
  '    if (mod(dr, 128.0) >= 64.0) oxy.y -= 2.0 / dims.y;',
  '    if (mod(dr, 256.0) >= 128.0) oxy.x -= 2.0 / dims.x;',
  '    if (mod(db, 2.0) >= 1.0) oz += 1.0;',
  '    if (mod(db, 4.0) >= 2.0) oz -= 1.0;',
  '    if (mod(db, 8.0) >= 4.0) oz += 2.0;',
  '    if (mod(db, 16.0) >= 8.0) oz -= 2.0;',
  '    col = sampleVol(uv + oxy, oz);',
  '  }',
  '  if (doSpectrum == 1) {',
  '    if (mod(dg, 2.0) >= 1.0) {',
  '      vec2 bUv = mod(pos, 16.0) / 16.0;',
  '      vec4 tile = texture2D(img, bUv);',
  '      col = mix(col, tile.rgb, tile.a * paletteVeil);',
  '    }',
  '    vec2 cUv = fract(uv * 0.38 + vec2(wallSide * 0.07, walkZ * 0.00018));',
  '    vec4 code = texture2D(codeImg, cUv);',
  '    col = mix(col, code.rgb, code.a * codeVeil);',
  '    if (mod(dg, 4.0) >= 2.0) col = mix(col, mix(specA, specB, fract(time * 0.14)), specAlphaAB);',
  '    if (mod(dg, 8.0) >= 4.0) col = mix(col, specInk, specAlphaInk);',
  '  }',
  '  gl_FragColor = vec4(col, 1.0);',
  '}',
].join('\n');

const TERRAIN_VERT = [
  'precision highp float;',
  'uniform sampler2D mot;',
  'uniform float walkZ;',
  'uniform float heightScale;',
  'varying vec2 vMapUv;',
  'float motH(vec2 uv) {',
  '  vec4 m = texture2D(mot, uv);',
  '  return (m.r * 0.35 + m.g * 0.85 + m.b * 1.0) / 255.0;',
  '}',
  'void main() {',
  '  vMapUv = vec2(',
  '    fract(uv.x + sin(walkZ * 0.0027) * 0.012),',
  '    fract(uv.y - walkZ * 0.00185)',
  '  );',
  '  float h = motH(vMapUv) * heightScale;',
  '  h += motH(vMapUv + vec2(0.003, 0.0)) * heightScale * 0.18;',
  '  h += motH(vMapUv + vec2(0.0, 0.003)) * heightScale * 0.18;',
  '  vec3 pos = vec3(position.x, position.y, h);',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);',
  '}',
].join('\n');

const SURFACE_FRAG = [
  'precision highp float;',
  'uniform sampler2D vol, img, mot, codeImg;',
  'uniform vec3 dims, specA, specB, specInk;',
  'uniform float time, walkZ, wallSide;',
  'uniform int doRaster, doSpectrum;',
  'uniform float specAlphaAB, specAlphaInk, paletteVeil, codeVeil;',
  'varying vec2 vMapUv;',
  'vec2 atlasUV(vec2 uv, float z) { return vec2(uv.x, (z + uv.y) / dims.z); }',
  'vec3 readVol(vec2 uv, float zSlice) { return texture2D(vol, atlasUV(uv, zSlice)).rgb; }',
  'void main() {',
  '  vec2 uv = vMapUv;',
  '  vec2 pos = floor(uv * dims.xy);',
  '  float zSlice = dims.z * 0.42;',
  '  vec3 col = readVol(uv, zSlice);',
  '  vec4 m = texture2D(mot, uv);',
  '  float dr = floor(m.r * 255.0 + 0.5);',
  '  float dg = floor(m.g * 255.0 + 0.5);',
  '  float db = floor(m.b * 255.0 + 0.5);',
  '  vec2 oxy = vec2(0.0);',
  '  float oz = 0.0;',
  '  if (doRaster == 1) {',
  '    if (mod(dr, 2.0) >= 1.0) oxy.y += 1.0 / dims.y;',
  '    if (mod(dr, 4.0) >= 2.0) oxy.x += 1.0 / dims.x;',
  '    if (mod(dr, 8.0) >= 4.0) oxy.y -= 1.0 / dims.y;',
  '    if (mod(dr, 16.0) >= 8.0) oxy.x -= 1.0 / dims.x;',
  '    if (mod(dr, 32.0) >= 16.0) oxy.y += 2.0 / dims.y;',
  '    if (mod(dr, 64.0) >= 32.0) oxy.x += 2.0 / dims.x;',
  '    if (mod(dr, 128.0) >= 64.0) oxy.y -= 2.0 / dims.y;',
  '    if (mod(dr, 256.0) >= 128.0) oxy.x -= 2.0 / dims.x;',
  '    if (mod(db, 2.0) >= 1.0) oz += 1.0;',
  '    if (mod(db, 4.0) >= 2.0) oz -= 1.0;',
  '    if (mod(db, 8.0) >= 4.0) oz += 2.0;',
  '    if (mod(db, 16.0) >= 8.0) oz -= 2.0;',
  '    col = readVol(uv + oxy, zSlice + oz);',
  '  }',
  '  if (doSpectrum == 1) {',
  '    if (mod(dg, 2.0) >= 1.0) {',
  '      vec2 bUv = mod(pos, 16.0) / 16.0;',
  '      vec4 tile = texture2D(img, bUv);',
  '      col = mix(col, tile.rgb, tile.a * paletteVeil);',
  '    }',
  '    vec2 cUv = fract(uv * 0.38 + vec2(wallSide * 0.07, walkZ * 0.00018));',
  '    vec4 code = texture2D(codeImg, cUv);',
  '    col = mix(col, code.rgb, code.a * codeVeil);',
  '    if (mod(dg, 4.0) >= 2.0) col = mix(col, mix(specA, specB, fract(time * 0.14)), specAlphaAB);',
  '    if (mod(dg, 8.0) >= 4.0) col = mix(col, specInk, specAlphaInk);',
  '  }',
  '  float ink = length(col - vec3(1.0));',
  '  col = mix(vec3(0.985), col, clamp(0.05 + ink * 1.4, 0.0, 1.0));',
  '  gl_FragColor = vec4(col, 1.0);',
  '}',
].join('\n');

const WALL_VERT = [
  'precision highp float;',
  'uniform sampler2D mot;',
  'uniform float walkZ, wallSide, pulseScale;',
  'varying vec2 vMapUv;',
  'float motH(vec2 uv) {',
  '  vec4 m = texture2D(mot, uv);',
  '  return (m.r * 0.35 + m.g * 0.85 + m.b * 1.0) / 255.0;',
  '}',
  'void main() {',
  '  vMapUv = vec2(',
  '    fract(uv.x * 1.55 + walkZ * 0.00038 + wallSide * 0.04),',
  '    fract(uv.y * 2.35 - walkZ * 0.00112 + wallSide * 0.09)',
  '  );',
  '  float push = motH(vMapUv) * pulseScale;',
  '  vec3 pos = position + vec3(wallSide * push, push * 0.14, sin(walkZ * 0.002 + uv.y * 6.28) * push * 0.08);',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);',
  '}',
].join('\n');

const CEIL_VERT = [
  'precision highp float;',
  'uniform sampler2D mot;',
  'uniform float walkZ, pulseScale;',
  'varying vec2 vMapUv;',
  'float motH(vec2 uv) {',
  '  vec4 m = texture2D(mot, uv);',
  '  return (m.r * 0.35 + m.g * 0.85 + m.b * 1.0) / 255.0;',
  '}',
  'void main() {',
  '  vMapUv = vec2(',
  '    fract(uv.x * 2.1 - walkZ * 0.00092),',
  '    fract(uv.y * 1.65 - walkZ * 0.00062)',
  '  );',
  '  float push = motH(vMapUv) * pulseScale;',
  '  vec3 pos = position + vec3(0.0, push * 0.28, sin(walkZ * 0.0018 + uv.x * 5.0) * push * 0.06);',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);',
  '}',
].join('\n');

const TERRAIN_FRAG = SURFACE_FRAG;
const WALL_FRAG = SURFACE_FRAG;
const CEIL_FRAG = SURFACE_FRAG;

const VolLandscapePOC = () => {
  let volDepth = 32;
  const MAX_ATLAS_H = 8192;
  const TERRAIN_W = 1200;
  const TERRAIN_D = 1200;
  const TERRAIN_SEGS = 160;
  const WALL_H = 96;
  const WALL_LEN = 380;
  const WALL_TILES = 14;
  const WALL_TILE_BEHIND = 4;
  const LANE_HALF = 28;
  const EYE_BASE = 7.5;
  const WALK_SPEED = 14;
  const FLOOR_SCROLL_BASE = 1.85;
  const FAR = 2800;

  let renderer, scene, camera, terrain, terrainMat;
  let leftWalls = [], rightWalls = [], ceilTiles = [];
  let leftWallMat, rightWallMat, ceilMat;
  let surfaceMats = [];
  let wallPulse = 7.5;
  let ceilPulse = 2.2;
  let sliceScene, sliceCam, sliceMat, sliceRT;
  let volTex = [null, null], volId = 0;
  let imgTex, motTex, motScratch, codeImgTex;
  let width, height, depth;
  let viewRot = { x: 0, y: -0.03, drag: false, px: 0, py: 0 };
  const camPos = new THREE.Vector3();
  let hallZ = 0;
  let walkZ = 0;
  let walkOn = true;
  let heightScale = 24;
  const moveKeys = { forward: false, back: false, left: false, right: false };
  const MANUAL_SPEED = 38;
  const fwd = new THREE.Vector3();
  const right = new THREE.Vector3();

  const clampPos = () => {
    camPos.x = max(-LANE_HALF + 4, min(LANE_HALF - 4, camPos.x));
    camPos.y = max(EYE_BASE - 1, min(EYE_BASE + 10, camPos.y));
  };

  const volSize = () => {
    let w = floor(window.innerWidth);
    let h = floor(window.innerHeight);
    const maxH = floor(MAX_ATLAS_H / volDepth);
    if (h > maxH) {
      const s = maxH / h;
      h = maxH;
      w = max(64, floor(w * s));
    }
    return { w: max(64, w), h: max(64, h) };
  };

  const palette16 = () => {
    const a = new Uint8Array(16 * 16 * 4);
    for (let i = 0; i < 256; i++) {
      const x = i % 16;
      const y = floor(i / 16);
      const grid = x % 4 === 0 || y % 4 === 0;
      const c = grid ? SPECTRUM[((x >> 2) + (y >> 2) * 2) % SPECTRUM.length] : PAL.white;
      a[i * 4] = c[0];
      a[i * 4 + 1] = c[1];
      a[i * 4 + 2] = c[2];
      a[i * 4 + 3] = grid ? floor(0.18 * 255) : 0;
    }
    return a;
  };

  const makeAtlas = (w, h, d) => {
    const data = new Uint8Array(w * h * d * 4);
    data.fill(255);
    const tex = new THREE.DataTexture(data, w, h * d, THREE.RGBAFormat, THREE.UnsignedByteType);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  };

  const makeDataTex = (w, h, data) => {
    const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  };

  const makeFlatRT = (w, h) => new THREE.WebGLRenderTarget(w, h, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });

  const tileMod = (z, len) => ((z % len) + len) % len;

  const makeWallTile = (side, mat) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(WALL_LEN, WALL_H, 1, 6), mat);
    mesh.position.set(side * LANE_HALF, WALL_H * 0.48, 0);
    mesh.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    scene.add(mesh);
    return mesh;
  };

  const makeCeilTile = (mat) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(WALL_LEN, LANE_HALF * 2.05, 1, 1), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, WALL_H * 0.98, 0);
    scene.add(mesh);
    return mesh;
  };

  const makeSurfaceUniforms = (wallSide = 0) => ({
    vol: { value: null },
    img: { value: null },
    mot: { value: null },
    codeImg: { value: codeImgTex },
    dims: { value: new THREE.Vector3(1, 1, volDepth) },
    time: { value: 0 },
    walkZ: { value: 0 },
    wallSide: { value: wallSide },
    doRaster: { value: 1 },
    doSpectrum: { value: 1 },
    specA: { value: new THREE.Vector3() },
    specB: { value: new THREE.Vector3() },
    specInk: { value: new THREE.Vector3(...rgb01(PAL.blend)) },
    specAlphaAB: { value: 0.28 },
    specAlphaInk: { value: 0.38 },
    paletteVeil: { value: 0.9 },
    codeVeil: { value: 0.55 },
  });

  const buildHallTiles = () => {
    leftWalls.length = 0;
    rightWalls.length = 0;
    ceilTiles.length = 0;
    surfaceMats = [];

    leftWallMat = new THREE.ShaderMaterial({
      uniforms: { ...makeSurfaceUniforms(-1), pulseScale: { value: wallPulse } },
      vertexShader: WALL_VERT,
      fragmentShader: WALL_FRAG,
      side: THREE.DoubleSide,
    });
    rightWallMat = new THREE.ShaderMaterial({
      uniforms: { ...makeSurfaceUniforms(1), pulseScale: { value: wallPulse } },
      vertexShader: WALL_VERT,
      fragmentShader: WALL_FRAG,
      side: THREE.DoubleSide,
    });
    ceilMat = new THREE.ShaderMaterial({
      uniforms: { ...makeSurfaceUniforms(0), pulseScale: { value: ceilPulse } },
      vertexShader: CEIL_VERT,
      fragmentShader: CEIL_FRAG,
      side: THREE.DoubleSide,
    });
    surfaceMats = [terrainMat, leftWallMat, rightWallMat, ceilMat].filter(Boolean);

    for (let i = 0; i < WALL_TILES; i++) {
      leftWalls.push(makeWallTile(-1, leftWallMat));
      rightWalls.push(makeWallTile(1, rightWallMat));
      ceilTiles.push(makeCeilTile(ceilMat));
    }
  };

  const moveActive = () => moveKeys.forward || moveKeys.back || moveKeys.left || moveKeys.right;

  const floorScrollGain = (speed) => {
    const ratio = min(3.2, max(0.35, speed / WALK_SPEED));
    return FLOOR_SCROLL_BASE * (0.34 + 0.66 * ratio);
  };

  const syncSurfaceUniforms = (timeMs, volCur) => {
    const ci = floor(timeMs * 0.00035) % SPECTRUM.length;
    const t = timeMs * 0.001;
    const specA = rgb01(SPECTRUM[ci]);
    const specB = rgb01(SPECTRUM[(ci + 3) % SPECTRUM.length]);
    const specInk = rgb01(PAL.blend);
    for (const mat of surfaceMats) {
      if (!mat) continue;
      mat.uniforms.time.value = t;
      mat.uniforms.walkZ.value = walkZ;
      mat.uniforms.mot.value = motTex;
      mat.uniforms.vol.value = volTex[volCur];
      mat.uniforms.specA.value.set(...specA);
      mat.uniforms.specB.value.set(...specB);
      mat.uniforms.specInk.value.set(...specInk);
    }
    if (sliceMat) {
      sliceMat.uniforms.time.value = t;
      sliceMat.uniforms.walkZ.value = walkZ;
      sliceMat.uniforms.specA.value.set(...specA);
      sliceMat.uniforms.specB.value.set(...specB);
      sliceMat.uniforms.specInk.value.set(...specInk);
    }
  };

  const syncWalkUniforms = () => {
    for (const mat of surfaceMats) {
      if (mat?.uniforms?.walkZ) mat.uniforms.walkZ.value = walkZ;
    }
  };

  const syncHallGeometry = () => {
    if (!leftWalls.length) return;
    const camZ = camPos.z;
    const base = camZ - tileMod(camZ, WALL_LEN);
    for (let i = 0; i < WALL_TILES; i++) {
      const z = base + (i - WALL_TILE_BEHIND) * WALL_LEN;
      leftWalls[i].position.z = z;
      rightWalls[i].position.z = z;
      ceilTiles[i].position.set(camPos.x * 0.06, WALL_H * 0.98, z);
    }
    if (terrain) terrain.position.set(camPos.x * 0.08, 0, camZ);
  };

  const applyTravel = (travel, speed = WALK_SPEED) => {
    if (!travel) return;
    hallZ += travel;
    walkZ += travel * floorScrollGain(speed);
    syncWalkUniforms();

    camera.rotation.order = 'YXZ';
    camera.rotation.y = viewRot.x;
    camera.rotation.x = viewRot.y;
    camera.rotation.z = 0;
    camera.position.copy(camPos);
    camera.updateMatrixWorld();
    camera.getWorldDirection(fwd);
    camPos.addScaledVector(fwd, travel);
    clampPos();
    syncHallGeometry();
  };

  const resetTravel = () => {
    hallZ = 0;
    walkZ = 0;
    camPos.set(0, EYE_BASE, 0);
    syncWalkUniforms();
    syncHallGeometry();
  };

  const updateWalk = (timeMs, dragging) => {
    const dt = min(0.05, max(0.001, (updateWalk.lastMs ? (timeMs - updateWalk.lastMs) / 1000 : 0.016)));
    updateWalk.lastMs = timeMs;

    if (!dragging && !moveKeys.forward && !moveKeys.back && walkOn) {
      const pace = WALK_SPEED * (0.7 + 0.3 * sin(timeMs * 0.00019));
      applyTravel(dt * pace, pace);
    } else {
      syncWalkUniforms();
    }

    const bob = sin(walkZ * 0.11) * 1.0 + sin(timeMs * 0.002) * 0.3;
    const swayX = sin(timeMs * 0.0001) * 1.8;
    camPos.y = EYE_BASE + bob;
    if (!moveActive()) camPos.x = swayX;

    if (dragging || moveActive()) return;
    if (walkOn) {
      viewRot.x = sin(timeMs * 0.00008) * 0.06 + sin(walkZ * 0.035) * 0.025;
      viewRot.y = -0.03 + sin(timeMs * 0.00004) * 0.015;
    }
  };

  const applyManualMove = (timeMs) => {
    const strafeOn = moveKeys.left || moveKeys.right;
    const travelOn = moveKeys.forward || moveKeys.back;
    if (!strafeOn && !travelOn) return;

    const dt = min(0.05, max(0.001, (applyManualMove.lastMs ? (timeMs - applyManualMove.lastMs) / 1000 : 0.016)));
    applyManualMove.lastMs = timeMs;

    if (travelOn) {
      let travel = 0;
      let speed = MANUAL_SPEED;
      if (moveKeys.forward) travel += MANUAL_SPEED * dt;
      if (moveKeys.back) {
        travel -= MANUAL_SPEED * 0.85 * dt;
        speed = MANUAL_SPEED * 0.85;
      }
      applyTravel(travel, speed);
    }

    if (strafeOn) {
      camera.rotation.order = 'YXZ';
      camera.rotation.y = viewRot.x;
      camera.rotation.x = viewRot.y;
      camera.rotation.z = 0;
      camera.position.copy(camPos);
      camera.updateMatrixWorld();
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      let strafe = 0;
      if (moveKeys.left) strafe -= MANUAL_SPEED * dt;
      if (moveKeys.right) strafe += MANUAL_SPEED * dt;
      camPos.addScaledVector(right, strafe);
      clampPos();
    }
  };

  const nudgeAlongView = (delta) => {
    const speed = min(MANUAL_SPEED, max(WALK_SPEED, Math.abs(delta) * 42));
    applyTravel(delta, speed);
  };

  const bindOrbit = () => {
    const el = renderer.domElement;
    el.addEventListener('pointerdown', (e) => {
      el.focus({ preventScroll: true });
      viewRot.drag = true;
      viewState.dragging = true;
      viewRot.px = e.clientX;
      viewRot.py = e.clientY;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!viewRot.drag) return;
      viewRot.x += (e.clientX - viewRot.px) * 0.004;
      viewRot.y += (e.clientY - viewRot.py) * 0.004;
      viewRot.y = max(-0.32, min(0.2, viewRot.y));
      viewRot.px = e.clientX;
      viewRot.py = e.clientY;
    });
    el.addEventListener('pointerup', () => { viewRot.drag = false; viewState.dragging = false; });
    el.addEventListener('pointercancel', () => { viewRot.drag = false; viewState.dragging = false; });
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      nudgeAlongView(-e.deltaY * (e.ctrlKey ? 0.003 : 0.065));
    }, { passive: false });
  };

  const init = () => {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.style.outline = 'none';

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 140, FAR * 0.88);
    camera = new THREE.PerspectiveCamera(68, 1, 0.05, FAR);

    codeImgTex = rasterizeCodeArtLayer(2048);

    terrainMat = new THREE.ShaderMaterial({
      uniforms: {
        ...makeSurfaceUniforms(0),
        heightScale: { value: heightScale },
      },
      vertexShader: TERRAIN_VERT,
      fragmentShader: TERRAIN_FRAG,
      side: THREE.DoubleSide,
    });

    terrain = new THREE.Mesh(
      new THREE.PlaneGeometry(TERRAIN_W, TERRAIN_D, TERRAIN_SEGS, TERRAIN_SEGS),
      terrainMat
    );
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    buildHallTiles();

    sliceScene = new THREE.Scene();
    sliceCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    sliceMat = new THREE.ShaderMaterial({
      uniforms: {
        buf: { value: null },
        img: { value: null },
        mot: { value: null },
        codeImg: { value: codeImgTex },
        time: { value: 0 },
        dims: { value: new THREE.Vector3(1, 1, volDepth) },
        uSlice: { value: 0 },
        doRaster: { value: 1 },
        doSpectrum: { value: 1 },
        specA: { value: new THREE.Vector3() },
        specB: { value: new THREE.Vector3() },
        specInk: { value: new THREE.Vector3(...rgb01(PAL.blend)) },
        specAlphaAB: { value: 0.22 },
        specAlphaInk: { value: 0.34 },
        paletteVeil: { value: 0.9 },
        codeVeil: { value: 0.55 },
        walkZ: { value: 0 },
        wallSide: { value: 0 },
      },
      vertexShader: VERT,
      fragmentShader: SLICE_FRAG,
      depthTest: false,
      depthWrite: false,
    });
    sliceScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), sliceMat));
    bindOrbit();
    syncHallGeometry();
  };

  const setup = () => {
    ({ w: width, h: height } = volSize());
    depth = volDepth;
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    if (volTex[0]) volTex[0].dispose();
    if (volTex[1]) volTex[1].dispose();
    volTex = [makeAtlas(width, height, depth), makeAtlas(width, height, depth)];
    volId = 0;

    if (motTex) motTex.dispose();
    motTex = makeDataTex(width, height, new Uint8Array(width * height * 4));
    if (imgTex) imgTex.dispose();
    imgTex = makeDataTex(16, 16, palette16());

    if (sliceRT) sliceRT.dispose();
    sliceRT = makeFlatRT(width, height);

    sliceMat.uniforms.dims.value.set(width, height, depth);
    sliceMat.uniforms.img.value = imgTex;
    sliceMat.uniforms.mot.value = motTex;
    sliceMat.uniforms.codeImg.value = codeImgTex;

    for (const mat of surfaceMats) {
      if (!mat) continue;
      mat.uniforms.dims.value.set(width, height, depth);
      mat.uniforms.img.value = imgTex;
      mat.uniforms.mot.value = motTex;
      mat.uniforms.codeImg.value = codeImgTex;
      mat.uniforms.vol.value = volTex[volId];
    }
    if (terrainMat) terrainMat.uniforms.heightScale.value = heightScale;

    motScratch = document.createElement('canvas');
  };

  const uploadMotion = (pixels) => {
    if (!motScratch || !motTex) return;
    motScratch.width = width;
    motScratch.height = height;
    const ctx = motScratch.getContext('2d');
    const src = document.createElement('canvas');
    src.width = pixels.width;
    src.height = pixels.height;
    src.getContext('2d').putImageData(pixels, 0, 0);
    ctx.drawImage(src, 0, 0, width, height);
    const d = ctx.getImageData(0, 0, width, height);
    motTex.image.data.set(d.data);
    motTex.needsUpdate = true;
  };

  const copySliceToAtlas = (destTex, z) => {
    const gl = renderer.getContext();
    renderer.initTexture(destTex);
    const destProps = renderer.properties.get(destTex);
    const rtProps = renderer.properties.get(sliceRT);
    gl.bindTexture(gl.TEXTURE_2D, destProps.__webglTexture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, rtProps.__webglFramebuffer);
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, z * height, 0, 0, width, height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  const volStep = (timeMs) => {
    const volPrev = volId;
    const volCur = volId ^= 1;

    sliceMat.uniforms.buf.value = volTex[volPrev];
    sliceMat.uniforms.mot.value = motTex;

    renderer.setRenderTarget(sliceRT);
    for (let z = 0; z < depth; z++) {
      sliceMat.uniforms.uSlice.value = z;
      renderer.render(sliceScene, sliceCam);
      copySliceToAtlas(volTex[volCur], z);
    }
    renderer.setRenderTarget(null);
    syncSurfaceUniforms(timeMs, volCur);
  };

  const render = (timeMs, pixels, dragging) => {
    uploadMotion(pixels);
    updateWalk(timeMs, dragging);
    applyManualMove(timeMs);

    camera.rotation.order = 'YXZ';
    camera.rotation.y = viewRot.x;
    camera.rotation.x = viewRot.y;
    camera.rotation.z = 0;
    camera.position.copy(camPos);
    clampPos();
    syncHallGeometry();

    volStep(timeMs);
    renderer.render(scene, camera);
  };

  const setMoveKey = (name, down) => {
    if (name in moveKeys) moveKeys[name] = down;
  };

  const toggleWalk = () => {
    walkOn = !walkOn;
    updateWalk.lastMs = performance.now();
    return walkOn;
  };

  const applySeedProfile = (prof) => {
    volDepth = prof.volDepth;
    heightScale = prof.heightScale;
    wallPulse = max(5, heightScale * 0.24);
    ceilPulse = max(1.5, heightScale * 0.08);
    if (sliceMat) sliceMat.uniforms.codeVeil.value = prof.codeVeil;
    for (const mat of surfaceMats) {
      if (!mat) continue;
      mat.uniforms.codeVeil.value = prof.codeVeil;
      if (mat.uniforms.heightScale) mat.uniforms.heightScale.value = heightScale;
      if (mat.uniforms.pulseScale) {
        mat.uniforms.pulseScale.value = mat === ceilMat ? ceilPulse : wallPulse;
      }
    }
  };

  const refreshCodeArt = () => {
    if (codeImgTex) codeImgTex.dispose();
    codeImgTex = rasterizeCodeArtLayer(2048);
    if (sliceMat) sliceMat.uniforms.codeImg.value = codeImgTex;
    for (const mat of surfaceMats) {
      if (mat) mat.uniforms.codeImg.value = codeImgTex;
    }
  };

  return {
    init, setup, render, setMoveKey, toggleWalk, nudgeAlongView, resetTravel,
    applySeedProfile, refreshCodeArt,
    getCanvas: () => renderer?.domElement ?? null,
    getCamPos: () => camPos,
    getScene: () => scene,
  };
};


  const c2d = Canvas2d();
  const gpu = VolLandscapePOC();
  const snd = MotionSoundscape();
  const viewState = { dragging: false };
  const recPrefix = options.recordingPrefix || 'loop-gallery';
  let rec = null;

  const applySeed = (seed) => {
    const prof = buildSeedProfile(seed >>> 0);
    orgRng = makeRng(seed >>> 0);
    for (const [k, v] of Object.entries(prof.palette)) PAL[k] = v.slice();
    rebuildSpectrum();
    c2d.setProfile(prof.canvas);
    c2d.reset();
    gpu.applySeedProfile(prof);
    gpu.refreshCodeArt();
    c2d.setup();
    gpu.setup();
  };

  const mountBefore = options.insertBefore || null;
  await loadArtSource();
  c2d.init();
  gpu.init();
  applySeed(options.seed ?? DEFAULT_SEED);

  const canvas = gpu.getCanvas();
  rec = CanvasRecorder(() => gpu.getCanvas(), () => snd.getAudioStream(), recPrefix);
  if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
  if (mountBefore?.parentNode) mountBefore.parentNode.insertBefore(canvas, mountBefore);
  else if (!canvas.parentNode) document.body.appendChild(canvas);
  canvas.focus?.({ preventScroll: true });

  const motionOpts = { auto: true, mode: 0 };
  let running = true;

  const onResize = () => { c2d.setup(); gpu.setup(); };
  window.addEventListener('resize', onResize);

  const frame = (t) => {
    if (!running) return;
    const pixels = c2d.draw(t, motionOpts);
    gpu.render(t, pixels, viewState.dragging);
    snd.update(pixels, t);
    options.onFrame?.(t);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return {
    getCanvas: () => canvas,
    getCamPos: () => gpu.getCamPos(),
    getScene: () => gpu.getScene(),
    setMoveKey: (n, d) => gpu.setMoveKey(n, d),
    toggleWalk: () => gpu.toggleWalk(),
    nudgeAlongView: (d) => gpu.nudgeAlongView(d),
    toggleRecord: async () => {
      await snd.ensureOn();
      return rec.toggle();
    },
    toggleMute: () => snd.toggle(),
    isRecording: () => rec.isActive(),
    stop: () => { running = false; window.removeEventListener('resize', onResize); },
    gpu,
    c2d,
  };
}
