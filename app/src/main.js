// Wires the Vice Marquee editor: photo slots, per-panel controls, layout /
// grade / caption / look controls, undo-redo, compare, keyboard shortcuts
// and the three-size PNG export. A `?shot=` query stages a fixed scene
// for a screenshot instead (./shots.js).
import { drawCover, EXPORT_SIZES } from './cover.js';
import { LAYOUTS, layoutSlotCount, getLayout } from './panels.js';
import { GRADES, FILTERS } from './grades.js';
import { PRESETS, getPreset, randomPreset } from './captions.js';
import { defaultState, cloneState, applyPreset, samplePlan } from './state.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const ctx = canvas.getContext('2d');
const statusEl = $('status');
const stageLabel = $('stageLabel');

let state = defaultState();
let images = new Map(); // data URL -> HTMLImageElement
let undoStack = [];
let redoStack = [];
let comparing = false;
let strokeSnapshot = null;
let shotMode = false;

function setStatus(text) {
  statusEl.textContent = text;
}

function setStep(n) {
  document.querySelectorAll('#steps li').forEach((li) => {
    li.classList.toggle('active', Number(li.dataset.step) === n);
  });
}

function pushUndo() {
  undoStack.push(cloneState(state));
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
}

function beginStroke() {
  if (!strokeSnapshot) strokeSnapshot = cloneState(state);
}

function endStroke() {
  if (strokeSnapshot) {
    undoStack.push(strokeSnapshot);
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
    strokeSnapshot = null;
  }
}

function restore(snapshot) {
  state = cloneState(snapshot);
  syncControls();
  render();
}

/** Loads an image from a URL (local file or data URL). */
export function loadImage(url) {
  if (images.has(url)) return Promise.resolve(images.get(url));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { images.set(url, img); resolve(img); };
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Reads a File into a data URL. */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function setSlotImage(index, src, silent = false) {
  if (!silent) pushUndo();
  state.slots[index].src = src;
  if (src) await loadImage(src);
  syncSlots();
  render();
}

function slotImages() {
  return state.slots.map((s) => (s.src ? images.get(s.src) ?? null : null));
}

function render() {
  drawCover(canvas, state, slotImages(), { compare: comparing });
  stageLabel.textContent = comparing ? 'Before — raw photos' : 'Live preview — graded cover';
}

// --- Chips ---------------------------------------------------------------

function buildChips(container, items, current, onPick) {
  const el = $(container);
  el.innerHTML = '';
  items.forEach((item) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.name ?? item.label;
    b.title = item.hint ?? '';
    b.classList.toggle('on', item.id === current);
    b.addEventListener('click', () => onPick(item));
    el.appendChild(b);
  });
}

function syncChips() {
  buildChips('layoutChips', LAYOUTS, state.layout, (item) => {
    pushUndo();
    state.layout = item.id;
    state.selected = 0;
    syncControls();
    render();
  });
  buildChips('gradeChips', GRADES, state.grade, (item) => {
    pushUndo();
    state.grade = item.id;
    syncControls();
    render();
  });
  buildChips('filterChips', FILTERS, state.slots[state.selected].filter, (item) => {
    pushUndo();
    state.slots[state.selected].filter = item.id;
    syncControls();
    render();
  });
  buildChips('presetChips', PRESETS, state.presetId, (item) => {
    pushUndo();
    applyPreset(state, item);
    syncControls();
    render();
  });
  buildChips('sizeChips', EXPORT_SIZES, state.size, (item) => {
    state.size = item.id;
    const size = EXPORT_SIZES.find((s) => s.id === item.id);
    canvas.width = size.w;
    canvas.height = size.h;
    syncControls();
    render();
  });
}

// --- Slots ---------------------------------------------------------------

