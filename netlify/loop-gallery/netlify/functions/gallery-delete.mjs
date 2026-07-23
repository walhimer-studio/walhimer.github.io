import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function adminApp() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(raw)) });
  }
  return getApps()[0];
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 });
  }

  const modToken = process.env.GALLERY_MOD_TOKEN;
  if (!modToken) {
    return new Response(JSON.stringify({ error: 'Moderation not configured' }), { status: 503 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch (_) { /* empty */ }

  if (body.token !== modToken) {
    return new Response(JSON.stringify({ error: 'Invalid moderation token' }), { status: 403 });
  }

  const roomId = (body.roomId || 'default').replace(/[^\w-]/g, '').slice(0, 48) || 'default';
  const slotId = (body.slotId || '').replace(/[^\w-]/g, '-').slice(0, 64);
  if (!slotId) {
    return new Response(JSON.stringify({ error: 'slotId required' }), { status: 400 });
  }

  const app = adminApp();
  if (!app) {
    return new Response(JSON.stringify({ error: 'Firebase admin not configured' }), { status: 503 });
  }

  const galleryRoot = process.env.FIREBASE_GALLERY_ROOT || 'loopGallery';
  const db = getFirestore(app);
  const slotRef = db.doc(`${galleryRoot}/rooms/${roomId}/slots/${slotId}`);
  const snap = await slotRef.get();
  if (!snap.exists) {
    return new Response(JSON.stringify({ ok: true, missing: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await slotRef.delete();

  try {
    const bucket = getStorage(app).bucket();
    const path = `${galleryRoot}/rooms/${roomId}/images/${slotId}.jpg`;
    await bucket.file(path).delete({ ignoreNotFound: true });
  } catch (_) { /* storage optional */ }

  return new Response(JSON.stringify({ ok: true, slotId }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
