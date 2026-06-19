/** EmergentDNA / osc-midi-bridge canonical PRNG — same seed → same sequence everywhere. */
export class SeedRng {
  constructor(seed) {
    this.s = (seed >>> 0) || 1;
  }

  next() {
    const x = Math.sin(this.s++) * 10000;
    return x - Math.floor(x);
  }

  range(a, b) {
    return a + this.next() * (b - a);
  }

  int(a, b) {
    return Math.floor(this.range(a, b + 1));
  }
}

/** Derive base frequency (Hz) from seed + energy — shared by bridge and display. */
export function seedToHz(seed, energy) {
  const rng = new SeedRng(seed);
  const base = 55 + rng.next() * 110;
  return base * (0.6 + energy * 0.8);
}
