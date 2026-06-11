#!/usr/bin/env node
/** Clear pause + reset cube controls in Firebase. */
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import { loadConfig } from "../lib/load-config.mjs";

const VENUE = process.env.SM_VENUE_ID ?? "mac-local";
const { firebaseConfig, FIREBASE_OPERATOR_ROOT } = await loadConfig("firebase-config");

const app = initializeApp(firebaseConfig, "unpause");
const db = getDatabase(app);
const opRef = ref(db, `${FIREBASE_OPERATOR_ROOT}/${VENUE}`);

await set(opRef, {
  leftRight: 0,
  upDown: 0,
  speed: 100,
  stopMotion: false,
  ts: Date.now(),
});

console.log(`Operator reset · ${VENUE} · stopMotion=false · speed=100`);
console.log("Refresh display on phone/Mac. Bridge must run for audio.");
