#!/usr/bin/env node
/**
 * Fast kernel iteration: edit organism.mjs → node examples/step.mjs
 */
import { createOrganism } from "../kernel/index.mjs";

const organism = createOrganism({
  seed: 77823,
  label: "cli-prototype",
  lifespanSeconds: 120,
});

const dt = 1;
for (let i = 0; i < 30; i++) {
  organism.update(dt, {
    presence: i > 10 ? 0.7 : 0.2,
    calm: i > 20 ? 0.1 : 0.5,
  });

  if (i === 12) {
    organism.applyEvent({ type: "break", intensity: 0.85 });
  }
  if (i === 22) {
    organism.applyEvent({ type: "visitor_nudge", intensity: 0.5 });
  }

  const s = organism.express();
  const t = s.traits;
  console.log(
    [
      `t=${String(i).padStart(2)}`,
      `stage=${s.lifeStage.padEnd(9)}`,
      `stress=${s.stress.toFixed(2)}`,
      `scar=${t.scar.toFixed(2)}`,
      `gold=${t.gold.toFixed(2)}`,
      s.flags.breaking ? "BREAK" : "",
      s.flags.recentGold ? "GOLD" : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
}

console.log("\n--- express() snapshot (final) ---");
console.log(JSON.stringify(organism.express(), null, 2));
