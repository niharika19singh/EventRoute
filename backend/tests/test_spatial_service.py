"""Tests for SpatialService using NumPy."""

import numpy as np
from app.services.spatial_service import spatial_service
from app.data.colleges_data import get_all_colleges
from app.data.mock_events import get_all_mock_events


def test_haversine_vectorized():
    origin_lat = 28.5459
    origin_lng = 77.2732
    target_lats = np.array([28.5450, 28.7499])
    target_lngs = np.array([77.1926, 77.1170])

    distances = spatial_service.haversine_vectorized(origin_lat, origin_lng, target_lats, target_lngs)
    assert len(distances) == 2
    assert 7.0 < distances[0] < 9.0  # IIT Delhi is ~8 km
    assert 25.0 < distances[1] < 35.0  # DTU is ~27 km


def test_calculate_event_distances():
    events = get_all_mock_events()[:5]
    enriched = spatial_service.calculate_event_distances(28.5459, 77.2732, events)
    assert len(enriched) == 5
    for ev in enriched:
        assert "distance_km" in ev
        assert "travel_time_mins" in ev
        assert ev["distance_km"] >= 0


def test_filter_by_radius():
    events = get_all_mock_events()
    # Filter within 15 km of IIIT Delhi
    filtered = spatial_service.filter_by_radius(28.5459, 77.2732, events, max_distance_km=15.0)
    assert len(filtered) > 0
    for ev in filtered:
        assert ev["distance_km"] <= 15.0


def test_find_nearest_colleges():
    colleges = get_all_colleges()
    nearest = spatial_service.find_nearest_colleges(28.5459, 77.2732, colleges, k=3)
    assert len(nearest) == 3
    # First should be IIIT Delhi itself (distance ~0 km)
    assert nearest[0]["id"] == "iiitd"
    assert nearest[0]["distance_km"] < 0.1
