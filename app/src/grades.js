// The six colour grades. Each grade is a full poster look: the chrome
// stripes for the big title, the tint washed over the photos, the neon
// accent for the script subtitle and seal, and the poster's base colour.

export const GRADES = [
  {
    id: 'sunset',
    name: 'Sunset',
    base: '#2b1030',
    // Chrome bands, top to bottom: gold light, gold, orange, pink, purple, deep purple.
    chrome: ['#fff3c4', '#ffd23e', '#ff9a3d', '#ff5e7a', '#c44dff', '#7b2ff7'],
    tint: { color: '#ff7a3d', mode: 'soft-light', alpha: 0.55 },
    tint2: { color: '#ff3d81', mode: 'multiply', alpha: 0.18 },
    script: '#ffe9a8',
    glow: '#ff9a3d',
    seal: '#f6c453',
  },
  {
    id: 'neon-night',
    name: 'Neon night',
    base: '#0b1030',
    chrome: ['#d8fbff', '#5ef2ff', '#3d7bff', '#b04dff', '#ff2ea6', '#5a1e8a'],
    tint: { color: '#2e5bff', mode: 'soft-light', alpha: 0.55 },
    tint2: { color: '#ff2ea6', mode: 'multiply', alpha: 0.16 },
    script: '#7df9ff',
    glow: '#ff2ea6',
    seal: '#ffd23e',
  },
  {
    id: 'golden-hour',
    name: 'Golden hour',
    base: '#33200c',
    chrome: ['#fff8dc', '#ffdf6b', '#ffb03d', '#ff8a3d', '#d96b1e', '#7a3d0c'],
    tint: { color: '#ffb03d', mode: 'soft-light', alpha: 0.6 },
    tint2: { color: '#c46b1e', mode: 'multiply', alpha: 0.16 },
    script: '#fff3c4',
    glow: '#ffb03d',
    seal: '#f6c453',
  },
  {
    id: 'tropic-teal',
    name: 'Tropic teal',
    base: '#062a2a',
    chrome: ['#e6fff6', '#7df9d4', '#2fd4b8', '#1e9e8a', '#ffd23e', '#0c6b5a'],
    tint: { color: '#2fd4b8', mode: 'soft-light', alpha: 0.5 },
    tint2: { color: '#0c6b5a', mode: 'multiply', alpha: 0.18 },
    script: '#a8ffe9',
    glow: '#2fd4b8',
    seal: '#ffd23e',
  },
  {
    id: 'heatwave',
    name: 'Heatwave',
    base: '#33100c',
    chrome: ['#fff0c4', '#ffc93d', '#ff7a2e', '#ff3d2e', '#c41e4d', '#7a0c2e'],
    tint: { color: '#ff5e2e', mode: 'soft-light', alpha: 0.6 },
    tint2: { color: '#ff2e2e', mode: 'multiply', alpha: 0.18 },
    script: '#ffd23e',
    glow: '#ff5e2e',
    seal: '#f6c453',
  },
  {
    id: 'ultraviolet',
    name: 'Ultraviolet',
    base: '#1c0b33',
    chrome: ['#f3e6ff', '#d9a7ff', '#b04dff', '#7b2ff7', '#ff5e9e', '#3d1e8a'],
    tint: { color: '#8a3dff', mode: 'soft-light', alpha: 0.55 },
    tint2: { color: '#ff5e9e', mode: 'multiply', alpha: 0.16 },
    script: '#e9b8ff',
    glow: '#b04dff',
    seal: '#ffd23e',
  },
];

/** Returns the grade object for an id, falling back to Sunset. */
export function getGrade(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

/** Per-panel photo filters, applied with the canvas 2D `filter` property. */
export const FILTERS = [
  { id: 'original', name: 'Original', css: 'none' },
  { id: 'duotone', name: 'Duotone', css: 'grayscale(1) contrast(1.15) brightness(1.05)' },
  { id: 'noir', name: 'Noir', css: 'grayscale(1) contrast(1.35) brightness(0.92)' },
  { id: 'warm', name: 'Warm pop', css: 'saturate(1.5) contrast(1.12) sepia(0.25)' },
];
