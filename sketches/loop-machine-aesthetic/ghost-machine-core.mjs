import * as THREE from "three";

export const SEED = 77823;

/** 4× floor area (2× width & depth), machine scale unchanged */
export const ROOM = { width: 28, depth: 28, height: 9 };

export const LAYOUT = {
  hallwayWidth: 4,
  hallwayLength: 8,
  hallwayLengthAB: 16,
  doorwayWidth: 4,
};

export const RW = ROOM.width / 2;
export const RD = ROOM.depth / 2;
/** Room B at origin; A west, C east along +X */
export const ROOM_A_X = -(RW + LAYOUT.hallwayLengthAB + RW);
export const ROOM_C_X = RW + LAYOUT.hallwayLength + RW;
export const HALL_AB = { x0: ROOM_A_X + RW, x1: -RW };
export const HALL_BC = { x0: RW, x1: ROOM_C_X - RW };

export const PALETTE = {
  ink: 0x2c3034,
  lightBlue: 0x74b4dc,
  skyBlue: 0x80b8e8,
  navy: 0x5a788c,
  gold: 0xeca018,
  maroon: 0x662020,
};

const TAU = Math.PI * 2;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

export function makeRng(seed) {
  let s = seed >>> 0;
  return {
    random() {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    uniform(a, b) {
      return a + this.random() * (b - a);
    },
    randint(a, b) {
      return a + Math.floor(this.random() * (b - a + 1));
    },
    choice(arr) {
      return arr[this.randint(0, arr.length - 1)];
    },
    chance(p) {
      return this.random() < p;
    },
  };
}

function cpts(cx, cy, cz, r, plane, n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = TAU * i / n;
    if (plane === "xz") pts.push(v3(cx + r * Math.cos(a), cy, cz + r * Math.sin(a)));
    else if (plane === "xy") pts.push(v3(cx + r * Math.cos(a), cy + r * Math.sin(a), cz));
    else pts.push(v3(cx, cy + r * Math.sin(a), cz + r * Math.cos(a)));
  }
  return pts;
}

export class WireBuilder {
  constructor(root) {
    this.root = root;
    this.staticRoot = new THREE.Group();
    this.root.add(this.staticRoot);
    this.spinners = [];
    this.stack = [this.staticRoot];
    this.current = this.staticRoot;
    this.lineColor = PALETTE.ink;
  }

  setColor(color) {
    this.lineColor = color == null ? PALETTE.ink : color;
  }

  resetColor() {
    this.lineColor = PALETTE.ink;
  }

  pushSpin(px, py, pz, axis, durationSec, reverse) {
    const pivot = new THREE.Group();
    pivot.position.set(px, py, pz);
    const content = new THREE.Group();
    pivot.add(content);
    this.root.add(pivot);
    const speed = (reverse ? -1 : 1) * (TAU / durationSec);
    pivot.name = `machine_spin_${this.spinners.length}`;
    this.spinners.push({ pivot, axis, speed });
    this.stack.push(content);
    this.current = content;
  }

  popSpin() {
    if (this.stack.length <= 1) return;
    this.stack.pop();
    this.current = this.stack[this.stack.length - 1];
  }

  _lineGeo(a, b) {
    const g = new THREE.BufferGeometry();
    g.setFromPoints([a, b]);
    return g;
  }

  seg(a, b, opacity) {
    let op = opacity == null ? 1 : opacity;
    const isAccent = this.lineColor !== PALETTE.ink;
    if (isAccent) op = Math.min(op, 0.48);
    const mat = new THREE.LineBasicMaterial({
      color: this.lineColor,
      transparent: op < 1,
      opacity: op,
    });
    this.current.add(new THREE.Line(this._lineGeo(a, b), mat));
  }

