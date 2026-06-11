#!/usr/bin/env node
/**
 * Test whether phone can reach the Mac web server.
 * localhost OK + LAN empty reply = macOS Firewall blocking node.
 */
import http from "http";
import os from "os";

const PORT = Number(process.env.SURRENDER_WEB_PORT ?? 8791);

function lanIp() {
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const n of nets ?? []) {
      if (n.family === "IPv4" && !n.internal) return n.address;
    }
  }
  return null;
}

function probe(host) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${PORT}/api/ping`, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ ok: res.statusCode === 200 && body.includes("ok"), body, status: res.statusCode }));
    });
    req.on("error", (e) => resolve({ ok: false, error: e.message }));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ ok: false, error: "timeout" });
    });
  });
}

const ip = lanIp();
console.log("Network check (port %s)\n", PORT);

const local = await probe("127.0.0.1");
console.log("  127.0.0.1     ", local.ok ? "✓ OK" : `✗ ${local.error ?? local.status}`);

if (ip) {
  const lan = await probe(ip);
  console.log(`  ${ip.padEnd(14)}`, lan.ok ? "✓ OK" : `✗ ${lan.error ?? "empty reply — FIREWALL"}`);

  if (local.ok && !lan.ok) {
    console.log(`
macOS Firewall is blocking phone access.

Fix (pick one):

  A) Allow node (recommended)
     System Settings → Network → Firewall → Options
     → find "node" → Allow incoming connections
     → restart: node web/serve.mjs

  B) Turn firewall off briefly to confirm

  C) Skip LAN — deploy controller to Firebase Hosting:
     node scripts/deploy-controller.mjs
     Phone opens the https URL it prints (no Wi‑Fi to Mac needed)
`);
    process.exit(1);
  }
}

if (!local.ok) {
  console.log("\nWeb server not running. Start: node web/serve.mjs");
  process.exit(1);
}

console.log("\nPhone URL: http://" + (ip ?? "LAN-IP") + `:${PORT}/controller.html?venue=mac-local`);
