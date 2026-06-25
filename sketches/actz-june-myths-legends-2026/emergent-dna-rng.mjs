/**
 * Seeded 32-bit PRNG — same algorithm as ghost-machine-core.mjs
 * so Three.js hosts and this kernel stay numerically aligned.
 */
export function makeRng(seed) {
  let s = seed >>> 0;
  return {
    seed: s,
    random() {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    uniform(a, b) {
      return a + this.random() * (b - a);
    },
    randint(a, b) {
      return a + Math.floor(this.random() * (b - a + 1));
    },
  };
}

/** Optional one-time entropy for birth seed only. */
export function birthSeed(fallback = 77823) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] >>> 0;
  }
  return (fallback ^ ((Date.now() & 0xffff) << 16)) >>> 0;
}