function syncSlots() {
  const box = $('slots');
  box.innerHTML = '';
  const count = layoutSlotCount(state.layout);
  state.slots.forEach((slot, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot' + (slot.src ? '' : ' empty') + (i === state.selected ? ' selected' : '');
    b.title = slot.role;
    if (slot.src) b.style.backgroundImage = `url("${slot.src}")`;
    const label = document.createElement('span');
    label.textContent = i < count ? slot.role : '—';
    b.appendChild(label);
    b.addEventListener('click', () => {
      state.selected = i;
      syncControls();
      render();
    });
    b.addEventListener('dblclick', () => {
      state.selected = i;
      $('slotPicker').click();
    });
    box.appendChild(b);
  });
}

function syncPanelControls() {
  const slot = state.slots[state.selected];
  $('roleTag').value = slot.role;
  $('zoom').value = Math.round(slot.zoom * 100);
  $('zoomOut').textContent = `${Math.round(slot.zoom * 100)}%`;
  $('panX').value = Math.round(slot.ox * 100);
  $('panXOut').textContent = Math.round(slot.ox * 100);
  $('panY').value = Math.round(slot.oy * 100);
  $('panYOut').textContent = Math.round(slot.oy * 100);
}

function syncCaptionControls() {
  $('title').value = state.title;
  $('script').value = state.script;
  $('tagline').value = state.tagline;
  $('quote').value = state.quote;
  $('source').value = state.source;
  $('volume').value = state.volume;
  $('lookPaint').value = state.look.paint;
  $('lookPaintOut').textContent = state.look.paint;
  $('lookGrade').value = state.look.grade;
  $('lookGradeOut').textContent = state.look.grade;
  $('lookHalftone').value = state.look.halftone;
  $('lookHalftoneOut').textContent = state.look.halftone;
  $('lookGrain').value = state.look.grain;
  $('lookGrainOut').textContent = state.look.grain;
  $('lookGlow').value = state.look.glow;
  $('lookGlowOut').textContent = state.look.glow;
  $('frameToggle').checked = state.frame !== false;
}

function syncControls() {
  syncChips();
  syncSlots();
  syncPanelControls();
  syncCaptionControls();
}

// --- Canvas interaction: click select, drag pan, wheel zoom ---------------

function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}

let drag = null;

canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const panels = getLayout(state.layout).panels({
    x: 0.03 * canvas.width, y: 0.095 * canvas.height,
    w: 0.94 * canvas.width, h: 0.66 * canvas.height,
  });
  let hit = -1;
  panels.forEach((panel, i) => {
    if (p.x >= panel.x && p.x <= panel.x + panel.w && p.y >= panel.y && p.y <= panel.y + panel.h) hit = i;
  });
  if (hit < 0) return;
  state.selected = hit;
  syncControls();
  beginStroke();
  drag = { x: p.x, y: p.y, slot: state.slots[hit], panel: panels[hit] };
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = canvasPoint(e);
  const dx = (p.x - drag.x) / drag.panel.w;
  const dy = (p.y - drag.y) / drag.panel.h;
  drag.slot.ox = Math.max(-1, Math.min(1, drag.slot.ox + dx * 2));
  drag.slot.oy = Math.max(-1, Math.min(1, drag.slot.oy + dy * 2));
  drag.x = p.x;
  drag.y = p.y;
  syncPanelControls();
  render();
});

canvas.addEventListener('pointerup', () => {
  drag = null;
  endStroke();
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const slot = state.slots[state.selected];
  beginStroke();
  slot.zoom = Math.max(1, Math.min(2.6, slot.zoom * (e.deltaY < 0 ? 1.08 : 0.92)));
  syncPanelControls();
  render();
  endStroke();
}, { passive: false });

canvas.addEventListener('dblclick', () => $('slotPicker').click());

// --- Uploads ---------------------------------------------------------------

$('slotPicker').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const url = await fileToDataURL(file);
  await setSlotImage(state.selected, url);
  setStatus(`Photo loaded into panel ${state.selected + 1}.`);
});

$('upload').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  e.target.value = '';
  if (!files.length) return;
  pushUndo();
  for (let i = 0; i < files.length && i < state.slots.length; i++) {
    const url = await fileToDataURL(files[i]);
    state.slots[i].src = url;
    await loadImage(url);
  }
  syncSlots();
  render();
  setStatus(`${files.length} photo(s) loaded.`);
});

