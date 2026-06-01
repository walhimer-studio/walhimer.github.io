function roomOpts() {
  return window.__SURRENDER_ROOM_OPTS || null;
}

let _slAnger;
let _slEgo;
let _slAttachment;

function _getSliderVal(el) { return parseInt(el.value, 10); }

function initStandaloneControls() {
  if (roomOpts()) return;

  const fsRefresh = document.getElementById("fs-refresh");
  const surrenderBtn = document.getElementById("surrender-btn");

  surrenderBtn.addEventListener("click", () => {
    if (surrendered || surrenderStart !== null) return;
    window._surrenderPressed = true;
    surrenderBtn.textContent = "Surrendering…";
    surrenderBtn.disabled = true;
    surrenderBtn.classList.add("surrendered");
  });

  fsRefresh.addEventListener("click", () => {
    _slAnger.value = 50;
    _slEgo.value = 50;
    _slAttachment.value = 50;
    document.getElementById("val-anger").textContent = 50;
    document.getElementById("val-ego").textContent = 50;
    document.getElementById("val-attachment").textContent = 50;
    document.getElementById("zero-hint").classList.remove("visible");
    window._newSeedRequested = true;
  });

  _slAnger = document.getElementById("sl-anger");
  _slEgo = document.getElementById("sl-ego");
  _slAttachment = document.getElementById("sl-attachment");

  [_slAnger, _slEgo, _slAttachment].forEach((sl, i) => {
    const ids = ["anger", "ego", "attachment"];
    sl.addEventListener("input", () => {
      document.getElementById("val-" + ids[i]).textContent = sl.value;
      const allZero = _getSliderVal(_slAnger) === 0 &&
        _getSliderVal(_slEgo) === 0 &&
        _getSliderVal(_slAttachment) === 0;
      document.getElementById("zero-hint").classList.toggle("visible", allZero);
    });
  });
}

// ── SURRENDER MACHINES ────────────────────────────────────────────
//
// Three forces blind us to the connection that was always there.
//
// ANGER      → gears spin out, break, jitter. The machine destroys itself.
// EGO        → sharp static. Bright interference. The signal of self.
// ATTACHMENT → slow dense static. The residue that won't clear.
//
// At 0% each: a simple, working machine. The circuit is open.
// At 65%: peak complexity.
// At 100%: the machine breaks in its own way.
//
// A random timer runs silently — 20s to 5min.
// When it expires, the machine fades to shadow.
// That is surrender arriving at its own time, not yours.

let parts = [];
const _seedParam = new URLSearchParams(location.search).get('seed');
let seed = _seedParam != null && _seedParam !== '' ? (parseInt(_seedParam, 10) >>> 0) : 653057;

function updateSeedHud() {
  const el = document.getElementById('seed-label');
  if (el) el.textContent = 'seed ' + seed;
}

let angerVal      = 0.5;
let egoVal        = 0.5;
let attachmentVal = 0.5;

let angerStress      = 0;
let egoStress        = 0;
let attachmentStress = 0;

let gPlatformExtras = 0;
let gColumnCount    = 4;
let gGearCount      = 60;
let gPulleyCount    = 10;
let gRodCount       = 5;

let prevPlatformExtras = -1;
let prevColumnCount    = -1;
let prevGearCount      = -1;
let prevPulleyCount    = -1;
let prevRodCount       = -1;

let machineBuilt = false;

// ── TIMER ─────────────────────────────────────────────────────────
const FADE_DURATION   = 14000; // 14 second conscious fade
let   surrenderStart  = null;   // null until surrender button pressed
let   shadowAmount    = 0;
let   surrendered     = false;

function richness(val) { return Math.min(val / 0.65, 1.0); }
function stressOf(val) { return Math.max(0, (val - 0.65) / 0.35); }

