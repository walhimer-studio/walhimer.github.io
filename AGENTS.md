# Agents working in this repo

## Read first

1. **Machine DNA meaning:** [walhimer-studio/Machine-DNA `docs/CHRONICLE.md`](https://github.com/walhimer-studio/Machine-DNA/blob/main/docs/CHRONICLE.md) (site mirror + examples: `docs/machine-dna-chronicle.md`).
2. **`docs/SPEC-LOCK.md`** — user non-negotiables (canvas, lifeline, record). If code ≠ SPEC-LOCK, code is wrong.
3. **`.cursor/MACHINE_DNA_CANON.md`** — **COPY not invent:** transplant recorder from `invisible-layer-august-29-2026.html` (never grep-and-merge a new system). Then **step 2** ffmpeg `setpts=N/(60*TB)` → HEVC MP4. WebM alone is not done.

## Before editing sketches / installations / artwork

- **Creating, changing, or deleting any file:** `.cursor/ALLOW_EDIT` must list the **exact path** and the user must approve it with `AUTHORIZE EDIT @path: exact change`. **New files are not exempt.** Default is **empty** (hooks block every write to protected paths not listed).
- **Any file that uses a seed must follow Machine DNA:** read Machine-DNA `docs/SPEC.md` and `docs/SPEC-LOCK.md` first, and use the canonical `Rand` verbatim. No other generator (mulberry32, sfc32, xorshift, splitmix, …). The hook and the commit check refuse seeded files without it.
- User message must name the path and the change. No inferred “fixes.”
- Run before commit: `python3 _scripts/check_machine_dna.py`

## One Row V3 portrait (locked profile)

| Item | Value |
|------|-------|
| Canvas | 3840×2160 |
| pixelDensity | 4 |
| Record | 60 fps, same dimensions |
| Orientation | always portrait · `rotate=90` · bottom of landscape on left — one view everywhere |
| No | viewport canvas, scale wrappers, auto rotation, invented lifeline/recorder |

## Violations

If the user corrects artwork scope or you edit protected paths without authorization: **stop**, **revert**, log to `.cursor/incidents/artwork-violations.md`, report VIOLATION LOCK. Unlock only: `AUTHORIZE EDIT @<full-path>: <exact change>`.
