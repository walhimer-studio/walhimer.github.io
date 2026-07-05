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

### Notes (Pure Data sampler)

| Address | Args | Notes |
|---------|------|--------|
| `/hit/note/name` | `s` | e.g. `C4` |
| `/hit/note/vel` | `f` | 0–1 |
| `/hit/note/pan` | `f` | -1…1 binaural |
| `/hit/note/reverse` | `i` | 1 during reverse phase |
| `/hit/note/trigger` | `i` | 1 fires sample |

FUDI equivalent for vanilla patch (port **9001**): `note C4 1; pan 0.25; vel 0.18; trigger 1;`
