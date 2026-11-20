/**
 * NOCTIS 18 Pro Max — Launch Site
 * Generates the full design system and every page section in the current Figma file.
 *
 * Run: Figma → menu → Plugins → Development → Import plugin from manifest…
 *      pick manifest.json from this folder, then run "NOCTIS 18 Pro Max — Launch Site".
 */
const IMG = __IMG__;

const C = {
  ink0: '#0B0B0C',
  ink1: '#111113',
  ink2: '#17171A',
  card: '#1B1B1F',
  paper: '#EDEDEA',
  muted: '#8A8A86',
  faint: '#5C5C59',
  line: '#26262A',
  signal: '#FF5A1F',
};

const rgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
};
const solid = (hex, opacity = 1) => ({ type: 'SOLID', color: rgb(hex), opacity });
const line = (o = 1) => ({ type: 'SOLID', color: rgb('#FFFFFF'), opacity: 0.08 * o });

// gradient helpers (Figma gradientTransform is a 2x3 matrix in object space)
const gradH = (stops) => ({
  type: 'GRADIENT_LINEAR',
  gradientTransform: [
    [1, 0, 0],
    [0, 1, 0],
  ],
  gradientStops: stops,
});
const gradV = (stops) => ({
  type: 'GRADIENT_LINEAR',
  gradientTransform: [
    [0, 1, 0],
    [-1, 0, 1],
  ],
  gradientStops: stops,
});
const stop = (hex, at, a = 1) => ({ position: at, color: { ...rgb(hex), a } });

let F = {
  reg: { family: 'Inter', style: 'Regular' },
  med: { family: 'Inter', style: 'Medium' },
  semi: { family: 'Inter', style: 'Semi Bold' },
  mono: { family: 'Roboto Mono', style: 'Regular' },
  monoMed: { family: 'Roboto Mono', style: 'Medium' },
};

async function loadFonts() {
  const candidates = ['Geist', 'Inter'];
  let family = 'Inter';
  for (const f of candidates) {
    try {
      await figma.loadFontAsync({ family: f, style: 'Regular' });
      family = f;
      break;
    } catch (e) {
      /* not installed — try the next one */
    }
  }
  let monoFamily = 'Roboto Mono';
  for (const f of ['Geist Mono', 'Roboto Mono']) {
    try {
      await figma.loadFontAsync({ family: f, style: 'Regular' });
      monoFamily = f;
      break;
    } catch (e) {
      /* ignore */
    }
  }
  const tryStyle = async (fam, styles, fallback) => {
    for (const s of styles) {
      try {
        await figma.loadFontAsync({ family: fam, style: s });
        return { family: fam, style: s };
      } catch (e) {
        /* ignore */
      }
    }
    return fallback;
  };
  const reg = { family, style: 'Regular' };
  const med = await tryStyle(family, ['Medium', 'Regular'], reg);
  const semi = await tryStyle(family, ['Semi Bold', 'SemiBold', 'Bold', 'Medium'], med);
  const mono = { family: monoFamily, style: 'Regular' };
  const monoMed = await tryStyle(monoFamily, ['Medium', 'SemiBold', 'Regular'], mono);
  F = { reg, med, semi, mono, monoMed };
}

/* ── primitives ─────────────────────────────────────────────── */

function frame(parent, name, x, y, w, h, opts = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.x = x;
  f.y = y;
  f.resize(w, h);
  f.fills = opts.fill ? [typeof opts.fill === 'string' ? solid(opts.fill) : opts.fill] : [];
  f.clipsContent = opts.clip !== false;
  if (opts.radius) f.cornerRadius = opts.radius;
  if (opts.stroke) {
    f.strokes = [line()];
    f.strokeWeight = 1;
    f.strokeAlign = 'INSIDE';
  }
  parent.appendChild(f);
  return f;
}

function rect(parent, x, y, w, h, opts = {}) {
  const r = figma.createRectangle();
  r.name = opts.name || 'rect';
  r.x = x;
  r.y = y;
  r.resize(Math.max(w, 0.01), Math.max(h, 0.01));
  r.fills = opts.fill ? [typeof opts.fill === 'string' ? solid(opts.fill) : opts.fill] : [];
  if (opts.radius !== undefined) r.cornerRadius = opts.radius;
  if (opts.stroke) {
    r.strokes = [opts.stroke === true ? line() : opts.stroke];
    r.strokeWeight = opts.strokeWeight || 1;
    r.strokeAlign = 'INSIDE';
  }
  if (opts.opacity !== undefined) r.opacity = opts.opacity;
  if (opts.rotation) r.rotation = opts.rotation;
  if (opts.clip) r.clipsContent = true;
  parent.appendChild(r);
  return r;
}

function text(parent, str, x, y, opts = {}) {
  const t = figma.createText();
  t.fontName = opts.font || F.reg;
  t.characters = str;
  t.fontSize = opts.size || 15;
  t.fills = [solid(opts.color || C.paper, opts.opacity === undefined ? 1 : opts.opacity)];
  if (opts.lh) t.lineHeight = { unit: 'PIXELS', value: opts.lh };
  if (opts.track !== undefined) t.letterSpacing = { unit: 'PERCENT', value: opts.track };
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.upper) t.textCase = 'UPPER';
  t.textAutoResize = opts.w ? 'HEIGHT' : 'WIDTH_AND_HEIGHT';
  if (opts.w) t.resize(opts.w, opts.size || 15);
  t.x = x;
  t.y = y;
  parent.appendChild(t);
  return t;
}

const mono = (p, s, x, y, o = {}) => text(p, s, x, y, { ...o, font: o.font || F.mono });

function image(parent, key, x, y, w, h, opts = {}) {
  const r = figma.createRectangle();
  r.name = opts.name || key;
  r.x = x;
  r.y = y;
  r.resize(w, h);
  const data = figma.base64Decode(IMG[key]);
  const hash = figma.createImage(data).hash;
  r.fills = [{ type: 'IMAGE', imageHash: hash, scaleMode: 'FILL' }];
  if (opts.radius) r.cornerRadius = opts.radius;
  if (opts.opacity !== undefined) r.opacity = opts.opacity;
  parent.appendChild(r);
  return r;
}

