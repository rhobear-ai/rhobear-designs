"""
Reproducer for the two documented findings in
reports/pressure-designs.md § Findings.

These are NOT the pressure-test matrix — those live in
`pressure_designs.py`. This file reproduces the two non-blocking API
quirks so anyone reading the report can confirm them independently.

  A) Programmatic set('content') on a parsed-HTML text component
     updates the GrapesJS model but leaves the rendered DOM empty.
  B) Inline edit: pressing Enter does not commit the typed text;
     only blur (or Escape) commits.

Run with:
  /opt/pi-tools/.venv/bin/python tests/findings-repro.py
"""
from __future__ import annotations

import json
import sys
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:5180"


def main() -> int:
    with sync_playwright() as p:
        b = p.chromium.launch(
            headless=True,
            executable_path="/tmp/chrome-nosandbox",
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
        )
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        page.goto(BASE + "/", wait_until="domcontentloaded")
        page.wait_for_function("window.__RB_EDITOR__ && window.__RB_EDITOR__.ready")
        page.get_by_test_id("btn-mode-build").click()
        page.wait_for_selector(".gjs-cv-canvas iframe", timeout=30_000)
        page.wait_for_timeout(500)

        # ---- Finding A: set('content') on parsed HTML -------------------
        page.evaluate("""() => {
            const ed = window.__RB_EDITOR__.shell.build.ensure();
            ed.setComponents('<section><h1>Heading</h1></section>');
            ed.UndoManager.clear();
        }""")
        page.wait_for_timeout(400)

        a = page.evaluate("""() => {
            const ifr = document.querySelector('.gjs-cv-canvas iframe');
            const idoc = ifr && ifr.contentDocument;
            const h1 = idoc.querySelector('h1');
            const before = h1.textContent;
            const ed = window.__RB_EDITOR__.shell.build.ensure();
            const compH1 = ed.DomComponents.getWrapper()
                .components().models[0].components().models[0];
            compH1.set('content', 'AFTER');
            ed.refresh();
            const modelVal = compH1.get('content');
            const after = idoc.querySelector('h1').textContent;
            return {
                dom_before: before,
                model_after: modelVal,
                dom_after: after,
            };
        }""")
        print("\n=== Finding A: set('content') on parsed-HTML h1 ===")
        print(json.dumps(a, indent=2))
        print(f"  model updated?   {a['model_after'] == 'AFTER'}")
        print(f"  DOM matches?     {a['dom_after'] == 'AFTER'}  "
              f"(should be True, observed: {a['dom_after']!r})")

        # Workaround: cc.components('NEW')
        wk = page.evaluate("""() => {
            const ifr = document.querySelector('.gjs-cv-canvas iframe');
            const idoc = ifr && ifr.contentDocument;
            const ed = window.__RB_EDITOR__.shell.build.ensure();
            const compH1 = ed.DomComponents.getWrapper()
                .components().models[0].components().models[0];
            compH1.components('WORKAROUND');
            ed.refresh();
            return { dom_after: idoc.querySelector('h1').textContent };
        }""")
        print(f"\n  workaround cc.components('WORKAROUND') -> DOM: {wk['dom_after']!r}")

        # ---- Finding B: Enter does not commit ---------------------------
        page.evaluate("""() => {
            const ed = window.__RB_EDITOR__.shell.build.ensure();
            ed.setComponents('<section><h1>HEADING-B</h1></section>');
            ed.UndoManager.clear();
        }""")
        page.wait_for_timeout(400)
        gjs_frame = page.frame_locator('.gjs-cv-canvas iframe')
        before = gjs_frame.locator('h1').first.inner_text()
        gjs_frame.locator('h1').first.dblclick()
        page.wait_for_timeout(300)
        gjs_frame.locator('h1').first.press("Control+a")
        gjs_frame.locator('h1').first.type("TYPED-BUT-NOT-COMMITTED")
        page.keyboard.press("Enter")
        page.wait_for_timeout(400)
        after_enter = gjs_frame.locator('h1').first.inner_text()
        in_model = "TYPED-BUT-NOT-COMMITTED" in page.evaluate(
            "() => window.__RB_EDITOR__.shell.build.ensure().getHtml()"
        )
        print("\n=== Finding B: Enter does not commit inline edit ===")
        print(f"  h1 before:           {before!r}")
        print(f"  h1 after Enter:      {after_enter!r}")
        print(f"  text in model html?  {in_model}")

        # Now commit via blur
        page.locator('[data-testid="canvas-wrap"]').click(position={"x": 5, "y": 5})
        page.wait_for_timeout(500)
        after_blur = gjs_frame.locator('h1').first.inner_text()
        print(f"  h1 after blur (commit): {after_blur!r}")

        ctx.close()
        b.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
