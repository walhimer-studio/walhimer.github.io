#!/usr/bin/env node
/** Reset mac-local organism — fresh seed, clears scars. Run with bridge stopped. */
import { createClient } from "@supabase/supabase-js";
import { loadConfig } from "../lib/load-config.mjs";

const VENUE = process.env.SM_VENUE_ID ?? "mac-local";
const SEED = Number(process.env.SM_SEED ?? 77823) >>> 0;

const { supabaseConfig, SPECIES_ID } = await loadConfig("supabase-config");
const sb = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
  auth: { persistSession: false },
});

await sb.from("scars").delete().eq("venue_id", VENUE).eq("species_id", SPECIES_ID);
await sb.from("genomes").delete().eq("venue_id", VENUE).eq("species_id", SPECIES_ID);

console.log(`Reset ${VENUE} · seed ${SEED} · restart: node bridge/dna-bridge.mjs`);
