/**
 * Loop Family Reunion 2026 — Aug 1 gallery show window (America/New_York).
 * Machine DNA seed + 60-minute bloom/piano lifeline + upload hours.
 */
import { hashStringToSeed } from './co-create-machine-dna.mjs';

/** Stable show seed — override with ?seed= on URL if needed. */
export const SHOW_ID = 'family-reunion-2026-aug1-2pm';
export const SHOW_SEED = hashStringToSeed(SHOW_ID);

/** Aug 1 2026 · 2:00–3:00 PM Eastern (EDT, UTC−4). */
export const SHOW_START_ISO = '2026-08-01T14:00:00-04:00';
export const SHOW_END_ISO = '2026-08-01T15:00:00-04:00';
export const SHOW_DURATION_MS = 60 * 60 * 1000;

/** Add ?mod=aug1-2026 to gallery/phone URL for pre-show uploads. */
export const SHOW_MOD_PARAM = 'aug1-2026';

/** One full auto-rotate orbit for MP4 (~90 s at default wall speed). */
export const REVOLUTION_MS = 90 * 1000;

/** Second orbit recording starts this many ms before show end (≈ 2:58:30 PM). */
export const RECORD_BEFORE_END_MS = 90 * 1000;

export const MAX_UPLOADS_PER_ARTIST = 5;

/** Shown on phone status before 2 PM Eastern (full poster has full copy). */
export const SHOW_OPEN_MESSAGE = 'Co-Curate will open for artwork uploads · 2 pm to 3 pm EST Saturday August 1, 2026';

/** Full-screen poster until 1:59 PM Eastern; gallery visible 1:59–2:00, uploads at 2:00. */
export function showWaitScreenActive(now = Date.now()) {
  return now < showStartMs(now) - 60 * 1000;
}

export function showStartMs(now = Date.now()) {
  return new Date(SHOW_START_ISO).getTime();
}

export function showEndMs() {
  return new Date(SHOW_END_ISO).getTime();
}

/** @returns {'before'|'live'|'after'} */
export function showPhase(now = Date.now()) {
  if (now < showStartMs(now)) return 'before';
  if (now > showEndMs()) return 'after';
  return 'live';
}

export function showElapsedMs(now = Date.now()) {
  const start = showStartMs(now);
  const end = showEndMs();
  if (now <= start) return 0;
  if (now >= end) return end - start;
  return now - start;
}

export function showLifePct(now = Date.now()) {
  return Math.min(100, (showElapsedMs(now) / SHOW_DURATION_MS) * 100);
}

export function clampGardenElapsedMs(elapsed) {
  if (elapsed == null || !Number.isFinite(elapsed)) return 0;
  return Math.max(0, Math.min(SHOW_DURATION_MS, elapsed));
}

export function formatEasternTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function showLifebarLabel(now = Date.now()) {
  const start = formatEasternTime(new Date(showStartMs(now)));
  const end = formatEasternTime(new Date(showEndMs()));
  const nowEt = formatEasternTime(new Date(now));
  const phase = showPhase(now);
  if (phase === 'before') return `${start} – ${end} ET · opens ${start} · now ${nowEt}`;
  if (phase === 'after') return `${start} – ${end} ET · ended · now ${nowEt}`;
  return `${start} – ${end} ET · now ${nowEt}`;
}

/** 22 blooms + hold + fade stretched across 60 minutes. */
export function showGardenConfig() {
  const TOTAL_BLOOMS = 22;
  const HOLD_AFTER_FULL = 5 * 60 * 1000;
  const FADE_TAIL_MS = 10 * 60 * 1000;
  const spawnWindow = SHOW_DURATION_MS - HOLD_AFTER_FULL - FADE_TAIL_MS;
  const SPAWN_INTERVAL = Math.max(8000, Math.floor(spawnWindow / TOTAL_BLOOMS));
  return Object.freeze({
    TOTAL_BLOOMS,
    SPAWN_INTERVAL,
    HOLD_AFTER_FULL,
    FADE_TAIL_MS,
  });
}

export function showTotalLifeMs() {
  const g = showGardenConfig();
  return g.TOTAL_BLOOMS * g.SPAWN_INTERVAL + g.HOLD_AFTER_FULL + g.FADE_TAIL_MS;
}

export function msUntilShowStart(now = Date.now()) {
  return Math.max(0, showStartMs(now) - now);
}

export function msUntil(ms) {
  return Math.max(0, ms - Date.now());
}

/** @param {{ isMod: boolean, uploadCount: number, maxUploads: number }} opts */
export function canUploadNow(opts, now = Date.now()) {
  const phase = showPhase(now);
  if (phase === 'before') return !!opts.isMod;
  if (phase === 'after') return false;
  return opts.uploadCount < opts.maxUploads;
}

export function uploadBlockedMessage(now = Date.now()) {
  const phase = showPhase(now);
  const open = formatEasternTime(new Date(showStartMs(now)));
  const close = formatEasternTime(new Date(showEndMs()));
  if (phase === 'before') {
    return SHOW_OPEN_MESSAGE;
  }
  if (phase === 'after') {
    return `Uploads closed · show ended at ${close} ET`;
  }
  return '';
}