  spoly(pts, close, opacity) {
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      if (!close && i === n - 1) break;
      this.seg(pts[i], pts[j], opacity);
    }
  }

  disk(cx, cy, cz, r, plane, n) {
    this.spoly(cpts(cx, cy, cz, r, plane, n), true);
  }

  box(x, y, z, bw, bh, bd) {
    const c = [
      v3(x, y, z),
      v3(x + bw, y, z),
      v3(x + bw, y, z + bd),
      v3(x, y, z + bd),
      v3(x, y + bh, z),
      v3(x + bw, y + bh, z),
      v3(x + bw, y + bh, z + bd),
      v3(x, y + bh, z + bd),
    ];
    const solid = [
      [0, 1],
      [0, 3],
      [0, 4],
      [1, 5],
      [3, 7],
      [4, 5],
      [4, 7],
      [5, 6],
      [6, 7],
    ];
    const hidden = [
      [1, 2],
      [2, 3],
      [2, 6],
    ];
    for (const [a, b] of solid) this.seg(c[a], c[b]);
    for (const [a, b] of hidden) this.seg(c[a], c[b], 0.45);
  }

  cyl(cx, cy, cz, r, h, n, ribs) {
    const bot = cpts(cx, cy, cz, r, "xz", n);
    const top = cpts(cx, cy + h, cz, r, "xz", n);
    let li = 0,
      ri = 0;
    for (let i = 1; i < n; i++) {
      if (bot[i].x < bot[li].x) li = i;
      if (bot[i].x > bot[ri].x) ri = i;
    }
    this.spoly(bot, true);
    this.spoly(top, true);
    this.seg(bot[li], top[li]);
    this.seg(bot[ri], top[ri]);
    if (ribs) {
      const step = Math.max(1, Math.floor(n / ribs));
      for (let i = 0; i < n; i += step) this.seg(bot[i], top[i], 0.35);
    }
  }

  cylX(cx, cy, cz, r, length, n) {
    const lpts = [],
      rpts = [];
    for (let i = 0; i < n; i++) {
      const a = TAU * i / n;
      lpts.push(v3(cx - length / 2, cy + r * Math.sin(a), cz + r * Math.cos(a)));
      rpts.push(v3(cx + length / 2, cy + r * Math.sin(a), cz + r * Math.cos(a)));
    }
    let ti = 0,
      bi = 0;
    for (let i = 1; i < n; i++) {
      if (lpts[i].y < lpts[ti].y) ti = i;
      if (lpts[i].y > lpts[bi].y) bi = i;
    }
    this.spoly(lpts, true);
    this.spoly(rpts, true);
    this.seg(lpts[ti], rpts[ti]);
    this.seg(lpts[bi], rpts[bi]);
  }

  cylZ(cx, cy, cz, r, length, n) {
    const lpts = [],
      rpts = [];
    for (let i = 0; i < n; i++) {
      const a = TAU * i / n;
      lpts.push(v3(cx + r * Math.cos(a), cy + r * Math.sin(a), cz - length / 2));
      rpts.push(v3(cx + r * Math.cos(a), cy + r * Math.sin(a), cz + length / 2));
    }
    let ti = 0,
      bi = 0;
    for (let i = 1; i < n; i++) {
      if (lpts[i].y < lpts[ti].y) ti = i;
      if (lpts[i].y > lpts[bi].y) bi = i;
    }
    this.spoly(lpts, true);
    this.spoly(rpts, true);
    this.seg(lpts[ti], rpts[ti]);
    this.seg(lpts[bi], rpts[bi]);
  }

  ringXZ(cx, cy, cz, rOut, rIn, h, n) {
    for (const yy of [cy, cy + h]) {
      this.spoly(cpts(cx, yy, cz, rOut, "xz", n), true);
      this.spoly(cpts(cx, yy, cz, rIn, "xz", n), true, 0.65);
    }
    const botO = cpts(cx, cy, cz, rOut, "xz", n);
    const topO = cpts(cx, cy + h, cz, rOut, "xz", n);
    let li = 0,
      ri = 0;
    for (let i = 1; i < n; i++) {
      if (botO[i].x < botO[li].x) li = i;
      if (botO[i].x > botO[ri].x) ri = i;
    }
    this.seg(botO[li], topO[li]);
    this.seg(botO[ri], topO[ri]);
    const botI = cpts(cx, cy, cz, rIn, "xz", n);
    const topI = cpts(cx, cy + h, cz, rIn, "xz", n);
    this.seg(botI[li], topI[li], 0.65);
    this.seg(botI[ri], topI[ri], 0.65);
  }

  gearRingXZ(cx, cy, cz, r, teeth, th) {
    this.ringXZ(cx, cy, cz, r, r * 0.82, th, 64);
    const thR = r * 0.078;
    for (let i = 0; i < teeth; i++) {
      const a1 = TAU * (i - 0.4) / teeth;
      const a2 = TAU * (i + 0.4) / teeth;
      const tp = (a, rr, yy) => v3(cx + rr * Math.cos(a), yy, cz + rr * Math.sin(a));
      this.spoly(
        [tp(a1, r, cy + th), tp(a2, r, cy + th), tp(a2, r + thR, cy + th), tp(a1, r + thR, cy + th)],
        true,
        0.75
      );
      this.seg(tp(a1, r + thR, cy), tp(a1, r + thR, cy + th), 0.55);
    }
  }

  gearRingXY(cx, cy, cz, r, teeth, th) {
    const n = 64;
    const ptsF = cpts(cx, cy, cz, r, "xy", n);
    const ptsB = cpts(cx, cy, cz + th, r, "xy", n);
    this.spoly(ptsF, true);
    this.spoly(ptsB, true, 0.55);
    this.spoly(cpts(cx, cy, cz, r * 0.82, "xy", n), true, 0.52);
    this.spoly(cpts(cx, cy, cz + th, r * 0.82, "xy", n), true, 0.38);
    const pick = (fn, ax) => {
      let idx = 0;
      for (let i = 1; i < n; i++) if (fn(ax(ptsF[i]), ax(ptsF[idx]))) idx = i;
      return idx;
    };
    for (const [fn, ax] of [
      [Math.min, (p) => p.y],
      [Math.max, (p) => p.y],
      [Math.min, (p) => p.x],
      [Math.max, (p) => p.x],
    ]) {
      const idx = pick(fn, ax);
      this.seg(ptsF[idx], ptsB[idx], 0.78);
    }
    const thR = r * 0.078;
    for (let i = 0; i < teeth; i++) {
      const a1 = TAU * (i - 0.4) / teeth;
      const a2 = TAU * (i + 0.4) / teeth;
      const tp = (a, rr, dz) => v3(cx + rr * Math.cos(a), cy + rr * Math.sin(a), cz + dz);
      this.spoly([tp(a1, r, 0), tp(a2, r, 0), tp(a2, r + thR, 0), tp(a1, r + thR, 0)], true, 0.55);
      this.seg(tp(a1, r + thR, 0), tp(a1, r + thR, th), 0.32);
    }
  }

  gearRingYZ(cx, cy, cz, r, teeth, th) {
    const n = 72;
    const yz = (dx, rr) => {
      const out = [];
      for (let i = 0; i < n; i++) {
        const a = TAU * i / n;
        out.push(v3(cx + dx, cy + rr * Math.sin(a), cz + rr * Math.cos(a)));
      }
      return out;
    };
    const ptsF = yz(0, r);
    const ptsB = yz(th, r);
    this.spoly(ptsF, true);
    this.spoly(ptsB, true, 0.55);
    this.spoly(yz(0, r * 0.82), true, 0.52);
    this.spoly(yz(th, r * 0.82), true, 0.38);
    const pick = (fn, ax) => {
      let idx = 0;
      for (let i = 1; i < n; i++) if (fn(ax(ptsF[i]), ax(ptsF[idx]))) idx = i;
      return idx;
    };
    for (const [fn, ax] of [
      [Math.min, (p) => p.y],
      [Math.max, (p) => p.y],
      [Math.min, (p) => p.x],
      [Math.max, (p) => p.x],
    ]) {
      const idx = pick(fn, ax);
      this.seg(ptsF[idx], ptsB[idx], 0.78);
    }
    const thR = r * 0.078;
    for (let i = 0; i < teeth; i++) {
      const a1 = TAU * (i - 0.4) / teeth;
      const a2 = TAU * (i + 0.4) / teeth;
      const tp = (a, rr, dx) => v3(cx + dx, cy + rr * Math.sin(a), cz + rr * Math.cos(a));
      this.spoly([tp(a1, r, 0), tp(a2, r, 0), tp(a2, r + thR, 0), tp(a1, r + thR, 0)], true, 0.55);
      this.seg(tp(a1, r + thR, 0), tp(a1, r + thR, th), 0.32);
    }
  }

  gearXZ(cx, cy, cz, r, teeth, th) {
    const thR = r * 0.12;
    for (let i = 0; i < teeth; i++) {
      const a1 = TAU * (i - 0.38) / teeth;
      const a2 = TAU * (i + 0.38) / teeth;
      const tp = (a, rr, yy) => v3(cx + rr * Math.cos(a), yy, cz + rr * Math.sin(a));
      this.spoly(
        [tp(a1, r, cy + th), tp(a2, r, cy + th), tp(a2, r + thR, cy + th), tp(a1, r + thR, cy + th)],
        true,
        0.75
      );
      this.seg(tp(a1, r + thR, cy), tp(a1, r + thR, cy + th), 0.5);
    }
    this.disk(cx, cy, cz, r, "xz", 48);
    this.disk(cx, cy + th, cz, r * 0.88, "xz", 48);
    this.disk(cx, cy + th, cz, r * 0.18, "xz", 48);
  }

  spokes(cx, cy, cz, r, n, plane) {
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * i) / n;
      if (plane === "xz") {
        this.seg(
          v3(cx + r * Math.cos(a), cy, cz + r * Math.sin(a)),
          v3(cx - r * Math.cos(a), cy, cz - r * Math.sin(a)),
          0.4
        );
      } else if (plane === "yz") {
        this.seg(
          v3(cx, cy + r * Math.sin(a), cz + r * Math.cos(a)),
          v3(cx, cy - r * Math.sin(a), cz - r * Math.cos(a)),
          0.4
        );
      } else {
        this.seg(
          v3(cx + r * Math.cos(a), cy + r * Math.sin(a), cz),
          v3(cx - r * Math.cos(a), cy - r * Math.sin(a), cz),
          0.4
        );
      }
    }
  }

  pipe(a, b) {
    this.seg(a, b);
  }
}

