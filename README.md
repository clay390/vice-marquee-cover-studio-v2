[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/clay390/vice-marquee-cover-studio-v2/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/clay390/vice-marquee-cover-studio-v2/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Marquee Cover Studio

A movie-poster cover art maker for make.fun's **gta6-cover-art-01** bounty
($250 pot). An offline web app that turns your own photos into GTA-style
movie-poster key art: a press-quote masthead, multi-panel photos with role
callouts, a retro-chrome 3D title, a neon script subtitle, a tagline ribbon,
a gold "ORIGINAL COVER ART" seal, a billing block, COMING SOON and a
procedural barcode — exported as a PNG to share. Photos never leave the
machine: nothing is uploaded, nothing is fetched, every pixel is drawn on
canvas and every font is vendored under the SIL Open Font License. Nothing
from Rockstar/GTA: no logo, artwork, character or font — the titles,
taglines and painted scenes are invented ("Vice Marquee", "Last Exit",
"Copper Coast").

## What it does

- **Movie-poster framing, not a collage** — a masthead with five gold stars,
  an editable press quote and source, and a volume tab (VOL. 1 / SEASON ONE /
  PART II), over a panel mosaic and a title zone, like a film key art.
- **5 multi-panel layouts** — Hero mosaic, Hero + three, Six grid, Diagonal
  trio (tilted panels), Seven mosaic.
- **Any photo, per panel** — up to 7 photos (or one photo in every panel);
  click a panel to select it, double-click it to change its photo, drag on
  the preview to move it, scroll to zoom, with per-panel zoom/pan sliders,
  flip, swap with the next panel, centre, and an editable italic role
  callout tag (THE INSIDER, THE BOSS, THE RIDER, …).
- **4 per-panel photo filters** — Original, Duotone, Noir, Warm pop.
- **6 colour grades** — Sunset, Neon night, Golden hour, Tropic teal,
  Heatwave, Ultraviolet — a tint wash over the photos plus vignette.
- **Retro-chrome lettering** — the giant title is drawn on canvas with
  horizontal gradient stripes (gold → pink → purple and friends), a thick
  dark outline, a 3D extrusion and a neon glow; the script subtitle is
  Pacifico, tilted and glowing, overlapping the title.
- **Poster furniture, all drawn** — tagline ribbon, gold starburst seal,
  billing block ("A SUNSET PICTURES PRODUCTION · STARRING YOU"), COMING
  SOON, and a barcode whose bars are seeded from the title, so the same
  title always draws the same code.
- **Look sliders** — Paint, Grade, Halftone, Grain, Glow — plus a white
  poster-frame toggle.
- **Guided 3-step flow** — 1 Add photos → 2 Caption → 3 Export PNG.
- **6 caption presets** — Vice Marquee, Last Exit, Copper Coast, Midnight
  Marina, Golden Getaway, Neon Palms — each filling title, script, tagline,
  quote, source and volume in one tap, plus a 🎲 Surprise me shuffle
  (layout + grade + caption + filters).
- **Before / after compare** — hold the button or hold **B** to see the raw
  photos, release to restore the graded cover.
- **Keyboard shortcuts** — `1`–`5` layout, `G` grade, `F` flip panel,
  `S` surprise, `E` export, `A` export all, `U`/`R` undo/redo, hold `B`
  compare.
- **Undo / redo** for every edit.
- **Exactly 3 export sizes, one click** — 1080 × 1080, 1080 × 1350,
  1920 × 1080 — or Export all three at once, as PNG via `canvas.toBlob`.
- **Deterministic screenshots** — `?shot=cover|editor` stages a fixed
  scene (layout, grade, size, preset and photos as query parameters) and
  sets `window.__shotReady` once painted.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Files

| File | Job |
|---|---|
| `app/index.html` | Page shell, 3-step editor, preview canvas |
| `app/style.css` | Editor styling, shot-cover mode |
| `app/src/main.js` | Editor wiring, uploads, drag/zoom, undo/redo, export, shortcuts |
| `app/src/state.js` | Editor state, caption preset application, sample plan |
| `app/src/panels.js` | The 5 layout geometries |
| `app/src/grades.js` | The 6 colour grades + 4 per-panel filters |
| `app/src/chrome.js` | Chrome title, script subtitle, starburst seal, barcode, masthead |
| `app/src/cover.js` | Cover engine: panels, grade wash, lettering, poster furniture |
| `app/src/captions.js` | The 6 caption presets |
| `app/src/shots.js` | Deterministic `?shot=` scenes for screenshots |
| `app/fonts/` | Anton + Pacifico (OFL) |
| `app/samples/` | 2 kit samples + 3 procedural painted scenes (sunset, neon, palm) |
| `main.ts` | Entry program (copies app/ + screenshots/, writes dossier.json) |
| `serve.ts` | Kit starter, untouched |
| `vendor/makefun-app.ts` | Kit library, unchanged |
| `shots.json` | Shot list for the 4 screenshots |
