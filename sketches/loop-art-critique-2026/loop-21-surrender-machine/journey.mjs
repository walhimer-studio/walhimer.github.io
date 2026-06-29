/**
 * Loop 21 Surrender Machine — journey orchestrator (new file).
 */
import * as THREE from "three";
import { createVolTravel } from "./vol-travel-engine.mjs";
import { createVoidScene } from "./void-scene.mjs";

globalThis.THREE = THREE;

const DEFAULT_SEED = 210021;
const TRAVEL_MS = 16000;

const parseSeed = () => {
  try {
    const q = new URLSearchParams(location.search).get("seed");
    if (q != null && q !== "") {
      const n = Number(q) >>> 0;
      if (Number.isFinite(n)) return n;
    }
  } catch (_) {}
  return DEFAULT_SEED;
};

const seed = parseSeed();
const seedHud = document.getElementById("seed-hud");
const phaseLabel = document.getElementById("phase-label");
const continuePrompt = document.getElementById("continue-prompt");
const continueBtn = document.getElementById("continue-btn");
const moveHints = document.getElementById("move-hints");
const surrenderControls = document.getElementById("surrender-controls");
const slAnger = document.getElementById("sl-anger");
const slEgo = document.getElementById("sl-ego");
const slAttachment = document.getElementById("sl-attachment");
const valAnger = document.getElementById("val-anger");
const valEgo = document.getElementById("val-ego");
const valAttachment = document.getElementById("val-attachment");

const title = `Loop 21 Surrender Machine · ${seed >>> 0}`;
document.title = title;
if (seedHud) seedHud.textContent = title;

let travelIndex = 0;
let voidIndex = 0;
let exploreShown = false;
let volTravel = null;
let voidScene = null;

const syncSliderLabels = () => {
  if (valAnger) valAnger.textContent = slAnger?.value ?? "50";
  if (valEgo) valEgo.textContent = slEgo?.value ?? "50";
  if (valAttachment) valAttachment.textContent = slAttachment?.value ?? "50";
};

const getSurrenderSliders = () => ({
  anger: Number(slAnger?.value ?? 50),
  ego: Number(slEgo?.value ?? 50),
  attachment: Number(slAttachment?.value ?? 50),
});

[slAnger, slEgo, slAttachment].forEach((el) => {
  el?.addEventListener("input", syncSliderLabels);
});
syncSliderLabels();

const setPhaseLabel = (text) => {
  if (phaseLabel) phaseLabel.textContent = text;
};

const hideContinueUi = () => {
  exploreShown = false;
  continuePrompt?.classList.remove("visible");
  continuePrompt?.setAttribute("aria-hidden", "true");
  moveHints?.classList.remove("visible");
  moveHints?.setAttribute("aria-hidden", "true");
  surrenderControls?.classList.remove("visible");
};

const showContinueOnly = () => {
  continuePrompt?.classList.add("visible");
  continuePrompt?.setAttribute("aria-hidden", "false");
};

const showExploreUi = () => {
  moveHints?.classList.add("visible");
  moveHints?.setAttribute("aria-hidden", "false");
  if (voidIndex === 2) surrenderControls?.classList.add("visible");
  voidScene?.enableExplore();
};

const disposeScenes = () => {
  volTravel?.dispose();
  volTravel = null;
  voidScene?.dispose();
  voidScene = null;
};

const enterVoid = async () => {
  hideContinueUi();
  volTravel?.dispose();
  volTravel = null;

  setPhaseLabel(`Void ${voidIndex + 1} · ${["narrative", "dense", "surrender"][voidIndex]}`);

  voidScene = createVoidScene({
    voidIndex,
    seed,
    getSurrenderSliders,
    surrenderBtn: document.getElementById("surrender-btn"),
    onMachineComplete: showContinueOnly,
  });
  await voidScene.mount();
  voidScene.start();
};

const startRgbTravel = async () => {
  hideContinueUi();
  disposeScenes();
  setPhaseLabel(`RGB travel · segment ${travelIndex + 1}`);

  volTravel = await createVolTravel({
    seed: (seed + travelIndex * 9973) >>> 0,
    durationMs: TRAVEL_MS,
    onComplete: enterVoid,
  });
  volTravel.mount();
  await volTravel.start();
};

const leaveVoid = () => {
  voidScene?.stop();
  voidScene?.dispose();
  voidScene = null;
  hideContinueUi();

  if (voidIndex < 2) {
    voidIndex += 1;
    travelIndex += 1;
    startRgbTravel();
    return;
  }

  voidIndex = 0;
  travelIndex = 0;
  startRgbTravel();
};

continueBtn?.addEventListener("click", () => {
  if (!voidScene?.isMachineDone()) return;

  if (!exploreShown) {
    exploreShown = true;
    showExploreUi();
    return;
  }

  leaveVoid();
});

startRgbTravel();