function spinDur(rng, lo, hi) {
  return rng.uniform(lo, hi);
}

export function drawMachine(w, rng) {
  let baseTop = 0;
  const nLayers = rng.randint(3, 6);
  const baseW = rng.uniform(5.5, 7.5);
  const baseD = rng.uniform(3.5, 5.0);
  for (let i = 0; i < nLayers; i++) {
    const shrink = i * rng.uniform(0.12, 0.22);
    let yOff = 0;
    for (let j = 0; j < i; j++) yOff += rng.uniform(0.12, 0.26);
    w.box(-baseW / 2 + shrink, yOff, -baseD / 2 + shrink, baseW - shrink * 2, rng.uniform(0.12, 0.26), baseD - shrink * 2);
  }
  for (let i = 0; i < nLayers; i++) baseTop += rng.uniform(0.12, 0.26);

  const outerR = rng.uniform(2.2, 3.4);
  const outerTeeth = rng.randint(36, 60);
  const outerTh = rng.uniform(0.18, 0.32);
  const outerY = rng.uniform(1.4, 2.2);
  const outerOx = rng.uniform(-0.5, 0.5);
  const outerOz = rng.uniform(-0.5, 0.5);

  w.pushSpin(outerOx, outerY, outerOz, "y", spinDur(rng, 18, 26), rng.chance(0.5));
  w.setColor(PALETTE.lightBlue);
  w.gearRingXZ(0, 0, 0, outerR, outerTeeth, outerTh);
  w.spokes(0, outerTh / 2, 0, outerR * 0.88, rng.randint(5, 10), "xz");
  w.resetColor();
  w.popSpin();

  const nRings = rng.randint(8, 14);
  for (let i = 0; i < nRings; i++) {
    const r = rng.uniform(0.4, outerR - 0.3);
    const teeth = rng.randint(8, 44);
    const y = rng.uniform(baseTop, outerY + 1.5);
    const th = rng.uniform(0.08, 0.24);
    const ox = rng.uniform(-0.6, 0.6);
    const oz = rng.uniform(-0.6, 0.6);
    const plane = rng.choice(["xz", "xz", "xy", "xy", "yz", "yz"]);
    const axis = plane === "xz" ? "y" : plane === "xy" ? "z" : "x";
    w.pushSpin(ox, y, oz, axis, spinDur(rng, 8, 18), rng.chance(0.5));
    if (i % 5 === 0) w.setColor(PALETTE.maroon);
    if (plane === "xz") w.gearRingXZ(0, 0, 0, r, teeth, th);
    else if (plane === "xy") w.gearRingXY(0, 0, 0, r, teeth, th);
    else w.gearRingYZ(0, 0, 0, r, teeth, th);
    w.resetColor();
    w.popSpin();
  }

  const nBoxes = rng.randint(10, 20);
  for (let i = 0; i < nBoxes; i++) {
    w.box(
      rng.uniform(-2.8, 1.5),
      rng.uniform(baseTop, 3.0),
      rng.uniform(-1.5, 1.5),
      rng.uniform(0.4, 2.5),
      rng.uniform(0.3, 2.0),
      rng.uniform(0.3, 2.0)
    );
  }

  const nTowers = rng.randint(12, 20);
  const towers = [];
  for (let i = 0; i < nTowers; i++) {
    towers.push([rng.uniform(-2.4, 2.2), baseTop, rng.uniform(-1.2, 1.2)]);
  }
  for (let ti = 0; ti < towers.length; ti++) {
    const [tx, ty, tz] = towers[ti];
    const th = rng.uniform(2.0, 4.5);
    w.setColor(PALETTE.navy);
    w.cyl(tx, ty, tz, 0.1, th, 48, 0);
    w.resetColor();
    const nG = rng.randint(2, 6);
    for (let j = 0; j < nG; j++) {
      const gy = ty + (th * (j + 1)) / (nG + 1) + rng.uniform(-0.12, 0.12);
      const gr = rng.uniform(0.28, 1.3);
      const gt = rng.randint(6, 24);
      const gth = rng.uniform(0.07, 0.22);
      w.pushSpin(tx, gy, tz, "y", spinDur(rng, 5, 11), rng.chance(0.5));
      if (ti === 0 && j === 0) w.setColor(PALETTE.gold);
      w.gearXZ(0, 0, 0, gr, gt, gth);
      w.resetColor();
      w.popSpin();
    }
  }

  const discStep = rng.uniform(0.16, 0.28);
  const discShrink = rng.uniform(0.12, 0.22);
  const nDiscs = rng.randint(10, 20);
  for (let i = 0; i < nDiscs; i++) {
    const yy = baseTop + i * discStep;
    const r = outerR * 0.92 - i * discShrink;
    if (r > 0.15) {
      const dx = rng.uniform(-0.3, 0.3);
      const dz = rng.uniform(-0.3, 0.3);
      w.pushSpin(dx, yy, dz, "y", spinDur(rng, 10, 20), rng.chance(0.5));
      w.disk(0, 0, 0, r, "xz", 48);
      w.popSpin();
    }
  }

  const cylConfigs = [];
  for (let i = 0; i < rng.randint(6, 10); i++) {
    cylConfigs.push([rng.uniform(0.1, 2.8), rng.uniform(0.3, 4.2), rng.randint(2, 14)]);
  }
  cylConfigs.sort((a, b) => b[0] - a[0]);
  for (let ci = 0; ci < cylConfigs.length; ci++) {
    const [r, h, ribs] = cylConfigs[ci];
    if (ci === 0) w.setColor(PALETTE.skyBlue);
    w.cyl(rng.uniform(-0.4, 0.4), baseTop, rng.uniform(-0.4, 0.4), r, h, 48, ribs);
    w.resetColor();
  }
  for (let i = 0; i < rng.randint(4, 8); i++) {
    w.cyl(
      rng.uniform(-2.2, 2.2),
      baseTop,
      rng.uniform(-1.5, 1.5),
      rng.uniform(0.3, 1.0),
      rng.uniform(0.8, 2.8),
      48,
      rng.randint(2, 6)
    );
  }
  for (let i = 0; i < rng.randint(4, 8); i++) {
    w.cylX(
      rng.uniform(-0.5, 0.5),
      rng.uniform(baseTop + 0.3, 3.5),
      rng.uniform(-0.8, 0.8),
      rng.uniform(0.18, 0.5),
      rng.uniform(2.5, 5.5),
      32
    );
  }
  for (let i = 0; i < rng.randint(2, 5); i++) {
    w.cylZ(
      rng.uniform(-0.5, 0.5),
      rng.uniform(baseTop + 0.3, 3.5),
      rng.uniform(-0.4, 0.4),
      rng.uniform(0.2, 0.45),
      rng.uniform(2.5, 4.5),
      32
    );
  }

  const nFace = rng.randint(8, 16);
  for (let i = 0; i < nFace; i++) {
    const plane = rng.choice(["yz", "yz", "xy", "xy", "yz"]);
    const cx = plane === "yz" ? rng.choice([-2.2, -2.2, 2.2]) : rng.uniform(-1.5, 1.5);
    const cy = rng.uniform(baseTop + 0.2, 3.0);
    const cz = plane === "yz" ? rng.uniform(-1.2, 1.2) : rng.choice([-1.2, -1.2, 1.2]);
    const r = rng.uniform(0.3, 1.05);
    const axis = plane === "xy" ? "z" : "x";
    w.pushSpin(cx, cy, cz, axis, spinDur(rng, 6, 12), rng.chance(0.5));
    w.disk(0, 0, 0, r, plane, 48);
    w.disk(0, 0, 0, r * 0.55, plane, 48);
    w.spokes(0, 0, 0, r * 0.48, rng.randint(4, 8), plane);
    w.popSpin();
  }

  const nPipes = rng.randint(14, 24);
  const anchors = [];
  for (let i = 0; i < nPipes * 2; i++) {
    anchors.push(v3(rng.uniform(-2.5, 2.5), rng.uniform(baseTop + 0.5, 4.0), rng.uniform(-1.5, 1.5)));
  }
  for (let i = 0; i < nPipes; i++) w.pipe(anchors[i * 2], anchors[i * 2 + 1]);

  for (let i = 0; i < rng.randint(16, 28); i++) {
    w.box(
      rng.uniform(-2.6, 2.6),
      rng.uniform(baseTop, 3.8),
      rng.uniform(-1.6, 1.6),
      rng.uniform(0.12, 0.6),
      rng.uniform(0.08, 0.42),
      rng.uniform(0.12, 0.48)
    );
  }
}

