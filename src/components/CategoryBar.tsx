import React from 'react';
import { SearchCategory } from '../types';
import { Plus } from 'lucide-react';

interface CategoryBarProps {
  categories: SearchCategory[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onOpenCustomize: () => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  onOpenCustomize,
}) => {
  const enabledCategories = categories.filter((c) => c.enabled);

  return (
    <div className="w-full flex items-center justify-between border-b border-neutral-800/80 pb-2 mb-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {enabledCategories.map((cat, idx) => {
          const isActive = cat.id === activeCategoryId;
          const keyNum = idx + 1 <= 9 ? idx + 1 : undefined;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-neutral-100 text-neutral-900 border-neutral-100 font-semibold shadow-xs'
                  : 'bg-neutral-900/60 text-neutral-400 border-neutral-800/80 hover:text-neutral-200 hover:bg-neutral-800/60 hover:border-neutral-700'
              }`}
              title={`${cat.description} [${keyNum || ''}]`}
            >
              <span>{cat.label}</span>
              {keyNum && (
                <kbd
                  className={`text-[9px] px-1 py-0.2 rounded ${
                    isActive
                      ? 'bg-neutral-300 text-neutral-900'
                      : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {keyNum}
                </kbd>
              )}
            </button>
          );
        })}

        {/* Add / customize categories shortcut button */}
        <button
          onClick={onOpenCustomize}
          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-mono text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 border border-dashed border-neutral-800 hover:border-neutral-700 transition-colors"
          title="Add or manage custom categories"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Customize</span>
        </button>
      </div>
    </div>
  );
};
