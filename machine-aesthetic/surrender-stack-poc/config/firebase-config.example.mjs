/** Copy to firebase-config.local.mjs — new Firebase project for this POC only. */
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

/** Operator input only — phone writes here. */
export const FIREBASE_OPERATOR_ROOT = "surrender-stack-poc/operator";

/** Kernel snapshot — bridge writes, display reads. */
export const FIREBASE_GENOME_ROOT = "surrender-stack-poc/genome";
