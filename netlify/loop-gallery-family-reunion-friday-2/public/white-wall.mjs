/**
 * Static white wall + floor — pan view with arrows / drag (no corridor walk).
 */
export function createWhiteWallScene(opts = {}) {
  const THREE = window.THREE;
  if (!THREE) throw new Error('THREE required on window');

  const WALL_W = 120;
  const WALL_H = 72;
  const COLS = 8;
  const ROWS = 5;
  const CELL_W = WALL_W / COLS;
  const CELL_H = WALL_H / ROWS;
  const CAM_Z = 88;
  const PAN_SPEED = 0.45;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 400);
  let viewPanX = 0;
  let viewPanY = 0;
  const keys = { forward: false, back: false, left: false, right: false };

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

  function panLimits() {
    const vFov = (camera.fov * Math.PI) / 180;
    const visibleH = 2 * Math.tan(vFov / 2) * CAM_Z;
    const visibleW = visibleH * camera.aspect;
    const margin = 4;
    return {
      maxX: Math.max(0, WALL_W / 2 - visibleW / 2 + margin),
      maxY: Math.max(0, WALL_H / 2 - visibleH / 2 + margin),
    };
  }

  function clampPan() {
    const { maxX, maxY } = panLimits();
    viewPanX = Math.max(-maxX, Math.min(maxX, viewPanX));
    viewPanY = Math.max(-maxY, Math.min(maxY, viewPanY));
  }

  function applyCamera() {
    clampPan();
    camera.position.set(viewPanX, viewPanY + 2, CAM_Z);
    camera.lookAt(viewPanX, viewPanY, 0);
  }

  applyCamera();

  function setMoveKey(name, on) {
    if (name in keys) keys[name] = on;
  }

  function getViewPan() {
    return { x: viewPanX, y: viewPanY };
  }

  function focusCell(col, row) {
    const { x, y } = cellCenter(col, row);
    viewPanX = x;
    viewPanY = y;
    applyCamera();
  }

  let dragActive = false;
  let dragLastX = 0;
  let dragLastY = 0;

  function panByPixels(dx, dy) {
    const vFov = (camera.fov * Math.PI) / 180;
    const visibleH = 2 * Math.tan(vFov / 2) * CAM_Z;
    const visibleW = visibleH * camera.aspect;
    viewPanX -= (dx / window.innerWidth) * visibleW;
    viewPanY += (dy / window.innerHeight) * visibleH;
    applyCamera();
  }

  renderer.domElement.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    dragActive = true;
    dragLastX = e.clientX;
    dragLastY = e.clientY;
    renderer.domElement.setPointerCapture(e.pointerId);
    renderer.domElement.focus({ preventScroll: true });
    e.preventDefault();
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!dragActive) return;
    panByPixels(e.clientX - dragLastX, e.clientY - dragLastY);
    dragLastX = e.clientX;
    dragLastY = e.clientY;
  });
  renderer.domElement.addEventListener('pointerup', (e) => {
    dragActive = false;
    try { renderer.domElement.releasePointerCapture(e.pointerId); } catch (_) {}
  });
  renderer.domElement.addEventListener('pointercancel', () => { dragActive = false; });

  document.addEventListener('wheel', (e) => {
    const t = e.target;
    if (t && (t.closest('#panel') || t.closest('#panPad') || t.closest('#qrOverlay') || t.closest('#urlBar'))) return;
    e.preventDefault();
    panByPixels(-e.deltaX, -e.deltaY);
  }, { passive: false });

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    applyCamera();
  }
  window.addEventListener('resize', resize);

  function tick() {
    if (keys.forward) viewPanY += PAN_SPEED;
    if (keys.back) viewPanY -= PAN_SPEED;
    if (keys.left) viewPanX -= PAN_SPEED;
    if (keys.right) viewPanX += PAN_SPEED;
    if (keys.forward || keys.back || keys.left || keys.right) applyCamera();
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
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
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
