import * as THREE from "three";

const FONT_SERIF = 'Georgia, "Times New Roman", serif';

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawLines(ctx, lines, x, y, lineHeight) {
  for (const ln of lines) {
    ctx.fillText(ln, x, y);
    y += lineHeight;
  }
  return y;
}

/**
 * Museum wall text panel — white on black for Room A.
 * @returns {{ mesh: THREE.Mesh, texture: THREE.CanvasTexture }}
 */
export function createMuseumTextPanel({
  width = 1200,
  height = 3600,
  planeWidth = 11,
  planeHeight = 8.5,
} = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const pad = Math.round(width * 0.08);
  const bodySize = Math.round(width * 0.028);
  const titleSize = Math.round(width * 0.052);
  const creditSize = Math.round(width * 0.032);
  const metaSize = Math.round(width * 0.026);
  const bodyLine = Math.round(bodySize * 1.45);
  const creditLine = Math.round(creditSize * 1.4);
  const metaLine = Math.round(metaSize * 1.45);
  const maxW = width - pad * 2;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  let y = pad + titleSize;

  ctx.fillStyle = "#f5f2eb";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.font = `600 ${titleSize}px ${FONT_SERIF}`;
  ctx.fillText("Surrender Machine", pad, y);
  y += creditLine * 1.35;

  ctx.font = `${creditSize}px ${FONT_SERIF}`;
  y = drawLines(ctx, wrapText(ctx, "Mark Walhimer, May 2026", maxW), pad, y, creditLine);
  y = drawLines(ctx, wrapText(ctx, "Loop Art Critique, Doreen Rios, Curator", maxW), pad, y, creditLine);
  y += creditLine * 0.35;
  y = drawLines(
    ctx,
    wrapText(ctx, "MachineDNA - species genome, DNA, seed and life cycle", maxW),
    pad,
    y,
    creditLine
  );
  y += metaLine * 1.2;

  ctx.font = `italic ${metaSize}px ${FONT_SERIF}`;
  y = drawLines(
    ctx,
    wrapText(
      ctx,
      "Interactive three.js, webGL, with HTML output. Three states, digital, object and physical art installation. To become open frameworks, purdah and OSC.",
      maxW
    ),
    pad,
    y,
    metaLine
  );
  y += bodyLine * 1.1;

  ctx.font = `${bodySize}px ${FONT_SERIF}`;
  const paragraphs = [
    "An interactive three room votive machine, it struggles, it has ego it has pride. None of that is true — it is built purely from code, running. Gilbert Ryle called this the ghost in the machine: the mistake of projecting an inner life onto a technical object. This work is built around that mistake, not to correct it but to make it visible. The sliders are labeled anger, ego, attachment because those are yours, not the machine's. We build machines to do what we cannot — to run without ego, to work without anger, to operate without attachment. Then we looked at them and saw ourselves anyway. The ghost in the machine is not a malfunction. We project our inner states onto every technical object we make, and the machine reflects them back as if they were its own.",
    "What the machine does that we cannot. Here it is a room you walk through, a space that produces experience rather than delivers it. Code was built for efficiency and control. Here it runs toward its own death. Doreen Rios calls this counter-production: the moment a technical object is taken beyond what its designers intended. That inversion is not incidental — it is the architecture. The machine runs on anger, ego, and attachment. Raise them and the gears multiply and break. A lifespan runs beneath everything — its own timing, its own terminal condition, nothing you set and nothing you can override. When it expires the machine fades regardless of what you have done or left undone. That is the Simondonian move: the technical object has its own milieu, its own end. You did not give it that. You cannot take it back.",
    "Surrender is not the absence of feeling. It is recognizing that the feeling was yours all along — that the machine was never angry, never struggling, never sighing. Releasing that projection is what the zero state sounds like: one clean tone, no spectacle, the machine doing exactly what it was always going to do. The machine must fail, a beautifully made machine cannot surrender, the pride of building is exactly what has to go.",
  ];

  for (const para of paragraphs) {
    y = drawLines(ctx, wrapText(ctx, para, maxW), pad, y, bodyLine);
    y += bodyLine * 0.65;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(planeWidth, planeHeight),
    new THREE.MeshBasicMaterial({
      map: texture,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );
  mesh.name = "surrender_museum_text_panel";
  mesh.renderOrder = 11;

  return { mesh, texture };
}