async function fillFrom(urls) {
  pushUndo();
  for (let i = 0; i < state.slots.length; i++) {
    const url = urls[i % urls.length];
    const res = await fetch(url);
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    state.slots[i].src = dataUrl;
    await loadImage(dataUrl);
  }
  syncSlots();
  render();
}

$('fillSamples').addEventListener('click', async () => {
  await fillFrom(['samples/boulevard.jpg', 'samples/pier.jpg']);
  setStatus('Sample photos loaded into every panel.');
});
$('fillScenes').addEventListener('click', async () => {
  await fillFrom(['samples/scene-sunset.jpg', 'samples/scene-neon.jpg', 'samples/scene-palm.jpg']);
  setStatus('Painted scenes loaded into every panel.');
});
$('clearPhotos').addEventListener('click', () => {
  pushUndo();
  state.slots.forEach((s) => { s.src = null; });
  syncSlots();
  render();
});

// --- Per-panel controls ----------------------------------------------------

function bindRange(id, outId, get, set) {
  const el = $(id);
  el.addEventListener('pointerdown', beginStroke);
  el.addEventListener('input', () => {
    set(Number(el.value));
    $(outId).textContent = el.value;
    render();
  });
  el.addEventListener('change', endStroke);
}

bindRange('zoom', 'zoomOut', null, (v) => { state.slots[state.selected].zoom = v / 100; });
bindRange('panX', 'panXOut', null, (v) => { state.slots[state.selected].ox = v / 100; });
bindRange('panY', 'panYOut', null, (v) => { state.slots[state.selected].oy = v / 100; });
bindRange('lookPaint', 'lookPaintOut', null, (v) => { state.look.paint = v; });
bindRange('lookGrade', 'lookGradeOut', null, (v) => { state.look.grade = v; });
bindRange('lookHalftone', 'lookHalftoneOut', null, (v) => { state.look.halftone = v; });
bindRange('lookGrain', 'lookGrainOut', null, (v) => { state.look.grain = v; });
bindRange('lookGlow', 'lookGlowOut', null, (v) => { state.look.glow = v; });

$('roleTag').addEventListener('focus', beginStroke);
$('roleTag').addEventListener('input', () => {
  state.slots[state.selected].role = $('roleTag').value.toUpperCase();
  syncSlots();
  render();
});
$('roleTag').addEventListener('change', endStroke);

$('flipPanel').addEventListener('click', () => {
  pushUndo();
  state.slots[state.selected].flip = !state.slots[state.selected].flip;
  render();
});
$('swapPanel').addEventListener('click', () => {
  pushUndo();
  const i = state.selected;
  const j = (i + 1) % layoutSlotCount(state.layout);
  [state.slots[i], state.slots[j]] = [state.slots[j], state.slots[i]];
  state.selected = j;
  syncControls();
  render();
});
$('facePanel').addEventListener('click', () => {
  pushUndo();
  const slot = state.slots[state.selected];
  slot.ox = 0;
  slot.oy = 0;
  slot.zoom = 1;
  syncControls();
  render();
});

// --- Caption controls ------------------------------------------------------

function bindText(id, key) {
  const el = $(id);
  el.addEventListener('focus', beginStroke);
  el.addEventListener('input', () => {
    state[key] = el.value;
    state.presetId = null;
    syncChips();
    render();
  });
  el.addEventListener('change', endStroke);
}
bindText('title', 'title');
bindText('script', 'script');
bindText('tagline', 'tagline');
bindText('quote', 'quote');
bindText('source', 'source');

$('volume').addEventListener('change', () => {
  pushUndo();
  state.volume = $('volume').value;
  render();
});
$('frameToggle').addEventListener('change', () => {
  pushUndo();
  state.frame = $('frameToggle').checked;
  render();
});

// --- Surprise me -------------------------------------------------------------

