import React from 'react';
import { Compass, Bookmark, Sparkles, Map } from 'lucide-react';
import OriginSelector from './OriginSelector';
import StatusPill from '../shared/StatusPill';

export default function Header({
  colleges,
  selectedCollege,
  onSelectCollege,
  onDetectLocation,
  isDetecting,
  savedCount,
  onOpenSaved,
  onOpenDiscover,
  tinyfishStatus,
  viewMode,
  setViewMode,
}) {
  return (
    <header className="sticky top-0 z-40 bg-route-bg/90 backdrop-blur-md border-b border-route-border px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-route-primary to-route-accent flex items-center justify-center shadow-glow text-white">
            <Compass size={22} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                Event<span className="text-route-primaryLight">Route</span>
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-route-primary/20 text-route-primaryLight border border-route-primary/30">
                v1.0
              </span>
            </div>
            <p className="text-xs text-route-muted">Navigate the Opportunity — Inter-College Event Discovery</p>
          </div>
        </div>

        {/* Center / Origin Picker */}
        <div className="flex items-center gap-3 flex-wrap">
          <OriginSelector
            colleges={colleges}
            selectedCollege={selectedCollege}
            onSelectCollege={onSelectCollege}
            onDetectLocation={onDetectLocation}
            isDetecting={isDetecting}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <StatusPill status={tinyfishStatus} />

          {/* View toggle */}
          <div className="flex items-center bg-route-surface border border-route-border rounded-lg p-1 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'split' ? 'bg-route-primary text-white' : 'text-route-muted hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-route-primary text-white' : 'text-route-muted hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'map' ? 'bg-route-primary text-white' : 'text-route-muted hover:text-white'
              }`}
            >
              Map
            </button>
          </div>

          {/* Saved Events */}
          <button
            onClick={onOpenSaved}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-route-surface border border-route-border hover:border-route-primary/50 text-xs font-medium text-route-text hover:text-white transition-all"
          >
            <Bookmark size={15} className="text-route-accent" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-route-accent text-route-bg font-mono text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* TinyFish Discover Trigger */}
          <button
            onClick={onOpenDiscover}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-route-primary to-indigo-600 hover:from-route-primaryLight hover:to-indigo-500 text-xs font-semibold text-white transition-all shadow-glow"
          >
            <Sparkles size={14} />
            <span>Discover Events</span>
          </button>
        </div>
      </div>
    </header>
  );
}