function ellipse(parent, x, y, d, opts = {}) {
  const e = figma.createEllipse();
  e.x = x;
  e.y = y;
  e.resize(d, d);
  e.fills = opts.fill ? [typeof opts.fill === 'string' ? solid(opts.fill) : opts.fill] : [];
  if (opts.stroke) {
    e.strokes = [opts.stroke === true ? solid(C.line) : opts.stroke];
    e.strokeWeight = opts.strokeWeight || 1;
    e.strokeAlign = 'INSIDE';
  }
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  parent.appendChild(e);
  return e;
}

function hline(parent, x, y, w, opacity = 1) {
  return rect(parent, x, y, w, 1, { fill: line(opacity) });
}

function vline(parent, x, y, h, opacity = 1) {
  return rect(parent, x, y, 1, h, { fill: line(opacity) });
}

/** pill button */
function button(parent, label, x, y, opts = {}) {
  const w = opts.w || 190;
  const h = opts.h || 48;
  const primary = opts.kind !== 'ghost';
  const b = figma.createFrame();
  b.name = 'Button / ' + label;
  b.x = x;
  b.y = y;
  b.resize(w, h);
  b.cornerRadius = h / 2;
  b.fills = primary ? [solid(C.signal)] : [solid('#FFFFFF', 0.02)];
  b.strokes = primary ? [] : [line()];
  b.strokeWeight = 1;
  b.strokeAlign = 'INSIDE';
  b.clipsContent = false;
  parent.appendChild(b);
  const t = text(b, label, 0, 0, {
    font: F.med,
    size: opts.size || 14,
    color: primary ? C.ink0 : C.paper,
    track: -0.5,
  });
  t.x = (w - t.width) / 2;
  t.y = (h - t.height) / 2;
  return b;
}

function libTag(parent, label, x, y) {
  const t = mono(parent, label.toUpperCase(), 0, 0, { size: 8, color: C.faint, track: 14 });
  const w = t.width + 26;
  const g = figma.createFrame();
  g.name = 'Library tag';
  g.x = x;
  g.y = y;
  g.resize(w, 20);
  g.cornerRadius = 5;
  g.fills = [solid('#FFFFFF', 0.02)];
  g.strokes = [line()];
  g.strokeWeight = 1;
  g.strokeAlign = 'INSIDE';
  parent.appendChild(g);
  g.appendChild(t);
  t.x = 18;
  t.y = 5.5;
  const dot = ellipse(g, 8, 8, 4, { fill: C.signal, opacity: 0.9 });
  dot.name = 'dot';
  return g;
}

function eyebrow(parent, label, x, y) {
  const dot = ellipse(parent, x, y + 5, 5, { fill: C.signal });
  dot.name = 'eyebrow dot';
  const t = mono(parent, label.toUpperCase(), x + 14, y, { size: 10, color: C.faint, track: 16 });
  return { dot, t, width: t.width + 14 };
}

function nav(parent, opts = {}) {
  const n = figma.createFrame();
  n.name = 'Nav';
  n.x = 0;
  n.y = 0;
  n.resize(1440, 72);
  n.fills = [gradV([stop(C.ink0, 0, 0.9), stop(C.ink0, 1, 0)])];
  n.clipsContent = false;
  parent.appendChild(n);

  ellipse(n, 72, 26, 20, { stroke: solid(C.paper), strokeWeight: 1.4 });
  ellipse(n, 78, 32, 8, { stroke: solid(C.signal), strokeWeight: 1.4 });
  text(n, 'NOCTIS', 102, 27, { font: F.semi, size: 13, track: 24 });
  rect(n, 186, 29, 26, 16, { fill: '#FFFFFF', radius: 4, opacity: 0.02, stroke: line() });
  mono(n, 'C1', 194, 31, { size: 9, color: C.muted, track: 8 });

  const links = ['Overview', 'The glass', 'Numbers', 'Frames', 'Reserve'];
  const pill = figma.createFrame();
  pill.name = 'Nav links';
  pill.fills = [];
  pill.x = 500;
  pill.y = 20;
  pill.resize(440, 34);
  pill.clipsContent = false;
  n.appendChild(pill);
  let lx = 0;
  links.forEach((l, i) => {
    const t = text(pill, l, lx + 14, 9, { font: F.med, size: 11.5, color: i === 0 ? C.paper : C.muted });
    if (i === 0) {
      const p = figma.createFrame();
      p.name = 'active pill';
      p.x = lx;
      p.y = 0;
      p.resize(t.width + 28, 34);
      p.cornerRadius = 17;
      p.fills = [solid('#FFFFFF', 0.055)];
      p.strokes = [line()];
      p.strokeWeight = 1;
      p.strokeAlign = 'INSIDE';
      pill.appendChild(p);
      p.appendChild(t);
      t.x = 14;
      t.y = 9;
      lx += t.width + 28;
    } else {
      lx += t.width + 28;
    }
  });
  const linksW = lx;
  pill.x = 720 - linksW / 2;
  pill.resize(linksW, 34);

  // toggle
  const tg = figma.createFrame();
  tg.name = 'Tags toggle';
  tg.x = 1180;
  tg.y = 21;
  tg.resize(74, 30);
  tg.cornerRadius = 15;
  tg.fills = [];
  tg.strokes = [line()];
  tg.strokeWeight = 1;
  tg.strokeAlign = 'INSIDE';
  n.appendChild(tg);
  rect(tg, 9, 9, 22, 12, { fill: C.signal, radius: 6 });
  ellipse(tg, 21, 11, 8, { fill: C.ink0 });
  mono(tg, 'TAGS', 38, 10, { size: 8, color: C.paper, track: 14 });

  button(n, 'Notify me — $1,299', 1272, 17, { w: 150, h: 38, size: 12 });
  return n;
}

