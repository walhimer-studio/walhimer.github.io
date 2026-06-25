import { createOrganism, LIFE_STAGE } from './emergent-dna-kernel.mjs';
import {
  WireBuilder,
  drawMachine,
  machineProfile,
  makeRng,
  DEFAULT_HORIZONTAL_GEAR_COUNT,
  DEFAULT_VERTICAL_GEAR_COUNT,
  PIVOT_X,
  PIVOT_Y,
  PIVOT_Z,
} from './actz-wire-machine.mjs?v=life300';

const THREE = globalThis.THREE;

export const ACTZ_EDITION_SEED = 1909113409;
const LIFESPAN_SECONDS = 300;
const SURRENDER_SECONDS = 14;
const GRAVITY_PULL = 2.8;
const GRAVITY_RAMP = 0.022;
const GRAVITY_MAX = 1.0;
const GRAVITY_CYCLE = Math.PI / GRAVITY_RAMP;
const STRETCH_MAX = 1.55;
const SMEAR_MAX = 0.014;
const TEAR_PULL = 1.15;

const GRAVITY_SMEAR_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    pullX: { value: 0.0 },
    pullY: { value: 0.0 },
    pullZ: { value: 0.0 },
  },
  vertexShader: [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}',
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
    '}',
  ].join('\n'),
};

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function createAudioHum() {
  let ctx = null;
  let osc = null;
  let gain = null;

  return {
    start() {
      if (ctx) return;
      ctx = new AudioContext();
      osc = ctx.createOscillator();
      gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 432;
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
    },
    setLevel(vitality, surrenderK) {
      if (!ctx || !gain) return;
      const target = Math.max(0, Math.min(0.12, vitality * 0.1 * (1 - surrenderK * 0.95)));
      gain.gain.setTargetAtTime(target, ctx.currentTime, 0.08);
      osc.frequency.setTargetAtTime(432 * (0.85 + vitality * 0.15), ctx.currentTime, 0.12);
    },
  };
}

