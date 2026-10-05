import React, { useState } from 'react';
import { SearchCategory } from '../types';
import { X, Plus, Trash2, Check, Sliders, RotateCcw } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../constants';

interface CategorySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: SearchCategory[];
  onSaveCategories: (cats: SearchCategory[]) => void;
}

export const CategorySettingsModal: React.FC<CategorySettingsModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
}) => {
  const [localCategories, setLocalCategories] = useState<SearchCategory[]>(categories);
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDomains, setNewDomains] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const updated = localCategories.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    setLocalCategories(updated);
    onSaveCategories(updated);
  };

  const handleDelete = (id: string) => {
    const updated = localCategories.filter((c) => c.id !== id);
    setLocalCategories(updated);
    onSaveCategories(updated);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const domains = newDomains
      .split(',')
      .map((d) => d.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
      .filter(Boolean);

    const newCat: SearchCategory = {
      id: `custom_${Date.now()}`,
      label: newLabel.trim(),
      keyNumber: localCategories.length + 1,
      description: newDesc.trim() || `Custom filter for ${newLabel}`,
      domains,
      enabled: true,
      isCustom: true,
    };

    const updated = [...localCategories, newCat];
    setLocalCategories(updated);
    onSaveCategories(updated);
    setNewLabel('');
    setNewDesc('');
    setNewDomains('');
    setShowAddForm(false);
  };

  const handleResetDefaults = () => {
    setLocalCategories(DEFAULT_CATEGORIES);
    onSaveCategories(DEFAULT_CATEGORIES);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl p-5 sm:p-6 text-neutral-200 animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="font-mono text-sm font-semibold tracking-wider text-neutral-100 uppercase">
              Customize Result Categories
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-400 my-3">
          Configure search categories to prioritize specific domain repositories, technical docs, or academic sources for ultra-fast research.
        </p>

        {/* Existing categories list */}
        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 my-3">
          {localCategories.map((cat, idx) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/50 border border-neutral-800/80"
            >
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                <button
                  type="button"
                  onClick={() => handleToggle(cat.id)}
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    cat.enabled
                      ? 'bg-emerald-500 border-emerald-400 text-neutral-950'
                      : 'border-neutral-700 bg-neutral-900 text-transparent'
                  }`}
                  title={cat.enabled ? 'Enabled' : 'Disabled'}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>

                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-neutral-200">
                      {cat.label}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-1 rounded">
                      Key [{idx + 1}]
                    </span>
                    {cat.isCustom && (
                      <span className="text-[9px] font-mono uppercase bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 px-1 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {cat.description}
                  </p>
                  {cat.domains.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cat.domains.slice(0, 4).map((d) => (
                        <span key={d} className="text-[9px] font-mono text-neutral-500 bg-neutral-900 px-1 py-0.2 rounded border border-neutral-800">
                          {d}
                        </span>
                      ))}
                      {cat.domains.length > 4 && (
                        <span className="text-[9px] font-mono text-neutral-500">
                          +{cat.domains.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {cat.isCustom && (
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors shrink-0"
                  title="Delete custom category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Category Form */}
        {showAddForm ? (
          <form onSubmit={handleAddCategory} className="p-3 rounded-lg border border-neutral-700 bg-neutral-950/70 space-y-2 mt-3">
            <h4 className="text-xs font-mono font-semibold text-neutral-200">New Category</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Category Name (e.g. AI & ML)"
                className="w-full text-xs font-mono py-1.5 px-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                required
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short Description"
                className="w-full text-xs font-mono py-1.5 px-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
              />
            </div>
            <input
              type="text"
              value={newDomains}
              onChange={(e) => setNewDomains(e.target.value)}
              placeholder="Target Domains (comma-separated: arxiv.org, huggingface.co)"
              className="w-full text-xs font-mono py-1.5 px-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-semibold rounded"
              >
                Save Category
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Category Filter</span>
          </button>
        )}

        {/* Footer */}
        <div className="pt-4 mt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-100 text-neutral-950 hover:bg-white font-semibold rounded text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
