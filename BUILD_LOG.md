# BUILD LOG — Vice Marquee Cover Studio (make.fun gta6-cover-art-01, entry v2)

A second, different entry for the same bounty, built on the pattern of the
current top 1 ("Palmline", 95.06%): a movie-poster key-art studio, not a
photo collage. Your photos become GTA-style poster art — a press-quote
masthead, multi-panel photos with role callouts, a retro-chrome striped
title, a neon script subtitle, a tagline ribbon, a gold "ORIGINAL COVER
ART" seal, a billing block, COMING SOON and a procedural barcode — exported
as a PNG in the three common post sizes. Static files under `app/`, no
build step, zero network requests — every pixel drawn on canvas, every font
vendored under the SIL Open Font License. Nothing from Rockstar/GTA: no
logo, artwork, character or font — the titles, taglines and painted scenes
are invented ("Vice Marquee", "Last Exit", "Copper Coast").

## Top-1 pattern studied and copied (own implementation, own names)

Palmline's winning shape, as seen in its 4 artifacts:

1. **Poster framing** — masthead on top: 5 gold stars + press quote
   ("PURE GOLDEN-HOUR MAYHEM" — THE HARBOR GAZETTE) + volume tab top
   right (VOL. 1 / SEASON ONE / PART II). Implemented in
   `app/src/chrome.js` `drawMasthead`.
2. **Role callout tags per panel** — italic tags (THE INSIDER, THE BOSS,
   THE RIDER, …), editable per panel. Implemented in `app/src/cover.js`
   `drawRoleTag` + the Role callout input.
3. **Giant retro-chrome title** — block letters with horizontal gradient
   stripes (gold → pink → purple, per grade), thick outline, 3D
   extrusion and glow, overlapping the panels; neon script subtitle
   overlapping the title. Implemented in `app/src/chrome.js`
   `drawChromeTitle` / `drawScriptSubtitle`.
