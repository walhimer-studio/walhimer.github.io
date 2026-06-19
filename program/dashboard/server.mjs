#!/usr/bin/env node
/**
 * Studio dashboard POC — local static server + JSON state API.
 * Run: node server.mjs  →  http://127.0.0.1:8790
 */
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const STATE_PATH = path.join(ROOT, "data", "state.json");
const PORT = Number(process.env.DASHBOARD_PORT ?? 8790);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

function readState() {
  return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
}

function writeState(state) {
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
}

function findDrop(state, id) {
  const drop = state.drops.find((d) => d.id === id);
  if (!drop) throw new Error(`Drop not found: ${id}`);
  return drop;
}

function defaultCaptions(drop) {
  const short = drop.title;
  return {
    instagram: `${short} — new work from the studio.\n\nAvailable ↗ mark-walhimer.com\n\n#generativeart #newmediaart #machineaesthetics`,
    x: `${short}.\n\nAvailable → mark-walhimer.com`,
  };
}

function handleAction(state, body) {
  const { action, id } = body;

  if (action === "update_drop") {
    const drop = findDrop(state, id);
    if (body.edition) drop.edition = body.edition;
    if (body.platform) {
      drop.mint = drop.mint || {};
      drop.mint.platform = body.platform;
    }
    return state;
  }

  if (action === "approve") {
    const drop = findDrop(state, id);
    if (drop.status !== "draft") throw new Error("Only drafts can be approved");
    drop.status = "minted";
    drop.edition = body.edition || drop.edition || "1/1";
    drop.mint = {
      platform: body.platform || drop.mint?.platform || state.pipeline.defaultPlatform,
      mintedAt: new Date().toISOString(),
      priceEth: "0.01",
    };
    if (!drop.post1?.instagram) {
      const caps = defaultCaptions(drop);
      drop.post1 = { ...drop.post1, ...caps, skipped: false, publishedAt: null };
    }
    state.pipeline.minted += 1;
    state.pipeline.available += 1;
    state.mintingLog.unshift({
      title: drop.title,
      status: "available",
      date: drop.date,
      platform: drop.mint.platform,
      edition: drop.edition,
    });
    return state;
  }

  if (action === "reject") {
    const drop = findDrop(state, id);
    drop.status = "skipped";
    drop.skipped = true;
    drop.skipReason = "rejected_in_review";
    return state;
  }

  if (action === "save_captions") {
    const drop = findDrop(state, id);
    drop.post1 = drop.post1 || {};
    if (body.captions?.instagram !== undefined) drop.post1.instagram = body.captions.instagram;
    if (body.captions?.x !== undefined) drop.post1.x = body.captions.x;
    return state;
  }

  if (action === "post_social") {
    const drop = findDrop(state, id);
    if (drop.status !== "minted") throw new Error("Only minted works can be posted");
    drop.post1 = drop.post1 || {};
    drop.post1.publishedAt = new Date().toISOString();
    const mode = body.mode || "both";
    const platforms = mode === "ig" ? "instagram" : mode === "x" ? "x" : "both";
    state.recentPosts.unshift({
      title: drop.title,
      date: formatDisplayDate(new Date()),
      platforms: platforms === "both" ? "both" : "instagram",
    });
    state.recentPosts = state.recentPosts.slice(0, 10);
    return state;
  }

  if (action === "skip_social") {
    const drop = findDrop(state, id);
    drop.post1 = drop.post1 || {};
    drop.post1.skipped = true;
    return state;
  }

  throw new Error(`Unknown action: ${action}`);
}

function formatDisplayDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function sendJson(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (req.method === "GET" && url.pathname === "/api/state") {
    return sendJson(res, 200, readState());
  }

  if (req.method === "POST" && url.pathname === "/api/action") {
    let body = "";
    for await (const chunk of req) body += chunk;
    try {
      const parsed = JSON.parse(body || "{}");
      let state = readState();
      state = handleAction(state, parsed);
      writeState(state);
      return sendJson(res, 200, state);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
  filePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, "");
  const abs = path.join(ROOT, filePath);
  if (!abs.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
    res.writeHead(404);
    return res.end("Not found");
  }
  const ext = path.extname(abs);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(abs).pipe(res);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Studio dashboard POC → http://127.0.0.1:${PORT}`);
  console.log(`State file → ${STATE_PATH}`);
});
