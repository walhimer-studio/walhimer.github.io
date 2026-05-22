/**
 * Minimal black Room A shell for Loop / OnLand.
 * White rectangle on east wall — set Link Href on `portal_panel` → HTML walkthrough.
 */
import * as THREE from "three";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ROOM } from "./ghost-machine-core.mjs";

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

/** Same footprint as walkthrough Room A */
const WIDTH = ROOM.width;
const DEPTH = ROOM.depth;
const HEIGHT = ROOM.height;
const WALL_T = 0.15;

const WALKTHROUGH_URL =
  "https://mark-walhimer.com/sketches/loop-snippets/loop-machine-aesthetic/ghost_dense_77823_room.html";

const scene = new THREE.Scene();
scene.name = "LoopPortalRoomA";

const root = new THREE.Group();
root.name = "room_a_portal";
scene.add(root);

const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

const hw = WIDTH / 2;
const hd = DEPTH / 2;

function box(name, sx, sy, sz, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), blackMat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  root.add(mesh);
}

box("floor", WIDTH, 0.08, DEPTH, 0, 0, 0);
box("ceiling", WIDTH, 0.06, DEPTH, 0, HEIGHT, 0);
box("wall_n", WIDTH, HEIGHT, WALL_T, 0, HEIGHT / 2, -hd);
box("wall_s", WIDTH, HEIGHT, WALL_T, 0, HEIGHT / 2, hd);
box("wall_w", WALL_T, HEIGHT, DEPTH, -hw, HEIGHT / 2, 0);
box("wall_e", WALL_T, HEIGHT, DEPTH, hw, HEIGHT / 2, 0);

const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
const inset = 0.01;
const ix0 = -hw + WALL_T / 2 + inset;
const ix1 = hw - WALL_T / 2 - inset;
const iz0 = -hd + WALL_T / 2 + inset;
const iz1 = hd - WALL_T / 2 - inset;
const yFloor = 0.04 + inset;
const yCeil = HEIGHT - 0.03 - inset;
const cg = 0.04;

function edge(name, ax, ay, az, bx, by, bz) {
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(ax, ay, az),
      new THREE.Vector3(bx, by, bz),
    ]),
    edgeMat
  );
  line.name = name;
  line.renderOrder = 1;
  root.add(line);
}

edge("edge_floor_n", ix0 + cg, yFloor, iz0, ix1 - cg, yFloor, iz0);
edge("edge_floor_e", ix1, yFloor, iz0 + cg, ix1, yFloor, iz1 - cg);
edge("edge_floor_s", ix1 - cg, yFloor, iz1, ix0 + cg, yFloor, iz1);
edge("edge_floor_w", ix0, yFloor, iz1 - cg, ix0, yFloor, iz0 + cg);
edge("edge_ceil_n", ix0 + cg, yCeil, iz0, ix1 - cg, yCeil, iz0);
edge("edge_ceil_e", ix1, yCeil, iz0 + cg, ix1, yCeil, iz1 - cg);
edge("edge_ceil_s", ix1 - cg, yCeil, iz1, ix0 + cg, yCeil, iz1);
edge("edge_ceil_w", ix0, yCeil, iz1 - cg, ix0, yCeil, iz0 + cg);
edge("corner_nw", ix0, yFloor + cg, iz0, ix0, yCeil - cg, iz0);
edge("corner_ne", ix1, yFloor + cg, iz0, ix1, yCeil - cg, iz0);
edge("corner_se", ix1, yFloor + cg, iz1, ix1, yCeil - cg, iz1);
edge("corner_sw", ix0, yFloor + cg, iz1, ix0, yCeil - cg, iz1);

/**
 * Link target on east wall. White lines are visual only — not selectable in Loop.
 * Select mesh `portal_panel` from the Hierarchy (or click the wall area in front of the rectangle).
 */
const PANEL_H = HEIGHT * 0.62;
const PANEL_W = PANEL_H * (16 / 9);
const PANEL_D = 0.2;
const yMid = HEIGHT * 0.48;
const halfH = PANEL_H / 2;
const halfW = PANEL_W / 2;
const xInnerWall = ix1;
const xLine = xInnerWall - 0.04;
const xPanelCenter = xInnerWall - 0.12 - PANEL_D / 2;
const y0 = yMid - halfH;
const y1 = yMid + halfH;
const z0 = -halfW;
const z1 = halfW;

const portalLink = new THREE.Group();
portalLink.name = "portal_link";
scene.add(portalLink);

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
  portalLink.add(line);
}

portalEdge("portal_rect_bottom", xLine, y0, z0, xLine, y0, z1);
portalEdge("portal_rect_top", xLine, y1, z0, xLine, y1, z1);
portalEdge("portal_rect_w", xLine, y0, z0, xLine, y1, z0);
portalEdge("portal_rect_e", xLine, y0, z1, xLine, y1, z1);

const portalPanel = new THREE.Mesh(
  new THREE.BoxGeometry(PANEL_D, PANEL_H, PANEL_W),
  blackMat
);
portalPanel.name = "portal_panel";
portalPanel.position.set(xPanelCenter, yMid, 0);
portalLink.add(portalPanel);

const exporter = new GLTFExporter();
const arrayBuffer = await exporter.parseAsync(scene, { binary: true });
const outPath = path.join(__dirname, "loop_portal_room_a.glb");
fs.writeFileSync(outPath, Buffer.from(arrayBuffer));

console.log("Wrote", outPath, `(${Buffer.byteLength(arrayBuffer)} bytes)`);
console.log(`Room A footprint: ${WIDTH}m × ${DEPTH}m × ${HEIGHT}m · pure black`);
console.log(`Link mesh: portal_link → portal_panel (${PANEL_W.toFixed(2)}m × ${PANEL_H.toFixed(2)}m)`);
console.log("");
console.log("Loop / XR Creator setup:");
console.log("  1. Upload loop_portal_room_a.glb to Archive");
console.log("  2. Spawn facing +X (east wall / white rectangle)");
console.log("  3. Hierarchy → portal_link → portal_panel (do NOT pick the white line objects)");
console.log("  4. portal_panel → Link Href →", WALKTHROUGH_URL);
