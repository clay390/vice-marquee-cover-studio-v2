// Fixed scenes for screenshots: ?shot=cover shows the cover alone, and
// ?shot=editor shows the full editor with photos loaded. Query parameters
// stage the scene deterministically:
//   layout   one of the five layout ids (default hero-mosaic)
//   grade    one of the six grade ids (default sunset)
//   size     1080x1080 | 1080x1350 | 1920x1080 (default 1080x1080)
//   preset   a caption preset id (default vice-marquee)
//   photos   comma list of sample files, one per slot
//            (default: boulevard, pier, scene-sunset, scene-neon, scene-palm)
// window.__shotReady is set once the scene is painted.
import { defaultState, cloneState, applyPreset, samplePlan } from './state.js';
import { getPreset } from './captions.js';
import { EXPORT_SIZES } from './cover.js';

const SAMPLES = {
  boulevard: 'samples/boulevard.jpg',
  pier: 'samples/pier.jpg',
  'scene-sunset': 'samples/scene-sunset.jpg',
  'scene-neon': 'samples/scene-neon.jpg',
  'scene-palm': 'samples/scene-palm.jpg',
};

async function sampleToDataURL(api, url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export async function runShot(shot, query, api) {
  const state = defaultState();
  const layout = query.get('layout');
  if (layout) state.layout = layout;
  const grade = query.get('grade');
  if (grade) state.grade = grade;
  const preset = query.get('preset');
  if (preset) applyPreset(state, getPreset(preset));
  const title = query.get('title');
  if (title) { state.title = title; state.presetId = null; }
  const sizeId = query.get('size') ?? '1080x1080';
  const size = EXPORT_SIZES.find((s) => s.id === sizeId) ?? EXPORT_SIZES[0];
  state.size = size.id;

  const plan = samplePlan();
  const wanted = (query.get('photos') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const urls = wanted.length
    ? wanted.map((name, i) => SAMPLES[name] ?? plan[i % plan.length])
    : plan;

  for (let i = 0; i < state.slots.length; i++) {
    const dataUrl = await sampleToDataURL(api, urls[i % urls.length]);
    state.slots[i].src = dataUrl;
    await api.loadImage(dataUrl);
  }

  if (shot === 'cover') document.body.classList.add('shot-cover');
  api.setState(cloneState(state));
  const canvas = document.getElementById('cover');
  canvas.width = size.w;
  canvas.height = size.h;
  api.render();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
