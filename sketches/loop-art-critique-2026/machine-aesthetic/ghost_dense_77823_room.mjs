import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import {
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
import { createTextCylinder } from "./text-cylinder-core.mjs?v=20260524-pdf-link";

const BUILD = "20260601-room-c-floor";
const SURRENDER_MACHINE_SEED = 653057;
const SURRENDER_FADE_DURATION = 14;

globalThis.THREE = THREE;

await new Promise((resolve, reject) => {
  const script = document.createElement("script");
  script.src = "surrender-machines-three-core.js?v=20260601-three-ref";
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});

const prompt = document.getElementById("prompt");
const modeEl = document.getElementById("mode");
const hudRoom = document.getElementById("hud-room");
const hudSeed = document.getElementById("hud-seed");
const roomCControls = document.getElementById("room-c-controls");
const slAnger = document.getElementById("sl-anger");
const slEgo = document.getElementById("sl-ego");
const slAttachment = document.getElementById("sl-attachment");
const valAnger = document.getElementById("val-anger");
const valEgo = document.getElementById("val-ego");
const valAttachment = document.getElementById("val-attachment");
const surrenderBtn = document.getElementById("surrender-btn");
const zeroHint = document.getElementById("zero-hint");
modeEl.textContent = `build · ${BUILD}`;

function getSliderValues() {
  return {
    anger: Number(slAnger.value),
    ego: Number(slEgo.value),
    attachment: Number(slAttachment.value),
  };
}

function syncSliderLabels() {
  valAnger.textContent = slAnger.value;
  valEgo.textContent = slEgo.value;
  valAttachment.textContent = slAttachment.value;
}

const ROOM_C_ZONE_X0 = ROOM_C_X - RW + 0.5;
const ROOM_C_ZONE_X1 = ROOM_C_X + RW - 0.5;
let surrenderActive = false;

function syncZeroHint(inRoomC = surrenderActive) {
  if (!zeroHint) return;
  const v = getSliderValues();
  const allZero = v.anger === 0 && v.ego === 0 && v.attachment === 0;
  const st = surrenderEmbed?.state;
  const show = inRoomC &&
    allZero &&
    prompt.classList.contains("hidden") &&
    (!st || (!st.surrendered && st.surrenderStart == null));
  zeroHint.classList.toggle("visible", show);
  zeroHint.setAttribute("aria-hidden", show ? "false" : "true");
}

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

/** Room C — surrender machine on the floor, center of the room */
let surrenderEmbed = null;

if (typeof globalThis.createSurrenderMachineEmbed === "function") {
  surrenderEmbed = globalThis.createSurrenderMachineEmbed({
    parent: world,
    x: ROOM_C_X,
    y: 0.04,
    z: 0,
    scale: surrenderScaleForRoom(ROOM.height),
    flat: true,
    seed: SURRENDER_MACHINE_SEED,
    sliders: SURRENDER_DEFAULT_SLIDERS,
  });
  surrenderEmbed.lights.forEach((l) => scene.add(l));
}

/** Walk moon — your PNG sized to full north (left-hand) wall face */
const WALK_MOON_URL = new URL("../walk_moon_audio_standalone.html", import.meta.url).href;
const WALK_MOON_PANEL_TEX = new URL("walk-moon-wall-panel.png", import.meta.url).href;
const WALL_T = 0.15;
const wallFace = WALL_T / 2 + 0.002;

const walkMoonTex = await new Promise((resolve, reject) => {
  new THREE.TextureLoader().load(WALK_MOON_PANEL_TEX, resolve, undefined, reject);
});
walkMoonTex.colorSpace = THREE.SRGBColorSpace;
walkMoonTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

const walkMoonPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM.width, ROOM.height),
  new THREE.MeshBasicMaterial({
    map: walkMoonTex,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  })
);
walkMoonPlane.name = "walk_moon_panel";
walkMoonPlane.position.set(ROOM_A_X, ROOM.height * 0.5, -RD + wallFace);
walkMoonPlane.rotation.y = 0;
walkMoonPlane.userData.link = WALK_MOON_URL;
walkMoonPlane.renderOrder = 10;
world.add(walkMoonPlane);

/** Building outline — full south wall face */
const BUILDING_OUTLINE_URL = new URL("building-outline-only.html", import.meta.url).href;
const BUILDING_OUTLINE_TEX = new URL("building-outline-wall-panel.png", import.meta.url).href;

