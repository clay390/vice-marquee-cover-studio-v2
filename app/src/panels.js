// The five multi-panel poster geometries. Each layout maps the cover's panel
// area (below the masthead band, above the title zone) into named panels.
// Coordinates are fractions of the cover size, so every export size shares
// the same composition. `role` is the default callout tag for that panel.

const ROLES = [
  'THE INSIDER', 'THE BOSS', 'THE RIDER', 'THE DRIVER',
  'THE COURIER', 'THE MECHANIC', 'THE CREW',
];

function panel(x, y, w, h, role, angle = 0) {
  return { x, y, w, h, role, angle };
}

/** Panel area: masthead occupies the top 9%, the title zone the bottom 20%. */
export const PANEL_AREA = { x: 0.03, y: 0.095, w: 0.94, h: 0.66 };

export const LAYOUTS = [
  {
    id: 'hero-mosaic',
    name: 'Hero mosaic',
    hint: 'One big hero, four supporting shots',
    panels(a) {
      const { x, y, w, h } = a;
      return [
        panel(x, y, w * 0.60, h, ROLES[0]),
        panel(x + w * 0.615, y, w * 0.385, h * 0.36, ROLES[1]),
        panel(x + w * 0.615, y + h * 0.375, w * 0.185, h * 0.30, ROLES[2]),
        panel(x + w * 0.815, y + h * 0.375, w * 0.185, h * 0.30, ROLES[3]),
        panel(x + w * 0.615, y + h * 0.69, w * 0.385, h * 0.31, ROLES[4]),
      ];
    },
  },
  {
    id: 'hero-three',
    name: 'Hero + three',
    hint: 'Hero left, three stacked right',
    panels(a) {
      const { x, y, w, h } = a;
      return [
        panel(x, y, w * 0.56, h, ROLES[0]),
        panel(x + w * 0.575, y, w * 0.425, h * 0.32, ROLES[1]),
        panel(x + w * 0.575, y + h * 0.34, w * 0.425, h * 0.32, ROLES[2]),
        panel(x + w * 0.575, y + h * 0.68, w * 0.425, h * 0.32, ROLES[3]),
      ];
    },
  },
  {
    id: 'six-grid',
    name: 'Six grid',
    hint: 'Three across, two down',
    panels(a) {
      const { x, y, w, h } = a;
      const out = [];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          out.push(panel(
            x + (w * c) / 3 + (c ? w * 0.015 : 0),
            y + (h * r) / 2 + (r ? h * 0.02 : 0),
            w / 3 - w * 0.015,
            h / 2 - h * 0.02,
            ROLES[r * 3 + c],
          ));
        }
      }
      return out;
    },
  },
  {
    id: 'diagonal-trio',
    name: 'Diagonal trio',
    hint: 'Three tilted panels, fanned like snapshots',
    panels(a) {
      const { x, y, w, h } = a;
      return [
        panel(x + w * 0.02, y + h * 0.06, w * 0.34, h * 0.86, ROLES[0], -4),
        panel(x + w * 0.33, y, w * 0.34, h * 0.94, ROLES[1], 0),
        panel(x + w * 0.64, y + h * 0.06, w * 0.34, h * 0.86, ROLES[2], 4),
      ];
    },
  },
  {
    id: 'seven-mosaic',
    name: 'Seven mosaic',
    hint: 'A full cast: seven panels',
    panels(a) {
      const { x, y, w, h } = a;
      return [
        panel(x, y, w * 0.32, h * 0.32, ROLES[0]),
        panel(x + w * 0.34, y, w * 0.32, h * 0.32, ROLES[1]),
        panel(x + w * 0.68, y, w * 0.32, h * 0.32, ROLES[2]),
        panel(x, y + h * 0.34, w * 0.66, h * 0.32, ROLES[3]),
        panel(x + w * 0.68, y + h * 0.34, w * 0.32, h * 0.32, ROLES[4]),
        panel(x, y + h * 0.68, w * 0.49, h * 0.32, ROLES[5]),
        panel(x + w * 0.51, y + h * 0.68, w * 0.49, h * 0.32, ROLES[6]),
      ];
    },
  },
];

/** Returns the layout object for an id, falling back to the first layout. */
export function getLayout(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

/** Resolves a layout into absolute panel rects (pixels) for a W x H cover. */
export function layoutPanels(id, W, H) {
  const a = { x: PANEL_AREA.x * W, y: PANEL_AREA.y * H, w: PANEL_AREA.w * W, h: PANEL_AREA.h * H };
  return getLayout(id).panels(a).map((p) => ({
    x: p.x, y: p.y, w: p.w, h: p.h, role: p.role, angle: p.angle,
  }));
}

/** How many photo slots a layout uses. */
export function layoutSlotCount(id) {
  return getLayout(id).panels(PANEL_AREA).length;
}
