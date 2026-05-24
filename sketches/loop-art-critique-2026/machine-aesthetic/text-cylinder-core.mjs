import * as THREE from "three";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const CANVAS_REF = 1450;
const LETTER_HSCALE = 0.45;

/**
 * text11.html draw loop — white letters on transparent, for Room A black background.
 */
function drawTextCylinderFrame(ctx, w, h, {
  phrase,
  rows,
  baseFontSize,
  rowSpacing,
  radius,
  tiltAngle,
  angle,
}) {
  const sc = w / CANVAS_REF;
  ctx.clearRect(0, 0, w, h);

  const letters = phrase.split("");
  if (!letters.length) return;

  const step = (2 * Math.PI) / letters.length;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const cx = w / 2;
  const cy = h / 2;
  const midRow = (rows - 1) / 2;
  const cosTilt = Math.cos(tiltAngle);
  const sinTilt = Math.sin(tiltAngle);
  const camZ = 1000;

  const drawn = [];
  for (let row = 0; row < rows; row++) {
    const rowY3D = (row - midRow) * rowSpacing;
    const twist = row * 0.12;

    letters.forEach((ch, j) => {
      const a = -j * step + twist;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;

      const rx = x * cosA - z * sinA;
      const rz = x * sinA + z * cosA;
      const ry = rowY3D * cosTilt - rz * sinTilt;
      const rz2 = rowY3D * sinTilt + rz * cosTilt;

      const depth = camZ - rz2;
      const scale = camZ / depth;
      const sx = cx + rx * scale * sc;
      const sy = cy + ry * scale * sc;
      const facing = rz > 0;
      const foreshorten = Math.abs(rz) / (radius || 1);

      drawn.push({ ch, sx, sy, scale, facing, rz2, foreshorten });
    });
  }

  drawn.sort((a, b) => a.rz2 - b.rz2);

  const fontSize = baseFontSize * sc;
  for (const { ch, sx, sy, scale, facing, foreshorten } of drawn) {
    ctx.font = `${fontSize}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = facing ? 1 : 0.55;
    ctx.fillStyle = facing ? "#ffffff" : "#888888";
    ctx.save();
    ctx.translate(sx, sy);
    const hScale = LETTER_HSCALE * foreshorten;
    if (!facing) ctx.scale(-hScale * scale, scale);
    else ctx.scale(hScale * scale, scale);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
}

/**
 * text11 word cylinder in world space — canvas illusion on a billboard plane.
 * @returns {{ group: THREE.Group, focus: THREE.Vector3, linkMeshes: THREE.Object3D[], update: (dt: number, camera?: THREE.Camera) => void }}
 */
export function createTextCylinder({
  phrase = "ME - I WILL NOT BECOME THEIR NARRATIVE ",
  rows = 8,
  radius = 320,
  rowSpacing = 88,
  baseFontSize = 64,
  tiltAngle = 0.14,
  rotSpeed = 0.55,
  planeSize = 7,
  position = { x: 0, y: 2.85, z: 0 },
  link = null,
} = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const faceMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.06,
    depthWrite: true,
    side: THREE.DoubleSide,
  });

  const group = new THREE.Group();
  group.name = "text_cylinder";
  group.position.set(position.x, position.y, position.z);

  const faces = new THREE.Group();
  faces.name = "text_cylinder_faces";
  group.add(faces);

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), faceMat);
  plane.renderOrder = 8;
  faces.add(plane);

  const hitMesh = new THREE.Mesh(
    new THREE.BoxGeometry(planeSize * 0.7, planeSize * 0.7, planeSize * 0.35),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitMesh.name = "text_cylinder_hit";
  hitMesh.userData.link = link;
  group.add(hitMesh);

  const focus = new THREE.Vector3(position.x, position.y, position.z);
  let angle = 0;

  drawTextCylinderFrame(ctx, canvas.width, canvas.height, {
    phrase,
    rows,
    baseFontSize,
    rowSpacing,
    radius,
    tiltAngle,
    angle,
  });
  texture.needsUpdate = true;

  return {
    group,
    focus,
    linkMeshes: [hitMesh],
    update(dt, camera) {
      angle += rotSpeed * dt;
      drawTextCylinderFrame(ctx, canvas.width, canvas.height, {
        phrase,
        rows,
        baseFontSize,
        rowSpacing,
        radius,
        tiltAngle,
        angle,
      });
      texture.needsUpdate = true;
      if (camera) faces.lookAt(camera.position);
    },
  };
}
