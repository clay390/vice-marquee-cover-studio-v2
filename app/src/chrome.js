// Movie-poster chrome: the retro 3D block title with horizontal gradient
// stripes, the starburst seal, the procedural barcode and the masthead.
// Everything here is drawn with plain canvas calls — no images, no fonts
// from the game, just the vendored Anton and Pacifico.

// A tiny deterministic PRNG so grain, halftone and the barcode are identical
// on every machine and every run for the same title.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Small string hash (FNV-1a) used to seed the PRNG and the barcode. */
export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * A vertical gradient of hard horizontal stripes from a palette: each band
 * gets a crisp edge, which is what makes the title read as retro chrome.
 */
export function stripeGradient(ctx, top, bottom, palette) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  const n = palette.length;
  for (let i = 0; i < n; i++) {
    g.addColorStop(i / n, palette[i]);
    g.addColorStop((i + 1) / n - 0.001, palette[i]);
  }
  return g;
}

/**
 * Draws the giant chrome title. First a dark extruded copy below, then the
 * striped gradient fill with a thick dark outline, then a thin bright edge
 * on top. Returns the fitted font size so the script subtitle can sit on it.
 */
export function drawChromeTitle(ctx, text, cx, baselineY, maxWidth, maxSize, palette, glowColor, glowAmount) {
  const clean = (text || 'VICE MARQUEE').trim().toUpperCase() || 'VICE MARQUEE';
  let size = maxSize;
  ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  while (ctx.measureText(clean).width > maxWidth && size > 12) {
    size -= 2;
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  }
  const top = baselineY - size * 0.92;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  // Extruded 3D shadow: three dark copies stepping down.
  ctx.fillStyle = 'rgba(12, 4, 24, 0.85)';
  for (let i = 3; i >= 1; i--) {
    ctx.fillText(clean, cx, baselineY + size * 0.028 * i);
  }
  // Neon glow halo behind the letters.
  if (glowAmount > 0.02) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = size * 0.28 * glowAmount;
    ctx.fillStyle = stripeGradient(ctx, top, baselineY, palette);
    ctx.fillText(clean, cx, baselineY);
    ctx.shadowBlur = 0;
  }
  // Striped chrome fill.
  ctx.fillStyle = stripeGradient(ctx, top, baselineY, palette);
  ctx.fillText(clean, cx, baselineY);
  // Thick dark outline, then a hairline bright top edge.
  ctx.lineWidth = Math.max(2, size * 0.045);
  ctx.strokeStyle = '#160a26';
  ctx.strokeText(clean, cx, baselineY);
  ctx.lineWidth = Math.max(1, size * 0.008);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.strokeText(clean, cx, baselineY - size * 0.012);
  ctx.restore();
  return size;
}

/** The script subtitle in Pacifico, tilted, glowing, overlapping the title. */
export function drawScriptSubtitle(ctx, text, cx, y, size, color, glowColor, glowAmount) {
  const clean = (text || '').trim();
  if (!clean) return;
  ctx.save();
  ctx.translate(cx, y);
  ctx.rotate(-0.045);
  ctx.font = `${size}px Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = size * 0.55 * glowAmount + 2;
  ctx.fillStyle = color;
  ctx.fillText(clean, 0, 0);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `${size * 0.96}px Pacifico, cursive`;
  ctx.fillText(clean, 0, -size * 0.03);
  ctx.restore();
}

/**
 * The gold starburst seal: a spiky 16-point star with ORIGINAL COVER ART
 * and three stars inside, tilted like a sticker.
 */
export function drawSeal(ctx, cx, cy, radius, sealColor, label) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.21);
  ctx.beginPath();
  const points = 16;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.82;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = sealColor;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = radius * 0.18;
  ctx.shadowOffsetY = radius * 0.06;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.lineWidth = Math.max(1.5, radius * 0.035);
  ctx.strokeStyle = '#7a4d00';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.66, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, radius * 0.02);
  ctx.strokeStyle = 'rgba(122,77,0,0.8)';
  ctx.stroke();
  ctx.fillStyle = '#3d2400';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = (label || 'ORIGINAL COVER ART').split('\n');
  const fs = radius * 0.21;
  ctx.font = `${fs}px Anton, sans-serif`;
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * fs * 1.15 - fs * 0.1);
  });
  ctx.font = `${radius * 0.22}px sans-serif`;
  ctx.fillText('★★★', 0, radius * 0.38);
  ctx.restore();
}

/**
 * A procedural barcode: bar widths from a seeded PRNG so the same title
 * always draws the same code. Returns the drawn width.
 */
export function drawBarcode(ctx, x, y, w, h, seed) {
  const rand = mulberry32(seed);
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - w * 0.06, y - h * 0.25, w * 1.12, h * 1.55);
  ctx.fillStyle = '#111111';
  let bx = x;
  while (bx < x + w) {
    const bw = (rand() < 0.5 ? 1 : 2 + Math.floor(rand() * 3)) * Math.max(1, w * 0.008);
    if (rand() < 0.62) ctx.fillRect(bx, y, Math.min(bw, x + w - bx), h);
    bx += bw + Math.max(1, w * 0.006);
  }
  ctx.fillStyle = '#111111';
  ctx.font = `${Math.max(8, h * 0.28)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('8 901234 567890', x + w / 2, y + h * 1.08);
  ctx.restore();
  return w;
}

/** The masthead: five gold stars, the press quote and the volume tab. */
export function drawMasthead(ctx, W, H, quote, source, volume, accent) {
  const yStars = H * 0.038;
  const starSize = H * 0.026;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${starSize}px sans-serif`;
  ctx.fillStyle = accent;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 3;
  ctx.fillText('★ ★ ★ ★ ★', W / 2, yStars);
  ctx.shadowBlur = 0;
  const q = `“${(quote || '').trim().toUpperCase()}”`;
  const s = (source || '').trim().toUpperCase();
  ctx.font = `700 ${H * 0.016}px system-ui, sans-serif`;
  try { ctx.letterSpacing = `${Math.max(1, H * 0.002)}px`; } catch { /* older canvas */ }
  ctx.fillStyle = '#ffffff';
  const line = s ? `${q} — ${s}` : q;
  ctx.fillText(line, W / 2, H * 0.072);
  try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  // Volume tab, top right.
  const tabW = W * 0.085;
  const tabH = H * 0.028;
  const tx = W - tabW - W * 0.03;
  const ty = H * 0.02;
  ctx.fillStyle = 'rgba(20,8,31,0.85)';
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1, H * 0.0015);
  ctx.fillRect(tx, ty, tabW, tabH);
  ctx.strokeRect(tx, ty, tabW, tabH);
  ctx.fillStyle = accent;
  ctx.font = `700 ${H * 0.014}px system-ui, sans-serif`;
  ctx.fillText((volume || 'VOL. 1').toUpperCase(), tx + tabW / 2, ty + tabH / 2 + 1);
  ctx.restore();
}
