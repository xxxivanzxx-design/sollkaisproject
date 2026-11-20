# NOCTIS 18 Pro Max — Figma handoff

This folder is a **Figma development plugin**. It builds the whole design — the design system and every page section — inside your own Figma file. Nothing is uploaded anywhere; the plugin runs locally, and the photography is embedded in `code.js`.

## Import it (one minute, once)

1. Open Figma in the browser or the desktop app, in the file where you want the design (a new file is fine).
2. Menu → **Plugins → Development → Import plugin from manifest…**
3. Select `manifest.json` from this folder.
4. Menu → **Plugins → Development → NOCTIS 18 Pro Max — Launch Site**.

A new page called **NOCTIS 18 Pro Max · Launch Site** appears with the design system on the right and the nine page frames stacked below it.

Re-running the plugin replaces that page, so you can run it again in the same file without piling up copies.

## What gets created

The page holds ten frames: a **Design system** board (colour swatches, the type scale, buttons, tags, panel and spacing specimens) plus the site itself — Cover, The glass, Numbers, Frames, Aperture, In the round, Playground, Reserve, and a 390 × 844 mobile cover.

Alongside the frames the plugin writes real Figma styles you can apply and override: eight paint styles under `NOCTIS /` and seven text styles (`Display`, `H2`, `H3`, `Lede`, `Body`, `Mono / Label`, `Mono / Value`). Every panel is a frame with a 20 px radius and a 1 px 8 % white stroke; every button is a full pill.

## Type

The design is set in **Geist** and **Geist Mono**. If those families are available to your Figma account the plugin uses them; if not, it falls back to Inter and Roboto Mono automatically. Install Geist and Geist Mono from Google Fonts (or the Figma font picker) and re-run for exact metrics.

## Editing notes

The section frames are composed like posters — absolute positions, real text layers, real image fills — so text and images are directly editable. The cover, mobile cover, aperture and 3D frames use the embedded photography at full-bleed; swap the image fills for your own renders and the layout holds.

The motion itself is not reproducible in a static file, so each section carries its library tag (GSAP, Motion, Anime.js, React Three Fiber) to show which engine drives it on the live site.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Plugin manifest — the file you import. |
| `code.js` | Self-contained build (~0.5 MB, images embedded as base64 JPEG). |
| `code.src.js` | Readable source, with an `__IMG__` placeholder. |
| `build.py` | Re-bakes `public/media` into `code.js` (`python3 build.py`). |
| `mock-run.cjs` | Smoke test: runs `code.js` against a mocked Figma API. |
