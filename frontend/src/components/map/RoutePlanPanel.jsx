import React, { useState } from 'react';
import {
  Navigation,
  Clock,
  MapPin,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function RoutePlanPanel({ route, targetEvent, onClose }) {
  const [showSteps, setShowSteps] = useState(false);

  if (!route) return null;

  return (
    <div className="bg-route-surface border border-route-border rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
      {/* Top Banner */}
      <div className="p-4 bg-route-card border-b border-route-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-route-primary/20 text-route-primaryLight">
            <Navigation size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">
              Route: {route.origin_name} → {route.destination_name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-route-dim">
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <ShieldCheck size={12} />
                {route.provider === 'osrm' ? 'OSRM Verified Road Network' : 'Road Route Estimate'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-route-muted hover:text-white hover:bg-route-surface transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="p-4 grid grid-cols-2 gap-3 bg-route-surface/50 border-b border-route-border">
        <div className="p-3 rounded-lg bg-route-card/80 border border-route-border text-center">
          <p className="text-[11px] text-route-dim uppercase font-semibold">Total Road Distance</p>
          <p className="text-lg font-bold font-mono text-route-primaryLight mt-0.5">
            {route.distance_km} <span className="text-xs font-normal text-route-muted">km</span>
          </p>
        </div>

        <div className="p-3 rounded-lg bg-route-card/80 border border-route-border text-center">
          <p className="text-[11px] text-route-dim uppercase font-semibold">Estimated Driving Time</p>
          <p className="text-lg font-bold font-mono text-route-accent mt-0.5">
            {route.duration_text}
          </p>
        </div>
      </div>

      {route.warning && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-400 flex items-center gap-1.5">
          <AlertTriangle size={13} className="shrink-0" />
          <span>{route.warning}</span>
        </div>
      )}

      {/* Turn-by-Turn Steps Accordion */}
      {route.steps && route.steps.length > 0 && (
        <div className="p-3">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-route-card hover:bg-route-hover text-xs font-semibold text-route-muted hover:text-white transition-colors"
          >
            <span>Turn-by-turn Navigation ({route.steps.length} maneuvers)</span>
            {showSteps ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showSteps && (
            <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {route.steps.map((s, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-route-card/40 border border-route-border/40 text-xs flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-route-surface text-route-primary text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-route-text font-medium">{s.instruction}</p>
                    <p className="text-[10px] text-route-dim font-mono mt-0.5">
                      {s.distance_m > 1000 ? `${(s.distance_m / 1000).toFixed(1)} km` : `${Math.round(s.distance_m)} m`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