function footStrip(parent, y) {
  const cells = [
    ['Body', '96 × 62 × 29 mm'],
    ['Mass', '229 g'],
    ['Range', 'ISO 64–102,400'],
    ['Video', '6K 60p · 10-bit'],
  ];
  hline(parent, 72, y, 1296);
  const w = 1296 / 4;
  cells.forEach((c, i) => {
    const x = 72 + i * w + (i ? 28 : 0);
    mono(parent, c[0].toUpperCase(), x, y + 18, { size: 9, color: C.faint, track: 18 });
    mono(parent, c[1], x, y + 38, { size: 11, color: C.paper, track: 1 });
    if (i) vline(parent, 72 + i * w, y + 16, 46);
  });
}

/* ── frames ─────────────────────────────────────────────────── */

function cover(page, x, y) {
  const f = frame(page, '00 · Cover', x, y, 1440, 900, { fill: C.ink0 });
  image(f, 'hero', 0, 0, 1440, 900);
  rect(f, 0, 0, 1440, 900, {
    name: 'fade left',
    fill: gradH([
      stop(C.ink0, 0),
      stop(C.ink0, 0.28),
      stop(C.ink0, 0.44, 0.92),
      stop(C.ink0, 0.58, 0.5),
      stop(C.ink0, 0.72, 0),
    ]),
  });
  rect(f, 0, 0, 1440, 900, {
    name: 'fade bottom',
    fill: gradV([stop(C.ink0, 0, 0), stop(C.ink0, 0.72, 0), stop(C.ink0, 1, 0.96)]),
  });
  nav(f);

  const eb = eyebrow(f, 'NOCTIS 18 Pro Max — iPhone 18 Pro Max concept', 72, 296);
  libTag(f, 'GSAP · SplitText + pin', 72 + eb.width + 14, 291);

  text(f, 'Pocket', 72, 330, { font: F.med, size: 104, lh: 88, track: -5.5 });
  text(f, 'the dark.', 72, 418, { font: F.med, size: 104, lh: 88, track: -5.5 });
  text(
    f,
    'A A titanium-and-glass flagship with a cinematic display, pro camera system and all-day power. Designed for the hours that matter.',
    72,
    548,
    { size: 17, lh: 27, color: C.muted, w: 470, track: -1.5 },
  );
  button(f, 'Notify me — $1,299', 72, 646, { w: 196, h: 50 });
  button(f, 'Explore the display  ↗', 284, 646, { w: 184, h: 50, kind: 'ghost' });
  footStrip(f, 790);

  mono(f, 'SCROLL', 1300, 720, { size: 9, color: C.faint, track: 20 });
  rect(f, 1356, 720, 1, 46, { fill: line(2) });
  rect(f, 1355, 720, 3, 12, { fill: C.signal });
  return f;
}

function glass(page, x, y) {
  const f = frame(page, '01 · The glass', x, y, 1440, 900, { fill: C.ink0 });
  image(f, 'lens', 0, 0, 1440, 900);
  rect(f, 0, 0, 1440, 900, {
    name: 'veil',
    fill: gradV([stop(C.ink0, 0, 0.96), stop(C.ink0, 0.3, 0.55), stop(C.ink0, 0.55, 0)]),
  });

  const head = figma.createFrame();
  head.name = 'Head';
  head.x = 390;
  head.y = 96;
  head.resize(660, 280);
  head.fills = [];
  head.clipsContent = false;
  f.appendChild(head);
  const eb = eyebrow(head, '02 — The glass', 0, 0);
  libTag(head, 'GSAP · scrubbed zoom', eb.width + 14, -5);
  text(head, 'Eight elements.', 0, 34, { font: F.med, size: 58, lh: 60, track: -4.5 });
  text(head, 'One intention.', 0, 94, { font: F.med, size: 58, lh: 60, track: -4.5 });
  text(
    head,
    'A fixed 28mm f/1.4 prime, computed as one optical system rather than a compromise between zoom ranges. It does not zoom. It does not wobble.',
    0,
    178,
    { size: 15, lh: 24, color: C.muted, w: 470, track: -1 },
  );

  // leader lines from the lens centre
  const cx = 720;
  const cy = 470;
  const leaders = [
    [115, 234],
    [1325, 234],
    [115, 666],
    [1310, 693],
  ];
  leaders.forEach(([lx, ly]) => {
    const dx = lx - cx;
    const dy = ly - cy;
    const len = Math.hypot(dx, dy);
    const l = figma.createLine();
    l.name = 'leader';
    try {
      l.resize(len, 0);
    } catch (e) {
      l.resize(len, 1);
    }
    l.x = (cx + lx) / 2 - len / 2;
    l.y = (cy + ly) / 2;
    l.rotation = (Math.atan2(dy, dx) * 180) / Math.PI;
    l.strokes = [solid(C.signal, 0.55)];
    l.strokeWeight = 1;
    f.appendChild(l);
  });

  const callouts = [
    ['8 ELEMENTS / 2 ASPHERICAL', 'FLOATING REAR GROUP', 115, 234, 'left'],
    ['NANO-COATED FRONT ELEMENT', '0.2% REFLECTANCE', 1325, 234, 'right'],
    ['F/1.4 MAXIMUM APERTURE', '9 ROUNDED BLADES', 115, 666, 'left'],
    ['28MM EQUIVALENT', 'FIXED · NO ZOOM', 1310, 693, 'right'],
  ];
  callouts.forEach(([title, meta, lx, ly, align]) => {
    const box = figma.createFrame();
    box.name = 'callout';
    box.fills = [];
    box.clipsContent = false;
    box.resize(260, 30);
    box.x = align === 'right' ? lx - 260 : lx;
    box.y = ly - 40;
    f.appendChild(box);
    mono(box, title, align === 'right' ? 0 : 12, 0, {
      size: 9,
      color: C.paper,
      track: 6,
      w: 250,
      align: align === 'right' ? 'RIGHT' : 'LEFT',
    });
    mono(box, meta, align === 'right' ? 0 : 12, 16, {
      size: 8,
      color: C.faint,
      track: 14,
      w: 250,
      align: align === 'right' ? 'RIGHT' : 'LEFT',
    });
    ellipse(f, lx - 2.5, ly - 2.5, 5, { fill: C.signal });
  });

  hline(f, 72, 806, 1296);
  const readouts = [
    ['APERTURE', 'f/1.4'],
    ['FOCAL', '28mm'],
    ['MIN FOCUS', '0.28m'],
  ];
  readouts.forEach((r, i) => {
    const rx = 72 + i * 132;
    vline(f, rx - 12, 826, 40);
    mono(f, r[0], rx, 826, { size: 8, color: C.faint, track: 18 });
    mono(f, r[1], rx, 844, { size: 12, color: C.paper, track: 2 });
  });
  mono(f, 'MIN FOCUS · 0.28m', 1180, 844, { size: 10, color: C.faint, track: 10, opacity: 0.6 });
  return f;
}

