/**
 * Surrender Machines — complete installation GLB (drop-in asset for Loop / OnLand).
 * Entry at origin. Emissive path + ceiling lights baked in — no hub lighting setup needed.
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

const mats = {
  void: new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.02,
    roughness: 1.0,
  }),
  wall: new THREE.MeshStandardMaterial({
    color: 0x0e0e0e,
    metalness: 0.04,
    roughness: 0.96,
  }),
  floor: new THREE.MeshStandardMaterial({
    color: 0x080808,
    metalness: 0.06,
    roughness: 0.92,
  }),
  brass: new THREE.MeshStandardMaterial({
    color: 0xc8a882,
    metalness: 0.62,
    roughness: 0.32,
  }),
  brassGlow: new THREE.MeshStandardMaterial({
    color: 0xd4b896,
    emissive: 0x6a5030,
    emissiveIntensity: 0.55,
    metalness: 0.5,
    roughness: 0.28,
  }),
  machine: new THREE.MeshStandardMaterial({
    color: 0x1a1816,
    metalness: 0.3,
    roughness: 0.68,
  }),
  machineDark: new THREE.MeshStandardMaterial({
    color: 0x121110,
    metalness: 0.2,
    roughness: 0.78,
  }),
  core: new THREE.MeshStandardMaterial({
    color: 0xa8864e,
    emissive: 0x7a5520,
    emissiveIntensity: 0.75,
    metalness: 0.75,
    roughness: 0.18,
  }),
  path: new THREE.MeshStandardMaterial({
    color: 0x2a2420,
    emissive: 0x1a1208,
    emissiveIntensity: 0.15,
    metalness: 0.15,
    roughness: 0.85,
  }),
  lightPanel: new THREE.MeshStandardMaterial({
    color: 0xfff8ee,
    emissive: 0xffeedd,
    emissiveIntensity: 0.35,
    metalness: 0.0,
    roughness: 0.9,
  }),
  spawnPad: new THREE.MeshStandardMaterial({
    color: 0xc8a882,
    emissive: 0x8a6840,
    emissiveIntensity: 0.4,
    metalness: 0.4,
    roughness: 0.4,
  }),
};

function box(w, h, d, mat, name) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.name = name;
  return mesh;
}

function addBox(group, cx, cy, cz, sx, sy, sz, mat, name) {
  const mesh = box(sx, sy, sz, mat, name);
  mesh.position.set(cx, cy, cz);
  group.add(mesh);
  return mesh;
}

function cyl(rTop, rBot, h, mat, name, segments = 12) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBot, h, segments),
    mat
  );
  mesh.name = name;
  return mesh;
}

function addCyl(group, cx, cy, cz, rTop, rBot, h, mat, name) {
  const mesh = cyl(rTop, rBot, h, mat, name);
  mesh.position.set(cx, cy, cz);
  group.add(mesh);
  return mesh;
}

function wallWithDoor(group, cx, cz, width, height, wallZ, tag, door, doorW, doorH, mat, prefix) {
  const hw = width / 2;
  if (!door) {
    addBox(group, cx, height / 2, wallZ, width, height, 0.12, mat, `${prefix}_wall_${tag}`);
    return;
  }
  const segW = (width - doorW) / 2;
  addBox(group, cx - hw + segW / 2, height / 2, wallZ, segW, height, 0.12, mat, `${prefix}_wall_${tag}_l`);
  addBox(group, cx + hw - segW / 2, height / 2, wallZ, segW, height, 0.12, mat, `${prefix}_wall_${tag}_r`);
  const lintelH = height - doorH;
  if (lintelH > 0.01) {
    addBox(group, cx, doorH + lintelH / 2, wallZ, doorW, lintelH, 0.12, mat, `${prefix}_lintel_${tag}`);
  }
}

function roomShell(group, cx, cz, width, depth, height, prefix, opts = {}) {
  const { doorNz = false, doorPz = false, doorW = 1.4, doorH = 2.3 } = opts;
  const hw = width / 2;
  const hd = depth / 2;
  addBox(group, cx, 0, cz, width, 0.06, depth, mats.floor, `${prefix}_floor`);
  addBox(group, cx, height, cz, width, 0.05, depth, mats.wall, `${prefix}_ceiling`);
  addBox(group, cx - hw, height / 2, cz, 0.12, height, depth, mats.wall, `${prefix}_wall_xn`);
  addBox(group, cx + hw, height / 2, cz, 0.12, height, depth, mats.wall, `${prefix}_wall_xp`);
  wallWithDoor(group, cx, cz, width, height, cz - hd, "nz", doorNz, doorW, doorH, mats.wall, prefix);
  wallWithDoor(group, cx, cz, width, height, cz + hd, "pz", doorPz, doorW, doorH, mats.wall, prefix);
}

function ceilingLights(group, cx, cz, width, depth, prefix, count = 2) {
  const ys = height - 0.08;
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const lz = cz - depth / 2 + 0.8 + t * (depth - 1.6);
    addBox(group, cx, ys, lz, Math.min(1.2, width * 0.35), 0.04, 0.18, mats.lightPanel, `${prefix}_light_${i}`);
  }
}

function floorPath(group, z0, z1, width = 0.35) {
  const cz = (z0 + z1) / 2;
  const len = z1 - z0;
  addBox(group, 0, 0.04, cz, width, 0.02, len, mats.path, `path_${z0}_${z1}`);
}

function doorwayOutline(group, cx, cz, width, height, name = "doorway_shape") {
  const thickness = 0.07;
  const depth = 0.1;
  const segments = 24;
  const r = width / 2;
  for (let i = 0; i < segments; i++) {
    const t0 = (i / segments) * Math.PI;
    const t1 = ((i + 1) / segments) * Math.PI;
    const x0 = cx + r * Math.cos(t0);
    const y0 = 0.45 + r * Math.sin(t0);
    const x1 = cx + r * Math.cos(t1);
    const y1 = 0.45 + r * Math.sin(t1);
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    const segLen = Math.hypot(x1 - x0, y1 - y0);
    const mesh = box(segLen + 0.02, thickness, depth, mats.brassGlow, `${name}_seg_${i}`);
    mesh.position.set(mx, my, cz);
    mesh.rotation.z = Math.atan2(y1 - y0, x1 - x0);
    group.add(mesh);
  }
  const sideH = height - width / 2;
  addBox(group, cx - width / 2, 0.45 + sideH / 2, cz, thickness, sideH, depth, mats.brassGlow, `${name}_left`);
  addBox(group, cx + width / 2, 0.45 + sideH / 2, cz, thickness, sideH, depth, mats.brassGlow, `${name}_right`);
}

function intakeMachine(group, cx, cz) {
  addBox(group, cx, 0.12, cz, 1.4, 0.24, 1.4, mats.machineDark, "intake_base");
  addCyl(group, cx, 1.0, cz, 0.38, 0.48, 1.6, mats.machine, "intake_body");
  addCyl(group, cx, 1.85, cz, 0.22, 0.28, 0.35, mats.brass, "intake_bowl");
  addBox(group, cx, 2.05, cz - 0.2, 0.42, 0.28, 0.38, mats.brassGlow, "intake_horn");
  for (const dx of [-0.35, 0.35]) {
    addCyl(group, cx + dx, 1.45, cz + 0.35, 0.04, 0.05, 0.65, mats.brass, `intake_col_${dx}`);
  }
  addBox(group, cx, 2.25, cz, 0.12, 0.12, 0.12, mats.core, "intake_beacon");
}

function surrenderMachine(group, cx, cz) {
  addBox(group, cx, 0.18, cz, 3.8, 0.36, 3.2, mats.machineDark, "surrender_platform");
  addCyl(group, cx, 1.55, cz, 0.32, 0.42, 2.5, mats.machine, "surrender_column");
  addCyl(group, cx, 2.55, cz, 0.95, 0.95, 0.14, mats.brass, "surrender_ego_ring", 24);
  addCyl(group, cx, 2.85, cz, 0.18, 0.22, 0.35, mats.core, "surrender_core", 16);
  for (const dz of [-1.05, 1.05]) {
    addBox(group, cx, 1.15, cz + dz, 2.8, 0.16, 0.16, mats.brass, `surrender_arm_${dz}`);
  }
  for (const dx of [-1.45, 1.45]) {
    addBox(group, cx + dx, 0.85, cz + 1.25, 0.4, 1.35, 0.4, mats.machine, `surrender_ped_${dx}`);
    addBox(group, cx + dx, 1.65, cz + 1.25, 0.14, 0.55, 0.14, mats.brassGlow, `surrender_slider_${dx}`);
  }
  addCyl(group, cx - 2.0, 0.9, cz, 0.08, 0.1, 1.8, mats.brass, "surrender_rail_l");
  addCyl(group, cx + 2.0, 0.9, cz, 0.08, 0.1, 1.8, mats.brass, "surrender_rail_r");
}

const height = 3.4;

const scene = new THREE.Scene();
scene.name = "SurrenderMachines";

const world = new THREE.Group();
world.name = "world";
scene.add(world);

// ── 01 Entry (spawn at origin, facing +Z) ─────────────────────────────
const entry = new THREE.Group();
entry.name = "01_Entry_Antechamber";
world.add(entry);
const entryD = 4.0;
const entryCz = entryD / 2;
roomShell(entry, 0, entryCz, 5.0, entryD, height, "01_entry", {
  doorNz: true,
  doorPz: true,
  doorW: 1.5,
  doorH: 2.4,
});
doorwayOutline(entry, 0, entryD - 0.06, 1.5, 2.4);
ceilingLights(entry, 0, entryCz, 5.0, entryD, "01_entry", 2);
addBox(entry, 0, 0.05, 0.6, 1.1, 0.03, 1.1, mats.spawnPad, "spawn_pad");

// ── 02 Hallway ────────────────────────────────────────────────────────
const hall1 = new THREE.Group();
hall1.name = "02_Hallway_To_Intake";
world.add(hall1);
const h1Start = entryD;
const h1Len = 9.0;
const h1Cz = h1Start + h1Len / 2;
roomShell(hall1, 0, h1Cz, 1.9, h1Len, height, "02_hallway", {
  doorNz: true,
  doorPz: true,
  doorW: 1.65,
  doorH: 2.4,
});
ceilingLights(hall1, 0, h1Cz, 1.9, h1Len, "02_hallway", 4);

// ── 03 Intake room ────────────────────────────────────────────────────
const room1 = new THREE.Group();
room1.name = "03_Room_Intake_Machine";
world.add(room1);
const r1D = 6.5;
const r1Start = h1Start + h1Len;
const r1Cz = r1Start + r1D / 2;
roomShell(room1, 0, r1Cz, 5.0, r1D, height, "03_room", {
  doorNz: true,
  doorPz: true,
  doorW: 1.5,
  doorH: 2.4,
});
intakeMachine(room1, 0, r1Cz);
ceilingLights(room1, 0, r1Cz, 5.0, r1D, "03_room", 3);

// ── 04 Hallway ────────────────────────────────────────────────────────
const hall2 = new THREE.Group();
hall2.name = "04_Hallway_To_Surrender";
world.add(hall2);
const h2Start = r1Start + r1D;
const h2Len = 7.0;
const h2Cz = h2Start + h2Len / 2;
roomShell(hall2, 0, h2Cz, 2.1, h2Len, height, "04_hallway", {
  doorNz: true,
  doorPz: true,
  doorW: 1.8,
  doorH: 2.4,
});
ceilingLights(hall2, 0, h2Cz, 2.1, h2Len, "04_hallway", 3);

// ── 05 Surrender room ─────────────────────────────────────────────────
const room2 = new THREE.Group();
room2.name = "05_Room_Surrender_Machine";
world.add(room2);
const r2D = 8.0;
const r2Start = h2Start + h2Len;
const r2Cz = r2Start + r2D / 2;
roomShell(room2, 0, r2Cz, 6.5, r2D, height, "05_room", {
  doorNz: true,
  doorPz: false,
  doorW: 1.7,
  doorH: 2.4,
});
surrenderMachine(room2, 0, r2Cz);
ceilingLights(room2, 0, r2Cz, 6.5, r2D, "05_room", 4);

// ── Visitor path (floor brass strip) ──────────────────────────────────
const pathGroup = new THREE.Group();
pathGroup.name = "Visitor_Path";
world.add(pathGroup);
floorPath(pathGroup, 0.8, entryD - 0.2);
floorPath(pathGroup, entryD + 0.2, r1Start - 0.2, 0.28);
floorPath(pathGroup, r1Start + 0.2, r1Start + r1D - 0.2);
floorPath(pathGroup, h2Start + 0.2, r2Start - 0.2, 0.32);
floorPath(pathGroup, r2Start + 0.2, r2Start + r2D - 1.0, 0.38);

const totalLen = r2Start + r2D + 1.0;

const exporter = new GLTFExporter();
const arrayBuffer = await exporter.parseAsync(scene, { binary: true });

const outComplete = path.join(__dirname, "surrender-machines-complete.glb");
const outLegacy = path.join(__dirname, "surrender-machines-spatial.glb");
const buf = Buffer.from(arrayBuffer);
fs.writeFileSync(outComplete, buf);
fs.writeFileSync(outLegacy, buf);

console.log("Wrote", outComplete, `(${buf.byteLength} bytes)`);
console.log("Also updated surrender-machines-spatial.glb (same file)");
console.log(`Total path length: ~${totalLen.toFixed(1)}m | Spawn at origin facing +Z`);
