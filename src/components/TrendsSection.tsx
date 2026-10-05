import React, { useState } from 'react';
import { SearchTrend } from '../types';
import { TrendingUp, RefreshCw, Flame, Sparkles } from 'lucide-react';

interface TrendsSectionProps {
  trends: SearchTrend[];
  onSelectTrend: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated?: string;
}

export const TrendsSection: React.FC<TrendsSectionProps> = ({
  trends,
  onSelectTrend,
  onRefresh,
  isRefreshing,
  lastUpdated,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const categories = ['All', 'Tech & Code', 'Science', 'Markets', 'Research'];

  const filteredTrends =
    activeFilter === 'All'
      ? trends
      : trends.filter((t) => t.category.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-200">
            Real-Time Search Trends
          </h2>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-500">
              Live Index
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors rounded disabled:opacity-40"
            title="Refresh Trends"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
              activeFilter === cat
                ? 'bg-neutral-800 text-neutral-100 font-medium'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        {filteredTrends.map((trend) => (
          <button
            key={trend.id}
            onClick={() => onSelectTrend(trend.query)}
            className="group flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/50 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-left transition-all duration-150"
          >
            <div className="flex items-center gap-2.5 overflow-hidden pr-2">
              <Flame className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 shrink-0 transition-colors" />
              <span className="text-xs sm:text-sm text-neutral-200 group-hover:text-white truncate font-medium">
                {trend.query}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                {trend.change}
              </span>
              <span className="text-[9px] font-mono text-neutral-500 uppercase">
                {trend.tag}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Search Tip */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-500 px-1">
        <span>Tap any trend to search instantly</span>
        <span className="hidden sm:inline">Use <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-400">j</kbd> / <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-400">k</kbd> to step through results</span>
      </div>
    </div>
  );
};
