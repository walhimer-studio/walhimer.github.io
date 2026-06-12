# Cloud brain — Render + GitHub

Run **`dna-bridge`** 24/7 so the Surrender Stack stays alive when your Mac is off.

| Layer | Where |
|-------|--------|
| **display.html** | Firebase Hosting (already deployed) |
| **Firebase RTDB** | Google cloud |
| **Supabase** | genomes + scars |
| **dna-bridge** | **Render Background Worker** ← this doc |

Display URL (share on social):

`https://surrender-machines-pocv1.web.app/display.html?venue=mac-local`

---

## Before you start

- [ ] Code is on GitHub (`walhimer-studio/walhimer.github.io`)
- [ ] [render.com](https://render.com) account (sign in with GitHub)
- [ ] Firebase + Supabase keys from your local `config/*.local.mjs` (never commit these)
- [ ] **Stop** the Mac bridge when the cloud one is running — only **one** brain per `venue`

---

## 1. Create the worker

1. Render Dashboard → **New +** → **Background Worker**
2. **Connect repository** → `walhimer-studio/walhimer.github.io` (or your fork)
3. Settings:

| Field | Value |
|-------|--------|
| **Name** | `surrender-dna-bridge` (any name) |
| **Region** | Oregon or closest to you |
| **Branch** | `main` |
| **Root Directory** | `machine-aesthetic` |
| **Runtime** | Node |
| **Build Command** | `cd surrender-stack-poc && npm install` |
| **Start Command** | `cd surrender-stack-poc && node bridge/dna-bridge.mjs` |
| **Instance type** | **Starter ($7/mo)** — 512 MB, always on |

4. **Do not deploy yet** — add environment variables first (step 2).

---

## 2. Environment variables

In the worker → **Environment** → add each row below.

Copy values from `machine-aesthetic/surrender-stack-poc/config/firebase-config.local.mjs` and `supabase-config.local.mjs`.

### Required — Firebase

| Key | Source field |
|-----|----------------|
| `FIREBASE_API_KEY` | `firebaseConfig.apiKey` |
| `FIREBASE_AUTH_DOMAIN` | `firebaseConfig.authDomain` |
| `FIREBASE_DATABASE_URL` | `firebaseConfig.databaseURL` |
| `FIREBASE_PROJECT_ID` | `firebaseConfig.projectId` |
| `FIREBASE_STORAGE_BUCKET` | `firebaseConfig.storageBucket` |
| `FIREBASE_MESSAGING_SENDER_ID` | `firebaseConfig.messagingSenderId` |
| `FIREBASE_APP_ID` | `firebaseConfig.appId` |

Optional (defaults match POC):

| Key | Default |
|-----|---------|
| `FIREBASE_OPERATOR_ROOT` | `surrender-stack-poc/operator` |
| `FIREBASE_GENOME_ROOT` | `surrender-stack-poc/genome` |

### Required — Supabase

| Key | Source |
|-----|--------|
| `SUPABASE_URL` | `supabaseConfig.url` |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabaseConfig.serviceRoleKey` |

Optional:

| Key | Default |
|-----|---------|
| `SM_SPECIES_ID` | `surrender-machines` |

### Bridge runtime

| Key | Value | Notes |
|-----|--------|--------|
| `SM_VENUE_ID` | `mac-local` | Same venue as your display URL |
| `SM_SEED` | `77823` | Birth seed |
| `NODE_VERSION` | `20` | Optional — Render usually auto-detects |

OSC/Pd on Render sends UDP to localhost (no listener) — harmless. Sound stays on your Mac when you run Pd locally; visitors only see the cube via Firebase.

---

## 3. Deploy

1. Click **Create Background Worker** (or **Manual Deploy** if you added env vars after create).
2. Open **Logs**. You should see:

```
load-config: firebase from environment
load-config: supabase from environment
Surrender Stack POC — dna-bridge
  venue:    mac-local
  species:  surrender-machines
  seed:     77823
```

3. Open the display URL on phone/desktop — HUD should show **genome live** and stress/scars updating.

---

## 4. Turn off the Mac brain

On your Mac:

```bash
# find bridge
npm run status   # in surrender-stack-poc/

# stop the local bridge process (Ctrl+C in that terminal, or kill PID from status)
```

If both Mac and Render run `mac-local`, they fight over Firebase/Supabase.

---

## 5. Auto-deploy on git push

Render enables this by default when connected to GitHub.

- Push to `main` → Render rebuilds and restarts the worker.
- Only changes under `machine-aesthetic/` matter for the build; the whole repo is still cloned.

Optional: add `render.yaml` at repo root later for blueprint-as-code (not required for first deploy).

---

## Verify

| Check | How |
|-------|-----|
| Worker running | Render dashboard → green **Live** |
| Genome updating | Display HUD — stress/scars change over time |
| Controls work | Move sliders on phone — cube responds |
| Mac off test | Quit local bridge, close laptop — display still live after ~1 min |

Local health (when Mac bridge is off):

```bash
cd machine-aesthetic/surrender-stack-poc
npm run diagnose
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Using firebase-config.example.mjs` in logs | Env vars missing or typo — fix in Render Environment |
| Build fails on `npm install` | Confirm **Root Directory** is `machine-aesthetic` |
| `Cannot find module ... emergent-dna` | Root must be `machine-aesthetic`, not `surrender-stack-poc` |
| Genome frozen | No worker running, or second bridge conflicting — one brain per venue |
| Display works, no evolution | Worker crashed — check Render logs |

---

## Cost

- **Render Starter worker:** $7/month (always on)
- Firebase Hosting + RTDB + Supabase free tiers: usually $0 at POC scale

---

## Related

- [STATUS.md](./STATUS.md) — POC status
- [STACK.md](./STACK.md) — architecture
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Mac/local issues
