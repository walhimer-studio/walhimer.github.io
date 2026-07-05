# OSC contract — Holes in the Sky

Prefix: **`/hit`**. UDP port **9000** (browser PoC logs only; OpenFrameworks brain sends; Pure Data receives).

| Address | Args | Notes |
|---------|------|--------|
| `/hit/ready` | `i` | 1 when host running |
| `/hit/seed` | `i` | Machine DNA seed |
| `/hit/vitality` | `f` | 0–1 life force |
| `/hit/stress` | `f` | 0–1 (reverse phase pressure) |
| `/hit/obscuration` | `f` | 0–1 eclipse obscuration |
| `/hit/phase` | `s` | `forward` · `deep` · `reverse` · `unwind` |
| `/hit/life/stage` | `s` | juvenile · mature · senescent · dying |
| `/hit/life/norm` | `f` | normalized age |
| `/hit/traits/sky` | `f` | trait |
| `/hit/traits/atmosphere` | `f` | trait |
| `/hit/traits/listening` | `f` | trait |
| `/hit/traits/machine` | `f` | trait |
| `/hit/atmo/cloud` | `f` | simulated / live |
| `/hit/atmo/wind` | `f` | |
| `/hit/atmo/aircraft` | `f` | |
| `/hit/atmo/satellite` | `f` | |
| `/hit/phases/0` … `4` | `f` | slow DNA phase clocks |
| `/hit/clock/progress` | `f` | 0–1 through eclipse arc |
| `/hit/clock/running` | `i` | 0/1 |

Pure Data patch `holes-in-the-sky.pd` listens on port 9000. OpenFrameworks host replaces browser log when wired.
