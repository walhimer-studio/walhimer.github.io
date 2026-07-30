/**
 * White wall gallery — OrbitControls zoom / orbit / pan (+ fallback).
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

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 0, 88);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.cursor = 'grab';
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

  let controls = null;
  let camDist = 88;
  let viewPanX = 0;
  let viewPanY = 0;
  const keys = { forward: false, back: false, left: false, right: false };

  if (THREE.OrbitControls) {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.zoomSpeed = 1.1;
    controls.rotateSpeed = 0.8;
    controls.panSpeed = 0.9;
    controls.screenSpacePanning = true;
    controls.minDistance = 24;
    controls.maxDistance = 180;
    controls.maxPolarAngle = Math.PI * 0.95;
    controls.minPolarAngle = 0.05;
    if (THREE.TOUCH) {
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    }
    controls.update();
    renderer.domElement.addEventListener('pointerdown', () => {
      renderer.domElement.style.cursor = 'grabbing';
    });
    renderer.domElement.addEventListener('pointerup', () => {
      renderer.domElement.style.cursor = 'grab';
    });
  }

  function applyFallbackCamera() {
    camera.position.set(viewPanX, viewPanY + 2, camDist);
    camera.lookAt(viewPanX, viewPanY, 0);
  }

  function setMoveKey(name, on) {
    if (name in keys) keys[name] = on;
  }

  function getViewPan() {
    if (controls) return { x: controls.target.x, y: controls.target.y };
    return { x: viewPanX, y: viewPanY };
  }

  function focusCell(col, row) {
    const { x, y } = cellCenter(col, row);
    if (controls) {
      controls.target.set(x, y, 0);
      controls.update();
    } else {
      viewPanX = x;
      viewPanY = y;
      applyFallbackCamera();
    }
  }

  function zoomBy(factor) {
    if (controls) {
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
      offset.multiplyScalar(factor);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      return;
    }
    camDist = Math.max(24, Math.min(180, camDist * factor));
    applyFallbackCamera();
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls?.update();
  }
  window.addEventListener('resize', resize);

  function tick() {
    if (controls) {
      const step = 0.35 * (camera.position.distanceTo(controls.target) / 88);
      if (keys.forward) controls.target.y += step;
      if (keys.back) controls.target.y -= step;
      if (keys.left) controls.target.x -= step;
      if (keys.right) controls.target.x += step;
      controls.update();
    } else {
      const step = 0.45 * (camDist / 88);
      if (keys.forward) viewPanY += step;
      if (keys.back) viewPanY -= step;
      if (keys.left) viewPanX -= step;
      if (keys.right) viewPanX += step;
      applyFallbackCamera();
    }
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
    zoomBy,
    findNextEmpty,
    cellCenter,
    maxFrameSize,
    slotIdForCell,
    layout: { WALL_W, WALL_H, COLS, ROWS, CELL_W, CELL_H },
  };
}
