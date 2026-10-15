import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

const CATEGORIES = [
  'all',
  'Hackathon',
  'Tech Fest',
  'Cultural',
  'Workshop',
  'Sports',
  'Conference',
  'Symposium',
];

export default function EventFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  maxDistanceKm,
  onMaxDistanceChange,
  sortBy,
  onSortByChange,
  totalCount,
}) {
  return (
    <div className="bg-route-surface border border-route-border rounded-xl p-4 mb-6 space-y-4">
      {/* Top row: Search and Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-route-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events, colleges, tech topics, tags..."
            className="w-full bg-route-card border border-route-border focus:border-route-primary rounded-xl pl-10 pr-9 py-2 text-sm text-route-text placeholder-route-dim focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-route-muted hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right: Distance & Sort */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
          {/* Distance Filter */}
          <div className="flex items-center gap-1.5 bg-route-card border border-route-border rounded-lg px-2.5 py-1.5 text-xs">
            <SlidersHorizontal size={13} className="text-route-muted" />
            <span className="text-route-muted">Radius:</span>
            <select
              value={maxDistanceKm || ''}
              onChange={(e) => onMaxDistanceChange(e.target.value ? Number(e.target.value) : null)}
              className="bg-transparent text-route-text font-medium cursor-pointer focus:outline-none"
            >
              <option value="" className="bg-route-card text-route-text">Any Distance</option>
              <option value="10" className="bg-route-card text-route-text">Within 10 km</option>
              <option value="25" className="bg-route-card text-route-text">Within 25 km</option>
              <option value="50" className="bg-route-card text-route-text">Within 50 km</option>
              <option value="100" className="bg-route-card text-route-text">Within 100 km</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-route-card border border-route-border rounded-lg px-2.5 py-1.5 text-xs">
            <ArrowUpDown size={13} className="text-route-muted" />
            <span className="text-route-muted">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="bg-transparent text-route-text font-medium cursor-pointer focus:outline-none"
            >
              <option value="date" className="bg-route-card text-route-text">Date (Soonest)</option>
              <option value="distance" className="bg-route-card text-route-text">Distance (Nearest)</option>
              <option value="title" className="bg-route-card text-route-text">Title (A-Z)</option>
            </select>
          </div>

          {/* Count Badge */}
          <div className="text-xs text-route-dim font-mono">
            <span className="text-route-text font-semibold">{totalCount}</span> events
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-route-primary border-route-primaryLight text-white shadow-glow'
                  : 'bg-route-card border-route-border text-route-muted hover:text-white hover:border-route-hover'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
