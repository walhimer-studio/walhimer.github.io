#!/usr/bin/env node
/**
 * Surrender Stack POC — install brain (genome authority).
 *
 * Firebase  → operator input only
 * Supabase  → genome + scars persistence + cross-venue merge
 * OSC       → local hot path for Pd / OF / future Pis
 *
 * Does not modify artwork files. Imports Emergent DNA kernel read-only.
 */
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, set } from "firebase/database";
import { createOrganism } from "../../emergent-dna/kernel/index.mjs";
import { loadConfig } from "../lib/load-config.mjs";
import { expressToOsc, createOscBus } from "../lib/express-osc.mjs";
import { createPlainPdSender, expressToPlainPd } from "../lib/plain-pd-udp.mjs";
import { mergeRemoteScarsIntoExpress, findNewScars } from "../lib/scar-merge.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VENUE_ID = process.env.SM_VENUE_ID ?? "mac-local";
const BIRTH_SEED = Number(process.env.SM_SEED ?? 77823) >>> 0;
const OSC_HOST = process.env.SM_OSC_HOST ?? "127.0.0.1";
const OSC_PORT = Number(process.env.SM_OSC_PORT ?? 7400);
const PLAIN_PD_PORT = Number(process.env.SM_PLAIN_PD_PORT ?? 7401);
const SCAR_SYNC_MS = Number(process.env.SM_SCAR_SYNC_MS ?? 900_000);
const TICK_HZ = Number(process.env.SM_TICK_HZ ?? 30);
const GENOME_FB_MS = Number(process.env.SM_GENOME_FB_MS ?? 500);

const firebaseMod = await loadConfig("firebase-config");
const supabaseMod = await loadConfig("supabase-config");

const { firebaseConfig, FIREBASE_OPERATOR_ROOT, FIREBASE_GENOME_ROOT } = firebaseMod;
const { supabaseConfig, SPECIES_ID } = supabaseMod;

const fbApp = initializeApp(firebaseConfig, `surrender-stack-${VENUE_ID}`);
const rtdb = getDatabase(fbApp);
const operatorRef = ref(rtdb, `${FIREBASE_OPERATOR_ROOT}/${VENUE_ID}`);
const genomeFbRef = ref(rtdb, `${FIREBASE_GENOME_ROOT}/${VENUE_ID}`);

const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});

const osc = createOscBus(OSC_HOST, OSC_PORT);
const plainPd = createPlainPdSender(OSC_HOST, PLAIN_PD_PORT);

/** @type {ReturnType<typeof createOrganism>} */
let organism;
const persistedScarIds = new Set();
let operator = { leftRight: 0, upDown: 0, speed: 100, stopMotion: false };
let lastExpressJson = "";
let lastFbWrite = 0;
let lastSupabaseWrite = 0;
const SUPABASE_WRITE_MS = Number(process.env.SM_SUPABASE_WRITE_MS ?? 5000);

console.log(`
Surrender Stack POC — dna-bridge
  venue:    ${VENUE_ID}
  species:  ${SPECIES_ID}
  seed:     ${BIRTH_SEED}
  OSC:      ${OSC_HOST}:${OSC_PORT}
  Pd plain: ${OSC_HOST}:${PLAIN_PD_PORT} (vanilla patch — no osc library)
  scar sync: every ${SCAR_SYNC_MS / 60000} min + Supabase Realtime
`);

async function loadGenomeFromSupabase() {
  const { data, error } = await supabase
    .from("genomes")
    .select("*")
    .eq("venue_id", VENUE_ID)
    .eq("species_id", SPECIES_ID)
    .maybeSingle();

  if (error) {
    console.warn("Supabase load genome:", error.message);
    return null;
  }
  return data;
}

async function loadPersistedScarIds() {
  const { data, error } = await supabase
    .from("scars")
    .select("scar_id")
    .eq("venue_id", VENUE_ID)
    .eq("species_id", SPECIES_ID);

  if (error) {
    console.warn("Supabase load scars:", error.message);
    return;
  }
  for (const row of data ?? []) {
    persistedScarIds.add(row.scar_id);
  }
}