export function buildGhostMachine(root, seed = SEED) {
  const machine = new THREE.Group();
  machine.name = "ghost_dense_77823";
  root.add(machine);
  const builder = new WireBuilder(machine);
  drawMachine(builder, makeRng(seed));
  return { machine, builder };
}

export async function buildWhiteRoom(
  root,
  width = ROOM.width,
  depth = ROOM.depth,
  height = ROOM.height,
  opts
) {
  return buildWalkthroughRoomComplex(root, width, depth, height, opts);
}

/** Source text rasterized on Room A + hall A–B walls (matches walkthrough HTML). */
export function getWallpaperSource(seed = SEED) {
  return [
    "// ghost_dense_77823 — generative machine (JavaScript only)",
    "// seed " + seed,
    "",
    makeRng.toString(),
    "",
    cpts.toString(),
    "",
    WireBuilder.toString(),
    "",
    spinDur.toString(),
    "",
    drawMachine.toString(),
  ].join("\n");
}

function pickCodeColor(tok) {
  if (/^\/\//.test(tok)) return "#707070";
  if (/^(function|class|const|let|for|if|return|new|this|pushSpin|popSpin|drawMachine|WireBuilder)$/.test(tok)) {
    return "#74b4dc";
  }
  if (/^0x[0-9a-fA-F]+$/.test(tok) || /^[0-9.]+$/.test(tok) || tok === "SEED") return "#eca018";
  if (/^["'`]/.test(tok)) return "#eca018";
  return "#aaaaaa";
}

function drawCodeTokens(ctx, raw, x, y, fontPx) {
  const tokens = raw.match(/\s+|[^\s]+/g) || [];
  let cx = x;
  tokens.forEach((tok) => {
    if (/^\s+$/.test(tok)) {
      cx += fontPx * 0.22 * tok.length;
      return;
    }
    ctx.fillStyle = pickCodeColor(tok);
    ctx.fillText(tok, cx, y);
    cx += ctx.measureText(tok).width + fontPx * 0.06;
  });
}

async function createCodeWallCanvas(width, height) {
  const W = 2048;
  const H = 2048;
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    return canvas;
  }
  const { createCanvas } = await import("@napi-rs/canvas");
  return createCanvas(W, H);
}

/** CPU-rasterize readable source code for black-room wallpaper planes. */
export async function rasterizeReadableCodeWallpaper(roomHeight = ROOM.height, seed = SEED) {
  const source = getWallpaperSource(seed);
  const lines = source.split("\n");
  const W = 2048;
  const H = 2048;
  const footPx = Math.round((0.3048 / roomHeight) * H);
  const lineH = Math.round(footPx * 1.05);
  const pad = Math.round(footPx * 0.35);
  const maxW = W - pad * 2;
  const canvas = await createCodeWallCanvas(W, H);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);
  ctx.font = footPx + 'px "IBM Plex Mono", Menlo, Consolas, monospace';
  ctx.textBaseline = "alphabetic";

  let y = pad + footPx;
  lines.forEach((raw) => {
    let rest = raw;
    while (rest.length > 0 && y < H - pad) {
      let n = rest.length;
      while (n > 1 && ctx.measureText(rest.slice(0, n)).width > maxW) n--;
      drawCodeTokens(ctx, rest.slice(0, n), pad, y, footPx);
      rest = rest.slice(n);
      y += lineH;
    }
  });

  if (typeof document === "undefined") {
    const imgData = ctx.getImageData(0, 0, W, H);
    const tex = new THREE.DataTexture(imgData.data, W, H, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeCodeWallMaterial(texture) {
  return new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.FrontSide,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
}

function addCodeWallPlane(parent, mat, w, height, x, y, z, rotY, n) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, height), mat);
  mesh.name = n;
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  mesh.renderOrder = 2;
  parent.add(mesh);
}

function applyRoomAWallpaper(room, cx, cz, hw, hd, height, halfDoor, segD, wallT, codeMat, width, depth) {
  const yMid = height * 0.5;
  const face = wallT / 2 + 0.002;
  addCodeWallPlane(room, codeMat, width, height, cx, yMid, cz - hd + face, 0, "room_a_wp_n");
  addCodeWallPlane(room, codeMat, width, height, cx, yMid, cz + hd - face, Math.PI, "room_a_wp_s");
  addCodeWallPlane(room, codeMat, depth, height, cx - hw + face, yMid, cz, Math.PI / 2, "room_a_wp_w");
  addCodeWallPlane(room, codeMat, segD, height, cx + hw - face, yMid, cz - halfDoor - segD / 2, -Math.PI / 2, "room_a_wp_e_s");
  addCodeWallPlane(room, codeMat, segD, height, cx + hw - face, yMid, cz + halfDoor + segD / 2, -Math.PI / 2, "room_a_wp_e_n");
}

/** One 28×28 room at (cx, 0, cz) with optional 4 m doorways on east/west walls. */
function buildRoomAt(group, cx, cz, name, { doorWest = false, doorEast = false }, codeMat, dims) {
  const { width, depth, height } = dims;
  const isCodeRoom = name === "room_a";
  const surfMat = new THREE.MeshBasicMaterial({ color: isCodeRoom ? 0x000000 : 0xffffff });
  const edgeMat = new THREE.LineBasicMaterial({ color: isCodeRoom ? 0xffffff : 0xc8c8c8 });
  const hw = width / 2;
  const hd = depth / 2;
  const wallT = 0.15;
  const yFloor = 0.04;
  const yCeil = height - 0.03;
  const inset = 0.01;
  const ix0 = cx - hw + wallT / 2 + inset;
  const ix1 = cx + hw - wallT / 2 - inset;
  const iz0 = cz - hd + wallT / 2 + inset;
  const iz1 = cz + hd - wallT / 2 - inset;
  const yFloorEdge = yFloor + inset;
  const yCeilEdge = yCeil - inset;
  const halfDoor = LAYOUT.doorwayWidth / 2;
  const segD = hd - halfDoor;

  const room = new THREE.Group();
  room.name = name;
  group.add(room);

  const addBox = (n, sx, sy, sz, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), surfMat);
    mesh.name = n;
    mesh.position.set(x, y, z);
    room.add(mesh);
  };

  addBox(`${name}_floor`, width, 0.08, depth, cx, 0, cz);
  addBox(`${name}_ceiling`, width, 0.06, depth, cx, height, cz);
  addBox(`${name}_wall_n`, width, height, wallT, cx, height / 2, cz - hd);
  addBox(`${name}_wall_s`, width, height, wallT, cx, height / 2, cz + hd);

  const addEW = (side, hasDoor) => {
    const x = cx + (side === "east" ? hw : -hw);
    const prefix = `${name}_wall_${side}`;
    if (!hasDoor) {
      addBox(prefix, wallT, height, depth, x, height / 2, cz);
      return;
    }
    addBox(`${prefix}_s`, wallT, height, segD, x, height / 2, cz - halfDoor - segD / 2);
    addBox(`${prefix}_n`, wallT, height, segD, x, height / 2, cz + halfDoor + segD / 2);
  };
  addEW("west", doorWest);
  addEW("east", doorEast);

  const cg = isCodeRoom ? 0.04 : 0;
  const edge = (n, ax, ay, az, bx, by, bz) => {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(ax, ay, az),
        new THREE.Vector3(bx, by, bz),
      ]),
      edgeMat
    );
    line.name = n;
    line.renderOrder = 1;
    room.add(line);
  };
  edge("floor_n", ix0 + cg, yFloorEdge, iz0, ix1 - cg, yFloorEdge, iz0);
  edge("floor_e", ix1, yFloorEdge, iz0 + cg, ix1, yFloorEdge, iz1 - cg);
  edge("floor_s", ix1 - cg, yFloorEdge, iz1, ix0 + cg, yFloorEdge, iz1);
  edge("floor_w", ix0, yFloorEdge, iz1 - cg, ix0, yFloorEdge, iz0 + cg);
  edge("ceil_n", ix0 + cg, yCeilEdge, iz0, ix1 - cg, yCeilEdge, iz0);
  edge("ceil_e", ix1, yCeilEdge, iz0 + cg, ix1, yCeilEdge, iz1 - cg);
  edge("ceil_s", ix1 - cg, yCeilEdge, iz1, ix0 + cg, yCeilEdge, iz1);
  edge("ceil_w", ix0, yCeilEdge, iz1 - cg, ix0, yCeilEdge, iz0 + cg);
  edge("corner_nw", ix0, yFloorEdge + cg, iz0, ix0, yCeilEdge - cg, iz0);
  edge("corner_ne", ix1, yFloorEdge + cg, iz0, ix1, yCeilEdge - cg, iz0);
  edge("corner_se", ix1, yFloorEdge + cg, iz1, ix1, yCeilEdge - cg, iz1);
  edge("corner_sw", ix0, yFloorEdge + cg, iz1, ix0, yCeilEdge - cg, iz1);

  if (name === "room_a" && codeMat) {
    applyRoomAWallpaper(room, cx, cz, hw, hd, height, halfDoor, segD, wallT, codeMat, width, depth);
  }

  return room;
}

