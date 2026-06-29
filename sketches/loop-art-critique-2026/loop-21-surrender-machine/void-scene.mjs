/**
 * White void bubble — one machine, manual explore, completion signal.
 */
import * as THREE from "three";
import { createTextCylinder } from "../../loop-machine-aesthetic/text-cylinder-core.mjs";
import { buildGhostMachine } from "../machine-aesthetic/ghost-machine-core.mjs";

const VOID_LABELS = ["Narrative · cylinder", "Dense machine", "Surrender · anger · ego · attachment"];
const MACHINE_MS = [12000, 14000, null];
const SURRENDER_FADE = 14;

export function createVoidScene({
  voidIndex = 0,
  seed = 210021,
  onMachineComplete,
  getSurrenderSliders,
  surrenderBtn,
} = {}) {
  let renderer = null;
  let scene = null;
  let camera = null;
  let raf = 0;
  let running = false;
  let explore = false;
  let machineDone = false;
  let startT = 0;
  let sceneTime = 0;
  let machineRoot = null;
  let textCylinder = null;
  let surrenderEmbed = null;
  let ghostBuilder = null;
  const keys = { forward: false, back: false, left: false, right: false };
  const pos = new THREE.Vector3(0, 1.62, 8);
  const yaw = { v: 0 };
  const SPEED = 14;
  const BOUNDS = 18;

  const onKey = (e, down) => {
    if (!explore) return;
    const k = e.key.toLowerCase();
    if (k === "arrowup") keys.forward = down;
    if (k === "arrowdown") keys.back = down;
    if (k === "arrowleft") keys.left = down;
    if (k === "arrowright") keys.right = down;
  };

  const keyDown = (e) => onKey(e, true);
  const keyUp = (e) => onKey(e, false);

  const buildFloor = () => {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
  };

  const spinGhost = (dt) => {
    if (!ghostBuilder) return;
    for (const { pivot, axis, speed } of ghostBuilder.spinners) {
      const d = speed * dt;
      if (axis === "x") pivot.rotation.x += d;
      else if (axis === "y") pivot.rotation.y += d;
      else pivot.rotation.z += d;
    }
  };

  const mountMachine = () => {
    machineRoot = new THREE.Group();
    scene.add(machineRoot);

    if (voidIndex === 0) {
      textCylinder = createTextCylinder({
        phrase: "ME - I WILL NOT BECOME THEIR NARRATIVE ",
        position: { x: 0, y: 2.85, z: 0 },
        planeSize: 7,
      });
      machineRoot.add(textCylinder.group);
      return;
    }

    if (voidIndex === 1) {
      const { builder } = buildGhostMachine(machineRoot, seed);
      ghostBuilder = builder;
      machineRoot.position.set(0, 0, -2);
      machineRoot.scale.setScalar(1.1);
      return;
    }

    if (voidIndex === 2 && globalThis.createSurrenderMachineEmbed) {
      surrenderEmbed = globalThis.createSurrenderMachineEmbed({
        parent: machineRoot,
        seed: (seed ^ 0x653057) >>> 0,
        scale: 0.011,
        flat: true,
        x: 0,
        y: 0,
        z: -1,
        sliders: getSurrenderSliders?.() ?? { anger: 50, ego: 50, attachment: 50 },
      });
      surrenderEmbed.lights?.forEach((l) => scene.add(l));
      surrenderEmbed.setStaticOverlayVisible?.(true);
      machineRoot.position.set(0, 0, 0);

      surrenderBtn?.addEventListener("click", onSurrenderClick);
    }
  };

  const onSurrenderClick = () => {
    if (!surrenderEmbed || machineDone) return;
    const st = surrenderEmbed.state;
    if (st.surrendered || st.surrenderStart != null) return;
    st.surrenderStart = sceneTime;
    if (surrenderBtn) {
      surrenderBtn.textContent = "Surrendering…";
      surrenderBtn.disabled = true;
    }
  };

  const init = async () => {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    camera = new THREE.PerspectiveCamera(55, 1, 0.05, 200);
    buildFloor();
    mountMachine();
    pos.set(0, 1.62, 8);
    yaw.v = 0;
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
  };

  const resize = () => {
    if (!renderer || !camera) return;
    const pw = window.innerWidth;
    const ph = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(pw, ph);
    camera.aspect = pw / Math.max(ph, 1);
    camera.updateProjectionMatrix();
  };

  const applyMove = (dt) => {
    if (!explore) return;
    const fwd = new THREE.Vector3(Math.sin(yaw.v), 0, -Math.cos(yaw.v));
    const right = new THREE.Vector3(Math.cos(yaw.v), 0, Math.sin(yaw.v));
    if (keys.forward) pos.addScaledVector(fwd, SPEED * dt);
    if (keys.back) pos.addScaledVector(fwd, -SPEED * dt);
    if (keys.left) pos.addScaledVector(right, -SPEED * dt);
    if (keys.right) pos.addScaledVector(right, SPEED * dt);
    pos.x = THREE.MathUtils.clamp(pos.x, -BOUNDS, BOUNDS);
    pos.z = THREE.MathUtils.clamp(pos.z, -BOUNDS, BOUNDS);
    pos.y = 1.62;
  };

  const maybeComplete = (elapsed) => {
    if (machineDone) return;
    if (voidIndex === 2 && surrenderEmbed) {
      const st = surrenderEmbed.state;
      if (st.surrenderStart != null) {
        st.shadowAmount = Math.min((sceneTime - st.surrenderStart) / SURRENDER_FADE, 1);
        if (st.shadowAmount >= 1) st.surrendered = true;
      }
      if (st.surrendered) {
        machineDone = true;
        onMachineComplete?.();
      }
      return;
    }
    const limit = MACHINE_MS[voidIndex];
    if (limit != null && elapsed >= limit) {
      machineDone = true;
      onMachineComplete?.();
    }
  };

  let lastT = 0;
  const frame = (t) => {
    if (!running) return;
    if (!startT) startT = t;
    const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 1 / 60);
    lastT = t;
    sceneTime += dt;

    maybeComplete(t - startT);

    if (textCylinder) textCylinder.update(dt, camera);
    spinGhost(dt);
    if (surrenderEmbed) {
      surrenderEmbed.applySliders(getSurrenderSliders?.() ?? { anger: 50, ego: 50, attachment: 50 });
      surrenderEmbed.update(dt, true);
    }

    applyMove(dt);
    camera.position.copy(pos);
    camera.rotation.set(0, yaw.v, 0, "YXZ");

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };

  return {
    label: () => VOID_LABELS[voidIndex] ?? "Void",
    mount: init,
    start() {
      running = true;
      machineDone = false;
      explore = false;
      startT = 0;
      lastT = 0;
      sceneTime = 0;
      if (surrenderBtn) {
        surrenderBtn.textContent = "Surrender";
        surrenderBtn.disabled = false;
      }
      raf = requestAnimationFrame(frame);
    },
    enableExplore() {
      explore = true;
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      this.stop();
      surrenderBtn?.removeEventListener("click", onSurrenderClick);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      renderer?.domElement?.remove();
      renderer?.dispose();
      renderer = scene = camera = null;
    },
    isMachineDone: () => machineDone,
    getCanvas: () => renderer?.domElement ?? null,
  };
}
