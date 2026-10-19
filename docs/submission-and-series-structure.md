# Series & submission folder structure

**Default for new public work:** one **show / year series** with a short URL, catalog mirror, and sketches hub. That is the long-term archive unit (Marfa 2026, Miami 2026, Loop 2026, Marfa 2027…).

**All artwork follows one studio pipeline** (Machine DNA, seed identity, hosts, publish gates): [Artwork pipeline](https://mark-walhimer.com/practice/artwork-pipeline.html) · [catalog/STUDIO-DIRECTION.md](../catalog/STUDIO-DIRECTION.md).

---

## 1. Show / year series (primary)

One show or year = one series name = one public page.

| Piece | Path |
|-------|------|
| Catalog statement | `catalog/{name}/README.md` |
| Hub + WIP | `sketches/{name}/` (hub = `index.html`) |
| Short URL | `https://mark-walhimer.com/{name}/` |
| Root redirect stub | `{name}/index.html` → `sketches/{name}/` (redirect only) |

**Canonical examples**

| Series | Live |
|--------|------|
| Marfa 2026 | https://mark-walhimer.com/marfa-2026/ |
| Miami 2026 | https://mark-walhimer.com/miami-2026/ |

**Naming:** lowercase kebab-case, usually `{show}-{year}` — `marfa-2026`, `miami-2026`, `loop-2026`. Next year is a **new** folder (`marfa-2027`), not an edit of last year’s freeze.

```
catalog/marfa-2026/README.md
sketches/marfa-2026/index.html    ← hub + works
marfa-2026/index.html             ← redirect stub only
```

### New series checklist

1. `catalog/{name}/README.md` (+ `{artwork}.md` when named)
2. `sketches/{name}/index.html` hub; put works in that folder
3. Root `{name}/index.html` redirect stub (copy Marfa/Miami pattern)
4. Add `{name}/index.html` to `STAGED_ROOT_STUB_ALLOW` in `_scripts/check_catalog_mirror.py`
5. Register in `sketches/index.html` → `SERIES`
6. Available row same day — see `.cursor/rules/launch-pages-available.mdc`
7. `python3 _scripts/reorder_series_by_index_mtime.py`
8. `python3 _scripts/refresh_catalog.py` → commit `data/catalog.json`
9. `check_catalog_mirror.py` · `check_catalog_sync.py` · `check_self_contained.py` → push

**Forbidden:** a full project tree at repo root next to `catalog/`. Root may only hold a **redirect stub**.

---

## 2. Prize / frozen submission (secondary)

Use when a **competition or residency** needs a frozen snapshot separate from the living show series.

| Kind | Pattern | Example |
|------|---------|---------|
| Prize / competition | `{year}-{prize-or-org}-{project}` | `2026-lumen-prize-machine-aesthetic` |
| Residency / event / critique (legacy) | `{event}-{year}` | `loop-art-critique-2026` |
| Living workspace (internal) | `{project}` | `loop-machine-aesthetic`, `bloom` |

**Prefer** promoting a critique/show into a **show/year series** (`loop-2026`) when it is public-facing. Keep prize folders for form URLs and freeze dates.

### Living workspace vs frozen copy

1. **Living workspace** — keep working (`sketches/loop-machine-aesthetic/`).
2. **Frozen submission** — **copy** (do not move) into a dated folder; do not edit after submit except redirects/typos.
3. README must record the **exact URL** pasted into the form.

### Public entry file (juried forms)

| Avoid (internal) | Prefer (public) |
|------------------|-----------------|
| `ghost_dense_77823_room.html` | `seed-77823-rooms.html` |

1. One primary entry HTML for the form.
2. Pair the module (`seed-77823-rooms.html` + `.mjs`).
3. Series hub `index.html` lists entry + docs (usually not the form URL).

**Lumen Prize 2026 submit URL (example):**  
`https://mark-walhimer.com/sketches/2026-lumen-prize-machine-aesthetic/seed-77823-rooms.html`

### README template (frozen submission)

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
```

### Workflow: new prize

```
1. Work in living workspace or show series
2. Copy → sketches/2026-{prize}-{project}/
3. Public entry + README (submit URL, date)
4. Catalog mirror + SERIES + refresh_catalog.py
5. Push · paste URL into form · freeze
```

Next year: new `2027-…` folder; leave `2026-…` untouched.

---

## Related docs

- [catalog/STUDIO-DIRECTION.md](../catalog/STUDIO-DIRECTION.md) — public series unit
- [unified-catalog.md](./unified-catalog.md) — `data/catalog.json`
- [archive-chronicle.md](./archive-chronicle.md) — catalog vs manifest
- [available/catalog.md](../available/catalog.md) — launch hubs → Available
- `.cursor/rules/publish-sketch-catalog.mdc` · `.cursor/rules/launch-pages-available.mdc`
