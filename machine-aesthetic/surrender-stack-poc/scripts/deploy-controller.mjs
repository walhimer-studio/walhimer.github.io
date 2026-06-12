#!/usr/bin/env node
/**
 * Deploy operator controller to Firebase Hosting — phone uses HTTPS, no LAN to Mac.
 * Requires: firebase login, firebase-config.local.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "hosting-public");
const cfgPath = path.join(ROOT, "config", "firebase-config.local.mjs");

if (!fs.existsSync(cfgPath)) {
  console.error("Missing config/firebase-config.local.mjs");
  process.exit(1);
}

const cfg = await import(pathToFileURL(cfgPath).href);
const { firebaseConfig, FIREBASE_OPERATOR_ROOT, FIREBASE_GENOME_ROOT } = cfg;

const REPO_ROOT = path.join(ROOT, "..", "..");
const ARTWORK_SRC = path.join(
  REPO_ROOT,
  "sketches/loop-snippets/ghost_dense_77823_three_sliders.html"
);

if (!fs.existsSync(ARTWORK_SRC)) {
  console.error("Missing artwork:", ARTWORK_SRC);
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

/** Public face — user's ghost dense sliders sketch (verbatim copy, not edited). */
const artworkHtml = fs.readFileSync(ARTWORK_SRC, "utf8");
fs.writeFileSync(path.join(OUT, "index.html"), artworkHtml);
fs.writeFileSync(path.join(OUT, "ghost_dense_77823_three_sliders.html"), artworkHtml);

const controllerSrc = fs.readFileSync(path.join(ROOT, "web", "display.html"), "utf8");
const hosted = controllerSrc.replace(
  'async function loadCfg() {',
  `async function loadCfg() {
      return {
        firebaseConfig: ${JSON.stringify(firebaseConfig)},
        FIREBASE_OPERATOR_ROOT: ${JSON.stringify(FIREBASE_OPERATOR_ROOT)},
        FIREBASE_GENOME_ROOT: ${JSON.stringify(FIREBASE_GENOME_ROOT)},
        source: "hosting",
      };
      /* hosted — skip LAN fetch */`
);

fs.writeFileSync(path.join(OUT, "display.html"), hosted);
fs.writeFileSync(
  path.join(OUT, "controller.html"),
  `<!doctype html><meta http-equiv="refresh" content="0;url=display.html?venue=mac-local">`
);

console.log("Deploying to Firebase Hosting…");
console.log("  artwork:", path.relative(REPO_ROOT, ARTWORK_SRC));

function firebaseBin() {
  const local = path.join(ROOT, "node_modules", ".bin", "firebase");
  return fs.existsSync(local) ? local : "firebase";
}

const r = spawnSync(
  firebaseBin(),
  ["deploy", "--only", "hosting", "--project", firebaseConfig.projectId],
  { cwd: ROOT, stdio: "inherit" }
);

if (r.error?.code === "ENOENT" || r.status !== 0) {
  console.error(`
Deploy failed.

Run these commands ONE AT A TIME (no # comments):

  cd ${ROOT}
  npm install
  npx firebase login
  npm run deploy-controller
`);
  process.exit(r.status ?? 1);
}

console.log(`
Public artwork (ghost dense · sliders):
  https://${firebaseConfig.projectId}.web.app/
  https://${firebaseConfig.projectId}.web.app/ghost_dense_77823_three_sliders.html

Stack POC display (cube + genome HUD):
  https://${firebaseConfig.projectId}.web.app/display.html?venue=mac-local

Cloud brain: Render worker (or local node bridge/dna-bridge.mjs)
`);