$('surprise').addEventListener('click', () => {
  pushUndo();
  state.layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)].id;
  state.grade = GRADES[Math.floor(Math.random() * GRADES.length)].id;
  applyPreset(state, randomPreset(state.presetId));
  state.slots.forEach((slot) => {
    slot.filter = FILTERS[Math.floor(Math.random() * FILTERS.length)].id;
  });
  state.selected = 0;
  syncControls();
  render();
  setStatus('Surprised! Layout, grade, caption and filters shuffled.');
});

// --- Compare, undo, redo -----------------------------------------------------

function setCompare(on) {
  comparing = on;
  render();
}
$('compare').addEventListener('pointerdown', () => setCompare(true));
$('compare').addEventListener('pointerup', () => setCompare(false));
$('compare').addEventListener('pointerleave', () => setCompare(false));

$('undo').addEventListener('click', () => {
  if (!undoStack.length) return;
  redoStack.push(cloneState(state));
  restore(undoStack.pop());
});
$('redo').addEventListener('click', () => {
  if (!redoStack.length) return;
  undoStack.push(cloneState(state));
  restore(redoStack.pop());
});

// --- Export ------------------------------------------------------------------

function exportCanvas(size) {
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state, slotImages(), {});
  return new Promise((resolve) => {
    off.toBlob((blob) => {
      const a = document.createElement('a');
      const name = `vice-marquee-${size.id}.png`;
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve({ name, bytes: blob.size });
    }, 'image/png');
  });
}

$('export').addEventListener('click', async () => {
  const size = EXPORT_SIZES.find((s) => s.id === state.size);
  const out = await exportCanvas(size);
  setStatus(`Saved ${out.name} (${out.bytes.toLocaleString()} bytes).`);
});

$('exportAll').addEventListener('click', async () => {
  const names = [];
  for (const size of EXPORT_SIZES) {
    const out = await exportCanvas(size);
    names.push(out.name);
    await new Promise((r) => setTimeout(r, 120));
  }
  setStatus(`Saved all three: ${names.join(', ')}.`);
});

// --- Keyboard shortcuts ------------------------------------------------------

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea')) return;
  const k = e.key.toLowerCase();
  if (k >= '1' && k <= '5') {
    pushUndo();
    state.layout = LAYOUTS[Number(k) - 1].id;
    state.selected = 0;
    syncControls();
    render();
  } else if (k === 'g') {
    pushUndo();
    const i = GRADES.findIndex((g) => g.id === state.grade);
    state.grade = GRADES[(i + 1) % GRADES.length].id;
    syncControls();
    render();
  } else if (k === 'f') {
    pushUndo();
    state.slots[state.selected].flip = !state.slots[state.selected].flip;
    render();
  } else if (k === 's') {
    $('surprise').click();
  } else if (k === 'e') {
    $('export').click();
  } else if (k === 'a') {
    $('exportAll').click();
  } else if (k === 'u') {
    $('undo').click();
  } else if (k === 'r') {
    $('redo').click();
  } else if (k === 'b' && !e.repeat) {
    setCompare(true);
  }
});
document.addEventListener('keyup', (e) => {
  if (e.key.toLowerCase() === 'b') setCompare(false);
});

// --- Step navigation ---------------------------------------------------------

document.querySelectorAll('#steps li').forEach((li) => {
  li.addEventListener('click', () => {
    const n = Number(li.dataset.step);
    setStep(n);
    document.querySelector(`[data-step-block="${n}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// --- Boot ----------------------------------------------------------------------

async function boot() {
  const params = new URLSearchParams(location.search);
  shotMode = params.has('shot');
  await document.fonts.load('100px Anton');
  await document.fonts.load('40px Pacifico');
  await document.fonts.ready;
  if (shotMode) {
    await runShot(params.get('shot'), params, {
      setState(next) { state = next; syncControls(); },
      loadImage,
      render,
      setSlotImage,
    });
  }
  syncControls();
  render();
}

boot().catch((err) => {
  console.error(err);
  setStatus(`Could not start: ${err.message}`);
});
