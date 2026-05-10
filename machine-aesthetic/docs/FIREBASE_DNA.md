# Firebase & emergent DNA (draft)

Web client config pattern already exists at **`machine aesthetic/firebase-config.example.js`** (copy to a **gitignored** `firebase-config.local.js` for real keys).

## Principles

- **Hot path** (audio, tight visuals): local OSC / RAM — not blocked on network.
- **DNA**: slower mutations, session logs, calibration, lineage — **Firestore** or **Realtime Database** depending on query patterns (pick one product per deployment).

## Suggested collections / paths (names only — adjust in Firebase Console)

### `sessions/{sessionId}`

| Field | Type | Notes |
|-------|------|--------|
| `startedAt` | timestamp | |
| `endedAt` | timestamp | optional |
| `seed` | string | links to Loop / web shell seed if shared |
| `venue` | string | e.g. `on-land`, `install` |

### `genomes/{genomeId}`

| Field | Type | Notes |
|-------|------|--------|
| `createdAt` | timestamp | |
| `parentId` | string? | lineage |
| `params` | map | floats/ints — mirror subset broadcast as OSC when stable |
| `label` | string? | human-readable |

### `operators/{uid}` (optional)

Overrides or locks when you moderate during critique.

## Security

- **Rules**: deny public read/write; use auth for operators; anonymous read only if the artwork intentionally exposes public state.
- Never commit live keys; rotate if leaked.

## Link to OSC

When DNA changes pass a threshold, Python or OF should emit **`/sm/dna/*`** (see `OSC.md`) so PD and hardware stay in sync without touching Firebase directly.