4. **Poster furniture** — tagline ribbon ("FIVE FRIENDS · ONE COAST ·
   NO WAY BACK"), gold starburst seal "ORIGINAL COVER ART" ★★★, billing
   block ("A SUNSET PICTURES PRODUCTION · STARRING YOU / SHOT ON YOUR OWN
   CAMERA · GRADED BY HAND"), COMING SOON bottom left, barcode bottom
   right (bars seeded from the title, so the same title always draws the
   same code).
5. **Guided 3-step editor** — 1 Add photos → 2 Caption → 3 Export PNG.
6. **5 layouts** (Hero mosaic, Hero + three, Six grid, Diagonal trio,
   Seven mosaic), **6 grades** (Sunset, Neon night, Golden hour, Tropic
   teal, Heatwave, Ultraviolet), per-panel zoom/flip/swap/centre/role tag,
   look sliders (Paint, Grade, Halftone, Grain, Glow).
7. **Export exactly 3 sizes** (1080 × 1080, 1080 × 1350, 1920 × 1080) +
   Export all three.

## What it does

- **5 poster layouts** (`app/src/panels.js`): Hero mosaic, Hero + three,
  Six grid, Diagonal trio (tilted panels), Seven mosaic.
- **Any photo, per panel** (`app/src/main.js`): up to 7 photos, or one
  photo filling every panel; click a panel to select it, double-click to
  change its photo, drag the preview to reposition its photo, scroll or
  slide to zoom, plus per-panel zoom/pan sliders, flip, swap, centre.
- **4 per-panel photo filters** (`app/src/grades.js`): Original, Duotone,
  Noir, Warm pop — each panel filtered on its own.
- **6 colour grades** (`app/src/grades.js`): Sunset, Neon night, Golden
  hour, Tropic teal, Heatwave, Ultraviolet — tint wash + vignette.
- **Poster lettering** (`app/src/chrome.js`): Anton chrome title with
  striped gradient + outline + extrusion + glow, Pacifico script subtitle,
  starburst seal, procedural barcode, masthead. Fonts vendored in
  `app/fonts/` with OFL texts.
- **6 caption presets** (`app/src/captions.js`) — Vice Marquee, Last
  Exit, Copper Coast, Midnight Marina, Golden Getaway, Neon Palms — plus
  a 🎲 Surprise me shuffle (layout + grade + caption + filters).
- **Look sliders** (`app/src/main.js`): Paint, Grade, Halftone, Grain,
  Glow, plus a white poster-frame toggle.
- **Before / after compare**: hold the button or **B** to see the raw photos.
- **Keyboard shortcuts**: `1`–`5` layout, `G` grade, `F` flip panel,
  `S` surprise, `E` export, `A` export all, `U`/`R` undo/redo, hold `B`
  compare.
- **3 export sizes, one click**: 1080 × 1080, 1080 × 1350, 1920 × 1080 —
  or export all 3 at once — as PNG via `canvas.toBlob`. Undo / redo included.
- **Deterministic screenshots** (`app/src/shots.js`): `?shot=cover|editor`
  stages a fixed scene (layout, grade, size, preset, photos as query
  parameters) and sets `window.__shotReady` once painted.
- **3 procedural painted scenes** (`app/samples/scene-*.jpg`, generated
  in-session with seeded canvas drawing): sunset skyline, neon city,
  palm beach — no real people, no GTA artwork.

## How it differs from v1 (Neon Coast Cover Studio)

v1 had 9 layouts, 6 grades, 6 filters per panel, 8 caption presets and 4
export sizes — but no masthead quote, no role tags, no chrome-striped
title, no billing block, no barcode, no seal, no COMING SOON, no 3-step
flow and no look sliders. v2 trades breadth for the top-1 poster shape:
fewer layouts (5) and filters (4), exactly the 3 bounty sizes, and adds
the masthead, role callouts, chrome title, seal, billing block, barcode,
3-step flow, 5 look sliders and 6 brand-new caption presets (no v1
titles, no top-1 titles reused). All v2 code was written fresh in this
session; only the OFL font binaries + license texts were copied from v1
as vendored assets (allowed), and the starter's `serve.ts` and
`vendor/makefun-app.ts` are untouched.

## Files

| File | Job |
|---|---|
| `app/index.html` | Page shell, 3-step editor, preview canvas |
| `app/style.css` | Editor styling, shot-cover mode |
| `app/src/main.js` | Editor wiring, uploads, drag/zoom, undo/redo, export, shortcuts |
| `app/src/state.js` | Editor state, preset application, sample plan |
| `app/src/panels.js` | The 5 layout geometries |
| `app/src/grades.js` | The 6 colour grades + 4 per-panel filters |
| `app/src/chrome.js` | Chrome title, script subtitle, starburst seal, barcode, masthead |
| `app/src/cover.js` | Cover engine: panels, grade wash, lettering, poster furniture |
| `app/src/captions.js` | The 6 caption presets |
| `app/src/shots.js` | Deterministic `?shot=` scenes for screenshots |
| `app/fonts/` | Anton + Pacifico (OFL) |
| `app/samples/` | 2 kit samples + 3 procedural painted scenes |
| `main.ts` | Entry program (copies app/ + screenshots/, writes dossier.json) |
| `serve.ts` | Kit starter, untouched |
| `vendor/makefun-app.ts` | Kit library, unchanged |
| `shots.json` | Shot list for the 4 screenshots |

## Verification (Playwright headless Chromium, /tmp/vice-marquee-shots/test.js)

**29/29 checks passed:**

- Editor boots; 5 layout chips, 6 grade chips, 4 filter chips, 6 caption
  presets, 3 size chips, 7 photo slots.
- Sample photos fill all slots; layout/grade switch repaints the canvas.
- Caption edit accepted and clears the preset highlight; drag on the
  canvas pans the selected photo and moves the pan slider.
- Keyboard `5` picks the Seven mosaic layout; Surprise me changes the
  look; Undo restores the pre-surprise look exactly.
- Hold-`B` compare enters compare mode, shows different pixels, and
  release restores the graded pixels exactly.
- `F` flips the selected panel.
- Export downloads `vice-marquee-1080x1080.png` (1,863,929 bytes);
  export-all downloads all 3 PNGs.
- `?shot=cover` and `?shot=editor` both set `window.__shotReady`;
  the editor shot shows 7 filled slots.
- **Zero console errors, zero external requests, zero failed requests.**

Two test-script bugs found and fixed while testing (not app bugs): the
first pixel sampler only read the top 9 canvas rows (masthead only), so
photo/layout/drag/flip changes were invisible to it; the sampler now
reads the panel area and the title zone.

### Screenshots (JPEG q82, taken fresh from this app)

| File | Size | Dimensions | Shows |
|---|---|---|---|
| `1-cover.jpg` | 152,904 B | 1280 × 720 | Wide exported cover, Hero mosaic, Sunset, "VICE MARQUEE" |
| `2-editor.jpg` | 232,455 B | 1280 × 1150 | Editor with 7 photos loaded, Six grid, Neon night, "LAST EXIT" |
| `3-cover-portrait.jpg` | 194,333 B | 960 × 1200 | Portrait exported cover, Hero + three, Golden hour, "COPPER COAST" |
| `4-cover-square.jpg` | 190,238 B | 1024 × 1024 | Square exported cover, Seven mosaic, Ultraviolet, "NEON PALMS" |

Each image was read back and visually inspected: masthead stars + quote
+ volume tab, role tags on every panel, chrome-striped titles with neon
script, tagline ribbon, seal, billing block, COMING SOON and barcode all
render as intended in all three sizes.

### main.ts determinism

- `MAKEFUN_OUTPUT_DIR=out node main.ts` (Node 22 binary
  `/home/hatch/workspace/node22/node-v22.18.0-linux-x64/bin/node`), then
  again to `out2`: `diff out/dossier.json out2/dossier.json` →
  **identical**; `diff -r` on app/ and screenshots/ also identical.
- dossier.json: 1,092,947 bytes (cap 1.5 MiB). out/: 24 entries,
  2,336,942 bytes (caps 1000 entries / 64 MiB).

### Local gate check (/tmp/vice-marquee-shots/gatecheck.js)

- No symlinks; 19 app files (≤993); 474,065 bytes app total (≤48 MiB);
  index.html 7,368 bytes (≤1 MiB).
- 4 screenshots, each ≤256 KiB, long side ≤1280, short side ≥480, valid
  JPEGs, gate-legal names.
- No network references in index.html or any reachable script.

### Kit pre-submit check

`node cli/makefun.mjs check --kit . --repo <entry>` (system node v24,
run 2026-11-20 after the commit 1f0d7ed): kit verified (23 files);
**4 passed, 0 failed, 16 skipped, 5 checked at submission**. Passed:
competition_open, snapshot (32 files), license_osi (MIT), entrypoint
(main.ts, node22). The 5 at-submission checks (repo_public, repo_owner,
repo_created_after_open, commit_in_repo, duplicate_snapshot) need the
public GitHub repo and the commit pushed, which the parent creates at
submission time. Note: the kit copy is level 26 while make.fun is at
level 27 — a note only, not a failure.

## Submission (parent's steps, after the seal)

1. Write the usage rows (coordinator + this build session) to
   `~/.makefun/muse-usage-gta6-cover-art-01.jsonl`, then kill the recording
   and verify the seal line in `~/.makefun/record-gta6-cover-art-01.log`
   BEFORE anything else. If the seal fails, do not submit — report it.
2. Only with a sealed recording id: create the GitHub repo
   `vice-marquee-cover-studio` under clay390, upload the final files, and
   submit with
   `node cli/makefun.mjs submit --competition gta6-cover-art-01 --recording <id>
   --repo-url https://github.com/clay390/vice-marquee-cover-studio --commit <sha>
   --title "Vice Marquee — movie-poster cover studio: your photos become GTA-style key art with role callouts, chrome titles, seal, billing block and PNG export in three sizes" --keypair ~/workspace/makefun/makefun-keypair.json
   --repo <entry dir>` (run from inside the kit dir; prizes are escrowed,
   so --keypair is required). Deadline: 2026-11-21T10:30:00Z
   (21 Nov 17:30 WIB). Max 5 submissions/day, 10 total. Note: this is the
   SECOND entry for this bounty from the same account — allowed (up to 10
   total), and its snapshot must differ from the v1 snapshot (it does:
   every app file was rewritten).
