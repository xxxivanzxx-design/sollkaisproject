# NOCTIS C1 — build notes

## Project
- Dir: `/home/ubuntu/noctis` · Vite 7 + React 19 + TS (no babel plugin; esbuild JSX)
- Deps: gsap 3.15 (ScrollTrigger, SplitText), lenis, motion 14, animejs 4.5, three 0.182, @react-three/fiber 9.8
- Dev server: `npm run dev` on port 3000 via webdev `runtime/dev-commands`
- Routes manifest: `public/manus-routes.json`

## Media
Local files in `public/media/*.webp` (downloaded from the sandbox storage proxy at `http://127.0.0.1:8328/manus-storage/...`, which 307s to CloudFront).
Batch 1 (old, orange body — replaced for hero/hand/plinth/rear/side):
- MbtphkakAcSoqLI0vhQUKp/image-1..5 (hero, lens, dial, hand, plinth)
- t7UODds1deoCk5ApntSWnn/image-1..3 (rear, street, side)
Batch 2 (matte black body, reserved, to download):
- 0rB9nbPs8vdSttuU7ba5fP/image-1..5 → hero, hand, plinth, rear, side
Keep: lens macro, dial macro, night street.

## Decisions
- Brand NOCTIS, product C1, price $2,490, ships spring 2027.
- Single accent #ff5a1f; surfaces #0b0b0c/#111113/#17171a; text #ededea.
- Motion tags are inline chips in each section header (toggle `body.tags-on`), not a fixed HUD.
- Fixed `.vignette` removed (it dimmed footer content).
- Aperture blades: d = o * R * 1.9 (open = pushed out).
- R3F camera z ≈ 6.0 for full-lens framing.

## QA
- `python3 scripts/shots.py` → `/home/ubuntu/noctis/.shots/*.png` (uses `window.__lenis.scrollTo(y,{immediate:true})`).
