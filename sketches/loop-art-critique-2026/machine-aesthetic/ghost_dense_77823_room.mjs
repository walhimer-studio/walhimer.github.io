import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import {
  SEED,
  ROOM,
  LAYOUT,
  RW,
  RD,
  ROOM_A_X,
  ROOM_C_X,
  HALL_AB,
  HALL_BC,
  buildWalkthroughRoomComplex,
  buildGhostMachine,
  getWallpaperSource,
} from "./ghost-machine-core.mjs";
import {
  surrenderScaleForRoom,
  SURRENDER_DEFAULT_SLIDERS,
} from "./surrender-machine-core.mjs";
import { createTextCylinder } from "./text-cylinder-core.mjs?v=20260524-walkmoon-panel";

const BUILD = "20260524-walkmoon-panel";

globalThis.THREE = THREE;

await new Promise((resolve, reject) => {
  const script = document.createElement("script");
  script.src = "surrender-machines-three-core.js";
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});

const BOUND_ROOM_Z = RD - 1.2;
const BOUND_HALL_Z = LAYOUT.hallwayWidth / 2 - 0.2;
const BOUND_X_MIN = ROOM_A_X - RW + 1.2;
const BOUND_X_MAX = ROOM_C_X + RW - 1.2;
const SPAWN_A = {
  x: ROOM_A_X - 8,
  y: 1.62,
  z: 0,
  lookX: HALL_AB.x0 + LAYOUT.hallwayLengthAB * 0.45,
};
const TEXT_CYLINDER_POS = { x: ROOM_A_X, y: 2.85, z: 0 };

const prompt = document.getElementById("prompt");
const modeEl = document.getElementById("mode");
const hudRoom = document.getElementById("hud-room");
const hudSeed = document.getElementById("hud-seed");
modeEl.textContent = `build · ${BUILD}`;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xffffff, 1);
document.body.insertBefore(renderer.domElement, document.body.firstChild);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.05, 200);

const world = new THREE.Group();
scene.add(world);

await buildWalkthroughRoomComplex(world, ROOM.width, ROOM.depth, ROOM.height, { wallpaper: true });
const { builder } = buildGhostMachine(world);

/** Walk moon — your artwork on full left-hand wall; click opens walk_moon_audio_standalone.html */
const WALK_MOON_URL = new URL("../walk_moon_audio_standalone.html", import.meta.url).href;
const WALK_MOON_PANEL_TEX = new URL("walk-moon-wall-panel.png", import.meta.url).href;
const WALL_T = 0.15;
const wallFace = WALL_T / 2 + 0.002;
const panelEdgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });

const walkMoonWallW = ROOM.width - 0.35;
const walkMoonWallH = ROOM.height - 0.45;

const walkMoonTex = await new Promise((resolve, reject) => {
  new THREE.TextureLoader().load(WALK_MOON_PANEL_TEX, resolve, undefined, reject);
});
walkMoonTex.colorSpace = THREE.SRGBColorSpace;
walkMoonTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

const imgAspect = walkMoonTex.image.width / walkMoonTex.image.height;
const wallAspect = walkMoonWallW / walkMoonWallH;
if (imgAspect > wallAspect) {
  const sx = wallAspect / imgAspect;
  walkMoonTex.repeat.set(sx, 1);
  walkMoonTex.offset.set((1 - sx) / 2, 0);
} else {
  const sy = imgAspect / wallAspect;
  walkMoonTex.repeat.set(1, sy);
  walkMoonTex.offset.set(0, (1 - sy) / 2);
}

const walkMoonZFace = -RD + wallFace + 0.03;
const walkMoonGroup = new THREE.Group();
walkMoonGroup.name = "walk_moon_panel_link";
world.add(walkMoonGroup);

const walkMoonPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(walkMoonWallW, walkMoonWallH),
  new THREE.MeshBasicMaterial({
    map: walkMoonTex,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })
);
walkMoonPlane.name = "walk_moon_panel";
walkMoonPlane.position.set(ROOM_A_X, ROOM.height * 0.5, walkMoonZFace);
walkMoonPlane.rotation.y = 0;
walkMoonPlane.userData.link = WALK_MOON_URL;
walkMoonPlane.renderOrder = 10;
walkMoonGroup.add(walkMoonPlane);

