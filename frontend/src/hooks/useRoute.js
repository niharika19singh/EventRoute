import { useState, useCallback } from 'react';
import { calculateRoute } from '../services/api';

export function useRoute(originCollege) {
  const [activeRoute, setActiveRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [targetEvent, setTargetEvent] = useState(null);

  const planJourney = useCallback(
    async (event) => {
      if (!originCollege?.coordinates || !event?.coordinates) return;

      setLoadingRoute(true);
      setRouteError(null);
      setTargetEvent(event);

      try {
        const payload = {
          origin_name: originCollege.short_name || originCollege.name,
          origin_lat: originCollege.coordinates.lat,
          origin_lng: originCollege.coordinates.lng,
          destination_name: event.venue || event.host_college,
          destination_lat: event.coordinates.lat,
          destination_lng: event.coordinates.lng,
          mode: 'driving',
        };

        const res = await calculateRoute(payload);
        setActiveRoute(res);
      } catch (err) {
        console.error('Route calculation error:', err);
        setRouteError(err.message || 'Unable to calculate route');
      } finally {
        setLoadingRoute(false);
      }
    },
    [originCollege]
  );

  const clearRoute = () => {
    setActiveRoute(null);
    setTargetEvent(null);
    setRouteError(null);
  };

  return {
    activeRoute,
    loadingRoute,
    routeError,
    targetEvent,
    planJourney,
    clearRoute,
  };
}
