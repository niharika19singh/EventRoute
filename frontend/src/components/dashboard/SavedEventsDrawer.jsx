import React from 'react';
import { X, Bookmark, Navigation, Trash2, ExternalLink, Calendar, MapPin } from 'lucide-react';
import CategoryBadge from '../shared/CategoryBadge';

export default function SavedEventsDrawer({
  isOpen,
  onClose,
  savedEvents,
  onRemoveSaved,
  onSelectEvent,
  onPlanJourney,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-route-surface border-l border-route-border h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-route-border flex items-center justify-between bg-route-card/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-route-accent/20 text-route-accent">
              <Bookmark size={18} className="fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Saved Events</h3>
              <p className="text-xs text-route-muted">{savedEvents.length} bookmarked opportunities</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-route-muted hover:text-white hover:bg-route-card border border-transparent hover:border-route-border transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedEvents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-route-muted">
              <div className="w-12 h-12 rounded-full bg-route-card flex items-center justify-center mb-3">
                <Bookmark size={22} className="text-route-dim" />
              </div>
              <p className="text-sm font-medium text-route-text">No Saved Events</p>
              <p className="text-xs text-route-dim mt-1 max-w-xs">
                Click the bookmark icon on any event card to save it here for quick route planning.
              </p>
            </div>
          ) : (
            savedEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-xl bg-route-card border border-route-border hover:border-route-primary/40 space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge category={event.category} size="xs" />
                  <button
                    onClick={() => onRemoveSaved(event.id)}
                    title="Remove from saved"
                    className="text-route-dim hover:text-route-danger p-1 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h4
                  onClick={() => {
                    onSelectEvent(event);
                    onClose();
                  }}
                  className="text-sm font-bold text-route-text hover:text-route-primaryLight cursor-pointer line-clamp-1"
                >
                  {event.title}
                </h4>

                <div className="text-xs text-route-dim space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-route-primaryLight shrink-0" />
                    <span className="truncate">{event.host_college}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-route-accent shrink-0" />
                    <span>{new Date(event.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-route-border/50 flex items-center justify-between gap-2">
                  {event.distance_km != null && (
                    <span className="text-xs font-mono text-route-primaryLight">
                      {event.distance_km} km away
                    </span>
                  )}
                  <button
                    onClick={() => {
                      onPlanJourney(event);
                      onClose();
                    }}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-route-primary hover:bg-route-primaryLight text-white text-xs font-semibold transition-all shadow-glow"
                  >
                    <Navigation size={12} />
                    <span>Route</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
