# 43″ / 55″ portrait wall template

**Binding workflow — Aug 2026**

**Cursor rule:** `.cursor/rules/wall-screen-portrait.mdc` (when present — always applied)

One canonical template. One new self-contained file per artwork.  
**Never edit the template or the art core when shipping a wall piece.**

Same shell for **Hisense 43QD5SV (43″)** and **55″** same series.

The template is **portrait** (tall panel). Art may be square or full-bleed — it sits **inside** the portrait frame. Shell `rotate` is for **HDMI mismatch only**, not art composition.

---

## Agent hard stops

If you are an agent: read this file before any `*_portrait.html` write.

| Stop | Why |
|------|-----|
| `fetch(` / `ART_CORE` / iframe in `*_portrait.html` | Wrong workflow — copy+paste only |
| Edit art core for HUD, seed, rotate, resize | Art core stays desk version |
| Edit canonical template per piece | Copy starter, don't edit in place |
| Rotate or stretch square art to fill portrait height | Portrait template ≠ stretch square |
| `?rotate=0` as an unprompted "fix" | Rotation is Hisense/HDMI decision |
| Pattern-match legacy fetch-based `*_portrait.html` | Pre-README; do not copy that approach |

**Before writing:** state template copied, art core (read-only), portrait path, square vs full-bleed starter, and every edit. Wait for user OK or `AUTHORIZE EDIT @path: …`.

---

## The rule (read this first)

| File | Can be updated? | When placing new art |
|------|-----------------|---------------------|
| **Template** (`portrait-wall.starter.html` or `portrait-wall.starter-square.html`) | Yes — studio improves shell here | **Do not touch** |
| **Art core** (`sketches/…/your-piece.html`) | Yes — you iterate the sketch there | **Do not touch** |
| **New portrait file** (`sketches/…/your-piece_portrait.html`) | Yes — this is the only file you create/edit for the wall | **Create by copy + paste** |

**Wrong:** fetch the art core at runtime, edit the art core “for wiring,” edit the template per piece, iframe, port, or substitute.

**Right:** copy template → paste a copy of the artwork into marked slots → **only the new `*_portrait.html` is edited** (HUD, seed, pasted copy tweaks) → publish that file as the wall URL.

**Three files, three rules:**

| File | Rule |
|------|------|
| Art core (`your-piece.html`) | **Never changed** for wall wiring |
| Template (`portrait-wall.starter*.html`) | **Never changed** per piece — copy it, don’t edit it |
| New portrait file (`your-piece_portrait.html`) | **Only file you edit** — paste art copy here, set HUD/seed/framing |

---

## Canonical template

| File | Role |
|------|------|
| [`portrait-wall.starter.html`](./portrait-wall.starter.html) | **Copy this** for full-bleed art |
| [`portrait-wall.starter-square.html`](./portrait-wall.starter-square.html) | **Copy this** for square art centered in portrait |
| This README | Checklist |

When the studio improves rotate logic or HUD styling, update the **starter(s) only**. Existing published `*_portrait.html` files are not auto-updated — re-copy the starter when you want to pick up template changes.

---

## Square art in portrait template

Example: square art core → `sketches/your-piece_portrait.html`

1. Copy **`portrait-wall.starter-square.html`** (not the full-bleed starter).
2. Paste art copy into HEAD and BODY slots.
3. In pasted body copy only: square canvas sizing (`min(w,h)` + `windowResized`), seed + HUD update.
4. Art core stays unchanged.
5. Desktop preview: `?rotate=0`. Hisense with landscape HDMI: default `rotate=auto`.

Result: **square canvas centered** in portrait panel, white margins top/bottom, HUD at bottom of panel.

---

## Workflow (each new piece)

### 1. Art core exists and is finished

Tune the sketch at e.g. `sketches/your-piece.html`.  
Do not add portrait rotate, HUD, or Hisense wiring to the art core.

### 2. Copy the template → new file

```bash
cp docs/wall-screen-edition/templates/portrait-wall.starter-square.html \
   sketches/your-piece_portrait.html
```

Naming: **`{art-basename}_portrait.html`** in the **same folder** as the art core (so relative `js/` paths still resolve).

### 3. Paste a copy of the artwork into the new file

Open **both** files. In the **new portrait file only**:

**ARTWORK HEAD slot** — paste from the art core:

- `<style>…</style>` blocks
- `<script src="…">` tags

Do **not** paste `<html>`, `<head>`, `<body>`, or `<title>` from the art file.

**ARTWORK BODY slot** — paste from the art core:

- Everything that was inside the art file’s `<body>` (usually the sketch `<script>…</script>`)

You are pasting a **copy**. The original art core stays unchanged.

### 4. Edit portrait-only fields in the new file

In `*_portrait.html` only:

| Field | Where |
|-------|--------|
| Page `<title>` | `<head>` |
| HUD artwork name | `.hud` first `<span>` |
| Seed line | `.hud .seed` / `#hud-seed` |
| `?rotate=` | URL query at runtime (shell handles it) |

Do **not** change rotate logic, portrait CSS, or shell scripts unless the canonical template was updated and you re-copied.

### 5. Publish the portrait file

**Hisense / catalog Live URL** = the `*_portrait.html` path.

Not the art core.

---

## Local preview

```bash
cd /path/to/walhimer.github.io
python3 -m http.server 8768 --bind 127.0.0.1
```

| URL | Use |
|-----|------|
| `/sketches/your-piece_portrait.html` | **Published wall URL** (self-contained) |

| Query | Meaning |
|-------|---------|
| `rotate=auto` (default) | Landscape HDMI → 90° for portrait panel |
| `rotate=90` / `270` / `0` | Force / upside down / off |

---

## Proven reference

| Role | Path |
|------|------|
| Art core (desk / catalog sketch) | `sketches/loop-snippets/ghost_dense_77823_gravity_sliders_43.html` |
| Catalog | `catalog/loop-snippets/ghost_dense_77823_gravity_sliders_43.md` |

Older `*_portrait.html` files that **fetch** the art core at runtime predate this README. New work uses the **copy + paste** starter above.

---

## Checklist before Hisense / catalog

- [ ] New file is a **copy** of a starter — template file untouched
- [ ] Art core file **unchanged** — artwork pasted as a copy into slots
- [ ] HUD shows artwork name and seed
- [ ] Live URL points at `*_portrait.html`, not the art core
- [ ] `python3 _scripts/check_self_contained.py` passes (if publishing to catalog)

---

## Don’t

- Edit a starter when adding a new piece — **copy** it
- Edit the art core to add portrait shell, HUD, or rotate
- Fetch / iframe the art core in the published wall URL
- Letterbox or CSS-stretch to “fix” fill — tune framing in the **pasted copy** inside `*_portrait.html` if needed, still without touching the art core
- Rely on macOS Display Rotation for Hisense
- Delete the templates folder when reverting agent work — use `git status` and remove only named files

---

## Updating the template later

1. Edit the starter under `docs/wall-screen-edition/templates/`
2. For each live piece that should pick up the change: copy the starter again, re-paste the artwork copy from the art core, restore title/seed/HUD text
3. Art core files still untouched

---

*Ghost dense 77823 gravity sliders · 43″ · Aug 2026*
