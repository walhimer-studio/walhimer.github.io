/**
 * Optional Firebase sync for loop gallery.
 * Config sources (first match wins):
 *   1. window.__LOOP_GALLERY_FIREBASE__ = { firebaseConfig, galleryRoot? }
 *   2. Netlify function /.netlify/functions/firebase-config
 *   3. ./firebase-config.mjs (GitHub Pages / mark-walhimer.com — no Netlify required)
 */
async function loadGalleryFirebaseConfig() {
  if (window.__LOOP_GALLERY_FIREBASE__?.firebaseConfig) {
    return {
      firebaseConfig: window.__LOOP_GALLERY_FIREBASE__.firebaseConfig,
      galleryRoot: window.__LOOP_GALLERY_FIREBASE__.galleryRoot || 'loopGallery',
      source: 'inline',
    };
  }

  try {
    const res = await fetch('/.netlify/functions/firebase-config');
    if (res.ok) {
      const data = await res.json();
      if (data.firebaseConfig) {
        return {
          firebaseConfig: data.firebaseConfig,
          galleryRoot: data.galleryRoot || 'loopGallery',
          source: 'netlify',
        };
      }
    }
  } catch (_) { /* not on Netlify */ }

  try {
    const mod = await import('./firebase-config.mjs');
    if (mod.firebaseConfig) {
      return {
        firebaseConfig: mod.firebaseConfig,
        galleryRoot: mod.galleryRoot || 'loopGallery',
        source: 'module',
      };
    }
  } catch (_) { /* copy firebase-config.example.mjs → firebase-config.mjs */ }

  return null;
}

async function postNetlifyFunction(path, body) {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { mode: 'local', allowed: true };
    return res.json();
  } catch (_) {
    return { mode: 'local', allowed: true };
  }
}

export async function initGallerySync(roomId, onRemoteSlot, onRemoteRemove) {
  const cfg = await loadGalleryFirebaseConfig();
  if (!cfg) return { mode: 'local', error: 'missing firebase-config.mjs' };
  const { firebaseConfig, galleryRoot } = cfg;

  try {
  const fb = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
  const fs = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');
  const st = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js');

  const app = fb.initializeApp(firebaseConfig);
  const db = fs.getFirestore(app);
  const storage = st.getStorage(app);
  // loopGallery/{roomId}/slots/{slotId} — valid col/doc/col/doc path
  const slotsCol = fs.collection(db, galleryRoot, roomId, 'slots');

  fs.onSnapshot(slotsCol, (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data();
      const slotId = change.doc.id;
      if (change.type === 'removed') {
        onRemoteRemove(slotId);
        return;
      }
      onRemoteSlot({
        slotId,
        side: data.side,
        worldZ: data.worldZ,
        url: data.url,
        aspect: data.aspect,
        frameW: data.frameW,
        frameH: data.frameH,
      });
    });
  });

  async function uploadJPEG(file, slotId, side, worldZ, meta) {
    const path = `${galleryRoot}/rooms/${roomId}/images/${slotId}.jpg`;
    const ref = st.ref(storage, path);
    await st.uploadBytes(ref, file, { contentType: 'image/jpeg' });
    const url = await st.getDownloadURL(ref);
    await fs.setDoc(fs.doc(slotsCol, slotId), {
      side,
      worldZ,
      aspect: meta.aspect,
      frameW: meta.frameW,
      frameH: meta.frameH,
      url,
      createdAt: fs.serverTimestamp(),
    });
    return url;
  }

  async function deleteSlot(slotId, modToken) {
    const res = await fetch('/.netlify/functions/gallery-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, slotId, token: modToken }),
    });
    return res.json();
  }

  return { mode: 'firebase', galleryRoot, uploadJPEG, deleteSlot, configSource: cfg.source };
  } catch (err) {
    return { mode: 'local', error: err?.message || 'firebase init failed' };
  }
}

export async function checkUploadLimit(roomId) {
  return postNetlifyFunction('/.netlify/functions/gallery-limit', { roomId, action: 'check' });
}

export async function commitUploadLimit(roomId) {
  return postNetlifyFunction('/.netlify/functions/gallery-limit', { roomId, action: 'commit' });
}

export async function checkModerator(token) {
  if (!token) return { ok: false };
  try {
    const res = await fetch('/.netlify/functions/gallery-mod-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return { ok: false };
    return res.json();
  } catch (_) {
    return { ok: false };
  }
}
