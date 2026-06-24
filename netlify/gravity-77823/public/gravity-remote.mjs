/**
 * Phone ↔ display sync for Ghost 77823 gravity sliders (Firebase RTDB).
 * Host on Netlify; configure via /.netlify/functions/firebase-config or window.__GRAVITY_FIREBASE__.
 */

const FIREBASE_VERSION = '10.14.1';

export async function loadGravityConfig() {
  if (window.__GRAVITY_FIREBASE__) return window.__GRAVITY_FIREBASE__;
  const r = await fetch('/.netlify/functions/firebase-config');
  if (!r.ok) throw new Error('Firebase config unavailable — set Netlify env vars');
  return r.json();
}

async function loadFirebase() {
  const [appMod, dbMod] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-database.js`),
  ]);
  return { ...appMod, ...dbMod };
}

function operatorPath(root, venue) {
  return `${root}/${venue}`;
}

export async function attachDisplay({ venue, onStatus }) {
  const bridge = window.__gravityBridge;
  if (!bridge) {
    onStatus?.('bridge missing');
    return;
  }

  let cfg;
  try {
    cfg = await loadGravityConfig();
  } catch (err) {
    onStatus?.(err.message);
    return;
  }

  const { initializeApp, getDatabase, ref, onValue } = await loadFirebase();
  const app = initializeApp(cfg.firebaseConfig, `gravity-display-${venue}`);
  const db = getDatabase(app);

  onValue(
    ref(db, operatorPath(cfg.FIREBASE_OPERATOR_ROOT, venue)),
    (snap) => {
      const data = snap.val();
      if (!data || data.ts === bridge._lastRemoteTs) return;
      bridge._lastRemoteTs = data.ts;
      bridge.applyRemoteState(data);
      onStatus?.(`live · ${venue}`);
    },
    (err) => onStatus?.(`error · ${err.message}`)
  );
}

export async function attachPhone({ venue, readUi, applyUi, onStatus }) {
  let cfg;
  try {
    cfg = await loadGravityConfig();
  } catch (err) {
    onStatus?.(err.message);
    return null;
  }

  const { initializeApp, getDatabase, ref, set, onValue } = await loadFirebase();
  const app = initializeApp(cfg.firebaseConfig, `gravity-phone-${venue}`);
  const db = getDatabase(app);
  const op = ref(db, operatorPath(cfg.FIREBASE_OPERATOR_ROOT, venue));

  let pushing = false;
  let lastLocalTs = 0;

  async function push() {
    pushing = true;
    const payload = readUi();
    lastLocalTs = payload.ts;
    try {
      await set(op, payload);
      onStatus?.(`live · ${venue}`);
    } catch (err) {
      onStatus?.(`push error · ${err.message}`);
    }
    pushing = false;
  }

  onValue(op, (snap) => {
    const data = snap.val();
    if (!data || pushing || data.ts === lastLocalTs) return;
    applyUi(data);
    onStatus?.(`synced · ${venue}`);
  });

  await push();
  return { push };
}
