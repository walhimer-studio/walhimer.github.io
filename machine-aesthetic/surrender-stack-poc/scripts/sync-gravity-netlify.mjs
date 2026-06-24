#!/usr/bin/env node
/**
 * Stage Ghost 77823 gravity + phone controller for Netlify deploy.
 * Copies artwork verbatim; does not edit source sketches.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, '..', '..', '..');
const OUT = path.join(REPO, 'netlify/gravity-77823/public');

const copies = [
  {
    src: path.join(REPO, 'sketches/loop-snippets/ghost_dense_77823_gravity_sliders.html'),
    dest: path.join(OUT, 'ghost_dense_77823_gravity_sliders.html'),
  },
  {
    src: path.join(REPO, 'sketches/loop-snippets/gravity-remote.mjs'),
    dest: path.join(OUT, 'gravity-remote.mjs'),
  },
];

fs.mkdirSync(OUT, { recursive: true });

for (const { src, dest } of copies) {
  if (!fs.existsSync(src)) {
    console.error('Missing:', src);
    process.exit(1);
  }
  fs.copyFileSync(src, dest);
  console.log('→', path.relative(REPO, dest));
}

const displayHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ghost 77823 · Display</title>
  <script>
    var p = new URLSearchParams(location.search);
    var v = p.get('venue') || 'default';
    location.replace('ghost_dense_77823_gravity_sliders.html?view=display&venue=' + encodeURIComponent(v));
  </script>
</head>
<body><p>Loading display…</p></body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'display.html'), displayHtml);

const phoneSrc = path.join(REPO, 'netlify/gravity-77823/phone.template.html');
if (!fs.existsSync(phoneSrc)) {
  console.error('Missing phone template:', phoneSrc);
  process.exit(1);
}
fs.copyFileSync(phoneSrc, path.join(OUT, 'phone.html'));
console.log('→ netlify/gravity-77823/public/phone.html');

console.log(`
Netlify site root: netlify/gravity-77823
  Display: /display.html?venue=YOUR_ROOM  (or add &venue= to sketch URL)
  Phone:   /phone.html?venue=YOUR_ROOM
`);
