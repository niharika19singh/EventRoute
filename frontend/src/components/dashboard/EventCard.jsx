import React from 'react';
import {
  Calendar,
  MapPin,
  Navigation,
  Bookmark,
  ExternalLink,
  Award,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import CategoryBadge from '../shared/CategoryBadge';

export default function EventCard({
  event,
  isSaved,
  onToggleSave,
  onSelect,
  onPlanJourney,
  isSelected,
}) {
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatRetrieval = (timestamp) => {
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 bg-route-card hover:bg-route-hover/60 flex flex-col justify-between ${
        isSelected
          ? 'border-route-primary shadow-glow ring-1 ring-route-primary'
          : 'border-route-border hover:border-route-primary/40'
      }`}
    >
      <div className="p-4 sm:p-5 space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={event.category} />

          <div className="flex items-center gap-2">
            {event.distance_km != null && (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-route-primary/10 text-route-primaryLight border border-route-primary/20">
                <Navigation size={11} />
                {event.distance_km} km
              </span>
            )}

            <button
              onClick={() => onToggleSave(event.id)}
              className={`p-1.5 rounded-lg border transition-all ${
                isSaved
                  ? 'bg-route-accent/20 border-route-accent text-route-accent'
                  : 'bg-route-surface border-route-border text-route-muted hover:text-white'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save event'}
            >
              <Bookmark size={14} className={isSaved ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(event)}
          className="text-base font-bold text-route-text hover:text-route-primaryLight cursor-pointer transition-colors line-clamp-2 leading-snug"
        >
          {event.title}
        </h3>

        {/* College & Venue */}
        <div className="space-y-1 text-xs text-route-muted">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-route-text">{event.host_college}</span>
          </div>
          <div className="flex items-center gap-1.5 text-route-dim">
            <MapPin size={12} className="shrink-0 text-route-primaryLight" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Date & Prize */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-route-border/60">
          <div className="flex items-center gap-1.5 text-route-muted">
            <Calendar size={13} className="text-route-accent" />
            <span>{formatDate(event.start_date)}</span>
          </div>

          {event.prize_pool && (
            <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px] font-medium">
              <Award size={12} />
              <span className="truncate max-w-[120px]">{event.prize_pool}</span>
            </div>
          )}
        </div>

        {/* Eligibility Pill */}
        <div className="text-[11px] text-route-dim bg-route-surface/80 rounded-lg p-2 line-clamp-1 border border-route-border/50">
          <span className="text-route-muted font-medium">Eligibility:</span> {event.eligibility}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 sm:p-5 pt-0 mt-auto space-y-3">
        {/* Source metadata */}
        <div className="flex items-center justify-between text-[10px] text-route-dim pt-2 border-t border-route-border/50">
          <div className="flex items-center gap-1">
            <ShieldCheck size={11} className="text-emerald-400" />
            <span>{event.source_type === 'live_tinyfish' ? 'TinyFish Verified' : 'Curated Archive'}</span>
          </div>
          {event.retrieval_timestamp && (
            <div className="flex items-center gap-1 text-route-dim font-mono">
              <Clock size={10} />
              <span>{formatRetrieval(event.retrieval_timestamp)}</span>
            </div>
          )}
        </div>

        {/* Button Row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onPlanJourney(event)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-route-primary/20 hover:bg-route-primary text-route-primaryLight hover:text-white border border-route-primary/30 transition-all"
          >
            <Navigation size={13} />
            <span>Plan Journey</span>
          </button>

          <button
            onClick={() => onSelect(event)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-route-surface hover:bg-route-border text-route-text border border-route-border transition-all"
          >
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
