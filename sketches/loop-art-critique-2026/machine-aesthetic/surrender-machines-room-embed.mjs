/**
 * Room C — runs surrender-machines.html p5 sketch on a floor plane in the walkthrough.
 * Uses surrender-machines-core.js (same code as the standalone artwork page).
 */
import { surrenderScaleForRoom } from "./surrender-machine-core.mjs";

const P5_URL = "https://cdn.jsdelivr.net/npm/p5@1.11.11/lib/p5.min.js";
const CORE_URL = "surrender-machines-core.js?v=20260601-p5-room";

function p5CanvasElement(p5api) {
  const c = p5api?.canvas;
  return c?.elt ?? c;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = resolve;
    el.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(el);
  });
}

export async function createSurrenderMachinesRoomEmbed(opts) {
  const THREE = opts.THREE;
  const parent = opts.parent;
  const pixelSize = opts.pixelSize || 768;
  const planeW = opts.planeWidth != null
    ? opts.planeWidth
    : surrenderScaleForRoom(opts.roomHeight || 9) * 720;

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    `position:fixed;left:-10000px;top:0;width:${pixelSize}px;height:${pixelSize}px;overflow:hidden;pointer-events:none;opacity:0`;
  document.body.appendChild(host);

  await loadScript(P5_URL);
  window.__SURRENDER_ROOM_OPTS = {
    parentElement: host,
    pixelSize,
    getSliders: opts.getSliders,
    seed: opts.seed,
  };
  await loadScript(CORE_URL);

  if (typeof window.createSurrenderMachinesP5 !== "function") {
    throw new Error("createSurrenderMachinesP5 missing — surrender-machines-core.js not loaded");
  }

  const p5api = window.createSurrenderMachinesP5(window.__SURRENDER_ROOM_OPTS);
  const canvas = p5CanvasElement(p5api);
  if (!canvas || typeof canvas.getContext !== "function") {
    throw new Error("p5 canvas missing after createSurrenderMachinesP5");
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(planeW, planeW),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: true,
    })
  );
  mesh.name = "surrender_machine_p5_floor";
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
  parent.add(mesh);

  return {
    root: mesh,
    p5: p5api,
    get state() {
      return p5api.state;
    },
    applySliders() {
      /* p5 draw() reads getSliders every frame */
    },
    setStaticOverlayVisible() {
      /* static is drawn inside the p5 canvas */
    },
    triggerSurrender() {
      p5api.triggerSurrender();
    },
    update() {
      tex.needsUpdate = true;
    },
    dispose() {
      parent.remove(mesh);
      tex.dispose();
      mesh.geometry.dispose();
      mesh.material.dispose();
      host.remove();
      delete window.__SURRENDER_ROOM_OPTS;
    },
  };
}
