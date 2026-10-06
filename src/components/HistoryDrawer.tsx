import React, { useState } from 'react';
import { HistoryItem, SavedItem } from '../types';
import { 
  X, 
  History, 
  Trash2, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Bookmark, 
  ExternalLink,
  Cloud,
  Globe
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  savedItems: SavedItem[];
  ephemeralMode: boolean;
  isLoggedIn: boolean;
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
  onDeleteSavedItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  savedItems,
  ephemeralMode,
  isLoggedIn,
  onSelectQuery,
  onClearHistory,
  onDeleteSavedItem,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');

  if (!isOpen) return null;

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md h-full bg-neutral-900 border-l border-neutral-800 p-5 shadow-2xl flex flex-col animate-in slide-in-from-right duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            {activeTab === 'history' ? (
              <History className="w-4 h-4 text-emerald-400" />
            ) : (
              <Bookmark className="w-4 h-4 text-emerald-400" />
            )}
            <h2 className="font-mono text-sm font-semibold tracking-wider text-neutral-100 uppercase">
              {activeTab === 'history' ? 'Search History' : 'Saved Research'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-100 transition-colors"
            title="Close [Esc]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-950/80 rounded-lg border border-neutral-800 my-3">
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1.5 px-3 rounded-md text-xs font-mono transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-3 h-3" />
            <span>History ({history.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-1.5 px-3 rounded-md text-xs font-mono transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>Saved ({savedItems.length})</span>
          </button>
        </div>

        {/* Privacy Session Notice or Cloud Sync status */}
        {ephemeralMode ? (
          <div className="mb-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-300">
              <span className="font-mono font-semibold">Ephemeral Mode Active</span>
              <p className="text-emerald-400/80 text-[11px] mt-0.5 leading-relaxed">
                History is in-memory only and will be automatically purged when this session ends.
              </p>
            </div>
          </div>
        ) : isLoggedIn ? (
          <div className="mb-3 p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 flex items-center gap-2 text-xs font-mono text-cyan-300">
            <Cloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Synced with Google Firebase Firestore</span>
          </div>
        ) : null}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1">
          {activeTab === 'history' ? (
            history.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-neutral-500">
                <Clock className="w-8 h-8 stroke-1 text-neutral-600 mb-2" />
                <p className="text-xs font-mono">No recent searches recorded.</p>
                <p className="text-[11px] text-neutral-600 mt-1">Queries you execute will appear here.</p>
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectQuery(item.query);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg bg-neutral-950/50 hover:bg-neutral-800/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors group flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs sm:text-sm font-medium text-neutral-200 group-hover:text-emerald-400 transition-colors truncate">
                      {item.query}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-neutral-500">
                      <span>{formatTime(item.timestamp)}</span>
                      <span>·</span>
                      <span className="uppercase">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-300 shrink-0 transition-colors" />
                </button>
              ))
            )
          ) : (
            savedItems.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-neutral-500">
                <Bookmark className="w-8 h-8 stroke-1 text-neutral-600 mb-2" />
                <p className="text-xs font-mono">No saved bookmarks yet.</p>
                <p className="text-[11px] text-neutral-600 mt-1">Click the bookmark icon on any search result to save it here.</p>
              </div>
            ) : (
              savedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-neutral-950/50 border border-neutral-800/80 hover:border-neutral-700 transition-colors flex items-start justify-between gap-2"
                >
                  <div className="overflow-hidden pr-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 mb-1">
                      <Globe className="w-3 h-3 text-neutral-500" />
                      <span className="truncate">{item.domain}</span>
                      <span>·</span>
                      <span>{formatTime(item.timestamp)}</span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-neutral-200 hover:text-emerald-400 transition-colors line-clamp-1 flex items-center gap-1"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 text-neutral-500" />
                    </a>
                    {item.snippet && (
                      <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                        {item.snippet}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteSavedItem(item.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors shrink-0"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
          {activeTab === 'history' ? (
            <button
              onClick={onClearHistory}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History Now</span>
            </button>
          ) : (
            <span className="text-[11px] font-mono text-neutral-500">
              {savedItems.length} saved resources
            </span>
          )}

          <span className="text-[10px] font-mono text-neutral-500">
            {activeTab === 'history' ? `${history.length} items` : `${savedItems.length} bookmarks`}
          </span>
        </div>
      </div>
    </div>
  );
};