function numbers(page, x, y) {
  const f = frame(page, '02 · Numbers', x, y, 1440, 1180, { fill: C.ink0 });
  const eb = eyebrow(f, '03 — Numbers', 72, 96);
  libTag(f, 'Motion · count + layout', eb.width + 86, 91);
  text(f, 'Specification,', 72, 128, { font: F.med, size: 60, lh: 62, track: -4.5 });
  text(f, 'not decoration.', 72, 190, { font: F.med, size: 60, lh: 62, track: -4.5 });
  text(
    f,
    'Every number below is a decision someone had to defend. The sensor is bigger than the body suggests; everything else is smaller than you would expect.',
    930,
    200,
    { size: 14, lh: 23, color: C.muted, w: 438, track: -0.8 },
  );

  const card = (cx, cy, cw, ch, name) => {
    const c = frame(f, name, cx, cy, cw, ch, { fill: C.card, radius: 20, stroke: true });
    c.fills = [
      {
        type: 'GRADIENT_LINEAR',
        gradientTransform: [
          [0.94, -0.34, 0.17],
          [0.34, 0.94, -0.12],
        ],
        gradientStops: [stop('#1D1D22', 0), stop('#141417', 1)],
      },
    ];
    return c;
  };

  // big sensor card
  const sensor = card(72, 300, 751, 428, 'Card / Sensor');
  mono(sensor, 'SENSOR', 22, 20, { size: 9, color: C.faint, track: 19 });
  mono(sensor, '01', 706, 20, { size: 9, color: C.faint, track: 12 });
  text(sensor, '48', 20, 300, { font: F.mono, size: 64, track: -5 });
  mono(sensor, 'MP', 168, 330, { size: 11, color: C.muted, track: 6 });
  text(sensor, 'Full-frame BSI CMOS, 14-bit RAW, dual gain.', 20, 380, {
    size: 12,
    color: C.muted,
    w: 420,
  });
  // sensor grid
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 15; c += 1) {
      const hot =
        (r === 4 && c === 7) || (r === 3 && c === 7) || (r === 5 && c === 7) || (r === 4 && c === 6) || (r === 4 && c === 8);
      rect(sensor, 22 + c * 9, 78 + r * 9, 6, 6, {
        fill: hot ? C.signal : '#FFFFFF',
        opacity: hot ? 1 : 0.1,
        radius: 1,
      });
    }
  }

  const mass = card(835, 300, 533, 208, 'Card / Mass');
  mono(mass, 'MASS', 22, 20, { size: 9, color: C.faint, track: 19 });
  text(mass, '412', 20, 108, { font: F.mono, size: 56, track: -4 });
  mono(mass, 'G', 108, 138, { size: 11, color: C.muted, track: 6 });
  text(mass, 'Lighter than a spare battery for a DSLR.', 20, 172, { size: 11.5, color: C.muted, w: 380 });

  const iso = card(835, 520, 533, 208, 'Card / ISO');
  mono(iso, 'RANGE', 22, 20, { size: 9, color: C.faint, track: 19 });
  text(iso, '64–102,400', 20, 108, { font: F.mono, size: 40, track: -3.4 });
  text(iso, 'Dual gain. The night is a setting, not a limit.', 20, 172, { size: 11.5, color: C.muted, w: 380 });

  const video = card(72, 740, 424, 208, 'Card / Video');
  mono(video, 'VIDEO', 22, 20, { size: 9, color: C.faint, track: 19 });
  text(video, '6K', 20, 108, { font: F.mono, size: 48, track: -4 });
  mono(video, '60P', 104, 136, { size: 11, color: C.muted, track: 6 });
  text(video, '10-bit 4:2:2 internal, 6K open gate.', 20, 172, { size: 11.5, color: C.muted, w: 340 });

  const battery = card(508, 740, 424, 208, 'Card / Battery');
  mono(battery, 'BATTERY', 22, 20, { size: 9, color: C.faint, track: 19 });
  text(battery, '340', 20, 108, { font: F.mono, size: 48, track: -4 });
  mono(battery, 'FRAMES', 112, 136, { size: 11, color: C.muted, track: 6 });
  text(battery, 'USB-C PD. 0–80% in 38 minutes.', 20, 172, { size: 11.5, color: C.muted, w: 340 });

  // spotlight
  const spot = frame(f, 'Card / Spotlight', 944, 740, 424, 208, { fill: C.ink1, radius: 20, stroke: true });
  image(spot, 'hand', 0, 0, 424, 208);
  rect(spot, 0, 0, 424, 208, {
    fill: gradV([stop(C.ink0, 0, 0.1), stop(C.ink0, 1, 0.92)]),
  });
  mono(spot, 'IN THE HAND', 22, 148, { size: 8.5, color: C.faint, track: 18 });
  text(spot, 'It disappears.', 20, 162, { font: F.med, size: 24, track: -2.4 });
  return f;
}

