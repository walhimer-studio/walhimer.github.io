/**
 * Optional Firebase sync for loop gallery.
 * Loads only when /.netlify/functions/firebase-config returns config.
 */
export async function initGallerySync(roomId, onRemoteSlot, onRemoteRemove) {
  const res = await fetch('/.netlify/functions/firebase-config');
  if (!res.ok) return { mode: 'local' };
  const { firebaseConfig, galleryRoot } = await res.json();

  const fb = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
  const fs = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');
  const st = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js');

  const app = fb.initializeApp(firebaseConfig);
  const db = fs.getFirestore(app);
  const storage = st.getStorage(app);
  const slotsCol = fs.collection(db, `${galleryRoot}/rooms/${roomId}/slots`);

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

  return { mode: 'firebase', galleryRoot, uploadJPEG, deleteSlot };
}

export async function checkUploadLimit(roomId) {
  const res = await fetch('/.netlify/functions/gallery-limit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, action: 'check' }),
  });
  return res.json();
}

export async function commitUploadLimit(roomId) {
  const res = await fetch('/.netlify/functions/gallery-limit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, action: 'commit' }),
  });
  return res.json();
}

export async function checkModerator(token) {
  if (!token) return { ok: false };
  const res = await fetch('/.netlify/functions/gallery-mod-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  return res.json();
}
