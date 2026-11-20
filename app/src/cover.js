// The cover engine: draws the whole movie-poster cover onto a canvas at
// any size — masthead, multi-panel photos with role callouts, chrome title,
// script subtitle, tagline ribbon, seal, billing block, COMING SOON and a
// procedural barcode — then the grade, halftone, grain and vignette.
import { layoutPanels, PANEL_AREA } from './panels.js';
import { getGrade, FILTERS } from './grades.js';
import {
  drawChromeTitle, drawScriptSubtitle, drawSeal, drawBarcode,
  drawMasthead, mulberry32, hashString,
} from './chrome.js';

const EMPTY_COLORS = ['#3d2b52', '#593a6e', '#2b1838', '#4d2a5e', '#33203f', '#452a55', '#2e1a3d'];

/** Draws one photo into a panel rect, cover-fit, with zoom, pan and flip. */
export function drawPanelPhoto(ctx, img, rect, slot, useFilter) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (!img) {
    ctx.fillStyle = EMPTY_COLORS[slot.index % EMPTY_COLORS.length];
    ctx.fillRect(x, y, w, h);
    // Empty slot: a subtle sun-and-skyline motif so the poster still reads.
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, 'rgba(255,210,62,0.35)');
    g.addColorStop(1, 'rgba(255,61,129,0.25)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.42, Math.min(w, h) * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const zoom = (slot.zoom ?? 1) * (slot.flip ? -1 : 1);
  const base = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const scale = base * Math.abs(zoom);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const ox = (slot.ox ?? 0) * w * 0.5;
  const oy = (slot.oy ?? 0) * h * 0.5;
  const filter = FILTERS.find((f) => f.id === (slot.filter ?? 'original'));
  if (useFilter && filter && filter.css !== 'none') ctx.filter = filter.css;
  const cx = x + w / 2 + ox;
  const cy = y + h / 2 + oy;
  ctx.translate(cx, cy);
  if (zoom < 0) ctx.scale(-1, 1);
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

/** The italic role callout tag on a panel's corner. */
function drawRoleTag(ctx, rect, text, W) {
  const label = (text || '').trim().toUpperCase();
  if (!label) return;
  const fs = Math.max(10, W * 0.013);
  ctx.save();
  ctx.font = `italic 700 ${fs}px Georgia, 'Times New Roman', serif`;
  const tw = ctx.measureText(label).width;
  const padX = fs * 0.7;
  const padY = fs * 0.45;
  const bx = rect.x + rect.w * 0.04;
  const by = rect.y + rect.h * 0.05;
  ctx.translate(bx + tw / 2 + padX, by + fs * 0.5 + padY);
  ctx.rotate(-0.03);
  ctx.fillStyle = 'rgba(12,4,24,0.88)';
  ctx.fillRect(-tw / 2 - padX, -fs * 0.5 - padY, tw + padX * 2, fs + padY * 2);
  ctx.strokeStyle = 'rgba(255,210,62,0.9)';
  ctx.lineWidth = Math.max(1, fs * 0.06);
  ctx.strokeRect(-tw / 2 - padX, -fs * 0.5 - padY, tw + padX * 2, fs + padY * 2);
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);
  ctx.restore();
}

