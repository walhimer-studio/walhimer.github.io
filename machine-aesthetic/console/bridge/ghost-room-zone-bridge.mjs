#!/usr/bin/env node
/**
 * Phase 0 — Ghost Room 77823 OSC zone bridge.
 * Does NOT modify the browser artwork. Run beside Chromium kiosk.
 * Keys mirror walkthrough zones / Console branches → Pure Data on :7400.
 */
import { createOscSender } from "./osc-send.mjs";

const SEED = 77823;
const HOST = process.env.SM_OSC_HOST ?? "127.0.0.1";
const PORT = Number(process.env.SM_OSC_PORT ?? 7400);

const ZONES = {
  approach_a: { branch: "room_a", spin: 0, surrender: 0, hz: 92 },
  room_a: { branch: "room_a", spin: 0, surrender: 0, hz: 110 },
  hall_ab: { branch: "ghost", spin: 0, surrender: 0, hz: 140 },
  room_b: { branch: "ghost", spin: 1, surrender: 0, hz: 178 },
  hall_bc: { branch: "surrender", spin: 0, surrender: 0, hz: 220 },
  room_c: { branch: "surrender", spin: 0, surrender: 1, hz: 266 },
};

const osc = createOscSender(HOST, PORT);
let stress = 0.15;
let heartbeatTimer;

function sendZone(zoneId) {
  const z = ZONES[zoneId];
  if (!z) return;
  osc.send("/sm/ghost/zone", zoneId);
  osc.send("/sm/console/branch", z.branch);
  osc.send("/sm/ghost/spin_active", z.spin);
  osc.send("/sm/ghost/surrender_active", z.surrender);
  osc.send("/sm/gear/hz", 0, z.hz);
  osc.send("/sm/state/stress", stress);
  console.log(`→ zone ${zoneId} · branch ${z.branch} · hz ${z.hz}`);
}

function boot() {
  osc.send("/sm/console/ready", 1);
  osc.send("/sm/ghost/ready", 1);
  osc.send("/sm/console/seed", SEED);
  osc.send("/sm/ghost/seed", SEED);
  sendZone("room_a");
  heartbeatTimer = setInterval(() => osc.send("/sm/heartbeat"), 1000);
  console.log(`Ghost Room Phase 0 bridge → ${HOST}:${PORT} · seed ${SEED}`);
  printHelp();
}

function printHelp() {
  console.log(`
Keys (watch ghost room in Chromium, press to match where you are):
  1 / a   room_a        4   hall_ab
  2 / b   room_b ghost  5   hall_bc
  3 / c   room_c surrender
  0       approach_a
  space   visitor nudge (stress up)
  g       gold event
  q       quit
`);
}

function onKey(key) {
  switch (key) {
    case "1":
    case "a":
      sendZone("room_a");
      break;
    case "0":
      sendZone("approach_a");
      break;
    case "4":
      sendZone("hall_ab");
      break;
    case "2":
    case "b":
      sendZone("room_b");
      break;
    case "5":
      sendZone("hall_bc");
      break;
    case "3":
    case "c":
      sendZone("room_c");
      break;
    case " ":
      stress = Math.min(1, stress + 0.12);
      osc.send("/sm/state/stress", stress);
      console.log(`→ nudge · stress ${stress.toFixed(2)}`);
      break;
    case "g":
    case "G":
      stress = Math.max(0, stress - 0.2);
      osc.send("/sm/event/gold", 0.75);
      osc.send("/sm/state/stress", stress);
      console.log("→ gold");
      break;
    case "q":
    case "\u0003":
      shutdown();
      break;
    default:
      break;
  }
}

function shutdown() {
  clearInterval(heartbeatTimer);
  osc.close();
  process.stdin.setRawMode(false);
  process.exit(0);
}

if (!process.stdin.isTTY) {
  console.error("Phase 0 bridge needs a TTY for key input.");
  process.exit(1);
}

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (key) => onKey(key));
boot();
