"""Tests for EventProcessor service."""

import pytest
from app.services.event_processor import EventProcessor


def test_normalize_string():
    raw = "  **Hackathon** 2026 `Codefest`  #Delhi  "
    cleaned = EventProcessor.normalize_string(raw)
    assert cleaned == "Hackathon 2026 Codefest Delhi"


def test_classify_category():
    assert EventProcessor.classify_category("HackIIITD 2026", "Build AI tools") == "Hackathon"
    assert EventProcessor.classify_category("Tryst Robotics League", "") == "Tech Fest"
    assert EventProcessor.classify_category("Moksha Dance Fest", "") == "Cultural"
    assert EventProcessor.classify_category("Full-stack Development Bootcamp", "Hands-on workshop") == "Workshop"
    assert EventProcessor.classify_category("Inter-College Football Tournament", "") == "Sports"
    assert EventProcessor.classify_category("Random Student Gathering", "") == "Other"


def test_resolve_college_and_coordinates():
    college, cid, coords, venue = EventProcessor.resolve_college_and_coordinates("IIIT Delhi")
    assert cid == "iiitd"
    assert 28.5 < coords.lat < 28.6
    assert 77.2 < coords.lng < 77.3

    # Custom coordinate fallback
    custom_coords = {"lat": 19.0760, "lng": 72.8777}
    college, cid, coords, venue = EventProcessor.resolve_college_and_coordinates("Unknown College", coords=custom_coords)
    assert coords.lat == 19.0760
    assert coords.lng == 72.8777


def test_normalize_event_dict():
    raw = {
        "title": "  **CodeStorm 2026**  ",
        "college": "DTU",
        "description": "Annual 24-hour hackathon for student developers across North India.",
        "url": "https://unstop.com/codestorm",
    }
    norm = EventProcessor.normalize_event_dict(raw, source_type="live_tinyfish")
    assert norm is not None
    assert norm["title"] == "CodeStorm 2026"
    assert norm["college_id"] == "dtu"
    assert norm["category"] == "Hackathon"
    assert norm["source_type"] == "live_tinyfish"
    assert "lat" in norm["coordinates"]
    assert "lng" in norm["coordinates"]


def test_deduplicate_events():
    events = [
        {
            "id": "1",
            "title": "HackIIITD 2026",
            "host_college": "IIIT Delhi",
            "start_date": "2026-10-24T09:00:00Z",
            "description": "Short description",
            "registration_url": "https://hackiiitd.devfolio.co",
        },
        {
            "id": "2",
            "title": "HackIIITD 2026 — Annual Flagship Hackathon",
            "host_college": "Indraprastha Institute of Information Technology Delhi",
            "start_date": "2026-10-24T09:00:00Z",
            "description": "A much longer and comprehensive description with mentorship and prizes",
            "registration_url": "https://hackiiitd.devfolio.co",
        },
        {
            "id": "3",
            "title": "Invictus DTU 2026",
            "host_college": "DTU",
            "start_date": "2026-10-30T10:00:00Z",
            "description": "Technical fest",
            "registration_url": "https://unstop.com/invictus",
        },
    ]

    deduped = EventProcessor.deduplicate_events(events)
    # The two HackIIITD records should be deduplicated into one, retaining the richer description
    assert len(deduped) == 2
    hack_ev = next(e for e in deduped if "hack" in e["title"].lower())
    assert "comprehensive" in hack_ev["description"]
