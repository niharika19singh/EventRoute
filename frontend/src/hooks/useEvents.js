import { useState, useEffect, useCallback } from 'react';
import { fetchEvents } from '../services/api';

const SAVED_EVENTS_KEY = 'eventroute_saved_ids';

export function useEvents(originCollege) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPartial, setIsPartial] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = localStorage.getItem(SAVED_EVENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        query: searchQuery,
        category: selectedCategory,
        max_distance_km: maxDistanceKm,
        sort_by: sortBy,
      };

      if (originCollege?.coordinates) {
        params.origin_lat = originCollege.coordinates.lat;
        params.origin_lng = originCollege.coordinates.lng;
      }

      const data = await fetchEvents(params);
      setEvents(data);
      setIsPartial(false);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, maxDistanceKm, sortBy, originCollege]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const toggleSaveEvent = (eventId) => {
    setSavedIds((prev) => {
      const next = prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId];
      try {
        localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
      return next;
    });
  };

  const isSaved = (eventId) => savedIds.includes(eventId);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMaxDistanceKm(null);
    setSortBy('date');
  };

  return {
    events,
    loading,
    error,
    isPartial,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    maxDistanceKm,
    setMaxDistanceKm,
    sortBy,
    setSortBy,
    savedIds,
    toggleSaveEvent,
    isSaved,
    reload: loadEvents,
    resetFilters,
  };
}
