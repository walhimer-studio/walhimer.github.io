import { createHash } from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// TEMP — Family Reunion night 2026-07-29 (revert to 5 after event)
const MAX_UPLOADS = 5;

function ipHash(ip) {
  return createHash('sha256').update(ip).digest('hex').slice(0, 24);
}

function adminDb() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(raw)) });
  }
  return getFirestore();
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 });
  }

  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('client-ip') || 'unknown';
  const hash = ipHash(ip);
  let body = {};
  try {
    body = await req.json();
  } catch (_) { /* empty */ }

  const roomId = (body.roomId || 'default').replace(/[^\w-]/g, '').slice(0, 48) || 'default';
  const action = body.action === 'commit' ? 'commit' : 'check';

  const db = adminDb();
  if (!db) {
    return new Response(JSON.stringify({
      allowed: true,
      remaining: MAX_UPLOADS,
      ipHash: hash,
      mode: 'local',
      note: 'Set FIREBASE_SERVICE_ACCOUNT_JSON for server-side IP limits',
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  const ref = db.doc(`loopGalleryRooms/${roomId}/limits/${hash}`);
  const snap = await ref.get();
  const count = snap.exists ? (snap.data().count || 0) : 0;

  if (action === 'check') {
    const remaining = Math.max(0, MAX_UPLOADS - count);
    return new Response(JSON.stringify({
      allowed: remaining > 0,
      remaining,
      count,
      ipHash: hash,
      mode: 'firebase',
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  if (count >= MAX_UPLOADS) {
    return new Response(JSON.stringify({
      allowed: false,
      remaining: 0,
      count,
      ipHash: hash,
      error: 'Upload limit reached for this network',
    }), { status: 429, headers: { 'Content-Type': 'application/json' } });
  }

  await ref.set({ count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  const next = count + 1;
  return new Response(JSON.stringify({
    allowed: true,
    remaining: Math.max(0, MAX_UPLOADS - next),
    count: next,
    ipHash: hash,
    mode: 'firebase',
  }), { headers: { 'Content-Type': 'application/json' } });
};
