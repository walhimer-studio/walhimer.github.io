# Loop Gallery (Netlify)

Participatory **looping gallery hallway**: visitors walk a white corridor and **hang JPEGs on wall slots**. One artwork per slot (no overlap). Max **5 uploads per device** (local) and per **IP** when Firebase + service account are configured.

Based on the scale and walk model of [Loop Alumni Show — Invisible Layer POC](https://mark-walhimer.com/sketches/loop-art-critique-alumni-show-2026/loop-alumni-show-invisible-layer-poc.html). This deploy is a **gallery layer** — not a copy of the full invisible-layer shader hallway.

## Family Reunion Friday — simple path (no Netlify required)

Firebase does **not** plug into Netlify automatically. If Netlify is blocking you, skip it for Friday:

1. **Firebase Console** — project [`loop-gallery-family-reunion-3`](https://console.firebase.google.com/u/0/project/loop-gallery-family-reunion-3/overview)
   - Register **Web app** (`</>`) — not Firebase Hosting
   - Enable **Firestore**, **Storage**, **Realtime Database** (RTDB URL needed in config)
   - Paste **Firestore + Storage rules** below
2. **Write config file** (once):

```bash
node netlify/loop-gallery/scripts/write-firebase-config.mjs
```

Paste the six values from Firebase → Project settings → Your apps → Web config.

Or copy `public/firebase-config.example.mjs` → `public/firebase-config.mjs` and edit by hand.

3. **Commit + push** `public/firebase-config.mjs` (web keys are public; secured by rules — never commit service account JSON)

4. **Open** (same URL you already use):

`https://mark-walhimer.com/netlify/loop-gallery/public/?room=family-reunion-friday`

Status bar should say **`· synced (module)`** — two browsers, same room, hung squares appear on both.

**Without Netlify:** per-browser upload cap still works; server IP limit and moderator delete are optional later.

## Local dev

```bash
cd netlify/loop-gallery
npm install --prefix netlify/functions
npx netlify dev
```

Open `http://localhost:8888/?room=test`

**GitHub Pages (no Netlify functions — local mode only):**

`https://mark-walhimer.com/netlify/loop-gallery/public/?room=test`

Shorter redirect: `https://mark-walhimer.com/netlify/loop-gallery/?room=test`

## JPEG rules

| Rule | Value |
|------|--------|
| File size | **500 KB – 2 MB** (original upload) |
| Max on wall | 100% wall height (`96` units), **1/100 wall length** width (`3.8` units max) |
| Min on wall | ⅓ wall height (`32` units) |
| Aspect | Must fit inside max box while meeting minimums |

Exports are re-encoded to stay under 2 MB when possible.

## Moderation

Set Netlify env **`GALLERY_MOD_TOKEN`** (secret string).

Moderator URL: `https://YOUR-SITE.netlify.app/?room=alumni-2026&mod=YOUR_SECRET`

- **Remove nearest** button (or **Backspace**) deletes the closest hung slot
- Firebase mode: `/.netlify/functions/gallery-delete` removes Firestore doc + Storage object
- Requires `FIREBASE_SERVICE_ACCOUNT_JSON` for server delete

## Deploy

1. Netlify → **New site** → GitHub → `walhimer-studio/walhimer.github.io`
2. **Site configuration → Build & deploy → Build settings**
3. **Base directory:** `netlify/loop-gallery` *(required — do not publish repo root)*
4. Leave publish/functions to `netlify.toml` (`public` + `netlify/functions`)
5. Set environment variables (see below)
6. Deploy

If deploy fails with `Invalid filename … # …`, the base directory is wrong (Netlify is publishing the whole repo).

Invite link: `https://YOUR-SITE.netlify.app/?room=alumni-2026`

## Controls

| Input | Action |
|-------|--------|
| ↑↓ ←→ | Move |
| Drag | Look |
| Scroll | Forward/back |
| W | Toggle auto-walk |
| R | Record hallway to MP4 (or WebM fallback) · motion soundscape audio |
| M | Toggle motion soundscape mute |
| Choose JPEG + Hang left/right | Place in nearest empty slot |

## Firebase (optional, multi-user sync)

### Netlify env (client config)

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_GALLERY_ROOT` (optional, default `loopGallery`)
- `GALLERY_MOD_TOKEN` — secret for `?mod=` moderation URLs

### Server IP limit (5 uploads)

- `FIREBASE_SERVICE_ACCOUNT_JSON` — full service account JSON string

Function: `/.netlify/functions/gallery-limit`

### Firestore layout

```
loopGallery/{roomId}/slots/{slotId}  → side, worldZ, aspect, url
loopGalleryRooms/{roomId}/limits/{ipHash}    → count
```

### Storage layout

```
loopGallery/rooms/{roomId}/images/{slotId}.jpg
```

Without Firebase, the gallery runs in **local mode** (localStorage + object URLs).

## Rules

- **Slot grid** every 18 units along Z — left (`L`) and right (`R`)
- **One JPEG per slot** — cannot cover another work
- **Max 5 uploads** per browser (localStorage) and per IP (when server limit is wired)

### Example Firestore / Storage rules (adjust project id)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /loopGallery/{roomId}/slots/{slotId} {
      allow read: if true;
      allow create, update: if request.resource.data.keys().hasAll(['side','worldZ','aspect','url'])
        && request.resource.data.url is string
        && request.resource.data.side in ['L','R'];
      allow delete: if false;
    }
    match /loopGalleryRooms/{roomId}/limits/{ipHash} {
      allow read, write: if false;
    }
  }
}
```

Storage: allow public read on `loopGallery/rooms/{roomId}/images/{file}`; writes only via authenticated admin (Netlify function uses service account).

## Files

| Path | Purpose |
|------|---------|
| `public/index.html` | Invisible layer hallway + hung frames + upload UI |
| `public/invisible-layer-hall.mjs` | Full invisible layer shader engine (from Alumni POC) |
| `public/gallery-sync.mjs` | Optional Firebase sync + moderation helpers |
| `netlify/functions/firebase-config.mjs` | Client Firebase config |
| `netlify/functions/gallery-limit.mjs` | IP upload counter |
| `netlify/functions/gallery-mod-check.mjs` | Validates moderation token |
| `netlify/functions/gallery-delete.mjs` | Moderator slot delete (Firestore + Storage) |