const WALLPAPER_TEX_SIZE = 512;

/** CPU-rasterize ghost 77823 front view → one shared texture (fast at runtime). */
export function rasterizeMachineWallpaper(seed = SEED, size = WALLPAPER_TEX_SIZE) {
  const machine = new THREE.Group();
  const builder = new WireBuilder(machine);
  drawMachine(builder, makeRng(seed));
  machine.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(machine);
  const minX = box.min.x - 0.2;
  const maxX = box.max.x + 0.2;
  const minY = box.min.y - 0.15;
  const maxY = box.max.y + 0.35;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }

  const toPx = (x, y) => [
    ((x - minX) / (maxX - minX)) * (size - 1),
    (1 - (y - minY) / (maxY - minY)) * (size - 1),
  ];

  const blendPx = (x, y, r, g, b, a) => {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || xi >= size || yi < 0 || yi >= size) return;
    const i = (yi * size + xi) * 4;
    const ia = Math.max(0, Math.min(1, a));
    data[i] = Math.round(data[i] * (1 - ia) + r * ia);
    data[i + 1] = Math.round(data[i + 1] * (1 - ia) + g * ia);
    data[i + 2] = Math.round(data[i + 2] * (1 - ia) + b * ia);
  };

  const drawSeg = (x0, y0, x1, y1, r, g, b, a) => {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    let x = x0;
    let y = y0;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    const maxSteps = dx + dy + 2;
    for (let step = 0; step < maxSteps; step++) {
      blendPx(x, y, r, g, b, a);
      if (x === x1 && y === y1) break;
      const e2 = err * 2;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  };

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  machine.traverse((obj) => {
    if (!obj.isLine || !obj.geometry?.attributes?.position) return;
    const pos = obj.geometry.attributes.position;
    const col = obj.material.color;
    const r = Math.round(col.r * 255);
    const g = Math.round(col.g * 255);
    const b = Math.round(col.b * 255);
    const a = obj.material.opacity != null ? obj.material.opacity : 1;
    for (let i = 0; i + 1 < pos.count; i += 2) {
      vA.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
      vB.fromBufferAttribute(pos, i + 1).applyMatrix4(obj.matrixWorld);
      const [px0, py0] = toPx(vA.x, vA.y);
      const [px1, py1] = toPx(vB.x, vB.y);
      drawSeg(px0, py0, px1, py1, r, g, b, a);
    }
  });

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.needsUpdate = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Hallway segment between x0 and x1 (inner wall faces), 4 m wide centered on z=0. */
function buildHallwayAt(group, x0, x1, name, isCodeStyle, codeMat, height) {
  const surfMat = new THREE.MeshBasicMaterial({ color: isCodeStyle ? 0x000000 : 0xffffff });
  const edgeMat = new THREE.LineBasicMaterial({ color: isCodeStyle ? 0xffffff : 0xc8c8c8 });
  const wallT = 0.15;
  const len = x1 - x0;
  const cx = (x0 + x1) / 2;
  const hw = LAYOUT.hallwayWidth / 2;
  const yFloor = 0.04;
  const yCeil = height - 0.03;
  const inset = 0.01;
  const ix0 = x0 + inset;
  const ix1 = x1 - inset;
  const iz0 = -hw + wallT / 2 + inset;
  const iz1 = hw - wallT / 2 - inset;
  const yFloorEdge = yFloor + inset;
  const yCeilEdge = yCeil - inset;
  const cg = isCodeStyle ? 0.04 : 0;

  const hall = new THREE.Group();
  hall.name = name;
  group.add(hall);

  const addBox = (n, sx, sy, sz, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), surfMat);
    mesh.name = n;
    mesh.position.set(x, y, z);
    hall.add(mesh);
  };

  addBox(`${name}_floor`, len, 0.08, LAYOUT.hallwayWidth, cx, 0, 0);
  addBox(`${name}_ceiling`, len, 0.06, LAYOUT.hallwayWidth, cx, height, 0);
  addBox(`${name}_wall_n`, len, height, wallT, cx, height / 2, -hw);
  addBox(`${name}_wall_s`, len, height, wallT, cx, height / 2, hw);

  const edge = (n, ax, ay, az, bx, by, bz) => {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(ax, ay, az),
        new THREE.Vector3(bx, by, bz),
      ]),
      edgeMat
    );
    line.name = n;
    line.renderOrder = 1;
    hall.add(line);
  };
  edge("floor_n", ix0 + cg, yFloorEdge, iz0, ix1 - cg, yFloorEdge, iz0);
  edge("floor_e", ix1, yFloorEdge, iz0 + cg, ix1, yFloorEdge, iz1 - cg);
  edge("floor_s", ix1 - cg, yFloorEdge, iz1, ix0 + cg, yFloorEdge, iz1);
  edge("floor_w", ix0, yFloorEdge, iz1 - cg, ix0, yFloorEdge, iz0 + cg);
  edge("ceil_n", ix0 + cg, yCeilEdge, iz0, ix1 - cg, yCeilEdge, iz0);
  edge("ceil_e", ix1, yCeilEdge, iz0 + cg, ix1, yCeilEdge, iz1 - cg);
  edge("ceil_s", ix1 - cg, yCeilEdge, iz1, ix0 + cg, yCeilEdge, iz1);
  edge("ceil_w", ix0, yCeilEdge, iz1 - cg, ix0, yCeilEdge, iz0 + cg);
  edge("corner_nw", ix0, yFloorEdge + cg, iz0, ix0, yCeilEdge - cg, iz0);
  edge("corner_ne", ix1, yFloorEdge + cg, iz0, ix1, yCeilEdge - cg, iz0);
  edge("corner_se", ix1, yFloorEdge + cg, iz1, ix1, yCeilEdge - cg, iz1);
  edge("corner_sw", ix0, yFloorEdge + cg, iz1, ix0, yCeilEdge - cg, iz1);

  if (isCodeStyle && codeMat) {
    const yMid = height * 0.5;
    const face = wallT / 2 + 0.002;
    addCodeWallPlane(hall, codeMat, len, height, cx, yMid, -hw + face, 0, `${name}_wp_n`);
    addCodeWallPlane(hall, codeMat, len, height, cx, yMid, hw - face, Math.PI, `${name}_wp_s`);
  }
}

