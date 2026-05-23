/**
 * Export ghost 77823 in a white room as GLB for Loop / OnLand.
 */
import * as THREE from "three";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildGhostMachine, buildWalkthroughRoomComplex, buildMachineRunClip, ROOM, LAYOUT, ROOM_A_X, ROOM_C_X } from "./ghost-machine-core.mjs";
import {
  buildSurrenderMachine,
  buildSurrenderRunClip,
  surrenderScaleForRoom,
  SURRENDER_DEFAULT_SLIDERS,
} from "./surrender-machine-core.mjs";

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

const { createCanvas, ImageData } = await import("@napi-rs/canvas");
globalThis.ImageData = ImageData;
globalThis.document = {
  createElement(tag) {
    if (tag === "canvas") return createCanvas(256, 256);
    return {};
  },
};

const scene = new THREE.Scene();
scene.name = "Ghost77823WhiteRoom";

const world = new THREE.Group();
world.name = "world";
scene.add(world);

await buildWalkthroughRoomComplex(world, ROOM.width, ROOM.depth, ROOM.height, { wallpaper: true });
const { builder } = buildGhostMachine(world);

const surrender = buildSurrenderMachine({
  parent: world,
  x: ROOM_C_X,
  y: 0.04,
  z: 0,
  scale: surrenderScaleForRoom(ROOM.height),
  flat: true,
  seed: 77823,
  sliders: SURRENDER_DEFAULT_SLIDERS,
});

surrender.lights?.forEach?.((l) => scene.add(l));
if (!surrender.lights?.length) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const dir1 = new THREE.DirectionalLight(0xffffff, 0.55);
  dir1.position.set(350, -400, -1000);
  scene.add(dir1);
  const dir2 = new THREE.DirectionalLight(0xb4b4ff, 0.35);
  dir2.position.set(-300, 200, 1000);
  scene.add(dir2);
}

world.updateMatrixWorld(true);

const runClip = buildMachineRunClip(builder);
const surrenderClip = buildSurrenderRunClip(surrender.spinners);

const exporter = new GLTFExporter();
const arrayBuffer = await exporter.parseAsync(scene, {
  binary: true,
  animations: [runClip, surrenderClip],
});
const outPath = path.join(__dirname, "ghost_dense_77823_room.glb");
fs.writeFileSync(outPath, Buffer.from(arrayBuffer));
console.log("Wrote", outPath, `(${Buffer.byteLength(arrayBuffer)} bytes)`);
console.log(`Rooms A–B–C · hall A–B ${LAYOUT.hallwayLengthAB}m · hall B–C ${LAYOUT.hallwayLength}m`);
console.log(`Room C · surrender machine seed 77823 · ${surrender.spinners.length} spinners baked`);
console.log(`OnLand spawn (room A, face hall): position (${ROOM_A_X - 8}, 1.1, 0) · rotation Y -90°`);
