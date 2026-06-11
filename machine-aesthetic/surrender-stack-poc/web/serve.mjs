#!/usr/bin/env node
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.SURRENDER_WEB_PORT ?? 8791);

function lanIp() {
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const n of nets ?? []) {
      if (n.family === "IPv4" && !n.internal) return n.address;
    }
  }
  return "127.0.0.1";
}

function contentType(p) {
  if (p.endsWith(".html")) return "text/html; charset=utf-8";
  if (p.endsWith(".mjs") || p.endsWith(".js")) return "text/javascript; charset=utf-8";
  return "application/octet-stream";
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/api/lan") {
    const ip = lanIp();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ip, venue: process.env.SM_VENUE_ID ?? "mac-local" }));
    return;
  }

  if (url.pathname === "/api/ping") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, ts: Date.now() }));
    return;
  }

  if (url.pathname === "/api/firebase-config") {
    (async () => {
      try {
        const local = path.join(ROOT, "config", "firebase-config.local.mjs");
        const mod = await import(pathToFileURL(local).href);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            firebaseConfig: mod.firebaseConfig,
            FIREBASE_OPERATOR_ROOT: mod.FIREBASE_OPERATOR_ROOT,
            FIREBASE_GENOME_ROOT: mod.FIREBASE_GENOME_ROOT,
            source: "local",
          })
        );
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message, source: "missing" }));
      }
    })();
    return;
  }

  if (url.pathname.startsWith("/config/")) {
    const name = path.basename(url.pathname);
    const localPath = path.join(ROOT, "config", name);
    const exampleName = name.includes(".local.")
      ? name.replace(".local.mjs", ".example.mjs")
      : name.replace(".example.mjs", ".example.mjs");
    const examplePath = path.join(ROOT, "config", exampleName);
    const file = fs.existsSync(localPath) ? localPath : examplePath;
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      res.end("Missing config — copy config/*.example.mjs to *.local.mjs");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/javascript" });
    fs.createReadStream(file).pipe(res);
    return;
  }

  let rel = url.pathname === "/" ? "/display.html" : url.pathname;
  if (rel.startsWith("/web/")) rel = rel.slice(4);
  rel = path.normalize(rel).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, rel);
  if (!filePath.startsWith(__dirname) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": contentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, "0.0.0.0", async () => {
  const ip = lanIp();
  console.log(`Surrender Stack → http://127.0.0.1:${PORT}/display.html?venue=mac-local`);
  console.log(`Phone (hosted)  → redeploy: npm run deploy-controller`);
  console.log(`Phone (LAN)     → http://${ip}:${PORT}/display.html?venue=mac-local`);
});
