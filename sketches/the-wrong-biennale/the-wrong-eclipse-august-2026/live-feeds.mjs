/**
 * Live atmospheric feeds — Maitino / Alicante anchor.
 * Browser: tries public APIs + optional ./live-cache.json (from feed-bridge.mjs).
 * Eclipse day 12 Aug 2026: run feed-bridge on Mac alongside OF brain + PD.
 */

export const MAITINO = Object.freeze({
  lat: 38.3452,
  lon: -0.481,
  metarStation: "LEAL",
  label: "Partida Maitino 2069c, Alicante",
});

const CACHE_URL = "./live-cache.json";
const POLL_MS = 60_000;

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function windKtToNorm(kt) {
  if (kt == null || Number.isNaN(kt)) return null;
  return clamp01(kt / 40);
}

function cloudCoverToNorm(pct) {
  if (pct == null || Number.isNaN(pct)) return null;
  return clamp01(pct / 100);
}

export async function fetchMetar(station = MAITINO.metarStation) {
  const url = `https://aviationweather.gov/api/data/metar?ids=${station}&format=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`METAR ${res.status}`);
  const rows = await res.json();
  const row = rows?.[0];
  if (!row) throw new Error("METAR empty");
  const windKt = row.wspd ?? null;
  const cloudLayers = row.clouds ?? [];
  const ceiling = cloudLayers.length
    ? Math.max(...cloudLayers.map((c) => c.base ?? 0))
    : null;
  const cloudNorm =
    cloudLayers.length === 0
      ? 0.15
      : clamp01(0.25 + cloudLayers.length * 0.18 + (ceiling ? Math.max(0, 1 - ceiling / 12000) * 0.4 : 0));
  return {
    source: "metar",
    station,
    windKt,
    wind: windKtToNorm(windKt),
    cloud: cloudNorm,
    humidity: row.relh != null ? clamp01(row.relh / 100) : null,
    raw: row.rawOb,
  };
}

export async function fetchNoaaGrid() {
  const url = `https://api.weather.gov/points/${MAITINO.lat},${MAITINO.lon}`;
  const res = await fetch(url, {
    headers: { Accept: "application/geo+json", "User-Agent": "HolesInTheSky/1.0 (mark-walhimer.com)" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`NOAA points ${res.status}`);
  const pts = await res.json();
  const forecastUrl = pts?.properties?.forecastHourly;
  if (!forecastUrl) throw new Error("NOAA forecast URL missing");
  const fRes = await fetch(forecastUrl, {
    headers: { Accept: "application/geo+json", "User-Agent": "HolesInTheSky/1.0 (mark-walhimer.com)" },
    cache: "no-store",
  });
  if (!fRes.ok) throw new Error(`NOAA forecast ${fRes.status}`);
  const forecast = await fRes.json();
  const period = forecast?.properties?.periods?.[0];
  const windText = period?.windSpeed ?? "";
  const windMatch = /(\d+)/.exec(windText);
  const windKt = windMatch ? Number(windMatch[1]) : null;
  return {
    source: "noaa",
    windKt,
    wind: windKtToNorm(windKt),
    cloud: period?.shortForecast?.match(/cloud|overcast|rain|storm/i) ? 0.65 : 0.25,
    humidity: null,
    summary: period?.shortForecast ?? "",
  };
}

export async function fetchOpenSkyBBox() {
  const { lat, lon } = MAITINO;
  const d = 0.35;
  const url =
    `https://opensky-network.org/api/states/all?lamin=${lat - d}&lomin=${lon - d}` +
    `&lamax=${lat + d}&lomax=${lon + d}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`OpenSky ${res.status}`);
  const data = await res.json();
  const count = data?.states?.length ?? 0;
  return {
    source: "opensky",
    count,
    aircraft: clamp01(count / 12),
  };
}

export async function fetchIssPass() {
  const url = `https://api.open-notify.org/iss-pass.json?lat=${MAITINO.lat}&lon=${MAITINO.lon}&n=3`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`ISS pass ${res.status}`);
  const data = await res.json();
  const now = Date.now() / 1000;
  const soon = (data?.response ?? []).some((p) => Math.abs(p.risetime - now) < 600);
  return {
    source: "open-notify-iss",
    passes: data?.response ?? [],
    satellite: soon ? 0.85 : 0.15,
  };
}

export async function fetchLiveCache() {
  const res = await fetch(CACHE_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`cache ${res.status}`);
  return res.json();
}

export async function fetchLiveAtmosphere() {
  const partial = { sources: [], errors: [] };
  const merge = (key, val) => {
    if (val != null && !Number.isNaN(val)) partial[key] = val;
  };

  const tasks = [
    fetchMetar().catch((e) => {
      partial.errors.push(String(e.message || e));
      return null;
    }),
    fetchNoaaGrid().catch((e) => {
      partial.errors.push(String(e.message || e));
      return null;
    }),
    fetchOpenSkyBBox().catch((e) => {
      partial.errors.push(String(e.message || e));
      return null;
    }),
    fetchIssPass().catch((e) => {
      partial.errors.push(String(e.message || e));
      return null;
    }),
    fetchLiveCache().catch(() => null),
  ];

  const [metar, noaa, opensky, iss, cache] = await Promise.all(tasks);

  for (const block of [cache, metar, noaa, opensky, iss]) {
    if (!block) continue;
    partial.sources.push(block.source);
    merge("cloud", block.cloud);
    merge("wind", block.wind);
    merge("humidity", block.humidity);
    merge("aircraft", block.aircraft);
    merge("satellite", block.satellite);
  }

  partial.cloud ??= 0.35;
  partial.wind ??= 0.2;
  partial.humidity ??= 0.5;
  partial.aircraft ??= 0;
  partial.satellite ??= 0;
  partial.particulate = clamp01(partial.cloud * 0.4 + partial.aircraft * 0.2 + 0.1);
  partial.density = clamp01(
    (partial.cloud + partial.particulate + partial.aircraft * 0.4 + partial.satellite * 0.2) / 2.2
  );
  partial.live = partial.errors.length < 4;
  partial.updated = new Date().toISOString();
  return partial;
}

export function createLivePoller(onData, intervalMs = POLL_MS) {
  let timer = null;
  let last = null;

  async function poll() {
    try {
      last = await fetchLiveAtmosphere();
      onData(last);
    } catch (e) {
      onData({ live: false, error: String(e.message || e), ...(last ?? {}) });
    }
  }

  return {
    start() {
      poll();
      timer = setInterval(poll, intervalMs);
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
    },
    get last() {
      return last;
    },
  };
}
