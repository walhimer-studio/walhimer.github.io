import { createOscSender } from "./osc-send.mjs";

const TRAIT_OSC = ["warmth", "machine", "surrender", "scar", "gold"];

/** Map Emergent DNA express() → /sm/* OSC. See docs/OSC.md */
export function expressToOsc(osc, snap, { speciesId = "surrender-machines", venueId = "mac-local", operator = {} } = {}) {
  const stopMotion = !!operator.stopMotion;
  const speed = Math.max(0, Number(operator.speed) ?? 100) / 100;
  osc.send("/sm/poc/ready", 1);
  osc.send("/sm/console/ready", 1);
  osc.send("/sm/poc/venue", venueId);
  osc.send("/sm/console/seed", snap.seed >>> 0);
  osc.send("/sm/dna/generation", snap.generation ?? 0);
  osc.send("/sm/poc/stopMotion", stopMotion ? 1 : 0);
  osc.send("/sm/state/energy", stopMotion ? 0 : (snap.vitality ?? 0));
  osc.send("/sm/state/stress", snap.stress ?? 0);
  osc.send("/sm/state/vitality", snap.vitality ?? 0);

  for (const name of TRAIT_OSC) {
    const v = snap.traits?.[name];
    if (typeof v === "number") {
      osc.send(`/sm/dna/param/${name}`, v);
    }
  }

  const weights = TRAIT_OSC.map((n) => snap.traits?.[n] ?? 0);
  osc.send("/sm/dna/weights", ...weights);

  const hz =
    (55 + (snap.seed % 97)) * (0.55 + (snap.vitality ?? 0.5) * 0.9) * (0.8 + (snap.traits?.machine ?? 0.5) * 0.4);
  osc.send("/sm/gear/hz", 0, stopMotion ? hz : hz * speed);

  if (snap.flags?.recentGold) {
    osc.send("/sm/event/gold", snap.traits?.gold ?? 0.5);
  }
  if (snap.flags?.breaking) {
    osc.send("/sm/audio/macro", "breaking", 1);
  }

  osc.send("/sm/console/branch", speciesId);
}

export function createOscBus(host, port) {
  return createOscSender(host, port);
}