function panelEdge(ax, ay, az, bx, by, bz) {
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(ax, ay, az),
      new THREE.Vector3(bx, by, bz),
    ]),
    panelEdgeMat
  );
  line.renderOrder = 3;
  walkMoonGroup.add(line);
}

const pz = walkMoonZFace + 0.002;
const py0 = ROOM.height * 0.5 - walkMoonWallH / 2;
const py1 = ROOM.height * 0.5 + walkMoonWallH / 2;
const px0 = ROOM_A_X - walkMoonWallW / 2;
const px1 = ROOM_A_X + walkMoonWallW / 2;
panelEdge(px0, py0, pz, px1, py0, pz);
panelEdge(px0, py1, pz, px1, py1, pz);
panelEdge(px0, py0, pz, px0, py1, pz);
panelEdge(px1, py0, pz, px1, py1, pz);

const TEXT_CYLINDER_URL = new URL("../../text11.html", import.meta.url).href;
const textCylinder = createTextCylinder({
  position: TEXT_CYLINDER_POS,
  link: TEXT_CYLINDER_URL,
});
world.add(textCylinder.group);

const linkMeshes = [walkMoonPlane, ...textCylinder.linkMeshes];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function pickLinkMesh(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(linkMeshes, false);
  return hits.length ? hits[0].object : null;
}

renderer.domElement.addEventListener("click", (event) => {
  if (!prompt.classList.contains("hidden")) return;
  const hit = pickLinkMesh(event);
  if (hit?.userData.link) {
    event.preventDefault();
    window.open(hit.userData.link, "_blank", "noopener");
  }
});

renderer.domElement.addEventListener("mousemove", (event) => {
  if (prompt.classList.contains("hidden") && pickLinkMesh(event)) {
    renderer.domElement.style.cursor = "pointer";
  } else {
    renderer.domElement.style.cursor = walk.isLocked ? "none" : "grab";
  }
});

const ROOM_C_ZONE_X0 = ROOM_C_X - RW + 0.5;
const ROOM_C_ZONE_X1 = ROOM_C_X + RW - 0.5;
let surrenderActive = false;
let surrenderEmbed = null;

if (typeof globalThis.createSurrenderMachineEmbed === "function") {
  surrenderEmbed = globalThis.createSurrenderMachineEmbed({
    parent: world,
    x: ROOM_C_X,
    y: 0.04,
    z: 0,
    scale: surrenderScaleForRoom(ROOM.height),
    flat: true,
    seed: SEED,
    sliders: SURRENDER_DEFAULT_SLIDERS,
  });
  surrenderEmbed.lights.forEach((l) => scene.add(l));
}

const GHOST_SPIN_X0 = HALL_AB.x0 - 2;
const GHOST_SPIN_X1 = HALL_BC.x0;
let ghostSpinActive = false;

function orientSpawnEast() {
  camera.position.set(SPAWN_A.x, SPAWN_A.y, SPAWN_A.z);
  camera.lookAt(TEXT_CYLINDER_POS.x, TEXT_CYLINDER_POS.y, TEXT_CYLINDER_POS.z);
  orbit.target.set(TEXT_CYLINDER_POS.x, TEXT_CYLINDER_POS.y, TEXT_CYLINDER_POS.z);
}

function clampWalk(pos) {
  pos.x = THREE.MathUtils.clamp(pos.x, BOUND_X_MIN, BOUND_X_MAX);
  const inHall =
    (pos.x >= HALL_AB.x0 && pos.x <= HALL_AB.x1) ||
    (pos.x >= HALL_BC.x0 && pos.x <= HALL_BC.x1);
  const zBound = inHall ? BOUND_HALL_Z : BOUND_ROOM_Z;
  pos.z = THREE.MathUtils.clamp(pos.z, -zBound, zBound);
}

