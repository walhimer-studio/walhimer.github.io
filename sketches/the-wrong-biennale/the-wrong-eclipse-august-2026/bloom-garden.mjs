/**
 * Bloom garden — same lifeline pattern as bloom-release:
 * color appears on each note, hold, then reverse death order.
 */

class Rand {
  constructor(seed) {
    this.s = Math.abs(seed) + 1;
  }
  next() {
    const x = Math.sin(this.s++) * 10000;
    return x - Math.floor(x);
  }
  range(a, b) {
    return a + this.next() * (b - a);
  }
}

function hsbToRgb(h, s, b) {
  s /= 100;
  b /= 100;
  const k = (n) => (n + h / 60) % 6;
  const f = (n) => b - b * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  return [f(5), f(3), f(1)];
}

function rgbaStr(rgb, a) {
  return `rgba(${(rgb[0] * 255) | 0},${(rgb[1] * 255) | 0},${(rgb[2] * 255) | 0},${a.toFixed(3)})`;
}

class Bloom {
  constructor(rng, W, H, noteName) {
    this.x = rng.range(W * 0.08, W * 0.92);
    this.y = rng.range(H * 0.1, H * 0.9);
    const h0 = rng.range(0, 360);
    this.c1 = hsbToRgb(h0, rng.range(80, 100), 100);
    this.c2 = hsbToRgb((h0 + rng.range(30, 80)) % 360, rng.range(70, 95), 100);
    this.c3 = hsbToRgb((h0 + rng.range(140, 200)) % 360, rng.range(60, 85), 95);
    this.maxR = rng.range(36, 96);
    this.layerCount = Math.floor(rng.range(4, 7));
    this.layers = Array.from({ length: this.layerCount }, (_, i) => ({
      dx: rng.range(-10, 10),
      dy: rng.range(-10, 10),
      rScale: 1.0 - i * (0.38 / this.layerCount),
      alpha: 0.35 - i * (0.06 / this.layerCount),
    }));
    this.breathAmp = rng.range(0.05, 0.1);
    this.breathSpeed = rng.range(0.6, 1.5);
    this.breathPhase = rng.range(0, Math.PI * 2);
    this.noteName = noteName;
    this.growSpeed = rng.range(0.022, 0.042);
    this.currentR = 0;
    this.growing = true;
    this.dying = false;
    this.fadeAlpha = 1.0;
    this.fadeSpeed = rng.range(0.001, 0.0025);
    this.dead = false;
  }

  update(dt) {
    if (this.growing) {
      this.currentR += this.maxR * this.growSpeed * (dt / 16.67);
      if (this.currentR >= this.maxR) {
        this.currentR = this.maxR;
        this.growing = false;
      }
    }
    if (this.dying) {
      this.fadeAlpha -= this.fadeSpeed * (dt / 16.67);
      if (this.fadeAlpha <= 0) this.dead = true;
    }
  }

  startDying() {
    this.dying = true;
  }

  draw(ctx, t) {
    if (this.dead) return;
    const breath = 1.0 + this.breathAmp * Math.sin(t * 0.001 * this.breathSpeed + this.breathPhase);
    const r = this.currentR * (this.growing ? 1.0 : breath);
    if (r < 1) return;

    for (const L of this.layers) {
      const cx = this.x + L.dx * (r / this.maxR);
      const cy = this.y + L.dy * (r / this.maxR);
      const lr = r * L.rScale;
      const la = L.alpha * this.fadeAlpha;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, lr);
      grad.addColorStop(0.0, rgbaStr(this.c1, la * 0.95));
      grad.addColorStop(0.3, rgbaStr(this.c2, la * 0.6));
      grad.addColorStop(0.7, rgbaStr(this.c3, la * 0.28));
      grad.addColorStop(1.0, rgbaStr(this.c3, 0));
      ctx.beginPath();
      ctx.arc(cx, cy, lr, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }
}

export function createBloomGarden(canvas, seed = 120826) {
  const rng = new Rand(seed);
  const ctx = canvas.getContext("2d");
  let blooms = [];
  let reverseStarted = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  return {
    addBloom(noteName) {
      blooms.push(new Bloom(rng, canvas.clientWidth, canvas.clientHeight, noteName));
    },

    beginReverse() {
      if (reverseStarted || blooms.length === 0) return;
      reverseStarted = true;
      [...blooms].reverse().forEach((b, i) => {
        setTimeout(() => b.startDying(), i * 600);
      });
    },

    reset() {
      blooms = [];
      reverseStarted = false;
    },

    update(dt) {
      blooms.forEach((b) => b.update(dt));
    },

    draw(tMs) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#07080c";
      ctx.fillRect(0, 0, w, h);
      [...blooms].sort((a, b) => b.maxR - a.maxR).forEach((b) => b.draw(ctx, tMs));
    },

    count: () => blooms.length,
    allDead: () => blooms.length > 0 && blooms.every((b) => b.dead),
  };
}
