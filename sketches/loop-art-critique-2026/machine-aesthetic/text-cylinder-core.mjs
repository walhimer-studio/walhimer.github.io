import * as THREE from "three";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const charTexCache = new Map();

function letterTexture(ch, opacity = 1) {
  const key = `${ch}\0${opacity}`;
  if (charTexCache.has(key)) return charTexCache.get(key);

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);
  ctx.font = `600 ${Math.round(size * 0.68)}px ${FONT}`;
  ctx.fillStyle = `rgba(255,255,255,${opacity})`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ch, size / 2, size / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  charTexCache.set(key, tex);
  return tex;
}

function makeLetterMesh(ch, letterHeight, hScale) {
  const aspect = hScale;
  const w = letterHeight * aspect;
  const mat = new THREE.MeshBasicMaterial({
    map: letterTexture(ch, 1),
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, letterHeight), mat);
  mesh.renderOrder = 5;
  return mesh;
}

/**
 * 3D text cylinder — layout from text11.html, placed in world space.
 * @returns {{ group: THREE.Group, linkMeshes: THREE.Object3D[], update: (dt: number) => void }}
 */
export function createTextCylinder({
  phrase = "ME - I WILL NOT BECOME THEIR NARRATIVE ",
  rows = 8,
  radius = 2.75,
  rowSpacing = 0.52,
  letterHeight = 0.34,
  letterHScale = 0.45,
  tiltAngle = 0.14,
  rotSpeed = 0.38,
  position = { x: 0, y: 4.15, z: 0 },
  link = null,
} = {}) {
  const group = new THREE.Group();
  group.name = "text_cylinder";
  group.position.set(position.x, position.y, position.z);

  const spin = new THREE.Group();
  spin.rotation.x = tiltAngle;
  group.add(spin);

  const letters = phrase.split("");
  const step = (2 * Math.PI) / letters.length;
  const midRow = (rows - 1) / 2;

  for (let row = 0; row < rows; row++) {
    const rowY = (row - midRow) * rowSpacing;
    const twist = row * 0.12;

    letters.forEach((ch, j) => {
      const a = -j * step + twist;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;

      const mesh = makeLetterMesh(ch, letterHeight, letterHScale);
      mesh.position.set(x, rowY, z);
      mesh.lookAt(x * 2, rowY, z * 2);
      spin.add(mesh);
    });
  }

  const hitH = rows * rowSpacing * 1.05;
  const hitMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.12, radius * 1.12, hitH, 20, 1, true),
    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
  );
  hitMesh.name = "text_cylinder_hit";
  hitMesh.userData.link = link;
  group.add(hitMesh);

  let angle = 0;
  return {
    group,
    linkMeshes: [hitMesh],
    update(dt) {
      angle += rotSpeed * dt;
      spin.rotation.y = angle;
    },
  };
}
