import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(__dirname, "..", "config");

export async function loadConfig(baseName) {
  const local = path.join(CONFIG_DIR, `${baseName}.local.mjs`);
  const example = path.join(CONFIG_DIR, `${baseName}.example.mjs`);
  const target = fs.existsSync(local) ? local : example;
  if (target === example) {
    console.warn(`Using ${baseName}.example.mjs — copy to ${baseName}.local.mjs`);
  }
  return import(pathToFileURL(target).href);
}
