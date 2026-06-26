/**
 * Loop 21 — single clickable wall for Surrender Machines HTML.
 * Upload loop_21_surrender_portal.glb to Archive, spawn in verse, set Link Href on portal_panel.
 *
 * Run from this folder (needs `npm install` once):
 *   node build-loop-21-surrender-portal-glb.mjs
 */
import * as THREE from "three";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

globalThis.FileReader = class NodeFileReader {
  constructor() {
    this.result = null;
    this.onloadend = null;
  }
  readAsArrayBuffer(blob) {
    Promise.resolve(blob.arrayBuffer()).then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
  readAsDataURL(blob) {
    Promise.resolve(blob.arrayBuffer()).then((buf) => {
      this.result =
        "data:application/octet-stream;base64," +
        Buffer.from(buf).toString("base64");
      if (this.onloadend) this.onloadend();
    });
  }
};

const { GLTFExporter } = await import(
  "three/examples/jsm/exporters/GLTFExporter.js"
);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ARTWORK_URL =
  "https://mark-walhimer.com/sketches/loop-snippets/rgb-xyz-vol3d-code.html";

const PANEL_H = 2.4;
const PANEL_W = PANEL_H * (16 / 9);
const PANEL_D = 0.12;
const WALL_T = 0.15;
const WALL_W = PANEL_W + 0.6;
const WALL_H = PANEL_H + 0.4;

const scene = new THREE.Scene();
scene.name = "Loop21SurrenderPortal";

const root = new THREE.Group();
root.name = "surrender_portal";
scene.add(root);

const wallMat = new THREE.MeshBasicMaterial({ color: 0x111010 });
const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });

const wall = new THREE.Mesh(
  new THREE.BoxGeometry(WALL_T, WALL_H, WALL_W),
  wallMat
);
wall.name = "wall_backing";
wall.position.set(0, WALL_H / 2, 0);
root.add(wall);

const portalPanel = new THREE.Mesh(
  new THREE.BoxGeometry(PANEL_D, PANEL_H, PANEL_W),
  new THREE.MeshBasicMaterial({ color: 0x000000 })
);
portalPanel.name = "portal_panel";
portalPanel.position.set(-(WALL_T / 2 + PANEL_D / 2 + 0.02), WALL_H / 2, 0);
root.add(portalPanel);

const xLine = portalPanel.position.x - PANEL_D / 2 - 0.03;
const yMid = portalPanel.position.y;
const halfH = PANEL_H / 2;
const halfW = PANEL_W / 2;
const y0 = yMid - halfH;
const y1 = yMid + halfH;
const z0 = -halfW;
const z1 = halfW;

function portalEdge(name, ax, ay, az, bx, by, bz) {
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(ax, ay, az),
      new THREE.Vector3(bx, by, bz),
    ]),
    edgeMat
  );
  line.name = name;
  line.renderOrder = 2;
  root.add(line);
}

portalEdge("portal_rect_bottom", xLine, y0, z0, xLine, y0, z1);
portalEdge("portal_rect_top", xLine, y1, z0, xLine, y1, z1);
portalEdge("portal_rect_w", xLine, y0, z0, xLine, y1, z0);
portalEdge("portal_rect_e", xLine, y0, z1, xLine, y1, z1);

const exporter = new GLTFExporter();
const arrayBuffer = await exporter.parseAsync(scene, { binary: true });
const outPath = path.join(__dirname, "loop_21_surrender_portal.glb");
fs.writeFileSync(outPath, Buffer.from(arrayBuffer));

console.log("Wrote", outPath, `(${Buffer.byteLength(arrayBuffer)} bytes)`);
console.log(`Link mesh: surrender_portal → portal_panel (${PANEL_W.toFixed(2)}m × ${PANEL_H.toFixed(2)}m)`);
console.log("");
console.log("Loop / XR Creator setup:");
console.log("  1. Upload loop_21_surrender_portal.glb to Archive");
console.log("  2. Spawn in Loop 21 verse — face portal toward visitors");
console.log("  3. Hierarchy → surrender_portal → portal_panel");
console.log("  4. portal_panel → Link Href →", ARTWORK_URL);
