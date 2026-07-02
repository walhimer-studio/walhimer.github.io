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
  getWallpaperSource,
} from "./ghost-machine-core.mjs";
import { createGhostGravityRoomEmbed } from "./ghost-gravity-room-embed.mjs?v=20260701-rec-tab-overlay";
import {
  surrenderScaleForRoom,
  SURRENDER_DEFAULT_SLIDERS,
} from "./surrender-machine-core.mjs";
import { createTextCylinder } from "./text-cylinder-core.mjs?v=20260524-pdf-link";
import { attachWalkthroughSound } from "./walkthrough-sound.mjs?v=20260701-rec-tab-overlay";
import { createWalkthroughRecorder } from "./walkthrough-recorder.mjs?v=20260701-rec-tab-overlay";

const BUILD = "20260701-rec-tab-overlay";
const SEED = 77823;

globalThis.THREE = THREE;

await new Promise((resolve, reject) => {
  const script = document.createElement("script");
  script.src = new URL("./surrender-machines-three-core.js?v=20260701-rec-tab-overlay", import.meta.url).href;
  script.onload = resolve;
  script.onerror = () => reject(new Error("surrender-machines-three-core.js failed to load"));
  document.head.appendChild(script);
});

const prompt = document.getElementById("prompt");
const modeEl = document.getElementById("mode");
const hudRoom = document.getElementById("hud-room");
const hudSeed = document.getElementById("hud-seed");
const roomBControls = document.getElementById("room-b-controls");
const roomCControls = document.getElementById("room-c-controls");
const slSpeed = document.getElementById("sl-speed");
const slHorizontal = document.getElementById("sl-horizontal");
const slVertical = document.getElementById("sl-vertical");
const slHCount = document.getElementById("sl-h-count");
const slVCount = document.getElementById("sl-v-count");
const valSpeed = document.getElementById("val-speed");
const valHorizontal = document.getElementById("val-horizontal");
const valVertical = document.getElementById("val-vertical");
const valHCount = document.getElementById("val-h-count");
const valVCount = document.getElementById("val-v-count");
const btnGravityX = document.getElementById("btn-gravity-x");
const btnGravityY = document.getElementById("btn-gravity-y");
const btnGravityZ = document.getElementById("btn-gravity-z");
const slAnger = document.getElementById("sl-anger");
const slEgo = document.getElementById("sl-ego");
const slAttachment = document.getElementById("sl-attachment");
const valAnger = document.getElementById("val-anger");
const valEgo = document.getElementById("val-ego");
const valAttachment = document.getElementById("val-attachment");
const surrenderBtn = document.getElementById("surrender-btn");
const zeroHint = document.getElementById("zero-hint");
modeEl.textContent = `build · ${BUILD}`;

const gravityAxisUi = { x: true, y: true, z: true };

function getGravityControls() {
  return {
    speed: Number(slSpeed.value),
    horizontal: Number(slHorizontal.value),
    vertical: Number(slVertical.value),
    hCount: Number(slHCount.value),
    vCount: Number(slVCount.value),
    gravityX: gravityAxisUi.x,
    gravityY: gravityAxisUi.y,
    gravityZ: gravityAxisUi.z,
  };
}

function getSliderValues() {
  return {
    anger: Number(slAnger.value),
    ego: Number(slEgo.value),
    attachment: Number(slAttachment.value),
  };
}

function syncGravityLabels() {
  const ctrl = getGravityControls();
  valSpeed.textContent = `${(ctrl.speed / 100).toFixed(1)}×`;
  valHorizontal.textContent = `${(ctrl.horizontal / 100).toFixed(2)}×`;
  valVertical.textContent = `${(ctrl.vertical / 100).toFixed(2)}×`;
  valHCount.textContent = String(ctrl.hCount);
  valVCount.textContent = String(ctrl.vCount);
}

function syncSliderLabels() {
  valAnger.textContent = slAnger.value;
  valEgo.textContent = slEgo.value;
  valAttachment.textContent = slAttachment.value;
}

function setGravityAxis(axis, on) {
  gravityAxisUi[axis] = !!on;
  const btn = axis === "x" ? btnGravityX : axis === "y" ? btnGravityY : btnGravityZ;
  btn?.setAttribute("aria-pressed", gravityAxisUi[axis] ? "true" : "false");
  gravityEmbed?.setGravityAxis(axis, gravityAxisUi[axis]);
  gravityEmbed?.syncControls();
}

