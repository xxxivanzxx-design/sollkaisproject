"""Mobile (390x844) sanity pass: hero, specs, gallery, reserve."""
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:3000"
OUT = "/home/ubuntu/noctis/.shots"


def main():
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        pg = b.new_page(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True,
        )
        pg.goto(URL, wait_until="networkidle")
        pg.wait_for_timeout(2600)
        pg.screenshot(path=f"{OUT}/m-hero.png")
        for name, sid in [("m-specs", "specs"), ("m-gallery", "gallery"), ("m-reserve", "reserve")]:
            y = pg.evaluate(f"document.getElementById('{sid}').getBoundingClientRect().top + scrollY")
            pg.evaluate(f"window.scrollTo(0, {y})")
            pg.wait_for_timeout(1200)
            pg.screenshot(path=f"{OUT}/{name}.png")
            print("shot", name, y)
        print("height", pg.evaluate("document.body.scrollHeight"))
        b.close()


if __name__ == "__main__":
    main()
