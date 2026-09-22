#!/usr/bin/env python3
"""Render English quote cards for a day range and write quotes/day-NNN.png."""
from __future__ import annotations

import sys
from pathlib import Path

import post_daily_quote as q

START = 265
END = 273


def main() -> None:
    for day_n in range(START, END + 1):
        page_url = f"{q.SITE}/day-{day_n:02d}.html"
        html = q.fetch(page_url)
        title, quote, cite = q.parse_page(html)
        if not quote:
            raise SystemExit(f"no quote on {page_url}")
        dest = Path(f"quotes/day-{day_n:03d}.png")
        q.draw_card(day_n, quote, cite, page_url, dest)
        print(title)


if __name__ == "__main__":
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    main()
