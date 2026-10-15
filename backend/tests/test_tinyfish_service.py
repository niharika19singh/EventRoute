"""Tests for TinyFish service."""

import pytest
from app.services.tinyfish_service import tinyfish_service


def test_tinyfish_status():
    status = tinyfish_service.get_status()
    assert "configured" in status
    assert "masked_key" in status
    assert "cache_entries" in status


def test_masked_key_format():
    # If unconfigured
    if not tinyfish_service.is_configured():
        assert tinyfish_service.get_masked_key() is None
    else:
        k = tinyfish_service.get_masked_key()
        assert "..." in k


import asyncio

def test_tinyfish_discovery_pipeline():
    result = asyncio.run(tinyfish_service.run_discovery_pipeline("Delhi tech hackathon 2026"))
    assert "events" in result
    assert result["events_count"] > 0
    assert "query" in result
    assert "timestamp" in result
    for ev in result["events"]:
        assert "title" in ev
        assert "coordinates" in ev
        assert "source_url" in ev
        assert "retrieval_timestamp" in ev

