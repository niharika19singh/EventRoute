"""Pydantic schemas and data validation models for EventRoute."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, field_validator


class Coordinates(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude")
    lng: float = Field(..., ge=-180.0, le=180.0, description="Longitude")


class College(BaseModel):
    id: str
    name: str
    short_name: str
    city: str
    state: str
    coordinates: Coordinates
    address: str
    website: Optional[str] = None
    campus_type: Optional[str] = "Engineering / Technology"


class EventBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=250)
    host_college: str = Field(..., min_length=2, max_length=200)
    college_id: Optional[str] = None
    venue: str = Field(..., min_length=2, max_length=300)
    coordinates: Coordinates
    start_date: str = Field(..., description="Start date/time in ISO or human-readable format")
    end_date: Optional[str] = None
    category: str = Field("Hackathon", description="Hackathon, Tech Fest, Cultural, Workshop, Sports, Conference, Symposium, Other")
    eligibility: str = Field("Open to all college students", max_length=300)
    description: str = Field(..., min_length=10)
    registration_url: str = Field(..., min_length=5)
    prize_pool: Optional[str] = None
    source_url: str = Field(..., min_length=5)
    retrieval_timestamp: str
    source_type: str = Field("curated_archive", description="live_tinyfish or curated_archive")
    is_verified: bool = True
    tags: List[str] = Field(default_factory=list)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        allowed = {
            "Hackathon", "Tech Fest", "Cultural", "Workshop",
            "Sports", "Conference", "Symposium", "Other"
        }
        for item in allowed:
            if item.lower() in v.lower():
                return item
        return "Other"


class EventCreate(EventBase):
    pass


class Event(EventBase):
    id: str
    distance_km: Optional[float] = None
    travel_time_mins: Optional[float] = None


class EventFilterParams(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    max_distance_km: Optional[float] = None
    timeframe: Optional[str] = None  # upcoming, this_week, this_month, all
    saved_ids: Optional[List[str]] = None


class RouteStep(BaseModel):
    instruction: str
    distance_m: float
    duration_s: float
    name: str = ""


class RouteRequest(BaseModel):
    origin_name: Optional[str] = "Origin"
    origin_lat: float = Field(..., ge=-90.0, le=90.0)
    origin_lng: float = Field(..., ge=-180.0, le=180.0)
    destination_name: Optional[str] = "Destination"
    destination_lat: float = Field(..., ge=-90.0, le=90.0)
    destination_lng: float = Field(..., ge=-180.0, le=180.0)
    mode: Optional[str] = "driving"  # driving, transit, bicycling


class RouteResponse(BaseModel):
    origin_name: str
    origin_coordinates: Coordinates
    destination_name: str
    destination_coordinates: Coordinates
    distance_km: float
    duration_mins: float
    duration_text: str
    polyline: List[List[float]] = Field(..., description="List of [lat, lng] coordinates along route")
    steps: List[RouteStep] = Field(default_factory=list)
    provider: str = Field("osrm", description="osrm or haversine_direct")
    is_simulated: bool = False
    warning: Optional[str] = None


class TinyFishSearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    purpose: Optional[str] = "Discover college hackathons, tech fests, and cultural events"
    location: Optional[str] = "IN"


class TinyFishFetchRequest(BaseModel):
    urls: List[str] = Field(..., min_length=1)
    purpose: Optional[str] = "Extract event title, dates, venue, eligibility, description, registration link"


class TinyFishStatus(BaseModel):
    configured: bool
    masked_key: Optional[str]
    cache_entries: int
    last_discovery_time: Optional[str] = None
    total_events_discovered: int = 0
