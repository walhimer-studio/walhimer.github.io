/**
 * White wall gallery — OrbitControls zoom / orbit / pan.
 */
export function createWhiteWallScene(opts = {}) {
  const THREE = window.THREE;
  if (!THREE?.OrbitControls) throw new Error('THREE.OrbitControls required (js/OrbitControls.js)');

  const WALL_W = 120;
  const WALL_H = 72;
  const COLS = 8;
  const ROWS = 5;
  const CELL_W = WALL_W / COLS;
  const CELL_H = WALL_H / ROWS;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 0, 88);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.display = 'block';
  renderer.domElement.tabIndex = 0;

  const host = opts.insertBefore?.parentElement || document.body;
  if (opts.insertBefore) host.insertBefore(renderer.domElement, opts.insertBefore);
  else host.appendChild(renderer.domElement);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 140),
    new THREE.MeshBasicMaterial({ color: 0xf7f7f7 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -WALL_H / 2 - 8;
  scene.add(floor);

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(WALL_W, WALL_H),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  scene.add(wall);

  const wallFrame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(WALL_W, WALL_H)),
    new THREE.LineBasicMaterial({ color: 0xdddddd })
  );
  scene.add(wallFrame);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.screenSpacePanning = true;
  controls.minDistance = 28;
  controls.maxDistance = 160;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = Math.PI / 2 + 0.05;
  controls.minAzimuthAngle = -0.75;
  controls.maxAzimuthAngle = 0.75;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };
  controls.update();

  const keys = { forward: false, back: false, left: false, right: false };

  function setMoveKey(name, on) {
    if (name in keys) keys[name] = on;
  }

  function getViewPan() {
    return { x: controls.target.x, y: controls.target.y };
  }

  function focusCell(col, row) {
    const { x, y } = cellCenter(col, row);
    controls.target.set(x, y, 0);
    controls.update();
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.update();
  }
  window.addEventListener('resize', resize);

  function tick() {
    const dist = camera.position.distanceTo(controls.target);
    const step = 0.35 * (dist / 88);
    if (keys.forward) controls.target.y += step;
    if (keys.back) controls.target.y -= step;
    if (keys.left) controls.target.x -= step;
    if (keys.right) controls.target.x += step;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  function gridIndex(col, row) {
    return col + row * COLS;
  }

  function slotIdForCell(col, row) {
    return `W-${col}-${row}`;
  }

  function findNextEmpty(occupied) {
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const id = slotIdForCell(col, row);
        if (!occupied.has(id)) {
          return {
            slotId: id,
            side: 'L',
            worldZ: gridIndex(col, row),
            col,
            row,
          };
        }
      }
    }
    return null;
  }

  function cellCenter(col, row) {
    return {
      x: -WALL_W / 2 + (col + 0.5) * CELL_W,
      y: -WALL_H / 2 + (row + 0.5) * CELL_H,
    };
  }

  function maxFrameSize() {
    return {
      frameMaxW: CELL_W * 0.92,
      frameMaxH: CELL_H * 0.92,
      frameMinH: CELL_H * 0.35,
    };
  }

  return {
    getScene: () => scene,
    getCanvas: () => renderer.domElement,
    setMoveKey,
    getViewPan,
    focusCell,
    findNextEmpty,
    cellCenter,
    maxFrameSize,
    slotIdForCell,
    layout: { WALL_W, WALL_H, COLS, ROWS, CELL_W, CELL_H },
  };
}
