"""Event Processor Service for EventRoute.
Handles Normalization, Validation, Geocoding Resolution, and Deduplication of college events.
"""

import re
import hashlib
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone

from app.models.schemas import Event, EventCreate, Coordinates
from app.data.colleges_data import find_closest_college, get_college_by_id


CATEGORY_KEYWORDS = {
    "Workshop": ["workshop", "bootcamp", "hands-on", "masterclass", "training", "tutorial"],
    "Hackathon": ["hackathon", "hack", "datathon", "codefest", "ideathon", "makeathon", "devfest"],
    "Tech Fest": ["tech fest", "technical fest", "robotics", "drone", "coding", "innovision", "tryst", "invictus", "esya", "apogee"],
    "Cultural": ["cultural", "music", "dance", "theatre", "drama", "fashion", "moksha", "crossroads", "rendezvous"],
    "Sports": ["sports", "athletic", "cricket", "football", "basketball", "spardha", "tournament", "marathon"],
    "Conference": ["conference", "summit", "conclave", "keynote", "convention"],
    "Symposium": ["symposium", "paper presentation", "colloquium", "research summit"]
}



class EventProcessor:
    """Provides complete normalization, validation and deduplication for events."""

    @staticmethod
    def normalize_string(text: Optional[str]) -> str:
        """Strip markdown markup, extra spaces, and special HTML characters."""
        if not text:
            return ""
        # Remove markdown bold/italics/backticks
        cleaned = re.sub(r"[*_`#\[\]]", " ", text)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    @classmethod
    def classify_category(cls, title: str, description: str = "") -> str:
        """Classify event into one of the canonical categories."""
        combined = f"{title} {description}".lower()
        for cat, keywords in CATEGORY_KEYWORDS.items():
            for kw in keywords:
                if kw in combined:
                    return cat
        return "Other"


    @classmethod
    def resolve_college_and_coordinates(
        cls, college_name: str, venue: str = "", coords: Optional[Dict[str, float]] = None
    ) -> Tuple[str, Optional[str], Coordinates, str]:
        """
        Resolve host college and venue to known coordinates.
        Returns: (matched_college_name, college_id, Coordinates, resolved_venue)
        """
        # 1. Try to match college in directory
        matched = find_closest_college(college_name) or find_closest_college(venue)
        if matched:
            resolved_coords = Coordinates(
                lat=matched["coordinates"]["lat"],
                lng=matched["coordinates"]["lng"]
            )
            return (
                matched["name"],
                matched["id"],
                resolved_coords,
                venue or matched["address"]
            )

        # 2. If coordinates explicitly provided and valid
        if coords and "lat" in coords and "lng" in coords:
            try:
                lat = float(coords["lat"])
                lng = float(coords["lng"])
                if -90 <= lat <= 90 and -180 <= lng <= 180:
                    return (college_name, None, Coordinates(lat=lat, lng=lng), venue)
            except (ValueError, TypeError):
                pass

        # 3. Default fallback to Delhi Central / Connaught Place coordinates if not geocoded
        fallback_coords = Coordinates(lat=28.6315, lng=77.2167)
        return (college_name, None, fallback_coords, venue or f"{college_name} Campus")

    @classmethod
    def normalize_event_dict(cls, raw: Dict[str, Any], source_type: str = "live_tinyfish") -> Optional[Dict[str, Any]]:
        """Normalize raw incoming event data into a clean structure."""
        title = cls.normalize_string(raw.get("title") or raw.get("name") or "")
        if not title or len(title) < 3:
            return None

        college_name = cls.normalize_string(
            raw.get("host_college") or raw.get("college") or raw.get("organizer") or "University Campus"
        )
        venue = cls.normalize_string(raw.get("venue") or raw.get("location") or "")
        description = cls.normalize_string(raw.get("description") or raw.get("snippet") or "")
        if len(description) < 10:
            description = f"Annual inter-college event {title} hosted at {college_name}. Register now to participate."

        # Coordinates resolution
        coords_raw = raw.get("coordinates")
        matched_college, college_id, resolved_coords, resolved_venue = cls.resolve_college_and_coordinates(
            college_name, venue, coords_raw
        )

        # Category
        raw_cat = raw.get("category")
        category = raw_cat if raw_cat and raw_cat in CATEGORY_KEYWORDS else cls.classify_category(title, description)

        # Dates
        now_iso = datetime.now(timezone.utc).isoformat()
        start_date = raw.get("start_date") or raw.get("date") or now_iso
        end_date = raw.get("end_date")

        # Eligibility & Registration
        eligibility = cls.normalize_string(raw.get("eligibility") or "Open to all enrolled college students.")
        registration_url = raw.get("registration_url") or raw.get("url") or raw.get("link") or "https://unstop.com"
        source_url = raw.get("source_url") or raw.get("link") or raw.get("url") or "https://unstop.com"

        # Unique ID based on canonical hash
        fingerprint = cls.compute_fingerprint(title, matched_college, start_date)
        event_id = raw.get("id") or f"ev-{fingerprint[:12]}"

        tags = raw.get("tags") or []
        if not tags:
            tags = [category]
            if "hack" in title.lower():
                tags.append("Coding")

        return {
            "id": event_id,
            "title": title,
            "host_college": matched_college,
            "college_id": college_id,
            "venue": resolved_venue,
            "coordinates": {"lat": resolved_coords.lat, "lng": resolved_coords.lng},
            "start_date": str(start_date),
            "end_date": str(end_date) if end_date else None,
            "category": category,
            "eligibility": eligibility,
            "description": description,
            "registration_url": registration_url,
            "prize_pool": raw.get("prize_pool"),
            "source_url": source_url,
            "retrieval_timestamp": raw.get("retrieval_timestamp") or now_iso,
            "source_type": source_type,
            "is_verified": bool(raw.get("is_verified", True)),
            "tags": tags,
        }

    @staticmethod
    def compute_fingerprint(title: str, college: str, date_str: str) -> str:
        """Create a collision-resistant canonical hash for deduplication."""
        norm_title = re.sub(r"[^a-z0-9]", "", title.lower())[:30]
        norm_college = re.sub(r"[^a-z0-9]", "", college.lower())[:20]
        norm_date = re.sub(r"[^a-z0-9]", "", str(date_str).lower())[:10]
        token = f"{norm_title}|{norm_college}|{norm_date}"
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    @classmethod
    def deduplicate_events(cls, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deduplicate events using title + college + date fingerprint and URL tracking.
        Retains the richer record if duplicate occurs.
        """
        seen_fingerprints: Dict[str, Dict[str, Any]] = {}
        seen_urls: Dict[str, str] = {}

        for ev in events:
            fp = cls.compute_fingerprint(
                ev.get("title", ""),
                ev.get("host_college", ""),
                ev.get("start_date", "")
            )
            reg_url = ev.get("registration_url", "").strip().lower()

            # Check if duplicate fingerprint already recorded
            if fp in seen_fingerprints:
                existing = seen_fingerprints[fp]
                # Merge or keep the one with longer description or verified status
                if len(ev.get("description", "")) > len(existing.get("description", "")):
                    seen_fingerprints[fp] = ev
            elif reg_url and reg_url in seen_urls and reg_url != "https://unstop.com":
                # Same direct registration URL - likely identical event
                existing_fp = seen_urls[reg_url]
                if existing_fp in seen_fingerprints:
                    existing = seen_fingerprints[existing_fp]
                    if len(ev.get("description", "")) > len(existing.get("description", "")):
                        seen_fingerprints[existing_fp] = ev
            else:
                seen_fingerprints[fp] = ev
                if reg_url:
                    seen_urls[reg_url] = fp

        return list(seen_fingerprints.values())
