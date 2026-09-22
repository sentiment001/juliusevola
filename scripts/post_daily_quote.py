#!/usr/bin/env python3
"""Build today's English quote card and publish it to Buffer / X."""
from __future__ import annotations

import json
import os
import re
import sys
import textwrap
import urllib.error
import urllib.request
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from PIL import Image, ImageDraw, ImageFont

CHANNEL_ID = "6ab08ad1ea19ca0bde9f089f"
TZ = ZoneInfo("America/Toronto")
START_ON = date(2026, 10, 1)
SITE = "https://evoladaily.com"
BUFFER_ENDPOINT = "https://api.buffer.com"
UA = {"User-Agent": "EvolaDaily-BufferBot/1.0"}

W = 1080
PAD_X = 80
PAD_TOP = 56
PAD_BOT = 52
BAR = 14
BG = (247, 243, 237)
INK = (26, 26, 26)
MUTED = (92, 92, 92)
URL_C = (120, 120, 120)
BAR_C = (139, 26, 26)


def die(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(code)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def pick_font(size: int, italic: bool = False):
    names = []
    if italic:
        names += [
            "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
        ]
    names += [
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
    ]
    for p in names:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def text_w(draw: ImageDraw.ImageDraw, text: str, font) -> int:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0]


def wrap(draw: ImageDraw.ImageDraw, text: str, font, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    line = ""
    for word in words:
        test = f"{line} {word}".strip()
        if text_w(draw, test, font) <= max_w:
            line = test
            continue
        if line:
            lines.append(line)
        if text_w(draw, word, font) <= max_w:
            line = word
            continue
        buf = ""
        for ch in word:
            nxt = buf + ch
            if buf and text_w(draw, nxt, font) > max_w:
                lines.append(buf)
                buf = ch
            else:
                buf = nxt
        line = buf
    if line:
        lines.append(line)
    return lines or [""]


def parse_page(html: str) -> tuple[str, str, str]:
    h2 = re.search(r"<h2>(.*?)</h2>", html, re.S)
    title = re.sub(r"<[^>]+>", "", h2.group(1)).strip() if h2 else ""
    m = re.search(r'<div class="quote">(.*?)</div>', html, re.S)
    block = m.group(1) if m else ""
    cite_m = re.search(r"<cite>(.*?)</cite>", block, re.S)
    cite = re.sub(r"<[^>]+>", "", cite_m.group(1)).strip() if cite_m else "\u2014 Julius Evola"
    body = re.sub(r"<cite>.*?</cite>", "", block, flags=re.S)
    body = re.sub(r"<[^>]+>", "", body)
    body = re.sub(r"\s+", " ", body).strip().strip('"\u201c\u201d')
    return title, body, cite


def draw_card(day_n: int, quote: str, cite: str, page_url: str, dest: Path) -> None:
    scratch = Image.new("RGB", (W, 200), BG)
    draw = ImageDraw.Draw(scratch)
    max_w = int((W - PAD_X * 2) * 0.96)
    quote_text = f"\u201c{quote}\u201d"
    size = 40
    lines: list[str] = []
    qfont = pick_font(size, italic=True)
    while size >= 28:
        qfont = pick_font(size, italic=True)
        lines = wrap(draw, quote_text, qfont, max_w)
        if len(lines) <= 8:
            break
        size -= 2
    if len(lines) > 8:
        lines = lines[:8]
        lines[-1] = lines[-1].rstrip(" \u201c\u201d.,;:") + "\u2026"
    line_h = int(size * 1.42)
    hfont = pick_font(26)
    cfont = pick_font(24)
    ufont = pick_font(20)
    cite_lines = wrap(draw, cite, cfont, max_w)
    header_h, cite_h, url_h = 32, 30, 24
    gap_h, gap_c, gap_u = 36, 40, 36
    H = (
        PAD_TOP
        + header_h
        + gap_h
        + line_h * len(lines)
        + gap_c
        + cite_h * len(cite_lines)
        + gap_u
        + url_h
        + PAD_BOT
    )
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, BAR, H), fill=BAR_C)
    header = f"Day {day_n} \u2014 Julius Evola Daily"
    d.text((PAD_X, PAD_TOP + 4), header, font=hfont, fill=MUTED)
    y = PAD_TOP + header_h + gap_h
    for line in lines:
        d.text((PAD_X, y), line, font=qfont, fill=INK)
        y += line_h
    y = PAD_TOP + header_h + gap_h + line_h * len(lines) + gap_c
    for line in cite_lines:
        d.text((PAD_X, y), line, font=cfont, fill=MUTED)
        y += cite_h
    uw = text_w(d, page_url, ufont)
    d.text((W - PAD_X - uw, H - PAD_BOT - 4), page_url, font=ufont, fill=URL_C)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "PNG", optimize=True)
    print("wrote", dest, dest.stat().st_size)


def buffer_post(token: str, text: str, image_url: str | None) -> None:
    assets = []
    if image_url:
        assets.append({"image": {"url": image_url}})
    payload = {
        "query": textwrap.dedent(
            """
            mutation CreatePost($input: CreatePostInput!) {
              createPost(input: $input) {
                ... on PostActionSuccess { post { id status dueAt text } }
                ... on MutationError { message }
              }
            }
            """
        ).strip(),
        "variables": {
            "input": {
                "text": text,
                "channelId": CHANNEL_ID,
                "schedulingType": "automatic",
                "mode": "shareNow",
                "assets": assets,
            }
        },
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        BUFFER_ENDPOINT,
        data=data,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "User-Agent": UA["User-Agent"],
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            body = json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        die(f"buffer http {e.code}: {e.read().decode('utf-8', 'replace')[:800]}")
    print(json.dumps(body, indent=2)[:2000])
    if body.get("errors"):
        die(f"buffer graphql errors: {body['errors']}")
    node = (body.get("data") or {}).get("createPost") or {}
    if node.get("message"):
        die(f"buffer mutation error: {node['message']}")
    post = node.get("post") or {}
    if not post.get("id"):
        die(f"buffer did not return a post id: {node}")
    print("posted", post.get("id"), post.get("status"))


def main() -> None:
    now = datetime.now(TZ)
    today = now.date()
    if os.environ.get("FORCE_RUN") != "1" and today < START_ON:
        print(f"skip until {START_ON.isoformat()} (today {today.isoformat()})")
        return
    token = os.environ.get("BUFFER_API_KEY", "").strip()
    if not token:
        die("BUFFER_API_KEY is missing")
    doy = int(now.strftime("%j"))
    page_url = f"{SITE}/day-{doy:02d}.html"
    html = fetch(page_url)
    title, quote, cite = parse_page(html)
    if not quote:
        die(f"no quote on {page_url}")
    tweet = "Julius Evola tweet of the day."
    dest = Path("quotes/today.png")
    draw_card(doy, quote, cite, page_url, dest)
    image_url = os.environ.get("QUOTE_IMAGE_URL", "").strip() or None
    buffer_post(token, tweet, image_url)


if __name__ == "__main__":
    main()
