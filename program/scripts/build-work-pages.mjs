#!/usr/bin/env node
/**
 * Merge program/drops drop.json files into data/available-works.json
 * Generate /available/index.html and /works/{slug}/index.html
 *
 * Usage: node program/scripts/build-work-pages.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DROPS_DIR = path.join(ROOT, 'program/drops');
const DATA_PATH = path.join(ROOT, 'data/available-works.json');
const AVAILABLE_DIR = path.join(ROOT, 'available');
const WORKS_DIR = path.join(ROOT, 'works');
const BASE = 'https://mark-walhimer.com';

const NAV = `<nav>
  <a class="nav-logo" href="/">Mark Walhimer</a>
  <button type="button" class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav-links">
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><path class="line" d="M1 1h18M1 7h18M1 13h18"/></svg>
  </button>
  <div class="nav-links" id="site-nav-links">
    <a href="/installations/">Installations</a>
    <a href="/available/" class="nav-active-placeholder">Available</a>
    <a href="/sketches/index.html">Catalog</a>
    <a href="/practice/index.html">Practice</a>
    <a href="/bio/index.html">Bio / CV</a>
    <a href="/contact/index.html">Contact</a>
  </div>
</nav>`;

const NAV_SCRIPT = `<script>
(function () {
  var nav = document.querySelector('nav');
  var btn = document.querySelector('.nav-toggle');
  var panel = document.getElementById('site-nav-links');
  if (!nav || !btn || !panel) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  var here = location.pathname.replace(/\\/index\\.html$/, '/');
  panel.querySelectorAll('a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href[0] !== '/') return;
    var norm = href.replace(/\\/index\\.html$/, '/');
    if (norm === here || (here.startsWith('/works/') && norm === '/available/')) {
      a.classList.add('active');
    }
  });
})();
</script>`;

const GTAG = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-TVXX0YPGCN"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TVXX0YPGCN');
</script>`;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function slugFromCatalog(catalogNumber) {
  return String(catalogNumber || '').toLowerCase();
}

function loadDrops() {
  if (!fs.existsSync(DROPS_DIR)) return [];
  const works = [];
  for (const entry of fs.readdirSync(DROPS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dropPath = path.join(DROPS_DIR, entry.name, 'drop.json');
    if (!fs.existsSync(dropPath)) continue;
    try {
      const drop = readJson(dropPath);
      if (drop.skipped || drop.status === 'skipped') continue;
      if (!['approved', 'minted', 'published'].includes(drop.status)) continue;
      works.push(dropToWork(drop));
    } catch (err) {
      console.warn(`Skip ${dropPath}: ${err.message}`);
    }
  }
  return works;
}

function dropToWork(drop) {
  const slug = drop.slug || slugFromCatalog(drop.catalogNumber);
  return {
    catalogNumber: drop.catalogNumber,
    slug,
    availability: drop.availability || (drop.status === 'minted' ? 'minted' : 'available'),
    series: drop.series,
    title: drop.title || `${drop.series} · ${drop.catalogNumber}`,
    date: drop.date,
    description: drop.metadata?.description || '',
    preview: drop.assets?.og || drop.assets?.instagram || '',
    embedUrl: drop.embedUrl || drop.workUrl || '',
    openUrl: drop.openUrl || drop.embedUrl || '',
    generator: drop.generator || '',
    medium: drop.medium || '',
    mint: {
      platform: drop.mint?.platform || 'transient_labs',
      priceEth: drop.mint?.priceEth || '',
      contract: drop.mint?.contract || null,
      tokenId: drop.mint?.tokenId ?? null,
      txHash: drop.mint?.txHash || '',
      status: drop.availability || 'available',
    },
    dropDate: drop.date,
    status: drop.status,
  };
}

function mergeWorks(existing, fromDrops) {
  const byCatalog = new Map();
  for (const w of existing.works || []) {
    if (w.catalogNumber) byCatalog.set(w.catalogNumber, w);
  }
  for (const w of fromDrops) {
    byCatalog.set(w.catalogNumber, { ...byCatalog.get(w.catalogNumber), ...w });
  }
  const works = [...byCatalog.values()].filter((w) => w.availability !== 'skipped');
  works.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  return { ...existing, updated: new Date().toISOString().slice(0, 10), works };
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function workUrl(slug) {
  return `/works/${slug}/`;
}

function renderAvailablePage(data) {
  const works = data.works || [];
  const availableCount = works.filter((w) => w.availability === 'available').length;
  const lastMint = works[0];
  const pipelineLine = lastMint
    ? `Pipeline active · last published ${esc(lastMint.date)} · ${works.length} work${works.length === 1 ? '' : 's'} listed`
    : `Pipeline active · daily drops at 12:00 ET · ${availableCount} available now`;

  const cards = works.length
    ? works
        .map((w) => {
          const href = workUrl(w.slug);
          const badge =
            w.availability === 'minted'
              ? '<span class="badge badge-minted">Minted</span>'
              : '<span class="badge badge-available">Available</span>';
          const thumb = w.preview
            ? `<img src="${esc(w.preview)}" alt="" loading="lazy" />`
            : '<div class="thumb-placeholder">Preview</div>';
          const price = w.mint?.priceEth ? `${esc(w.mint.priceEth)} ETH` : '';
          return `<a class="available-card" href="${esc(href)}">
  <div class="available-card-thumb">${thumb}</div>
  <div class="available-card-body">
    <div class="available-card-meta">${esc(w.series)} · ${esc(w.catalogNumber)}</div>
    <div class="available-card-title">${esc(w.title)}</div>
    <div class="available-card-foot">${badge}${price ? `<span class="available-card-meta">${price}</span>` : ''}</div>
  </div>
</a>`;
        })
        .join('\n')
    : `<div class="available-empty">
  <p>No works listed yet. Daily mints will appear here after publish.</p>
  <p>Studio archive remains in the <a href="/sketches/index.html">Catalog</a>. Installation commissions are listed under <a href="/installations/">Installations</a>.</p>
</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${GTAG}
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>Available — Mark Walhimer</title>
  <meta name="description" content="Available generative works by Mark Walhimer — numbered daily fragments (WS-NNNNNN), acquire on mark-walhimer.com." />
  <link rel="canonical" href="${BASE}/available/" />
  <meta property="og:title" content="Available — Mark Walhimer" />
  <meta property="og:description" content="Numbered generative works available for acquisition on mark-walhimer.com." />
  <meta property="og:url" content="${BASE}/available/" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#ffffff" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/css/cathedral-shell.css" />
  <link rel="stylesheet" href="/css/work-pages.css" />
</head>
<body class="available-page">
${NAV.replace('class="nav-active-placeholder"', 'class="active"')}

<header>
  <p class="kicker">Acquire on site</p>
  <h1>Avail<em>able</em></h1>
  <p class="lede">Numbered daily fragments — <code style="font-family:var(--mono);font-size:11px;">WS-NNNNNN</code> — published on Ethereum via Transient Labs. Purchase on mark-walhimer.com.</p>
</header>

<div class="pipeline-status" role="status">
  <span class="pulse" aria-hidden="true"></span>
  <span>${pipelineLine}</span>
</div>

<div class="available-grid-wrap">
  <div class="available-grid" id="available-grid">
${cards}
  </div>
</div>

<footer>
  <span>Mark Walhimer · Available</span>
  <span>
    <a href="/sketches/index.html">Full catalog</a>
    &nbsp;·&nbsp;
    <a href="/installations/">Installations</a>
    &nbsp;·&nbsp;
    <a href="/contact/index.html">Commission</a>
  </span>
</footer>
${NAV_SCRIPT}
</body>
</html>
`;
}

function renderWorkPage(w) {
  const url = `${BASE}${workUrl(w.slug)}`;
  const isAvailable = w.availability === 'available';
  const openHref = w.openUrl || w.embedUrl || '';
  const stage = w.embedUrl
    ? `<iframe src="${esc(w.embedUrl)}" title="${esc(w.title)}" allow="fullscreen" loading="lazy"></iframe>`
    : w.preview
      ? `<img src="${esc(w.preview)}" alt="${esc(w.title)}" style="width:100%;height:auto;display:block;" />`
      : '<div class="stage-placeholder">Preview pending</div>';

  const buyLabel = isAvailable ? 'Acquire ↗' : 'Minted';
  const buyDisabled = isAvailable
    ? 'class="buy-btn is-pending" disabled title="Transient Labs checkout — wiring in progress"'
    : 'class="buy-btn" disabled';

  const priceBlock = w.mint?.priceEth
    ? `<div class="acquire-price">${esc(w.mint.priceEth)} ETH</div><p class="acquire-note">Primary on Ethereum mainnet. Gas additional.</p>`
    : `<p class="acquire-note">Price set at publish.</p>`;

  const provenance = [];
  if (w.mint?.txHash) {
    provenance.push(`<a href="https://etherscan.io/tx/${esc(w.mint.txHash)}" target="_blank" rel="noopener">Etherscan transaction ↗</a>`);
  }
  if (w.mint?.contract && w.mint?.tokenId != null) {
    provenance.push(`<a href="https://etherscan.io/nft/${esc(w.mint.contract)}/${esc(w.mint.tokenId)}" target="_blank" rel="noopener">Token on Etherscan ↗</a>`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${GTAG}
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${esc(w.title)} — Mark Walhimer</title>
  <meta name="description" content="${esc(w.description || w.title)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:title" content="${esc(w.title)} — Mark Walhimer" />
  <meta property="og:description" content="${esc(w.description || w.title)}" />
  <meta property="og:url" content="${url}" />
  ${w.preview ? `<meta property="og:image" content="${esc(w.preview.startsWith('http') ? w.preview : BASE + w.preview)}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#ffffff" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/css/cathedral-shell.css" />
  <link rel="stylesheet" href="/css/work-pages.css" />
</head>
<body class="work-page">
${NAV}

<header class="work-header">
  <p class="kicker">${esc(w.series)} · ${esc(w.catalogNumber)}${w.date ? ` · ${esc(w.date)}` : ''}</p>
  <h1>${esc(w.title)}</h1>
  ${w.description ? `<p class="work-lede">${esc(w.description)}</p>` : ''}
</header>

<div class="work-layout">
  <div>
    <div class="work-stage-wrap">${stage}</div>
    ${openHref ? `<p style="margin-top:14px;"><a class="work-open-link" href="${esc(openHref)}" target="_blank" rel="noopener">Open full screen ↗</a></p>` : ''}
  </div>
  <aside class="work-sidebar">
    <div class="acquire-panel">
      <h2>Acquire</h2>
      ${priceBlock}
      <button type="button" ${buyDisabled}>${buyLabel}</button>
      ${isAvailable ? '<p class="acquire-note">Wallet connect and Transient Labs checkout will activate here when the mint script is wired.</p>' : ''}
      ${provenance.length ? `<div class="provenance-links">${provenance.join('')}</div>` : ''}
    </div>
    <dl class="work-meta-block">
      <dt>Catalog</dt><dd>${esc(w.catalogNumber)}</dd>
      ${w.medium ? `<dt>Medium</dt><dd>${esc(w.medium)}</dd>` : ''}
      ${w.generator ? `<dt>Generator</dt><dd>${esc(w.generator)}</dd>` : ''}
      <dt>Platform</dt><dd>Transient Labs · Ethereum</dd>
    </dl>
  </aside>
</div>

<footer>
  <span>Mark Walhimer · ${esc(w.catalogNumber)}</span>
  <span>
    <a href="/available/">All available</a>
    &nbsp;·&nbsp;
    <a href="/sketches/index.html">Catalog</a>
  </span>
</footer>
${NAV_SCRIPT}
</body>
</html>
`;
}

function main() {
  const existing = fs.existsSync(DATA_PATH) ? readJson(DATA_PATH) : { version: 1, works: [] };
  const fromDrops = loadDrops();
  const data = mergeWorks(existing, fromDrops);

  writeJson(DATA_PATH, data);

  fs.mkdirSync(AVAILABLE_DIR, { recursive: true });
  fs.writeFileSync(path.join(AVAILABLE_DIR, 'index.html'), renderAvailablePage(data));

  fs.mkdirSync(WORKS_DIR, { recursive: true });
  const activeSlugs = new Set();
  for (const w of data.works) {
    if (!w.slug) continue;
    activeSlugs.add(w.slug);
    const dir = path.join(WORKS_DIR, w.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), renderWorkPage(w));
  }

  if (fs.existsSync(WORKS_DIR)) {
    for (const entry of fs.readdirSync(WORKS_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory() || activeSlugs.has(entry.name)) continue;
      const indexPath = path.join(WORKS_DIR, entry.name, 'index.html');
      if (fs.existsSync(indexPath)) fs.unlinkSync(indexPath);
    }
  }

  console.log(`available-works: ${data.works.length} work(s)`);
  console.log(`wrote ${path.relative(ROOT, path.join(AVAILABLE_DIR, 'index.html'))}`);
  for (const w of data.works) {
    console.log(`  ${workUrl(w.slug)}`);
  }
}

main();
