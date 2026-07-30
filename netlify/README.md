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

## Loop gallery — Family Reunion Friday Gallery (Bloom four walls)

| Setting | Value |
|---------|--------|
| Base directory | `netlify/loop-gallery-family-reunion-friday-gallery` |
| GitHub Pages (gallery / projector) | `https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-gallery/public/` |
| Default room | `family-reunion-friday-2` |

## Loop gallery — Family Reunion Friday Phone

| Setting | Value |
|---------|--------|
| Base directory | `netlify/loop-gallery-family-reunion-friday-phone` |
| GitHub Pages (pocket upload) | `https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-phone/public/` |
| Assets | `public/` → symlink to gallery `public/` (same room + Firebase) |

Legacy redirect: `netlify/loop-gallery-family-reunion-friday-wall/` → gallery path above.

## Ghost 77823 gravity

| Setting | Value |
|---------|--------|
| Base directory | `netlify/gravity-77823` |
| Build command | *(from `netlify.toml`)* |
| Publish directory | `public` |
| Functions | `netlify/functions` |

In Netlify → **Site configuration** → **Build & deploy** → **Build settings**, set **Base directory** and clear any override that sets publish to the repository root.

Each app needs its **own** Netlify site (two sites, same GitHub repo, different base directories).
