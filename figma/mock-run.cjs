/**
 * Smoke test: run code.js against a minimal mock of the Figma plugin API.
 * Catches runtime errors (undefined helpers, bad keys) without Figma.
 */
const fs = require('fs');
const vm = require('vm');

let created = 0;
const allPages = [];

function node(type) {
  const n = {
    type,
    name: type,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    children: [],
    fills: [],
    strokes: [],
    rotation: 0,
    opacity: 1,
    visible: true,
    resize(w, h) {
      if (!(w >= 0) || !(h >= 0)) throw new Error(`${type}: bad resize ${w}x${h}`);
      this.width = w;
      this.height = h;
    },
    appendChild(child) {
      if (!child) throw new Error('appendChild(undefined)');
      this.children.push(child);
      child.parent = this;
      return child;
    },
    setPluginData() {},
    remove() {
      this.removed = true;
      const p = this.parent;
      if (p) p.children = p.children.filter((c) => c !== this);
    },
  };
  return new Proxy(n, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === 'width' || prop === 'height') return target[prop];
      return undefined;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  });
}

function textNode() {
  const n = node('TEXT');
  n.characters = '';
  n.fontSize = 12;
  Object.defineProperty(n, 'width', {
    get() {
      const lh = this.lineHeight && this.lineHeight.value ? this.lineHeight.value : this.fontSize * 1.4;
      return Math.max(10, (this.characters || '').length * this.fontSize * 0.52);
    },
    set() {},
  });
  Object.defineProperty(n, 'height', {
    get() {
      const lh = this.lineHeight && this.lineHeight.value ? this.lineHeight.value : this.fontSize * 1.4;
      return lh;
    },
    set() {},
  });
  return n;
}

const figma = {
  root: { children: allPages },
  currentPage: null,
  createPage() {
    const p = node('PAGE');
    p.name = 'Page';
    allPages.push(p);
    this.currentPage = p;
    return p;
  },
  createFrame() {
    created += 1;
    return node('FRAME');
  },
  createRectangle() {
    return node('RECTANGLE');
  },
  createEllipse() {
    return node('ELLIPSE');
  },
  createLine() {
    const l = node('LINE');
    l.resize = function (w, h) {
      if (!(w >= 0) || !(h >= 0)) throw new Error(`line resize ${w}x${h}`);
      this.width = w;
      this.height = h;
    };
    return l;
  },
  createText() {
    return textNode();
  },
  createImage(bytes) {
    if (!bytes || !bytes.length) throw new Error('createImage got empty bytes');
    return { hash: 'hash' + created++ };
  },
  base64Decode(str) {
    const buf = Buffer.from(str, 'base64');
    return new Uint8Array(buf);
  },
  async loadFontAsync(font) {
    const known = { Inter: 1, 'Roboto Mono': 1 };
    if (!known[font.family]) throw new Error('unknown font ' + font.family);
    return null;
  },
  async loadAllPagesAsync() {},
  createPaintStyle() {
    return { name: '', paints: [] };
  },
  createTextStyle() {
    return { name: '', fontName: null, fontSize: 0, lineHeight: null, letterSpacing: null };
  },
  viewport: { scrollAndZoomIntoView() {} },
  notify(msg) {
    console.log('notify:', msg);
  },
  closePlugin() {
    console.log('closePlugin');
  },
};

const code = fs.readFileSync(__dirname + '/code.js', 'utf8');
const ctx = vm.createContext({ figma, console, Math, JSON, Uint8Array, Buffer, setTimeout });
vm.runInContext(code, ctx, { filename: 'code.js' });

setTimeout(() => {
  const page = allPages[0];
  console.log('pages:', allPages.length, 'nodes:', created);
  if (page) {
    console.log(
      'frames:',
      page.children.map((c) => `${c.name} ${Math.round(c.width)}x${Math.round(c.height)}`).join('\n        '),
    );
  }
}, 300);
