"""Tests for EventRoute FastAPI API endpoints."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "EventRoute — Navigate the Opportunity"
    assert "tinyfish" in data
    assert "endpoints" in data


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_list_events():
    response = client.get("/api/events")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    first = data[0]
    assert "title" in first
    assert "host_college" in first
    assert "venue" in first
    assert "coordinates" in first
    assert "registration_url" in first
    assert "source_url" in first
    assert "retrieval_timestamp" in first


def test_list_events_with_filters():
    # Filter by category
    response = client.get("/api/events?category=Hackathon")
    assert response.status_code == 200
    data = response.json()
    assert all("hackathon" in e["category"].lower() for e in data)

    # Filter by query
    response = client.get("/api/events?query=Tryst")
    assert response.status_code == 200
    data = response.json()
    assert any("tryst" in e["title"].lower() for e in data)

    # With origin coordinates for distance sorting
    response = client.get("/api/events?origin_lat=28.5459&origin_lng=77.2732&sort_by=distance")
    assert response.status_code == 200
    data = response.json()
    assert "distance_km" in data[0]
    assert data[0]["distance_km"] <= data[-1]["distance_km"]


def test_get_event_by_id():
    response = client.get("/api/events/ev-hackiiitd-2026")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "ev-hackiiitd-2026"
    assert data["host_college"] == "Indraprastha Institute of Information Technology Delhi"


def test_get_colleges():
    response = client.get("/api/colleges")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    ids = [c["id"] for c in data]
    assert "iiitd" in ids
    assert "iitd" in ids


def test_get_nearest_colleges():
    response = client.get("/api/colleges/nearest?lat=28.5459&lng=77.2732&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["id"] == "iiitd"


def test_calculate_route_endpoint():
    payload = {
        "origin_name": "IIIT Delhi",
        "origin_lat": 28.5459,
        "origin_lng": 77.2732,
        "destination_name": "IIT Delhi",
        "destination_lat": 28.5450,
        "destination_lng": 77.1926,
    }
    response = client.post("/api/route", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["origin_name"] == "IIIT Delhi"
    assert data["destination_name"] == "IIT Delhi"
    assert data["distance_km"] > 0
    assert "duration_text" in data
    assert len(data["polyline"]) > 0


def test_tinyfish_status_endpoint():
    response = client.get("/api/tinyfish/status")
    assert response.status_code == 200
    data = response.json()
    assert "configured" in data


def test_tinyfish_discover_endpoint():
    response = client.post("/api/tinyfish/discover?query=hackathon&add_to_catalog=true")
    assert response.status_code == 200
    data = response.json()
    assert "events" in data
    assert data["events_count"] > 0
