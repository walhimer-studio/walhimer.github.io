# Troubleshooting

Run first:

```bash
node scripts/diagnose.mjs
```

---

## Safari: "network connection was lost"

**Cause:** macOS Firewall blocks **node** from accepting LAN connections.  
Localhost works; phone at `192.168.1.73` gets empty reply.

Confirm:

```bash
node scripts/network-check.mjs
```

### Fix A — allow node (recommended)

1. **System Settings → Network → Firewall → Options**
2. Find **node** → **Allow incoming connections**
3. If node isn't listed, run `node web/serve.mjs` once, then check again
4. Restart: `node web/serve.mjs`

### Fix B — skip LAN entirely (best for phone)

Deploy controller to Firebase Hosting (HTTPS, no Wi‑Fi to Mac):

```bash
npm install -g firebase-tools   # once
firebase login                    # once
node scripts/deploy-controller.mjs
```

Phone opens the **https://…web.app/controller.html?venue=mac-local** URL it prints.

Mac only needs `node bridge/dna-bridge.mjs` running — phone talks to Firebase cloud.

---

**Vitality can be 0** after stress testing — the old patch multiplied audio by `energy` (= vitality), so silence.

1. Reload **`surrender-dna-vanilla.pd`** from disk (fixed gain · hz drives pitch)
2. Restart bridge: `node bridge/dna-bridge.mjs`
3. Optional fresh organism:

```bash
# bridge stopped first
node scripts/reset-venue.mjs
node bridge/dna-bridge.mjs
```

---

## Phone controller — Firebase

Firebase **is configured** (operator data exists in RTDB). If phone fails:

1. **Restart web server** (picks up new `/api/ping` + `/api/firebase-config`):

```bash
node web/serve.mjs
```

2. Phone URL (same Wi‑Fi): `http://<lan-ip>:8791/controller.html?venue=mac-local`

3. On the page you should see:
   - **LAN OK** — phone reached your Mac
   - **Firebase connected** — green dot when sliders work
   - Red text = exact error (paste to debug)

4. If **LAN fail** → Mac firewall → allow **node**, or disable firewall briefly

5. If **Firebase offline** on phone but LAN OK → phone may be on cellular VPN; disable VPN, stay on same Wi‑Fi as Mac

6. **Rules** (one-time): Firebase Console → Realtime Database → Rules → paste `config/firebase-database.rules.json` → Publish

---

## Phone loads but display doesn't change

Bridge must run: `node bridge/dna-bridge.mjs` — it reads operator from Firebase and writes genome back.

---

## Display stuck on "connecting…"

- Bridge must run: `node bridge/dna-bridge.mjs`
- Same Firebase rules (bridge writes `surrender-stack-poc/genome/mac-local`)
- Refresh display after bridge starts (~2 sec)

---

## `netreceive: listen failed: Address already in use`

Another process already owns **7401** — usually a **second Pd window** with the same patch still open.

1. Close extra Pd windows (keep **one** `surrender-dna-vanilla.pd`)
2. Or quit Pd entirely and reopen the patch once
3. Check: `lsof -nP -iUDP:7401` — should show at most one `pd`

Do **not** open two copies of the vanilla patch. OSC patch (`7400`) and vanilla (`7401`) can run together — two vanilla patches cannot.

If Pd log shows **`RAW: 101 110 101 …`** (byte numbers) instead of **`RAW: seed 77823`**, the patch is using `udpreceive` — reopen `surrender-dna-vanilla.pd` from disk (needs `netreceive 7401 1`).

---

## Pd silent / no RAW lines

1. Open **`surrender-dna-vanilla.pd`** (port **7401**, not OSC patch)
2. **Media → DSP on**
3. Restart bridge after any code change
4. Run `node scripts/diagnose.mjs` — sends test UDP
5. **Pd log** should show `RAW: seed 77823`

If still empty: Mac firewall blocking UDP localhost (rare).

---

## OSC 7400 vs plain 7401

| Port | Patch | When |
|------|-------|------|
| 7400 | `surrender-dna.pd` | Linux install · OF |
| 7401 | `surrender-dna-vanilla.pd` | **Mac dev — use this** |

OSC **is working** on 7400 from the bridge. Mac Pd uses 7401 by design.

---

## Too many scars / runaway breaks

Delete genome row in Supabase **genomes** for `mac-local`, restart bridge.
