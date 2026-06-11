#!/usr/bin/env node
/** What's running for Surrender Stack POC — run when things feel doubled. */
import { execSync } from "child_process";

console.log("Surrender Stack — process check\n");

function lines(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

const bridges = lines("pgrep -fl 'node bridge/dna-bridge.mjs' 2>/dev/null");
const serves = lines("pgrep -fl 'node web/serve.mjs' 2>/dev/null");
const pd7400 = lines("lsof -nP -iUDP:7400 2>/dev/null | tail -n +2");
const pd7401 = lines("lsof -nP -iUDP:7401 2>/dev/null | tail -n +2");

function report(label, items, want) {
  const n = items.length;
  const ok = n === want;
  console.log(`${ok ? "✓" : "⚠"} ${label}: ${n} (want ${want})`);
  for (const l of items) console.log(`    ${l}`);
  if (!ok && n > want) console.log(`    → kill extras (see below)`);
  console.log();
}

report("dna-bridge", bridges, 1);
report("web serve", serves, 1);
report("Pd / audio :7401", pd7401, 1);
report("Pd / OSC :7400", pd7400, 0);

if (bridges.length > 1) {
  console.log("Two bridges = doubled UDP to Pd → two tones.");
  console.log("Fix: Ctrl+C in extra bridge terminals, or:");
  console.log("  pkill -f 'node bridge/dna-bridge.mjs'");
  console.log("  node bridge/dna-bridge.mjs\n");
}

if (pd7400.length > 0 && pd7401.length > 0) {
  console.log("Both Pd patches open (7400 OSC + 7401 vanilla) → close OSC patch.");
  console.log("Mac dev: keep surrender-dna-vanilla.pd only.\n");
}

if (pd7401.length > 1) {
  console.log("Two listeners on 7401 → close duplicate Pd windows.\n");
}

console.log("Clean restart:");
console.log("  pkill -f 'node bridge/dna-bridge.mjs' 2>/dev/null; true");
console.log("  node bridge/dna-bridge.mjs");
