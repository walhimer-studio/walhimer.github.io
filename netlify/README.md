# Netlify deploys (separate sites)

**Do not** publish the repo root (`/`). GitHub Pages uses the full repo; Netlify sites must use a **base directory** so only `public/` is published.

Deploying `/` fails on filenames like `sketches/827 (centered) #10.html` (`#` is invalid on Netlify).

## Loop gallery

| Setting | Value |
|---------|--------|
| Base directory | `netlify/loop-gallery` |
| Build command | *(from `netlify.toml`)* |
| Publish directory | `public` |
| Functions | `netlify/functions` |

## Loop gallery — Family Reunion Friday 2

| Setting | Value |
|---------|--------|
| Base directory | `netlify/loop-gallery-family-reunion-friday-2` |
| GitHub Pages | `https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-2/public/` |
| Default room | `family-reunion-friday-2` |

## Loop Family Reunion 2026 — Gallery

| Setting | Value |
|---------|--------|
| Base directory | `netlify/loop-family-reunion-2026-gallery` |
| GitHub Pages (monitor) | `https://mark-walhimer.com/netlify/loop-family-reunion-2026-gallery/` |
| Default room | `family-reunion-friday-2` |

## Loop Family Reunion 2026 — Phone

| Setting | Value |
|---------|--------|
| Base directory | `netlify/loop-family-reunion-2026-phone` |
| GitHub Pages (upload) | `https://mark-walhimer.com/netlify/loop-family-reunion-2026-phone/` |

Phone folder symlinks gallery modules (`co-create-machine-dna.mjs`, `samples/`, etc.) — see [phone README](./loop-family-reunion-2026-phone/README.md).

Legacy redirects: `loop-gallery-family-reunion-friday-gallery`, `…-phone`, `…-wall` → URLs above.

## Ghost 77823 gravity

| Setting | Value |
|---------|--------|
| Base directory | `netlify/gravity-77823` |
| Build command | *(from `netlify.toml`)* |
| Publish directory | `public` |
| Functions | `netlify/functions` |

In Netlify → **Site configuration** → **Build & deploy** → **Build settings**, set **Base directory** and clear any override that sets publish to the repository root.

Each app needs its **own** Netlify site (two sites, same GitHub repo, different base directories).
