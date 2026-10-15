"""Spatial Service for EventRoute using NumPy and optional GeoPandas.
Provides vectorized geographic distance calculations, bounding box indexing,
and nearest-college / nearest-event queries.
"""

import math
from typing import List, Dict, Any, Tuple
import numpy as np

# Optional GeoPandas import
try:
    import geopandas as gpd
    from shapely.geometry import Point
    HAS_GEOPANDAS = True
except ImportError:
    HAS_GEOPANDAS = False


class SpatialService:
    """NumPy-accelerated spatial calculations and distance matrix computation."""

    @staticmethod
    def haversine_vectorized(
        origin_lat: float, origin_lng: float, target_lats: np.ndarray, target_lngs: np.ndarray
    ) -> np.ndarray:
        """
        Vectorized Haversine distance computation between one origin and multiple target points.
        Returns distances in kilometers.
        """
        R = 6371.0  # Earth radius in kilometers

        lat1 = np.radians(origin_lat)
        lon1 = np.radians(origin_lng)
        lat2 = np.radians(target_lats)
        lon2 = np.radians(target_lngs)

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = np.sin(dlat / 2.0) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0) ** 2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))

        return np.round(R * c, 2)

    @classmethod
    def calculate_event_distances(
        cls, origin_lat: float, origin_lng: float, events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Annotate events with distance_km and travel_time_mins relative to an origin.
        Uses NumPy for batch vector calculation.
        """
        if not events:
            return []

        lats = np.array([e["coordinates"]["lat"] for e in events], dtype=np.float64)
        lngs = np.array([e["coordinates"]["lng"] for e in events], dtype=np.float64)

        distances = cls.haversine_vectorized(origin_lat, origin_lng, lats, lngs)

        # Average urban driving speed ~28 km/h + 1.25 urban road factor
        est_times = np.round((distances * 1.25 / 28.0) * 60, 1)

        enriched = []
        for i, ev in enumerate(events):
            item = dict(ev)
            item["distance_km"] = float(distances[i])
            item["travel_time_mins"] = float(est_times[i])
            enriched.append(item)

        return enriched

    @classmethod
    def filter_by_radius(
        cls,
        origin_lat: float,
        origin_lng: float,
        events: List[Dict[str, Any]],
        max_distance_km: float,
    ) -> List[Dict[str, Any]]:
        """Filter events located within max_distance_km using bounding box + distance calculation."""
        if not events or max_distance_km <= 0:
            return events

        # Bounding box fast-check in degrees (approx 1 deg lat = 111 km)
        lat_delta = max_distance_km / 110.574
        lng_delta = max_distance_km / (111.320 * math.cos(math.radians(origin_lat)))

        min_lat, max_lat = origin_lat - lat_delta, origin_lat + lat_delta
        min_lng, max_lng = origin_lng - lng_delta, origin_lng + lng_delta

        # Step 1: Pre-filter candidates inside bounding box
        candidates = [
            e for e in events
            if min_lat <= e["coordinates"]["lat"] <= max_lat
            and min_lng <= e["coordinates"]["lng"] <= max_lng
        ]

        if not candidates:
            return []

        # Step 2: Accurate vectorized distance filtering
        enriched = cls.calculate_event_distances(origin_lat, origin_lng, candidates)
        return [e for e in enriched if e["distance_km"] <= max_distance_km]

    @classmethod
    def find_nearest_colleges(
        cls, origin_lat: float, origin_lng: float, colleges: List[Dict[str, Any]], k: int = 5
    ) -> List[Dict[str, Any]]:
        """Find the k nearest colleges to a given origin using NumPy sorting."""
        if not colleges:
            return []

        lats = np.array([c["coordinates"]["lat"] for c in colleges], dtype=np.float64)
        lngs = np.array([c["coordinates"]["lng"] for c in colleges], dtype=np.float64)

        distances = cls.haversine_vectorized(origin_lat, origin_lng, lats, lngs)
        sorted_indices = np.argsort(distances)[:k]

        nearest = []
        for idx in sorted_indices:
            col = dict(colleges[idx])
            col["distance_km"] = float(distances[idx])
            nearest.append(col)

        return nearest


spatial_service = SpatialService()