/** Halftone dots over the panel area, strength 0..1. */
function drawHalftone(ctx, W, H, strength, seed) {
  if (strength <= 0.01) return;
  const rand = mulberry32(seed);
  const a = PANEL_AREA;
  const spacing = Math.max(7, W * 0.008);
  ctx.save();
  ctx.fillStyle = `rgba(10,4,20,${0.16 * strength})`;
  for (let y = a.y * H + spacing / 2; y < (a.y + a.h) * H; y += spacing) {
    for (let x = a.x * W + spacing / 2; x < (a.x + a.w) * W; x += spacing) {
      const r = spacing * 0.16 * (0.7 + rand() * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Film grain: deterministic speckles over the whole cover. */
function drawGrain(ctx, W, H, strength, seed) {
  if (strength <= 0.01) return;
  const rand = mulberry32(seed);
  const count = Math.floor((W * H) / 1400 * strength);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const v = rand();
    ctx.fillStyle = v < 0.5 ? `rgba(255,255,255,${0.05 + rand() * 0.06})` : `rgba(0,0,0,${0.05 + rand() * 0.07})`;
    const s = 1 + Math.floor(rand() * 2);
    ctx.fillRect(rand() * W, rand() * H, s, s);
  }
  ctx.restore();
}

/** Soft dark vignette around the edges. */
function drawVignette(ctx, W, H, strength) {
  if (strength <= 0.01) return;
  const g = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.72,
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(8,2,16,${0.42 * strength})`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/**
 * Draws the full cover. `state` is the editor state, `images` maps slot
 * index -> HTMLImageElement (or null). `opts.compare` draws the raw photos
 * only, no grade, lettering or effects. Deterministic for a fixed state:
 * grain, halftone and the barcode all seed from the title.
 */
export function drawCover(canvas, state, images, opts = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = getGrade(state.grade);
  const look = state.look ?? {};
  const paint = (look.paint ?? 50) / 100;
  const gradeAmt = (look.grade ?? 80) / 100;
  const halftoneAmt = (look.halftone ?? 35) / 100;
  const grainAmt = (look.grain ?? 50) / 100;
  const glowAmt = (look.glow ?? 60) / 100;
  const compare = !!opts.compare;
  const seed = hashString(`${state.title}|${state.tagline}`);

  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = compare ? '#1a1a1a' : grade.base;
  ctx.fillRect(0, 0, W, H);

  // --- Panels -------------------------------------------------------------
  const panels = layoutPanels(state.layout, W, H);
  const gap = Math.max(2, W * 0.008);
  panels.forEach((p, i) => {
    const slot = state.slots[i] ?? {};
    const rect = { x: p.x, y: p.y, w: p.w, h: p.h };
    ctx.save();
    if (p.angle) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    }
    drawPanelPhoto(ctx, images[i] ?? null, rect, { ...slot, index: i }, !compare);
    // Paint slider: a saturating boost over the photo.
    if (!compare && paint > 0.02) {
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = `rgba(255,120,60,${0.10 * paint})`;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.globalCompositeOperation = 'source-over';
    }
    // White die-cut frame around each panel.
    ctx.lineWidth = Math.max(2, W * 0.004);
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.lineWidth = Math.max(1, W * 0.0015);
    ctx.strokeStyle = 'rgba(10,4,20,0.7)';
    ctx.strokeRect(rect.x - gap / 2, rect.y - gap / 2, rect.w + gap, rect.h + gap);
    ctx.restore();
    if (!compare) drawRoleTag(ctx, rect, slot.role ?? p.role, W);
  });

  if (compare) {
    ctx.restore();
    return;
  }

  // --- Grade wash over the photos ----------------------------------------
  ctx.save();
  ctx.globalCompositeOperation = grade.tint.mode;
  ctx.globalAlpha = grade.tint.alpha * gradeAmt;
  ctx.fillStyle = grade.tint.color;
  ctx.fillRect(PANEL_AREA.x * W, PANEL_AREA.y * H, PANEL_AREA.w * W, PANEL_AREA.h * H);
  ctx.globalCompositeOperation = grade.tint2.mode;
  ctx.globalAlpha = grade.tint2.alpha * gradeAmt;
  ctx.fillStyle = grade.tint2.color;
  ctx.fillRect(PANEL_AREA.x * W, PANEL_AREA.y * H, PANEL_AREA.w * W, PANEL_AREA.h * H);
  ctx.restore();

  drawHalftone(ctx, W, H, halftoneAmt, seed + 7);
  drawVignette(ctx, W, H, gradeAmt);

  // --- Seal: a sticker on the top-right panel, clear of the title --------
  drawSeal(ctx, W * 0.915, H * 0.15, Math.max(16, W * 0.045), grade.seal, 'ORIGINAL\nCOVER ART');

  // --- Masthead ------------------------------------------------------------
  drawMasthead(ctx, W, H, state.quote, state.source, state.volume, grade.seal);

  // --- Chrome title + script subtitle --------------------------------------
  const titleSize = drawChromeTitle(
    ctx, state.title, W / 2, H * 0.845, W * 0.96, H * 0.115,
    grade.chrome, grade.glow, glowAmt,
  );
  drawScriptSubtitle(
    ctx, state.script, W / 2, H * 0.845 + titleSize * 0.28,
    Math.max(14, H * 0.042), grade.script, grade.glow, glowAmt,
  );

  // --- Tagline ribbon -------------------------------------------------------
  const ribbonY = H * 0.905;
  const ribbonH = H * 0.038;
  ctx.save();
  ctx.fillStyle = 'rgba(12,4,24,0.92)';
  ctx.fillRect(0, ribbonY, W, ribbonH);
  ctx.fillStyle = '#ffd23e';
  ctx.fillRect(0, ribbonY, W, Math.max(1, H * 0.002));
  ctx.fillRect(0, ribbonY + ribbonH - Math.max(1, H * 0.002), W, Math.max(1, H * 0.002));
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${H * 0.017}px system-ui, sans-serif`;
  try { ctx.letterSpacing = `${Math.max(1, H * 0.003)}px`; } catch { /* older canvas */ }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((state.tagline || '').trim().toUpperCase(), W / 2, ribbonY + ribbonH / 2 + 1);
  try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  ctx.restore();

  // --- Billing block, COMING SOON, barcode -------------------------------
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.font = `600 ${H * 0.0115}px system-ui, sans-serif`;
  try { ctx.letterSpacing = `${Math.max(0.5, H * 0.001)}px`; } catch { /* older canvas */ }
  ctx.fillText('A SUNSET PICTURES PRODUCTION  ·  STARRING YOU', W / 2, H * 0.955);
  ctx.fillText('SHOT ON YOUR OWN CAMERA  ·  GRADED BY HAND', W / 2, H * 0.972);
  try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${H * 0.016}px system-ui, sans-serif`;
  try { ctx.letterSpacing = `${Math.max(1, H * 0.002)}px`; } catch { /* older canvas */ }
  ctx.fillText('COMING SOON', W * 0.03, H * 0.972);
  try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  ctx.restore();
  drawBarcode(ctx, W * 0.875, H * 0.945, W * 0.095, H * 0.016, seed);

  // --- Grain + outer frame --------------------------------------------------
  drawGrain(ctx, W, H, grainAmt, seed + 13);
  if (state.frame !== false) {
    ctx.save();
    ctx.lineWidth = Math.max(3, W * 0.008);
    ctx.strokeStyle = '#f5f0f7';
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
    ctx.restore();
  }
  ctx.restore();
}

/** The export sizes: exactly the three common post sizes. */
export const EXPORT_SIZES = [
  { id: '1080x1080', label: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  { id: '1920x1080', label: 'Wide 1920 × 1080', w: 1920, h: 1080 },
];
