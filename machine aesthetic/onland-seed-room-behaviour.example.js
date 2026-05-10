/**
 * Onland / XR Creator — Behaviour script (EXAMPLE)
 *
 * Intent: seed-driven procedural “room” you don’t predetermine — Mulberry32 RNG,
 * meshes from PrimitiveMeshElement / THREE, click-to-start, finite lifespan.
 *
 * Paste into a Behaviour element and align names with your runtime (Input.*,
 * lifecycle pragma, etc.). Sandbox subset may require small edits.
 *
 * Docs: https://docs.loop.onland.io/category/scripting-api
 */

// --- Config (tweak) ------------------------------------------------------------
const DEFAULT_SEED = 923000001; // change per session / read from Persistable / URL in your build
const ROOM_LIFESPAN_SEC = 120;
const FLOOR_SIZE = 8;

// --- State ---------------------------------------------------------------------
/** @type {"idle" | "living" | "ended"} */
let phase = "idle";
let elapsed = 0;
/** @type {number} */
let seedUsed = DEFAULT_SEED;
/** @type {() => number} */
let rng;
/** @type {THREE.Object3D[]} */
let roomRoots = [];
let mouseWasPressed = false;

// --- Deterministic RNG (same seed -> same sequence) ----------------------------
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rndBetween(r, lo, hi) {
  return lo + r() * (hi - lo);
}

// --- Build room from one seed --------------------------------------------------
function buildRoomFromSeed() {
  clearRoom();
  rng = mulberry32(seedUsed >>> 0);

  const floor = new PrimitiveMeshElement();
  floor.color = "#e8e4dc";
  floor.geometryType = "Box";
  const fw = rndBetween(rng, 4, FLOOR_SIZE);
  const fd = rndBetween(rng, 4, FLOOR_SIZE);
  floor.geometryParameters = new THREE.BoxGeometry(fw, 0.08, fd);
  floor.position.set(0, -0.04, 0);
  scene.add(floor);
  roomRoots.push(floor);

  const wallCount = Math.floor(rndBetween(rng, 3, 7));
  for (let i = 0; i < wallCount; i++) {
    const w = new PrimitiveMeshElement();
    w.color = "#" + Math.floor(rndBetween(rng, 0x303030, 0xffffff)).toString(16).padStart(6, "0");
    w.geometryType = "Box";
    const wx = rndBetween(rng, 0.15, 0.45);
    const wy = rndBetween(rng, 1.2, 3.2);
    const wz = rndBetween(rng, 0.15, 0.45);
    w.geometryParameters = new THREE.BoxGeometry(wx, wy, wz);
    const ang = rndBetween(rng, 0, Math.PI * 2);
    const rad = rndBetween(rng, 1, fw * 0.35);
    w.position.set(Math.cos(ang) * rad, wy * 0.5 - 0.04, Math.sin(ang) * rad);
    w.rotation.y = rndBetween(rng, -0.4, 0.4);
    scene.add(w);
    roomRoots.push(w);
  }
}

function clearRoom() {
  for (let i = 0; i < roomRoots.length; i++) {
    try {
      destroy(roomRoots[i], { delay: 0 });
    } catch (e) {
      scene.remove(roomRoots[i]);
    }
  }
  roomRoots = [];
}

function tryStartFromClick() {
  if (phase !== "idle") return;
  try {
    const pressed = Input.mouse.isButtonPressed(MouseButton.Left);
    // Rising edge: click once to instantiate (not hold-to-repeat).
    if (pressed && !mouseWasPressed) {
      phase = "living";
      elapsed = 0;
      buildRoomFromSeed();
    }
    mouseWasPressed = pressed;
    // Optional: require ray hit on a named mesh — Input.mouse.raycast(camera) + intersects
  } catch (e) {
    // XR-only: use XRInput / Trigger Volume for “start” instead.
  }
}

// --- Lifecycle (pragma names follow Loop docs) ---------------------------------
#pragma lifecycle(startup, update, dispose)

function startup() {
  phase = "idle";
  seedUsed = DEFAULT_SEED;
  // Optional: seedUsed = Persistable.use("room").get("seed") ?? DEFAULT_SEED;
  try {
    Input.mouse.start();
  } catch (e) {}
}

function update(delta, time) {
  if (phase === "idle") {
    tryStartFromClick();
    return;
  }

  if (phase === "living") {
    elapsed += delta;
    // Example “lifespan”: pulse emissive idea — optional visual drift
    const t = elapsed / ROOM_LIFESPAN_SEC;
    if (t >= 1) {
      phase = "ended";
      clearRoom();
    }
    return;
  }
}

function dispose() {
  clearRoom();
  try {
    Input.mouse.stop();
  } catch (e) {}
}