const sketch = function(p) {

  p.setup = function() {
    const ro = roomOpts();
    const w = ro?.pixelSize || window.innerWidth;
    const h = ro?.pixelSize || window.innerHeight;
    const cnv = p.createCanvas(w, h, p.WEBGL);
    if (ro?.parentElement) cnv.parent(ro.parentElement);
    else cnv.parent("machine-stage");
    cnv.elt.style.position = 'absolute';
    cnv.elt.style.inset = '0';
    cnv.elt.style.zIndex = '0';
    p.pixelDensity(Math.min(window.devicePixelRatio, 2));
    p.angleMode(p.RADIANS);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.smooth();
    updateTargets();
    buildMachine();
    machineBuilt = true;
    updateSeedHud();
  };

  p.draw = function() {
    if (window._newSeedRequested) {
      window._newSeedRequested = false;
      seed = Math.floor(Math.random() * 999999);
      updateSeedHud();
      machineBuilt    = false;
      surrendered     = false;
      shadowAmount    = 0;
      surrenderStart  = null;
      prevPlatformExtras = -1;
      const sb = document.getElementById('surrender-btn');
      if (sb) { sb.disabled = false; sb.classList.remove('surrendered'); sb.textContent = 'Surrender'; }
    }

    // Surrender triggered by button press
    if (window._surrenderPressed && surrenderStart === null) {
      window._surrenderPressed = false;
      surrenderStart = p.millis();
    }
    if (surrenderStart !== null) {
      const fadeElapsed = p.millis() - surrenderStart;
      shadowAmount = Math.min(fadeElapsed / FADE_DURATION, 1.0);
      if (shadowAmount >= 1.0) surrendered = true;
    }

    updateTargets();

    if (!surrendered && (
      gPlatformExtras !== prevPlatformExtras ||
      gColumnCount    !== prevColumnCount    ||
      gGearCount      !== prevGearCount      ||
      gPulleyCount    !== prevPulleyCount    ||
      gRodCount       !== prevRodCount       ||
      !machineBuilt
    )) {
      buildMachine();
      machineBuilt       = true;
      prevPlatformExtras = gPlatformExtras;
      prevColumnCount    = gColumnCount;
      prevGearCount      = gGearCount;
      prevPulleyCount    = gPulleyCount;
      prevRodCount       = gRodCount;
    }

    p.background(0, 0, 100);

    const lightBright = p.lerp(80, 50, shadowAmount);
    p.ambientLight(lightBright);
    if (shadowAmount < 1) {
      p.directionalLight(255, 255, 255,  0.35, -0.4, -1);
      p.directionalLight(180, 180, 255, -0.30,  0.2,  1);
    }

    if (!roomOpts()) p.orbitControl();
    p.rotateX(-0.4);
    p.rotateY(0.3);

    p.translate(0, 50, 0);

    const t = p.millis() * 0.001;
    for (let part of parts) { part.update(t); part.draw(t); }

    // ── STATIC OVERLAY ────────────────────────────────────────────
    // Drawn in screen space after the 3D scene
    const staticLevel = Math.max(egoStress, attachmentStress);
    if (staticLevel > 0 && shadowAmount < 1) {
      drawStatic(t, staticLevel);
    }
  };

  // Static: ego = sharp bright sparks, attachment = slow drifting grain
  function drawStatic(t, level) {
    p.push();
    p.camera(0, 0, (p.height / 2.0) / p.tan(p.PI * 30.0 / 180.0), 0, 0, 0, 0, 1, 0);
    p.noLights();
    p.noStroke();

    const W = p.width;
    const H = p.height;

    // EGO STATIC — sharp, bright, white/yellow sparks
    if (egoStress > 0) {
      const egoCount = p.floor(egoStress * egoStress * 1800);
      for (let i = 0; i < egoCount; i++) {
        const sx = p.random(-W / 2, W / 2);
        const sy = p.random(-H / 2, H / 2);
        const sw = p.random(1, p.lerp(1, 5, egoStress));
        const sh = p.random(1, 2);
        const sb = p.random(88, 100);
        const sa = p.random(40, 80) * egoStress;
        // Sharp hue — white to yellow to hot
        const hue = p.random() < 0.6 ? 0 : p.random(45, 60);
        p.fill(hue, p.random() < 0.6 ? 0 : 80, sb, sa);
        p.rect(sx - sw / 2, sy - sh / 2, sw, sh);
      }
    }

    // ATTACHMENT STATIC — slow, denser, grey-brown grain
    if (attachmentStress > 0) {
      const attCount = p.floor(attachmentStress * attachmentStress * 2400);
      // Attachment grain drifts slowly — use noise offset by time
      const driftX = p.noise(t * 0.08) * 80 - 40;
      const driftY = p.noise(t * 0.08 + 100) * 80 - 40;
      for (let i = 0; i < attCount; i++) {
        const sx = p.random(-W / 2, W / 2) + driftX;
        const sy = p.random(-H / 2, H / 2) + driftY;
        const sw = p.random(1, 3);
        const sh = p.random(1, p.lerp(1, 6, attachmentStress));
        const sb = p.random(40, 72);
        const sa = p.random(15, 45) * attachmentStress;
        p.fill(p.random(20, 40), p.random(10, 30), sb, sa);
        p.rect(sx - sw / 2, sy - sh / 2, sw, sh);
      }
    }

    p.pop();
  }

  p.windowResized = function() {
    if (roomOpts()) return;
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  function updateTargets() {
    const ro = roomOpts();
    if (ro?.getSliders) {
      const s = ro.getSliders();
      angerVal = s.anger / 100.0;
      egoVal = s.ego / 100.0;
      attachmentVal = s.attachment / 100.0;
    } else {
      angerVal = _getSliderVal(_slAnger) / 100.0;
      egoVal = _getSliderVal(_slEgo) / 100.0;
      attachmentVal = _getSliderVal(_slAttachment) / 100.0;
    }

    angerStress      = stressOf(angerVal);
    egoStress        = stressOf(egoVal);
    attachmentStress = stressOf(attachmentVal);

    const rA = richness(angerVal);
    const rE = richness(egoVal);
    const rAt = richness(attachmentVal);

    // Anger → gears (the churning, the breaking)
    gGearCount      = p.floor(p.map(rA,  0, 1, 4,   200));
    // Ego → platforms + columns (structural ambition, the weight of self)
    gPlatformExtras = p.floor(p.map(rE,  0, 1, 0,   3));
    gColumnCount    = p.floor(p.map(rE,  0, 1, 3,   12));
    // Attachment → pulleys + rods (the holding on, the connective tissue)
    gPulleyCount    = p.floor(p.map(rAt, 0, 1, 2,   60));
    gRodCount       = p.floor(p.map(rAt, 0, 1, 1,   20));

    // No gears without columns
    if (gColumnCount < 2) gGearCount = Math.min(gGearCount, 4);

    const allZero = angerVal === 0 && egoVal === 0 && attachmentVal === 0;
    const zeroHint = document.getElementById("zero-hint");
    if (zeroHint) zeroHint.classList.toggle("visible", allZero);
  }

  function machineFill(x, y, z, baseHue, hueSpread, maxAlpha, t, stress) {
    stress = stress || 0;
    if (shadowAmount >= 1.0) {
      p.fill(0, 0, p.lerp(90, 96, p.noise(x * 0.002, y * 0.002, t * 0.05)), 8);
      return;
    }
    const nx = p.constrain(p.map(x, -600, 600, -1, 1), -1, 1);
    const ny = p.constrain(p.map(y, -600, 600, -1, 1), -1, 1);
    const nz = p.constrain(p.map(z, -600, 600, -1, 1), -1, 1);
    const pf = nx + ny + nz;
    const tf = p.sin(t * 0.9 + pf * 2.5);
    let h    = baseHue + hueSpread * (0.5 * pf + 0.5 * tf);
    h = p.lerp(h, 0, stress * 0.7);
    h = (h % 360 + 360) % 360;
    maxAlpha = p.min(maxAlpha, 85);
    let alpha = p.lerp(maxAlpha * 0.25, maxAlpha, (ny + 1) * 0.5);
    if (stress > 0.5 && p.random() < stress * 0.35) alpha *= p.random(0.1, 0.5);
    const sat = p.lerp(100, 0, shadowAmount);
    const bri = p.lerp(100, 95, shadowAmount);
    alpha     = p.lerp(alpha, 6, shadowAmount);
    p.fill(h, sat, bri, alpha);
  }

  function jitter(stress) {
    if (stress <= 0 || shadowAmount >= 1) return { x: 0, y: 0, z: 0 };
    const m = stress * stress * 120;
    return { x: p.random(-m, m), y: p.random(-m, m), z: p.random(-m, m) };
  }

  function speedMult(stress) {
    return (1 + stress * stress * 7) * p.lerp(1, 0.04, shadowAmount);
  }

  // ── BUILD ──────────────────────────────────────────────────────
  function buildMachine() {
    parts = [];
    p.randomSeed(seed);
    const sf = 1.2;
    const bW = 600 * sf, bD = 600 * sf, bT = 25 * sf;

    parts.push(new BasePlate(0, 0, 0, bW, bT, bD));

    // Extra platforms — ego builds more structure to stand on
    for (let i = 0; i < gPlatformExtras; i++) {
      const w  = bW * p.random(0.5, 1.0);
      const d  = bD * p.random(0.5, 1.0);
      const h  = bT * p.random(0.6, 1.4);
      const px = p.random(-60, 60) * sf;
      const pz = p.random(-60, 60) * sf;
      const py = -p.random(80, 220) * sf;
      parts.push(new BasePlate(px, py, pz, w, h, d));
    }

    const colPositions = [];
    const colH = p.random(140, 220) * sf;
    const colR = p.random(14, 24)   * sf;
    for (let i = 0; i < gColumnCount; i++) {
      const x = p.random(-bW * 0.35, bW * 0.35);
      const z = p.random(-bD * 0.35, bD * 0.35);
      parts.push(new Column(x, -colH / 2 - bT / 2, z, colR, colH));
      colPositions.push(p.createVector(x, -colH, z));
    }

    for (let i = 0; i < gGearCount; i++) {
      const anch  = p.random(colPositions);
      const r     = p.random(40, 80) * sf;
      const thick = p.random(14, 26) * sf;
      const teeth = p.floor(p.random(8, 18));
      const yOff  = p.random(-200, 200);
      const spd   = p.random([-1, 1]) * p.random(0.2, 0.8);
      const Cls   = p.random() < 0.5 ? GearHorizontal : GearVertical;
      parts.push(new Cls(
        anch.x + p.random(-80, 20), anch.y + yOff,
        anch.z + p.random(-20, 20), r, thick, teeth, spd
      ));
    }

    for (let i = 0; i < gPulleyCount; i++) {
      const a = p.random(colPositions), b = p.random(colPositions);
      if (a === b) continue;
      const mid = p5.Vector.add(a, b).mult(0.5);
      const r   = p.random(25, 55) * sf;
      const th  = p.random(10, 18) * sf;
      const spd = p.random([-1, 1]) * p.random(0.4, 1.0);
      parts.push(new PulleyStandalone(mid.x, mid.y + p.random(-40, 40), mid.z, r, th, spd));
    }

    for (let i = 0; i < gRodCount; i++) {
      const a = p.random(colPositions), b = p.random(colPositions);
      if (a === b) continue;
      parts.push(new RodWithAttachments(
        a.x, a.y, a.z, b.x, b.y, b.z,
        p.random(5, 9) * sf, richness(angerVal), richness(attachmentVal)
      ));
    }
  }

  // ── CLASSES ───────────────────────────────────────────────────

  class BasePlate {
    constructor(x, y, z, w, h, d) { this.pos = p.createVector(x, y, z); this.w=w; this.h=h; this.d=d; }
    update() {}
    draw(t) {
      const j = jitter(egoStress);
      p.push();
      p.translate(this.pos.x+j.x, this.pos.y+this.h/2+j.y, this.pos.z+j.z);
      p.noStroke();
      machineFill(this.pos.x, this.pos.y, this.pos.z, 305, 110, 80, t, egoStress);
      p.box(this.w, this.h, this.d);
      p.pop();
    }
  }

  class Column {
    constructor(x, y, z, r, h) { this.pos = p.createVector(x, y, z); this.r=r; this.h=h; }
    update() {}
    draw(t) {
      const j = jitter(egoStress);
      p.push();
      p.translate(this.pos.x+j.x, this.pos.y+j.y, this.pos.z+j.z);
      p.rotateX(p.HALF_PI); p.noStroke();
      machineFill(this.pos.x, this.pos.y, this.pos.z, 320, 90, 78, t, egoStress);
      p.cylinder(this.r, this.h);
      p.pop();
    }
  }

  class GearHorizontal {
    constructor(x, y, z, radius, thickness, teeth, speed) {
      this.pos=p.createVector(x,y,z); this.radius=radius; this.thickness=thickness;
      this.teeth=teeth; this.baseSpeed=speed; this.angle=p.random(p.TWO_PI);
    }
    update(t) { this.angle = this.baseSpeed * speedMult(angerStress) * t; }
    draw(t) {
      const s=angerStress, j=jitter(s);
      p.push();
      p.translate(this.pos.x+j.x, this.pos.y+j.y, this.pos.z+j.z);
      p.rotateY(this.angle); p.noStroke();
      machineFill(this.pos.x, this.pos.y, this.pos.z, 15, 140, 80, t, s);
      p.cylinder(this.radius, this.thickness);
      const tD=this.thickness*1.1, tW=(p.TWO_PI*this.radius)/(this.teeth*4), tH=this.radius*0.12;
      for (let i=0; i<this.teeth; i++) {
        const a=(p.TWO_PI*i)/this.teeth;
        p.push();
        p.translate(p.cos(a)*this.radius, 0, p.sin(a)*this.radius);
        p.rotateY(a);
        machineFill(this.pos.x, this.pos.y, this.pos.z, 30, 130, 82, t, s);
        p.box(tW, tH, tD);
        p.pop();
      }
      p.pop();
    }
  }

  class GearVertical {
    constructor(x, y, z, radius, thickness, teeth, speed) {
      this.pos=p.createVector(x,y,z); this.radius=radius; this.thickness=thickness;
      this.teeth=teeth; this.baseSpeed=speed; this.angle=p.random(p.TWO_PI);
    }
    update(t) { this.angle = this.baseSpeed * speedMult(angerStress) * t; }
    draw(t) {
      const s=angerStress, j=jitter(s);
      p.push();
      p.translate(this.pos.x+j.x, this.pos.y+j.y, this.pos.z+j.z);
      p.rotateX(this.angle); p.noStroke();
      machineFill(this.pos.x, this.pos.y, this.pos.z, 25, 160, 78, t, s);
      p.cylinder(this.radius, this.thickness);
      const tD=this.thickness*1.1, tW=(p.TWO_PI*this.radius)/(this.teeth*4), tH=this.radius*0.12;
      for (let i=0; i<this.teeth; i++) {
        const a=(p.TWO_PI*i)/this.teeth;
        p.push();
        p.translate(0, p.cos(a)*this.radius, p.sin(a)*this.radius);
        p.rotateX(a);
        machineFill(this.pos.x, this.pos.y, this.pos.z, 40, 140, 80, t, s);
        p.box(tW, tH, tD);
        p.pop();
      }
      p.pop();
    }
  }

  class PulleyStandalone {
    constructor(x, y, z, radius, thickness, speed) {
      this.pos=p.createVector(x,y,z); this.radius=radius; this.thickness=thickness;
      this.baseSpeed=speed; this.angle=p.random(p.TWO_PI);
    }
    update(t) { this.angle = this.baseSpeed * speedMult(attachmentStress) * t; }
    draw(t) {
      const s=attachmentStress, j=jitter(s);
      p.push();
      p.translate(this.pos.x+j.x, this.pos.y+j.y, this.pos.z+j.z);
      p.rotateY(this.angle); p.noStroke();
      machineFill(this.pos.x, this.pos.y, this.pos.z, 80, 130, 75, t, s);
      p.cylinder(this.radius, this.thickness*0.5);
      p.push();
      machineFill(this.pos.x, this.pos.y, this.pos.z, 200, 90, 60, t, s);
      p.cylinder(this.radius*0.7, this.thickness*1.2);
      p.pop(); p.pop();
    }
  }

  class RodWithAttachments {
    constructor(x1, y1, z1, x2, y2, z2, radius, gearDensity, pulleyDensity) {
      this.a=p.createVector(x1,y1,z1); this.b=p.createVector(x2,y2,z2);
      this.radius=radius; this.gearDensity=gearDensity; this.pulleyDensity=pulleyDensity;
      this._ct(); this._ba();
    }
    _ct() {
      const dir=p5.Vector.sub(this.b,this.a);
      this.length=dir.mag(); this.mid=p5.Vector.add(this.a,this.b).mult(0.5);
      dir.normalize();
      this.rotY=p.atan2(dir.x,dir.z);
      this.rotX=p.atan2(-dir.y, p.sqrt(dir.z*dir.z+dir.x*dir.x));
    }
    _ba() {
      this.attachments=[];
      const eff=this.pulleyDensity<=0?0:this.gearDensity;
      const nG=p.floor(p.map(eff,0,1,0,8)), nP=p.floor(p.map(this.pulleyDensity,0,1,0,8));
      const total=nG+nP; if (!total) return;
      let gc=0, pc=0, idx=0;
      while (idx<total) {
        let kind;
        if (gc<nG && pc<nP) kind=p.random(nG-gc+nP-pc)<(nG-gc)?'gear':'pulley';
        else kind=gc<nG?'gear':'pulley';
        this.attachments.push({
          kind, u:(idx+1)/(total+1),
          orientation: p.random()<0.5?'horizontal':'vertical',
          radius: this.radius*p.random(1.4,2.2),
          thickness: this.radius*p.random(0.6,1.3),
          teeth: p.floor(p.random(6,14)),
          baseSpeed: p.random([-1,1])*p.random(0.3,1.0),
          phase: p.random(p.TWO_PI)
        });
        if (kind==='gear') gc++; else pc++;
        idx++;
      }
    }
    update() {}
    draw(t) {
      const sE=egoStress, jR=jitter(sE);
      p.push();
      p.translate(this.mid.x+jR.x, this.mid.y+jR.y, this.mid.z+jR.z);
      p.rotateY(this.rotY); p.rotateX(this.rotX); p.noStroke();
      machineFill(this.mid.x, this.mid.y, this.mid.z, 210, 160, 70, t, sE);
      p.cylinder(this.radius, this.length);
      for (const att of this.attachments) {
        const isG=att.kind==='gear';
        const aS=isG?angerStress:attachmentStress;
        const sm=speedMult(aS), yPos=(att.u-0.5)*this.length, jA=jitter(aS);
        p.push();
        p.translate(jA.x, yPos+jA.y, jA.z);
        const rotFn=att.orientation==='horizontal'?p.rotateY.bind(p):p.rotateX.bind(p);
        rotFn(att.phase+att.baseSpeed*sm*t);
        if (isG) {
          machineFill(0,0,0, att.orientation==='horizontal'?15:25, 150, 80, t, aS);
          p.cylinder(att.radius, att.thickness);
          const tD=att.thickness*1.05, tW=(p.TWO_PI*att.radius)/(att.teeth*3.5), tH=att.radius*0.1;
          for (let i=0; i<att.teeth; i++) {
            const a=(p.TWO_PI*i)/att.teeth;
            p.push();
            if (att.orientation==='horizontal') { p.translate(p.cos(a)*att.radius,0,p.sin(a)*att.radius); p.rotateY(a); }
            else { p.translate(0,p.cos(a)*att.radius,p.sin(a)*att.radius); p.rotateX(a); }
            machineFill(0,0,0,30,130,82,t,aS); p.box(tW,tH,tD);
            p.pop();
          }
        } else {
          machineFill(0,0,0,80,130,75,t,aS); p.cylinder(att.radius,att.thickness*0.5);
          p.push(); machineFill(0,0,0,200,90,60,t,aS); p.cylinder(att.radius*0.7,att.thickness*1.1); p.pop();
        }
        p.pop();
      }
      p.pop();
    }
  }

}; // end sketch

function bootSketch() {
  if (typeof p5 === "undefined") {
    const hint = document.querySelector(".hint");
    if (hint) hint.textContent = "p5 failed to load — check network";
    return;
  }
  if (roomOpts()) return;
  initStandaloneControls();
  new p5(sketch);
}

window.createSurrenderMachinesP5 = function createSurrenderMachinesP5(opts) {
  window.__SURRENDER_ROOM_OPTS = opts;
  if (opts.seed != null) seed = opts.seed >>> 0;
  updateSeedHud();
  const inst = new p5(sketch, opts.parentElement);
  return {
    p5: inst,
    get canvas() { return inst.canvas; },
    triggerSurrender() {
      if (surrendered || surrenderStart !== null) return;
      window._surrenderPressed = true;
    },
    triggerNewMachine() {
      window._newSeedRequested = true;
    },
    get state() {
      return { shadowAmount, surrenderStart, surrendered, seed };
    },
  };
};

if (document.readyState === "complete") bootSketch();
else window.addEventListener("load", bootSketch);

// ── SURRENDER MACHINES — SOUND ENGINE ────────────────────────────────────────
//
// Three sliders, three sound textures. All Web Audio API, no external files.
//
// ANGER      → low grinding sawtooth drones, detuned to create mechanical beating
//              + random crunch clicks at high stress (gear teeth catching)
// EGO        → high sine interference tones, fast beating frequency = static
//              + pitch rises with stress — more frantic, more self-amplifying
// ATTACHMENT → slow triangle drones, very slow beat that won't clear
//              + drifts with LFO — the thing that hangs in the room
//
// ZERO STATE → single clean sine tone — the simple working circuit
// SURRENDER  → all three layers fade; a pure 432Hz tone swells and fades last

let _ctx        = null;
let _soundOn    = false;
let _masterGain = null;

let _angerGain, _angerOsc1, _angerOsc2;
let _egoGain,   _egoOsc1,   _egoOsc2;
let _attachGain, _attachOsc1, _attachOsc2;
let _zeroGain,  _zeroOsc;
let _surrGain,  _surrOsc;

let _sndSurrendering  = false;
let _sndSurrStart     = null;
const SURR_DURATION   = 14; // seconds — matches FADE_DURATION in sketch

function _initAudio() {
  if (_ctx) return;
  _ctx        = new (window.AudioContext || window.webkitAudioContext)();
  _masterGain = _ctx.createGain();
  _masterGain.gain.value = 0;
  _masterGain.connect(_ctx.destination);

  // helper: connect osc → filter → gain → master
  function makeDrone(type, freq, filterType, filterFreq, filterQ) {
    const osc  = _ctx.createOscillator();
    const filt = _ctx.createBiquadFilter();
    const gain = _ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    filt.type = filterType; filt.frequency.value = filterFreq;
    if (filterQ) filt.Q.value = filterQ;
    gain.gain.value = 0;
    osc.connect(filt); filt.connect(gain); gain.connect(_masterGain);
    osc.start();
    return { osc, filt, gain };
  }

  // ANGER — two detuned sawtooths, bandpass kept gritty but not harsh
  const a1 = makeDrone('sawtooth', 55,    'bandpass', 140, 0.9);
  const a2 = makeDrone('sawtooth', 56.8,  'bandpass', 140, 0.9);
  _angerGain = a1.gain; // we'll set both together
  _angerOsc1 = a1.osc; _angerOsc2 = a2.osc;
  a2.gain.gain.value = 0; // driven via _angerGain ref below — see update loop

  // Share gain node: connect a2 osc directly to same filter as a1
  // (Simpler: use separate gain that mirrors _angerGain)
  const a2gain = _ctx.createGain(); a2gain.gain.value = 0;
  _angerOsc2.disconnect(); 
  _angerOsc2.connect(a1.filt); // share same filter + gain chain
  _angerOsc2.start && null; // already started

  // EGO — two high sines, fast beating creates interference shimmer
  const e1 = makeDrone('sine', 880, 'highpass', 700);
  const e2 = makeDrone('sine', 887, 'highpass', 700);
  _egoGain = e1.gain;
  _egoOsc1 = e1.osc; _egoOsc2 = e2.osc;
  e2.gain.gain.value = 0;
  _egoOsc2.disconnect();
  _egoOsc2.connect(e1.filt);

  // ATTACHMENT — two slow triangles, barely-drifting beat
  const at1 = makeDrone('triangle', 110,   'lowpass', 280);
  const at2 = makeDrone('triangle', 111.4, 'lowpass', 280);
  _attachGain = at1.gain;
  _attachOsc1 = at1.osc; _attachOsc2 = at2.osc;
  at2.gain.gain.value = 0;
  _attachOsc2.disconnect();
  _attachOsc2.connect(at1.filt);
  // Slow LFO on attachment — it breathes but never leaves
  const lfo  = _ctx.createOscillator();
  const lfoG = _ctx.createGain();
  lfo.frequency.value = 0.055; lfoG.gain.value = 0.007;
  lfo.connect(lfoG); lfoG.connect(_attachGain.gain); lfo.start();

  // ZERO STATE — single clean sine, only audible when all sliders at zero
  const z = makeDrone('sine', 220, 'lowpass', 800);
  _zeroGain = z.gain; _zeroOsc = z.osc;

  // SURRENDER TONE — 432Hz, swells during surrender, fades last
  const s = makeDrone('sine', 432, 'lowpass', 600);
  _surrGain = s.gain; _surrOsc = s.osc;

  // Random anger crunch clicks — gear teeth catching at high stress
  setInterval(() => {
    if (!_soundOn) return;
    const anger = parseInt(document.getElementById('sl-anger').value, 10) / 100;
    const stress = Math.max(0, (anger - 0.65) / 0.35);
    if (stress < 0.05 || Math.random() > stress * stress * 0.9) return;
    const bufLen = Math.floor(_ctx.sampleRate * 0.025);
    const buf  = _ctx.createBuffer(1, bufLen, _ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2.5);
    const src  = _ctx.createBufferSource();
    const env  = _ctx.createGain();
    const bp   = _ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 180 + Math.random() * 260; bp.Q.value = 1.8;
    src.buffer = buf;
    env.gain.setValueAtTime(0.12 * stress, _ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.0001, _ctx.currentTime + 0.035);
    src.connect(bp); bp.connect(env); env.connect(_masterGain);
    src.start(); src.stop(_ctx.currentTime + 0.04);
  }, 110);

  _runUpdateLoop();
}

function _runUpdateLoop() {
  if (!_ctx) return;
  const now  = _ctx.currentTime;
  const RAMP = 0.18;

  const anger  = parseInt(document.getElementById('sl-anger').value,      10) / 100;
  const ego    = parseInt(document.getElementById('sl-ego').value,         10) / 100;
  const attach = parseInt(document.getElementById('sl-attachment').value,  10) / 100;

  const angerRich   = Math.min(anger  / 0.65, 1.0);
  const egoRich     = Math.min(ego    / 0.65, 1.0);
  const attachRich  = Math.min(attach / 0.65, 1.0);
  const angerStr    = Math.max(0, (anger  - 0.65) / 0.35);
  const egoStr      = Math.max(0, (ego    - 0.65) / 0.35);
  const attachStr   = Math.max(0, (attach - 0.65) / 0.35);
  const allZero     = anger < 0.01 && ego < 0.01 && attach < 0.01;

  const surBtn       = document.getElementById('surrender-btn');
  const surrendering = surBtn && surBtn.disabled && surBtn.textContent !== 'Surrender';

  if (_soundOn) {
    // ANGER: grinds up to 65%, stress adds crunch + detune
    _angerGain.gain.setTargetAtTime(
      surrendering ? 0 : angerRich * 0.16 + angerStr * 0.10, now, RAMP);
    _angerOsc2.frequency.setTargetAtTime(55 + 1.8 + angerStr * 9, now, RAMP);

    // EGO: interference builds, beat frequency rises with stress
    _egoGain.gain.setTargetAtTime(
      surrendering ? 0 : egoRich * 0.035 + egoStr * 0.07, now, RAMP);
    _egoOsc2.frequency.setTargetAtTime(880 + 7 + egoStr * 28, now, RAMP);

    // ATTACHMENT: slow drone grows, won't let go
    _attachGain.gain.setTargetAtTime(
      surrendering ? 0 : attachRich * 0.09 + attachStr * 0.11, now, RAMP);

    // ZERO STATE: clean sine when everything released
    _zeroGain.gain.setTargetAtTime(
      (!surrendering && allZero) ? 0.055 : 0, now, RAMP);

    // SURRENDER TONE: track progress through the 14-second fade
    if (surrendering) {
      if (!_sndSurrendering) { _sndSurrendering = true; _sndSurrStart = now; }
      const p = Math.min((now - _sndSurrStart) / SURR_DURATION, 1);
      // Bell curve: swell in, sustain, fade out
      const g = p < 0.25 ? (p / 0.25) * 0.065
              : p < 0.75 ? 0.065
              : ((1 - p) / 0.25) * 0.065;
      _surrGain.gain.setTargetAtTime(g, now, 0.6);
    } else {
      _sndSurrendering = false;
      _surrGain.gain.setTargetAtTime(0, now, RAMP);
    }
  }

  setTimeout(_runUpdateLoop, 80);
}

// ── TOGGLE ───────────────────────────────────────────────────────────────────
const _sBtn = document.getElementById("sound-btn");
const _iMute = document.getElementById("icon-mute");
const _iOn = document.getElementById("icon-on");

if (_sBtn) _sBtn.addEventListener("click", () => {
  _initAudio();
  if (_ctx.state === 'suspended') _ctx.resume();
  _soundOn = !_soundOn;
  if (_soundOn) {
    _masterGain.gain.cancelScheduledValues(_ctx.currentTime);
    _masterGain.gain.setValueAtTime(_masterGain.gain.value, _ctx.currentTime);
    _masterGain.gain.linearRampToValueAtTime(1, _ctx.currentTime + 1.8);
    _sBtn.classList.add('on');
    _iMute.style.display = 'none'; _iOn.style.display = '';
  } else {
    _masterGain.gain.cancelScheduledValues(_ctx.currentTime);
    _masterGain.gain.setValueAtTime(_masterGain.gain.value, _ctx.currentTime);
    _masterGain.gain.linearRampToValueAtTime(0, _ctx.currentTime + 1.2);
    _sBtn.classList.remove('on');
    _iMute.style.display = ''; _iOn.style.display = 'none';
  }
});
