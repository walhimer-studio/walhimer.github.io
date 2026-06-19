#!/usr/bin/env node
/**
 * One-shot asset gen for Ghost Room Phase 2 — code mural texture.
 * Reads canonical browser source (read-only); writes PNG for OF host.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../..");
const LOOP_MA = path.join(REPO, "sketches/loop-art-critique-2026/machine-aesthetic");
const requireFromLoop = createRequire(path.join(LOOP_MA, "package.json"));
const { createCanvas } = requireFromLoop("@napi-rs/canvas");
const CORE = path.join(
  REPO,
  "sketches/loop-art-critique-2026/machine-aesthetic/ghost-machine-core.mjs"
);
const OUT_DIR = path.join(
  REPO,
  "machine-aesthetic/console/openframeworks/GhostRoom77823/bin/data"
);
const OUT_PNG = path.join(OUT_DIR, "code-wallpaper-77823.png");
const OUT_TXT = path.join(OUT_DIR, "wallpaper-source-77823.txt");

const SEED = 77823;
const ROOM_HEIGHT = 9;

function pickCodeColor(tok) {
  if (/^\/\//.test(tok)) return "#707070";
  if (
    /^(function|class|const|let|for|if|return|new|this|pushSpin|popSpin|drawMachine|WireBuilder)$/.test(
      tok
    )
  ) {
    return "#74b4dc";
  }
  if (/^0x[0-9a-fA-F]+$/.test(tok) || /^[0-9.]+$/.test(tok) || tok === "SEED") {
    return "#eca018";
  }
  if (/^["'`]/.test(tok)) return "#eca018";
  return "#aaaaaa";
}

function drawCodeTokens(ctx, raw, x, y, fontPx) {
  const tokens = raw.match(/\s+|[^\s]+/g) || [];
  let cx = x;
  for (const tok of tokens) {
    if (/^\s+$/.test(tok)) {
      cx += fontPx * 0.22 * tok.length;
      continue;
    }
    ctx.fillStyle = pickCodeColor(tok);
    ctx.fillText(tok, cx, y);
    cx += ctx.measureText(tok).width + fontPx * 0.06;
  }
}

async function main() {
  const { getWallpaperSource } = await import(pathToFileURL(CORE).href);
  const source = getWallpaperSource(SEED);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_TXT, source, "utf8");

  const W = 2048;
  const H = 2048;
  const footPx = Math.round((0.3048 / ROOM_HEIGHT) * H);
  const lineH = Math.round(footPx * 1.05);
  const pad = Math.round(footPx * 0.35);
  const maxW = W - pad * 2;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);
  ctx.font = `${footPx}px monospace`;
  ctx.textBaseline = "alphabetic";

  let y = pad + footPx;
  for (const raw of source.split("\n")) {
    let rest = raw;
    while (rest.length > 0 && y < H - pad) {
      let n = rest.length;
      while (n > 1 && ctx.measureText(rest.slice(0, n)).width > maxW) n--;
      drawCodeTokens(ctx, rest.slice(0, n), pad, y, footPx);
      rest = rest.slice(n);
      y += lineH;
    }
  }

  fs.writeFileSync(OUT_PNG, canvas.toBuffer("image/png"));
  console.log(`Wrote ${OUT_PNG}`);
  console.log(`Wrote ${OUT_TXT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
