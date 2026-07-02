/**
 * Surrender Machines — embeddable Three.js core
 * Source: sketches/loop-snippets/surrender-machines-three.html
 */
(function (global) {
  "use strict";

  const TAU = Math.PI * 2;
  const CYL_SEG = 16;
  const FADE_DURATION = 14;

  function makeRng(seed) {
    let s = seed >>> 0;
    return {
      seed: s,
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
    };
  }

  function richness(val) { return Math.min(val / 0.65, 1); }
  function stressOf(val) { return Math.max(0, (val - 0.65) / 0.35); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function map(v, a, b, c, d) { return c + (d - c) * ((v - a) / (b - a)); }

  function hsbColor(THREE, h, s, b) {
    const c = new THREE.Color();
    h = ((h % 360) + 360) % 360;
    s = clamp(s / 100, 0, 1);
    b = clamp(b / 100, 0, 1);
    if (s === 0) { c.setRGB(b, b, b); return c; }
    const sector = h / 60;
    const i = Math.floor(sector) % 6;
    const f = sector - Math.floor(sector);
    const p = b * (1 - s);
    const q = b * (1 - s * f);
    const t = b * (1 - s * (1 - f));
    switch (i) {
      case 0: c.setRGB(b, t, p); break;
      case 1: c.setRGB(q, b, p); break;
      case 2: c.setRGB(p, b, t); break;
      case 3: c.setRGB(p, q, b); break;
      case 4: c.setRGB(t, p, b); break;
      default: c.setRGB(b, p, q); break;
    }
    return c;
  }

  function pseudoNoise(x, y, z) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
    return n - Math.floor(n);
  }

  /**
   * @param {object} opts
   * @param {THREE.Group} opts.parent
   * @param {number} [opts.x] [opts.y] [opts.z]
   * @param {number} [opts.scale]
   * @param {number} [opts.seed]
   * @param {{anger:number,ego:number,attachment:number}} [opts.sliders]
   */
  function createSurrenderMachineEmbed(opts) {
    const THREE = global.THREE;
    if (!THREE) throw new Error("THREE required");

    const parent = opts.parent;
    const scale = opts.scale != null ? opts.scale : 0.01;
    const flat = opts.flat !== false;
    const seed0 = opts.seed != null ? (opts.seed >>> 0) : Math.floor(Math.random() * 999999);
    const sliders0 = opts.sliders || { anger: 50, ego: 50, attachment: 50 };

    const state = {
      seed: seed0,
      angerVal: 0.5, egoVal: 0.5, attachmentVal: 0.5,
      angerStress: 0, egoStress: 0, attachmentStress: 0,
      shadowAmount: 0, surrenderStart: null, surrendered: false,
      gPlatformExtras: 0, gColumnCount: 4, gGearCount: 60,
      gPulleyCount: 10, gRodCount: 5, machineBuilt: false,
      prevPlatformExtras: -1, prevColumnCount: -1, prevGearCount: -1,
      prevPulleyCount: -1, prevRodCount: -1,
    };

    const spinners = [];
    const animatedMats = [];
    let rng = makeRng(state.seed);
    let builtSig = "";

    const root = new THREE.Group();
    root.name = "surrender_machine_embed";
    root.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
    parent.add(root);

    const anchor = new THREE.Group();
    anchor.scale.setScalar(scale);
    root.add(anchor);

    const machinePivot = new THREE.Group();
    if (flat) {
      machinePivot.rotation.set(0, 0, 0);
      machinePivot.position.y = 0;
    } else {
      machinePivot.rotation.x = -0.4;
      machinePivot.rotation.y = 0.3;
      machinePivot.position.y = 50;
    }
    const machineRoot = new THREE.Group();
    machineRoot.scale.y = -1;
    machinePivot.add(machineRoot);
    anchor.add(machinePivot);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const dir1 = new THREE.DirectionalLight(0xffffff, 1);
    dir1.position.set(350, -400, -1000);
    const dir2 = new THREE.DirectionalLight(0xb4b4ff, 0.6);
    dir2.position.set(-300, 200, 1000);
    const lights = [ambient, dir1, dir2];

    let staticOverlayVisible = false;
    let staticCanvas = null;
    let staticCtx = null;
    let resizeStatic = () => {};

    if (opts.staticOverlay !== false) {
      staticCanvas = document.createElement("canvas");
      staticCanvas.className = "surrender-static-overlay";
      staticCanvas.style.cssText =
        "position:fixed;inset:0;pointer-events:none;z-index:15;display:none;width:100%;height:100%;";
      document.body.appendChild(staticCanvas);
      staticCtx = staticCanvas.getContext("2d");
      resizeStatic = () => {
        staticCanvas.width = window.innerWidth;
        staticCanvas.height = window.innerHeight;
      };
      resizeStatic();
      window.addEventListener("resize", resizeStatic);
    }

    function drawStatic(t) {
      if (!staticCtx) return;
      if (!staticOverlayVisible || state.shadowAmount >= 1) {
        staticCanvas.style.display = "none";
        staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
        return;
      }
      const W = staticCanvas.width;
      const H = staticCanvas.height;
      staticCanvas.style.display = "block";
      staticCtx.clearRect(0, 0, W, H);
      const staticLevel = Math.max(state.egoStress, state.attachmentStress);
      if (staticLevel <= 0) return;

      if (state.egoStress > 0) {
        const egoCount = Math.floor(state.egoStress * state.egoStress * 1800);
        for (let i = 0; i < egoCount; i++) {
          const sx = rng.uniform(0, W);
          const sy = rng.uniform(0, H);
          const sw = rng.uniform(1, lerp(1, 5, state.egoStress));
          const sh = rng.uniform(1, 2);
          staticCtx.fillStyle = `hsla(${rng.random() < 0.6 ? 0 : rng.uniform(45, 60)}, ${rng.random() < 0.6 ? 0 : 80}%, ${rng.uniform(88, 100)}%, ${rng.uniform(0.4, 0.8) * state.egoStress})`;
          staticCtx.fillRect(sx - sw / 2, sy - sh / 2, sw, sh);
        }
      }

      if (state.attachmentStress > 0) {
        const attCount = Math.floor(state.attachmentStress * state.attachmentStress * 2400);
        const driftX = (Math.sin(t * 0.08) * 0.5 + 0.5) * 80 - 40;
        const driftY = (Math.sin(t * 0.08 + 100) * 0.5 + 0.5) * 80 - 40;
        for (let i = 0; i < attCount; i++) {
          const sx = rng.uniform(0, W) + driftX;
          const sy = rng.uniform(0, H) + driftY;
          staticCtx.fillStyle = `hsla(${rng.uniform(20, 40)}, ${rng.uniform(10, 30)}%, ${rng.uniform(40, 72)}%, ${rng.uniform(0.15, 0.45) * state.attachmentStress})`;
          staticCtx.fillRect(
            sx - rng.uniform(0, 3),
            sy - rng.uniform(0, lerp(1, 6, state.attachmentStress)),
            rng.uniform(1, 3),
            rng.uniform(1, 3)
          );
        }
      }
    }

    function machineFill(x, y, z, baseHue, hueSpread, maxAlpha, t, stress) {
      if (state.shadowAmount >= 1) {
        const nz = pseudoNoise(x * 0.002, y * 0.002, t * 0.05);
        return { h: 0, s: 0, b: lerp(90, 96, nz), a: 0.08 };
      }
      const nx = clamp(map(x, -600, 600, -1, 1), -1, 1);
      const ny = clamp(map(y, -600, 600, -1, 1), -1, 1);
      const nz = clamp(map(z, -600, 600, -1, 1), -1, 1);
      const pf = nx + ny + nz;
      const tf = Math.sin(t * 0.9 + pf * 2.5);
      let h = baseHue + hueSpread * (0.5 * pf + 0.5 * tf);
      h = lerp(h, 0, stress * 0.7);
      maxAlpha = Math.min(maxAlpha, 85);
      let alpha = lerp(maxAlpha * 0.25, maxAlpha, (ny + 1) * 0.5);
      if (stress > 0.5 && rng.random() < stress * 0.35) alpha *= rng.uniform(0.1, 0.5);
      const sat = lerp(100, 0, state.shadowAmount);
      const bri = lerp(100, 95, state.shadowAmount);
      alpha = lerp(alpha, 6, state.shadowAmount);
      return { h: ((h % 360) + 360) % 360, s: sat, b: bri, a: alpha / 100 };
    }

    function makeMat(fill, meta) {
      const mat = new THREE.MeshLambertMaterial({
        color: hsbColor(THREE, fill.h, fill.s, fill.b),
        transparent: true,
        opacity: fill.a,
        depthWrite: fill.a > 0.9,
      });
      if (meta) { mat.userData.fillMeta = meta; animatedMats.push(mat); }
      return mat;
    }

    function liveStress(stressKind) {
      if (stressKind === "ego") return state.egoStress;
      if (stressKind === "attachment") return state.attachmentStress;
      return state.angerStress;
    }

    function matFrom(x, y, z, baseHue, hueSpread, maxAlpha, t, stressKind) {
      const stress = liveStress(stressKind);
      const fill = machineFill(x, y, z, baseHue, hueSpread, maxAlpha, t, stress);
      return makeMat(fill, { x, y, z, baseHue, hueSpread, maxAlpha, stressKind });
    }

    function updateMaterials(t) {
      for (let i = 0; i < animatedMats.length; i++) {
        const mat = animatedMats[i];
        const m = mat.userData.fillMeta;
        const stress = liveStress(m.stressKind || "anger");
        const fill = machineFill(m.x, m.y, m.z, m.baseHue, m.hueSpread, m.maxAlpha, t, stress);
        mat.color.copy(hsbColor(THREE, fill.h, fill.s, fill.b));
        mat.opacity = fill.a;
        mat.depthWrite = fill.a > 0.9;
        mat.needsUpdate = true;
      }
    }

    function addBox(parentG, w, h, d, mat) {
      parentG.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat));
    }
    function addCyl(parentG, r, h, mat) {
      parentG.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, CYL_SEG), mat));
    }
    function addSpinner(pivot, axis, speed, stressKind) {
      spinners.push({ pivot, axis, baseSpeed: speed, stressKind: stressKind || "anger" });
    }
    function jitter(stress) {
      if (stress <= 0 || state.shadowAmount >= 1) return { x: 0, y: 0, z: 0 };
      const m = stress * stress * 120;
      return { x: rng.uniform(-m, m), y: rng.uniform(-m, m), z: rng.uniform(-m, m) };
    }
    function speedMult(stress) {
      return (1 + stress * stress * 7) * lerp(1, 0.04, state.shadowAmount);
    }

    function buildGearTeeth(parentG, radius, thickness, teeth, x, y, z, toothHue, maxAlpha, stressKind, t, axis) {
      const tD = thickness * 1.1;
      const tW = (TAU * radius) / (teeth * 4);
      const tH = radius * 0.12;
      const toothMat = matFrom(x, y, z, toothHue, 130, maxAlpha, t, stressKind);
      for (let i = 0; i < teeth; i++) {
        const a = (TAU * i) / teeth;
        const g = new THREE.Group();
        if (axis === "y") {
          g.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
          g.rotation.y = a;
        } else {
          g.position.set(0, Math.cos(a) * radius, Math.sin(a) * radius);
          g.rotation.x = a;
        }
        addBox(g, tW, tH, tD, toothMat);
        parentG.add(g);
      }
    }

    function clearMachine() {
      while (machineRoot.children.length) {
        const ch = machineRoot.children[0];
        ch.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) o.material.dispose();
        });
        machineRoot.remove(ch);
      }
      spinners.length = 0;
      animatedMats.length = 0;
    }

    function signature() {
      return [state.seed, state.gPlatformExtras, state.gColumnCount, state.gGearCount,
        state.gPulleyCount, state.gRodCount].join("|");
    }

    function snapToFloor() {
      anchor.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(anchor);
      if (box.isEmpty()) return;
      const dy = root.position.y - box.min.y;
      machinePivot.position.y += dy / scale;
    }

    function buildMachine(t) {
      clearMachine();
      rng = makeRng(state.seed);
      const sf = 1.2;
      const bW = 600 * sf, bD = 600 * sf, bT = 25 * sf;

      function plate(x, y, z, w, h, d) {
        const j = jitter(state.egoStress);
        const g = new THREE.Group();
        g.position.set(x + j.x, y + h / 2 + j.y, z + j.z);
        addBox(g, w, h, d, matFrom(x, y, z, 305, 110, 80, t, "ego"));
        machineRoot.add(g);
      }

      plate(0, 0, 0, bW, bT, bD);
      for (let i = 0; i < state.gPlatformExtras; i++) {
        plate(
          rng.uniform(-60, 60) * sf,
          -rng.uniform(80, 220) * sf,
          rng.uniform(-60, 60) * sf,
          bW * rng.uniform(0.5, 1),
          bT * rng.uniform(0.6, 1.4),
          bD * rng.uniform(0.5, 1)
        );
      }

      const colPositions = [];
      const colH = rng.uniform(140, 220) * sf;
      const colR = rng.uniform(14, 24) * sf;
      for (let i = 0; i < state.gColumnCount; i++) {
        const x = rng.uniform(-bW * 0.35, bW * 0.35);
        const z = rng.uniform(-bD * 0.35, bD * 0.35);
        const y = -colH / 2 - bT / 2;
        const j = jitter(state.egoStress);
        const g = new THREE.Group();
        g.position.set(x + j.x, y + j.y, z + j.z);
        g.rotation.x = Math.PI / 2;
        addCyl(g, colR, colH, matFrom(x, y, z, 320, 90, 78, t, "ego"));
        machineRoot.add(g);
        colPositions.push(new THREE.Vector3(x, -colH, z));
      }

      for (let i = 0; i < state.gGearCount; i++) {
        const anch = rng.choice(colPositions);
        const r = rng.uniform(40, 80) * sf;
        const thick = rng.uniform(14, 26) * sf;
        const teeth = rng.randint(8, 18);
        const horizontal = rng.random() < 0.5;
        const j = jitter(state.angerStress);
        const g = new THREE.Group();
        g.position.set(
          anch.x + rng.uniform(-80, 20) + j.x,
          anch.y + rng.uniform(-200, 200) + j.y,
          anch.z + rng.uniform(-20, 20) + j.z
        );
        g.rotation.y = rng.uniform(0, TAU);
        const px = g.position.x, py = g.position.y, pz = g.position.z;
        addCyl(g, r, thick, matFrom(px, py, pz, horizontal ? 15 : 25, horizontal ? 140 : 160, 80, t, "anger"));
        buildGearTeeth(g, r, thick, teeth, px, py, pz, horizontal ? 30 : 40, 82, "anger", t, horizontal ? "y" : "x");
        addSpinner(g, horizontal ? "y" : "x", rng.choice([-1, 1]) * rng.uniform(0.2, 0.8), "anger");
        machineRoot.add(g);
      }

      for (let i = 0; i < state.gPulleyCount; i++) {
        const a = rng.choice(colPositions);
        const b = rng.choice(colPositions);
        if (a === b) continue;
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const r = rng.uniform(25, 55) * sf;
        const th = rng.uniform(10, 18) * sf;
        const j = jitter(state.attachmentStress);
        const g = new THREE.Group();
        g.position.set(mid.x + j.x, mid.y + rng.uniform(-40, 40) + j.y, mid.z + j.z);
        const px = g.position.x, py = g.position.y, pz = g.position.z;
        addCyl(g, r, th * 0.5, matFrom(px, py, pz, 80, 130, 75, t, "attachment"));
        const inner = new THREE.Group();
        addCyl(inner, r * 0.7, th * 1.2, matFrom(px, py, pz, 200, 90, 60, t, "attachment"));
        g.add(inner);
        addSpinner(g, "y", rng.choice([-1, 1]) * rng.uniform(0.4, 1), "attachment");
        machineRoot.add(g);
      }

      for (let i = 0; i < state.gRodCount; i++) {
        const a = rng.choice(colPositions);
        const b = rng.choice(colPositions);
        if (a === b) continue;
        const dir = b.clone().sub(a);
        const len = dir.length();
        const mid = a.clone().add(b).multiplyScalar(0.5);
        dir.normalize();
        const rotY = Math.atan2(dir.x, dir.z);
        const rotX = Math.atan2(-dir.y, Math.sqrt(dir.z * dir.z + dir.x * dir.x));
        const radius = rng.uniform(5, 9) * sf;
        const jR = jitter(state.egoStress);
        const g = new THREE.Group();
        g.position.set(mid.x + jR.x, mid.y + jR.y, mid.z + jR.z);
        g.rotation.set(rotX, rotY, 0);
        addCyl(g, radius, len, matFrom(mid.x, mid.y, mid.z, 210, 160, 70, t, "ego"));
        const rAng = richness(state.angerVal);
        const rAtt = richness(state.attachmentVal);
        const eff = rAtt <= 0 ? 0 : rAng;
        const nG = Math.floor(map(eff, 0, 1, 0, 8));
        const nP = Math.floor(map(rAtt, 0, 1, 0, 8));
        const total = nG + nP;
        let gc = 0, pc = 0, idx = 0;
        while (idx < total) {
          let kind;
          if (gc < nG && pc < nP) kind = rng.random() * (nG - gc + nP - pc) < (nG - gc) ? "gear" : "pulley";
          else kind = gc < nG ? "gear" : "pulley";
          const attG = new THREE.Group();
          attG.position.y = ((idx + 1) / (total + 1) - 0.5) * len;
          const isG = kind === "gear";
          const stressKind = isG ? "anger" : "attachment";
          const jA = jitter(liveStress(stressKind));
          attG.position.x += jA.x;
          attG.position.y += jA.y;
          attG.position.z += jA.z;
          const attR = radius * rng.uniform(1.4, 2.2);
          const attT = radius * rng.uniform(0.6, 1.3);
          const horiz = rng.random() < 0.5;
          attG.rotation[horiz ? "y" : "x"] = rng.uniform(0, TAU);
          if (isG) {
            addCyl(attG, attR, attT, matFrom(0, 0, 0, horiz ? 15 : 25, 150, 80, t, stressKind));
            buildGearTeeth(attG, attR, attT, rng.randint(6, 14), 0, 0, 0, 30, 82, stressKind, t, horiz ? "y" : "x");
            addSpinner(attG, horiz ? "y" : "x", rng.choice([-1, 1]) * rng.uniform(0.3, 1), "anger");
          } else {
            addCyl(attG, attR, attT * 0.5, matFrom(0, 0, 0, 80, 130, 75, t, stressKind));
            const in2 = new THREE.Group();
            addCyl(in2, attR * 0.7, attT * 1.1, matFrom(0, 0, 0, 200, 90, 60, t, stressKind));
            attG.add(in2);
            addSpinner(attG, "y", rng.choice([-1, 1]) * rng.uniform(0.3, 1), "attachment");
          }
          g.add(attG);
          if (kind === "gear") gc++; else pc++;
          idx++;
        }
        machineRoot.add(g);
      }

      state.machineBuilt = true;
      builtSig = signature();
      snapToFloor();
    }

    function updateTargets(sliders) {
      state.angerVal = sliders.anger / 100;
      state.egoVal = sliders.ego / 100;
      state.attachmentVal = sliders.attachment / 100;
      state.angerStress = stressOf(state.angerVal);
      state.egoStress = stressOf(state.egoVal);
      state.attachmentStress = stressOf(state.attachmentVal);
      const rA = richness(state.angerVal);
      const rE = richness(state.egoVal);
      const rAt = richness(state.attachmentVal);
      state.gGearCount = Math.floor(map(rA, 0, 1, 4, 200));
      state.gPlatformExtras = Math.floor(map(rE, 0, 1, 0, 3));
      state.gColumnCount = Math.floor(map(rE, 0, 1, 3, 12));
      state.gPulleyCount = Math.floor(map(rAt, 0, 1, 2, 60));
      state.gRodCount = Math.floor(map(rAt, 0, 1, 1, 20));
      if (state.gColumnCount < 2) state.gGearCount = Math.min(state.gGearCount, 4);
    }

    function needsRebuild() {
      return !state.machineBuilt ||
        state.gPlatformExtras !== state.prevPlatformExtras ||
        state.gColumnCount !== state.prevColumnCount ||
        state.gGearCount !== state.prevGearCount ||
        state.gPulleyCount !== state.prevPulleyCount ||
        state.gRodCount !== state.prevRodCount ||
        signature() !== builtSig;
    }

    function syncRebuildFlags() {
      state.prevPlatformExtras = state.gPlatformExtras;
      state.prevColumnCount = state.gColumnCount;
      state.prevGearCount = state.gGearCount;
      state.prevPulleyCount = state.gPulleyCount;
      state.prevRodCount = state.gRodCount;
    }

    function applySliders(sliders) {
      updateTargets(sliders);
      if (!state.surrendered && needsRebuild()) {
        buildMachine(elapsed);
        syncRebuildFlags();
      }
    }

    updateTargets(sliders0);
    buildMachine(0);
    syncRebuildFlags();

    let elapsed = 0;

    function update(dt, active) {
      elapsed += dt;
      const t = elapsed;

      if (state.surrenderStart != null) {
        state.shadowAmount = Math.min((t - state.surrenderStart) / FADE_DURATION, 1);
        if (state.shadowAmount >= 1) state.surrendered = true;
      }

      if (!state.surrendered && needsRebuild()) {
        buildMachine(t);
        syncRebuildFlags();
      }

      const smA = speedMult(state.angerStress);
      const smAt = speedMult(state.attachmentStress);
      if (active) {
        spinners.forEach((s) => {
          const sm = s.stressKind === "attachment" ? smAt : smA;
          const d = -s.baseSpeed * sm * dt;
          if (s.axis === "x") s.pivot.rotation.x += d;
          else if (s.axis === "y") s.pivot.rotation.y += d;
          else s.pivot.rotation.z += d;
        });
      }

      updateMaterials(t);
      drawStatic(t);

      const lightBright = lerp(0.8, 0.5, state.shadowAmount);
      ambient.intensity = lightBright;
      dir1.visible = dir2.visible = state.shadowAmount < 1;
    }

    function triggerSurrender() {
      if (state.surrendered || state.surrenderStart != null) return false;
      state.surrenderStart = elapsed;
      return true;
    }

    return {
      root,
      lights,
      state,
      update,
      updateTargets,
      applySliders,
      buildMachine,
      triggerSurrender,
      setStaticOverlayVisible(visible) {
        staticOverlayVisible = visible;
      },
      setVisible(v) {
        root.visible = !!v;
      },
      setSeed(s) {
        state.seed = s >>> 0;
        state.machineBuilt = false;
        state.surrendered = false;
        state.surrenderStart = null;
        state.shadowAmount = 0;
        state.prevPlatformExtras = -1;
      },
    };
  }

  global.createSurrenderMachineEmbed = createSurrenderMachineEmbed;
})(typeof window !== "undefined" ? window : globalThis);
