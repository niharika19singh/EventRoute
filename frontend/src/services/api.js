/**
 * EventRoute Backend API Service Client
 * Handles communication with the FastAPI backend for events, routing, and TinyFish intelligence.
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';


export async function fetchColleges() {
  try {
    const res = await fetch(`${API_BASE}/colleges`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error fetching colleges:', err);
    return [];
  }
}

export async function fetchNearestColleges(lat, lng, limit = 1) {
  try {
    const res = await fetch(`${API_BASE}/colleges/nearest?lat=${lat}&lng=${lng}&limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error fetching nearest colleges:', err);
    return [];
  }
}


export async function fetchEvents(params = {}) {
  const query = new URLSearchParams();
  if (params.query) query.set('query', params.query);
  if (params.category && params.category !== 'all') query.set('category', params.category);
  if (params.origin_lat != null) query.set('origin_lat', params.origin_lat);
  if (params.origin_lng != null) query.set('origin_lng', params.origin_lng);
  if (params.max_distance_km) query.set('max_distance_km', params.max_distance_km);
  if (params.sort_by) query.set('sort_by', params.sort_by);

  const url = `${API_BASE}/events${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch events: HTTP ${res.status}`);
  return await res.json();
}

export async function fetchEventDetails(eventId, originCoords) {
  const query = new URLSearchParams();
  if (originCoords?.lat != null && originCoords?.lng != null) {
    query.set('origin_lat', originCoords.lat);
    query.set('origin_lng', originCoords.lng);
  }
  const url = `${API_BASE}/events/${eventId}${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch event: HTTP ${res.status}`);
  return await res.json();
}

export async function calculateRoute(payload) {
  const res = await fetch(`${API_BASE}/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Routing calculation failed: HTTP ${res.status}`);
  return await res.json();
}

export async function fetchTinyFishStatus() {
  try {
    const res = await fetch(`${API_BASE}/tinyfish/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { configured: false, masked_key: null, cache_entries: 0 };
  }
}

export async function triggerTinyFishDiscovery(query = 'Delhi college hackathon tech fest cultural 2026') {
  const res = await fetch(`${API_BASE}/tinyfish/discover?query=${encodeURIComponent(query)}&add_to_catalog=true`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Discovery failed: HTTP ${res.status}`);
  return await res.json();
}
