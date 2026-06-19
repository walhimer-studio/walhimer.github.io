/**
 * Copy to firebase-config.local.mjs (gitignored) and paste Firebase web config.
 * Realtime Database must allow read/write on stack-poc/ for the POC (test rules OK).
 */
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const RTDB_PATH = "stack-poc/state";
