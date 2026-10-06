import React, { useState, useRef, useEffect } from 'react';
import { ThemeMode } from '../types';
import { User } from 'firebase/auth';
import { 
  Sun, 
  Moon, 
  Sparkles, 
  Shield, 
  ShieldCheck, 
  Keyboard, 
  Sliders, 
  History, 
  Zap, 
  LogOut, 
  User as UserIcon, 
  Cloud, 
  Check,
  MonitorDown
} from 'lucide-react';

interface HeaderProps {
  theme: ThemeMode;
  onThemeCycle: () => void;
  ephemeralMode: boolean;
  onToggleEphemeral: () => void;
  onOpenShortcuts: () => void;
  onOpenCategories: () => void;
  onOpenHistory: () => void;
  onOpenDownloadDesktop?: () => void;
  onLogoClick: () => void;
  user: User | null;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  isAuthLoading: boolean;
  compact?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeCycle,
  ephemeralMode,
  onToggleEphemeral,
  onOpenShortcuts,
  onOpenCategories,
  onOpenHistory,
  onOpenDownloadDesktop,
  onLogoClick,
  user,
  onSignInGoogle,
  onSignOut,
  isAuthLoading,
  compact = false,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`w-full flex items-center justify-between transition-all duration-150 relative z-30 ${compact ? 'py-3' : 'py-5'}`}>
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3">
        <button
          onClick={onLogoClick}
          className="group flex items-center gap-2 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-sm"
          title="CHROS Search Engine - Click to Reset"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-neutral-900 border border-neutral-700/80 group-hover:border-neutral-500 transition-colors">
            <Zap className="w-3.5 h-3.5 text-neutral-200 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div>
            <span className="font-mono text-base font-bold tracking-widest text-neutral-100 group-hover:text-white">
              CHROS
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-wider text-neutral-500 border border-neutral-800 px-1 py-0.5 rounded">
              v1.0
            </span>
          </div>
        </button>

        {/* Minimalist engine & sync indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400 border-l border-neutral-800/80 pl-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-neutral-400">Google Grounded</span>
          {user && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.2 rounded ml-1">
              <Cloud className="w-2.5 h-2.5" />
              <span>Firebase Synced</span>
            </span>
          )}
        </div>
      </div>

      {/* Control Actions & Auth */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Ephemeral Session / Privacy Mode Toggle */}
        <button
          onClick={onToggleEphemeral}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded transition-colors border ${
            ephemeralMode
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/40'
              : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
          title="Toggle Ephemeral Session Mode [P] - Automatically clear search history after session"
        >
          {ephemeralMode ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-neutral-400" />
          )}
          <span className="hidden sm:inline">{ephemeralMode ? 'Incognito' : 'Privacy'}</span>
          <kbd className="hidden lg:inline text-[9px] opacity-60 bg-neutral-800/80 px-1 rounded">p</kbd>
        </button>

        {/* Search History drawer trigger */}
        <button
          onClick={onOpenHistory}
          className="p-1.5 sm:px-2 sm:py-1 flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 rounded transition-colors"
          title="Search History [H]"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden md:inline">History</span>
          <kbd className="hidden lg:inline text-[9px] opacity-60 bg-neutral-800/80 px-1 rounded">h</kbd>
        </button>

        {/* Category Customizer trigger */}
        <button
          onClick={onOpenCategories}
          className="p-1.5 sm:px-2 sm:py-1 flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 rounded transition-colors"
          title="Customize Categories"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Filters</span>
        </button>

        {/* Download Desktop App trigger */}
        {onOpenDownloadDesktop && (
          <button
            onClick={onOpenDownloadDesktop}
            className="p-1.5 sm:px-2.5 sm:py-1 flex items-center gap-1.5 text-xs font-mono text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/80 rounded transition-colors shadow-xs"
            title="Download CHROS for Windows 11 & 10 (Double-Click Desktop App, No Terminal)"
          >
            <MonitorDown className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-semibold">Windows 11/10 App</span>
            <span className="sm:hidden font-semibold">App</span>
          </button>
        )}

        {/* Keyboard Shortcuts Cheatsheet trigger */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 sm:px-2 sm:py-1 flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 rounded transition-colors"
          title="Keyboard Shortcuts [?]"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <kbd className="text-[10px] text-neutral-400 bg-neutral-800 px-1 rounded">?</kbd>
        </button>

        {/* Theme mode cycle (Dark -> OLED -> Light) */}
        <button
          onClick={onThemeCycle}
          className="p-1.5 sm:px-2.5 sm:py-1 flex items-center gap-1.5 text-xs font-mono text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 rounded transition-colors"
          title={`Theme: ${theme.toUpperCase()} (Cycle [T])`}
        >
          {theme === 'oled' ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline text-[11px]">OLED</span>
            </>
          ) : theme === 'dark' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-neutral-300" />
              <span className="hidden sm:inline text-[11px]">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline text-[11px]">Light</span>
            </>
          )}
          <kbd className="hidden lg:inline text-[9px] opacity-60 bg-neutral-800/80 px-1 rounded">t</kbd>
        </button>

        {/* Google OAuth Auth Section */}
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-full border border-neutral-700/80 hover:border-neutral-500 transition-colors focus:outline-none"
              title={`Signed in as ${user.displayName || user.email}`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center font-mono">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="pb-3 border-b border-neutral-800">
                  <div className="text-xs font-semibold text-neutral-100 truncate">
                    {user.displayName || 'Google User'}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                    {user.email}
                  </div>
                </div>

                <div className="py-2.5 space-y-1 text-xs font-mono text-neutral-300">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 py-1">
                    <span className="flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Firebase Sync</span>
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 py-1">
                    <span>Session Mode</span>
                    <span className={ephemeralMode ? 'text-amber-400' : 'text-neutral-300'}>
                      {ephemeralMode ? 'Ephemeral' : 'Cloud Sync'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onSignInGoogle}
            disabled={isAuthLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-white text-neutral-950 font-semibold hover:bg-neutral-200 transition-colors shadow-xs disabled:opacity-50"
            title="Sign in with Google OAuth / One Tap"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"/>
            </svg>
            <span className="hidden sm:inline">Google Sign In</span>
            <span className="sm:hidden">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
