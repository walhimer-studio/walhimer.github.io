/**
 * Bloom / Release — four-wall room for Loop Gallery (Family Reunion).
 * Garden blooms on wall textures; visitor frames hang as meshes in front of walls.
 * Co-Create Machine DNA: seed, lifeline, garden arc, DNA notes per bloom.
 */
import {
  GARDEN,
  createCoCreateMachineDna,
  shuffleNotePool,
  formatMachineDnaLine,
} from './co-create-machine-dna.mjs';
import { createBloomPentatonicPiano } from './bloom-pentatonic-piano.mjs';

export function createBloomFourWallsScene(opts = {}) {
  const THREE = window.THREE;
  if (!THREE) throw new Error('THREE required on window');

  const BASE_ROOM = 10;
  const ROOM = BASE_ROOM * 5;
  const HALF = ROOM / 2;
  const BLOOMS_ENABLED = opts.bloomsEnabled !== false;
  const COLS = 4;
  const ROWS = 4;
  const CELL_W = ROOM / COLS;
  const CELL_H = ROOM / ROWS;
  const FRAME_CELL_W = BASE_ROOM / COLS;
  const FRAME_CELL_H = BASE_ROOM / ROWS;
  const PAN_W = 4096;
  const PAN_H = 1024;
  const WALL_ORDER = ['N', 'E', 'S', 'W'];

  const WALL_DEFS = {
    N: { pos: [0, 0, -HALF], rotY: 0, slice: 0, label: 'North', side: 'L' },
    E: { pos: [HALF, 0, 0], rotY: -Math.PI / 2, slice: 1, label: 'East', side: 'R' },
    S: { pos: [0, 0, HALF], rotY: Math.PI, slice: 2, label: 'South', side: 'R' },
    W: { pos: [-HALF, 0, 0], rotY: Math.PI / 2, slice: 3, label: 'West', side: 'L' },
  };

  class Rand {
    constructor(seed) { this.s = Math.abs(seed) + 1; }
    next() { const x = Math.sin(this.s++) * 10000; return x - Math.floor(x); }
    range(a, b) { return a + this.next() * (b - a); }
  }

  function hsbToRgb(h, s, b) {
    s /= 100; b /= 100;
    const k = (n) => (n + h / 60) % 6;
    const f = (n) => b - b * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
    return [f(5), f(3), f(1)];
  }

  function rgbaStr(rgb, a) {
    return `rgba(${(rgb[0] * 255) | 0},${(rgb[1] * 255) | 0},${(rgb[2] * 255) | 0},${a.toFixed(3)})`;
  }

  class Bloom {
    constructor(rng, note) {
      this.x = rng.range(0, PAN_W);
      this.y = rng.range(PAN_H * 0.08, PAN_H * 0.92);
      this.note = note;
      const h0 = rng.range(0, 360);
      this.c1 = hsbToRgb(h0, rng.range(80, 100), 100);
      this.c2 = hsbToRgb((h0 + rng.range(30, 80)) % 360, rng.range(70, 95), 100);
      this.c3 = hsbToRgb((h0 + rng.range(140, 200)) % 360, rng.range(60, 85), 95);
      this.maxR = rng.range(80, 220);
      this.layerCount = Math.floor(rng.range(4, 8));
      this.layers = Array.from({ length: this.layerCount }, (_, i) => ({
        dx: rng.range(-12, 12),
        dy: rng.range(-12, 12),
        rScale: 1.0 - i * (0.38 / this.layerCount),
        alpha: 0.35 - i * (0.06 / this.layerCount),
      }));
      this.breathAmp = rng.range(0.05, 0.10);
      this.breathSpeed = rng.range(0.6, 1.5);
      this.breathPhase = rng.range(0, Math.PI * 2);
      this.growSpeed = rng.range(0.018, 0.038);
      this.currentR = 0;
      this.growing = true;
      this.dying = false;
      this.fadeAlpha = 1.0;
      this.fadeSpeed = rng.range(0.0008, 0.002);
      this.dead = false;
    }
    update(dt) {
      if (this.growing) {
        this.currentR += this.maxR * this.growSpeed * (dt / 16.67);
        if (this.currentR >= this.maxR) { this.currentR = this.maxR; this.growing = false; }
      }
      if (this.dying) {
        this.fadeAlpha -= this.fadeSpeed * (dt / 16.67);
        if (this.fadeAlpha <= 0) this.dead = true;
      }
    }
    startDying() { this.dying = true; }
    draw(ctx, t) {
      if (this.dead) return;
      const breath = 1.0 + this.breathAmp * Math.sin(t * 0.001 * this.breathSpeed + this.breathPhase);
      const r = this.currentR * (this.growing ? 1.0 : breath);
      if (r < 1) return;
      const offsets = [0];
      if (this.x - r < 0) offsets.push(PAN_W);
      if (this.x + r > PAN_W) offsets.push(-PAN_W);
      for (const ox of offsets) {
        for (const L of this.layers) {
          const cx = this.x + ox + L.dx * (r / this.maxR);
          const cy = this.y + L.dy * (r / this.maxR);
          const lr = r * L.rScale;
          const la = L.alpha * this.fadeAlpha;
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, lr);
          grad.addColorStop(0.0, rgbaStr(this.c1, la * 0.95));
          grad.addColorStop(0.3, rgbaStr(this.c2, la * 0.60));
          grad.addColorStop(0.7, rgbaStr(this.c3, la * 0.28));
          grad.addColorStop(1.0, rgbaStr(this.c3, 0));
          ctx.beginPath();
          ctx.arc(cx, cy, lr, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }
    }
  }

  const GARDEN_CFG = opts.gardenConfig ?? GARDEN;
  const TOTAL_BLOOMS = GARDEN_CFG.TOTAL_BLOOMS;
  const SPAWN_INTERVAL = GARDEN_CFG.SPAWN_INTERVAL;
  const HOLD_AFTER_FULL = GARDEN_CFG.HOLD_AFTER_FULL;
  const FADE_TAIL_MS = GARDEN_CFG.FADE_TAIL_MS;
  const TOTAL_LIFE = opts.showDurationMs
    ?? (TOTAL_BLOOMS * SPAWN_INTERVAL + HOLD_AFTER_FULL + FADE_TAIL_MS);
  const FIRST_SPAWN_MS = 600;
  const DIE_STAGGER_MS = 600;
  const AUTO_ROTATE_RATE = 0.0003;

  function spawnCountAt(cycleElapsed) {
    if (cycleElapsed < FIRST_SPAWN_MS) return 0;
    return Math.min(TOTAL_BLOOMS, Math.floor((cycleElapsed - FIRST_SPAWN_MS) / SPAWN_INTERVAL) + 1);
  }

  function dieStartAt() {
    return FIRST_SPAWN_MS + (TOTAL_BLOOMS - 1) * SPAWN_INTERVAL + HOLD_AFTER_FULL;
  }

  function applyBloomTimeline(bloom, ageMs, cycleElapsed, index, totalCount) {
    const growMs = Math.max(400, (1 / bloom.growSpeed) * 16.67 * 0.85);
    if (ageMs < growMs) {
      bloom.currentR = bloom.maxR * Math.max(0, ageMs / growMs);
      bloom.growing = true;
    } else {
      bloom.currentR = bloom.maxR;
      bloom.growing = false;
    }
    const dieStart = dieStartAt();
    if (totalCount >= TOTAL_BLOOMS && cycleElapsed >= dieStart) {
      const reverseIdx = totalCount - 1 - index;
      const myDieStart = dieStart + reverseIdx * DIE_STAGGER_MS;
      if (cycleElapsed >= myDieStart) {
        bloom.dying = true;
        bloom.growing = false;
        const dieAge = cycleElapsed - myDieStart;
        bloom.fadeAlpha = Math.max(0, 1 - dieAge * bloom.fadeSpeed / 16.67);
        if (bloom.fadeAlpha <= 0) bloom.dead = true;
      }
    }
  }

  function playBloomSpawnNote(index) {
    const note = noteAssignments[index];
    if (!note) return;
    void ensurePiano().then(() => {
      piano.playNote(note, 0.22 + Math.random() * 0.1);
    });
  }

  function playBloomDieNotes(totalCount) {
    void ensurePiano().then(() => {
      for (let i = 0; i < totalCount; i += 1) {
        const note = noteAssignments[totalCount - 1 - i];
        if (!note) continue;
        setTimeout(() => {
          piano.playNote(note, 0.14 + Math.random() * 0.08);
        }, i * DIE_STAGGER_MS);
      }
    });
  }

  const panCanvas = document.createElement('canvas');
  panCanvas.width = PAN_W;
  panCanvas.height = PAN_H;
  const panCtx = panCanvas.getContext('2d');

  const machineDna = createCoCreateMachineDna({
    seed: opts.seed,
    label: opts.dnaLabel ?? 'co-create',
    lifespanSeconds: TOTAL_LIFE / 1000,
  });
  const piano = opts.piano ?? createBloomPentatonicPiano({ baseUrl: opts.pianoSampleBase ?? './samples/' });
  let pianoLoadPromise = null;
  function ensurePiano() {
    if (!pianoLoadPromise) pianoLoadPromise = piano.loadAudio(opts.onPianoLoadProgress);
    return pianoLoadPromise;
  }
  const rng = new Rand(machineDna.seed);
  let noteAssignments = shuffleNotePool(rng);
  let blooms = [];
  let spawnCount = 0;
  let nextSpawn = 600;
  let gardenFull = false;
  let fullAt = -1;
  let dyingStarted = false;
  let startTime = null;
  let lifePct = 0;
  let syncedCycleIndex = -1;
  let lastDerivedSpawnCount = 0;
  let lastDyingTriggered = false;
  let gardenSyncInitialized = false;
  let lastSyncedCycleIndex = -1;
  let cycleBloomProtos = { cycleIndex: -1, protos: [] };

  function cloneBloomVisual(src) {
    const bloom = Object.create(Bloom.prototype);
    Object.assign(bloom, src, {
      layers: src.layers.map((l) => ({ ...l })),
      c1: [...src.c1],
      c2: [...src.c2],
      c3: [...src.c3],
      currentR: 0,
      growing: true,
      dying: false,
      fadeAlpha: 1,
      dead: false,
    });
    return bloom;
  }

  function ensureCycleBloomProtos(cycleIndex) {
    if (cycleBloomProtos.cycleIndex === cycleIndex) return;
    const baseRng = new Rand(machineDna.seed);
    let assignments = shuffleNotePool(baseRng);
    for (let c = 0; c < cycleIndex; c += 1) {
      for (let i = 0; i < TOTAL_BLOOMS; i += 1) {
        new Bloom(baseRng, assignments[i]);
      }
      assignments = shuffleNotePool(baseRng);
    }
    const protos = [];
    for (let i = 0; i < TOTAL_BLOOMS; i += 1) {
      protos.push(new Bloom(baseRng, assignments[i]));
    }
    noteAssignments = assignments;
    rng.s = baseRng.s;
    cycleBloomProtos = { cycleIndex, protos };
  }

  function syncMachineDnaCycle(cycleIndex) {
    let gen = machineDna.express().generation;
    while (gen < cycleIndex) {
      machineDna.onGardenCycleComplete();
      gen += 1;
    }
  }

  function prepareSyncedCycle(cycleIndex) {
    if (cycleIndex === syncedCycleIndex) return;
    ensureCycleBloomProtos(cycleIndex);
    syncedCycleIndex = cycleIndex;
    syncMachineDnaCycle(cycleIndex);
  }

  function rebuildBloomsForElapsed(cycleElapsed, count, cycleIndex) {
    ensureCycleBloomProtos(cycleIndex);
    const next = [];
    for (let i = 0; i < count; i += 1) {
      const spawnAt = FIRST_SPAWN_MS + i * SPAWN_INTERVAL;
      const bloom = cloneBloomVisual(cycleBloomProtos.protos[i]);
      applyBloomTimeline(bloom, cycleElapsed - spawnAt, cycleElapsed, i, count);
      if (!bloom.dead) next.push(bloom);
    }
    blooms = next;
    spawnCount = count;
    gardenFull = count >= TOTAL_BLOOMS;
    fullAt = gardenFull ? FIRST_SPAWN_MS + (TOTAL_BLOOMS - 1) * SPAWN_INTERVAL : -1;
    dyingStarted = count >= TOTAL_BLOOMS && cycleElapsed >= dieStartAt();
  }

  function gardenReset(t) {
    blooms = [];
    spawnCount = 0;
    nextSpawn = t + FIRST_SPAWN_MS;
    gardenFull = false;
    fullAt = -1;
    dyingStarted = false;
    startTime = t;
    noteAssignments = shuffleNotePool(rng);
    machineDna.onGardenCycleComplete();
    syncedCycleIndex = -1;
    lastDerivedSpawnCount = 0;
    lastDyingTriggered = false;
  }

  function gardenUpdateSynced(elapsedMs, t, dt) {
    const cycleIndex = Math.floor(elapsedMs / TOTAL_LIFE);
    const cycleElapsed = elapsedMs % TOTAL_LIFE;
    prepareSyncedCycle(cycleIndex);
    const count = spawnCountAt(cycleElapsed);
    const dieStart = dieStartAt();

    if (!gardenSyncInitialized) {
      lastDerivedSpawnCount = count;
      lastDyingTriggered = count >= TOTAL_BLOOMS && cycleElapsed >= dieStart;
      gardenSyncInitialized = true;
      lastSyncedCycleIndex = cycleIndex;
    } else {
      if (cycleIndex !== lastSyncedCycleIndex) {
        lastDerivedSpawnCount = 0;
        lastDyingTriggered = false;
        lastSyncedCycleIndex = cycleIndex;
      }
      if (count > lastDerivedSpawnCount) {
        for (let i = lastDerivedSpawnCount; i < count; i += 1) playBloomSpawnNote(i);
      }
      if (count >= TOTAL_BLOOMS && cycleElapsed >= dieStart && !lastDyingTriggered) {
        lastDyingTriggered = true;
        playBloomDieNotes(count);
      }
      lastDerivedSpawnCount = count;
    }

    rebuildBloomsForElapsed(cycleElapsed, count, cycleIndex);
    blooms.forEach((b) => {
      if (!b.dead && !b.dying) b.update(dt);
      else if (b.dying) b.update(dt);
    });

    lifePct = Math.min(cycleElapsed / TOTAL_LIFE * 100, 100);
    machineDna.syncGardenAge(cycleElapsed / 1000);
    machineDna.update(dt / 1000, { scarLoad: opts.getScarLoad?.() ?? 0 });
  }

  function gardenUpdateLocal(t, dt) {
    if (!startTime) startTime = t;
    const elapsed = t - startTime;
    if (BLOOMS_ENABLED) {
      if (spawnCount < TOTAL_BLOOMS && t > nextSpawn) {
        const bloom = new Bloom(rng, noteAssignments[spawnCount]);
        blooms.push(bloom);
        playBloomSpawnNote(spawnCount);
        spawnCount += 1;
        nextSpawn = t + SPAWN_INTERVAL;
        if (spawnCount === TOTAL_BLOOMS) { gardenFull = true; fullAt = t; }
      }
      if (gardenFull && !dyingStarted && t > fullAt + HOLD_AFTER_FULL) {
        dyingStarted = true;
        playBloomDieNotes(blooms.length);
        [...blooms].reverse().forEach((b, i) => {
          setTimeout(() => { b.startDying(); }, i * DIE_STAGGER_MS);
        });
      }
      blooms.forEach((b) => b.update(dt));
      if (dyingStarted && blooms.every((b) => b.dead)) gardenReset(t);
    } else if (elapsed >= TOTAL_LIFE) {
      gardenReset(t);
    }
    lifePct = Math.min(elapsed / TOTAL_LIFE * 100, 100);
    machineDna.syncGardenAge(elapsed / 1000);
    machineDna.update(dt / 1000, { scarLoad: opts.getScarLoad?.() ?? 0 });
  }

  function gardenUpdate(t, dt) {
    const syncedElapsed = opts.getGardenElapsedMs?.();
    const syncedNow = syncedElapsed != null;
    if (syncedNow && !gardenUpdate._wasSynced) {
      gardenSyncInitialized = false;
      syncedCycleIndex = -1;
      lastSyncedCycleIndex = -1;
      cycleBloomProtos = { cycleIndex: -1, protos: [] };
    }
    gardenUpdate._wasSynced = syncedNow;
    if (syncedNow) {
      gardenUpdateSynced(syncedElapsed, t, dt);
      return;
    }
    gardenUpdateLocal(t, dt);
  }

  function gardenDraw(t) {
    panCtx.clearRect(0, 0, PAN_W, PAN_H);
    panCtx.fillStyle = '#ffffff';
    panCtx.fillRect(0, 0, PAN_W, PAN_H);
    if (BLOOMS_ENABLED) {
      [...blooms].sort((a, b) => b.maxR - a.maxR).forEach((b) => b.draw(panCtx, t));
    }
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(
    opts.fieldOfView ?? 82,
    window.innerWidth / window.innerHeight,
    0.1,
    ROOM * 4
  );
  camera.position.set(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 1);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.cursor = 'grab';
  renderer.domElement.tabIndex = 0;

  const host = opts.insertBefore?.parentElement || document.body;
  if (opts.insertBefore) host.insertBefore(renderer.domElement, opts.insertBefore);
  else host.appendChild(renderer.domElement);

  const panTex = new THREE.CanvasTexture(panCanvas);
  panTex.generateMipmaps = false;
  panTex.minFilter = THREE.LinearFilter;

  const wallTextures = WALL_ORDER.map((key) => {
    const def = WALL_DEFS[key];
    const tex = panTex.clone();
    tex.needsUpdate = true;
    tex.repeat.set(0.25, 1);
    tex.offset.set(def.slice * 0.25, 0);
    return tex;
  });

  const wallMeshes = {};
  WALL_ORDER.forEach((key, i) => {
    const def = WALL_DEFS[key];
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM, ROOM),
      new THREE.MeshBasicMaterial({ map: wallTextures[i] })
    );
    mesh.position.set(...def.pos);
    mesh.rotation.y = def.rotY;
    mesh.renderOrder = 0;
    wallMeshes[key] = mesh;
    scene.add(mesh);
  });

  [[0xf3f3f1, -Math.PI / 2, -HALF], [0xfafaf8, Math.PI / 2, HALF]].forEach(([col, rx, y]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM, ROOM),
      new THREE.MeshBasicMaterial({ color: col })
    );
    m.rotation.x = rx;
    m.position.y = y;
    scene.add(m);
  });

  let yaw = 0;
  let pitch = 0;
  let dragging = false;
  let pinchActive = false;
  let pinchStartDist = 0;
  let lastX = 0;
  let lastY = 0;
  let autoRotate = true;
  let running = true;
  let lastT = null;
  let revolutionAccum = 0;
  let revolutionCallback = null;
  const keys = { forward: false, back: false, left: false, right: false };
  const MAX_VIEW_DIST = HALF - (opts.maxViewInset ?? 0.12);
  const PINCH_GAIN = opts.pinchGain ?? 0.085;
  const ZOOM_STEP = opts.zoomStep ?? 14;

  const wallCounterEl = opts.wallCounterEl || null;
  const lifebarEl = opts.lifebarEl || null;
  const machineDnaEl = opts.machineDnaEl || null;

  function updateWallLabel() {
    if (!wallCounterEl) return;
    const n = ((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const labels = ['North', 'West', 'South', 'East'];
    const idx = Math.round(n / (Math.PI / 2)) % 4;
    wallCounterEl.textContent = `Wall ${idx + 1} · ${labels[idx]}`;
  }

  function onPointerDown(e) {
    void ensurePiano();
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    autoRotate = false;
    renderer.domElement.style.cursor = 'grabbing';
  }

  function onPointerUp() {
    dragging = false;
    renderer.domElement.style.cursor = 'grab';
  }

  function onPointerMove(e) {
    if (!dragging) return;
    yaw -= (e.clientX - lastX) * 0.003;
    pitch = Math.max(-1.1, Math.min(1.1, pitch - (e.clientY - lastY) * 0.003));
    lastX = e.clientX;
    lastY = e.clientY;
  }

  function touchSpan(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  renderer.domElement.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('mousemove', onPointerMove);
  renderer.domElement.addEventListener('touchstart', (e) => {
    void ensurePiano();
    autoRotate = false;
    if (e.touches.length >= 2) {
      dragging = false;
      pinchActive = true;
      pinchStartDist = touchSpan(e.touches);
      if (e.cancelable) e.preventDefault();
      return;
    }
    pinchActive = false;
    const t = e.touches[0];
    dragging = true;
    lastX = t.clientX;
    lastY = t.clientY;
  }, { passive: false });
  window.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
      dragging = false;
      pinchActive = false;
      return;
    }
    if (e.touches.length === 1) {
      pinchActive = false;
      dragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  });
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length >= 2 && pinchActive) {
      const dist = touchSpan(e.touches);
      nudgeView((dist - pinchStartDist) * PINCH_GAIN);
      pinchStartDist = dist;
      if (e.cancelable) e.preventDefault();
      return;
    }
    if (!dragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    yaw -= (t.clientX - lastX) * 0.003;
    pitch = Math.max(-1.1, Math.min(1.1, pitch - (t.clientY - lastY) * 0.003));
    lastX = t.clientX;
    lastY = t.clientY;
  }, { passive: false });

  function nudgeView(delta) {
    if (!delta) return;
    autoRotate = false;
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    camera.position.addScaledVector(forward, delta);
    const len = camera.position.length();
    if (len > MAX_VIEW_DIST) camera.position.multiplyScalar(MAX_VIEW_DIST / len);
  }

  function onWheel(e) {
    e.preventDefault();
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= window.innerHeight;
    const scale = e.ctrlKey ? 0.0025 : 0.055;
    nudgeView(-dy * scale);
  }

  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize);

  const FRAME_INSET = 0.38;
  const wallAnchor = new THREE.Object3D();

  function cellLocal(wall, col, row) {
    return {
      lx: -ROOM / 2 + (col + 0.5) * CELL_W,
      ly: -ROOM / 2 + (row + 0.5) * CELL_H,
      lz: FRAME_INSET,
      wall,
      col,
      row,
      side: WALL_DEFS[wall].side,
    };
  }

  function cellTransform(wall, col, row) {
    const def = WALL_DEFS[wall];
    const { lx, ly, lz } = cellLocal(wall, col, row);
    wallAnchor.position.set(...def.pos);
    wallAnchor.rotation.set(0, def.rotY, 0);
    wallAnchor.updateMatrixWorld(true);
    const local = new THREE.Vector3(lx, ly, lz);
    const position = local.applyMatrix4(wallAnchor.matrixWorld);
    return { position, rotY: def.rotY, wall, col, row, side: def.side };
  }

  function cellCenter(wall, col, row) {
    return cellTransform(wall, col, row);
  }

  function slotIdForCell(wall, col, row) {
    return `${wall}-${col}-${row}`;
  }

  function worldZForCell(wall, col, row) {
    const wallIndex = WALL_ORDER.indexOf(wall);
    return wallIndex * 100 + col * 10 + row;
  }

  function cellTaken(occupied, wall, col, row) {
    for (const entry of occupied.values()) {
      if (entry.wall === wall && entry.col === col && entry.row === row) return true;
      const m = /^([NESW])-(\d+)-(\d+)(?:-.*)?$/.exec(entry.slotId || '');
      if (m && m[1] === wall && +m[2] === col && +m[3] === row) return true;
    }
    return false;
  }

  function rowFillOrder(count) {
    if (count <= 1) return [0];
    if (count === 2) return [1, 0];
    const order = [];
    let a = Math.floor((count - 1) / 2);
    let b = a + 1;
    while (order.length < count) {
      if (a >= 0 && !order.includes(a)) order.push(a--);
      if (order.length >= count) break;
      if (b < count && !order.includes(b)) order.push(b++);
    }
    return order;
  }

  function findNextEmpty(occupied) {
    const rowOrder = rowFillOrder(ROWS);
    const colOrder = COLS > 2 ? [1, 2, 0, 3] : [...Array(COLS).keys()];
    for (const wall of WALL_ORDER) {
      for (const row of rowOrder) {
        for (const col of colOrder) {
          const slotId = slotIdForCell(wall, col, row);
          if (!occupied.has(slotId) && !cellTaken(occupied, wall, col, row)) {
            return {
              slotId,
              wall,
              col,
              row,
              side: WALL_DEFS[wall].side,
              worldZ: worldZForCell(wall, col, row),
            };
          }
        }
      }
    }
    return null;
  }

  function maxFrameSize() {
    return {
      frameMaxW: FRAME_CELL_W * 0.88,
      frameMaxH: FRAME_CELL_H * 0.88,
      frameMinH: FRAME_CELL_H * 0.35,
    };
  }

  function setMoveKey(name, on) {
    if (name in keys) keys[name] = on;
  }

  function getViewPan() {
    return { yaw, pitch };
  }

  function focusCell(wall, col, row) {
    const def = WALL_DEFS[wall];
    // Face the wall (rotY is the wall mesh rotation; camera yaw matches it).
    yaw = def.rotY;
    pitch = 0;
    autoRotate = false;
  }

  function startRevolution(onComplete) {
    autoRotate = true;
    revolutionAccum = 0;
    revolutionCallback = onComplete ?? null;
  }

  function zoomBy(factor) {
    nudgeView((1 - factor) * ZOOM_STEP);
  }

  function tick(t) {
    requestAnimationFrame(tick);
    if (!running) return;
    const dt = lastT ? Math.min(t - lastT, 50) : 16.67;
    lastT = t;

    const step = 0.012;
    if (keys.forward) pitch = Math.max(-1.1, pitch - step);
    if (keys.back) pitch = Math.min(1.1, pitch + step);
    if (keys.left) yaw += step;
    if (keys.right) yaw -= step;

    if (autoRotate) {
      yaw += AUTO_ROTATE_RATE;
      if (revolutionCallback) {
        revolutionAccum += AUTO_ROTATE_RATE;
        if (revolutionAccum >= Math.PI * 2) {
          const done = revolutionCallback;
          revolutionCallback = null;
          done();
        }
      }
    }

    gardenUpdate(t, dt);
    gardenDraw(t);
    panTex.needsUpdate = true;
    wallTextures.forEach((tex) => { tex.needsUpdate = true; });

    if (opts.getShowLifePct) {
      lifePct = opts.getShowLifePct();
    }
    if (lifebarEl) lifebarEl.style.width = `${lifePct.toFixed(2)}%`;
    if (opts.lifebarLabelEl && opts.getShowLifebarLabel) {
      opts.lifebarLabelEl.textContent = opts.getShowLifebarLabel();
    }
    if (machineDnaEl) {
      machineDnaEl.textContent = formatMachineDnaLine(machineDna.express(), lifePct);
    }

    const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const qP = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
    camera.quaternion.copy(qY.multiply(qP));
    updateWallLabel();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);

  return {
    getScene: () => scene,
    getCanvas: () => renderer.domElement,
    getCamera: () => camera,
    getWallMesh: (wall) => wallMeshes[wall],
    setMoveKey,
    getViewPan,
    focusCell,
    zoomBy,
    findNextEmpty,
    cellCenter,
    cellLocal,
    cellTransform,
    maxFrameSize,
    slotIdForCell,
    layout: { ROOM, BASE_ROOM, COLS, ROWS, CELL_W, CELL_H, FRAME_CELL_W, FRAME_CELL_H, WALL_ORDER },
    getMachineDna: () => machineDna.express(),
    getGardenLifePct: () => lifePct,
    getBlooms: () => blooms.map((b) => ({ note: b.note, dead: b.dead })),
    getPiano: () => piano,
    ensurePiano,
    startRevolution,
  };
}
