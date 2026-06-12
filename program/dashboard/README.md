# Studio dashboard — proof of concept

Private ops UI for the **markwalhimer.com** daily pipeline: approve drafts, queue social posts, read analytics, track competitions.

Based on your draft `Desktop/markwalhimer-dashboard.html` (now also in-repo as [studio-dashboard.html](studio-dashboard.html)). **Ops only** — does not modify sketches or artwork.

---

## Folder address

```
/Users/markwalhimer/Documents/GitHub/walhimer.github.io/program/dashboard/
```

| Path | Role |
|------|------|
| [index.html](index.html) | Live POC shell (server + `state.json`) |
| [studio-dashboard.html](studio-dashboard.html) | Static UI mock — design reference, open in browser |
| [css/dashboard.css](css/dashboard.css) | Styles (from your draft) |
| [js/dashboard.js](js/dashboard.js) | Renders UI from state; wires buttons |
| [data/state.json](data/state.json) | POC pipeline data (drops, analytics, etc.) |
| [server.mjs](server.mjs) | Local server + `/api/state` + `/api/action` |

Related docs: [../ADMIN.md](../ADMIN.md), [../drops.schema.json](../drops.schema.json), [../../data/catalog.json](../../data/catalog.json)

---

## Run locally

```bash
cd /Users/markwalhimer/Documents/GitHub/walhimer.github.io/program/dashboard
node server.mjs
```

Open **http://127.0.0.1:8790**

Optional port: `DASHBOARD_PORT=8800 node server.mjs`

---

## What works in this POC

| Action | Behavior |
|--------|----------|
| **Approve → Mint** | Draft → `minted` in `state.json`; adds minting log row (simulated — no chain) |
| **Reject** | Draft → `skipped` |
| **Edition / marketplace** | Updates drop record |
| **Save captions** | Writes IG + X text to drop `post1` |
| **Post both / IG / X** | Marks `publishedAt`; adds to recent posts (simulated — no APIs) |
| **Skip** | Skips social post for that work |

All pages render from `data/state.json`: Today, Social queue, Approvals, Catalog, Minting log, Analytics, Newsletter, Competitions.

---

## Not wired yet

- Real mint (Transient Labs / viem)
- Instagram / X APIs
- Mailchimp
- Live preview thumbnails from generators
- Sync to `data/catalog.json` on mint
- Password auth (localhost only for now)

---

## Next steps

1. `program/drops/YYYY-MM-DD/drop.json` written by generators → server reads drops folder
2. Approve triggers pin + TL mint script
3. Optional Supabase mirror for analytics events
4. Deploy behind auth at `admin.mark-walhimer.com` (not public GitHub Pages)
