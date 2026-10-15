import React from 'react';
import { AlertCircle, RefreshCw, Compass, Info } from 'lucide-react';

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-route-border bg-route-card p-5 animate-pulse space-y-4"
        >
          <div className="flex justify-between items-center">
            <div className="h-5 w-24 bg-route-surface rounded-full" />
            <div className="h-4 w-16 bg-route-surface rounded" />
          </div>
          <div className="h-6 w-3/4 bg-route-surface rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-route-surface rounded" />
            <div className="h-4 w-5/6 bg-route-surface rounded" />
          </div>
          <div className="pt-3 border-t border-route-border flex justify-between">
            <div className="h-8 w-24 bg-route-surface rounded-lg" />
            <div className="h-8 w-28 bg-route-surface rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ onReset }) {
  return (
    <div className="rounded-xl border border-dashed border-route-border bg-route-card/50 p-12 text-center max-w-md mx-auto my-8">
      <div className="w-14 h-14 rounded-full bg-route-primary/10 text-route-primary flex items-center justify-center mx-auto mb-4">
        <Compass size={28} />
      </div>
      <h3 className="text-lg font-semibold text-route-text mb-2">No Matching Events Found</h3>
      <p className="text-sm text-route-muted mb-6">
        No college events match your current search query or distance radius filters. Try expanding your search radius or resetting filters.
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-route-primary hover:bg-route-primaryLight text-white transition-all shadow-glow"
        >
          <RefreshCw size={15} />
          Reset All Filters
        </button>
      )}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-route-danger/30 bg-route-danger/10 p-4 mb-6 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-route-danger shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-route-danger">Failed to Load Events</h4>
          <p className="text-xs text-route-muted mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-route-danger/40 text-route-danger hover:bg-route-danger/20 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function PartialResultsBanner({ count, message }) {
  return (
    <div className="rounded-xl border border-route-warning/30 bg-route-warning/10 p-3 mb-4 flex items-center gap-3 text-xs text-route-warning">
      <Info size={16} className="shrink-0" />
      <span>
        Showing {count} events: {message || 'Operating with verified archive catalog while live web crawler completes.'}
      </span>
    </div>
  );
}
