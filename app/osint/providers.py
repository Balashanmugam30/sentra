from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from urllib.error import URLError
from urllib.request import urlopen
import json
import xml.etree.ElementTree as ET

from app.core.config import settings
from app.osint.news import demo_news_items


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _rss_items() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    feeds = [item.strip() for item in settings.rss_feeds.split(",") if item.strip()]
    for feed in feeds[:4]:
        with urlopen(feed, timeout=5) as response:
            root = ET.fromstring(response.read())
        channel = root.find("channel")
        if channel is None:
            continue
        for item in channel.findall("item")[:3]:
            title = item.findtext("title") or "RSS headline"
            description = item.findtext("description") or "Public feed update"
            link = item.findtext("link")
            items.append(
                {
                    "headline": title,
                    "source": feed,
                    "published_at": _now(),
                    "category": "rss",
                    "location_relevance": 55,
                    "severity": "medium",
                    "summary": description[:220],
                    "url": link,
                }
            )
    return items


def _gnews_items() -> list[dict[str, Any]]:
    if not settings.gnews_api_key:
        return []
    query = settings.city_keywords.split(",")[0].strip() or "incident"
    url = f"https://gnews.io/api/v4/search?q={query}&token={settings.gnews_api_key}&lang=en&max=5"
    with urlopen(url, timeout=5) as response:
        payload = json.loads(response.read().decode("utf-8"))
    items: list[dict[str, Any]] = []
    for article in payload.get("articles", [])[:5]:
        items.append(
            {
                "headline": article.get("title", "GNews headline"),
                "source": article.get("source", {}).get("name", "GNews"),
                "published_at": _now(),
                "category": "news",
                "location_relevance": 63,
                "severity": "medium",
                "summary": article.get("description") or "External news item",
                "url": article.get("url"),
            }
        )
    return items


def fetch_osint_provider_payload() -> dict[str, Any]:
    provider = settings.osint_provider.lower()
    if provider == "rss" and settings.rss_feeds:
        try:
            items = _rss_items()
            if items:
                return {"provider": "rss", "items": items, "updated_at": _now()}
        except (URLError, ET.ParseError, TimeoutError):
            pass
    if provider == "gnews" and settings.gnews_api_key:
        try:
            items = _gnews_items()
            if items:
                return {"provider": "gnews", "items": items, "updated_at": _now()}
        except (URLError, KeyError, ValueError, TimeoutError):
            pass

    return {"provider": "demo", "items": demo_news_items(), "updated_at": _now()}
