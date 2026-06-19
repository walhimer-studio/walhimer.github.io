/**
 * Room C — fetch surrender-machines.html, run its scripts, show p5 canvas on a floor plane.
 * Does not edit surrender-machines.html; no iframe; no three-core.
 */
import { surrenderScaleForRoom } from "./surrender-machine-core.mjs";

const SURRENDER_HTML = new URL("./surrender-machines.html", import.meta.url);

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

async function fetchSurrenderHtmlDoc() {
  const res = await fetch(SURRENDER_HTML, { cache: "no-cache" });
  if (!res.ok) throw new Error(`fetch surrender-machines.html: ${res.status}`);
  return new DOMParser().parseFromString(await res.text(), "text/html");
}

function resolveScriptUrls(doc) {
  return [...doc.querySelectorAll("script[src]")].map((s) =>
    new URL(s.getAttribute("src"), SURRENDER_HTML).href
  );
}

function mountSoundButton(doc) {
  const src = doc.getElementById("sound-btn");
  if (!src || document.getElementById("sound-btn")) return null;
  const btn = src.cloneNode(true);
  btn.style.display = "none";
  document.body.appendChild(btn);
  return btn;
}

function waitForP5Frame(canvas, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const tick = () => {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) {
        if (performance.now() - start > timeoutMs) reject(new Error("p5 webgl context missing"));
        else requestAnimationFrame(tick);
        return;
      }
      const px = new Uint8Array(4);
      gl.readPixels(
        Math.floor(canvas.width / 2),
        Math.floor(canvas.height / 2),
        1,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        px
      );
      const lit = px[0] + px[1] + px[2];
      if (lit > 0 && lit < 760) resolve();
      else if (performance.now() - start > timeoutMs) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export async function createSurrenderMachinesRoomEmbed(opts) {
  const THREE = opts.THREE;
  const parent = opts.parent;
  if (!THREE || !parent) {
    throw new Error("THREE and parent required");
  }

  const doc = await fetchSurrenderHtmlDoc();

  const pixelSize = opts.pixelSize || 768;
  const planeW = opts.planeWidth != null
    ? opts.planeWidth
    : surrenderScaleForRoom(opts.roomHeight || 9) * 720;

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    `position:fixed;left:-10000px;top:0;width:${pixelSize}px;height:${pixelSize}px;overflow:hidden;pointer-events:none`;
  document.body.appendChild(host);

  const soundBtn = mountSoundButton(doc);

  window.__SURRENDER_ROOM_OPTS = {
    parentElement: host,
    pixelSize,
    getSliders: opts.getSliders,
    seed: opts.seed,
  };

  for (const src of resolveScriptUrls(doc)) {
    await loadScript(src);
  }

  if (typeof window.createSurrenderMachinesP5 !== "function") {
    throw new Error("createSurrenderMachinesP5 missing after surrender-machines.html scripts");
  }

  const p5api = window.createSurrenderMachinesP5(window.__SURRENDER_ROOM_OPTS);
  const canvas = p5CanvasElement(p5api);
  if (!canvas || typeof canvas.getContext !== "function") {
    throw new Error("p5 canvas missing after createSurrenderMachinesP5");
  }

  await waitForP5Frame(canvas);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;

  const anchor = new THREE.Group();
  anchor.name = "surrender_machine_p5_anchor";
  anchor.position.set(opts.x || 0, 0, opts.z || 0);

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(planeW, planeW),
    new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.DoubleSide,
      depthWrite: true,
      transparent: false,
    })
  );
  mesh.name = "surrender_machine_p5_floor";
  mesh.rotation.y = -Math.PI / 2;
  mesh.position.y = planeW * 0.45 + (opts.y || 0);
  anchor.add(mesh);
  parent.add(anchor);

  return {
    root: anchor,
    p5: p5api,
    get state() {
      return p5api.state;
    },
    applySliders() {},
    setStaticOverlayVisible() {},
    triggerSurrender() {
      p5api.triggerSurrender();
    },
    setVisible(visible) {
      anchor.visible = visible;
      if (soundBtn) soundBtn.style.display = visible ? "" : "none";
    },
    update() {
      tex.needsUpdate = true;
    },
    dispose() {
      parent.remove(anchor);
      tex.dispose();
      mesh.geometry.dispose();
      mesh.material.dispose();
      host.remove();
      soundBtn?.remove();
      delete window.__SURRENDER_ROOM_OPTS;
    },
  };
}