const ROOM_B_ZONE_X0 = -RW + 0.5;
const ROOM_B_ZONE_X1 = RW - 0.5;
const ROOM_C_ZONE_X0 = ROOM_C_X - RW + 0.5;
const ROOM_C_ZONE_X1 = ROOM_C_X + RW - 0.5;
let roomBActive = false;
let surrenderActive = false;
let inWalkthrough = false;

function syncZeroHint(inRoomC = surrenderActive) {
  if (!zeroHint) return;
  const v = getSliderValues();
  const allZero = v.anger === 0 && v.ego === 0 && v.attachment === 0;
  const st = surrenderEmbed?.state;
  const show = inRoomC &&
    allZero &&
    inWalkthrough &&
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

/** Room B — gravity pull · sliders (seed 77823) */
const gravityEmbed = createGhostGravityRoomEmbed({
  THREE,
  parent: world,
  x: 0,
  y: 0,
  z: 0,
  seed: SEED,
  getControls: getGravityControls,
});
gravityEmbed.setVisible(false);
if (gravityEmbed.builder) {
  slHCount.max = String(gravityEmbed.builder.horizontalGears.length);
  slVCount.max = String(gravityEmbed.builder.verticalGears.length);
}

/** Room C — surrender-machines-three extract (seed 77823) */
let surrenderEmbed = null;
let modeBase = "";
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
  surrenderEmbed.setVisible(false);
  surrenderEmbed.setStaticOverlayVisible(false);
  modeBase = `${BUILD} · seed ${SEED}`;
  modeEl.textContent = modeBase;
} else {
  modeBase = `${BUILD} · room C three-core missing`;
  modeEl.textContent = modeBase;
}

const walkthroughSound = attachWalkthroughSound({
  getSliders: getSliderValues,
  isSurrendering: () => {
    const st = surrenderEmbed?.state;
    return !!(st && (st.surrenderStart != null || st.surrendered));
  },
  soundBtn: document.getElementById("sound-btn"),
});

const recorder = createWalkthroughRecorder(
  () => renderer.domElement,
  () => walkthroughSound.getAudioStream(),
  { downloadPrefix: "ghost-77823-walkthrough" }
);

const artworkRecLayer = document.getElementById("artwork-rec-layer");
const artworkRecFrame = document.getElementById("artwork-rec-frame");
const artworkRecBack = document.getElementById("artwork-rec-back");

function openArtworkOverlay(url) {
  if (!artworkRecLayer || !artworkRecFrame) {
    window.location.assign(url);
    return;
  }
  artworkRecFrame.src = url;
  artworkRecLayer.classList.add("is-open");
  artworkRecLayer.setAttribute("aria-hidden", "false");
}

function closeArtworkOverlay() {
  if (!artworkRecLayer || !artworkRecFrame) return;
  artworkRecFrame.src = "about:blank";
  artworkRecLayer.classList.remove("is-open");
  artworkRecLayer.setAttribute("aria-hidden", "true");
}

artworkRecBack?.addEventListener("click", () => {
  closeArtworkOverlay();
});

function syncModeLine() {
  if (recorder.isActive()) {
    modeEl.textContent = "recording · R stop";
    return;
  }
  modeEl.textContent = modeBase;
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
  if (!inWalkthrough) return;
  const hit = pickLinkMesh(event);
  if (hit?.userData.link) {
    event.preventDefault();
    if (recorder.isActive()) {
      openArtworkOverlay(hit.userData.link);
      return;
    }
    window.location.assign(hit.userData.link);
  }
});

renderer.domElement.addEventListener("mousemove", (event) => {
  if (inWalkthrough && pickLinkMesh(event)) {
    renderer.domElement.style.cursor = "pointer";
  } else {
    renderer.domElement.style.cursor = walk.isLocked ? "none" : "grab";
  }
});

function onSurrenderSliderInput() {
  syncSliderLabels();
  syncZeroHint();
  if (surrenderEmbed) surrenderEmbed.applySliders(getSliderValues());
}

function onGravitySliderInput() {
  syncGravityLabels();
  gravityEmbed.syncControls();
}

[slAnger, slEgo, slAttachment].forEach((el) => {
  el.addEventListener("input", onSurrenderSliderInput);
});
[slSpeed, slHorizontal, slVertical, slHCount, slVCount].forEach((el) => {
  el.addEventListener("input", onGravitySliderInput);
});

btnGravityX?.addEventListener("click", () => setGravityAxis("x", !gravityAxisUi.x));
btnGravityY?.addEventListener("click", () => setGravityAxis("y", !gravityAxisUi.y));
btnGravityZ?.addEventListener("click", () => setGravityAxis("z", !gravityAxisUi.z));

