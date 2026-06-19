#!/usr/bin/env node
/** Static server for stack POC controller + display pages. */
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.STACK_POC_PORT ?? 8790);

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
  if (p.endsWith(".css")) return "text/css; charset=utf-8";
  return "application/octet-stream";
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/api/lan") {
    const ip = lanIp();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ip, controllerUrl: `http://${ip}:${PORT}/controller.html` }));
    return;
  }

  if (url.pathname === "/firebase-config.local.mjs" || url.pathname === "/firebase-config.example.mjs") {
    const name = url.pathname.slice(1);
    const local = path.join(__dirname, "firebase-config.local.mjs");
    const file = fs.existsSync(local) && name.includes("local") ? local : path.join(__dirname, name);
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      res.end("Missing firebase config — copy firebase-config.example.mjs to firebase-config.local.mjs");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/javascript" });
    fs.createReadStream(file).pipe(res);
    return;
  }

  let rel = url.pathname === "/" ? "/display.html" : url.pathname;
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

server.listen(PORT, "0.0.0.0", () => {
  const ip = lanIp();
  console.log(`Stack POC UI → http://127.0.0.1:${PORT}/display.html`);
  console.log(`iPhone controller → http://${ip}:${PORT}/controller.html`);
});