function updateHud(pos) {
  ghostSpinActive = pos.x >= GHOST_SPIN_X0 && pos.x <= GHOST_SPIN_X1;

  if (pos.x < HALL_AB.x1) {
    hudRoom.textContent = pos.x >= ROOM_A_X - RW ? "Room A · black · code mural" : "Approach · Room A";
    hudSeed.textContent = pos.x >= ROOM_A_X - RW
      ? "text cylinder · center · click to make your own · walk moon · left wall · click"
      : "ghost seed 77823 · room B ahead";
  } else if (pos.x < HALL_BC.x0) {
    hudRoom.textContent = pos.x < 0 ? "Hall A–B" : "Room B · ghost wireframe";
    hudSeed.textContent = "seed 77823";
  } else if (pos.x < ROOM_C_X + RW) {
    hudRoom.textContent = pos.x < HALL_BC.x1 ? "Hall B–C" : "Room C · surrender machine";
    hudSeed.textContent = surrenderEmbed
      ? "surrender · seed " + surrenderEmbed.state.seed
      : "surrender machine missing";
  } else {
    hudRoom.textContent = "Room C · surrender machine";
    hudSeed.textContent = surrenderEmbed
      ? "surrender · seed " + surrenderEmbed.state.seed
      : "surrender machine missing";
  }
  surrenderActive = pos.x >= ROOM_C_ZONE_X0 && pos.x <= ROOM_C_ZONE_X1;
}

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.enabled = false;

const walk = new PointerLockControls(camera, renderer.domElement);
orientSpawnEast();

prompt.addEventListener("click", () => {
  prompt.classList.add("hidden");
  orbit.enabled = true;
  modeEl.textContent = "orbit — drag · WASD · F walk";
});

walk.addEventListener("lock", () => {
  orbit.enabled = false;
  modeEl.textContent = "walk — WASD · Shift run · Esc";
});
walk.addEventListener("unlock", () => {
  orbit.enabled = true;
  orientSpawnEast();
  modeEl.textContent = "orbit — drag · F walk";
});

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyO") {
    walk.unlock();
    orbit.enabled = true;
    prompt.classList.add("hidden");
    modeEl.textContent = "orbit — drag · F walk";
  }
  if (e.code === "KeyF" && !walk.isLocked) {
    walk.lock().catch(() => {
      modeEl.textContent = "walk blocked — drag to look";
    });
  }
});

const keys = {};
window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);

  textCylinder.update(dt, camera);

  if (ghostSpinActive) {
    builder.spinners.forEach((s) => {
      const d = s.speed * dt;
      if (s.axis === "x") s.pivot.rotation.x += d;
      else if (s.axis === "y") s.pivot.rotation.y += d;
      else s.pivot.rotation.z += d;
    });
  }

  if (surrenderEmbed) {
    surrenderEmbed.update(dt, surrenderActive);
  }

  const moving = keys.KeyW || keys.KeyS || keys.KeyA || keys.KeyD ||
    keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight;

  if (walk.isLocked) {
    const vel = ((keys.ShiftLeft || keys.ShiftRight) ? 4 : 2) * dt;
    if (keys.KeyW || keys.ArrowUp) walk.moveForward(vel);
    if (keys.KeyS || keys.ArrowDown) walk.moveForward(-vel);
    if (keys.KeyA || keys.ArrowLeft) walk.moveRight(-vel);
    if (keys.KeyD || keys.ArrowRight) walk.moveRight(vel);
    camera.position.y = 1.62;
  } else if (orbit.enabled && moving) {
    const vel = ((keys.ShiftLeft || keys.ShiftRight) ? 4 : 2) * dt;
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    const right = new THREE.Vector3().crossVectors(fwd, camera.up).normalize();
    if (keys.KeyW || keys.ArrowUp) camera.position.addScaledVector(fwd, vel);
    if (keys.KeyS || keys.ArrowDown) camera.position.addScaledVector(fwd, -vel);
    if (keys.KeyA || keys.ArrowLeft) camera.position.addScaledVector(right, -vel);
    if (keys.KeyD || keys.ArrowRight) camera.position.addScaledVector(right, vel);
    camera.position.y = 1.62;
    orbit.target.copy(camera.position).add(fwd.multiplyScalar(2));
  } else if (orbit.enabled) {
    orbit.update();
  }

  clampWalk(camera.position);
  updateHud(camera.position);
  renderer.render(scene, camera);
}
tick();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
renderer.setSize(window.innerWidth, window.innerHeight);

window.getWallpaperSource = getWallpaperSource;
