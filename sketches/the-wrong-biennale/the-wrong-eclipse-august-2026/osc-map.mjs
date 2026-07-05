/**
 * OSC map — Holes in the Sky (/hit namespace).
 * Browser host logs bundles; OF brain + PD patch receive UDP on port 9000.
 */

export const OSC_PORT = 9000;
export const OSC_PREFIX = "/hit";

export function snapshotToOsc(snapshot, atmosphere, clock) {
  const messages = [
    [`${OSC_PREFIX}/ready`, 1],
    [`${OSC_PREFIX}/seed`, snapshot.seed >>> 0],
    [`${OSC_PREFIX}/vitality`, snapshot.vitality],
    [`${OSC_PREFIX}/stress`, snapshot.stress],
    [`${OSC_PREFIX}/obscuration`, snapshot.obscuration ?? clock.obscuration],
    [`${OSC_PREFIX}/phase`, snapshot.eclipsePhase ?? clock.phase],
    [`${OSC_PREFIX}/life/stage`, snapshot.lifeStage],
    [`${OSC_PREFIX}/life/norm`, snapshot.normalizedAge],
    [`${OSC_PREFIX}/traits/sky`, snapshot.traits?.sky ?? 0],
    [`${OSC_PREFIX}/traits/atmosphere`, snapshot.traits?.atmosphere ?? 0],
    [`${OSC_PREFIX}/traits/listening`, snapshot.traits?.listening ?? 0],
    [`${OSC_PREFIX}/traits/machine`, snapshot.traits?.machine ?? 0],
    [`${OSC_PREFIX}/atmo/cloud`, atmosphere?.cloud ?? 0],
    [`${OSC_PREFIX}/atmo/wind`, atmosphere?.wind ?? 0],
    [`${OSC_PREFIX}/atmo/aircraft`, atmosphere?.aircraft ?? 0],
    [`${OSC_PREFIX}/atmo/satellite`, atmosphere?.satellite ?? 0],
    [`${OSC_PREFIX}/clock/progress`, clock.progress ?? 0],
    [`${OSC_PREFIX}/clock/running`, clock.running ? 1 : 0],
  ];

  (snapshot.phases ?? []).forEach((v, i) => {
    messages.push([`${OSC_PREFIX}/phases/${i}`, v]);
  });

  return messages;
}

export function formatOscLine([addr, ...args]) {
  return `${addr} ${args.map((a) => (typeof a === "number" ? a.toFixed(4) : a)).join(" ")}`;
}

/** Note event for Pure Data Salamander sampler (midi-ish + binaural pan). */
export function noteToOsc(noteName, velocity, pan, reverse = false) {
  return [
    [`${OSC_PREFIX}/note/name`, noteName],
    [`${OSC_PREFIX}/note/vel`, velocity],
    [`${OSC_PREFIX}/note/pan`, pan],
    [`${OSC_PREFIX}/note/reverse`, reverse ? 1 : 0],
    [`${OSC_PREFIX}/note/trigger`, 1],
  ];
}
