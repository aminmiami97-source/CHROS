import React from 'react';
import { HistoryItem } from '../types';
import { X, History, Trash2, ShieldCheck, ArrowRight, Clock } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  ephemeralMode: boolean;
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  ephemeralMode,
  onSelectQuery,
  onClearHistory,
}) => {
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
            <History className="w-4 h-4 text-emerald-400" />
            <h2 className="font-mono text-sm font-semibold tracking-wider text-neutral-100 uppercase">
              Search History
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

        {/* Privacy Session Notice */}
        {ephemeralMode && (
          <div className="my-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-300">
              <span className="font-mono font-semibold">Ephemeral Mode Active</span>
              <p className="text-emerald-400/80 text-[11px] mt-0.5 leading-relaxed">
                History is transient and will be automatically purged when this session ends or browser tab closes.
              </p>
            </div>
          </div>
        )}

        {/* History items */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
          {history.length === 0 ? (
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
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History Now</span>
          </button>

          <span className="text-[10px] font-mono text-neutral-500">
            {history.length} {history.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
    </div>
  );
};
