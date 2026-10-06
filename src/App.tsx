import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ThemeMode, 
  SearchResponse, 
  SearchCategory, 
  SearchTrend, 
  HistoryItem,
  SavedItem,
  SearchSource 
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
import { DownloadDesktopModal } from './components/DownloadDesktopModal';
import { DownloadScreen } from './components/DownloadScreen';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logOut, 
  testFirestoreConnection, 
  syncHistoryItemToFirestore,
  saveResultToFirestore,
  deleteSavedResultFromFirestore,
  handleFirestoreError,
  OperationType 
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query as firestoreQuery, orderBy, limit, getDocs } from 'firebase/firestore';
import { Zap, Command, ShieldCheck, Sparkles, Cloud } from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

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

  // Saved bookmarks state
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const local = localStorage.getItem('chros_saved_items');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isDownloadDesktopOpen, setIsDownloadDesktopOpen] = useState<boolean>(false);
  const [isDownloadScreen, setIsDownloadScreen] = useState<boolean>(false);
  const [showPopupBlockedModal, setShowPopupBlockedModal] = useState<boolean>(false);

  // References
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Google OAuth sign-in wrapper with popup blocked detection
  const handleSignInGoogle = async () => {
    setIsAuthLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res?.error === 'popup-blocked') {
        setShowPopupBlockedModal(true);
      }
    } catch {
      // Gracefully handled inside signInWithGoogle
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Test connection and listen to Firebase auth
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      // If user is authenticated and not in ephemeral mode, load remote history and saved items
      if (currentUser && !ephemeralMode) {
        try {
          const historyRef = collection(db, 'users', currentUser.uid, 'history');
          const qHistory = firestoreQuery(historyRef, orderBy('timestamp', 'desc'), limit(40));
          const historySnapshot = await getDocs(qHistory);
          if (!historySnapshot.empty) {
            const remoteItems: HistoryItem[] = historySnapshot.docs.map((docSnap) => docSnap.data() as HistoryItem);
            setHistory(remoteItems);
          }

          const savedRef = collection(db, 'users', currentUser.uid, 'saved');
          const qSaved = firestoreQuery(savedRef, orderBy('timestamp', 'desc'), limit(50));
          const savedSnapshot = await getDocs(qSaved);
          if (!savedSnapshot.empty) {
            const remoteSaved: SavedItem[] = savedSnapshot.docs.map((docSnap) => docSnap.data() as SavedItem);
            setSavedItems(remoteSaved);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}/data`);
        }
      }
    });

    return () => unsubscribe();
  }, [ephemeralMode]);

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

  // Sync history to storage and Firebase if logged in
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
        // Sync to Firestore if authenticated
        if (user) {
          syncHistoryItemToFirestore(user.uid, newItem);
        }
      }
      return updated;
    });
  }, [ephemeralMode, user]);

  const handleClearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem('chros_session_history');
    localStorage.removeItem('chros_history');
  };

  // Memoized set of saved URLs for instant O(1) lookup
  const savedUrls = React.useMemo(() => new Set(savedItems.map((s) => s.url)), [savedItems]);

  const handleToggleSaveResult = useCallback(async (source: SearchSource) => {
    const isAlreadySaved = savedUrls.has(source.url);
    if (isAlreadySaved) {
      const itemToDelete = savedItems.find((s) => s.url === source.url);
      if (itemToDelete) {
        setSavedItems((prev) => {
          const next = prev.filter((s) => s.url !== source.url);
          localStorage.setItem('chros_saved_items', JSON.stringify(next));
          return next;
        });
        if (user && !ephemeralMode) {
          await deleteSavedResultFromFirestore(user.uid, itemToDelete.id);
        }
      }
    } else {
      const newItem: SavedItem = {
        id: `s_${Date.now()}`,
        userId: user?.uid,
        title: source.title,
        url: source.url,
        domain: source.domain,
        snippet: source.snippet || '',
        query: query || '',
        timestamp: Date.now(),
      };
      setSavedItems((prev) => {
        const next = [newItem, ...prev];
        localStorage.setItem('chros_saved_items', JSON.stringify(next));
        return next;
      });
      if (user && !ephemeralMode) {
        await saveResultToFirestore(user.uid, newItem);
      }
    }
  }, [savedUrls, savedItems, user, ephemeralMode, query]);

  const handleDeleteSavedItem = useCallback(async (id: string) => {
    setSavedItems((prev) => {
      const next = prev.filter((s) => s.id !== id);
      localStorage.setItem('chros_saved_items', JSON.stringify(next));
      return next;
    });
    if (user && !ephemeralMode) {
      await deleteSavedResultFromFirestore(user.uid, id);
    }
  }, [user, ephemeralMode]);

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

  // If user navigated to the dedicated Windows 11 & 10 Download Screen
  if (isDownloadScreen) {
    return <DownloadScreen onBackToSearch={() => setIsDownloadScreen(false)} />;
  }

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
          onOpenDownloadDesktop={() => setIsDownloadScreen(true)}
          onLogoClick={handleResetHome}
          user={user}
          onSignInGoogle={handleSignInGoogle}
          onSignOut={logOut}
          isAuthLoading={isAuthLoading}
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
                savedUrls={savedUrls}
                onToggleSaveResult={handleToggleSaveResult}
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
          {user ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-cyan-400">
              <Cloud className="w-3 h-3" />
              <span>Firebase Synced</span>
            </span>
          ) : ephemeralMode ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              Ephemeral Session
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDownloadScreen(true)}
            className="hover:text-emerald-400 text-neutral-400 transition-colors flex items-center gap-1.5"
            title="Download for Windows 11 & 10 PC / Laptop (Native App, No Terminal)"
          >
            <span>Windows 11 &amp; 10 App</span>
          </button>
          <span>·</span>
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
      <DownloadDesktopModal
        isOpen={isDownloadDesktopOpen}
        onClose={() => setIsDownloadDesktopOpen(false)}
      />

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
        savedItems={savedItems}
        ephemeralMode={ephemeralMode}
        isLoggedIn={Boolean(user)}
        onSelectQuery={(q) => {
          setQuery(q);
          handleExecuteSearch(q);
        }}
        onClearHistory={handleClearHistory}
        onDeleteSavedItem={handleDeleteSavedItem}
      />

      {/* Pop-up Blocked Guidance Modal */}
      {showPopupBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-amber-800/80 bg-neutral-900 shadow-2xl p-5 sm:p-6 text-neutral-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800 text-amber-400 font-mono text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>Google Sign-In Pop-up Blocked</span>
            </div>

            <div className="my-4 text-xs font-sans text-neutral-300 space-y-3 leading-relaxed">
              <p>
                Your browser or iframe preview environment automatically blocked the Google OAuth window.
              </p>
              <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800 space-y-1.5 font-mono text-[11px] text-neutral-400">
                <div className="text-neutral-200 font-semibold">How to enable:</div>
                <div>1. Look for the pop-up blocked icon in your browser address bar (top right).</div>
                <div>2. Select <span className="text-amber-300">&ldquo;Always allow pop-ups from this site&rdquo;</span>.</div>
                <div>3. Click Retry Sign In below.</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowPopupBlockedModal(false)}
                className="px-3 py-1.5 rounded text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setShowPopupBlockedModal(false);
                  handleSignInGoogle();
                }}
                className="px-3.5 py-1.5 rounded text-xs font-mono bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold transition-colors"
              >
                Retry Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
