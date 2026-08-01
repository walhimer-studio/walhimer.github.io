# Loop Gallery — Family Reunion Friday 2

Copy of [`loop-gallery/`](../loop-gallery/) for **Loop Art Critique Family Reunion** — separate room wall, same Firebase project.

## Live URL (GitHub Pages)

https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-2/public/

Shorter redirect:

https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-2/

Default Firebase room: **`family-reunion-friday-2`** (override with `?room=other-name`).

## Two URLs (same room, different screens)

| Screen | URL |
|--------|-----|
| **Wall** (projector / monitor — shows gallery + QR) | `https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-2/public/` or `?view=wall` |
| **Phone** (participants upload images) | `https://mark-walhimer.com/netlify/loop-gallery-family-reunion-friday-2/public/?view=phone` |

Default (no `view=` param) opens **wall** view with QR. Phone link is embedded in the QR and `?view=phone`.

**Wall view** hides the upload panel and shows a **QR code** (top-right) linking to the phone URL. **Phone view** shows Choose image / Hang on wall.

Images persist via **Firebase** (Firestore + Storage) when rules are set — refresh reloads all hung work for that room.

## Firebase rules (required for sync)

Project: [loop-gallery-family-reunion-3](https://console.firebase.google.com/project/loop-gallery-family-reunion-3)

If hang shows **Missing or insufficient permissions**, paste both rule sets below and click **Publish**.

**Firestore → Rules**

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

**Important:** path is `loopGallery/{roomId}/slots/` — **not** `loopGallery/rooms/{roomId}/slots/`.

**Storage → Rules**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /loopGallery/rooms/{roomId}/images/{file} {
      allow read: if true;
      allow write: if request.resource.size < 8 * 1024 * 1024
        && request.resource.contentType.matches('image/jpeg');
    }
  }
}
```

Without these rules, images may still appear **on your device only** (local fallback), but other phones will not sync.

## Netlify deploy (optional)

| Setting | Value |
|---------|--------|
| Base directory | `netlify/loop-gallery-family-reunion-friday-2` |
| Publish / functions | from `netlify.toml` |

Same Firebase env vars as `loop-gallery` — see [loop-gallery README](../loop-gallery/README.md).

## Difference from loop-gallery

| | `loop-gallery` | this copy |
|--|------------------|-----------|
| Default `?room=` | `default` | `family-reunion-friday-2` |
| Path | `netlify/loop-gallery/public/` | `netlify/loop-gallery-family-reunion-friday-2/public/` |

Code is otherwise identical; edit this folder when Friday 2 needs its own changes without touching the original gallery.
