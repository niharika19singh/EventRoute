import React, { useState } from 'react';
import { X, Sparkles, Search, Loader2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { triggerTinyFishDiscovery } from '../../services/api';

const QUERY_PRESETS = [
  'Delhi NCR college hackathon tech fest 2026',
  'Robotics drone competition student symposium India',
  'Inter-college cultural fest music dance competition Delhi',
  'College sports meet tournament athletic Delhi NCR',
  'Student cybersecurity CTF workshop conference 2026',
];

export default function TinyFishDiscoverModal({ isOpen, onClose, onDiscoveryComplete }) {
  const [query, setQuery] = useState(QUERY_PRESETS[0]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDiscover = async (customQuery) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setIsDiscovering(true);
    setError(null);
    setResult(null);

    try {
      const res = await triggerTinyFishDiscovery(q);
      setResult(res);
      if (onDiscoveryComplete) {
        onDiscoveryComplete(res);
      }
    } catch (err) {
      console.error('Discovery error:', err);
      setError(err.message || 'Failed to complete discovery pipeline');
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-route-surface border border-route-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-route-border flex items-center justify-between bg-route-card/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-route-primary to-route-accent text-white flex items-center justify-center shadow-glow">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">TinyFish Live Event Discovery</h3>
              <p className="text-xs text-route-muted">Search & Fetch Web Agent Intelligence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-route-muted hover:text-white hover:bg-route-card border border-transparent hover:border-route-border transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-sm">
          {/* Query Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-route-dim uppercase tracking-wider">
              Discovery Search Query
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter search keywords for college events..."
                className="w-full bg-route-card border border-route-border focus:border-route-primary rounded-xl pl-4 pr-10 py-2.5 text-sm text-route-text placeholder-route-dim focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => handleDiscover()}
                disabled={isDiscovering}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-route-primary text-white hover:bg-route-primaryLight disabled:opacity-50 transition-all"
              >
                <Search size={14} />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-route-dim uppercase tracking-wider">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUERY_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setQuery(p);
                    handleDiscover(p);
                  }}
                  disabled={isDiscovering}
                  className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-route-card hover:bg-route-hover border border-route-border text-route-muted hover:text-route-text transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Animation */}
          {isDiscovering && (
            <div className="p-6 rounded-xl bg-route-card/80 border border-route-border text-center space-y-3 animate-pulse">
              <Loader2 size={28} className="animate-spin text-route-primary mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">Running TinyFish Discovery Pipeline</p>
                <p className="text-[11px] text-route-muted font-mono">
                  1. Querying Search API → 2. Fetching Markdown → 3. Normalizing & Deduplicating
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-route-danger/10 border border-route-danger/30 text-xs text-route-danger">
              {error}
            </div>
          )}

          {/* Discovery Result */}
          {result && (
            <div className="p-4 rounded-xl bg-route-card border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 size={16} />
                <span>Discovery Pipeline Completed Successfully</span>
              </div>
              <div className="text-xs text-route-muted space-y-1">
                <p>
                  Found <strong className="text-white">{result.events_count}</strong> inter-college events matching your query.
                </p>
                {result.added_to_active_catalog != null && (
                  <p className="text-route-primaryLight">
                    Integrated <strong>{result.added_to_active_catalog}</strong> new verified events into dashboard and map.
                  </p>
                )}
                {result.is_fallback && (
                  <p className="text-[11px] text-route-dim italic">
                    (Operating in curated offline catalog mode)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-route-border bg-route-card/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-route-muted hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => handleDiscover()}
            disabled={isDiscovering}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-route-primary hover:bg-route-primaryLight text-white text-xs font-semibold disabled:opacity-50 transition-all shadow-glow"
          >
            {isDiscovering ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Discovering...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Start Discovery</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
