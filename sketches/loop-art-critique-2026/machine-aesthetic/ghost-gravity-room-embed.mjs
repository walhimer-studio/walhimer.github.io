/**
 * Room B — extract from sketches/loop-snippets/ghost_dense_77823_gravity_sliders.html
 */
export function createGhostGravityRoomEmbed(opts) {
  const THREE = opts.THREE;
  const parent = opts.parent;
  if (!THREE || !parent) throw new Error("THREE and parent required");

  const seedFixed = (opts.seed != null ? opts.seed : 77823) >>> 0;
  const getControls = opts.getControls || (() => ({}));
  let visible = true;

  const INITIAL_SEED = seedFixed;
    const DEFAULT_HORIZONTAL_GEAR_COUNT = 40;
    const DEFAULT_VERTICAL_GEAR_COUNT = 40;
    const MIN_HORIZONTAL_GEARS = 40;
    const MIN_VERTICAL_GEARS = 40;
    const PIVOT_Y = 0.55;
    const PIVOT_X = 0.55;
    const PIVOT_Z = 0.55;
    const GRAVITY_PULL = 2.8;
    const GRAVITY_RAMP = 0.022;
    const GRAVITY_MAX = 1.0;
    const GRAVITY_CYCLE = Math.PI / GRAVITY_RAMP;
    const STRETCH_MAX = 1.55;
    const SMEAR_MAX = 0.014;
    const TEAR_PULL = 1.15;

    const PALETTE = {
      ink: 0x2c3034,
      lightBlue: 0x74b4dc,
      skyBlue: 0x80b8e8,
      navy: 0x5a788c,
      gold: 0xeca018,
      maroon: 0x662020,
    };

    function makeRng(seed) {
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
        chance(p) { return this.random() < p; }
      };
    }

    const TAU = Math.PI * 2;
    const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

    function cpts(cx, cy, cz, r, plane, n) {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = TAU * i / n;
        if (plane === 'xz') pts.push(v3(cx + r * Math.cos(a), cy, cz + r * Math.sin(a)));
        else if (plane === 'xy') pts.push(v3(cx + r * Math.cos(a), cy + r * Math.sin(a), cz));
        else pts.push(v3(cx, cy + r * Math.sin(a), cz + r * Math.cos(a)));
      }
      return pts;
    }

    class WireBuilder {
      constructor(root) {
        this.root = root;
        this.staticRoot = new THREE.Group();
        this.baseRoot = new THREE.Group();
        this.machineRoot = new THREE.Group();
        this.towerPosts = new THREE.Group();
        this.horizontalDiscs = new THREE.Group();
        this.verticalFace = new THREE.Group();
        this.root.add(this.staticRoot);
        this.staticRoot.add(this.baseRoot);
        this.staticRoot.add(this.machineRoot);
        this.machineRoot.add(this.towerPosts);
        this.machineRoot.add(this.horizontalDiscs);
        this.machineRoot.add(this.verticalFace);
        this.spinners = [];
        this.horizontalGears = [];
        this.verticalGears = [];
        this.stack = [this.staticRoot];
        this.current = this.staticRoot;
        this.lineColor = PALETTE.ink;
      }

      pushTarget(group) {
        this.stack.push(group);
        this.current = group;
      }

      popTarget() {
        if (this.stack.length <= 1) return;
        this.stack.pop();
        this.current = this.stack[this.stack.length - 1];
      }

      setColor(color) {
        this.lineColor = color == null ? PALETTE.ink : color;
      }

      resetColor() {
        this.lineColor = PALETTE.ink;
      }

      pushSpin(px, py, pz, axis, durationSec, reverse, gearKind, mount) {
        const pivot = new THREE.Group();
        pivot.position.set(px, py, pz);
        const content = new THREE.Group();
        pivot.add(content);
        (mount || this.machineRoot).add(pivot);
        const speed = (reverse ? -1 : 1) * (TAU / durationSec);
        const height = Math.max(0, py - PIVOT_Y);
        const distX = Math.max(0, Math.abs(px) - PIVOT_X * 0.5);
        const distZ = Math.max(0, Math.abs(pz) - PIVOT_Z * 0.5);
        const spinner = {
          pivot, content, axis, speed, gearKind: gearKind || null,
          homeX: px, homeY: py, homeZ: pz,
          lift: 0.35 + height * 0.22,
          spreadX: (px >= 0 ? 1 : -1) * (0.35 + distX * 0.22),
          spreadZ: (pz >= 0 ? 1 : -1) * (0.35 + distZ * 0.22)
        };
        this.spinners.push(spinner);
        if (gearKind === 'horizontal') this.horizontalGears.push(spinner);
        else if (gearKind === 'vertical') this.verticalGears.push(spinner);
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
          opacity: op
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
          v3(x, y, z), v3(x + bw, y, z), v3(x + bw, y, z + bd), v3(x, y, z + bd),
          v3(x, y + bh, z), v3(x + bw, y + bh, z), v3(x + bw, y + bh, z + bd), v3(x, y + bh, z + bd)
        ];
        const solid = [[0,1],[0,3],[0,4],[1,5],[3,7],[4,5],[4,7],[5,6],[6,7]];
        const hidden = [[1,2],[2,3],[2,6]];
        for (const [a, b] of solid) this.seg(c[a], c[b]);
        for (const [a, b] of hidden) this.seg(c[a], c[b], 0.45);
      }

      cyl(cx, cy, cz, r, h, n, ribs) {
        const bot = cpts(cx, cy, cz, r, 'xz', n);
        const top = cpts(cx, cy + h, cz, r, 'xz', n);
        let li = 0, ri = 0;
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
        const lpts = [], rpts = [];
        for (let i = 0; i < n; i++) {
          const a = TAU * i / n;
          lpts.push(v3(cx - length / 2, cy + r * Math.sin(a), cz + r * Math.cos(a)));
          rpts.push(v3(cx + length / 2, cy + r * Math.sin(a), cz + r * Math.cos(a)));
        }
        let ti = 0, bi = 0;
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
        const lpts = [], rpts = [];
        for (let i = 0; i < n; i++) {
          const a = TAU * i / n;
          lpts.push(v3(cx + r * Math.cos(a), cy + r * Math.sin(a), cz - length / 2));
          rpts.push(v3(cx + r * Math.cos(a), cy + r * Math.sin(a), cz + length / 2));
        }
        let ti = 0, bi = 0;
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
          this.spoly(cpts(cx, yy, cz, rOut, 'xz', n), true);
          this.spoly(cpts(cx, yy, cz, rIn, 'xz', n), true, 0.65);
        }
        const botO = cpts(cx, cy, cz, rOut, 'xz', n);
        const topO = cpts(cx, cy + h, cz, rOut, 'xz', n);
        let li = 0, ri = 0;
        for (let i = 1; i < n; i++) {
          if (botO[i].x < botO[li].x) li = i;
          if (botO[i].x > botO[ri].x) ri = i;
        }
        this.seg(botO[li], topO[li]);
        this.seg(botO[ri], topO[ri]);
        const botI = cpts(cx, cy, cz, rIn, 'xz', n);
        const topI = cpts(cx, cy + h, cz, rIn, 'xz', n);
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
          this.spoly([tp(a1, r, cy + th), tp(a2, r, cy + th), tp(a2, r + thR, cy + th), tp(a1, r + thR, cy + th)], true, 0.75);
          this.seg(tp(a1, r + thR, cy), tp(a1, r + thR, cy + th), 0.55);
        }
      }

      gearRingXY(cx, cy, cz, r, teeth, th) {
        const n = 64;
        const ptsF = cpts(cx, cy, cz, r, 'xy', n);
        const ptsB = cpts(cx, cy, cz + th, r, 'xy', n);
        this.spoly(ptsF, true);
        this.spoly(ptsB, true, 0.55);
        this.spoly(cpts(cx, cy, cz, r * 0.82, 'xy', n), true, 0.52);
        this.spoly(cpts(cx, cy, cz + th, r * 0.82, 'xy', n), true, 0.38);
        const pick = (fn, ax) => {
          let idx = 0;
          for (let i = 1; i < n; i++) if (fn(ax(ptsF[i]), ax(ptsF[idx]))) idx = i;
          return idx;
        };
        for (const [fn, ax] of [[Math.min, p => p.y], [Math.max, p => p.y], [Math.min, p => p.x], [Math.max, p => p.x]]) {
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
        for (const [fn, ax] of [[Math.min, p => p.y], [Math.max, p => p.y], [Math.min, p => p.x], [Math.max, p => p.x]]) {
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
          this.spoly([tp(a1, r, cy + th), tp(a2, r, cy + th), tp(a2, r + thR, cy + th), tp(a1, r + thR, cy + th)], true, 0.75);
          this.seg(tp(a1, r + thR, cy), tp(a1, r + thR, cy + th), 0.5);
        }
        this.disk(cx, cy, cz, r, 'xz', 48);
        this.disk(cx, cy + th, cz, r * 0.88, 'xz', 48);
        this.disk(cx, cy + th, cz, r * 0.18, 'xz', 48);
      }

      spokes(cx, cy, cz, r, n, plane) {
        for (let i = 0; i < n; i++) {
          const a = Math.PI * i / n;
          if (plane === 'xz') {
            this.seg(v3(cx + r * Math.cos(a), cy, cz + r * Math.sin(a)),
                    v3(cx - r * Math.cos(a), cy, cz - r * Math.sin(a)), 0.4);
          } else if (plane === 'yz') {
            this.seg(v3(cx, cy + r * Math.sin(a), cz + r * Math.cos(a)),
                    v3(cx, cy - r * Math.sin(a), cz - r * Math.cos(a)), 0.4);
          } else {
            this.seg(v3(cx + r * Math.cos(a), cy + r * Math.sin(a), cz),
                    v3(cx - r * Math.cos(a), cy - r * Math.sin(a), cz), 0.4);
          }
        }
      }

      pipe(a, b) {
        this.seg(a, b);
      }

      dispose() {
        this.staticRoot.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        this.root.remove(this.staticRoot);
        this.spinners.length = 0;
        this.horizontalGears.length = 0;
        this.verticalGears.length = 0;
      }
    }

    function spinDur(rng, lo, hi) {
      return rng.uniform(lo, hi);
    }

    function addFillGears(w, rng, profile, gearKind, count) {
      const yTop = profile.outerY[1] + 1.8;
      for (let i = 0; i < count; i++) {
        const y = rng.uniform(profile.outerY[0], yTop);
        const ox = rng.uniform(-1.0, 1.0);
        const oz = rng.uniform(-1.0, 1.0);
        const r = rng.uniform(0.18, 0.95);
        const teeth = rng.randint(6, 28);
        const th = rng.uniform(0.05, 0.2);
        if (gearKind === 'horizontal') {
          w.pushSpin(ox, y, oz, 'y', spinDur(rng, 5, 14), rng.chance(0.5), 'horizontal');
          w.gearRingXZ(0, 0, 0, r, teeth, th);
          w.popSpin();
        } else {
          const plane = rng.choice(['xy', 'yz']);
          const axis = plane === 'xy' ? 'z' : 'x';
          w.pushSpin(ox, y, oz, axis, spinDur(rng, 5, 14), rng.chance(0.5), 'vertical');
          if (plane === 'xy') w.gearRingXY(0, 0, 0, r, teeth, th);
          else w.gearRingYZ(0, 0, 0, r, teeth, th);
          w.popSpin();
        }
      }
    }

    function trimGearList(w, list, maxCount) {
      while (list.length > maxCount) {
        const s = list.pop();
        const si = w.spinners.indexOf(s);
        if (si >= 0) w.spinners.splice(si, 1);
        if (s.pivot.parent) s.pivot.parent.remove(s.pivot);
      }
    }

    function iterationSeed(n) {
      if (n <= 0) return INITIAL_SEED;
      let s = (INITIAL_SEED + Math.imul(n, 0x9e3779b9)) >>> 0;
      s = Math.imul(s ^ (s >>> 16), 0x85ebca6b) >>> 0;
      s = Math.imul(s ^ (s >>> 13), 0xc2b2ae35) >>> 0;
      return (s ^ (s >>> 16)) >>> 0;
    }

    function machineProfile(seed) {
      const r = makeRng(seed ^ 0xa3b19535);
      const density = r.random();
      const height = r.random();
      const spread = r.random();
      const vert = r.random();
      const lerp = (a, b, t) => a + (b - a) * t;
      const ri = (lo, hi, t) => Math.max(lo, Math.round(lerp(lo, hi, t)));
      return {
        nLayers: [ri(2, 4, density), ri(5, 8, density)],
        baseW: [lerp(4.8, 6.2, spread), lerp(6.5, 8.4, spread)],
        baseD: [lerp(3.0, 4.2, spread), lerp(4.5, 6.0, spread)],
        outerR: [lerp(1.6, 2.4, 1 - density), lerp(2.6, 3.8, density)],
        outerY: [lerp(1.0, 1.6, height), lerp(1.8, 3.4, height)],
        nRings: [ri(4, 7, 1 - density), ri(10, 20, density)],
        nBoxes: [ri(5, 10, 1 - density), ri(14, 26, density)],
        nTowers: [ri(6, 11, 1 - density), ri(14, 24, density)],
        towerH: [lerp(1.6, 2.4, 1 - height), lerp(3.2, 5.8, height)],
        nDiscs: [ri(5, 10, 1 - density), ri(12, 24, density)],
        nFace: [ri(4, 8, 1 - vert), ri(10, 20, vert)],
        nPipes: [ri(8, 14, 1 - density), ri(16, 30, density)],
        nCylBig: [ri(4, 7, 1 - density), ri(8, 14, density)],
        nCylMid: [ri(2, 5, 1 - density), ri(6, 12, density)],
        nCylX: [ri(2, 5, 1 - density), ri(6, 11, density)],
        nCylZ: [ri(1, 3, 1 - density), ri(4, 8, density)],
        nSmallBoxes: [ri(8, 16, 1 - density), ri(20, 34, density)],
        vertPlaneBias: Math.round(lerp(2, 6, vert))
      };
    }

    function drawMachine(w, rng, profile) {
      let baseTop = 0;
      const nLayers = rng.randint(profile.nLayers[0], profile.nLayers[1]);
      const baseW = rng.uniform(profile.baseW[0], profile.baseW[1]);
      const baseD = rng.uniform(profile.baseD[0], profile.baseD[1]);
      w.pushTarget(w.baseRoot);
      for (let i = 0; i < nLayers; i++) {
        const shrink = i * rng.uniform(0.12, 0.22);
        let yOff = 0;
        for (let j = 0; j < i; j++) yOff += rng.uniform(0.12, 0.26);
        w.box(-baseW / 2 + shrink, yOff, -baseD / 2 + shrink,
              baseW - shrink * 2, rng.uniform(0.12, 0.26), baseD - shrink * 2);
      }
      w.popTarget();
      for (let i = 0; i < nLayers; i++) baseTop += rng.uniform(0.12, 0.26);

      w.pushTarget(w.machineRoot);

      const outerR = rng.uniform(profile.outerR[0], profile.outerR[1]);
      const outerTeeth = rng.randint(36, 60);
      const outerTh = rng.uniform(0.18, 0.32);
      const outerY = rng.uniform(profile.outerY[0], profile.outerY[1]);
      const outerOx = rng.uniform(-0.5, 0.5);
      const outerOz = rng.uniform(-0.5, 0.5);

      w.pushSpin(outerOx, outerY, outerOz, 'y', spinDur(rng, 18, 26), rng.chance(0.5), 'horizontal');
      w.setColor(PALETTE.lightBlue);
      w.gearRingXZ(0, 0, 0, outerR, outerTeeth, outerTh);
      w.spokes(0, outerTh / 2, 0, outerR * 0.88, rng.randint(5, 10), 'xz');
      w.resetColor();
      w.popSpin();

      const nRings = rng.randint(profile.nRings[0], profile.nRings[1]);
      for (let i = 0; i < nRings; i++) {
        const r = rng.uniform(0.4, outerR - 0.3);
        const teeth = rng.randint(8, 44);
        const y = rng.uniform(baseTop, outerY + 1.5);
        const th = rng.uniform(0.08, 0.24);
        const ox = rng.uniform(-0.6, 0.6);
        const oz = rng.uniform(-0.6, 0.6);
        const planeChoices = ['xz', 'xz'];
        for (let k = 0; k < profile.vertPlaneBias; k++) planeChoices.push('xy', 'yz');
        const plane = rng.choice(planeChoices);
        const axis = plane === 'xz' ? 'y' : plane === 'xy' ? 'z' : 'x';
        const gearKind = plane === 'xz' ? 'horizontal' : 'vertical';
        w.pushSpin(ox, y, oz, axis, spinDur(rng, 8, 18), rng.chance(0.5), gearKind);
        if (i % 5 === 0) w.setColor(PALETTE.maroon);
        if (plane === 'xz') w.gearRingXZ(0, 0, 0, r, teeth, th);
        else if (plane === 'xy') w.gearRingXY(0, 0, 0, r, teeth, th);
        else w.gearRingYZ(0, 0, 0, r, teeth, th);
        w.resetColor();
        w.popSpin();
      }

      const nBoxes = rng.randint(profile.nBoxes[0], profile.nBoxes[1]);
      for (let i = 0; i < nBoxes; i++) {
        w.box(rng.uniform(-2.8, 1.5), rng.uniform(baseTop, 3.0), rng.uniform(-1.5, 1.5),
              rng.uniform(0.4, 2.5), rng.uniform(0.3, 2.0), rng.uniform(0.3, 2.0));
      }

      const nTowers = rng.randint(profile.nTowers[0], profile.nTowers[1]);
      const towers = [];
      for (let i = 0; i < nTowers; i++) {
        towers.push([rng.uniform(-2.4, 2.2), baseTop, rng.uniform(-1.2, 1.2)]);
      }
      for (let ti = 0; ti < towers.length; ti++) {
        const [tx, ty, tz] = towers[ti];
        const th = rng.uniform(profile.towerH[0], profile.towerH[1]);
        w.pushTarget(w.towerPosts);
        w.setColor(PALETTE.navy);
        w.cyl(tx, ty, tz, 0.1, th, 48, 0);
        w.resetColor();
        w.popTarget();
        const nG = rng.randint(2, 6);
        for (let j = 0; j < nG; j++) {
          const gy = ty + th * (j + 1) / (nG + 1) + rng.uniform(-0.12, 0.12);
          const gr = rng.uniform(0.28, 1.3);
          const gt = rng.randint(6, 24);
          const gth = rng.uniform(0.07, 0.22);
          w.pushSpin(tx, gy, tz, 'y', spinDur(rng, 5, 11), rng.chance(0.5), 'horizontal');
          if (ti === 0 && j === 0) w.setColor(PALETTE.gold);
          w.gearXZ(0, 0, 0, gr, gt, gth);
          w.resetColor();
          w.popSpin();
        }
      }

      const discStep = rng.uniform(0.16, 0.28);
      const discShrink = rng.uniform(0.12, 0.22);
      const nDiscs = rng.randint(profile.nDiscs[0], profile.nDiscs[1]);
      for (let i = 0; i < nDiscs; i++) {
        const yy = baseTop + i * discStep;
        const r = outerR * 0.92 - i * discShrink;
        if (r > 0.15) {
          const dx = rng.uniform(-0.3, 0.3);
          const dz = rng.uniform(-0.3, 0.3);
          w.pushSpin(dx, yy, dz, 'y', spinDur(rng, 10, 20), rng.chance(0.5), null, w.horizontalDiscs);
          w.disk(0, 0, 0, r, 'xz', 48);
          w.popSpin();
        }
      }

      const cylConfigs = [];
      for (let i = 0; i < rng.randint(profile.nCylBig[0], profile.nCylBig[1]); i++) {
        cylConfigs.push([rng.uniform(0.1, 2.8), rng.uniform(0.3, 4.2), rng.randint(2, 14)]);
      }
      cylConfigs.sort((a, b) => b[0] - a[0]);
      for (let ci = 0; ci < cylConfigs.length; ci++) {
        const [r, h, ribs] = cylConfigs[ci];
        if (ci === 0) w.setColor(PALETTE.skyBlue);
        w.cyl(rng.uniform(-0.4, 0.4), baseTop, rng.uniform(-0.4, 0.4), r, h, 48, ribs);
        w.resetColor();
      }
      for (let i = 0; i < rng.randint(profile.nCylMid[0], profile.nCylMid[1]); i++) {
        w.cyl(rng.uniform(-2.2, 2.2), baseTop, rng.uniform(-1.5, 1.5),
              rng.uniform(0.3, 1.0), rng.uniform(0.8, 2.8), 48, rng.randint(2, 6));
      }
      for (let i = 0; i < rng.randint(profile.nCylX[0], profile.nCylX[1]); i++) {
        w.cylX(rng.uniform(-0.5, 0.5), rng.uniform(baseTop + 0.3, 3.5), rng.uniform(-0.8, 0.8),
               rng.uniform(0.18, 0.5), rng.uniform(2.5, 5.5), 32);
      }
      for (let i = 0; i < rng.randint(profile.nCylZ[0], profile.nCylZ[1]); i++) {
        w.cylZ(rng.uniform(-0.5, 0.5), rng.uniform(baseTop + 0.3, 3.5), rng.uniform(-0.4, 0.4),
               rng.uniform(0.2, 0.45), rng.uniform(2.5, 4.5), 32);
      }

      const nFace = rng.randint(profile.nFace[0], profile.nFace[1]);
      for (let i = 0; i < nFace; i++) {
        const plane = rng.choice(['yz', 'yz', 'xy', 'xy', 'yz']);
        const cx = plane === 'yz' ? rng.choice([-2.2, -2.2, 2.2]) : rng.uniform(-1.5, 1.5);
        const cy = rng.uniform(baseTop + 0.2, 3.0);
        const cz = plane === 'yz' ? rng.uniform(-1.2, 1.2) : rng.choice([-1.2, -1.2, 1.2]);
        const r = rng.uniform(0.3, 1.05);
        const axis = plane === 'xy' ? 'z' : 'x';
        w.pushSpin(cx, cy, cz, axis, spinDur(rng, 6, 12), rng.chance(0.5), null, w.verticalFace);
        w.disk(0, 0, 0, r, plane, 48);
        w.disk(0, 0, 0, r * 0.55, plane, 48);
        w.spokes(0, 0, 0, r * 0.48, rng.randint(4, 8), plane);
        w.popSpin();
      }

      const nPipes = rng.randint(profile.nPipes[0], profile.nPipes[1]);
      const anchors = [];
      for (let i = 0; i < nPipes * 2; i++) {
        anchors.push(v3(rng.uniform(-2.5, 2.5), rng.uniform(baseTop + 0.5, 4.0), rng.uniform(-1.5, 1.5)));
      }
      for (let i = 0; i < nPipes; i++) w.pipe(anchors[i * 2], anchors[i * 2 + 1]);

      for (let i = 0; i < rng.randint(profile.nSmallBoxes[0], profile.nSmallBoxes[1]); i++) {
        w.box(rng.uniform(-2.6, 2.6), rng.uniform(baseTop, 3.8), rng.uniform(-1.6, 1.6),
              rng.uniform(0.12, 0.6), rng.uniform(0.08, 0.42), rng.uniform(0.12, 0.48));
      }

      addFillGears(w, rng, profile, 'horizontal',
        Math.max(0, MIN_HORIZONTAL_GEARS - w.horizontalGears.length));
      addFillGears(w, rng, profile, 'vertical',
        Math.max(0, MIN_VERTICAL_GEARS - w.verticalGears.length));
      trimGearList(w, w.horizontalGears, DEFAULT_HORIZONTAL_GEAR_COUNT);

      w.popTarget();
    }

    const GRAVITY_SMEAR_SHADER = {
      uniforms: {
        tDiffuse: { value: null },
        pullX: { value: 0.0 },
        pullY: { value: 0.0 },
        pullZ: { value: 0.0 }
      },
      vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision highp float;',
        'uniform sampler2D tDiffuse;',
        'uniform float pullX;',
        'uniform float pullY;',
        'uniform float pullZ;',
        'varying vec2 vUv;',
        'float ink(vec3 c) { return 1.0 - dot(c, vec3(0.299, 0.587, 0.114)); }',
        'void main() {',
        '  vec4 outCol = texture2D(tDiffuse, vUv);',
        '  float best = ink(outCol.rgb);',
        '  for (int i = 1; i < 56; i++) {',
        '    float fi = float(i);',
        '    if (pullY > 0.0) {',
        '      vec2 srcY = vUv - vec2(0.0, fi * pullY);',
        '      if (srcY.y >= 0.0) {',
        '        vec4 s = texture2D(tDiffuse, srcY);',
        '        float w = ink(s.rgb);',
        '        if (w > best) { outCol = s; best = w; }',
        '      }',
        '    }',
        '    if (pullX > 0.0) {',
        '      vec2 srcX = vUv - vec2(fi * pullX, 0.0);',
        '      if (srcX.x >= 0.0 && srcX.x <= 1.0) {',
        '        vec4 s = texture2D(tDiffuse, srcX);',
        '        float w = ink(s.rgb);',
        '        if (w > best) { outCol = s; best = w; }',
        '      }',
        '    }',
        '    if (pullZ > 0.0) {',
        '      vec2 srcZ = vUv - vec2(fi * pullZ * 0.62, fi * pullZ * 0.38);',
        '      if (srcZ.x >= 0.0 && srcZ.y >= 0.0) {',
        '        vec4 s = texture2D(tDiffuse, srcZ);',
        '        float w = ink(s.rgb);',
        '        if (w > best) { outCol = s; best = w; }',
        '      }',
        '    }',
        '  }',
        '  gl_FragColor = outCol;',
        '}'
      ].join('\n')
    };

  const machineStretch = new THREE.Group();
  machineStretch.name = "ghost_gravity_room_b";
  machineStretch.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
  parent.add(machineStretch);

  let builder;
  let cycleStart = 0;
  let pausedCycleTime = 0;
  let gravityWasActive = true;
  const gravityAxis = { x: true, y: true, z: true };
  let speedMult = 1;
  let elapsed = 0;

  function readControls() {
    const c = getControls();
    return {
      speed: Number(c.speed ?? 100),
      horizontal: Number(c.horizontal ?? 100),
      vertical: Number(c.vertical ?? 100),
      hCount: Number(c.hCount ?? DEFAULT_HORIZONTAL_GEAR_COUNT),
      vCount: Number(c.vCount ?? DEFAULT_VERTICAL_GEAR_COUNT),
      gravityX: c.gravityX !== false,
      gravityY: c.gravityY !== false,
      gravityZ: c.gravityZ !== false,
    };
  }

  function buildAtSeed() {
    if (builder) builder.dispose();
    builder = new WireBuilder(machineStretch);
    drawMachine(builder, makeRng(seedFixed), machineProfile(seedFixed));
    builder.baseRoot.position.set(0, 0, 0);
    builder.machineRoot.position.set(0, 0, 0);
    machineStretch.scale.set(1, 1, 1);
    machineStretch.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
    cycleStart = elapsed;
    pausedCycleTime = 0;
    syncControls();
  }

  function syncGearCounts(ctrl) {
    const hCount = ctrl.hCount;
    const vCount = ctrl.vCount;
    const showMachine = hCount > 0 || vCount > 0;
    builder.machineRoot.visible = showMachine;
    builder.towerPosts.visible = hCount > 0;
    builder.horizontalDiscs.visible = hCount > 0;
    builder.verticalFace.visible = vCount > 0;
    builder.horizontalGears.forEach((s, i) => { s.pivot.visible = showMachine && i < hCount; });
    builder.verticalGears.forEach((s, i) => { s.pivot.visible = showMachine && i < vCount; });
  }

  function syncControls() {
    const ctrl = readControls();
    speedMult = ctrl.speed / 100;
    const hScale = ctrl.horizontal / 100;
    const vScale = ctrl.vertical / 100;
    gravityAxis.x = ctrl.gravityX;
    gravityAxis.y = ctrl.gravityY;
    gravityAxis.z = ctrl.gravityZ;
    for (const s of builder.spinners) {
      if (!s.content || !s.gearKind) continue;
      const sc = s.gearKind === "horizontal" ? hScale : vScale;
      s.content.scale.set(sc, sc, sc);
    }
    syncGearCounts(ctrl);
    syncGravityPause();
  }

  function anyGravityOn() {
    return gravityAxis.x || gravityAxis.y || gravityAxis.z;
  }

  function syncGravityPause() {
    const on = anyGravityOn();
    if (on && !gravityWasActive) {
      cycleStart = elapsed - pausedCycleTime;
    } else if (!on && gravityWasActive) {
      pausedCycleTime = elapsed - cycleStart;
    }
    gravityWasActive = on;
  }

  function resetCyclePose() {
    machineStretch.scale.set(1, 1, 1);
    machineStretch.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
    builder.baseRoot.position.set(0, 0, 0);
    builder.machineRoot.position.set(0, 0, 0);
    for (const s of builder.spinners) {
      s.pivot.position.set(s.homeX, s.homeY, s.homeZ);
    }
    cycleStart = elapsed;
    pausedCycleTime = 0;
  }

  function gravityStrength() {
    if (!anyGravityOn()) return 0;
    const cycleTime = elapsed - cycleStart;
    if (cycleTime >= GRAVITY_CYCLE) {
      resetCyclePose();
      return 0;
    }
    const t = cycleTime * GRAVITY_RAMP;
    const wave = 0.5 - 0.5 * Math.cos(t);
    return wave * GRAVITY_MAX;
  }

  buildAtSeed();

  return {
    root: machineStretch,
    get builder() { return builder; },
    setGravityAxis(axis, on) {
      if (axis === "x") gravityAxis.x = !!on;
      else if (axis === "y") gravityAxis.y = !!on;
      else gravityAxis.z = !!on;
      syncGravityPause();
    },
    syncControls,
    setVisible(v) {
      visible = !!v;
      machineStretch.visible = visible;
    },
    update(dt, active = true) {
      elapsed += dt;
      syncControls();
      if (!visible || !active) return;
      const g = gravityStrength();
      const gX = gravityAxis.x ? g : 0;
      const gY = gravityAxis.y ? g : 0;
      const gZ = gravityAxis.z ? g : 0;
      const pullX = gX * gX;
      const pullY = gY * gY;
      const pullZ = gZ * gZ;
      const stretchX = gX * (STRETCH_MAX - 1);
      const stretchY = gY * (STRETCH_MAX - 1);
      const stretchZ = gZ * (STRETCH_MAX - 1);
      const tear = GRAVITY_PULL * TEAR_PULL;
      const ox = opts.x || 0;
      const oy = opts.y || 0;
      const oz = opts.z || 0;

      machineStretch.scale.set(1 + stretchX, 1 + stretchY, 1 + stretchZ);
      machineStretch.position.set(ox + stretchX * PIVOT_X, oy + stretchY * PIVOT_Y, oz + stretchZ * PIVOT_Z);

      builder.baseRoot.position.set(gravityAxis.x ? -pullX * tear : 0, 0, gravityAxis.z ? -pullZ * tear : 0);
      builder.machineRoot.position.set(gravityAxis.x ? pullX * tear : 0, 0, gravityAxis.z ? pullZ * tear : 0);

      for (const s of builder.spinners) {
        const d = s.speed * speedMult * dt;
        if (s.axis === "x") s.pivot.rotation.x += d;
        else if (s.axis === "y") s.pivot.rotation.y += d;
        else s.pivot.rotation.z += d;
        const lift = pullY * s.lift * GRAVITY_PULL;
        const spreadX = pullX * s.spreadX * GRAVITY_PULL;
        const spreadZ = pullZ * s.spreadZ * GRAVITY_PULL;
        s.pivot.position.y = s.homeY + lift;
        s.pivot.position.x = s.homeX + spreadX;
        s.pivot.position.z = s.homeZ + spreadZ;
      }
    },
    dispose() {
      if (builder) builder.dispose();
      parent.remove(machineStretch);
    },
  };
}
