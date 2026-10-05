import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ThemeMode, 
  SearchResponse, 
  SearchCategory, 
  SearchTrend, 
  HistoryItem 
} from './types';
import { DEFAULT_CATEGORIES } from './constants';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryBar } from './components/CategoryBar';
import { TrendsSection } from './components/TrendsSection';
import { SearchResults } from './components/SearchResults';
import { ShortcutsModal } from './components/ShortcutsModal';
import { CategorySettingsModal } from './components/CategorySettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Zap, Command, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('chros_theme') as ThemeMode) || 'dark';
  });

  // Ephemeral Privacy mode state (default to true for maximum privacy and low memory)
  const [ephemeralMode, setEphemeralMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('chros_ephemeral_mode');
    return saved !== null ? saved === 'true' : true;
  });

  // Categories state
  const [categories, setCategories] = useState<SearchCategory[]>(() => {
    try {
      const saved = localStorage.getItem('chros_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');

  // Search state
  const [query, setQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number>(-1);

  // Real-time Trends state
  const [trends, setTrends] = useState<SearchTrend[]>([]);
  const [isTrendsLoading, setIsTrendsLoading] = useState<boolean>(false);
  const [lastTrendsUpdate, setLastTrendsUpdate] = useState<string>('');

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (ephemeralMode) {
      try {
        const sess = sessionStorage.getItem('chros_session_history');
        return sess ? JSON.parse(sess) : [];
      } catch {
        return [];
      }
    } else {
      try {
        const local = localStorage.getItem('chros_history');
        return local ? JSON.parse(local) : [];
      } catch {
        return [];
      }
    }
  });

  // Modals state
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // References
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Apply theme to HTML root element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-oled', 'light');
    if (theme === 'oled') {
      root.classList.add('dark', 'theme-oled');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
    localStorage.setItem('chros_theme', theme);
  }, [theme]);

  // Handle Ephemeral Mode persistence vs purge
  useEffect(() => {
    localStorage.setItem('chros_ephemeral_mode', String(ephemeralMode));

    const handleBeforeUnload = () => {
      if (ephemeralMode) {
        sessionStorage.removeItem('chros_session_history');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [ephemeralMode]);

  // Sync history to storage
  const saveHistoryItem = useCallback((searchQ: string, catId: string, count: number) => {
    const newItem: HistoryItem = {
      id: `h_${Date.now()}`,
      query: searchQ,
      category: catId,
      timestamp: Date.now(),
      resultsCount: count,
    };

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.query.toLowerCase() !== searchQ.toLowerCase());
      const updated = [newItem, ...filtered].slice(0, 40);

      if (ephemeralMode) {
        sessionStorage.setItem('chros_session_history', JSON.stringify(updated));
      } else {
        localStorage.setItem('chros_history', JSON.stringify(updated));
      }
      return updated;
    });
  }, [ephemeralMode]);

  const handleClearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem('chros_session_history');
    localStorage.removeItem('chros_history');
  };

  // Fetch Trends
  const fetchTrends = useCallback(async () => {
    setIsTrendsLoading(true);
    try {
      const res = await fetch('/api/trends');
      if (res.ok) {
        const data = await res.json();
        setTrends(data.trends || []);
        setLastTrendsUpdate(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to load search trends:', err);
    } finally {
      setIsTrendsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // Execute Search
  const handleExecuteSearch = useCallback(async (forcedQuery?: string, forcedCategory?: string) => {
    const q = (forcedQuery !== undefined ? forcedQuery : query).trim();
    if (!q) return;

    const cat = forcedCategory !== undefined ? forcedCategory : activeCategoryId;
    const activeCatObj = categories.find((c) => c.id === cat);
    const domainFilters = activeCatObj?.domains || [];

    setIsLoading(true);
    setSelectedSourceIndex(-1);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          category: cat,
          filters: domainFilters,
          timeRange,
        }),
      });

      if (res.ok) {
        const data: SearchResponse = await res.json();
        setSearchResult(data);

        // Record history
        const sourcesCount = data.sources?.length || 0;
        saveHistoryItem(q, cat, sourcesCount);
      } else {
        console.error('Search request failed with status', res.status);
      }
    } catch (err) {
      console.error('Search execution error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query, activeCategoryId, categories, timeRange, saveHistoryItem]);

  // Save custom categories
  const handleSaveCategories = (updatedCategories: SearchCategory[]) => {
    setCategories(updatedCategories);
    localStorage.setItem('chros_categories', JSON.stringify(updatedCategories));
  };

  // Cycle Theme
  const handleThemeCycle = () => {
    setTheme((prev) => {
      if (prev === 'dark') return 'oled';
      if (prev === 'oled') return 'light';
      return 'dark';
    });
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Always handle Escape
      if (e.key === 'Escape') {
        if (isShortcutsOpen) { setIsShortcutsOpen(false); return; }
        if (isCategoriesOpen) { setIsCategoriesOpen(false); return; }
        if (isHistoryOpen) { setIsHistoryOpen(false); return; }
        if (isInput) {
          searchInputRef.current?.blur();
        }
        return;
      }

      // Hotkey: Focus Search input with '/' or 'Ctrl+K'
      if ((e.key === '/' || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Hotkey: '?' opens shortcuts modal when not in input
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // If user is currently typing in an input field, do not trigger single-letter shortcuts
      if (isInput) return;

      // Single-letter shortcuts when NOT typing in an input:
      // 't': toggle theme
      if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleThemeCycle();
        return;
      }

      // 'p': toggle privacy / ephemeral mode
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setEphemeralMode((prev) => !prev);
        return;
      }

      // 'h': toggle history
      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
        return;
      }

      // 'c': clear search
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setQuery('');
        setSearchResult(null);
        searchInputRef.current?.focus();
        return;
      }

      // 'o': open in Google.com
      if (e.key.toLowerCase() === 'o' && searchResult?.googleDirectUrl) {
        e.preventDefault();
        window.open(searchResult.googleDirectUrl, '_blank');
        return;
      }

      // Numeric keys 1-6: category switching
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 6) {
        const enabledCats = categories.filter((c) => c.enabled);
        if (num <= enabledCats.length) {
          e.preventDefault();
          const targetCat = enabledCats[num - 1];
          setActiveCategoryId(targetCat.id);
          if (query.trim()) {
            handleExecuteSearch(query.trim(), targetCat.id);
          }
          return;
        }
      }

      // Result navigation with 'j' and 'k' or ArrowDown / ArrowUp
      const sources = searchResult?.sources || [];
      if (sources.length > 0) {
        if (e.key === 'j' || e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSourceIndex((prev) => (prev + 1 >= sources.length ? 0 : prev + 1));
          return;
        }
        if (e.key === 'k' || e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSourceIndex((prev) => (prev <= 0 ? sources.length - 1 : prev - 1));
          return;
        }
        if (e.key === 'Enter' && selectedSourceIndex >= 0 && selectedSourceIndex < sources.length) {
          e.preventDefault();
          const selected = sources[selectedSourceIndex];
          if (e.shiftKey || e.metaKey || e.ctrlKey) {
            window.open(selected.url, '_blank');
          } else {
            window.location.href = selected.url;
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isShortcutsOpen, 
    isCategoriesOpen, 
    isHistoryOpen, 
    categories, 
    query, 
    searchResult, 
    selectedSourceIndex, 
    handleExecuteSearch
  ]);

  const handleSelectTrend = (trendQ: string) => {
    setQuery(trendQ);
    handleExecuteSearch(trendQ);
  };

  const handleResetHome = () => {
    setQuery('');
    setSearchResult(null);
    searchInputRef.current?.focus();
  };

  const hasSearched = Boolean(searchResult);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
      theme === 'oled' 
        ? 'bg-black text-neutral-100' 
        : theme === 'light' 
          ? 'bg-neutral-50 text-neutral-900' 
          : 'bg-neutral-950 text-neutral-100'
    }`}>
      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex-1 flex flex-col">
        {/* Header */}
        <Header
          theme={theme}
          onThemeCycle={handleThemeCycle}
          ephemeralMode={ephemeralMode}
          onToggleEphemeral={() => setEphemeralMode((prev) => !prev)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenCategories={() => setIsCategoriesOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onLogoClick={handleResetHome}
          compact={hasSearched}
        />

        {/* Hero Section when no search active */}
        {!hasSearched ? (
          <div className="flex-1 flex flex-col justify-center items-center py-8 sm:py-16">
            {/* Minimalist Logo Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-neutral-800 bg-neutral-900/60 mb-4 text-xs font-mono text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Lightning-Fast Google Grounding</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-mono font-extrabold tracking-widest text-neutral-100">
                CHROS
              </h1>
              <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-md mx-auto">
                Distraction-free, zero-bloat search engine engineered for speed and research efficiency.
              </p>
            </div>

            {/* Search Input */}
            <SearchBar
              query={query}
              onChangeQuery={setQuery}
              onSearch={handleExecuteSearch}
              isLoading={isLoading}
              inputRef={searchInputRef}
              timeRange={timeRange}
              onChangeTimeRange={setTimeRange}
            />

            {/* Category Tabs */}
            <div className="w-full max-w-3xl mt-4">
              <CategoryBar
                categories={categories}
                activeCategoryId={activeCategoryId}
                onSelectCategory={(id) => {
                  setActiveCategoryId(id);
                  if (query.trim()) handleExecuteSearch(query.trim(), id);
                }}
                onOpenCustomize={() => setIsCategoriesOpen(true)}
              />
            </div>

            {/* Real-Time Search Trends */}
            <TrendsSection
              trends={trends}
              onSelectTrend={handleSelectTrend}
              onRefresh={fetchTrends}
              isRefreshing={isTrendsLoading}
              lastUpdated={lastTrendsUpdate}
            />

            {/* Power User Hints */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-neutral-500">
              <span className="flex items-center gap-1">
                <kbd className="bg-neutral-800 px-1 rounded text-neutral-400">/</kbd> Focus Search
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <kbd className="bg-neutral-800 px-1 rounded text-neutral-400">j</kbd>/<kbd className="bg-neutral-800 px-1 rounded text-neutral-400">k</kbd> Navigate
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <kbd className="bg-neutral-800 px-1 rounded text-neutral-400">1-6</kbd> Categories
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <kbd className="bg-neutral-800 px-1 rounded text-neutral-400">?</kbd> All Shortcuts
              </span>
            </div>
          </div>
        ) : (
          /* Active Results State */
          <div className="flex-1 flex flex-col pt-2 sm:pt-4">
            {/* Search Input Bar (Sticky / Top) */}
            <div className="sticky top-0 z-30 pb-3 pt-1 backdrop-blur-md bg-neutral-950/80">
              <SearchBar
                query={query}
                onChangeQuery={setQuery}
                onSearch={handleExecuteSearch}
                isLoading={isLoading}
                inputRef={searchInputRef}
                timeRange={timeRange}
                onChangeTimeRange={(val) => {
                  setTimeRange(val);
                  handleExecuteSearch();
                }}
              />
              <div className="max-w-3xl mx-auto mt-2.5">
                <CategoryBar
                  categories={categories}
                  activeCategoryId={activeCategoryId}
                  onSelectCategory={(id) => {
                    setActiveCategoryId(id);
                    handleExecuteSearch(query.trim(), id);
                  }}
                  onOpenCustomize={() => setIsCategoriesOpen(true)}
                />
              </div>
            </div>

            {/* Results Content */}
            {searchResult && (
              <SearchResults
                result={searchResult}
                selectedSourceIndex={selectedSourceIndex}
                onSelectSourceIndex={setSelectedSourceIndex}
                onExecuteRelated={(rq) => {
                  setQuery(rq);
                  handleExecuteSearch(rq);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Footer Minimalist Status */}
      <footer className="w-full border-t border-neutral-800/60 py-3 px-4 text-center text-xs font-mono text-neutral-500 flex flex-wrap items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <span>CHROS Engine</span>
          <span>·</span>
          <span>Google Grounding</span>
          {ephemeralMode && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              Ephemeral Session
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="hover:text-neutral-300 transition-colors flex items-center gap-1"
          >
            <span>Shortcuts</span>
            <kbd className="bg-neutral-800 px-1 py-0.2 rounded text-[10px] text-neutral-400">?</kbd>
          </button>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <CategorySettingsModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        categories={categories}
        onSaveCategories={handleSaveCategories}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        ephemeralMode={ephemeralMode}
        onSelectQuery={(q) => {
          setQuery(q);
          handleExecuteSearch(q);
        }}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