function gallery(page, x, y) {
  const f = frame(page, '03 · Frames', x, y, 1440, 860, { fill: C.ink0 });
  const eb = eyebrow(f, '04 — Frames', 72, 96);
  libTag(f, 'GSAP · horizontal pin', eb.width + 86, 91);
  text(f, 'No retouching. No excuses.', 72, 128, { font: F.med, size: 56, lh: 60, track: -4.4 });
  mono(f, '02', 1120, 140, { size: 10, color: C.paper, track: 8 });
  mono(f, '/ 06', 1150, 140, { size: 10, color: C.faint, track: 8 });
  rect(f, 1192, 146, 176, 1, { fill: line(2) });
  rect(f, 1192, 146, 58, 1, { fill: C.signal });

  const panels = [
    ['plinth', 'Concrete, 21:40', '28mm · f/1.4 · 1/60 · ISO 3200', 72, 540],
    [null, 'The best phone is the one that disappears into your day.', 'FIELD NOTES — VOL. 03', 628, 360],
    ['street', 'Rain, 23:12', '28mm · f/1.4 · 1/30 · ISO 6400', 1004, 364],
  ];
  panels.forEach(([img, cap, meta, px, pw]) => {
    const p = frame(f, 'Panel / ' + cap, px, 230, pw, 520, { fill: C.ink1, radius: 20, stroke: true });
    if (img) {
      image(p, img, 0, 0, pw, 520, { name: img });
      rect(p, 0, 0, pw, 520, {
        fill: gradV([stop(C.ink0, 0, 0), stop(C.ink0, 0.7, 0), stop(C.ink0, 1, 0.85)]),
      });
      mono(p, cap, 20, 478, { size: 9, color: C.paper, track: 6 });
      mono(p, meta, 20, 494, { size: 7.5, color: C.faint, track: 8 });
    } else {
      text(p, cap, 26, 30, { font: F.med, size: 26, lh: 33, track: -2.4, w: 308 });
      mono(p, meta, 26, 478, { size: 8, color: C.faint, track: 16 });
    }
  });
  return f;
}

function aperture(page, x, y) {
  const f = frame(page, '04 · Colorways', x, y, 1440, 900, { fill: C.ink0 });
  const eb = eyebrow(f, '05 — The aperture', 72, 220);
  libTag(f, 'Anime.js · iris + blur', eb.width + 86, 215);
  text(f, 'Nine blades.', 72, 252, { font: F.med, size: 60, lh: 62, track: -4.6 });
  text(f, 'One breath.', 72, 314, { font: F.med, size: 60, lh: 62, track: -4.6 });
  text(
    f,
    'A rounded nine-blade diaphragm that stays circular down to f/4, so a streetlight at f/2 is a disc, not a polygon. Drag the ring and watch the glass give up its depth.',
    72,
    400,
    { size: 14.5, lh: 24, color: C.muted, w: 430, track: -0.8 },
  );
  ['APERTURE  f/1.4', 'BLUR  0.0 px', 'OPEN  100%'].forEach((r, i) => {
    mono(f, r, 72 + i * 130, 540, { size: 9, color: i === 0 ? C.paper : C.faint, track: 12 });
  });
  hline(f, 72, 520, 380);
  mono(f, '●  DRAG UP TO OPEN · DOWN TO CLOSE', 72, 600, { size: 8, color: C.faint, track: 14 });

  // the iris
  const d = 560;
  const cx = 1000;
  const cy = 170;
  ellipse(f, cx, cy, d, { fill: C.ink2, stroke: line(2), strokeWeight: 1 });
  const photo = ellipse(f, cx + 24, cy + 24, d - 48, { fill: C.ink2 });
  photo.name = 'photo / street';
  image(f, 'street', cx + 24, cy + 24, d - 48, d - 48, { name: 'street', radius: d / 2 });
  ellipse(f, cx + 24, cy + 24, d - 48, {
    fill: {
      type: 'GRADIENT_RADIAL',
      gradientTransform: [
        [1, 0, 0],
        [0, 1, 0],
      ],
      gradientStops: [stop(C.ink0, 0, 0), stop(C.ink0, 0.65, 0.25), stop(C.ink0, 1, 0.7)],
    },
  });
  ellipse(f, cx, cy, d, { stroke: solid(C.signal, 0.9), strokeWeight: 1.5 });
  ellipse(f, cx + 8, cy + 8, d - 16, { stroke: line(1.4), strokeWeight: 1 });
  // knob
  const knobAngle = (90 - 64) * (Math.PI / 180);
  ellipse(f, cx + d / 2 + Math.cos(knobAngle) * (d / 2 - 12) - 9, cy + d / 2 + Math.sin(knobAngle) * (d / 2 - 12) - 9, 18, {
    stroke: solid(C.signal),
    strokeWeight: 1,
  });
  ellipse(f, cx + d / 2 + Math.cos(knobAngle) * (d / 2 - 12) - 3, cy + d / 2 + Math.sin(knobAngle) * (d / 2 - 12) - 3, 6, {
    fill: C.signal,
  });
  mono(f, '28MM · 9 BLADES · F/1.4–F/16', cx, cy + d + 26, { size: 8, color: C.faint, track: 14 });
  mono(f, 'ANIME.JS · EASED, NOT SNAPPED', cx + 300, cy + d + 26, { size: 8, color: C.faint, track: 14 });
  return f;
}

