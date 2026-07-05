import { createMachineDna } from "./machine-dna-kernel.mjs";
import { createEclipseClock } from "./eclipse-clock.mjs";
import { createAtmosphere } from "./atmosphere.mjs";
import { createAudioEngine } from "./audio-engine.mjs";
import { snapshotToOsc, formatOscLine } from "./osc-map.mjs";
import { makeRng } from "../../../machine-aesthetic/emergent-dna/kernel/rng.mjs";

export async function bootHolesInTheSky(root) {
  const els = {
    lifeBar: root.querySelector("#life-bar"),
    obscBar: root.querySelector("#obsc-bar"),
    phase: root.querySelector("#phase-label"),
    clockLabel: root.querySelector("#clock-label"),
    vitality: root.querySelector("#vitality-val"),
    notes: root.querySelector("#notes-val"),
    atmo: root.querySelector("#atmo-readout"),
    oscLog: root.querySelector("#osc-log"),
    status: root.querySelector("#status-label"),
    btnStart: root.querySelector("#btn-start"),
    btnStop: root.querySelector("#btn-stop"),
    btnReset: root.querySelector("#btn-reset"),
  };

  const clock = createEclipseClock("simulate");
  const dna = createMachineDna({ seed: 120826, lifespanSeconds: 6360 });
  const atmosphere = createAtmosphere(120826);
  const audio = createAudioEngine("samples/salamander-lite/");
  const _rng = makeRng(120826);
  const rng = () => _rng.random();

  els.status.textContent = "Loading Salamander samples…";
  await audio.load();
  els.status.textContent = "Ready — use headphones";

  let last = performance.now();
  let raf = 0;
  let oscThrottle = 0;

  function setRunning(on) {
    if (on) {
      clock.start();
      audio.resume();
      els.btnStart.disabled = true;
      els.btnStop.disabled = false;
    } else {
      clock.stop();
      els.btnStart.disabled = false;
      els.btnStop.disabled = true;
    }
  }

  function render(clockSnap, snap, atmo) {
    els.lifeBar.style.width = `${(snap.vitality * 100).toFixed(1)}%`;
    els.obscBar.style.width = `${(clockSnap.obscuration * 100).toFixed(1)}%`;
    els.phase.textContent = clockSnap.phase;
    els.clockLabel.textContent = clockLabel(clockSnap);
    els.vitality.textContent = snap.vitality.toFixed(3);
    els.notes.textContent = String(audio.noteCount());
    els.atmo.textContent = [
      `cloud ${atmo.cloud.toFixed(2)}`,
      `wind ${atmo.wind.toFixed(2)}`,
      `air ${atmo.aircraft.toFixed(2)}`,
      `sat ${atmo.satellite.toFixed(2)}`,
    ].join(" · ");
  }

  function clockLabel(s) {
    return `${s.label} · ${(s.progress * 100).toFixed(1)}% · ${s.elapsedSec.toFixed(0)}s`;
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    const clockSnap = clock.snapshot();
    const atmo = atmosphere.tick(dt, clockSnap.obscuration, clockSnap.phase);

    dna.update(dt, {
      obscuration: clockSnap.obscuration,
      atmosphere: atmo.density,
      eclipsePhase: clockSnap.phase,
      aircraft: atmo.aircraft,
    });

    const snap = dna.express();
    snap.obscuration = clockSnap.obscuration;
    snap.eclipsePhase = clockSnap.phase;

    if (clock.isRunning()) {
      if (clockSnap.phase === "reverse") {
        if (Math.random() < dt * 6) audio.triggerReverse(snap);
      } else if (clockSnap.phase !== "idle") {
        audio.triggerForward(snap, rng, atmo);
      }
      if (clockSnap.phase === "forward" && clockSnap.progress < 0.02) {
        audio.resetReverse();
      }
    }

    render(clockSnap, snap, atmo);

    oscThrottle += dt;
    if (oscThrottle > 0.5) {
      oscThrottle = 0;
      const lines = snapshotToOsc(snap, atmo, clockSnap)
        .slice(0, 6)
        .map(formatOscLine);
      els.oscLog.textContent = lines.join("\n");
    }

    if (clockSnap.progress >= 1 && clock.isRunning()) {
      setRunning(false);
      els.status.textContent = "Arc complete";
    }

    raf = requestAnimationFrame(tick);
  }

  els.btnStart.addEventListener("click", () => {
    setRunning(true);
    els.status.textContent = "Listening…";
  });

  els.btnStop.addEventListener("click", () => {
    setRunning(false);
    els.status.textContent = "Paused";
  });

  els.btnReset.addEventListener("click", () => {
    clock.reset();
    audio.clearHistory();
    audio.resetReverse();
    els.status.textContent = "Reset";
    render(clock.snapshot(), dna.express(), atmosphere.snapshot());
  });

  render(clock.snapshot(), dna.express(), atmosphere.snapshot());
  raf = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(raf);
}
