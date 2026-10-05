import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      group: 'Search & Input',
      shortcuts: [
        { key: '/', desc: 'Focus search input from anywhere' },
        { key: 'Ctrl + K', desc: 'Focus search input (standard)' },
        { key: 'Esc', desc: 'Clear search query or dismiss modals' },
        { key: 'c', desc: 'Quickly clear search box' },
        { key: 'o', desc: 'Open current query directly on Google.com' },
      ],
    },
    {
      group: 'Result Navigation',
      shortcuts: [
        { key: 'j  or  ↓', desc: 'Move to next search result' },
        { key: 'k  or  ↑', desc: 'Move to previous search result' },
        { key: 'Enter', desc: 'Open currently selected result' },
        { key: 'Shift + Enter', desc: 'Open selected result in new background tab' },
      ],
    },
    {
      group: 'Categories & Filters',
      shortcuts: [
        { key: '1 - 6', desc: 'Switch search category instantly (All, Tech, Research, News...)' },
      ],
    },
    {
      group: 'Session & Modes',
      shortcuts: [
        { key: 't', desc: 'Cycle theme (Dark → OLED Pure Black → Light)' },
        { key: 'p', desc: 'Toggle Ephemeral Privacy mode (auto-wipe on exit)' },
        { key: 'h', desc: 'Open / close search history drawer' },
        { key: '?', desc: 'Toggle this keyboard shortcuts cheatsheet' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl p-5 sm:p-6 text-neutral-200 animate-in fade-in zoom-in-95 duration-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <h2 className="font-mono text-sm font-semibold tracking-wider text-neutral-100 uppercase">
              Keyboard Shortcuts
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

        {/* Shortcuts List */}
        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-1">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h3 className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                {group.group}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((sc, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between py-1 px-2 rounded bg-neutral-950/40 border border-neutral-800/60 text-xs"
                  >
                    <span className="text-neutral-300">{sc.desc}</span>
                    <kbd className="font-mono text-[11px] text-emerald-400 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700/80 shadow-xs whitespace-nowrap">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>Engineered for power users & speed</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
