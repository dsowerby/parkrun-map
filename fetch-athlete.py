#!/usr/bin/env python3

from playwright.sync_api import sync_playwright
import json
import sys
from pathlib import Path

def extract_results_links(athlete_id):
    url = f"https://www.parkrun.org.uk/parkrunner/{athlete_id}/all/"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=100)
        page = browser.new_page()
        page.goto(url, wait_until="networkidle")

        links = page.eval_on_selector_all(
            "a[href]",
            """els => {
                const pattern = /^(https?:\\/\\/[^/]+\\/([^/]+)\\/results\\/)$/;
                const matches = els
                  .map(el => el.href.match(pattern))
                  .filter(m => m)
                  .map(m => m[2]);
                return [...new Set(matches)].sort();
            }"""
        )

        browser.close()
        return links

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <ATHLETE_ID>")
        sys.exit(1)

    athlete_id = sys.argv[1]
    data = extract_results_links(athlete_id)

    # Determine output path relative to script location
    script_dir = Path(__file__).resolve().parent
    output_path = script_dir / "docs" / "athletes" / f"{athlete_id}.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w") as f:
        json.dump(data, f)

    print(f"Saved {len(data)} entries to {output_path}")
