/**
 * Copy Ghost 77823 dense room + dependencies into hosting-public (read-only from sketches).
 * Does not modify source artwork files.
 */
import fs from "fs";
import path from "path";

const RUNTIME_EXT = new Set([".html", ".mjs", ".js", ".png", ".pdf"]);

/** @param {string} name */
function shouldCopySketchFile(name) {
  if (name.startsWith("build-")) return false;
  if (name === "package.json" || name === "package-lock.json") return false;
  if (name.endsWith(".md")) return false;
  if (/ 2\.html$/.test(name) || name.includes(" copy")) return false;
  const ext = path.extname(name);
  return RUNTIME_EXT.has(ext);
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copySketchDir(srcDir, destDir) {
  let n = 0;
  for (const name of fs.readdirSync(srcDir)) {
    if (!shouldCopySketchFile(name)) continue;
    copyFile(path.join(srcDir, name), path.join(destDir, name));
    n++;
  }
  return n;
}

/**
 * @param {string} hostingPublic — hosting-public output root
 * @param {string} repoRoot — walhimer.github.io root
 */
export function syncGhostRoomToHosting(hostingPublic, repoRoot) {
  const sketchRel = "sketches/loop-art-critique-2026/machine-aesthetic";
  const sketchSrc = path.join(repoRoot, sketchRel);
  const sketchDest = path.join(hostingPublic, sketchRel);

  if (!fs.existsSync(sketchSrc)) {
    throw new Error(`Ghost room source not found: ${sketchSrc}`);
  }

  const sketchCount = copySketchDir(sketchSrc, sketchDest);

  const walkMoonSrc = path.join(repoRoot, "sketches/loop-art-critique-2026/walk_moon_audio_standalone.html");
  const walkMoonDest = path.join(hostingPublic, "sketches/loop-art-critique-2026/walk_moon_audio_standalone.html");
  if (!fs.existsSync(walkMoonSrc)) {
    throw new Error(`Missing walk moon panel: ${walkMoonSrc}`);
  }
  copyFile(walkMoonSrc, walkMoonDest);

  const text11Src = path.join(repoRoot, "sketches/text11.html");
  const text11Dest = path.join(hostingPublic, "sketches/text11.html");
  if (!fs.existsSync(text11Src)) {
    throw new Error(`Missing text cylinder link: ${text11Src}`);
  }
  copyFile(text11Src, text11Dest);

  const ghostUrl = "/sketches/loop-art-critique-2026/machine-aesthetic/ghost_dense_77823_room.html";

  return { ghostUrl, sketchCount };
}
