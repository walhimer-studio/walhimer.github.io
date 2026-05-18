/* Auto-extracted from aycock-atmosphere-cross-section.html — piece geometry */
window.createAycockDrawer = function createAycockDrawer() {
  const C30 = Math.cos(Math.PI / 6), S30 = 0.5, TAU = Math.PI * 2;
  const PAL = {
    bg: "#C4C4CC", blue: "#74B4DC", blueHi: "#80B8E8", blueLo: "#6aaccc",
    navy: "#5A788C", gold: "#ECA018", terracotta: "#C84E24",
    maroon: "#662020", pink: "#d4787a", white: "#E8ECEE",
    whiteGlass: "rgba(232,236,238,0.58)", ink: "#2C3034",
    green: "#2e4a3a", slate: "#4a5e6c",
    charcoal: "#1a2b34", finGrey: "#b8bcc4", royal: "#5A788C",
    ringRed: "#C41E20", ringYellow: "#E5A823",
  };
  const draws = [], lines = [], glows = [];
  let scale = 1, ox = 0, oy = 0, ctx = null;

  const v3 = (x, y, z) => ({ x, y, z });
  const depthOf = (pts) => pts.reduce((s, p) => s + p.x + p.y + p.z, 0) / pts.length;

  function addFace(pts, fill, stroke = { w: 0.55, c: PAL.ink }) {
    draws.push({ depth: depthOf(pts), pts, fill, stroke });
  }
  function addLine(a, b, { w = 0.65, c = PAL.ink } = {}) {
    lines.push({ depth: depthOf([a, b]), a, b, w, c });
  }
  function addGlow(x, y, z, r, a = 0.34) {
    glows.push({ x, y, z, r, a });
  }

  function drawEllipse3D(cx, cy, cz, rx, ry, stroke, sw) {
    const n = 52, pts = [];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * TAU;
      pts.push(v3(cx + Math.cos(t) * rx, cy + Math.sin(t) * ry, cz));
    }
    for (let i = 0; i < pts.length - 1; i++) {
      addLine(pts[i], pts[i + 1], { w: sw, c: stroke });
    }
  }

  function fillDisc(cx, cy, cz, r, fill, rim) {
    const n = 32, pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU;
      pts.push(v3(cx + Math.cos(t) * r, cy + Math.sin(t) * r, cz));
    }
    addFace(pts, fill, { w: 0.5, c: rim || PAL.ink });
  }

  /* ── white platform under turbine ── */
  function addMainPlatform(cx, cy, z) {
    addCuboidThin(cx - 2.15, cy - 1.45, z - 0.06, 4.3, 2.85, 0.07);
  }
  function addCuboidThin(x, y, z, dx, dy, dz) {
    addFace([
      v3(x, y, z + dz), v3(x + dx, y, z + dz),
      v3(x + dx, y + dy, z + dz), v3(x, y + dy, z + dz),
    ], PAL.white, { w: 0.45, c: PAL.ink });
    addLine(v3(x, y, z), v3(x + dx, y, z), { w: 0.4, c: PAL.navy });
    addLine(v3(x + dx, y, z), v3(x + dx, y + dy, z), { w: 0.4, c: PAL.navy });
  }

  function addOuterFrame(cx, cy, z) {
    const hw = 1.35, hd = 1.0, ht = 0.35;
    const corners = [
      [cx - hw, cy - hd], [cx + hw, cy - hd], [cx + hw, cy + hd], [cx - hw, cy + hd],
    ];
    for (const [x, y] of corners) {
      addLine(v3(x, y, z), v3(x, y, z + ht), { w: 0.45, c: PAL.ink });
    }
    for (const zl of [z, z + ht * 0.35]) {
      for (let i = 0; i < 4; i++) {
        const a = corners[i], b = corners[(i + 1) % 4];
        addLine(v3(a[0], a[1], zl), v3(b[0], b[1], zl), { w: 0.45, c: PAL.ink });
      }
    }
    // right housing + blue motor disc
    const rx = cx + 0.55, ry = cy + 0.15;
    addLine(v3(rx, ry, z), v3(rx + 0.45, ry, z), { w: 0.4, c: PAL.ink });
    addLine(v3(rx, ry, z), v3(rx, ry + 0.35, z), { w: 0.4, c: PAL.ink });
    addLine(v3(rx + 0.45, ry, z), v3(rx + 0.45, ry + 0.35, z), { w: 0.4, c: PAL.ink });
    addLine(v3(rx, ry + 0.35, z), v3(rx + 0.45, ry + 0.35, z), { w: 0.4, c: PAL.ink });
    fillDisc(rx + 0.22, ry + 0.18, z + 0.02, 0.08, PAL.blue, PAL.ink);
    // left sketchy drive lines
    addLine(v3(cx - hw - 0.15, cy - 0.3, z + 0.05), v3(cx - hw + 0.1, cy - 0.1, z + 0.12), { w: 0.4, c: PAL.blue });
    addLine(v3(cx - hw - 0.1, cy - 0.45, z), v3(cx - hw + 0.2, cy - 0.25, z + 0.08), { w: 0.35, c: PAL.ink });
  }

  /**
   * Piece 4 — Blue turbine rotor, gold caps, pink shaft, red ring, wireframe frame.
   */
  function addTurbineAssembly(cx, cy, cz) {
    addGlow(cx, cy, cz, 2.1, 0.3);

    const nBlades = 12;
    const midZ = cz - 0.08;
    for (let i = 0; i < nBlades; i++) {
      const t0 = (i / nBlades) * TAU - 0.42;
      const t1 = t0 + (TAU / nBlades) * 0.88;
      const twist = i * 0.12;
      const blade = [];
      const steps = 14;
      for (let s = 0; s <= steps; s++) {
        const u = s / steps;
        const ang = t0 + (t1 - t0) * u + twist * (1 - u * 0.85);
        const bulge = Math.pow(Math.sin(u * Math.PI), 0.92);
        const rOuter = 0.32 + bulge * 1.38;
        const z = midZ - bulge * 0.34 + (1 - bulge) * 0.06;
        blade.push(v3(cx + Math.cos(ang) * rOuter, cy + Math.sin(ang) * rOuter, z));
      }
      for (let s = steps; s >= 0; s--) {
        const u = s / steps;
        const ang = t0 + (t1 - t0) * u + twist * (1 - u * 0.85);
        const tuck = 0.28 + u * 0.14;
        blade.push(v3(cx + Math.cos(ang) * tuck, cy + Math.sin(ang) * tuck, cz + 0.02 - u * 0.04));
      }
      addFace(blade, i % 2 ? PAL.blueHi : PAL.blue, { w: 0.55, c: PAL.ink });
    }

    const topZ = cz + 0.05;
    fillDisc(cx, cy, topZ, 0.5, PAL.gold, null);
    drawEllipse3D(cx, cy, topZ + 0.01, 0.52, 0.52, PAL.ringRed, 0.65);
    fillDisc(cx, cy, topZ + 0.04, 0.09, PAL.ink, null);
    fillDisc(cx, cy, topZ + 0.045, 0.03, PAL.white, null);

    const botZ = cz - 0.58;
    fillDisc(cx, cy, botZ, 0.46, PAL.gold, null);
    drawEllipse3D(cx, cy, botZ + 0.01, 0.48, 0.48, PAL.ringRed, 0.6);

    const shaftTop = cz - 0.12;
    const ringZ = cz - 0.52;
    const footZ = cz - 0.78;
    addLine(v3(cx, cy, shaftTop), v3(cx, cy, footZ), { w: 0.75, c: PAL.pink });
    drawEllipse3D(cx, cy, ringZ, 0.48, 0.34, PAL.ringRed, 0.65);

    addLine(v3(cx - 0.32, cy - 0.08, footZ + 0.02), v3(cx - 0.32, cy - 0.08, ringZ), { w: 0.7, c: PAL.pink });
    addLine(v3(cx + 0.32, cy + 0.1, footZ + 0.02), v3(cx + 0.32, cy + 0.1, ringZ), { w: 0.7, c: PAL.pink });

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU - Math.PI / 2;
      addLine(v3(cx, cy, ringZ - 0.02), v3(cx + Math.cos(a) * 0.26, cy + Math.sin(a) * 0.26, footZ + 0.02), { w: 0.8, c: PAL.pink });
    }

    addFace([
      v3(cx - 0.32, cy - 0.22, footZ), v3(cx + 0.32, cy - 0.22, footZ),
      v3(cx + 0.32, cy + 0.22, footZ), v3(cx - 0.32, cy + 0.22, footZ),
    ], PAL.pink, { w: 0.45, c: PAL.ink });

    addCuboidThin(cx - 0.55, cy - 0.42, footZ - 0.06, 1.1, 0.84, 0.06);
    addOuterFrame(cx, cy, footZ - 0.06);
  }

  function addTurbine(cx, cy, cz) {
    addTurbineAssembly(cx, cy, cz);
  }

  /**
   * Piece 1 — Coiled antenna (lattice tower + scalloped body + concentric rings).
   * Reference crop: blue truss, light-blue base, diagonal struts, dark body with
   * three grey scallops, top blocks, lens cylinder, rings through scallop holes.
   */
  function addCoiledAntennaAssembly(cx, cy, baseZ) {
    const towerH = 2.05;
    const w = 0.36;
    const legs = [
      [cx - w, cy - w], [cx + w, cy - w], [cx + w, cy + w], [cx - w, cy + w],
    ];

    // light-blue base plate
    addFace([
      v3(cx - w - 0.12, cy - w - 0.12, baseZ),
      v3(cx + w + 0.12, cy - w - 0.12, baseZ),
      v3(cx + w + 0.12, cy + w + 0.12, baseZ),
      v3(cx - w - 0.12, cy + w + 0.12, baseZ),
    ], PAL.blueHi, { w: 0.5, c: PAL.ink });
    addFace([
      v3(cx - w - 0.12, cy - w - 0.12, baseZ + 0.04),
      v3(cx + w + 0.12, cy - w - 0.12, baseZ + 0.04),
      v3(cx + w + 0.12, cy + w + 0.12, baseZ + 0.04),
      v3(cx - w - 0.12, cy + w + 0.12, baseZ + 0.04),
    ], PAL.blue, { w: 0.45, c: PAL.ink });

    // lattice posts + horizontals + X-braces per bay
    const bays = 5;
    for (const [lx, ly] of legs) {
      addLine(v3(lx, ly, baseZ + 0.04), v3(lx, ly, baseZ + towerH), { w: 0.85, c: PAL.royal });
    }
    for (let b = 0; b <= bays; b++) {
      const z = baseZ + 0.04 + (towerH * b) / bays;
      for (let j = 0; j < 4; j++) {
        const a = legs[j], c = legs[(j + 1) % 4];
        addLine(v3(a[0], a[1], z), v3(c[0], c[1], z), { w: 0.5, c: PAL.royal });
      }
      if (b < bays) {
        const z2 = baseZ + 0.04 + (towerH * (b + 1)) / bays;
        for (let j = 0; j < 4; j++) {
          const a = legs[j], c = legs[(j + 1) % 4];
          addLine(v3(a[0], a[1], z), v3(c[0], c[1], z2), { w: 0.42, c: PAL.royal });
          addLine(v3(c[0], c[1], z), v3(a[0], a[1], z2), { w: 0.42, c: PAL.royal });
        }
        addLine(v3(legs[0][0], legs[0][1], z), v3(legs[2][0], legs[2][1], z2), { w: 0.38, c: PAL.royal });
        addLine(v3(legs[2][0], legs[2][1], z), v3(legs[0][0], legs[0][1], z2), { w: 0.38, c: PAL.royal });
      }
    }

    // diagonal struts from base corners to mid tower
    const midZ = baseZ + towerH * 0.52;
    addLine(v3(cx - w - 0.12, cy - w - 0.12, baseZ + 0.04), v3(cx - w, cy - w, midZ), { w: 0.55, c: PAL.royal });
    addLine(v3(cx + w + 0.12, cy + w + 0.12, baseZ + 0.04), v3(cx + w, cy + w, midZ), { w: 0.55, c: PAL.royal });

    const bodyBase = baseZ + towerH;
    const bodyH = 1.55;
    const bodyTop = bodyBase + bodyH;

    // dark main slab — smooth convex on +X, stepped on -Y
    const profileSteps = 28;
    for (let s = 0; s < profileSteps; s++) {
      const u0 = s / profileSteps, u1 = (s + 1) / profileSteps;
      const z0 = bodyBase + bodyH * u0, z1 = bodyBase + bodyH * u1;
      const scallop = (u) => {
        const wave = Math.sin(u * Math.PI * 3) * 0.11;
        return cx - 0.2 + wave;
      };
      const smoothR = (u) => cx + 0.2 + Math.sin(u * Math.PI) * 0.04;
      addFace([
        v3(scallop(u0), cy - 0.08, z0), v3(smoothR(u0), cy + 0.14, z0),
        v3(smoothR(u1), cy + 0.14, z1), v3(scallop(u1), cy - 0.08, z1),
      ], PAL.charcoal, { w: 0.45, c: PAL.ink });
    }

    // three light-grey scalloped recesses (left face)
    for (let f = 0; f < 3; f++) {
      const fz0 = bodyBase + 0.18 + f * 0.48;
      const fz1 = fz0 + 0.38;
      const recess = [];
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        const bow = Math.sin(u * Math.PI) * 0.14;
        recess.push(v3(cx - 0.2 - bow, cy - 0.1 - u * 0.06, fz0 + (fz1 - fz0) * u));
      }
      for (let i = 10; i >= 0; i--) {
        const u = i / 10;
        recess.push(v3(cx - 0.12, cy - 0.1 - u * 0.06, fz0 + (fz1 - fz0) * u));
      }
      addFace(recess, PAL.finGrey, { w: 0.4, c: PAL.ink });
      // hole where ring passes through
      fillDisc(cx - 0.14, cy - 0.08, fz0 + 0.19, 0.045, PAL.charcoal, null);
    }

    // four dark blocks on top
    for (let b = 0; b < 4; b++) {
      addFace([
        v3(cx - 0.14 + b * 0.09, cy + 0.02, bodyTop),
        v3(cx - 0.06 + b * 0.09, cy + 0.02, bodyTop),
        v3(cx - 0.06 + b * 0.09, cy + 0.1, bodyTop + 0.08),
        v3(cx - 0.14 + b * 0.09, cy + 0.1, bodyTop + 0.08),
      ], PAL.charcoal, { w: 0.4, c: PAL.ink });
    }

    // white lens cylinder on top-right
    const lensX = cx + 0.18, lensY = cy + 0.12, lensZ = bodyTop + 0.04;
    addFace([
      v3(lensX, lensY, lensZ), v3(lensX + 0.14, lensY, lensZ),
      v3(lensX + 0.14, lensY, lensZ + 0.07), v3(lensX, lensY, lensZ + 0.07),
    ], PAL.white, { w: 0.45, c: PAL.ink });
    fillDisc(lensX + 0.14, lensY, lensZ + 0.035, 0.035, PAL.finGrey, PAL.ink);

    // row of white dots on lower-right of body
    for (let d = 0; d < 4; d++) {
      fillDisc(cx + 0.1, cy + 0.1 + d * 0.04, bodyBase + 0.12, 0.018, PAL.white, null);
    }

    // white haze behind leftmost rings
    addGlow(cx - 0.35, cy - 0.35, bodyBase + bodyH * 0.55, 1.15, 0.48);

    // concentric rings in Y–Z, sweeping left; 3rd ring yellow
    const ringColors = [PAL.ringRed, PAL.ringRed, PAL.ringYellow, PAL.ringRed, PAL.ringRed];
    for (let ri = 0; ri < ringColors.length; ri++) {
      const Ry = 0.22 + ri * 0.14;
      const Rz = 0.2 + ri * 0.12;
      const ringCy = cy - 0.12 - ri * 0.06;
      const ringCz = bodyBase + bodyH * 0.35 + ri * 0.08;
      const n = 56;
      let prev = null;
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * TAU;
        const p = v3(cx + 0.02, ringCy + Math.cos(t) * Ry, ringCz + Math.sin(t) * Rz);
        if (prev) addLine(prev, p, { w: 0.65, c: ringColors[ri] });
        prev = p;
      }
    }
  }

  function addAntennaTower(cx, cy, baseZ, h) {
    addCoiledAntennaAssembly(cx, cy, baseZ);
  }

  function addYellowBar(a, b) {
    addLine(a, b, { w: 2.4, c: PAL.gold });
    const m = v3((a.x + b.x) * 0.5, (a.y + b.y) * 0.5, (a.z + b.z) * 0.5);
    const bandLen = 0.08;
    const dir = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    const len = Math.hypot(dir.x, dir.y, dir.z) || 1;
    dir.x /= len; dir.y /= len; dir.z /= len;
    addLine(
      v3(m.x - dir.x * bandLen, m.y - dir.y * bandLen, m.z - dir.z * bandLen),
      v3(m.x + dir.x * bandLen, m.y + dir.y * bandLen, m.z + dir.z * bandLen),
      { w: 2.8, c: PAL.ringRed }
    );
    fillDisc(a.x, a.y, a.z, 0.055, PAL.ringRed, PAL.ink);
    fillDisc(b.x, b.y, b.z, 0.055, PAL.ringRed, PAL.ink);
  }

  /**
   * Piece 2 — Sail fin assembly + articulated yellow linkage.
   */
  function addSailAndLinkageAssembly(ox, oy, oz) {
    const bx = ox, by = oy, bz = oz;

    // orange triangular prism base (visible orange faces + navy top)
    addFace([
      v3(bx, by, bz), v3(bx + 0.95, by + 0.2, bz), v3(bx + 0.55, by + 0.72, bz),
    ], PAL.terracotta, { w: 0.5, c: PAL.ink });
    addFace([
      v3(bx, by, bz), v3(bx + 0.55, by + 0.72, bz), v3(bx + 0.1, by + 0.85, bz),
    ], PAL.terracotta, { w: 0.5, c: PAL.ink });
    addFace([
      v3(bx, by, bz + 0.06), v3(bx + 0.95, by + 0.2, bz + 0.06),
      v3(bx + 0.55, by + 0.72, bz + 0.06), v3(bx + 0.1, by + 0.85, bz + 0.06),
    ], PAL.navy, { w: 0.45, c: PAL.ink });

    // grey back slab
    addFace([
      v3(bx + 0.08, by + 0.78, bz + 0.06), v3(bx + 0.62, by + 0.88, bz + 0.06),
      v3(bx + 0.62, by + 0.88, bz + 0.95), v3(bx + 0.08, by + 0.78, bz + 0.95),
    ], PAL.finGrey, { w: 0.45, c: PAL.ink });

    // two rows of blue vertical rods
    const rodH = 0.88;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        const rx = bx + 0.14 + col * 0.155;
        const ry = by + 0.12 + row * 0.2;
        addLine(v3(rx, ry, bz + 0.06), v3(rx, ry, bz + rodH), { w: 0.7, c: PAL.blue });
      }
    }

    // translucent white curved sails (stacked)
    for (let s = 0; s < 5; s++) {
      const z0 = bz + 0.14 + s * 0.14;
      const sail = [];
      for (let i = 0; i <= 14; i++) {
        const u = i / 14;
        const bow = Math.sin(u * Math.PI) * 0.38;
        sail.push(v3(bx + 0.2 + bow, by + 0.18 + u * 0.52, z0 + u * 0.08));
      }
      for (let i = 14; i >= 0; i--) {
        const u = i / 14;
        sail.push(v3(bx + 0.14, by + 0.18 + u * 0.52, z0 + u * 0.06));
      }
      addFace(sail, PAL.whiteGlass, { w: 0.35, c: "rgba(44,48,52,0.22)" });
    }

    // light-blue top ribbon / plate (curved leading edge)
    const ribbonZ = bz + rodH + 0.02;
    const ribbon = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      const curve = Math.sin(u * Math.PI) * 0.18;
      ribbon.push(v3(bx + 0.15 + u * 0.75, by + 0.15 + curve, ribbonZ + u * 0.06));
    }
    for (let i = 20; i >= 0; i--) {
      const u = i / 20;
      ribbon.push(v3(bx + 0.15 + u * 0.75, by + 0.15 + u * 0.52, ribbonZ - 0.04 + u * 0.04));
    }
    addFace(ribbon, PAL.blueHi, { w: 0.5, c: PAL.ink });

    // dark curved outer rail
    const rail = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      const ang = u * Math.PI * 0.92 + 0.2;
      rail.push(v3(
        bx + 0.08 + Math.cos(ang) * 0.55,
        by + 0.25 + Math.sin(ang) * 0.48,
        bz + 0.1 + u * 0.85
      ));
    }
    for (let i = 0; i < rail.length - 1; i++) {
      addLine(rail[i], rail[i + 1], { w: 0.75, c: PAL.charcoal });
    }

    // red center pole + foot ring
    const poleX = bx + 0.42, poleY = by + 0.38;
    fillDisc(poleX, poleY, bz, 0.05, PAL.ringRed, PAL.ink);
    addLine(v3(poleX, poleY, bz), v3(poleX, poleY, bz + 1.25), { w: 0.7, c: PAL.ringRed });

    // ── articulated linkage (right) ──
    const attach = v3(bx + 0.72, by + 0.08, ribbonZ);
    const j0 = v3(bx + 1.05, by - 0.15, bz + 0.55);
    const spineA = v3(bx + 1.45, by + 0.05, bz + 0.48);
    const spineB = v3(bx + 2.35, by + 0.12, bz + 0.42);
    const j1 = v3(bx + 1.75, by + 0.55, bz + 0.35);
    const j2 = v3(bx + 2.05, by + 0.72, bz + 0.28);
    const j3 = v3(bx + 1.55, by + 0.85, bz + 0.22);

    addYellowBar(attach, j0);
    addLine(spineA, spineB, { w: 2.6, c: PAL.charcoal });
    addYellowBar(j0, spineA);
    addYellowBar(spineB, j1);
    addYellowBar(j1, j2);
    addYellowBar(j2, j3);
    fillDisc(spineA.x, spineA.y, spineA.z, 0.05, PAL.ringRed, null);
    fillDisc(spineB.x, spineB.y, spineB.z, 0.05, PAL.ringRed, null);
  }

  function addSailAssembly(x, y, z) {
    addSailAndLinkageAssembly(x, y, z);
  }

  function addWireBox(x, y, z, w, d, ht) {
    const c = [
      [x, y], [x + w, y], [x + w, y + d], [x, y + d],
    ];
    for (const [px, py] of c) {
      addLine(v3(px, py, z), v3(px, py, z + ht), { w: 0.5, c: PAL.royal });
    }
    for (const zl of [z, z + ht]) {
      for (let i = 0; i < 4; i++) {
        const a = c[i], b = c[(i + 1) % 4];
        addLine(v3(a[0], a[1], zl), v3(b[0], b[1], zl), { w: 0.5, c: PAL.royal });
      }
      addLine(v3(c[0][0], c[0][1], zl), v3(c[2][0], c[2][1], zl), { w: 0.38, c: PAL.royal });
    }
  }

  function addGreyWeb(pts) {
    for (let i = 0; i < pts.length - 1; i++) {
      addLine(pts[i], pts[i + 1], { w: 0.32, c: "rgba(90,96,104,0.55)" });
    }
  }

  /**
   * Piece 3 — Central scaffold (refined from wide crop).
   */
  function addCentralScaffoldAssembly(cx, cy, cz, h) {
    addGlow(cx - 0.2, cy + 0.15, cz + 0.08, 1.2, 0.28);
    addGlow(cx + 0.35, cy + 0.35, cz + 0.1, 0.9, 0.2);

    const lx = cx + 0.08, ly = cy - 0.02, gap = 0.13;
    const topZ = cz + h + 0.3;
    const platZ = cz + h * 0.5;

    // extended blue base grid (left) + yellow decks
    addWireBox(cx - 1.15, cy + 0.05, cz, 1.05, 0.42, 0.1);
    addWireBox(cx - 0.45, cy - 0.28, cz, 0.95, 0.55, 0.11);
    addFace([
      v3(cx - 0.35, cy - 0.32, cz + 0.01), v3(cx + 0.95, cy - 0.32, cz + 0.01),
      v3(cx + 0.95, cy + 0.58, cz + 0.01), v3(cx - 0.35, cy + 0.58, cz + 0.01),
    ], PAL.gold, { w: 0.4, c: PAL.ink });
    addFace([
      v3(cx + 0.25, cy + 0.12, cz + 0.01), v3(cx + 0.85, cy + 0.12, cz + 0.01),
      v3(cx + 0.85, cy + 0.48, cz + 0.01), v3(cx + 0.25, cy + 0.48, cz + 0.01),
    ], PAL.gold, { w: 0.4, c: PAL.ink });

    // gold ladder (~6 rungs)
    addLine(v3(lx, ly, cz + 0.04), v3(lx, ly, topZ), { w: 1.2, c: PAL.gold });
    addLine(v3(lx + gap, ly + 0.03, cz + 0.04), v3(lx + gap, ly + 0.03, topZ), { w: 1.2, c: PAL.gold });
    fillDisc(lx, ly, cz + 0.04, 0.048, PAL.gold, PAL.ink);
    for (let r = 1; r <= 6; r++) {
      const z = cz + 0.04 + (h * r) / 6;
      addLine(v3(lx, ly, z), v3(lx + gap, ly + 0.03, z), { w: 0.72, c: PAL.gold });
    }
    fillDisc(lx + gap * 0.5, ly + 0.015, topZ + 0.02, 0.085, PAL.charcoal, PAL.ink);

    // stacked wire panels behind ladder
    for (let p = 0; p < 3; p++) {
      const ox = lx + 0.18 + p * 0.07;
      addLine(v3(ox, ly + 0.08, cz + 0.15), v3(ox, ly + 0.08, cz + h * 0.88), { w: 0.42, c: PAL.ink });
      addLine(v3(ox + 0.05, ly + 0.1, cz + 0.15), v3(ox + 0.05, ly + 0.1, cz + h * 0.88), { w: 0.42, c: PAL.ink });
      addLine(v3(ox, ly + 0.08, cz + h * 0.45), v3(ox + 0.05, ly + 0.1, cz + h * 0.45), { w: 0.38, c: PAL.ink });
    }

    // black mid platform
    addFace([
      v3(lx - 0.14, ly - 0.02, platZ), v3(lx + gap + 0.14, ly + 0.05, platZ),
      v3(lx + gap + 0.14, ly + 0.05, platZ + 0.05), v3(lx - 0.14, ly - 0.02, platZ + 0.05),
    ], PAL.charcoal, { w: 0.45, c: PAL.ink });

    // red vertical hook just below platform
    const hook = [
      v3(lx + 0.06, ly + 0.02, platZ - 0.02),
      v3(lx + 0.02, ly + 0.08, platZ - 0.12),
      v3(lx + 0.1, ly + 0.12, platZ - 0.22),
      v3(lx + 0.08, ly + 0.04, platZ - 0.32),
    ];
    for (let i = 0; i < hook.length - 1; i++) {
      addLine(hook[i], hook[i + 1], { w: 0.62, c: PAL.ringRed });
    }

    // left glass wall + blue top wash + sails
    const px = cx - 1.0, py = cy - 0.12;
    const wallZ0 = cz + 0.1, wallZ1 = cz + h * 0.9;
    addGlow(px + 0.02, py, wallZ1 - 0.15, 0.55, 0.25);
    addFace([
      v3(px, py, wallZ0), v3(px + 0.05, py, wallZ0),
      v3(px + 0.05, py, wallZ1), v3(px, py, wallZ1),
    ], PAL.whiteGlass, { w: 0.4, c: PAL.ink });
    addLine(v3(px, py, wallZ0), v3(px, py, wallZ1), { w: 0.5, c: PAL.ink });
    addLine(v3(px + 0.05, py, wallZ0), v3(px + 0.05, py, wallZ1), { w: 0.5, c: PAL.ink });
    addLine(v3(px, py, wallZ0), v3(px + 0.05, py, wallZ0), { w: 0.5, c: PAL.ink });
    addLine(v3(px, py, wallZ1), v3(px + 0.05, py, wallZ1), { w: 0.5, c: PAL.ink });
    for (let s = 0; s < 2; s++) {
      const sail = [];
      const z0 = cz + h * (0.52 + s * 0.14);
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        sail.push(v3(px + 0.03 + Math.sin(u * Math.PI) * 0.14, py + 0.01, z0 + u * 0.2));
      }
      for (let i = 10; i >= 0; i--) {
        const u = i / 10;
        sail.push(v3(px + 0.02, py + 0.01, z0 + u * 0.18));
      }
      addFace(sail, "rgba(116,180,220,0.5)", { w: 0.35, c: PAL.ink });
    }
    const rodZ = cz + h * 0.46;
    addLine(v3(px + 0.05, py + 0.02, rodZ), v3(lx - 0.04, ly, rodZ), { w: 0.62, c: PAL.ringRed });
    fillDisc(lx - 0.04, ly, rodZ, 0.038, PAL.ringRed, null);

    // blue grid walkway (left-rear)
    const gx = cx - 0.95, gy = cy + 0.08, gz = cz + 0.12;
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      addLine(v3(gx + t * 0.8, gy, gz), v3(gx + t * 0.8 + 0.12, gy + 0.38, gz), { w: 0.45, c: PAL.royal });
    }
    for (let j = 0; j <= 4; j++) {
      const u = j / 4;
      addLine(v3(gx, gy + u * 0.38, gz), v3(gx + 0.95, gy + u * 0.38 + 0.04, gz), { w: 0.45, c: PAL.royal });
    }

    // grey web tying structure together
    addGreyWeb([
      v3(px + 0.05, py + 0.02, rodZ), v3(lx, ly, platZ),
      v3(lx + gap, ly, cz + h * 0.3), v3(cx + 0.5, cy + 0.3, cz + h * 0.2),
    ]);
    addGreyWeb([
      v3(cx - 0.9, cy + 0.25, cz + 0.12), v3(lx, ly, cz + 0.2),
      v3(lx + gap * 0.5, ly, platZ), v3(cx + 0.4, cy + 0.4, cz + 0.15),
    ]);

    // sensor pole (right)
    const sx = cx + 0.58, sy = cy + 0.38;
    addLine(v3(sx, sy, cz), v3(sx, sy, topZ + 0.2), { w: 0.42, c: PAL.ink });
    fillDisc(sx, sy, topZ + 0.22, 0.05, PAL.charcoal, null);

    // blue ribbon + grey supports + yellow deck under
    addFace([
      v3(cx + 0.2, cy + 0.15, cz + 0.02), v3(cx + 0.75, cy + 0.15, cz + 0.02),
      v3(cx + 0.75, cy + 0.42, cz + 0.02), v3(cx + 0.2, cy + 0.42, cz + 0.02),
    ], PAL.gold, { w: 0.38, c: PAL.ink });
    for (let i = 0; i <= 3; i++) {
      const t = i / 3;
      addLine(
        v3(lx + gap + 0.15, ly + 0.18 + t * 0.2, platZ - 0.05),
        v3(lx + gap + 0.15, ly + 0.18 + t * 0.2, cz + 0.15),
        { w: 0.35, c: "rgba(90,96,104,0.6)" }
      );
    }
    const ribbon = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      ribbon.push(v3(
        lx + gap + 0.08 + u * 0.42,
        ly + 0.12 + Math.sin(u * Math.PI) * 0.38,
        platZ - 0.08 + u * 0.58
      ));
    }
    for (let i = 20; i >= 0; i--) {
      const u = i / 20;
      ribbon.push(v3(
        lx + gap + 0.14 + u * 0.38,
        ly + 0.2 + u * 0.22,
        platZ - 0.12 + u * 0.52
      ));
    }
    addFace(ribbon, PAL.blue, { w: 0.48, c: PAL.ink });

    // foreground upright scribble frame
    const bx = cx + 0.28, by = cy + 0.18, bz = cz + 0.02;
    const frameH = 0.22;
    for (const [x0, y0, x1, y1, z0, z1] of [
      [bx, by, bx + 0.28, by, bz, bz + frameH],
      [bx + 0.28, by, bx + 0.28, by + 0.2, bz, bz + frameH],
      [bx + 0.28, by + 0.2, bx, by + 0.2, bz, bz + frameH],
      [bx, by + 0.2, bx, by, bz, bz + frameH],
    ]) {
      addLine(v3(x0, y0, z0), v3(x1, y1, z1), { w: 0.48, c: PAL.ink });
    }
    const scribbles = [
      [0.04, 0.04, 0.2, 0.12], [0.1, 0.14, 0.24, 0.06], [0.16, 0.05, 0.06, 0.16],
      [0.08, 0.1, 0.22, 0.15], [0.14, 0.12, 0.18, 0.08],
    ];
    for (const [x0, y0, x1, y1] of scribbles) {
      addLine(v3(bx + x0, by + y0, bz + frameH), v3(bx + x1, by + y1, bz + frameH), { w: 0.5, c: PAL.ink });
    }
  }

  function addCentralSpine(cx, cy, cz, h) {
    addCentralScaffoldAssembly(cx, cy, cz, h);
  }

  function addYellowCluster(x, y, z, s) {
    fillDisc(x - s, y, z, 0.038, PAL.gold, null);
    fillDisc(x + s, y, z, 0.038, PAL.gold, null);
    fillDisc(x, y - s, z, 0.038, PAL.gold, null);
    fillDisc(x, y + s, z, 0.038, PAL.gold, null);
  }

  function addTiltedDisc(cx, cy, cz, r, tiltY, tiltZ) {
    const n = 28, pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU;
      pts.push(v3(
        cx,
        cy + Math.cos(t) * r * 0.55 + Math.sin(t) * r * tiltY * 0.3,
        cz + Math.sin(t) * r * 0.45 + Math.cos(t) * r * tiltZ * 0.3
      ));
    }
    addFace(pts, PAL.white, { w: 0.4, c: "rgba(44,48,52,0.25)" });
  }

  /**
   * Piece 5 — Standing blue crescent, red spindle, white planes, yellow arch backdrop.
   */
  function addStandingRingAssembly(cx, cy, cz) {
    addGlow(cx + 0.1, cy, cz + 0.5, 1.3, 0.18);

    // backdrop: white panel + gold band + yellow arch (right)
    const px = cx + 0.95, py = cy - 0.15;
    addFace([
      v3(px, py, cz + 0.05), v3(px + 0.04, py, cz + 0.05),
      v3(px + 0.04, py, cz + 1.35), v3(px, py, cz + 1.35),
    ], PAL.whiteGlass, { w: 0.4, c: PAL.ink });
    addFace([
      v3(px, py + 0.12, cz + 0.62), v3(px + 0.04, py + 0.12, cz + 0.62),
      v3(px + 0.04, py + 0.18, cz + 0.68), v3(px, py + 0.18, cz + 0.68),
    ], PAL.gold, { w: 0.35, c: PAL.ink });
    drawEllipse3D(px + 0.12, py + 0.05, cz + 0.75, 0.42, 0.55, PAL.gold, 0.6);

    // thick blue crescent (YZ plane, opening left)
    const R = 1.28, tube = 0.26, segs = 72;
    const a0 = -Math.PI * 0.15, a1 = Math.PI * 1.55;
    for (let i = 0; i < segs; i++) {
      const t0 = a0 + ((a1 - a0) * i) / segs;
      const t1 = a0 + ((a1 - a0) * (i + 1)) / segs;
      const p0 = v3(cx, cy + Math.cos(t0) * R, cz + Math.sin(t0) * R * 0.88);
      const p1 = v3(cx, cy + Math.cos(t1) * R, cz + Math.sin(t1) * R * 0.88);
      const ny = Math.cos((t0 + t1) * 0.5), nz = Math.sin((t0 + t1) * 0.5) * 0.88;
      const len = Math.hypot(ny, nz) || 1;
      const qy = ny / len * tube, qz = nz / len * tube;
      addFace([
        v3(p0.x, p0.y - qy, p0.z - qz), v3(p0.x, p0.y + qy, p0.z + qz),
        v3(p1.x, p1.y + qy, p1.z + qz), v3(p1.x, p1.y - qy, p1.z - qz),
      ], PAL.blue, { w: 0.48, c: PAL.ink });
    }

    // white planes inside crescent
    addTiltedDisc(cx + 0.02, cy + 0.05, cz + 0.55, 0.28, 0.2, 0.15);
    addTiltedDisc(cx + 0.02, cy - 0.12, cz + 0.82, 0.22, -0.15, 0.25);
    addTiltedDisc(cx + 0.02, cy + 0.22, cz + 0.35, 0.18, 0.35, -0.1);

    // small wire rect on upper disc
    const wx = cx + 0.08, wy = cy + 0.18, wz = cz + 0.88;
    addLine(v3(wx, wy, wz), v3(wx + 0.12, wy, wz), { w: 0.38, c: PAL.ink });
    addLine(v3(wx + 0.12, wy, wz), v3(wx + 0.12, wy + 0.08, wz), { w: 0.38, c: PAL.ink });
    addLine(v3(wx + 0.12, wy + 0.08, wz), v3(wx, wy + 0.08, wz), { w: 0.38, c: PAL.ink });
    addLine(v3(wx, wy + 0.08, wz), v3(wx, wy, wz), { w: 0.38, c: PAL.ink });

    // red spindle: vertical axis + radiating arms + legs
    const hub = v3(cx + 0.04, cy + 0.02, cz + 0.52);
    addLine(v3(hub.x, hub.y, cz + 0.05), v3(hub.x, hub.y, cz + 1.15), { w: 0.55, c: PAL.maroon });

    const arms = [
      [cx - 0.35, cy - 0.42, cz + 1.05, true],
      [cx - 0.28, cy - 0.55, cz + 0.92, false],
      [cx - 0.18, cy - 0.48, cz + 1.12, true],
      [cx - 0.42, cy - 0.28, cz + 0.88, false],
      [cx - 0.22, cy - 0.38, cz + 0.78, false],
      [cx - 0.38, cy - 0.15, cz + 0.95, true],
    ];
    for (const [ax, ay, az, cluster] of arms) {
      addLine(hub, v3(ax, ay, az), { w: 0.52, c: PAL.maroon });
      if (cluster) addYellowCluster(ax, ay, az, 0.045);
      else fillDisc(ax, ay, az, 0.042, PAL.gold, null);
    }

    addLine(hub, v3(cx + 0.15, cy + 0.35, cz + 0.15), { w: 0.45, c: PAL.maroon });
    addLine(v3(cx + 0.15, cy + 0.35, cz + 0.15), v3(cx + 0.12, cy + 0.38, cz), { w: 0.45, c: PAL.maroon });
    addLine(hub, v3(cx - 0.05, cy - 0.25, cz + 0.08), { w: 0.45, c: PAL.maroon });
    addLine(v3(cx - 0.05, cy - 0.25, cz + 0.08), v3(cx - 0.08, cy - 0.28, cz), { w: 0.45, c: PAL.maroon });

    // miniature figure at crescent opening (left-bottom)
    const fx = cx - 0.55, fy = cy - 0.62, fz = cz + 0.12;
    addLine(v3(fx, fy, fz), v3(fx, fy, fz + 0.22), { w: 0.4, c: PAL.maroon });
    addLine(v3(fx + 0.06, fy + 0.04, fz), v3(fx + 0.06, fy + 0.04, fz + 0.22), { w: 0.4, c: PAL.maroon });
    fillDisc(fx + 0.03, fy + 0.02, fz + 0.12, 0.05, PAL.white, PAL.ink);
    addLine(v3(fx - 0.04, fy - 0.02, fz), v3(fx + 0.1, fy + 0.06, fz), { w: 0.35, c: PAL.blue });

    // faint ground lines
    addLine(v3(cx - 0.5, cy - 0.35, cz), v3(cx + 0.6, cy + 0.4, cz), { w: 0.3, c: "rgba(90,96,104,0.4)" });
    addLine(v3(cx - 0.3, cy - 0.5, cz), v3(cx + 0.4, cy - 0.2, cz), { w: 0.28, c: "rgba(90,96,104,0.35)" });
  }

  function addStandingRing(cx, cy, cz) {
    addStandingRingAssembly(cx, cy, cz);
  }

  function catenary(a, b, sag, n, phase = 0) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = a.x + (b.x - a.x) * u;
      const y = a.y + (b.y - a.y) * u;
      const z = a.z + (b.z - a.z) * u - Math.sin(u * Math.PI) * sag;
      const wobble = Math.sin(u * Math.PI * 2 + phase) * sag * 0.08;
      pts.push(v3(x + wobble * 0.3, y + wobble * 0.2, z));
    }
    return pts;
  }

  /**
   * Piece 6 — Gantry track, hanging cables, rib cage, bowl, wireframe support.
   */
  function addCageAndBowlAssembly(cx, cy, cz) {
    addGlow(cx - 0.4, cy + 0.35, cz + 0.15, 1.1, 0.22);
    addGlow(cx + 0.5, cy - 0.2, cz + 0.5, 0.8, 0.18);

    // faint background wave (left)
    const wave = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      wave.push(v3(cx - 1.2 + u * 0.9, cy + 0.5 + Math.sin(u * Math.PI) * 0.25, cz + 0.35 + u * 0.2));
    }
    for (let i = 0; i < wave.length - 1; i++) {
      addLine(wave[i], wave[i + 1], { w: 0.55, c: "rgba(116,180,220,0.45)" });
    }

    // gantry: two parallel rails receding (near → far)
    const nearA = v3(cx - 1.4, cy + 1.0, cz + 0.08);
    const nearB = v3(cx - 1.25, cy + 1.12, cz + 0.08);
    const farA = v3(cx + 1.6, cy - 0.75, cz + 0.72);
    const farB = v3(cx + 1.75, cy - 0.62, cz + 0.72);
    addLine(nearA, farA, { w: 1.1, c: PAL.charcoal });
    addLine(nearB, farB, { w: 1.1, c: PAL.charcoal });
    addLine(nearA, nearB, { w: 0.85, c: PAL.charcoal });
    addLine(farA, farB, { w: 0.85, c: PAL.charcoal });
    addLine(v3((nearA.x + nearB.x) * 0.5, (nearA.y + nearB.y) * 0.5, cz + 0.08),
      v3((farA.x + farB.x) * 0.5, (farA.y + farB.y) * 0.5, cz + 0.72), { w: 0.65, c: PAL.charcoal });

    // yellow/orange mount + white stub at far end
    addFace([
      v3(farA.x + 0.05, farA.y - 0.02, farA.z), v3(farB.x + 0.08, farB.y + 0.05, farB.z),
      v3(farB.x + 0.08, farB.y + 0.05, farB.z + 0.35), v3(farA.x + 0.05, farA.y - 0.02, farA.z + 0.35),
    ], PAL.white, { w: 0.4, c: PAL.ink });
    addFace([
      v3(farA.x + 0.08, farA.y, farA.z + 0.35), v3(farB.x + 0.12, farB.y + 0.06, farB.z + 0.35),
      v3(farB.x + 0.12, farB.y + 0.06, farB.z + 0.48), v3(farA.x + 0.08, farA.y, farA.z + 0.48),
    ], PAL.gold, { w: 0.4, c: PAL.ink });

    // red wireframe support under mid-span
    const mid = v3(cx + 0.15, cy + 0.22, cz + 0.38);
    const rw = 0.32, rd = 0.22, rh = 0.28;
    for (const [x0, y0, x1, y1, z0, z1] of [
      [mid.x, mid.y, mid.x + rw, mid.y, mid.z, mid.z],
      [mid.x + rw, mid.y, mid.x + rw, mid.y + rd, mid.z, mid.z],
      [mid.x + rw, mid.y + rd, mid.x, mid.y + rd, mid.z, mid.z],
      [mid.x, mid.y + rd, mid.x, mid.y, mid.z, mid.z],
      [mid.x, mid.y, mid.x, mid.y, mid.z, mid.z + rh],
      [mid.x + rw, mid.y, mid.x + rw, mid.y, mid.z, mid.z + rh],
    ]) {
      addLine(v3(x0, y0, z0), v3(x1, y1, z1), { w: 0.48, c: PAL.maroon });
    }
    addLine(mid, v3(mid.x + rw * 0.5, mid.y + rd * 0.5, cz + 0.08), { w: 0.42, c: PAL.maroon });

    // blue rib cage at near end (hanging cables attach here)
    const ribBase = v3(cx - 1.05, cy + 0.85, cz + 0.1);
    for (let r = 0; r < 5; r++) {
      const rib = [];
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        const bow = Math.sin(u * Math.PI) * 0.35;
        rib.push(v3(ribBase.x + bow, ribBase.y + u * 0.45, ribBase.z + u * 0.35));
      }
      for (let i = 10; i >= 0; i--) {
        const u = i / 10;
        rib.push(v3(ribBase.x + 0.06, ribBase.y + u * 0.45, ribBase.z + u * 0.33));
      }
      addFace(rib, "rgba(116,180,220,0.42)", { w: 0.4, c: PAL.ink });
      ribBase.x += 0.08;
      ribBase.y += 0.02;
    }

    // two hanging catenary cables from far end
    const hangA = v3((farA.x + farB.x) * 0.5, (farA.y + farB.y) * 0.5, farA.z);
    const lowA = v3(cx - 0.85, cy + 0.75, cz + 0.05);
    const lowB = v3(cx - 0.7, cy + 0.88, cz + 0.05);
    const ptsA = [
      ...catenary(hangA, lowA, 1.15, 24, 0),
      ...catenary(lowA, v3(mid.x - 0.2, mid.y + 0.15, cz + 0.55), 0.65, 18, 1).slice(1),
    ];
    const ptsB = catenary(hangA, lowB, 1.05, 22, 0.5);
    for (let i = 0; i < ptsA.length - 1; i++) {
      addLine(ptsA[i], ptsA[i + 1], { w: 0.55, c: PAL.ink });
    }
    for (let i = 0; i < ptsB.length - 1; i++) {
      addLine(ptsB[i], ptsB[i + 1], { w: 0.55, c: PAL.ink });
    }
    fillDisc(ptsA[Math.floor(ptsA.length * 0.42)].x, ptsA[Math.floor(ptsA.length * 0.42)].y,
      ptsA[Math.floor(ptsA.length * 0.42)].z, 0.04, PAL.ringRed, null);
    fillDisc(ptsB[Math.floor(ptsB.length * 0.38)].x, ptsB[Math.floor(ptsB.length * 0.38)].y,
      ptsB[Math.floor(ptsB.length * 0.38)].z, 0.035, PAL.ringRed, null);

    // light-blue bowl with interior curved blades
    const bowlC = v3(cx + 0.35, cy + 0.35, cz + 0.18);
    const bowlR = 0.48;
    const bowlShell = [];
    for (let i = 0; i <= 32; i++) {
      const t = (i / 32) * TAU;
      bowlShell.push(v3(bowlC.x + Math.cos(t) * bowlR, bowlC.y + Math.sin(t) * bowlR * 0.65, bowlC.z));
    }
    addFace(bowlShell, PAL.blueHi, { w: 0.5, c: PAL.ink });
    for (let b = 0; b < 7; b++) {
      const ang = (b / 7) * TAU - 0.3;
      const blade = [];
      for (let s = 0; s <= 8; s++) {
        const u = s / 8;
        blade.push(v3(
          bowlC.x + Math.cos(ang) * (0.12 + u * 0.32),
          bowlC.y + Math.sin(ang) * (0.08 + u * 0.22),
          bowlC.z + 0.02 + u * 0.12
        ));
      }
      for (let s = 8; s >= 0; s--) {
        const u = s / 8;
        blade.push(v3(bowlC.x + Math.cos(ang) * 0.08, bowlC.y + Math.sin(ang) * 0.06, bowlC.z + u * 0.1));
      }
      addFace(blade, PAL.blue, { w: 0.4, c: PAL.ink });
    }

    drawEllipse3D(cx + 0.2, cy + 0.95, cz + 0.55, 0.55, 0.2, PAL.gold, 0.55);
  }

  function addCageAndBowl(cx, cy, cz) {
    addCageAndBowlAssembly(cx, cy, cz);
  }



  const PIECE_BUILDERS = {
    sail: (x, y, z) => addSailAndLinkageAssembly(x, y, z),
    tower: (x, y, z) => addCoiledAntennaAssembly(x, y, z),
    turbine: (x, y, z) => { addMainPlatform(x, y, z - 0.42); addTurbine(x, y, z); },
    scaffold: (x, y, z) => addCentralSpine(x, y, z, 3.4),
    ring: (x, y, z) => addStandingRing(x, y, z),
    cage: (x, y, z) => addCageAndBowl(x, y, z),
  };

  function proj(p) {
    return {
      x: (p.x - p.y) * C30 * scale + ox,
      y: ((p.x + p.y) * S30 - p.z) * scale + oy,
    };
  }

  function pathFromPts(pts, close = true) {
    if (!pts.length || !ctx) return;
    ctx.beginPath();
    const p0 = proj(pts[0]);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < pts.length; i++) {
      const p = proj(pts[i]);
      ctx.lineTo(p.x, p.y);
    }
    if (close) ctx.closePath();
  }

  function render() {
    if (!ctx) return;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.fillStyle = PAL.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const g of glows) {
      const c = proj(v3(g.x, g.y, g.z));
      const r = g.r * scale;
      const grd = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
      grd.addColorStop(0, `rgba(255,255,255,${g.a})`);
      grd.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, TAU);
      ctx.fill();
    }
    for (const d of [...draws].sort((a, b) => a.depth - b.depth)) {
      pathFromPts(d.pts, true);
      ctx.fillStyle = d.fill;
      ctx.fill();
      if (d.stroke) {
        ctx.strokeStyle = d.stroke.c;
        ctx.lineWidth = d.stroke.w;
        ctx.stroke();
      }
    }
    for (const ln of [...lines].sort((a, b) => a.depth - b.depth)) {
      const p0 = proj(ln.a), p1 = proj(ln.b);
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = ln.c;
      ctx.lineWidth = ln.w;
      ctx.stroke();
    }
  }

  function fitProjection(canvas, pad = 28) {
    const pts = [];
    for (const d of draws) for (const p of d.pts) pts.push(p);
    for (const ln of lines) { pts.push(ln.a, ln.b); }
    if (!pts.length) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const flat = (p) => ({
      sx: (p.x - p.y) * C30,
      sy: (p.x + p.y) * S30 - p.z,
    });
    for (const p of pts) {
      const { sx, sy } = flat(p);
      minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
      minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
    }
    const w = maxX - minX || 1, h = maxY - minY || 1;
    const cw = canvas.width - pad * 2, ch = canvas.height - pad * 2;
    scale = Math.min(cw / w, ch / h);
    ox = pad + (cw - w * scale) * 0.5 - minX * scale;
    oy = pad + (ch - h * scale) * 0.5 - minY * scale;
  }

  function buildPiece(id, x = 0, y = 0, z = 0) {
    draws.length = 0; lines.length = 0; glows.length = 0;
    const fn = PIECE_BUILDERS[id];
    if (fn) fn(x, y, z);
  }

  function drawToCanvas(canvas, id, x = 0, y = 0, z = 0) {
    buildPiece(id, x, y, z);
    ctx = canvas.getContext("2d");
    fitProjection(canvas);
    render();
    return { scale, ox, oy };
  }

  function worldSize(id) {
    buildPiece(id, 0, 0, 0);
    const pts = [];
    for (const d of draws) for (const p of d.pts) pts.push(p);
    for (const ln of lines) { pts.push(ln.a, ln.b); }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const p of pts) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
    }
    return { w: maxX - minX, h: maxZ - minZ, d: maxY - minY };
  }

  return { drawToCanvas, worldSize, PAL };
};