async function persistGenome(snap) {
  const row = {
    venue_id: VENUE_ID,
    species_id: SPECIES_ID,
    seed: snap.seed,
    generation: snap.generation,
    parent_id: snap.parentId,
    genome_json: snap,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("genomes").upsert(row, {
    onConflict: "venue_id,species_id",
  });
  if (error) console.warn("Supabase upsert genome:", error.message);
}

async function persistNewScars(snap) {
  const fresh = findNewScars(snap, persistedScarIds);
  if (!fresh.length) return;

  const rows = fresh.map((s) => ({
    venue_id: VENUE_ID,
    species_id: SPECIES_ID,
    scar_id: s.id,
    trait: s.trait,
    delta: s.delta,
    reason: s.reason,
    at_age: s.atAge,
  }));

  const { error } = await supabase.from("scars").upsert(rows, {
    onConflict: "venue_id,species_id,scar_id",
    ignoreDuplicates: true,
  });
  if (error) {
    console.warn("Supabase insert scars:", error.message);
    return;
  }
  for (const s of fresh) {
    persistedScarIds.add(s.id);
    console.log(`  scar persisted ${s.id} (${s.trait} +${s.delta.toFixed(2)})`);
  }
}

async function fetchRemoteScars() {
  const { data, error } = await supabase
    .from("scars")
    .select("*")
    .eq("species_id", SPECIES_ID)
    .neq("venue_id", VENUE_ID)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Supabase fetch remote scars:", error.message);
    return [];
  }
  return data ?? [];
}

async function mergeRemoteScars() {
  const remote = await fetchRemoteScars();
  if (!remote.length) return;

  const local = organism.express();
  const { merged, added } = mergeRemoteScarsIntoExpress(local, remote);
  if (added > 0) {
    organism.deserialize(merged);
    console.log(`↔ merged ${added} remote scar(s) from other venue(s)`);
    await persistGenome(organism.express());
  }
}

async function bootOrganism() {
  await loadPersistedScarIds();
  const row = await loadGenomeFromSupabase();

  if (row?.genome_json) {
    organism = createOrganism({ speciesId: SPECIES_ID, seed: row.seed });
    organism.deserialize(row.genome_json);
    console.log(`Loaded genome from Supabase · seed ${row.seed} gen ${row.generation}`);
  } else {
    organism = createOrganism({
      seed: BIRTH_SEED,
      speciesId: SPECIES_ID,
      label: `${VENUE_ID}-${BIRTH_SEED}`,
    });
    console.log(`Born new organism · seed ${BIRTH_SEED}`);
    await persistGenome(organism.express());
  }

  await mergeRemoteScars();
}

function applyOperatorTick(dt) {
  // POC: cube controls are display-only; organism runs on genome defaults
  organism.update(dt, { presence: 0, calm: 0.5, stressNudge: 0 });
}

async function tickOnce(dt) {
  const before = organism.express().scars.length;
  applyOperatorTick(dt);
  const snap = organism.express();
  const after = snap.scars.length;
  const newScar = after !== before;

  expressToOsc(osc, snap, { speciesId: SPECIES_ID, venueId: VENUE_ID, operator });
  expressToPlainPd(plainPd, snap, operator);

  const now = Date.now();
  const json = JSON.stringify(snap);
  const genomeChanged = json !== lastExpressJson;
  lastExpressJson = json;

  if (newScar) {
    await persistNewScars(snap);
  }

  if (newScar || (genomeChanged && now - lastSupabaseWrite >= SUPABASE_WRITE_MS)) {
    lastSupabaseWrite = now;
    await persistGenome(snap);
  }

  if (now - lastFbWrite >= GENOME_FB_MS) {
    lastFbWrite = now;
    set(genomeFbRef, {
      ...snap,
      venueId: VENUE_ID,
      speciesId: SPECIES_ID,
      operatorMood: 0,
      ts: now,
    }).catch((e) => console.warn("Firebase genome write:", e.message));
  }
}

onValue(
  operatorRef,
  (snap) => {
    const d = snap.val();
    if (!d) return;
    operator = {
      leftRight: Number(d.leftRight) || 0,
      upDown: Number(d.upDown) || 0,
      speed: Number(d.speed) ?? 100,
      stopMotion: !!d.stopMotion,
    };
  },
  (err) => console.error("Firebase operator error:", err.message)
);

function subscribeScarsRealtime() {
  return supabase
    .channel(`scars-${VENUE_ID}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "scars", filter: `species_id=eq.${SPECIES_ID}` },
      (payload) => {
        if (payload.new?.venue_id === VENUE_ID) return;
        console.log(`↔ Realtime scar from ${payload.new?.venue_id} — merging`);
        mergeRemoteScars().catch(console.warn);
      }
    )
    .subscribe();
}

await bootOrganism();
subscribeScarsRealtime();

setInterval(() => {
  mergeRemoteScars().catch(console.warn);
}, SCAR_SYNC_MS);

setInterval(() => osc.send("/sm/heartbeat"), 1000);

const dt = 1 / TICK_HZ;
setInterval(() => {
  tickOnce(dt).catch(console.warn);
}, dt * 1000);

process.on("SIGINT", () => {
  osc.close();
  plainPd.close();
  process.exit(0);
});

console.log("dna-bridge running — operator path:", `${FIREBASE_OPERATOR_ROOT}/${VENUE_ID}`);
