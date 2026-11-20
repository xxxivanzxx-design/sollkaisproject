"""Inspect the lens ScrollTrigger at a given scroll offset."""
import json
import sys

from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:3000"


def main():
    ratio = float(sys.argv[1]) if len(sys.argv) > 1 else 0.42
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        pg = b.new_page(viewport={"width": 1440, "height": 900})
        pg.goto(URL, wait_until="networkidle")
        pg.wait_for_timeout(2500)
        info = pg.evaluate(
            """() => {
              const st = window.__st.getAll().map(t => ({
                trigger: t.trigger?.id || t.trigger?.className || '?',
                start: Math.round(t.start), end: Math.round(t.end),
                progress: +t.progress.toFixed(3), pin: !!t.pin
              }));
              const el = document.getElementById('lens');
              return { top: Math.round(el.getBoundingClientRect().top + scrollY),
                       h: el.offsetHeight, st };
            }"""
        )
        print(json.dumps(info, indent=1))
        y = info["top"] + ratio * (info["h"] - 900)
        pg.evaluate(f"window.__lenis.scrollTo({y}, {{immediate:true}})")
        pg.wait_for_timeout(1500)
        out = pg.evaluate(
            """() => {
              const st = window.__st.getAll().find(t => (t.trigger?.id === 'lens'));
              const g = (sel) => {
                const el = document.querySelector(sel);
                if (!el) return null;
                const cs = getComputedStyle(el);
                const r = el.getBoundingClientRect();
                return { op: cs.opacity, box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
                         dash: cs.strokeDashoffset, text: (el.textContent||'').trim().slice(0,28) };
              };
              return { progress: st ? +st.progress.toFixed(3) : null,
                       head: g('.zoom__head'), label: g('.callout__label'),
                       path: g('.callout__path'), dot: g('.callout__dot') };
            }"""
        )
        print(json.dumps(out, indent=1))
        b.close()


if __name__ == "__main__":
    main()