/** A — hall — B (machine) — hall — C; matches walkthrough HTML. */
export async function buildWalkthroughRoomComplex(
  root,
  width = ROOM.width,
  depth = ROOM.depth,
  height = ROOM.height,
  { wallpaper = true } = {}
) {
  const complex = new THREE.Group();
  complex.name = "white_room_complex";
  root.add(complex);

  const codeMat = wallpaper
    ? makeCodeWallMaterial(await rasterizeReadableCodeWallpaper(height))
    : null;
  const dims = { width, depth, height };

  buildRoomAt(complex, ROOM_A_X, 0, "room_a", { doorEast: true }, codeMat, dims);
  buildRoomAt(complex, 0, 0, "room_b", { doorWest: true, doorEast: true }, null, dims);
  buildRoomAt(complex, ROOM_C_X, 0, "room_c", { doorWest: true }, null, dims);
  buildHallwayAt(complex, HALL_AB.x0, HALL_AB.x1, "hall_a_b", true, codeMat, height);
  buildHallwayAt(complex, HALL_BC.x0, HALL_BC.x1, "hall_b_c", false, null, height);

  return complex;
}

/** @deprecated Use buildWalkthroughRoomComplex */
export async function buildWhiteRoomComplex(...args) {
  return buildWalkthroughRoomComplex(...args);
}

/** Bake spinner motion for GLB export (Loop / OnLand). */
export function buildMachineRunClip(builder, name = "machine_run") {
  const axisVec = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1),
  };
  const tracks = [];
  let maxPeriod = 0;

  for (const { pivot, axis, speed } of builder.spinners) {
    const period = TAU / Math.abs(speed);
    maxPeriod = Math.max(maxPeriod, period);
    const end = Math.sign(speed) * TAU;
    const q0 = new THREE.Quaternion().setFromAxisAngle(axisVec[axis], 0);
    const q1 = new THREE.Quaternion().setFromAxisAngle(axisVec[axis], end);
    tracks.push(
      new THREE.QuaternionKeyframeTrack(
        `${pivot.name}.quaternion`,
        [0, period],
        [...q0.toArray(), ...q1.toArray()]
      )
    );
  }

  return new THREE.AnimationClip(name, maxPeriod, tracks);
}
