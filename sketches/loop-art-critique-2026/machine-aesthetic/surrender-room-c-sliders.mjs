/**
 * Ghost Room 77823 — Room C slider panel (task #1)
 *
 * Visual match for the three emotion controls on:
 * https://mark-walhimer.com/installations/surrender-machines.html
 *
 * Sliders only — no surrender button (task #2), no machine wiring yet.
 * Import from ghost_dense_77823_room.mjs when ready to show in Room C.
 */

import { SURRENDER_DEFAULT_SLIDERS } from "./surrender-machine-core.mjs";

const STYLE_ID = "surrender-room-c-sliders-style";

/** Same copy + defaults as the installation page #controls grid (first three cells). */
export const SURRENDER_SLIDER_DEFS = [
  { key: "anger", label: "Anger", desc: "gears break" },
  { key: "ego", label: "Ego", desc: "static interference" },
  { key: "attachment", label: "Attachment", desc: "static residue" },
];

const CSS = `
.sm-room-c-sliders {
  --sm-black: #0a0a0a;
  --sm-offwhite: #f0ede6;
  --sm-dim: #888880;
  --sm-rule: #2a2a2a;
  --sm-accent: #c8a882;
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: min(900px, 94vw);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  z-index: 20;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}

.sm-room-c-sliders.is-visible {
  opacity: 1;
  visibility: visible;
}

.sm-room-c-sliders.is-interactive {
  pointer-events: auto;
}

.sm-room-c-sliders .sm-ctrl {
  background: rgba(10, 10, 10, 0.82);
  border: 1px solid var(--sm-rule);
  padding: 12px 14px;
  backdrop-filter: blur(6px);
}

.sm-room-c-sliders .sm-ctrl-label {
  font-family: "SF Mono", "IBM Plex Mono", ui-monospace, monospace;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sm-dim);
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sm-room-c-sliders .sm-ctrl-label .sm-val {
  color: var(--sm-offwhite);
  font-size: 11px;
}

.sm-room-c-sliders input[type="range"] {
  display: block;
  width: 100%;
  height: 3px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--sm-rule);
  border-radius: 0;
  outline: none;
  cursor: default;
  pointer-events: none;
}

.sm-room-c-sliders.is-interactive input[type="range"] {
  cursor: pointer;
  pointer-events: auto;
}

.sm-room-c-sliders input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--sm-offwhite);
  transition: background 0.15s;
}

.sm-room-c-sliders.is-interactive input[type="range"]::-webkit-slider-thumb {
  cursor: pointer;
}

.sm-room-c-sliders.is-interactive input[type="range"]::-webkit-slider-thumb:hover {
  background: var(--sm-accent);
}

.sm-room-c-sliders .sm-ctrl-desc {
  font-family: "SF Mono", "IBM Plex Mono", ui-monospace, monospace;
  font-size: 9.5px;
  color: #555;
  margin-top: 6px;
  letter-spacing: 0.06em;
}

@media (max-width: 620px) {
  .sm-room-c-sliders {
    grid-template-columns: 1fr;
    top: 12px;
    gap: 8px;
  }
}
`;

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

/**
 * @param {{
 *   parent?: HTMLElement,
 *   values?: { anger: number, ego: number, attachment: number },
 *   interactive?: boolean,
 *   visible?: boolean,
 * }} [opts]
 * @returns {{
 *   root: HTMLElement,
 *   inputs: Record<string, HTMLInputElement>,
 *   values: Record<string, HTMLSpanElement>,
 *   setVisible: (visible: boolean) => void,
 *   setInteractive: (interactive: boolean) => void,
 *   getValues: () => { anger: number, ego: number, attachment: number },
 *   setValues: (values: Partial<{ anger: number, ego: number, attachment: number }>) => void,
 *   destroy: () => void,
 * }}
 */
export function createSurrenderRoomCSliders(opts = {}) {
  ensureStyles();

  const initial = { ...SURRENDER_DEFAULT_SLIDERS, ...opts.values };
  const parent = opts.parent ?? document.body;

  const root = document.createElement("div");
  root.className = "sm-room-c-sliders";
  root.setAttribute("role", "group");
  root.setAttribute("aria-label", "Surrender machine emotion sliders");

  const inputs = {};
  const valueEls = {};

  for (const def of SURRENDER_SLIDER_DEFS) {
    const val = initial[def.key] ?? 50;

    const ctrl = document.createElement("div");
    ctrl.className = "sm-ctrl";
    ctrl.id = `sm-room-c-ctrl-${def.key}`;

    const labelRow = document.createElement("div");
    labelRow.className = "sm-ctrl-label";
    labelRow.textContent = def.label;

    const valSpan = document.createElement("span");
    valSpan.className = "sm-val";
    valSpan.textContent = String(val);
    labelRow.appendChild(valSpan);

    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "100";
    input.value = String(val);
    input.id = `sm-room-c-sl-${def.key}`;
    input.setAttribute("aria-label", def.label);
    input.disabled = !opts.interactive;

    const desc = document.createElement("div");
    desc.className = "sm-ctrl-desc";
    desc.textContent = def.desc;

    ctrl.append(labelRow, input, desc);
    root.appendChild(ctrl);

    inputs[def.key] = input;
    valueEls[def.key] = valSpan;

    input.addEventListener("input", () => {
      valueEls[def.key].textContent = input.value;
    });
  }

  parent.appendChild(root);

  function setVisible(visible) {
    root.classList.toggle("is-visible", visible);
  }

  function setInteractive(interactive) {
    root.classList.toggle("is-interactive", interactive);
    for (const input of Object.values(inputs)) {
      input.disabled = !interactive;
    }
  }

  function getValues() {
    return {
      anger: Number(inputs.anger.value),
      ego: Number(inputs.ego.value),
      attachment: Number(inputs.attachment.value),
    };
  }

  function setValues(values) {
    for (const def of SURRENDER_SLIDER_DEFS) {
      if (values[def.key] == null) continue;
      const n = Math.max(0, Math.min(100, Math.round(values[def.key])));
      inputs[def.key].value = String(n);
      valueEls[def.key].textContent = String(n);
    }
  }

  function destroy() {
    root.remove();
  }

  setInteractive(Boolean(opts.interactive));
  setVisible(Boolean(opts.visible));

  return {
    root,
    inputs,
    values: valueEls,
    setVisible,
    setInteractive,
    getValues,
    setValues,
    destroy,
  };
}
