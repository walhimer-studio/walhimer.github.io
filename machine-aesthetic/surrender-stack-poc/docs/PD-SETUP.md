# Pure Data — two patches

## Mac dev (recommended): `surrender-dna-vanilla.pd`

- Port **7401** · FUDI plain text · **no OSC library**
- Bridge sends FUDI lines (`seed 77823;`) automatically
- Patch uses **`netreceive 7401 1`** (UDP + FUDI parse — required for `route seed …`)
- Do **not** use `udpreceive` here; it outputs raw byte lists, not messages
- **Media → DSP on**

## Install / Linux: `surrender-dna.pd`

- Port **7400** · binary OSC · needs **osc** external (`oscparse`, `routeOSC`)
- **Help → Find externals → osc** · quit Pd · reopen patch
- See [OSC.md](./OSC.md)

## Which port?

| Port | Patch | When |
|------|-------|------|
| 7400 | `surrender-dna.pd` | Production · OF · Pis · Linux Pd |
| 7401 | `surrender-dna-vanilla.pd` | MacBook POC when OSC externals fail |

Both receive the same machine state from `dna-bridge`.
