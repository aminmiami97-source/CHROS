import React from 'react';
import { ThemeMode } from '../types';
import { 
  Sun, 
  Moon, 
  Sparkles, 
  Shield, 
  ShieldCheck, 
  Keyboard, 
  Sliders, 
  History,
  Zap
} from 'lucide-react';

interface HeaderProps {
  theme: ThemeMode;
  onThemeCycle: () => void;
  ephemeralMode: boolean;
  onToggleEphemeral: () => void;
  onOpenShortcuts: () => void;
  onOpenCategories: () => void;
  onOpenHistory: () => void;
  onLogoClick: () => void;
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
  onLogoClick,
  compact = false,
}) => {
  return (
    <header className={`w-full flex items-center justify-between transition-all duration-150 ${compact ? 'py-3' : 'py-5'}`}>
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

        {/* Minimalist speed & engine indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-400 border-l border-neutral-800/80 pl-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-neutral-400">Google Grounded</span>
        </div>
      </div>

      {/* Control Actions / Hotkey toggles */}
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
      </div>
    </header>
  );
};
