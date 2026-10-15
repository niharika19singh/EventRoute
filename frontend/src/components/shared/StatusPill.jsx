import React from 'react';
import { ShieldCheck, ShieldAlert, Radio } from 'lucide-react';

export default function StatusPill({ status }) {
  const isConfigured = status?.configured;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-route-surface border border-route-border text-xs">
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
        />
        <span className="text-route-muted font-medium">TinyFish Agent:</span>
      </div>

      {isConfigured ? (
        <span className="text-emerald-400 font-mono flex items-center gap-1">
          <ShieldCheck size={13} />
          {status.masked_key || 'Live Connected'}
        </span>
      ) : (
        <span className="text-amber-400 font-mono flex items-center gap-1">
          <ShieldAlert size={13} />
          Curated Catalog Mode
        </span>
      )}
    </div>
  );
}