function round(page, x, y) {
  const f = frame(page, '05 · In the round', x, y, 1440, 900, { fill: C.ink0 });
  const eb = eyebrow(f, '06 — In the round', 72, 220);
  libTag(f, 'React Three Fiber', eb.width + 86, 215);
  text(f, 'Turn it over.', 72, 252, { font: F.med, size: 58, lh: 60, track: -4.6 });
  text(f, 'It is a real object.', 72, 312, { font: F.med, size: 58, lh: 60, track: -4.6 });
  text(
    f,
    'Aerospace-grade titanium wraps a sculpted glass back. Four finishes bring subtle personality to the same precise silhouette.',
    72,
    398,
    { size: 14.5, lh: 24, color: C.muted, w: 430, track: -0.8 },
  );
  [
    ['BARREL', 'TURNED ALUMINIUM, 96 MM'],
    ['FOCUS RING', '76 DIAMOND CUTS'],
    ['ACCENT', 'SIGNAL ORANGE, 0.4 MM'],
  ].forEach((r, i) => {
    const ry = 500 + i * 42;
    hline(f, 72, ry, 430);
    mono(f, r[0], 72, ry + 13, { size: 8, color: C.faint, track: 16 });
    mono(f, r[1], 240, ry + 13, { size: 8, color: i === 2 ? C.signal : C.muted, track: 10 });
  });
  hline(f, 72, 626, 430);

  const panel = frame(f, '3D stage', 768, 150, 600, 600, { fill: C.ink1, radius: 20, stroke: true });
  image(panel, 'lens', 0, 0, 600, 600, { opacity: 0.9 });
  rect(panel, 0, 0, 600, 600, {
    fill: {
      type: 'GRADIENT_RADIAL',
      gradientTransform: [
        [1, 0, 0],
        [0, 1, 0],
      ],
      gradientStops: [stop(C.ink0, 0, 0.1), stop(C.ink0, 1, 0.9)],
    },
  });
  const badge = mono(panel, 'R3F · 60 FPS', 16, 16, { size: 8, color: C.faint, track: 16 });
  rect(panel, 16, 16, badge.width + 20, 22, { fill: solid(C.ink0, 0.5), radius: 5, stroke: line() });
  badge.x = 26;
  badge.y = 22;
  mono(panel, 'DRAG TO ROTATE', 16, 560, { size: 8, color: C.faint, track: 16 });
  return f;
}

function playground(page, x, y) {
  const f = frame(page, '06 · Playground', x, y, 1440, 900, { fill: C.ink0 });
  const eb = eyebrow(f, '07 — Playground', 72, 96);
  libTag(f, 'GSAP · Motion · Anime · CSS', eb.width + 86, 91);
  text(f, 'Same move.', 72, 128, { font: F.med, size: 58, lh: 60, track: -4.4 });
  text(f, 'Four engines.', 72, 188, { font: F.med, size: 58, lh: 60, track: -4.4 });
  text(
    f,
    'One transform, four implementations. Change the duration or the curve and run it again — the pixels should be indistinguishable.',
    930,
    150,
    { size: 14, lh: 23, color: C.muted, w: 438, track: -0.8 },
  );

  const stage = frame(f, 'Stage', 72, 320, 700, 460, { fill: C.ink1, radius: 20, stroke: true });
  for (let i = 0; i < 9; i += 1) vline(stage, 70 + i * 70, 0, 460, 0.5);
  const cardEl = frame(stage, 'demo card', 280, 180, 140, 92, { fill: C.card, radius: 14, stroke: true });
  rect(cardEl, 0, 0, 140, 4, { fill: C.signal, radius: 2 });
  mono(cardEl, 'NOCTIS', 14, 18, { size: 8, color: C.faint, track: 16 });
  text(cardEl, 'C1', 14, 36, { font: F.mono, size: 28, track: -2 });
  cardEl.rotation = -6;

  const controls = figma.createFrame();
  controls.name = 'Controls';
  controls.x = 72;
  controls.y = 800;
  controls.resize(700, 40);
  controls.fills = [];
  f.appendChild(controls);
  ['GSAP', 'MOTION', 'ANIME.JS', 'CSS'].forEach((l, i) => {
    const w = 96;
    const b = figma.createFrame();
    b.name = 'engine ' + l;
    b.x = i * (w + 10);
    b.y = 0;
    b.resize(w, 34);
    b.cornerRadius = 17;
    b.fills = [i === 0 ? solid('#FFFFFF', 0.06) : solid('#FFFFFF', 0.02)];
    b.strokes = [i === 0 ? { type: 'SOLID', color: rgb(C.signal), opacity: 0.4 } : line()];
    b.strokeWeight = 1;
    b.strokeAlign = 'INSIDE';
    controls.appendChild(b);
    const t = mono(b, l, 0, 0, { size: 9, color: i === 0 ? C.paper : C.faint, track: 12 });
    t.x = (w - t.width) / 2;
    t.y = (34 - t.height) / 2;
  });
  button(f, 'Run the move  →', 560, 800, { w: 212, h: 40, size: 13 });

  const code = frame(f, 'Code', 812, 320, 556, 460, { fill: C.ink1, radius: 20, stroke: true });
  mono(code, 'GSAP', 24, 24, { size: 8, color: C.faint, track: 16 });
  mono(code, 'DURATION 1.10s · EXPO.OUT', 380, 24, { size: 8, color: C.faint, track: 12 });
  hline(code, 24, 48, 508);
  const lines = [
    ['gsap.to(el, {', C.paper],
    ['  y: -64,', C.paper],
    ['  rotate: -6,', C.paper],
    ['  scale: 1.05,', C.paper],
    ['  duration: 1.1,', C.paper],
    ['  ease: "expo.out"', C.signal],
    ['});', C.paper],
  ];
  lines.forEach((l, i) => mono(code, l[0], 24, 70 + i * 26, { size: 11.5, color: l[1], track: 1 }));
  mono(code, 'SAME CURVE, FOUR ENGINES', 24, 420, { size: 8, color: C.faint, track: 14 });
  return f;
}

