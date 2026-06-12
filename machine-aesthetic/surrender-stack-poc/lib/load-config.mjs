import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(__dirname, "..", "config");

function envFirebaseConfig() {
  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  if (!databaseURL) return null;
  const required = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET",
    "FIREBASE_MESSAGING_SENDER_ID",
    "FIREBASE_APP_ID",
  ];
  for (const key of required) {
    if (!process.env[key]) {
      console.warn(`load-config: FIREBASE_DATABASE_URL set but missing ${key}`);
      return null;
    }
  }
  return {
    firebaseConfig: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    FIREBASE_OPERATOR_ROOT:
      process.env.FIREBASE_OPERATOR_ROOT ?? "surrender-stack-poc/operator",
    FIREBASE_GENOME_ROOT:
      process.env.FIREBASE_GENOME_ROOT ?? "surrender-stack-poc/genome",
  };
}

function envSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return {
    supabaseConfig: { url, serviceRoleKey },
    SPECIES_ID: process.env.SM_SPECIES_ID ?? "surrender-machines",
  };
}

export async function loadConfig(baseName) {
  if (baseName === "firebase-config") {
    const fromEnv = envFirebaseConfig();
    if (fromEnv) {
      console.log("load-config: firebase from environment");
      return fromEnv;
    }
  }
  if (baseName === "supabase-config") {
    const fromEnv = envSupabaseConfig();
    if (fromEnv) {
      console.log("load-config: supabase from environment");
      return fromEnv;
    }
  }

  const local = path.join(CONFIG_DIR, `${baseName}.local.mjs`);
  const example = path.join(CONFIG_DIR, `${baseName}.example.mjs`);
  const target = fs.existsSync(local) ? local : example;
  if (target === example) {
    console.warn(`Using ${baseName}.example.mjs — copy to ${baseName}.local.mjs or set env vars`);
  }
  return import(pathToFileURL(target).href);
}
