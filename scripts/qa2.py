"""Targeted checks: hero pin end, aperture closed, stage knurl."""
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:3000"
OUT = "/home/ubuntu/noctis/.shots"


def main():
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        pg = b.new_page(viewport={"width": 1440, "height": 900})
        pg.goto(URL, wait_until="networkidle")
        pg.wait_for_timeout(2500)

        top = pg.evaluate("document.getElementById('overview').getBoundingClientRect().top + scrollY")
        for name, y in [("hero-pin-60", top + 0.6 * 1170), ("hero-pin-100", top + 1170)]:
            pg.evaluate(f"window.__lenis.scrollTo({y}, {{immediate: true}})")
            pg.wait_for_timeout(1400)
            pg.screenshot(path=f"{OUT}/{name}.png")
            print("shot", name, y)

        ap = pg.evaluate("document.getElementById('aperture').getBoundingClientRect().top + scrollY")
        pg.evaluate(f"window.__lenis.scrollTo({ap - 40}, {{immediate: true}})")
        pg.wait_for_timeout(900)
        pg.focus(".ap__stage")
        for _ in range(13):
            pg.keyboard.press("ArrowDown")
        pg.wait_for_timeout(1400)
        pg.screenshot(path=f"{OUT}/aperture-closed.png")
        print("shot aperture-closed", ap)

        st = pg.evaluate("document.getElementById('stage').getBoundingClientRect().top + scrollY")
        pg.evaluate(f"window.__lenis.scrollTo({st - 40}, {{immediate: true}})")
        pg.wait_for_timeout(2600)
        pg.screenshot(path=f"{OUT}/stage2.png")
        print("shot stage2", st)
        b.close()


if __name__ == "__main__":
    main()