function boot() {
  if (!globalThis.THREE) {
    const el = document.getElementById('hint');
    if (el) el.textContent = 'Three.js failed to load — hard refresh (Cmd+Shift+R)';
    return;
  }

  const lifelineFill = document.getElementById('lifeline-fill');
  const dnaPanel = document.getElementById('dna-panel');
  const hint = document.getElementById('hint');
  const hudSeed = document.getElementById('hud-seed');

  const slSpeed = document.getElementById('sl-speed');
  const slLoad = document.getElementById('sl-load');
  const slHorizontal = document.getElementById('sl-horizontal');
  const slVertical = document.getElementById('sl-vertical');
  const slHCount = document.getElementById('sl-h-count');
  const slVCount = document.getElementById('sl-v-count');
  const valSpeed = document.getElementById('val-speed');
  const valLoad = document.getElementById('val-load');
  const valHorizontal = document.getElementById('val-horizontal');
  const valVertical = document.getElementById('val-vertical');
  const valHCount = document.getElementById('val-h-count');
  const valVCount = document.getElementById('val-v-count');
  const btnGravityX = document.getElementById('btn-gravity-x');
  const btnGravityY = document.getElementById('btn-gravity-y');
  const btnGravityZ = document.getElementById('btn-gravity-z');

  let organism = createOrganism({
    seed: ACTZ_EDITION_SEED,
    speciesId: 'surrender-machines',
    label: 'Surrender Machine (seed 1909113409)',
    lifespanSeconds: LIFESPAN_SECONDS,
  });

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xffffff, 1);
  document.body.insertBefore(renderer.domElement, document.body.firstChild);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.05, 200);
  camera.position.set(5.8, 4.2, 6.4);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2.05, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 3;
  controls.maxDistance = 22;

  const machineStretch = new THREE.Group();
  scene.add(machineStretch);

  const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: true,
  });

  const postScene = new THREE.Scene();
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const postMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(GRAVITY_SMEAR_SHADER.uniforms),
    vertexShader: GRAVITY_SMEAR_SHADER.vertexShader,
    fragmentShader: GRAVITY_SMEAR_SHADER.fragmentShader,
  });
  postScene.add(new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), postMaterial));

  let builder;
  let cycleStart = 0;
  let pausedCycleTime = 0;
  let gravityWasActive = true;
  const gravityAxis = { x: false, y: true, z: false };
  let speedMult = 1;
  /** null | 'sigh' | 'dead' */
  let surrenderPhase = null;
  let surrenderElapsed = 0;
  let lastAliveH = 0;
  let lastAliveV = 0;
  const audio = createAudioHum();

  function captureLineOpacities() {
    if (!builder) return;
    builder.staticRoot.traverse((child) => {
      if (child.material?.isLineBasicMaterial && child.material.userData.baseOpacity == null) {
        child.material.userData.baseOpacity = child.material.opacity;
      }
    });
  }

  function buildMachineOnce() {
    if (builder) return;
    builder = new WireBuilder(machineStretch);
    drawMachine(builder, makeRng(ACTZ_EDITION_SEED), machineProfile(ACTZ_EDITION_SEED));
    builder.baseRoot.position.set(0, 0, 0);
    builder.machineRoot.position.set(0, 0, 0);
    machineStretch.scale.set(1, 1, 1);
    machineStretch.position.set(0, 0, 0);
    slHCount.max = String(builder.horizontalGears.length);
    slHCount.value = String(DEFAULT_HORIZONTAL_GEAR_COUNT);
    slVCount.max = String(builder.verticalGears.length);
    slVCount.value = String(DEFAULT_VERTICAL_GEAR_COUNT);
    captureLineOpacities();
    syncGearScales();
  }

  function applyLifeToMachine(snap, lifeVitality) {
    if (!builder) return { aliveH: 0, aliveV: 0, lifeVitality: 0 };

    const maxH = Number(slHCount.value);
    const maxV = Number(slVCount.value);
    const aliveH = lifeVitality <= 0.02 ? 0 : Math.round(maxH * lifeVitality);
    const aliveV = lifeVitality <= 0.02 ? 0 : Math.round(maxV * lifeVitality);
    lastAliveH = aliveH;
    lastAliveV = aliveV;

    const showMachine = aliveH > 0 || aliveV > 0;
    builder.machineRoot.visible = showMachine;
    builder.towerPosts.visible = aliveH > 0;
    builder.horizontalDiscs.visible = aliveH > 0;
    builder.verticalFace.visible = aliveV > 0;
    builder.horizontalGears.forEach((s, i) => { s.pivot.visible = showMachine && i < aliveH; });
    builder.verticalGears.forEach((s, i) => { s.pivot.visible = showMachine && i < aliveV; });

    const ink = 0.15 + 0.85 * lifeVitality;
    builder.staticRoot.traverse((child) => {
      if (child.material?.isLineBasicMaterial) {
        const base = child.material.userData.baseOpacity ?? 1;
        child.material.opacity = base * ink;
        child.material.transparent = child.material.opacity < 0.99;
      }
    });

    const sag = (1 - lifeVitality) * 0.9;
    machineStretch.position.y = -sag;

    return { aliveH, aliveV, lifeVitality };
  }

  function syncGearScales() {
    if (!builder) return;
    const hScale = Number(slHorizontal.value) / 100;
    const vScale = Number(slVertical.value) / 100;
    valHorizontal.textContent = hScale.toFixed(2) + '×';
    valVertical.textContent = vScale.toFixed(2) + '×';
    for (const s of builder.spinners) {
      if (!s.content || !s.gearKind) continue;
      const sc = s.gearKind === 'horizontal' ? hScale : vScale;
      s.content.scale.set(sc, sc, sc);
    }
  }

  function syncControls() {
    speedMult = Number(slSpeed.value) / 100;
    valSpeed.textContent = speedMult.toFixed(1) + '×';
    valLoad.textContent = (Number(slLoad.value) / 100).toFixed(2);
    valHCount.textContent = String(lastAliveH);
    valVCount.textContent = String(lastAliveV);
    syncGearScales();
  }

  for (const el of [slSpeed, slLoad, slHorizontal, slVertical, slHCount, slVCount]) {
    el.addEventListener('input', syncControls);
  }

  function anyGravityOn() {
    return gravityAxis.x || gravityAxis.y || gravityAxis.z;
  }

  function syncGravityPause() {
    const on = anyGravityOn();
    if (on && !gravityWasActive) cycleStart = clock.elapsedTime - pausedCycleTime;
    else if (!on && gravityWasActive) pausedCycleTime = clock.elapsedTime - cycleStart;
    gravityWasActive = on;
  }

  function setGravityAxis(axis, on) {
    gravityAxis[axis] = !!on;
    const btn = axis === 'x' ? btnGravityX : axis === 'y' ? btnGravityY : btnGravityZ;
    btn.setAttribute('aria-pressed', gravityAxis[axis] ? 'true' : 'false');
    syncGravityPause();
  }

  btnGravityX.addEventListener('click', () => setGravityAxis('x', !gravityAxis.x));
  btnGravityY.addEventListener('click', () => setGravityAxis('y', !gravityAxis.y));
  btnGravityZ.addEventListener('click', () => setGravityAxis('z', !gravityAxis.z));

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'h' && e.key !== 'H') return;
    document.body.classList.toggle('controls-hidden');
  });

  renderer.domElement.addEventListener('pointerdown', () => audio.start(), { once: true });

  function updateDnaHud(snap, lifeInfo) {
    const remain = Math.max(0, snap.lifespanSeconds - snap.age);
    const goldCls = snap.flags.recentGold ? ' gold' : '';
    const v = lifeInfo.lifeVitality;
    lifelineFill.style.transform = `scaleX(${Math.max(0, v)})`;
    lifelineFill.style.opacity = String(0.35 + 0.65 * v);

    dnaPanel.innerHTML = [
      `<div>stage <span class="val">${snap.lifeStage}</span></div>`,
      `<div>vitality <span class="val">${v.toFixed(2)}</span></div>`,
      `<div>stress <span class="val">${snap.stress.toFixed(2)}</span></div>`,
      `<div>lifeline <span class="val">${formatTime(remain)}</span></div>`,
      `<div>gears alive <span class="val">${lifeInfo.aliveH}h · ${lifeInfo.aliveV}v</span></div>`,
      `<div>scars <span class="val">${snap.scars.length}</span></div>`,
      snap.flags.recentGold ? `<div class="${goldCls.trim()}">kintsugi gold</div>` : '',
    ].join('');

    hudSeed.textContent = `seed ${snap.seed} · vitality ${v.toFixed(2)} · lifeline`;
  }

  buildMachineOnce();
  const clock = new THREE.Clock();
  cycleStart = clock.elapsedTime;

  function gravityStrength(lifeVitality, surrenderK) {
    if (!anyGravityOn() || surrenderK > 0.5 || lifeVitality < 0.05) return 0;
    const cycleTime = clock.elapsedTime - cycleStart;
    if (cycleTime >= GRAVITY_CYCLE) {
      cycleStart = clock.elapsedTime;
      return 0;
    }
    const t = cycleTime * GRAVITY_RAMP;
    const wave = 0.5 - 0.5 * Math.cos(t);
    return wave * GRAVITY_MAX * lifeVitality;
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    let surrenderK = 0;

    if (surrenderPhase === 'sigh') {
      surrenderElapsed += dt;
      surrenderK = Math.min(1, surrenderElapsed / SURRENDER_SECONDS);
      if (surrenderElapsed >= SURRENDER_SECONDS) {
        surrenderPhase = 'dead';
        surrenderK = 1;
        document.body.classList.add('dead-phase');
        hint.textContent = 'zero state · same machine · mechanical sigh complete';
      }
    } else if (!surrenderPhase) {
      const load = Number(slLoad.value) / 100;
      organism.update(dt, {
        presence: load,
        calm: 1 - load * 0.35,
        stressNudge: load * 0.08,
      });
      const snap = organism.express();
      if (snap.lifeStage === LIFE_STAGE.DEAD || snap.flags.dead) {
        surrenderPhase = 'sigh';
        surrenderElapsed = 0;
        document.body.classList.add('surrender-phase');
        hint.textContent = 'mechanical sigh · vitality draining · same body';
      } else if (snap.flags.breaking) {
        machineStretch.rotation.z = Math.sin(clock.elapsedTime * 24) * 0.012 * snap.stress;
      } else {
        machineStretch.rotation.z *= 0.92;
      }
    }

    const snap = organism.express();
    let lifeVitality = snap.vitality;
    if (surrenderPhase === 'sigh') {
      lifeVitality = snap.vitality * (1 - surrenderK);
    } else if (surrenderPhase === 'dead') {
      lifeVitality = 0;
    }

    const lifeInfo = applyLifeToMachine(snap, lifeVitality);
    updateDnaHud(snap, lifeInfo);
    syncControls();

    audio.setLevel(lifeVitality, surrenderK);

    const g = gravityStrength(lifeVitality, surrenderK);
    const gX = gravityAxis.x ? g : 0;
    const gY = gravityAxis.y ? g : 0;
    const gZ = gravityAxis.z ? g : 0;
    const pullX = gX * gX;
    const pullY = gY * gY;
    const pullZ = gZ * gZ;
    const stretchX = gX * (STRETCH_MAX - 1);
    const stretchY = gY * (STRETCH_MAX - 1);
    const stretchZ = gZ * (STRETCH_MAX - 1);
    const tear = GRAVITY_PULL * TEAR_PULL * lifeVitality;

    const spinScale = lifeVitality * (1 - surrenderK * 0.9);
    machineStretch.scale.set(
      (1 + stretchX) * (0.92 + 0.08 * lifeVitality),
      (1 + stretchY) * (0.92 + 0.08 * lifeVitality),
      (1 + stretchZ) * (0.92 + 0.08 * lifeVitality),
    );

    builder.baseRoot.position.set(
      gravityAxis.x ? -pullX * tear : 0,
      0,
      gravityAxis.z ? -pullZ * tear : 0,
    );
    builder.machineRoot.position.set(
      gravityAxis.x ? pullX * tear : 0,
      0,
      gravityAxis.z ? pullZ * tear : 0,
    );

    for (const s of builder.spinners) {
      if (!s.pivot.visible) continue;
      const d = s.speed * speedMult * spinScale * dt;
      if (s.axis === 'x') s.pivot.rotation.x += d;
      else if (s.axis === 'y') s.pivot.rotation.y += d;
      else s.pivot.rotation.z += d;

      const lift = pullY * s.lift * GRAVITY_PULL * lifeVitality;
      const spreadX = pullX * s.spreadX * GRAVITY_PULL * lifeVitality;
      const spreadZ = pullZ * s.spreadZ * GRAVITY_PULL * lifeVitality;
      s.pivot.position.y = s.homeY + lift;
      s.pivot.position.x = s.homeX + spreadX;
      s.pivot.position.z = s.homeZ + spreadZ;
    }

    controls.update();

    postMaterial.uniforms.pullX.value = gX * SMEAR_MAX * lifeVitality;
    postMaterial.uniforms.pullY.value = gY * SMEAR_MAX * lifeVitality;
    postMaterial.uniforms.pullZ.value = gZ * SMEAR_MAX * 0.92 * lifeVitality;

    renderer.setClearColor(
      surrenderK > 0 ? new THREE.Color(1, 1 - surrenderK * 0.04, 1 - surrenderK * 0.04) : 0xffffff,
      1,
    );

    renderer.setRenderTarget(renderTarget);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    postMaterial.uniforms.tDiffuse.value = renderTarget.texture;
    renderer.render(postScene, postCamera);
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderTarget.setSize(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  }

  window.addEventListener('resize', onResize);
  onResize();
  animate();
}

boot();
