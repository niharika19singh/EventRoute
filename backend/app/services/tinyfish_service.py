"""TinyFish Web Agent Service for EventRoute.
Integrates TinyFish Search API & Fetch API for college event discovery.

Endpoints:
- Search: GET https://api.search.tinyfish.ai
- Fetch:  POST https://api.fetch.tinyfish.ai
"""

import os
import time
import re
import hashlib
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import httpx

from app.config import (
    TINYFISH_API_KEY,
    TINYFISH_TIMEOUT_SECONDS,
    CACHE_TTL_SECONDS
)
from app.services.event_processor import EventProcessor
from app.data.mock_events import get_all_mock_events

logger = logging.getLogger("eventroute.tinyfish")

TINYFISH_SEARCH_URL = "https://api.search.tinyfish.ai"
TINYFISH_FETCH_URL = "https://api.fetch.tinyfish.ai"


class TinyFishService:
    """Handles external search and fetch requests to TinyFish Web Agent."""

    def __init__(self):
        self._api_key: Optional[str] = TINYFISH_API_KEY or os.getenv("TINYFISH_API_KEY")
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._last_discovery_time: Optional[str] = None
        self._total_discovered: int = 0

    def reload_key(self):
        """Reload API key dynamically from environment."""
        self._api_key = os.getenv("TINYFISH_API_KEY") or None

    def is_configured(self) -> bool:
        """Check if a valid TinyFish API key is present."""
        if not self._api_key:
            self.reload_key()
        return bool(self._api_key and len(self._api_key.strip()) > 5)

    def get_masked_key(self) -> Optional[str]:
        """Return masked key for safe UI status reporting."""
        if not self._api_key:
            self.reload_key()
        if not self._api_key:
            return None
        k = self._api_key.strip()
        if len(k) <= 8:
            return "tf_***"
        return f"{k[:4]}...{k[-4:]}"

    def _get_cache_key(self, prefix: str, key_data: str) -> str:
        h = hashlib.md5(key_data.strip().lower().encode("utf-8")).hexdigest()
        return f"{prefix}:{h}"

    async def search_events(
        self, query: str, purpose: str = "Discover inter-college hackathons and technical fests"
    ) -> Dict[str, Any]:
        """Query TinyFish Search API with caching, timeout, and graceful failure handling."""
        cache_key = self._get_cache_key("search", query)
        now = time.time()

        # Check in-memory cache
        if cache_key in self._cache:
            entry = self._cache[cache_key]
            if now - entry["timestamp"] < CACHE_TTL_SECONDS:
                logger.info("[TinyFish] Cache hit for search query: %s", query)
                return entry["data"]

        if not self.is_configured():
            logger.info("[TinyFish] API key not configured. Using fallback event discovery.")
            return {
                "success": False,
                "error": "TINYFISH_API_KEY not configured",
                "results": [],
                "is_fallback": True,
            }

        headers = {
            "X-API-Key": self._api_key.strip(),
            "Accept": "application/json",
        }
        params = {
            "query": query,
            "purpose": purpose[:2000],
            "location": "IN",
            "recency_minutes": 10080,  # 7 days recency
        }

        try:
            async with httpx.AsyncClient(timeout=TINYFISH_TIMEOUT_SECONDS) as client:
                res = await client.get(TINYFISH_SEARCH_URL, headers=headers, params=params)
                if res.status_code == 200:
                    data = res.json()
                    out = {"success": True, "data": data, "is_fallback": False}
                    self._cache[cache_key] = {"timestamp": now, "data": out}
                    return out
                else:
                    logger.warning("[TinyFish] Search API returned HTTP %d: %s", res.status_code, res.text[:200])
                    return {
                        "success": False,
                        "status_code": res.status_code,
                        "error": res.text[:200],
                        "is_fallback": True,
                    }
        except httpx.TimeoutException:
            logger.warning("[TinyFish] Search API request timed out after %.1fs", TINYFISH_TIMEOUT_SECONDS)
            return {"success": False, "error": "TinyFish search timed out", "is_fallback": True}
        except Exception as e:
            logger.error("[TinyFish] Search error: %s", str(e))
            return {"success": False, "error": str(e), "is_fallback": True}

    async def fetch_urls(
        self, urls: List[str], purpose: str = "Extract college event title, date, venue, eligibility, description, registration URL"
    ) -> Dict[str, Any]:
        """Fetch clean markdown from target event URLs with strict timeout & limits."""
        if not self.is_configured() or not urls:
            return {"success": False, "error": "API key missing or empty URL list", "is_fallback": True}

        # Bound requests to max 3 URLs
        target_urls = urls[:3]
        headers = {
            "X-API-Key": self._api_key.strip(),
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        body = {
            "urls": target_urls,
            "format": "markdown",
            "purpose": purpose[:2000],
            "ttl": 3600,
            "per_url_timeout_ms": 7000,
        }

        try:
            async with httpx.AsyncClient(timeout=TINYFISH_TIMEOUT_SECONDS) as client:
                res = await client.post(TINYFISH_FETCH_URL, headers=headers, json=body)
                if res.status_code in (200, 201):
                    data = res.json()
                    return {"success": True, "data": data, "is_fallback": False}
                else:
                    logger.warning("[TinyFish] Fetch API returned HTTP %d: %s", res.status_code, res.text[:200])
                    return {
                        "success": False,
                        "status_code": res.status_code,
                        "error": res.text[:200],
                        "is_fallback": True,
                    }
        except httpx.TimeoutException:
            logger.warning("[TinyFish] Fetch API timed out")
            return {"success": False, "error": "TinyFish fetch timed out", "is_fallback": True}
        except Exception as e:
            logger.error("[TinyFish] Fetch error: %s", str(e))
            return {"success": False, "error": str(e), "is_fallback": True}

    def parse_event_from_markdown(self, url: str, title: str, markdown: str) -> Dict[str, Any]:
        """Extract structured event attributes from markdown content."""
        retrieval_time = datetime.now(timezone.utc).isoformat()

        # Date heuristic
        date_match = re.search(r"(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+202\d)", markdown, re.IGNORECASE)
        date_str = date_match.group(1) if date_match else "Upcoming 2026"

        # Prize pool heuristic
        prize_match = re.search(r"(?:₹|INR|Rs\.?)\s?([\d,]+(?:\s?(?:Lakh|Crore|k))?)", markdown, re.IGNORECASE)
        prize = f"₹{prize_match.group(1)}" if prize_match else None

        # Eligibility heuristic
        eligibility = "Open to undergraduate & postgraduate students."
        if "women" in markdown.lower() or "female" in markdown.lower():
            eligibility = "Special focus: Women in Tech / Diversity track"
        elif "teams of" in markdown.lower():
            m = re.search(r"(teams of \d+ to \d+)", markdown, re.IGNORECASE)
            if m:
                eligibility = f"Open to college teams ({m.group(1)})."

        # Snippet
        clean_md = re.sub(r"[\n\r]+", " ", markdown)[:300].strip()

        return {
            "title": title or "Inter-College Technical Event",
            "host_college": "Host Institute",
            "venue": "Campus Auditorium / Labs",
            "start_date": date_str,
            "category": EventProcessor.classify_category(title, clean_md),
            "eligibility": eligibility,
            "description": clean_md or "College event details extracted via TinyFish Web Agent.",
            "registration_url": url,
            "prize_pool": prize,
            "source_url": url,
            "retrieval_timestamp": retrieval_time,
            "source_type": "live_tinyfish",
            "is_verified": True,
        }

    async def run_discovery_pipeline(
        self, query: str = "Delhi college hackathon tech fest 2026"
    ) -> Dict[str, Any]:
        """
        Full workflow: Search -> Fetch top URLs -> Parse & Normalize -> Deduplicate.
        Provides graceful partial or fallback results if offline/unconfigured.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        discovered_events: List[Dict[str, Any]] = []
        source_urls: List[str] = []
        is_partial = False
        error_msg = None

        search_res = await self.search_events(query=query)

        if search_res.get("success") and search_res.get("data"):
            raw_data = search_res["data"]
            items = raw_data.get("results") or raw_data.get("items") or []

            urls_to_fetch = []
            item_map = {}

            for item in items[:4]:
                url = item.get("url") or item.get("link")
                title = item.get("title") or "College Event"
                snippet = item.get("snippet") or item.get("description") or ""
                if url:
                    urls_to_fetch.append(url)
                    item_map[url] = {"title": title, "snippet": snippet}
                    source_urls.append(url)

            # Step 2: Fetch
            if urls_to_fetch:
                fetch_res = await self.fetch_urls(urls=urls_to_fetch)
                if fetch_res.get("success") and fetch_res.get("data"):
                    fetched_docs = fetch_res["data"].get("results", [])
                    for doc in fetched_docs:
                        doc_url = doc.get("url") or urls_to_fetch[0]
                        md = doc.get("content") or doc.get("markdown") or item_map.get(doc_url, {}).get("snippet", "")
                        title = item_map.get(doc_url, {}).get("title", "Discovered College Event")
                        raw_ev = self.parse_event_from_markdown(doc_url, title, md)
                        norm_ev = EventProcessor.normalize_event_dict(raw_ev, source_type="live_tinyfish")
                        if norm_ev:
                            discovered_events.append(norm_ev)
                else:
                    # Fallback to search snippets if fetch timed out
                    is_partial = True
                    for url, meta in item_map.items():
                        raw_ev = {
                            "title": meta["title"],
                            "description": meta["snippet"],
                            "registration_url": url,
                            "source_url": url,
                            "retrieval_timestamp": now_iso,
                        }
                        norm_ev = EventProcessor.normalize_event_dict(raw_ev, source_type="live_tinyfish")
                        if norm_ev:
                            discovered_events.append(norm_ev)
        else:
            # Fallback mode: provide curated events matching the query keywords
            logger.info("[TinyFish] Falling back to curated inter-college event catalog.")
            all_mock = get_all_mock_events()
            q_lower = query.lower()
            matched = [
                e for e in all_mock
                if any(k in e["title"].lower() or k in e["category"].lower() or k in e["host_college"].lower() for k in q_lower.split())
            ]
            discovered_events = matched if matched else all_mock[:6]
            is_partial = not self.is_configured()
            error_msg = search_res.get("error") if self.is_configured() else "Operating in curated offline mode (API key not set)"

        # Normalize and Deduplicate
        deduped = EventProcessor.deduplicate_events(discovered_events)

        self._last_discovery_time = now_iso
        self._total_discovered += len(deduped)

        return {
            "query": query,
            "timestamp": now_iso,
            "events_count": len(deduped),
            "events": deduped,
            "source_urls": source_urls,
            "is_partial": is_partial,
            "is_fallback": not self.is_configured() or not search_res.get("success"),
            "error": error_msg,
        }

    def get_status(self) -> Dict[str, Any]:
        """Return diagnostic status for frontend health monitoring."""
        return {
            "configured": self.is_configured(),
            "masked_key": self.get_masked_key(),
            "cache_entries": len(self._cache),
            "last_discovery_time": self._last_discovery_time,
            "total_events_discovered": self._total_discovered,
        }


tinyfish_service = TinyFishService()
