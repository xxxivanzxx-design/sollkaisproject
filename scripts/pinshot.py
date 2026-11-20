"""Screenshot pinned sections at true pin progress: pinshot.py <section> <ratio> [ratio...]."""
import sys

from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:3000"
OUT = "/home/ubuntu/noctis/.shots"
H = 900


def main():
    section = sys.argv[1]
    ratios = [float(r) for r in sys.argv[2:]] or [0.0]
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        pg = b.new_page(viewport={"width": 1440, "height": H})
        pg.goto(URL, wait_until="networkidle")
        pg.wait_for_timeout(2600)
        top, height = pg.evaluate(
            f"""() => {{
                const el = document.getElementById('{section}');
                return [Math.round(el.getBoundingClientRect().top + scrollY), el.offsetHeight];
            }}"""
        )
        print("section", section, "top", top, "height", height)
        for r in ratios:
            y = top + r * (height - H)
            pg.evaluate(f"window.__lenis.scrollTo({y}, {{immediate:true}})")
            pg.wait_for_timeout(1700)
            name = f"{section}-p{int(r * 100)}"
            pg.screenshot(path=f"{OUT}/{name}.png")
            print("shot", name, y)
        b.close()


if __name__ == "__main__":
    main()
