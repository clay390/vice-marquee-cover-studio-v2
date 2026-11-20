// Editor state: one plain object, JSON-serialisable except for the photo
// data URLs, which undo/redo snapshots carry along. Seven slots exist so
// every layout has a photo ready; a layout only shows its own panel count.
import { getLayout } from './panels.js';
import { getPreset } from './captions.js';

export function blankSlot(role) {
  return { src: null, zoom: 1, ox: 0, oy: 0, flip: false, role, filter: 'original' };
}

/** The fresh editor state: the Vice Marquee preset on the hero mosaic. */
export function defaultState() {
  const preset = getPreset('vice-marquee');
  const roles = getLayout('hero-mosaic').panels({ x: 0, y: 0, w: 1, h: 1 }).map((p) => p.role);
  const allRoles = ['THE INSIDER', 'THE BOSS', 'THE RIDER', 'THE DRIVER', 'THE COURIER', 'THE MECHANIC', 'THE CREW'];
  return {
    layout: 'hero-mosaic',
    grade: 'sunset',
    size: '1080x1080',
    title: preset.title,
    script: preset.script,
    tagline: preset.tagline,
    quote: preset.quote,
    source: preset.source,
    volume: preset.volume,
    presetId: preset.id,
    look: { paint: 50, grade: 80, halftone: 35, grain: 50, glow: 60 },
    frame: true,
    selected: 0,
    slots: allRoles.map((role, i) => blankSlot(roles[i] ?? role)),
  };
}

/** Applies a caption preset onto a state (title, script, tagline, quote…). */
export function applyPreset(state, preset) {
  state.title = preset.title;
  state.script = preset.script;
  state.tagline = preset.tagline;
  state.quote = preset.quote;
  state.source = preset.source;
  state.volume = preset.volume;
  state.presetId = preset.id;
}

/** Deep-clones a state through JSON (slots carry data URLs, which survive). */
export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

/** The sample photo files shipped under app/samples/. */
export const SAMPLE_PHOTOS = ['boulevard', 'pier'];
export const SCENE_PHOTOS = ['scene-sunset', 'scene-neon', 'scene-palm'];

/** The sample images every layout's slots get, in slot order. */
export function samplePlan() {
  return [
    'samples/boulevard.jpg',
    'samples/pier.jpg',
    'samples/scene-sunset.jpg',
    'samples/scene-neon.jpg',
    'samples/scene-palm.jpg',
    'samples/boulevard.jpg',
    'samples/pier.jpg',
  ];
}
