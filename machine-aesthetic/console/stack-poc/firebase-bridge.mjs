#!/usr/bin/env node
/**
 * Stack POC — Firebase Realtime Database → local OSC (UDP 7400).
 * Firebase is the slow/remote path; Pd and OF stay on the hot OSC bus.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import { createOscSender } from "../bridge/osc-send.mjs";
import { seedToHz } from "./lib/seed-rng.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadConfig() {
  const local = path.join(__dirname, "firebase-config.local.mjs");
  const example = path.join(__dirname, "firebase-config.example.mjs");
  const target = fs.existsSync(local) ? local : example;
  if (target === example) {
    console.warn("Using firebase-config.example.mjs — copy to firebase-config.local.mjs with real keys.");
  }
  return import(target);
}

const HOST = process.env.SM_OSC_HOST ?? "127.0.0.1";
const PORT = Number(process.env.SM_OSC_PORT ?? 7400);

const osc = createOscSender(HOST, PORT);
let last = { seed: null, energy: null, mood: null };

function emitState({ seed, energy, mood }) {
  const s = Number(seed) >>> 0 || 77823;
  const e = Math.max(0, Math.min(1, Number(energy) || 0));
  const m = Math.max(0, Math.min(1, Number(mood) || 0));
  const hz = seedToHz(s, e);

  osc.send("/sm/poc/seed", s);
  osc.send("/sm/poc/energy", e);
  osc.send("/sm/poc/mood", m);

  osc.send("/sm/console/seed", s);
  osc.send("/sm/state/energy", e);
  osc.send("/sm/state/stress", 1 - m);
  osc.send("/sm/gear/hz", 0, hz);

  if (last.seed !== s || last.energy !== e || last.mood !== m) {
    console.log(`→ OSC seed=${s} energy=${e.toFixed(2)} mood=${m.toFixed(2)} hz=${hz.toFixed(1)}`);
    last = { seed: s, energy: e, mood: m };
  }
}

const { firebaseConfig, RTDB_PATH } = await loadConfig();
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const stateRef = ref(db, RTDB_PATH);

osc.send("/sm/poc/ready", 1);
osc.send("/sm/console/ready", 1);
console.log(`Stack POC bridge → OSC ${HOST}:${PORT} · Firebase ${RTDB_PATH}`);

onValue(
  stateRef,
  (snap) => {
    const data = snap.val();
    if (data) emitState(data);
  },
  (err) => console.error("Firebase error:", err.message)
);

setInterval(() => osc.send("/sm/heartbeat"), 1000);

process.on("SIGINT", () => {
  osc.close();
  process.exit(0);
});
