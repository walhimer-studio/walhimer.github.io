/** Alice Aycock palette — from sketches/aycock-ether-wind-geometry.js (colors only). */
export const PAL = {
  bg: "#C4C4CC",
  blue: "#74B4DC",
  blueHi: "#80B8E8",
  blueLo: "#6aaccc",
  navy: "#5A788C",
  gold: "#ECA018",
  terracotta: "#C84E24",
  maroon: "#662020",
  pink: "#d4787a",
  white: "#E8ECEE",
  whiteGlass: "rgba(232,236,238,0.58)",
  ink: "#2C3034",
  green: "#2e4a3a",
  slate: "#4a5e6c",
  charcoal: "#1a2b34",
  finGrey: "#b8bcc4",
  royal: "#5A788C",
  ringRed: "#C41E20",
  ringYellow: "#E5A823",
};

export function hexToThree(hex) {
  return parseInt(hex.replace("#", ""), 16);
}

export const BG_COLORS = [
  PAL.bg, PAL.white, PAL.finGrey, PAL.blueLo, PAL.blueHi, PAL.pink,
  PAL.charcoal, PAL.navy, PAL.green, PAL.maroon, PAL.slate,
];

export const LINE_COLORS = [
  PAL.navy, PAL.green, PAL.terracotta, PAL.blue, PAL.maroon, PAL.gold,
  PAL.slate, PAL.pink, PAL.charcoal, PAL.ringRed, PAL.ringYellow,
  PAL.ink, PAL.white, PAL.blueHi, PAL.blueLo,
];

export function luminance(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function pickFromPool(r, pool) {
  return pool[(r() * pool.length) | 0];
}

export function pickDistinctLineColors(r, count) {
  const pool = LINE_COLORS.slice();
  const out = [];
  for (let i = 0; i < count; i++) {
    if (!pool.length) pool.push(...LINE_COLORS);
    const idx = (r() * pool.length) | 0;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export function pickTheme(r) {
  const background = pickFromPool(r, BG_COLORS);
  const [trunk, fronds, grass, lifeline] = pickDistinctLineColors(r, 4);
  return {
    background,
    trunk,
    fronds,
    grass,
    lifeline,
    sizeScale: 0.72 + r() * 0.56,
    hudInk: luminance(background) > 0.52 ? PAL.ink : PAL.white,
  };
}
