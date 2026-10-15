import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import EventFilters from './components/dashboard/EventFilters';
import EventCard from './components/dashboard/EventCard';
import EventDetailsModal from './components/dashboard/EventDetailsModal';
import SavedEventsDrawer from './components/dashboard/SavedEventsDrawer';
import TinyFishDiscoverModal from './components/dashboard/TinyFishDiscoverModal';
import EventMap from './components/map/EventMap';
import RoutePlanPanel from './components/map/RoutePlanPanel';
import {
  LoadingSkeleton,
  EmptyState,
  ErrorBanner,
  PartialResultsBanner,
} from './components/shared/StateBanners';
import { useEvents } from './hooks/useEvents';
import { useRoute } from './hooks/useRoute';
import { fetchColleges, fetchTinyFishStatus } from './services/api';

export default function App() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [tinyfishStatus, setTinyfishStatus] = useState({ configured: false, masked_key: null });

  const [viewMode, setViewMode] = useState('split'); // 'split', 'grid', 'map'
  const [modalEvent, setModalEvent] = useState(null);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState(false);

  // Hook for events, filtering, search, and bookmarks
  const {
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
    reload: reloadEvents,
    resetFilters,
  } = useEvents(selectedCollege);

  // Hook for route calculation and journey planning
  const {
    activeRoute,
    loadingRoute,
    routeError,
    targetEvent,
    planJourney,
    clearRoute,
  } = useRoute(selectedCollege);

  // Load colleges and TinyFish status on startup
  useEffect(() => {
    async function init() {
      const colList = await fetchColleges();
      setColleges(colList);
      if (colList.length > 0) {
        // Default to IIIT Delhi
        const defaultCol = colList.find((c) => c.id === 'iiitd') || colList[0];
        setSelectedCollege(defaultCol);
      }

      const tf = await fetchTinyFishStatus();
      setTinyfishStatus(tf);
    }
    init();
  }, []);

  // Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const res = await fetch(`/api/colleges/nearest?lat=${lat}&lng=${lng}&limit=1`);
          if (res.ok) {
            const nearest = await res.json();
            if (nearest.length > 0) {
              setSelectedCollege(nearest[0]);
            }
          }
        } catch (e) {
          console.warn('Nearest college lookup error:', e);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        setIsDetectingLocation(false);
        alert('Could not determine current location. Defaulting to campus selection.');
      },
      { timeout: 8000 }
    );
  };

  // Find saved event objects
  const savedEvents = events.filter((e) => savedIds.includes(e.id));

  return (
    <div className="min-h-screen bg-route-bg text-route-text flex flex-col font-sans selection:bg-route-primary selection:text-white">
      {/* Header */}
      <Header
        colleges={colleges}
        selectedCollege={selectedCollege}
        onSelectCollege={setSelectedCollege}
        onDetectLocation={handleDetectLocation}
        isDetecting={isDetectingLocation}
        savedCount={savedIds.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        onOpenDiscover={() => setIsDiscoverModalOpen(true)}
        tinyfishStatus={tinyfishStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* Filter Toolbar */}
        <EventFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          maxDistanceKm={maxDistanceKm}
          onMaxDistanceChange={setMaxDistanceKm}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          totalCount={events.length}
        />

        {/* Status / Error / Partial Banners */}
        {error && <ErrorBanner message={error} onRetry={reloadEvents} />}
        {isPartial && <PartialResultsBanner count={events.length} />}
        {routeError && (
          <div className="mb-4 p-3 rounded-xl bg-route-danger/10 border border-route-danger/30 text-xs text-route-danger flex justify-between items-center">
            <span>Routing Notice: {routeError}</span>
            <button onClick={clearRoute} className="underline text-[11px] font-semibold">
              Dismiss
            </button>
          </div>
        )}

        {/* Content based on view mode */}
        {loading ? (
          <LoadingSkeleton />
        ) : events.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <div>
            {/* View Mode: Split Map & Cards */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Leaflet Map (7 cols) */}
                <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
                  <EventMap
                    originCollege={selectedCollege}
                    events={events}
                    selectedEvent={targetEvent}
                    onSelectEvent={setModalEvent}
                    onPlanJourney={planJourney}
                    activeRoute={activeRoute}
                    height="540px"
                  />

                  {/* Active Route Panel below map */}
                  {activeRoute && (
                    <RoutePlanPanel
                      route={activeRoute}
                      targetEvent={targetEvent}
                      onClose={clearRoute}
                    />
                  )}
                </div>

                {/* Right: Scrollable Cards (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-route-muted px-1">
                    <span>
                      Showing {events.length} events from{' '}
                      <strong className="text-white">{selectedCollege?.short_name || 'campus'}</strong>
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
                    {events.map((ev) => (
                      <EventCard
                        key={ev.id}
                        event={ev}
                        isSaved={isSaved(ev.id)}
                        onToggleSave={toggleSaveEvent}
                        onSelect={setModalEvent}
                        onPlanJourney={planJourney}
                        isSelected={targetEvent?.id === ev.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* View Mode: Full Cards Grid */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    isSaved={isSaved(ev.id)}
                    onToggleSave={toggleSaveEvent}
                    onSelect={setModalEvent}
                    onPlanJourney={planJourney}
                    isSelected={targetEvent?.id === ev.id}
                  />
                ))}
              </div>
            )}

            {/* View Mode: Full Map */}
            {viewMode === 'map' && (
              <div className="relative space-y-4">
                <EventMap
                  originCollege={selectedCollege}
                  events={events}
                  selectedEvent={targetEvent}
                  onSelectEvent={setModalEvent}
                  onPlanJourney={planJourney}
                  activeRoute={activeRoute}
                  height="calc(100vh - 220px)"
                />

                {/* Floating route panel over map */}
                {activeRoute && (
                  <div className="absolute top-4 right-4 z-[1000] w-full max-w-sm">
                    <RoutePlanPanel
                      route={activeRoute}
                      targetEvent={targetEvent}
                      onClose={clearRoute}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-route-border bg-route-surface/50 py-6 px-4 lg:px-8 mt-12 text-xs text-route-dim">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-route-text">EventRoute</span>
            <span>—</span>
            <span>Navigate the Opportunity. Inter-College Event Discovery & Journey Planning.</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Leaflet Maps & OSRM Routing</span>
            <span>•</span>
            <span>TinyFish Search & Fetch Web Agent</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <EventDetailsModal
        event={modalEvent}
        isOpen={Boolean(modalEvent)}
        onClose={() => setModalEvent(null)}
        isSaved={modalEvent ? isSaved(modalEvent.id) : false}
        onToggleSave={toggleSaveEvent}
        onPlanJourney={planJourney}
        originCollege={selectedCollege}
      />

      <SavedEventsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedEvents={savedEvents}
        onRemoveSaved={toggleSaveEvent}
        onSelectEvent={setModalEvent}
        onPlanJourney={planJourney}
      />

      <TinyFishDiscoverModal
        isOpen={isDiscoverModalOpen}
        onClose={() => setIsDiscoverModalOpen(false)}
        onDiscoveryComplete={() => {
          reloadEvents();
          fetchTinyFishStatus().then(setTinyfishStatus);
        }}
      />
    </div>
  );
}
