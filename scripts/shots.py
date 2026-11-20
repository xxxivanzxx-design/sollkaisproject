"""Scroll-and-capture helper for visual review of pinned sections."""
import json
import sys
from playwright.sync_api import sync_playwright

OUT = "/home/ubuntu/noctis/.shots"
URL = "http://127.0.0.1:3000"
W, H = 1440, 900

SHOTS = [
    ("hero-0", "overview", 0.0),
    ("hero-pin", "overview", 0.5),
    ("hero-end", "overview", 0.9),
    ("lens-start", "lens", 0.02),
    ("lens-mid", "lens", 0.42),
    ("lens-end", "lens", 0.9),
    ("specs", "specs", 0.02),
    ("specs-detail", "specs", 0.6),
    ("gallery-start", "gallery", 0.02),
    ("gallery-mid", "gallery", 0.42),
    ("aperture", "aperture", 0.04),
    ("stage", "stage", 0.04),
    ("playground", "playground", 0.03),
    ("reserve", "reserve", 0.04),
]


def main():
    only = sys.argv[1:] or None
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(2200)
        try:
            page.wait_for_function(
                "Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)",
                timeout=15000,
            )
        except Exception:
            print("warning: some images incomplete")

        info = page.evaluate(
            """() => {
                const ids = ['overview','lens','specs','gallery','aperture','stage','playground','reserve'];
                const out = {};
                for (const id of ids) {
                    const el = document.getElementById(id);
                    if (el) out[id] = Math.round(el.getBoundingClientRect().top + window.scrollY);
                }
                out.total = document.body.scrollHeight;
                return out;
            }"""
        )
        print(json.dumps(info))

        for name, section, ratio in SHOTS:
            if only and name not in only:
                continue
            top = info.get(section, 0)
            y = top + int(H * ratio)
            page.evaluate(
                "(y) => window.__lenis ? window.__lenis.scrollTo(y, {immediate:true}) : window.scrollTo(0,y)",
                y,
            )
            page.wait_for_timeout(900)
            page.screenshot(path=f"{OUT}/{name}.png")
            print("shot", name, y, page.evaluate("Math.round(window.scrollY)"))

        browser.close()


if __name__ == "__main__":
    main()
