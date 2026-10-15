"""Tests for RoutingService and distance calculations."""

import pytest
from app.services.routing_service import (
    calculate_haversine_distance_km,
    format_duration,
    routing_service,
)


def test_haversine_distance_iiitd_to_iitd():
    # IIIT Delhi: 28.5459, 77.2732
    # IIT Delhi: 28.5450, 77.1926
    dist = calculate_haversine_distance_km(28.5459, 77.2732, 28.5450, 77.1926)
    # Direct great-circle distance is approximately 7.8 - 8.0 km
    assert 7.0 < dist < 9.0


def test_format_duration():
    assert format_duration(25.3) == "25 mins"
    assert format_duration(60.0) == "1 hr"
    assert format_duration(85.0) == "1 hr 25 mins"


import asyncio

def test_calculate_route():
    route = asyncio.run(routing_service.calculate_route(
        origin_lat=28.5459,
        origin_lng=77.2732,
        destination_lat=28.5450,
        destination_lng=77.1926,
        origin_name="IIIT Delhi",
        destination_name="IIT Delhi",
    ))
    assert route.origin_name == "IIIT Delhi"
    assert route.destination_name == "IIT Delhi"
    assert route.distance_km > 5.0
    assert route.duration_mins > 5.0
    assert len(route.polyline) >= 2
    assert len(route.steps) >= 1

