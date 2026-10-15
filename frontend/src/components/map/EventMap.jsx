import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Calendar, Award, ExternalLink, ArrowRight } from 'lucide-react';
import CategoryBadge from '../shared/CategoryBadge';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Category Colors for markers
const CATEGORY_HEX = {
  Hackathon: '#10B981',
  'Tech Fest': '#6366F1',
  Cultural: '#EC4899',
  Workshop: '#F59E0B',
  Sports: '#F97316',
  Conference: '#06B6D4',
  Symposium: '#A855F7',
  Other: '#8B5CF6',
};

function createOriginIcon(name = 'Your Campus') {
  return L.divIcon({
    className: 'custom-origin-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="origin-marker-pulse absolute w-10 h-10 rounded-full bg-indigo-500/30"></div>
        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 border-2 border-white shadow-lg flex items-center justify-center text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}

function createVenueIcon(category = 'Hackathon', isSelected = false) {
  const color = CATEGORY_HEX[category] || '#6366F1';
  const size = isSelected ? 36 : 28;
  const innerSize = isSelected ? 24 : 18;

  return L.divIcon({
    className: 'custom-venue-marker',
    html: `
      <div class="relative flex items-center justify-center transition-transform hover:scale-110">
        ${isSelected ? `<div class="absolute w-10 h-10 rounded-full bg-white/20 animate-ping"></div>` : ''}
        <div style="background-color: ${color}; width: ${innerSize}px; height: ${innerSize}px;"
             class="rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-[10px]">
          ●
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Recenter Map Helper
function MapRecenter({ center, bounds, routePolyline }) {
  const map = useMap();

  useEffect(() => {
    if (routePolyline && routePolyline.length > 1) {
      try {
        const polylineBounds = L.latLngBounds(routePolyline);
        map.fitBounds(polylineBounds, { padding: [50, 50], maxZoom: 15, animate: true });
      } catch (e) {
        console.warn('fitBounds error:', e);
      }
    } else if (center) {
      map.setView(center, map.getZoom() || 13, { animate: true });
    }
  }, [center, routePolyline, map]);

  return null;
}

export default function EventMap({
  originCollege,
  events,
  selectedEvent,
  onSelectEvent,
  onPlanJourney,
  activeRoute,
  height = '100%',
}) {
  const defaultCenter = [28.5459, 77.2732]; // Default to IIIT Delhi
  const center = originCollege?.coordinates
    ? [originCollege.coordinates.lat, originCollege.coordinates.lng]
    : defaultCenter;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-route-border shadow-2xl" style={{ height }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%', background: '#090D16' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        <MapRecenter center={center} routePolyline={activeRoute?.polyline} />

        {/* Origin College Marker */}
        {originCollege?.coordinates && (
          <Marker
            position={[originCollege.coordinates.lat, originCollege.coordinates.lng]}
            icon={createOriginIcon(originCollege.short_name)}
          >
            <Popup>
              <div className="p-1 space-y-1.5 min-w-[180px]">
                <div className="text-[10px] uppercase font-bold text-route-primaryLight tracking-wider">
                  Origin Campus
                </div>
                <h4 className="font-bold text-sm text-white">{originCollege.name}</h4>
                <p className="text-xs text-route-muted">{originCollege.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Event Venue Markers */}
        {events.map((ev) => {
          if (!ev.coordinates?.lat || !ev.coordinates?.lng) return null;
          const isSelected = selectedEvent?.id === ev.id;

          return (
            <Marker
              key={ev.id}
              position={[ev.coordinates.lat, ev.coordinates.lng]}
              icon={createVenueIcon(ev.category, isSelected)}
              eventHandlers={{
                click: () => onSelectEvent?.(ev),
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 min-w-[220px]">
                  <div className="flex items-center justify-between gap-2">
                    <CategoryBadge category={ev.category} size="xs" />
                    {ev.distance_km != null && (
                      <span className="text-[11px] font-mono font-bold text-route-primaryLight">
                        {ev.distance_km} km away
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-white line-clamp-2 leading-snug">{ev.title}</h4>

                  <p className="text-xs text-route-muted font-medium">{ev.host_college}</p>

                  <div className="pt-2 border-t border-route-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => onPlanJourney?.(ev)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-route-primary hover:bg-route-primaryLight text-white text-[11px] font-semibold transition-all shadow-glow"
                    >
                      <Navigation size={11} />
                      <span>Plan Route</span>
                    </button>

                    <button
                      onClick={() => onSelectEvent?.(ev)}
                      className="text-xs text-route-primaryLight hover:underline font-medium"
                    >
                      Details →
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Active Journey Route Polyline */}
        {activeRoute?.polyline && activeRoute.polyline.length > 1 && (
          <Polyline
            positions={activeRoute.polyline}
            pathOptions={{
              color: '#06B6D4',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