function reserve(page, x, y) {
  const f = frame(page, '07 · Reserve', x, y, 1440, 1020, { fill: C.ink0 });
  image(f, 'hand', 0, 0, 1440, 1020, { opacity: 0.35 });
  rect(f, 0, 0, 1440, 1020, {
    fill: gradH([stop(C.ink0, 0, 0.98), stop(C.ink0, 0.55, 0.86), stop(C.ink0, 1, 0.94)]),
  });

  const eb = eyebrow(f, '08 — Reserve', 72, 150);
  libTag(f, 'Motion · magnetic CTA', eb.width + 86, 145);
  text(f, 'Own the hour', 72, 184, { font: F.med, size: 72, lh: 72, track: -5 });
  text(f, 'after sunset.', 72, 256, { font: F.med, size: 72, lh: 72, track: -5 });
  text(
    f,
    'The first production run is limited to 2,000 bodies. Reservations are free, refundable and transferable.',
    72,
    372,
    { size: 15, lh: 25, color: C.muted, w: 420, track: -0.8 },
  );

  const cardEl = frame(f, 'Reserve card', 792, 120, 576, 560, { fill: C.ink1, radius: 20, stroke: true });
  mono(cardEl, 'NOCTIS 18 PRO MAX — 256 GB', 32, 34, { size: 9, color: C.faint, track: 18 });
  text(cardEl, '$1,299', 32, 58, { font: F.mono, size: 44, track: -4 });
  mono(cardEl, 'or $207/mo · 12 mo', 216, 82, { size: 9, color: C.faint, track: 6 });
  ellipse(cardEl, 32, 132, 5, { fill: C.signal });
  mono(cardEl, 'EARLY ACCESS OPEN', 44, 126, { size: 9, color: C.muted, track: 12 });
  hline(cardEl, 32, 166, 512);
  [
    ['IN THE BOX', 'C1 BODY · BATTERY · USB-C CABLE · STRAP'],
    ['SHIPS', 'SPRING 2027, IN ORDER OF RESERVATION'],
    ['RETURNS', '30 DAYS, NO QUESTIONS'],
  ].forEach((r, i) => {
    const ry = 186 + i * 44;
    mono(cardEl, r[0], 32, ry, { size: 8, color: C.faint, track: 16 });
    mono(cardEl, r[1], 32, ry + 15, { size: 8, color: C.muted, track: 10 });
  });
  rect(cardEl, 32, 344, 512, 52, { fill: '#FFFFFF', radius: 26, opacity: 0.03, stroke: line() });
  mono(cardEl, 'you@studio.com', 54, 361, { size: 12, color: C.faint, track: 2 });
  button(cardEl, 'Notify me  →', 32, 412, { w: 512, h: 54, size: 14 });
  mono(cardEl, 'NO PAYMENT NOW. CANCEL ANY TIME BEFORE YOUR BUILD SHIPS.', 32, 484, {
    size: 7.5,
    color: C.faint,
    track: 10,
  });

  hline(f, 72, 760, 1296);
  text(f, 'NOCTIS', 72, 780, { font: F.semi, size: 96, track: 6, color: C.paper, opacity: 0.16 });
  mono(f, 'Designed in the dark. Assembled in Nagano.', 72, 900, { size: 9, color: C.faint, track: 8 });
  mono(f, '© 2027 NOCTIS Optics K.K. — All frames real.', 72, 918, { size: 9, color: C.faint, track: 8 });
  ['Specifications', 'Reserve', 'Press', 'Instagram'].forEach((l, i) => {
    mono(f, l, 1060 + i * 76, 900, { size: 9, color: C.muted, track: 6 });
  });
  return f;
}

function mobile(page, x, y) {
  const f = frame(page, 'Mobile · Cover', x, y, 390, 844, { fill: C.ink0 });
  image(f, 'hero', 0, 0, 390, 844);
  rect(f, 0, 0, 390, 844, {
    fill: gradV([stop(C.ink0, 0, 0.2), stop(C.ink0, 0.34, 0.1), stop(C.ink0, 0.55, 0.85), stop(C.ink0, 0.78, 1)]),
  });
  rect(f, 0, 0, 390, 90, { fill: gradV([stop(C.ink0, 0, 0.9), stop(C.ink0, 1, 0)]) });
  ellipse(f, 20, 28, 18, { stroke: solid(C.paper), strokeWeight: 1.3 });
  ellipse(f, 25, 33, 8, { stroke: solid(C.signal), strokeWeight: 1.3 });
  text(f, 'NOCTIS', 46, 29, { font: F.semi, size: 11, track: 22 });
  rect(f, 296, 27, 34, 20, { fill: C.signal, radius: 10 });
  ellipse(f, 316, 31, 12, { fill: C.ink0 });

  const eb = eyebrow(f, 'NOCTIS 18 Pro Max — iPhone 18 Pro Max concept', 20, 432);
  libTag(f, 'GSAP · SplitText', 20, 452);
  text(f, 'Pocket', 20, 486, { font: F.med, size: 52, lh: 48, track: -4 });
  text(f, 'the dark.', 20, 534, { font: F.med, size: 52, lh: 48, track: -4 });
  text(
    f,
    'A 61-megapixel full-frame sensor and a fixed 28mm f/1.4 lens in a body that disappears in a jacket pocket.',
    20,
    600,
    { size: 13, lh: 21, color: C.muted, w: 340, track: -0.6 },
  );
  button(f, 'Notify me — $1,299', 20, 690, { w: 190, h: 44, size: 12 });
  button(f, 'The display  ↗', 220, 690, { w: 130, h: 44, size: 12, kind: 'ghost' });
  hline(f, 20, 762, 350);
  mono(f, '229 G', 20, 778, { size: 9, color: C.paper, track: 6 });
  mono(f, '96 × 62 × 29 MM', 130, 778, { size: 9, color: C.faint, track: 6 });
  mono(f, 'ISO 64–102,400', 270, 778, { size: 9, color: C.faint, track: 6 });
  return f;
}

