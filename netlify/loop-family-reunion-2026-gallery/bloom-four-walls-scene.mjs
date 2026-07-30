/**
 * Bloom / Release — four-wall room for Loop Gallery (Family Reunion).
 * Garden blooms on wall textures; visitor frames hang as meshes in front of walls.
 */
export function createBloomFourWallsScene(opts = {}) {
  const THREE = window.THREE;
  if (!THREE) throw new Error('THREE required on window');

  const ROOM = 10;
  const HALF = 5;
  const COLS = 4;
  const ROWS = 2;
  const CELL_W = ROOM / COLS;
  const CELL_H = ROOM / ROWS;
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
    constructor(rng) {
      this.x = rng.range(0, PAN_W);
      this.y = rng.range(PAN_H * 0.08, PAN_H * 0.92);
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

  const TOTAL_BLOOMS = 22;
  const SPAWN_INTERVAL = 1800;
  const HOLD_AFTER_FULL = 8000;
  const TOTAL_LIFE = TOTAL_BLOOMS * SPAWN_INTERVAL + HOLD_AFTER_FULL + 30000;

  const panCanvas = document.createElement('canvas');
  panCanvas.width = PAN_W;
  panCanvas.height = PAN_H;
  const panCtx = panCanvas.getContext('2d');

  const rng = new Rand(Date.now() % 99991);
  let blooms = [];
  let spawnCount = 0;
  let nextSpawn = 600;
  let gardenFull = false;
  let fullAt = -1;
  let dyingStarted = false;
  let startTime = null;
  let lifePct = 0;

  function gardenReset(t) {
    blooms = [];
    spawnCount = 0;
    nextSpawn = t + 600;
    gardenFull = false;
    fullAt = -1;
    dyingStarted = false;
    startTime = t;
  }

  function gardenUpdate(t, dt) {
    if (!startTime) startTime = t;
    const elapsed = t - startTime;
    if (spawnCount < TOTAL_BLOOMS && t > nextSpawn) {
      blooms.push(new Bloom(rng));
      spawnCount += 1;
      nextSpawn = t + SPAWN_INTERVAL;
      if (spawnCount === TOTAL_BLOOMS) { gardenFull = true; fullAt = t; }
    }
    if (gardenFull && !dyingStarted && t > fullAt + HOLD_AFTER_FULL) {
      dyingStarted = true;
      [...blooms].reverse().forEach((b, i) => {
        setTimeout(() => b.startDying(), i * 600);
      });
    }
    blooms.forEach((b) => b.update(dt));
    if (dyingStarted && blooms.every((b) => b.dead)) gardenReset(t);
    lifePct = Math.min(elapsed / TOTAL_LIFE * 100, 100);
  }

  function gardenDraw(t) {
    panCtx.clearRect(0, 0, PAN_W, PAN_H);
    panCtx.fillStyle = '#ffffff';
    panCtx.fillRect(0, 0, PAN_W, PAN_H);
    [...blooms].sort((a, b) => b.maxR - a.maxR).forEach((b) => b.draw(panCtx, t));
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
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
  let lastX = 0;
  let lastY = 0;
  let autoRotate = true;
  let running = true;
  let lastT = null;
  const keys = { forward: false, back: false, left: false, right: false };

  const wallCounterEl = opts.wallCounterEl || null;
  const lifebarEl = opts.lifebarEl || null;

  function updateWallLabel() {
    if (!wallCounterEl) return;
    const n = ((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const labels = ['North', 'West', 'South', 'East'];
    const idx = Math.round(n / (Math.PI / 2)) % 4;
    wallCounterEl.textContent = `Wall ${idx + 1} · ${labels[idx]}`;
  }

  function onPointerDown(e) {
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

  renderer.domElement.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('mousemove', onPointerMove);
  renderer.domElement.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    dragging = true;
    lastX = t.clientX;
    lastY = t.clientY;
    autoRotate = false;
  }, { passive: true });
  window.addEventListener('touchend', onPointerUp);
  window.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    yaw -= (t.clientX - lastX) * 0.003;
    pitch = Math.max(-1.1, Math.min(1.1, pitch - (t.clientY - lastY) * 0.003));
    lastX = t.clientX;
    lastY = t.clientY;
  }, { passive: true });

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

  function findNextEmpty(occupied) {
    const rowOrder = ROWS > 1 ? [1, 0] : [0];
    const colOrder = COLS > 2 ? [1, 2, 0, 3] : [...Array(COLS).keys()];
    for (const wall of WALL_ORDER) {
      for (const row of rowOrder) {
        for (const col of colOrder) {
          const slotId = slotIdForCell(wall, col, row);
          if (!occupied.has(slotId)) {
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
      frameMaxW: CELL_W * 0.88,
      frameMaxH: CELL_H * 0.88,
      frameMinH: CELL_H * 0.35,
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

  function zoomBy(factor) {
    camera.fov = Math.max(35, Math.min(95, camera.fov * factor));
    camera.updateProjectionMatrix();
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

    if (autoRotate) yaw += 0.0003;

    gardenUpdate(t, dt);
    gardenDraw(t);
    panTex.needsUpdate = true;
    wallTextures.forEach((tex) => { tex.needsUpdate = true; });

    if (lifebarEl) lifebarEl.style.width = `${lifePct.toFixed(2)}%`;

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
    layout: { ROOM, COLS, ROWS, CELL_W, CELL_H, WALL_ORDER },
  };
}
