/**
 * Static white wall + floor — no walk, no corridor.
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
  camera.position.set(0, 2, 88);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.display = 'block';

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

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize);

  function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

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
            // Firestore rules allow L/R only — W-* slotId is the grid key
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
    findNextEmpty,
    cellCenter,
    maxFrameSize,
    slotIdForCell,
    layout: { WALL_W, WALL_H, COLS, ROWS, CELL_W, CELL_H },
  };
}