function designSystem(page, x, y) {
  const f = frame(page, 'Design system', x, y, 1440, 1180, { fill: C.ink0 });
  const eb = eyebrow(f, 'NOCTIS 18 Pro Max — Design system', 72, 72);
  text(f, 'The system', 72, 100, { font: F.med, size: 54, lh: 56, track: -4 });
  mono(f, 'ONE ACCENT · TWO TYPEFACES · ONE RADIUS', 72, 176, { size: 9, color: C.faint, track: 16 });

  const swatches = [
    ['Ink 0', '#0B0B0C'],
    ['Ink 1', '#111113'],
    ['Ink 2', '#17171A'],
    ['Card', '#1B1B1F'],
    ['Paper', '#EDEDEA'],
    ['Muted', '#8A8A86'],
    ['Faint', '#5C5C59'],
    ['Signal', '#FF5A1F'],
  ];
  swatches.forEach((s, i) => {
    const sx = 72 + i * 160;
    rect(f, sx, 220, 140, 96, { fill: s[1], radius: 12, stroke: true });
    mono(f, s[0].toUpperCase(), sx, 330, { size: 9, color: C.paper, track: 10 });
    mono(f, s[1], sx, 346, { size: 8.5, color: C.faint, track: 6 });
  });

  const type = [
    ['Display / 104 · −5.5% · 88', 'The next large thing.', 104, 88, -5.5],
    ['H2 / 60 · −4.5% · 62', 'Specification,', 60, 62, -4.5],
    ['H3 / 34 · −3% · 38', 'One piece of aluminium', 34, 38, -3],
    ['Lede / 17 · −1.5% · 27', 'Every number below is a decision.', 17, 27, -1.5],
    ['Body / 15 · 0 · 24', 'The hour after sunset is the point.', 15, 24, 0],
    ['Mono / 11 · 14%', 'ISO 64–102,400 · 6K 60P', 11, 16, 14],
  ];
  type.forEach((t, i) => {
    const ty = 420 + i * 108;
    mono(f, t[0], 72, ty, { size: 8, color: C.faint, track: 14 });
    if (i === 5) {
      mono(f, t[1], 72, ty + 20, { size: t[2], lh: t[3], track: t[4] });
    } else {
      text(f, t[1], 72, ty + 18, { font: i < 3 ? F.med : F.reg, size: t[2], lh: t[3], track: t[4] });
    }
    hline(f, 72, ty + 92, 700);
  });

  mono(f, 'COMPONENTS', 860, 420, { size: 8, color: C.faint, track: 16 });
  button(f, 'Notify me — $1,299', 860, 444, { w: 196, h: 50 });
  button(f, 'Explore the display  ↗', 1072, 444, { w: 184, h: 50, kind: 'ghost' });
  libTag(f, 'GSAP · SplitText + pin', 860, 516);
  libTag(f, 'Anime.js · iris + blur', 1046, 516);
  rect(f, 860, 560, 300, 140, { fill: C.card, radius: 20, stroke: true });
  mono(f, 'PANEL / 20 RADIUS / 1PX 8%', 880, 580, { size: 8, color: C.faint, track: 12 });
  text(f, '412', 880, 610, { font: F.mono, size: 44, track: -4 });
  mono(f, 'G', 948, 634, { size: 10, color: C.muted, track: 6 });

  mono(f, 'RHYTHM', 860, 730, { size: 8, color: C.faint, track: 16 });
  [8, 12, 20, 32, 48, 72, 120].forEach((v, i) => {
    rect(f, 860, 760 + i * 26, v * 1.6, 8, { fill: C.signal, opacity: 0.7, radius: 2 });
    mono(f, String(v), 1060, 757 + i * 26, { size: 8, color: C.faint, track: 6 });
  });
  mono(f, 'GRID 12 COL · 1296 CONTENT · 72 GUTTER', 860, 960, { size: 8, color: C.faint, track: 12 });
  return f;
}

/* ── run ────────────────────────────────────────────────────── */

async function main() {
  await loadFonts();

  await figma.loadAllPagesAsync();
  const previous = figma.root.children.find((p) => p.name === 'NOCTIS 18 Pro Max · Launch Site');
  if (previous) previous.remove();

  const page = figma.createPage();
  page.name = 'NOCTIS 18 Pro Max · Launch Site';
  figma.currentPage = page;
  page.backgrounds = [solid(C.ink0)];

  // paint styles
  const styleDefs = [
    ['Ink / 0', C.ink0],
    ['Ink / 1', C.ink1],
    ['Ink / 2', C.ink2],
    ['Card', C.card],
    ['Paper', C.paper],
    ['Muted', C.muted],
    ['Faint', C.faint],
    ['Signal', C.signal],
  ];
  styleDefs.forEach(([name, hex]) => {
    const s = figma.createPaintStyle();
    s.name = 'NOCTIS / ' + name;
    s.paints = [solid(hex)];
  });

  // text styles
  const textStyles = [
    ['Display', F.med, 104, 88, -5.5],
    ['H2', F.med, 60, 62, -4.5],
    ['H3', F.med, 34, 38, -3],
    ['Lede', F.reg, 17, 27, -1.5],
    ['Body', F.reg, 15, 24, 0],
    ['Mono / Label', F.mono, 9, 16, 14],
    ['Mono / Value', F.mono, 12, 18, 2],
  ];
  textStyles.forEach(([name, font, size, lh, track]) => {
    const s = figma.createTextStyle();
    s.name = 'NOCTIS / ' + name;
    s.fontName = font;
    s.fontSize = size;
    s.lineHeight = { unit: 'PIXELS', value: lh };
    s.letterSpacing = { unit: 'PERCENT', value: track };
  });

  const builders = [designSystem, cover, glass, numbers, gallery, aperture, round, playground, reserve, mobile];
  let cy = 0;
  builders.forEach((build, i) => {
    const isSystem = i === 0;
    const f = build(page, isSystem ? 1560 : 0, cy);
    if (!isSystem) cy += f.height + 90;
    f.setPluginData('noctis', '1');
  });

  figma.viewport.scrollAndZoomIntoView(page.children.slice(0, 2));
  figma.notify('NOCTIS 18 Pro Max — design system + 9 frames created.', { timeout: 6000 });
  figma.closePlugin();
}

main().catch((err) => {
  figma.notify('NOCTIS build failed: ' + err.message, { error: true, timeout: 12000 });
  console.error(err);
  figma.closePlugin();
});
