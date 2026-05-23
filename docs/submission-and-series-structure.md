# Submission & series folder structure

How to organize **competitions**, **residencies**, **critiques**, and **ongoing series** under `sketches/` so future-you can always find what you submitted, when, and where.

**Examples in this repo:**

| Folder | Type | Role |
|--------|------|------|
| [`sketches/loop-machine-aesthetic/`](../sketches/loop-machine-aesthetic/) | **Living workspace** | Ongoing Machine Aesthetic development |
| [`sketches/2026-lumen-prize-machine-aesthetic/`](../sketches/2026-lumen-prize-machine-aesthetic/) | **Frozen submission** | The Lumen Prize 2026 — do not edit after submit |
| [`sketches/loop-miami-2026/`](../sketches/loop-miami-2026/) | **Event / residency bundle** | Loop Miami 2026 planning + prototype copies |

---

## Two layers (always separate)

### 1. Living workspace

Where you **keep working**. Names describe the **project**, not the prize.

```
sketches/loop-machine-aesthetic/
sketches/bloom/
```

- Edit freely.
- Internal filenames (`ghost_dense_77823_room.mjs`) are fine here.
- When a deadline approaches, **copy** (do not move) into a dated submission folder.

### 2. Frozen submission / event bundle

A **snapshot** for one opportunity. Names include **year + opportunity + project**.

```
sketches/2026-lumen-prize-machine-aesthetic/
sketches/loop-miami-2026/
sketches/2027-lumen-prize-machine-aesthetic/   ← next year, new copy
```

- Copy the workspace at submission time.
- **Do not edit** after you submit (except redirects or typos in metadata).
- README must record the **exact URL** you pasted into the form.

---

## Folder naming

Use lowercase kebab-case under `sketches/`.

| Kind | Pattern | Example |
|------|---------|---------|
| Prize / competition | `{year}-{prize-or-org}-{project}` | `2026-lumen-prize-machine-aesthetic` |
| Residency / event / critique | `{event}-{year}` or `{year}-{event}-{project}` | `loop-miami-2026` |
| Living series | `{project}` or `{project}-{variant}` | `loop-machine-aesthetic`, `bloom` |

**Avoid:** `lumen-machine-aesthetic` without a year — you will not find it next year next to ARS, Loop, and Lumen folders.

---

## Public entry file (what you submit)

The URL you give jurors should **describe the work**, not internal build names.

| Avoid (internal) | Prefer (public) |
|------------------|-----------------|
| `ghost_dense_77823_room.html` | `seed-77823-rooms.html` |
| `surrender-machines-three-core.js` | (support file — not the form URL) |

Rules:

1. **One primary entry HTML** — the full experience jurors should see.
2. **Pair the module** — `seed-77823-rooms.html` loads `seed-77823-rooms.mjs`.
3. **Series hub** — `index.html` in the same folder lists entry + PDFs + README (not usually the form URL).
4. **Build artifacts** (`.glb`, etc.) stay gitignored unless the piece requires them on the live site.

**Lumen Prize 2026 submit URL:**

`https://mark-walhimer.com/sketches/2026-lumen-prize-machine-aesthetic/seed-77823-rooms.html`

---

## Required files in a submission folder

```
sketches/2026-lumen-prize-machine-aesthetic/
├── README.md              ← metadata + submit URL (required)
├── index.html             ← series hub for catalog visitors
├── seed-77823-rooms.html  ← primary entry (form URL)
├── seed-77823-rooms.mjs     ← walkthrough logic
└── …                      ← assets, essay PDF, core modules
```

### README template (copy for each submission)

```markdown
# {Opportunity} · {Project title}

{One sentence: what the piece is.}

**Frozen submission** — do not edit after {date submitted}.

## Live URL (submit this)

https://mark-walhimer.com/sketches/{folder}/{entry}.html

## Opportunity

| Field | Value |
|-------|--------|
| Opportunity | The Lumen Prize 2026 |
| Category | … |
| Submitted | YYYY-MM-DD |
| Entry URL | (same as above) |

## GitHub

Path: `sketches/{folder}/`

## Files

| File | Role |
|------|------|
| `{entry}.html` | Entry page — paste this URL in the form |
| `index.html` | Series hub |
| … | … |

## Run locally

cd sketches/{folder}
python3 -m http.server 8765
# open http://localhost:8765/{entry}.html
```

---

## Catalog registration checklist

After creating or renaming a submission folder:

1. **Series card** — add/update in [`sketches/index.html`](../sketches/index.html) under **Catalog series**.
2. **`SERIES` array** — add the same folder + files in the `const SERIES = […]` block in that file (drives search + file list).
3. **Refresh manifest** — `python3 _scripts/refresh_catalog.py`, commit `data/catalog.json`.
4. **Push** — GitHub Pages rebuilds mark-walhimer.com.
5. **Redirects** — if you renamed a folder or entry file, leave stub HTML at the old path (see [`sketches/lumen-machine-aesthetic/`](../sketches/lumen-machine-aesthetic/) → redirects to `2026-lumen-prize-machine-aesthetic/`).

---

## Workflow: new prize or residency

```
1. Work in living workspace     sketches/loop-machine-aesthetic/
2. Copy folder                  → sketches/2026-{prize}-{project}/
3. Rename public entry          → seed-77823-rooms.html (+ .mjs)
4. Write README                 → submit URL, date, opportunity name
5. Register in catalog          → index.html card + SERIES + refresh_catalog.py
6. Push
7. Paste README submit URL      → application form
8. Freeze folder                → no further edits
```

Next year: repeat from step 2 with `2027-…`; leave `2026-…` untouched.

---

## What you may still be missing

| Gap | Recommendation |
|-----|----------------|
| **Prix Ars Electronica 2026** | No dated folder in repo yet. When you locate the work, add `sketches/2026-ars-electronica-{project}/` with README + submit URL — same pattern as Lumen. |
| **Submission date in README** | Add `Submitted: YYYY-MM-DD` when you file — helps distinguish frozen copies. |
| **`catalog-work.html`** | When populated, mirror new series there (see [unified-catalog.md](./unified-catalog.md)); until then `sketches/index.html` is the source. |
| **Standalone vs walkthrough URL** | Submit the **full** piece URL unless the form asks for one component only. |
| **Old paths** | Any rename needs redirect stubs so bookmarks and old forms still resolve. |

---

## Related docs

- [unified-catalog.md](./unified-catalog.md) — `data/catalog.json`, refresh script, Dublin Core
- [archive-chronicle.md](./archive-chronicle.md) — public catalog vs manifest vs narrative archives
- [bloom-inventory.md](./bloom-inventory.md) — Bloom series paths and redirects
