# Agents working in this repo

## Read first

1. **Machine DNA meaning:** [walhimer-studio/Machine-DNA `docs/CHRONICLE.md`](https://github.com/walhimer-studio/Machine-DNA/blob/main/docs/CHRONICLE.md) (site mirror + examples: `docs/machine-dna-chronicle.md`).
2. **`docs/SPEC-LOCK.md`** — user non-negotiables (canvas, lifeline, record). If code ≠ SPEC-LOCK, code is wrong.
3. **`.cursor/MACHINE_DNA_CANON.md`** — copy-paste sources for lifeline + CanvasRecorder.

## Before editing sketches / installations / artwork

- **Changing or deleting an existing file:** `.cursor/ALLOW_EDIT` must list the **exact path** for this session. Default is **empty** (hooks block changes to existing work).
- **Creating a new file:** no `ALLOW_EDIT` entry needed — a create cannot overwrite existing work. The user must still have asked for it; do not invent files.
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
