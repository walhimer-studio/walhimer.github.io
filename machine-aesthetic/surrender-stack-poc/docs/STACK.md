# Install stack — MacBook POC → AMD Linux venue

## Now (POC)

```
iPhone ──Wi‑Fi──► Firebase (operator only)
                        │
MacBook Pro             ▼
  dna-bridge ◄──── Supabase (genome + scars, Realtime)
       │
       ├── OSC UDP 127.0.0.1:7400
       │      ├── Pure Data (DSP)
       │      └── openFrameworks Console (optional, same /sm/* addresses)
       │
       └── web/display.html (kernel snapshot visuals)
```

## Later (install)

Same diagram; swap **MacBook Pro** for **AMD Linux install brain** on gigabit switch:

```
                    ┌─────────────────────────┐
                    │  AMD Linux install brain │
                    │  dna-bridge · Pd · OF    │
                    └───────────┬─────────────┘
                                │ OSC /sm/*  (LAN)
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
         Pi LED wall      Pi touch LCD      projector / mapping
         /sm/led/*        kiosk page        OF output
                                │
                         robotics (OSC intent, Phase H)
                                │
                         Pd → audio IF → 4.1 / Dante → speakers
```

**Rules (unchanged from POC):**

- Firebase never touches Pd audio thread.
- Supabase never on hot path — only persistence + scar merge.
- One `dna-bridge` per venue owns the kernel.
- Pis are receivers (LED/LCD), not generative brains.

## Data paths

| Path | Speed | Content |
|------|-------|---------|
| Firebase `operator/{venue}` | ~100–300 ms | presence, calm, stressNudge, mood |
| Firebase `genome/{venue}` | ~500 ms write | read-only snapshot for display |
| Supabase `genomes` | seconds | full JSON genome per venue |
| Supabase `scars` | Realtime + 15 min poll | cross-venue scar merge |
| OSC `/sm/*` | local UDP | seed, traits, stress, gear hz |
