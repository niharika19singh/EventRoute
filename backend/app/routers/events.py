"""Events API endpoints for EventRoute."""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status

from app.models.schemas import Event, EventCreate
from app.data.mock_events import get_all_mock_events
from app.services.event_processor import EventProcessor
from app.services.spatial_service import spatial_service

router = APIRouter(prefix="/api/events", tags=["events"])

# In-memory storage seeded with mock events
_in_memory_events: Dict[str, Dict[str, Any]] = {
    e["id"]: e for e in get_all_mock_events()
}


def get_current_events() -> List[Dict[str, Any]]:
    return list(_in_memory_events.values())


def add_discovered_events(new_events: List[Dict[str, Any]]) -> int:
    added = 0
    for ev in new_events:
        if ev["id"] not in _in_memory_events:
            _in_memory_events[ev["id"]] = ev
            added += 1
    return added


@router.get("", response_model=List[Dict[str, Any]])
async def list_events(
    query: Optional[str] = Query(None, description="Search keyword in title, college, tags or description"),
    category: Optional[str] = Query(None, description="Category filter (e.g. Hackathon, Tech Fest, Cultural, etc.)"),
    origin_lat: Optional[float] = Query(None, description="Origin latitude for distance computation"),
    origin_lng: Optional[float] = Query(None, description="Origin longitude for distance computation"),
    max_distance_km: Optional[float] = Query(None, ge=1.0, le=500.0, description="Max radius filter in kilometers"),
    sort_by: Optional[str] = Query("date", description="Sort by 'date', 'distance', or 'title'"),
):
    """
    Retrieve inter-college events with rich filtering, search, and spatial distance calculation.
    """
    events = get_current_events()

    # 1. Text Search Filter
    if query and query.strip():
        q = query.strip().lower()
        events = [
            e for e in events
            if q in e["title"].lower()
            or q in e["host_college"].lower()
            or q in e["venue"].lower()
            or q in e["description"].lower()
            or any(q in t.lower() for t in e.get("tags", []))
        ]

    # 2. Category Filter
    if category and category.lower() != "all":
        cat_lower = category.lower()
        events = [e for e in events if cat_lower in e.get("category", "").lower()]

    # 3. Spatial Distance Enrichment
    if origin_lat is not None and origin_lng is not None:
        events = spatial_service.calculate_event_distances(origin_lat, origin_lng, events)

        # 4. Radius Filter
        if max_distance_km is not None and max_distance_km > 0:
            events = [e for e in events if e.get("distance_km", 9999) <= max_distance_km]

    # 5. Sorting
    if sort_by == "distance" and origin_lat is not None:
        events.sort(key=lambda x: x.get("distance_km", 9999))
    elif sort_by == "title":
        events.sort(key=lambda x: x.get("title", "").lower())
    else:  # default date sort
        events.sort(key=lambda x: x.get("start_date", ""))

    return events


@router.get("/{event_id}", response_model=Dict[str, Any])
async def get_event(
    event_id: str,
    origin_lat: Optional[float] = Query(None),
    origin_lng: Optional[float] = Query(None),
):
    """Get single event by ID with optional distance from origin."""
    if event_id not in _in_memory_events:
        raise HTTPException(status_code=404, detail=f"Event with id '{event_id}' not found")

    ev = dict(_in_memory_events[event_id])
    if origin_lat is not None and origin_lng is not None:
        res = spatial_service.calculate_event_distances(origin_lat, origin_lng, [ev])
        return res[0]
    return ev


@router.post("", status_code=status.HTTP_201_CREATED, response_model=Dict[str, Any])
async def create_event(payload: EventCreate):
    """Normalize, validate, and register a new event."""
    norm = EventProcessor.normalize_event_dict(payload.model_dump(), source_type="user_submission")
    if not norm:
        raise HTTPException(status_code=400, detail="Invalid event payload")

    _in_memory_events[norm["id"]] = norm
    return norm
