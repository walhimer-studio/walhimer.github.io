#!/usr/bin/env node
/**
 * Console launcher server — serves launch UI and starts Pure Data + openFrameworks (+ browser fallback).
 * OSC UDP 127.0.0.1:7400 (unchanged).
 */
import fs from "fs";
import http from "http";
import path from "path";
import { spawn, spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONSOLE_ROOT = path.resolve(__dirname, "..");

/** Read launch.env when Node is started without the shell wrapper. */
function loadLaunchEnv() {
  const envFile = path.join(CONSOLE_ROOT, "launch.env");
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*export\s+(\w+)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim().replace(/^["']|["']$/g, "");
    val = val.replace(/\$HOME/g, process.env.HOME ?? "");
    if (process.env[m[1]] === undefined) process.env[m[1]] = val;
  }
}
loadLaunchEnv();
const RUN_DIR = path.join(CONSOLE_ROOT, ".console-run");
const LAUNCH_DIR = path.join(CONSOLE_ROOT, "launch");
const PD_PATCH = path.join(CONSOLE_ROOT, "pure-data/ghost-room.pd");
const BRIDGE = path.join(CONSOLE_ROOT, "bridge/ghost-room-zone-bridge.mjs");
const OF_BUILD = path.join(CONSOLE_ROOT, "scripts/run-of-build-run.sh");
const WALLPAPER_SCRIPT = path.join(CONSOLE_ROOT, "port/generate-code-wallpaper.mjs");
const WALLPAPER_PNG = path.join(
  CONSOLE_ROOT,
  "openframeworks/GhostRoom77823/bin/data/code-wallpaper-77823.png"
);

const PORT = Number(process.env.CONSOLE_LAUNCH_PORT ?? 8787);
const OSC_HOST = process.env.SM_OSC_HOST ?? "127.0.0.1";
const OSC_PORT = Number(process.env.SM_OSC_PORT ?? 7400);
const BROWSER_ROOM_URL =
  process.env.CONSOLE_BROWSER_ROOM_URL ??
  "https://mark-walhimer.com/sketches/loop-art-critique-2026/machine-aesthetic/ghost_dense_77823_room.html";

const REPO_ROOT = path.resolve(CONSOLE_ROOT, "../..");
const LOOP_MA = path.join(REPO_ROOT, "sketches/loop-art-critique-2026/machine-aesthetic");

fs.mkdirSync(RUN_DIR, { recursive: true });

function readPid(name) {
  const f = path.join(RUN_DIR, `${name}.pid`);
  if (!fs.existsSync(f)) return null;
  const n = Number(fs.readFileSync(f, "utf8").trim());
  return Number.isFinite(n) ? n : null;
}

function writePid(name, pid) {
  fs.writeFileSync(path.join(RUN_DIR, `${name}.pid`), String(pid));
}

function isAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function killPid(name) {
  const pid = readPid(name);
  if (pid && isAlive(pid)) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      /* ignore */
    }
  }
  fs.rmSync(path.join(RUN_DIR, `${name}.pid`), { force: true });
}

function findOfBinary() {
  const names = ["GhostRoom77823Debug", "GhostRoom77823"];
  const ofRoot = process.env.OF_ROOT;
  if (ofRoot) {
    const binDir = path.join(ofRoot, "apps/myApps/GhostRoom77823/bin");
    for (const n of names) {
      const mac = path.join(binDir, `${n}.app/Contents/MacOS/${n}`);
      if (fs.existsSync(mac)) return mac;
      const linux = path.join(binDir, n);
      if (fs.existsSync(linux)) return linux;
    }
  }
  for (const n of names) {
    const bundled = path.join(CONSOLE_ROOT, `bin/${n}.app/Contents/MacOS/${n}`);
    if (fs.existsSync(bundled)) return bundled;
  }
  return null;
}

