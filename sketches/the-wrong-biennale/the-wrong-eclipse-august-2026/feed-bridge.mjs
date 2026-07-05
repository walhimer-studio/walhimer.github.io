#!/usr/bin/env node
/**
 * Eclipse-day feed bridge — polls METAR / NOAA / OpenSky / ISS, writes live-cache.json,
 * sends FUDI lines to Pure Data vanilla patch (port 9001).
 *
 *   node feed-bridge.mjs [--pd-port 9001] [--out live-cache.json]
 *
 * Run on Mac with holes-in-the-sky-vanilla.pd open (Media → DSP on).
 */

import dgram from "node:dgram";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  fetchLiveAtmosphere,
  MAITINO,
} from "./live-feeds.mjs";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const pdPort = Number(args[args.indexOf("--pd-port") + 1] || 9001);
const outFile = path.resolve(
  __dir,
  args[args.indexOf("--out") + 1] || "live-cache.json"
);

const sock = dgram.createSocket("udp4");

function sendFudi(line) {
  const buf = Buffer.from(`${line}\n`);
  sock.send(buf, pdPort, "127.0.0.1");
}

function emitAtmo(a) {
  sendFudi(`cloud ${a.cloud.toFixed(4)};`);
  sendFudi(`wind ${a.wind.toFixed(4)};`);
  sendFudi(`aircraft ${a.aircraft.toFixed(4)};`);
  sendFudi(`satellite ${a.satellite.toFixed(4)};`);
  sendFudi(`density ${a.density.toFixed(4)};`);
}

async function tick() {
  const data = await fetchLiveAtmosphere();
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2) + "\n");
  emitAtmo(data);
  console.log(
    `[${data.updated}] live=${data.live} sources=${data.sources?.join(",")} errors=${data.errors?.length ?? 0}`
  );
}

console.log(`Feed bridge · Maitino ${MAITINO.lat},${MAITINO.lon} · PD UDP ${pdPort} · ${outFile}`);
tick();
setInterval(tick, 60_000);
