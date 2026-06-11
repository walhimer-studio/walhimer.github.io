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

fs.mkdirSync(OUT, { recursive: true });

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
fs.writeFileSync(path.join(OUT, "index.html"), `<!doctype html><meta http-equiv="refresh" content="0;url=display.html?venue=mac-local">`);
fs.writeFileSync(
  path.join(OUT, "controller.html"),
  `<!doctype html><meta http-equiv="refresh" content="0;url=display.html${"?venue=mac-local"}">`
);

console.log("Deploying controller to Firebase Hosting…");

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
Phone + display (one screen):
  https://${firebaseConfig.projectId}.web.app/display.html?venue=mac-local

Mac brain: node bridge/dna-bridge.mjs
Local:     http://127.0.0.1:8791/display.html?venue=mac-local
`);
