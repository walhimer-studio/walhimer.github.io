/**
 * Thin 16:9 panel (~9 ft tall) + front bezel frame ? GLB for Loop / Verse upload.
 * Units: meters (glTF convention). 9 ft = 9 * 0.3048 m.
 *
 * Node: Three's GLTFExporter expects FileReader; polyfilled below.
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

const FT_TO_M = 0.3048;
const HEIGHT_FT = 9;
const HEIGHT_M = HEIGHT_FT * FT_TO_M;
const WIDTH_M = HEIGHT_M * (16 / 9);
const PANEL_DEPTH_M = 2 * FT_TO_M * 0.083333; // ~2 in slab depth

const FRAME_THICKNESS = HEIGHT_M * 0.038;
const FRAME_DEPTH_M = Math.max(PANEL_DEPTH_M * 1.5, 0.04);

const scene = new THREE.Scene();
scene.name = "CritiqueFrame16x9";

const group = new THREE.Group();
group.name = "critique_frame_16x9_9ft";

const panelMat = new THREE.MeshStandardMaterial({
  color: 0x1c1b18,
  metalness: 0.15,
  roughness: 0.88,
});
const frameMat = new THREE.MeshStandardMaterial({
  color: 0x3d3830,
  metalness: 0.12,
  roughness: 0.78,
});

const panel = new THREE.Mesh(
  new THREE.BoxGeometry(WIDTH_M, HEIGHT_M, PANEL_DEPTH_M),
  panelMat
);
panel.name = "panel_thin";
group.add(panel);

const zFront = PANEL_DEPTH_M / 2 + FRAME_DEPTH_M / 2 + 0.0002;
const fw = FRAME_THICKNESS;
const innerH = HEIGHT_M - 2 * fw;

const top = new THREE.Mesh(
  new THREE.BoxGeometry(WIDTH_M, fw, FRAME_DEPTH_M),
  frameMat
);
top.position.set(0, HEIGHT_M / 2 - fw / 2, zFront);
top.name = "frame_top";
group.add(top);

const bottom = new THREE.Mesh(
  new THREE.BoxGeometry(WIDTH_M, fw, FRAME_DEPTH_M),
  frameMat
);
bottom.position.set(0, -HEIGHT_M / 2 + fw / 2, zFront);
bottom.name = "frame_bottom";
group.add(bottom);

const left = new THREE.Mesh(
  new THREE.BoxGeometry(fw, innerH, FRAME_DEPTH_M),
  frameMat
);
left.position.set(-WIDTH_M / 2 + fw / 2, 0, zFront);
left.name = "frame_left";
group.add(left);

const right = new THREE.Mesh(
  new THREE.BoxGeometry(fw, innerH, FRAME_DEPTH_M),
  frameMat
);
right.position.set(WIDTH_M / 2 - fw / 2, 0, zFront);
right.name = "frame_right";
group.add(right);

scene.add(group);

const exporter = new GLTFExporter();
const arrayBuffer = await exporter.parseAsync(scene, { binary: true });
const outPath = path.join(__dirname, "critique-frame-16x9-9ft.glb");
fs.writeFileSync(outPath, Buffer.from(arrayBuffer));

console.log("Wrote", outPath);
console.log(
  "Size (m): width=%s height=%s panel_depth=%s | ~%s ft tall",
  WIDTH_M.toFixed(4),
  HEIGHT_M.toFixed(4),
  PANEL_DEPTH_M.toFixed(4),
  HEIGHT_FT
);
