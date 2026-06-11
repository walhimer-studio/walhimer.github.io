#!/usr/bin/env node
/** Quick stack diagnostic — run while bridge is stopped or running. */
import dgram from "dgram";
import { loadConfig } from "../lib/load-config.mjs";
import { createPlainPdSender } from "../lib/plain-pd-udp.mjs";

const PLAIN_PORT = Number(process.env.SM_PLAIN_PD_PORT ?? 7401);

console.log("Surrender Stack POC — diagnose\n");

let ok = 0;
let fail = 0;
function pass(msg) { ok++; console.log("  ✓", msg); }
function failMsg(msg) { fail++; console.log("  ✗", msg); }

// 1. Config files
try {
  await loadConfig("firebase-config");
  pass("firebase-config.local.mjs loads");
} catch (e) {
  failMsg(`firebase config: ${e.message}`);
}

try {
  await loadConfig("supabase-config");
  pass("supabase-config.local.mjs loads");
} catch (e) {
  failMsg(`supabase config: ${e.message}`);
}

// 2. Supabase
try {
  const { supabaseConfig, SPECIES_ID } = await loadConfig("supabase-config");
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey);
  const { data, error } = await sb.from("venues").select("id").limit(1);
  if (error) failMsg(`Supabase: ${error.message}`);
  else pass(`Supabase connected (${data?.length ?? 0} venue row)`);
} catch (e) {
  failMsg(`Supabase: ${e.message}`);
}

// 3. Firebase write test
try {
  const { initializeApp } = await import("firebase/app");
  const { getDatabase, ref, set, get } = await import("firebase/database");
  const { firebaseConfig, FIREBASE_OPERATOR_ROOT } = await loadConfig("firebase-config");
  const app = initializeApp(firebaseConfig, "diagnose-test");
  const db = getDatabase(app);
  const testRef = ref(db, `${FIREBASE_OPERATOR_ROOT}/_diagnose`);
  await set(testRef, { ts: Date.now(), ok: true });
  const snap = await get(testRef);
  if (snap.val()?.ok) pass("Firebase Realtime Database read/write");
  else failMsg("Firebase write did not round-trip");
} catch (e) {
  failMsg(`Firebase: ${e.message}`);
  console.log("    → Firebase Console → Realtime Database → Rules");
  console.log("    → Paste config/firebase-database.rules.json (test mode)");
}

// 4. UDP to Pd
try {
  const plain = createPlainPdSender("127.0.0.1", PLAIN_PORT);
  plain.sendLine("seed", 77823);
  plain.sendLine("hz", 220);
  plain.close();
  pass(`UDP plain sent to 127.0.0.1:${PLAIN_PORT} — check Pd for RAW/seed`);
} catch (e) {
  failMsg(`UDP: ${e.message}`);
}

// 5. OSC port open test
try {
  const sock = dgram.createSocket("udp4");
  await new Promise((resolve, reject) => {
    sock.bind(7400, "127.0.0.1", () => {
      sock.close();
      resolve();
    });
    sock.on("error", reject);
  });
  pass("UDP 7400 available for OSC (or bridge already bound — OK if bridge running)");
} catch (e) {
  console.log("  ~ UDP 7400 in use (bridge running) — OK");
}

console.log(`\n${ok} passed, ${fail} failed`);
console.log("\nPhone controller (same Wi‑Fi):");
console.log("  http://192.168.1.73:8791/controller.html?venue=mac-local");
console.log("  (replace IP — run: ipconfig getifaddr en0)");
console.log("\nIf phone page won't load → Mac System Settings → Network → Firewall → allow node");
console.log("If sliders won't connect → Firebase Rules (see config/firebase-database.rules.json)");

process.exit(fail > 0 ? 1 : 0);