syncGravityLabels();
syncZeroHint(false);

surrenderBtn.addEventListener("click", () => {
  if (!surrenderEmbed) return;
  const st = surrenderEmbed.state;
  if (st.surrendered || st.surrenderStart != null) return;
  if (!surrenderEmbed.triggerSurrender()) return;
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
  const seedLabel = `seed ${SEED}`;

  if (pos.x < HALL_AB.x1) {
    hudRoom.textContent = pos.x >= ROOM_A_X - RW ? "Room A · black · code mural" : "Approach · Room A";
    hudSeed.textContent = pos.x >= ROOM_A_X - RW
      ? "text cylinder · center · click to make your own · walk moon · left wall · click"
      : `${seedLabel} · room B ahead`;
  } else if (pos.x < HALL_BC.x0) {
    hudRoom.textContent = pos.x < 0 ? "Hall A–B" : "Room B · gravity · sliders";
    hudSeed.textContent = seedLabel;
  } else if (pos.x < ROOM_C_X + RW) {
    hudRoom.textContent = pos.x < HALL_BC.x1 ? "Hall B–C" : "Room C · surrender machine";
    hudSeed.textContent = seedLabel;
  } else {
    hudRoom.textContent = "Room C · surrender machine";
    hudSeed.textContent = seedLabel;
  }

  roomBActive = pos.x >= ROOM_B_ZONE_X0 && pos.x <= ROOM_B_ZONE_X1;
  surrenderActive = pos.x >= ROOM_C_ZONE_X0 && pos.x <= ROOM_C_ZONE_X1;

  if (roomBControls) {
    roomBControls.classList.toggle("is-visible", roomBActive && inWalkthrough);
  }
  if (roomCControls) {
    roomCControls.classList.toggle("is-visible", surrenderActive && inWalkthrough);
  }
  gravityEmbed.setVisible(roomBActive && inWalkthrough);
  if (surrenderEmbed?.setVisible) {
    surrenderEmbed.setVisible(surrenderActive && inWalkthrough);
  }
  if (surrenderEmbed?.setStaticOverlayVisible) {
    surrenderEmbed.setStaticOverlayVisible(inWalkthrough);
  }
  syncZeroHint();
}

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.enabled = false;

const walk = new PointerLockControls(camera, renderer.domElement);
orientSpawnEast();

function enterWalkthrough() {
  prompt.classList.add("hidden");
  inWalkthrough = true;
  orbit.enabled = true;
  modeBase = "orbit — drag · WASD · F walk · R record";
  syncModeLine();
  if (surrenderEmbed) {
    surrenderEmbed.applySliders(getSliderValues());
    surrenderEmbed.setStaticOverlayVisible(true);
  }
}

prompt.addEventListener("click", () => {
  enterWalkthrough();
});

if (new URLSearchParams(location.search).get("room") === "a") {
  enterWalkthrough();
  history.replaceState(null, "", location.pathname);
}

walk.addEventListener("lock", () => {
  orbit.enabled = false;
  modeBase = "walk — WASD · Shift run · Esc · R record";
  syncModeLine();
});
walk.addEventListener("unlock", () => {
  orbit.enabled = true;
  orientSpawnEast();
  modeBase = "orbit — drag · F walk · R record";
  syncModeLine();
});

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyO") {
    walk.unlock();
    enterWalkthrough();
  }
  if (e.code === "KeyF" && !walk.isLocked && inWalkthrough) {
    walk.lock().catch(() => {
      modeBase = "walk blocked — drag to look";
      syncModeLine();
    });
  }
  if (e.code === "KeyR" && !e.repeat) {
    e.preventDefault();
    walkthroughSound.ensureAudio()
      .then(() => recorder.toggle())
      .then(() => {
        if (!recorder.isActive()) closeArtworkOverlay();
        syncModeLine();
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

  if (ghostSpinActive && gravityEmbed.builder) {
    gravityEmbed.builder.spinners.forEach((s) => {
      const d = s.speed * dt;
      if (s.axis === "x") s.pivot.rotation.x += d;
      else if (s.axis === "y") s.pivot.rotation.y += d;
      else s.pivot.rotation.z += d;
    });
  }

  gravityEmbed.update(dt, roomBActive && inWalkthrough);

  if (surrenderEmbed && inWalkthrough) {
    surrenderEmbed.applySliders(getSliderValues());
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
