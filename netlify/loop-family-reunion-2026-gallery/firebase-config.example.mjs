/**
 * Copy to firebase-config.mjs and paste values from Firebase Console
 * (Project loop-gallery-family-reunion-3 → Project settings → Your apps → Web).
 *
 * Firebase web keys are public; security is in Firestore + Storage rules.
 * Do not commit service account JSON here.
 */
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "loop-gallery-family-reunion-3.firebaseapp.com",
  databaseURL: "https://loop-gallery-family-reunion-3-default-rtdb.firebaseio.com",
  projectId: "loop-gallery-family-reunion-3",
  storageBucket: "loop-gallery-family-reunion-3.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

/** Firestore + Storage root (default matches Netlify env FIREBASE_GALLERY_ROOT). */
export const galleryRoot = "loopGallery";
