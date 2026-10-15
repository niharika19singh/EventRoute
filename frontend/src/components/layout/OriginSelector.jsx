import React from 'react';
import { MapPin, Navigation, ChevronDown } from 'lucide-react';

export default function OriginSelector({ colleges, selectedCollege, onSelectCollege, onDetectLocation, isDetecting }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-block text-left">
        <div className="flex items-center gap-2 bg-route-surface border border-route-border hover:border-route-primary/50 rounded-xl px-3 py-2 transition-all">
          <MapPin size={16} className="text-route-primary shrink-0" />
          <div className="text-left">
            <div className="text-[10px] text-route-dim font-medium uppercase tracking-wider">
              Your Campus / Origin
            </div>
            <select
              value={selectedCollege?.id || ''}
              onChange={(e) => {
                const found = colleges.find((c) => c.id === e.target.value);
                if (found) onSelectCollege(found);
              }}
              className="bg-transparent text-sm font-semibold text-route-text appearance-none pr-6 cursor-pointer focus:outline-none"
            >
              {colleges.map((c) => (
                <option key={c.id} value={c.id} className="bg-route-card text-route-text">
                  {c.short_name} ({c.city})
                </option>
              ))}
            </select>
          </div>
          <ChevronDown size={14} className="text-route-muted absolute right-3 pointer-events-none" />
        </div>
      </div>

      <button
        type="button"
        onClick={onDetectLocation}
        disabled={isDetecting}
        title="Use Current Geolocation"
        className="p-2.5 rounded-xl border border-route-border hover:border-route-primary/50 bg-route-surface text-route-muted hover:text-route-primary transition-all disabled:opacity-50"
      >
        <Navigation size={16} className={isDetecting ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
