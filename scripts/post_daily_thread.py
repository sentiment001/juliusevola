#!/usr/bin/env python3
"""Post today's English day-page body as a short-line Twitter/X thread via Buffer."""
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

CHANNEL_ID = "6ab08ad1ea19ca0bde9f089f"
TZ = ZoneInfo("America/Toronto")
START_ON = date(2026, 10, 1)
SITE = "https://evoladaily.com"
BUFFER_ENDPOINT = "https://api.buffer.com"
UA = {"User-Agent": "EvolaDaily-BufferBot/1.0"}
LAST_POSTED = Path("quotes/last_thread.txt")
MAX_CHARS = 250  # safe under free-account 280


def die(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(code)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def parse_body(html: str) -> list[str]:
    """Return the text of each body paragraph after the quote."""
    # Drop everything up to and including the quote block
    parts = re.split(r'<div class="quote">.*?</div>', html, maxsplit=1, flags=re.S)
    body_html = parts[1] if len(parts) > 1 else html
    paras = re.findall(r"<p>(.*?)</p>", body_html, flags=re.S)
    cleaned = []
    for p in paras:
        text = re.sub(r"<[^>]+>", "", p)
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            cleaned.append(text)
    return cleaned


def chunk_paragraphs(paragraphs: list[str]) -> list[str]:
    """Group text into tweets of roughly two lines / under MAX_CHARS."""
    tweets: list[str] = []
    current = ""
    for para in paragraphs:
        # Split long paragraphs into sentences if needed
        sentences = re.split(r"(?<=[.!?])\s+", para)
        for sent in sentences:
            sent = sent.strip()
            if not sent:
                continue
            candidate = (current + " " + sent).strip() if current else sent
            if len(candidate) <= MAX_CHARS:
                current = candidate
            else:
                if current:
                    tweets.append(current)
                # If a single sentence is still too long, hard-wrap it
                if len(sent) > MAX_CHARS:
                    words = sent.split()
                    buf = ""
                    for w in words:
                        test = (buf + " " + w).strip()
                        if len(test) <= MAX_CHARS:
                            buf = test
                        else:
                            if buf:
                                tweets.append(buf)
                            buf = w
                    current = buf
                else:
                    current = sent
    if current:
        tweets.append(current)
    # Prefer roughly two short lines: if a tweet is very long, leave it; otherwise keep as-is
    return [t for t in tweets if t]


def buffer_thread(token: str, tweets: list[str]) -> None:
    if not tweets:
        die("no tweets to post")
    thread_items = [{"text": t} for t in tweets]
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
                "text": tweets[0],
                "channelId": CHANNEL_ID,
                "schedulingType": "automatic",
                "mode": "shareNow",
                "metadata": {
                    "twitter": {
                        "thread": thread_items
                    }
                },
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
    print("posted thread", post.get("id"), post.get("status"))


def already_posted(doy: int) -> bool:
    if not LAST_POSTED.exists():
        return False
    try:
        return LAST_POSTED.read_text(encoding="utf-8").strip() == str(doy)
    except Exception:
        return False


def mark_posted(doy: int) -> None:
    LAST_POSTED.parent.mkdir(parents=True, exist_ok=True)
    LAST_POSTED.write_text(str(doy) + "\n", encoding="utf-8")


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
    if already_posted(doy):
        print(f"already posted thread for day {doy}; skipping")
        return
    page_url = f"{SITE}/day-{doy:02d}.html"
    html = fetch(page_url)
    paragraphs = parse_body(html)
    if not paragraphs:
        die(f"no body paragraphs on {page_url}")
    tweets = chunk_paragraphs(paragraphs)
    # Final tweet is the link only
    link_tweet = f"Full day: {SITE}/day-{doy:02d}"
    if len(link_tweet) <= MAX_CHARS:
        tweets.append(link_tweet)
    print(f"day {doy}: {len(tweets)} tweets")
    for i, t in enumerate(tweets, 1):
        print(f"  {i}: ({len(t)}) {t[:80]}...")
    buffer_thread(token, tweets)
    mark_posted(doy)


if __name__ == "__main__":
    main()
