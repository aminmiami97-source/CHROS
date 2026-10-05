import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { BANG_COMMANDS } from '../constants';

interface SearchBarProps {
  query: string;
  onChangeQuery: (val: string) => void;
  onSearch: (forcedQuery?: string) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  timeRange: string;
  onChangeTimeRange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChangeQuery,
  onSearch,
  isLoading,
  inputRef,
  timeRange,
  onChangeTimeRange,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Autocomplete fetch with debounce
  useEffect(() => {
    if (!query.trim() || query.startsWith('!')) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch {
        // Silently ignore autocomplete network issues
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query]);

  // Check if current query is a bang command
  const isBang = query.trim().startsWith('!');
  const matchedBangs = isBang
    ? BANG_COMMANDS.filter((b) => b.bang.startsWith(query.trim().split(' ')[0]))
    : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selected = suggestions[selectedIndex];
        onChangeQuery(selected);
        setSuggestions([]);
        onSearch(selected);
      } else {
        setSuggestions([]);
        onSearch();
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleSelectSuggestion = (s: string) => {
    onChangeQuery(s);
    setSuggestions([]);
    onSearch(s);
  };

  const handleApplyBang = (bang: string) => {
    onChangeQuery(`${bang} `);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto z-20">
      <div
        className={`relative flex items-center w-full transition-all duration-150 rounded-lg border bg-neutral-900/90 shadow-sm ${
          isFocused
            ? 'border-neutral-500 ring-1 ring-neutral-400/20 bg-neutral-900 shadow-md'
            : 'border-neutral-800 hover:border-neutral-700'
        }`}
      >
        {/* Search icon or loading spinner */}
        <div className="flex items-center pl-4 pr-2 text-neutral-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          ) : (
            <Search className="w-4 h-4 text-neutral-400" />
          )}
        </div>

        {/* Input box */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            onChangeQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // slight delay to allow clicking suggestions
            setTimeout(() => setIsFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search anything with Google index or type '!' for bangs (e.g. !gh, !so)..."
          className="w-full py-3.5 px-2 bg-transparent text-neutral-100 placeholder-neutral-500 font-sans text-sm sm:text-base focus:outline-none"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Right side controls: Clear, Time Filter, Search submit */}
        <div className="flex items-center gap-1.5 pr-2.5">
          {query && (
            <button
              onClick={() => {
                onChangeQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors rounded"
              title="Clear input [Esc]"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Time range selector */}
          <div className="hidden sm:flex items-center">
            <select
              value={timeRange}
              onChange={(e) => onChangeTimeRange(e.target.value)}
              className="text-[11px] font-mono bg-neutral-800/80 text-neutral-300 border border-neutral-700/60 rounded px-1.5 py-1 focus:outline-none focus:border-neutral-500 cursor-pointer"
              title="Filter by time range"
            >
              <option value="all">Any time</option>
              <option value="day">Past 24h</option>
              <option value="week">Past week</option>
              <option value="month">Past month</option>
              <option value="year">Past year</option>
            </select>
          </div>

          {/* Hotkey slash indicator */}
          {!query && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-neutral-500 border border-neutral-800 px-1.5 py-0.5 rounded bg-neutral-950/60 select-none">
              <kbd>/</kbd>
            </div>
          )}

          {/* Execute search button */}
          <button
            onClick={() => {
              setSuggestions([]);
              onSearch();
            }}
            disabled={isLoading || !query.trim()}
            className="flex items-center justify-center p-2 text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
            title="Execute Search [Enter]"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Autocomplete Suggestions dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden py-1 z-30"
        >
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onMouseDown={() => handleSelectSuggestion(item)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer transition-colors ${
                idx === selectedIndex
                  ? 'bg-neutral-800 text-white font-medium'
                  : 'text-neutral-300 hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>{item}</span>
              </div>
              {idx === selectedIndex && (
                <span className="text-[11px] font-mono text-neutral-400">⏎ Search</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bang command helpers tooltip */}
      {isFocused && isBang && matchedBangs.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl p-3 z-30">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between">
            <span>Direct Bang Shortcuts</span>
            <span className="text-neutral-500">Jump directly to specific engines</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {matchedBangs.map((b) => (
              <button
                key={b.bang}
                type="button"
                onMouseDown={() => handleApplyBang(b.bang)}
                className="flex items-center gap-2 p-2 rounded bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/60 text-left transition-colors"
              >
                <code className="text-xs font-mono font-bold text-emerald-400 bg-neutral-900 px-1 py-0.5 rounded">
                  {b.bang}
                </code>
                <span className="text-xs text-neutral-300 truncate">{b.name}</span>
                <ExternalLink className="w-3 h-3 text-neutral-500 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
