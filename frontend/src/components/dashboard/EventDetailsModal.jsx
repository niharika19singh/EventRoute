import React from 'react';
import {
  X,
  Calendar,
  MapPin,
  Navigation,
  Bookmark,
  ExternalLink,
  Award,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import CategoryBadge from '../shared/CategoryBadge';

export default function EventDetailsModal({
  event,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onPlanJourney,
  originCollege,
}) {
  if (!isOpen || !event) return null;

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const copyShareLink = () => {
    try {
      navigator.clipboard.writeText(event.registration_url || window.location.href);
      alert('Event link copied to clipboard!');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-route-surface border border-route-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-route-border flex items-start justify-between gap-4 bg-route-card/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={event.category} />
              {event.distance_km != null && (
                <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-route-primary/20 text-route-primaryLight border border-route-primary/30">
                  <Navigation size={12} />
                  {event.distance_km} km from {originCollege?.short_name || 'campus'}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {event.title}
            </h2>
            <p className="text-sm font-medium text-route-primaryLight">{event.host_college}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-route-muted hover:text-white hover:bg-route-card border border-transparent hover:border-route-border transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Key Quick Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-route-card border border-route-border flex items-start gap-3">
              <Calendar size={18} className="text-route-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-route-dim uppercase font-semibold">Event Schedule</p>
                <p className="text-xs font-medium text-route-text mt-0.5">{formatDate(event.start_date)}</p>
                {event.end_date && (
                  <p className="text-[11px] text-route-muted mt-0.5">To: {formatDate(event.end_date)}</p>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-route-card border border-route-border flex items-start gap-3">
              <MapPin size={18} className="text-route-primaryLight shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-route-dim uppercase font-semibold">Venue Address</p>
                <p className="text-xs font-medium text-route-text mt-0.5">{event.venue}</p>
                <p className="text-[11px] text-route-muted font-mono mt-0.5">
                  {event.coordinates?.lat?.toFixed(4)}, {event.coordinates?.lng?.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Prize pool callout banner */}
          {event.prize_pool && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Award size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Prizes & Incentives</p>
                <p className="text-sm font-bold text-white font-mono">{event.prize_pool}</p>
              </div>
            </div>
          )}

          {/* Eligibility Section */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-route-dim flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-route-primary" />
              Eligibility Criteria
            </h4>
            <div className="p-3 rounded-xl bg-route-card/80 border border-route-border text-xs text-route-text leading-relaxed">
              {event.eligibility}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-route-dim">
              About This Event
            </h4>
            <div className="p-4 rounded-xl bg-route-card/60 border border-route-border text-xs text-route-muted leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-route-dim">Topics & Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-route-surface border border-route-border text-route-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Attribution & Timestamp */}
          <div className="p-3.5 rounded-xl bg-route-card/40 border border-route-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-route-dim">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              <span>
                Source: <a href={event.source_url} target="_blank" rel="noreferrer" className="text-route-primaryLight hover:underline font-mono truncate max-w-[200px] inline-block align-bottom">{event.source_url}</a>
              </span>
            </div>
            {event.retrieval_timestamp && (
              <div className="flex items-center gap-1.5 text-route-dim font-mono text-[11px]">
                <Clock size={12} />
                <span>Retrieved: {formatDate(event.retrieval_timestamp)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-route-border bg-route-card/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onToggleSave(event.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                isSaved
                  ? 'bg-route-accent/20 border-route-accent text-route-accent'
                  : 'bg-route-surface border-route-border text-route-muted hover:text-white'
              }`}
            >
              <Bookmark size={15} className={isSaved ? 'fill-current' : ''} />
              <span>{isSaved ? 'Saved to Bookmarks' : 'Save Event'}</span>
            </button>

            <button
              onClick={copyShareLink}
              title="Copy registration link"
              className="p-2.5 rounded-xl bg-route-surface border border-route-border text-route-muted hover:text-white transition-all"
            >
              <Share2 size={15} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onPlanJourney(event);
                onClose();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-route-primary/20 hover:bg-route-primary text-route-primaryLight hover:text-white border border-route-primary/40 text-xs font-semibold transition-all"
            >
              <Navigation size={14} />
              <span>Plan Journey</span>
            </button>

            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-route-primary hover:bg-route-primaryLight text-white text-xs font-semibold transition-all shadow-glow"
            >
              <span>Register Now</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