const buildingOutlineTex = await new Promise((resolve, reject) => {
  new THREE.TextureLoader().load(BUILDING_OUTLINE_TEX, resolve, undefined, reject);
});
buildingOutlineTex.colorSpace = THREE.SRGBColorSpace;
buildingOutlineTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

const buildingOutlinePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM.width, ROOM.height),
  new THREE.MeshBasicMaterial({
    map: buildingOutlineTex,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  })
);
buildingOutlinePlane.name = "building_outline_panel";
buildingOutlinePlane.position.set(ROOM_A_X, ROOM.height * 0.5, RD - wallFace);
buildingOutlinePlane.rotation.y = Math.PI;
buildingOutlinePlane.userData.link = BUILDING_OUTLINE_URL;
buildingOutlinePlane.renderOrder = 10;
world.add(buildingOutlinePlane);

/** Invisible link — east wall, right of door → surrender-machine-ibm-mono.pdf */
const halfDoor = LAYOUT.doorwayWidth / 2;
const segD = RD - halfDoor;
const SURRENDER_PDF_URL = new URL("surrender-machine-ibm-mono.pdf", import.meta.url).href;

const doorPdfLink = new THREE.Mesh(
  new THREE.PlaneGeometry(segD, ROOM.height),
  new THREE.MeshBasicMaterial({ visible: false })
);
doorPdfLink.name = "door_pdf_link";
doorPdfLink.position.set(ROOM_A_X + RW - wallFace, ROOM.height * 0.5, halfDoor + segD / 2);
doorPdfLink.rotation.y = -Math.PI / 2;
doorPdfLink.userData.link = SURRENDER_PDF_URL;
world.add(doorPdfLink);

const TEXT_CYLINDER_URL = new URL("../../text11.html", import.meta.url).href;
const textCylinder = createTextCylinder({
  position: TEXT_CYLINDER_POS,
  link: TEXT_CYLINDER_URL,
});
world.add(textCylinder.group);

const linkMeshes = [walkMoonPlane, buildingOutlinePlane, doorPdfLink, ...textCylinder.linkMeshes];
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
    window.location.assign(hit.userData.link);
  }
});

renderer.domElement.addEventListener("mousemove", (event) => {
  if (prompt.classList.contains("hidden") && pickLinkMesh(event)) {
    renderer.domElement.style.cursor = "pointer";
  } else {
    renderer.domElement.style.cursor = walk.isLocked ? "none" : "grab";
  }
});

function onSliderInput() {
  syncSliderLabels();
  syncZeroHint();
  if (surrenderEmbed) surrenderEmbed.updateTargets(getSliderValues());
}

[slAnger, slEgo, slAttachment].forEach((el) => {
  el.addEventListener("input", onSliderInput);
});

syncZeroHint(false);

surrenderBtn.addEventListener("click", () => {
  if (!surrenderEmbed) return;
  const st = surrenderEmbed.state;
  if (st.surrendered || st.surrenderStart != null) return;
  st.surrenderStart = sceneTime;
  surrenderBtn.textContent = "Surrendering…";
  surrenderBtn.disabled = true;
  surrenderBtn.classList.add("surrendered");
});

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
      ? `surrender · seed ${SURRENDER_MACHINE_SEED}`
      : "surrender machine missing";
  } else {
    hudRoom.textContent = "Room C · surrender machine";
    hudSeed.textContent = surrenderEmbed
      ? `surrender · seed ${SURRENDER_MACHINE_SEED}`
      : "surrender machine missing";
  }
  surrenderActive = pos.x >= ROOM_C_ZONE_X0 && pos.x <= ROOM_C_ZONE_X1;
  if (roomCControls) {
    roomCControls.classList.toggle(
      "is-visible",
      surrenderActive && prompt.classList.contains("hidden")
    );
  }
  syncZeroHint();
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
let sceneTime = 0;

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  sceneTime += dt;

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
    const st = surrenderEmbed.state;
    if (st.surrenderStart != null) {
      st.shadowAmount = Math.min((sceneTime - st.surrenderStart) / SURRENDER_FADE_DURATION, 1);
      if (st.shadowAmount >= 1) st.surrendered = true;
    }
    surrenderEmbed.applySliders(getSliderValues());
    surrenderEmbed.setStaticOverlayVisible(
      surrenderActive && prompt.classList.contains("hidden") && st.shadowAmount < 1
    );
    surrenderEmbed.update(dt, true);
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