function findPdBinary() {
  if (process.env.PD_PATH && fs.existsSync(process.env.PD_PATH)) return process.env.PD_PATH;

  const which = spawnSync("which", ["pd"], { encoding: "utf8" });
  if (which.status === 0 && which.stdout.trim()) return which.stdout.trim();

  if (process.platform === "darwin") {
    const candidates = [
      "/Applications/Pd.app/Contents/Resources/bin/pd",
      "/Applications/Pd-0.54-1.app/Contents/Resources/bin/pd",
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    try {
      for (const name of fs.readdirSync("/Applications")) {
        if (!name.startsWith("Pd") || !name.endsWith(".app")) continue;
        const p = path.join("/Applications", name, "Contents/Resources/bin/pd");
        if (fs.existsSync(p)) return p;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function spawnDetachedSafe(cmd, args, opts = {}) {
  try {
    const child = spawn(cmd, args, {
      detached: true,
      stdio: "ignore",
      cwd: opts.cwd ?? CONSOLE_ROOT,
      env: { ...process.env, ...opts.env },
    });
    child.on("error", (err) => {
      console.error(`spawn ${cmd} failed: ${err.message}`);
    });
    if (child.pid) child.unref();
    else {
      child.on("spawn", () => child.unref());
    }
    return child.pid ?? null;
  } catch (e) {
    console.error(`spawn ${cmd} failed: ${e.message}`);
    return null;
  }
}

function openUrl(url) {
  const plat = process.platform;
  if (plat === "darwin") spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
  else if (plat === "win32") spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
  else spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
}

function ensureWallpaper() {
  if (fs.existsSync(WALLPAPER_PNG)) return true;
  if (!fs.existsSync(WALLPAPER_SCRIPT) || !fs.existsSync(path.join(LOOP_MA, "package.json"))) return false;
  spawnDetachedSafe("node", [WALLPAPER_SCRIPT], { cwd: LOOP_MA });
  return fs.existsSync(WALLPAPER_PNG);
}

function startPd() {
  if (isAlive(readPid("pd"))) {
    return { ok: true, message: "Pure Data already running" };
  }
  if (!fs.existsSync(PD_PATCH)) {
    return { ok: false, message: "Pd patch not found" };
  }

  const pdBin = findPdBinary();
  if (pdBin) {
    const pid = spawnDetachedSafe(pdBin, [PD_PATCH]);
    if (pid) {
      writePid("pd", pid);
      return {
        ok: true,
        message: "Pure Data started — turn DSP on in the patch window",
        binary: pdBin,
      };
    }
  }

  // macOS: Pd.app is often installed but not on PATH
  if (process.platform === "darwin") {
    spawnDetachedSafe("open", ["-a", "Pd", PD_PATCH]);
    return {
      ok: true,
      message: "Opening ghost-room.pd in Pure Data — turn DSP on in the patch window",
      via: "open -a Pd",
    };
  }

  return {
    ok: false,
    message:
      "Pure Data not found. Install from puredata.info, or set PD_PATH in launch.env (path to pd binary).",
  };
}

function startNative() {
  const pd = startPd();
  if (isAlive(readPid("of"))) return { ok: true, pd, of: { ok: true, message: "openFrameworks app already running" } };

  ensureWallpaper();

  const bin = findOfBinary();
  if (bin) {
    const pid = spawnDetachedSafe(bin, [], { cwd: path.dirname(bin) });
    writePid("of", pid);
    return { ok: true, pd, of: { ok: true, message: "Ghost Room 77823 (native) started", binary: bin } };
  }

  if (!process.env.OF_ROOT || !fs.existsSync(process.env.OF_ROOT)) {
    return {
      ok: false,
      pd,
      of: {
        ok: false,
        message: "No built OF app found. Set OF_ROOT in launch.env and click Build & Run, or copy a built .app to console/bin/",
      },
    };
  }

  const pid = spawnDetachedSafe("bash", [OF_BUILD], { env: process.env });
  writePid("of", pid);
  return { ok: true, pd, of: { ok: true, message: "Building and launching openFrameworks…", build: true } };
}

function startBrowser() {
  const pd = startPd();
  if (!isAlive(readPid("bridge"))) {
    if (fs.existsSync(BRIDGE)) {
      const pid = spawnDetachedSafe("node", [BRIDGE]);
      writePid("bridge", pid);
    }
  }
  openUrl(BROWSER_ROOM_URL);
  return {
    ok: true,
    pd,
    bridge: { ok: isAlive(readPid("bridge")), message: "Browser room opened — use bridge keys for zones if needed" },
    url: BROWSER_ROOM_URL,
  };
}

function stopAll() {
  killPid("of");
  killPid("bridge");
  killPid("pd");
  return { ok: true, message: "Stopped Console processes (launcher server still running)" };
}

function status() {
  const ofBin = findOfBinary();
  const pdBin = findPdBinary();
  return {
    osc: { host: OSC_HOST, port: OSC_PORT },
    seed: 77823,
    processes: {
      pd: isAlive(readPid("pd")),
      of: isAlive(readPid("of")),
      bridge: isAlive(readPid("bridge")),
      server: true,
    },
    pdBinary: pdBin,
    pdInstalled: Boolean(pdBin) || process.platform === "darwin",
    ofBinary: ofBin,
    ofRoot: process.env.OF_ROOT ?? null,
    browserRoomUrl: BROWSER_ROOM_URL,
    wallpaper: fs.existsSync(WALLPAPER_PNG),
  };
}

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

function sendJson(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj, null, 2));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/api/status" && req.method === "GET") {
    return sendJson(res, 200, status());
  }

  if (url.pathname === "/api/launch" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    let mode = "native";
    try {
      mode = JSON.parse(body || "{}").mode ?? "native";
    } catch {
      /* default native */
    }
    const result = mode === "browser" ? startBrowser() : startNative();
    return sendJson(res, 200, result);
  }

  if (url.pathname === "/api/stop" && req.method === "POST") {
    return sendJson(res, 200, stopAll());
  }

  let rel = url.pathname === "/" ? "/index.html" : url.pathname;
  rel = path.normalize(rel).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(LAUNCH_DIR, rel);
  if (!filePath.startsWith(LAUNCH_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": contentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
});

process.on("uncaughtException", (err) => {
  console.error("Console launcher error:", err.message);
});

process.on("unhandledRejection", (err) => {
  console.error("Console launcher rejection:", err);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use — launcher may already be running at http://127.0.0.1:${PORT}/`);
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Console launcher → http://127.0.0.1:${PORT}/`);
  console.log(`OSC ${OSC_HOST}:${OSC_PORT} · seed 77823`);
  const pd = findPdBinary();
  if (pd) console.log(`Pure Data: ${pd}`);
  else if (process.platform === "darwin") console.log("Pure Data: will use open -a Pd if not on PATH");
  else console.log("Pure Data: not found — set PD_PATH in launch.env");
});
