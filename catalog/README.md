# Catalog — Mark Walhimer archive

**Public archive** of works. Each entry is a folder; each folder has a **markdown file for that folder**. Artworks add a **markdown file for the artwork**. Work in progress (HTML, code) lives in the matching path under **`sketches/`** until a piece is canonical → **`installations/`** and/or homepage.

Repo: [walhimer-studio/walhimer.github.io](https://github.com/walhimer-studio/walhimer.github.io) · Site: [mark-walhimer.com](https://mark-walhimer.com)

---

## Structure (same for every entry)

```
catalog/
├── README.md                 ← this file — the catalog section
└── {folder}/
    ├── README.md             ← markdown for this folder
    ├── {subfolder}/          ← optional (series, opportunity, year, …)
    │   ├── README.md         ← markdown for this folder
    │   ├── {artwork}.md      ← artwork statement (when applicable)
    │   └── …
    └── …

sketches/{same-path}/        ← WIP code (mirrors catalog project folders)
```

**When you start a new work:** create a folder under `catalog/` and write its folder `README.md`. Add `{artwork}.md` when the piece has a name. Add WIP files under `sketches/{same-path}/`.

---

## Entries

| Folder | Description |
|--------|-------------|
| [the-wrong-biennale/](./the-wrong-biennale/) | The Wrong Biennale — submissions and opportunities |
