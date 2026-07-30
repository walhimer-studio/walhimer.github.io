#!/usr/bin/env node
/**
 * One-time setup: write public/firebase-config.mjs from Firebase web app config.
 *
 * Usage (paste the six values when prompted):
 *   node netlify/loop-gallery/scripts/write-firebase-config.mjs
 *
 * Or set env vars and run:
 *   FIREBASE_API_KEY=... FIREBASE_AUTH_DOMAIN=... ... node scripts/write-firebase-config.mjs
 */
import { createInterface } from 'readline';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'public', 'firebase-config.mjs');

const defaults = {
  authDomain: 'loop-gallery-family-reunion-3.firebaseapp.com',
  databaseURL: 'https://loop-gallery-family-reunion-3-default-rtdb.firebaseio.com',
  projectId: 'loop-gallery-family-reunion-3',
  storageBucket: 'loop-gallery-family-reunion-3.firebasestorage.app',
};

function envOrAsk(key, label, fallback = '') {
  if (process.env[key]) return process.env[key];
  return null;
}

async function prompt(rl, label, fallback = '') {
  const hint = fallback ? ` [${fallback}]` : '';
  return new Promise((resolve) => {
    rl.question(`${label}${hint}: `, (ans) => resolve((ans || fallback).trim()));
  });
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  const fields = [
    ['FIREBASE_API_KEY', 'apiKey', ''],
    ['FIREBASE_AUTH_DOMAIN', 'authDomain', defaults.authDomain],
    ['FIREBASE_DATABASE_URL', 'databaseURL', defaults.databaseURL],
    ['FIREBASE_PROJECT_ID', 'projectId', defaults.projectId],
    ['FIREBASE_STORAGE_BUCKET', 'storageBucket', defaults.storageBucket],
    ['FIREBASE_MESSAGING_SENDER_ID', 'messagingSenderId', ''],
    ['FIREBASE_APP_ID', 'appId', ''],
  ];

  const values = {};
  for (const [envKey, name, fallback] of fields) {
    const fromEnv = envOrAsk(envKey);
    values[name] = fromEnv || await prompt(rl, name, fallback);
  }
  const galleryRoot = process.env.FIREBASE_GALLERY_ROOT
    || await prompt(rl, 'galleryRoot', 'loopGallery');
  rl.close();

  const missing = Object.entries(values).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    console.error('Missing:', missing.join(', '));
    process.exit(1);
  }

  const body = `/** Auto-generated — loop-gallery-family-reunion-3 · do not commit service account keys. */
export const firebaseConfig = {
  apiKey: ${JSON.stringify(values.apiKey)},
  authDomain: ${JSON.stringify(values.authDomain)},
  databaseURL: ${JSON.stringify(values.databaseURL)},
  projectId: ${JSON.stringify(values.projectId)},
  storageBucket: ${JSON.stringify(values.storageBucket)},
  messagingSenderId: ${JSON.stringify(values.messagingSenderId)},
  appId: ${JSON.stringify(values.appId)},
};

export const galleryRoot = ${JSON.stringify(galleryRoot)};
`;

  writeFileSync(outPath, body, 'utf8');
  console.error(`Wrote ${outPath}`);
  console.error('Next: enable Firestore + Storage in Firebase Console, set rules, push repo, open:');
  console.error('  https://mark-walhimer.com/netlify/loop-gallery/public/?room=family-reunion-friday');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
