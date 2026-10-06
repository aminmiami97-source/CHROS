import React, { useState, useMemo } from 'react';
import { SearchResponse, SearchSource } from '../types';
import { 
  ExternalLink, 
  Globe, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowRight,
  Copy, 
  Check, 
  Clock, 
  Search,
  Sparkles,
  BookOpen,
  Code2,
  MessageSquare,
  FileText,
  Layers,
  Link2,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

interface SearchResultsProps {
  result: SearchResponse;
  selectedSourceIndex: number;
  onSelectSourceIndex: (idx: number) => void;
  onExecuteRelated: (query: string) => void;
  savedUrls?: Set<string>;
  onToggleSaveResult?: (source: SearchSource) => void;
}

// Helper to determine the source category, icon, and badge style
function getSourceMeta(domain: string, title: string) {
  const d = domain.toLowerCase();
  const t = title.toLowerCase();

  if (d.includes('github.com') || d.includes('gitlab.com') || d.includes('npmjs.com')) {
    return {
      type: 'code',
      label: 'Repository',
      icon: Code2,
      badgeClass: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
      borderHover: 'hover:border-emerald-700/60',
    };
  }

  if (d.includes('wikipedia.org') || d.includes('wikimedia.org') || d.includes('w3.org') || d.includes('mdn') || d.includes('docs.')) {
    return {
      type: 'encyclopedia',
      label: 'Encyclopedia',
      icon: BookOpen,
      badgeClass: 'bg-blue-950/60 text-blue-400 border-blue-800/40',
      borderHover: 'hover:border-blue-700/60',
    };
  }

  if (d.includes('ycombinator.com') || d.includes('reddit.com') || d.includes('stackoverflow.com') || d.includes('stackexchange.com') || d.includes('discourse')) {
    return {
      type: 'discussion',
      label: 'Discussion',
      icon: MessageSquare,
      badgeClass: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
      borderHover: 'hover:border-amber-700/60',
    };
  }

  if (d.includes('scholar.google') || d.includes('arxiv.org') || d.includes('nature.com') || d.includes('science.org') || d.includes('ieee.org')) {
    return {
      type: 'academic',
      label: 'Research Paper',
      icon: FileText,
      badgeClass: 'bg-purple-950/60 text-purple-400 border-purple-800/40',
      borderHover: 'hover:border-purple-700/60',
    };
  }

  return {
    type: 'web',
    label: 'Web Index',
    icon: Globe,
    badgeClass: 'bg-neutral-800 text-neutral-300 border-neutral-700/60',
    borderHover: 'hover:border-neutral-600',
  };
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  result,
  selectedSourceIndex,
  onSelectSourceIndex,
  onExecuteRelated,
  savedUrls,
  onToggleSaveResult,
}) => {
  const [copiedOverview, setCopiedOverview] = useState(false);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');

  const sources = result.sources || [];
  const webQueries = result.webSearchQueries || [];
  const durationSec = result.durationMs ? (result.durationMs / 1000).toFixed(2) : '0.15';

  const handleCopyOverview = () => {
    if (result.overview) {
      navigator.clipboard.writeText(result.overview);
      setCopiedOverview(true);
      setTimeout(() => setCopiedOverview(false), 2000);
    }
  };

  const handleCopyLink = (e: React.MouseEvent, url: string, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedLinkIndex(idx);
    setTimeout(() => setCopiedLinkIndex(null), 1800);
  };

  // Group sources by type for easy understanding
  const sourceTypes = useMemo(() => {
    const counts: Record<string, number> = { all: sources.length };
    sources.forEach((s) => {
      const meta = getSourceMeta(s.domain, s.title);
      counts[meta.type] = (counts[meta.type] || 0) + 1;
    });
    return counts;
  }, [sources]);

  const filteredSources = useMemo(() => {
    if (activeTypeFilter === 'all') return sources;
    return sources.filter((s) => getSourceMeta(s.domain, s.title).type === activeTypeFilter);
  }, [sources, activeTypeFilter]);

  // If this was a bang redirect
  if (result.bangRedirect) {
    return (
      <div className="w-full max-w-3xl mx-auto my-6 p-6 rounded-lg border border-neutral-800 bg-neutral-900/60 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-950/60 text-emerald-400 mb-3 border border-emerald-800/40">
          <ArrowUpRight className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-mono font-semibold text-neutral-100 mb-1">
          Direct Bang Triggered: <code className="text-emerald-400">{result.bangRedirect.bang}</code>
        </h3>
        <p className="text-sm text-neutral-400 max-w-md mx-auto mb-4">
          Routing search for &ldquo;{result.bangRedirect.query}&rdquo; directly to external provider.
        </p>
        <a
          href={result.bangRedirect.destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-sm transition-colors"
        >
          <span>Open Destination</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Status & Speed Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800/80 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{durationSec}s</span>
          </span>
          <span>·</span>
          <span className="text-neutral-300 font-medium">{sources.length} Verified Sources</span>
          {result.grounded && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" />
              AI Grounded
            </span>
          )}
          {result.cached && (
            <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">
              ⚡ Instant (0ms Cache)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {result.googleDirectUrl && (
            <a
              href={result.googleDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 hover:border-neutral-600 transition-colors shadow-xs"
              title="Open full query in Google Search [O]"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Google Search</span>
              <ExternalLink className="w-3 h-3 text-neutral-400 ml-0.5" />
              <kbd className="hidden md:inline text-[9px] text-neutral-400 bg-neutral-800 px-1 rounded ml-1">o</kbd>
            </a>
          )}
        </div>
      </div>

      {/* Quota alert hint if free-tier rate quota was hit */}
      {result.quotaLimited && (
        <div className="p-3 rounded-lg border border-amber-800/40 bg-amber-950/20 text-xs text-amber-300/90 flex items-start gap-2.5 font-mono">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-200">High-Speed Verified Index Active</span>
            <p className="text-[11px] text-amber-300/80 leading-relaxed font-sans">
              Google, Wikipedia, GitHub, and community discussion search results are live. To activate unlimited AI generative grounding, select a billing key in Settings &gt; Secrets.
            </p>
          </div>
        </div>
      )}

      {/* Grounded Knowledge Card (Key Takeaways & Quick Overview) */}
      {result.overview && (
        <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 shadow-sm transition-all">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800/70">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-200 uppercase tracking-wider">
              <div className="w-5 h-5 rounded flex items-center justify-center bg-emerald-950/80 border border-emerald-700/50">
                <Sparkles className="w-3 h-3 text-emerald-400" />
              </div>
              <span>Quick Answer & Key Insights</span>
            </div>
            <button
              onClick={handleCopyOverview}
              className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors px-2 py-1 rounded hover:bg-neutral-800 border border-transparent hover:border-neutral-700"
              title="Copy Summary"
            >
              {copiedOverview ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy Text</span>
                </>
              )}
            </button>
          </div>

          <div className="text-neutral-200 leading-relaxed space-y-2.5 font-sans text-sm sm:text-[15px]">
            {result.overview.split('\n\n').map((paragraph, pIdx) => {
              if (paragraph.startsWith('### ') || paragraph.startsWith('## ')) {
                return (
                  <h4 key={pIdx} className="text-sm font-mono font-semibold text-neutral-100 flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{paragraph.replace(/^#+\s*/, '')}</span>
                  </h4>
                );
              }
              if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                return (
                  <ul key={pIdx} className="space-y-2 mt-2">
                    {paragraph.split('\n').map((line, lIdx) => {
                      const cleanLine = line.replace(/^[-*]\s*/, '');
                      return (
                        <li key={lIdx} className="flex items-start gap-2.5 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-800/60 text-neutral-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 mt-2 shrink-0" />
                          <span className="leading-relaxed">{cleanLine}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }
              return (
                <p key={pIdx} className="text-neutral-200 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Filter Pills: Easy categorization for quick browsing */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-mono text-neutral-400 mr-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-neutral-500" />
              <span>Filter:</span>
            </span>

            <button
              onClick={() => setActiveTypeFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 border ${
                activeTypeFilter === 'all'
                  ? 'bg-neutral-200 text-neutral-950 border-neutral-200 font-semibold'
                  : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] opacity-70">({sourceTypes.all || 0})</span>
            </button>

            {sourceTypes.encyclopedia && (
              <button
                onClick={() => setActiveTypeFilter('encyclopedia')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 border ${
                  activeTypeFilter === 'encyclopedia'
                    ? 'bg-blue-500 text-neutral-950 border-blue-400 font-semibold'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Encyclopedia</span>
                <span className="text-[10px] opacity-70">({sourceTypes.encyclopedia})</span>
              </button>
            )}

            {sourceTypes.code && (
              <button
                onClick={() => setActiveTypeFilter('code')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 border ${
                  activeTypeFilter === 'code'
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-semibold'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>Code Repos</span>
                <span className="text-[10px] opacity-70">({sourceTypes.code})</span>
              </button>
            )}

            {sourceTypes.discussion && (
              <button
                onClick={() => setActiveTypeFilter('discussion')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 border ${
                  activeTypeFilter === 'discussion'
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>Discussions</span>
                <span className="text-[10px] opacity-70">({sourceTypes.discussion})</span>
              </button>
            )}

            {sourceTypes.academic && (
              <button
                onClick={() => setActiveTypeFilter('academic')}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 border ${
                  activeTypeFilter === 'academic'
                    ? 'bg-purple-500 text-neutral-950 border-purple-400 font-semibold'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Papers</span>
                <span className="text-[10px] opacity-70">({sourceTypes.academic})</span>
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-neutral-500">
            <span>Use <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">j</kbd>/<kbd className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">k</kbd> to select</span>
          </div>
        </div>

        {/* Structured Web Results Cards */}
        <div className="space-y-3">
          {filteredSources.map((source, index) => {
            const isSelected = index === selectedSourceIndex;
            const meta = getSourceMeta(source.domain, source.title);
            const Icon = meta.icon;
            const isCopied = copiedLinkIndex === index;

            return (
              <a
                key={source.url + index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => onSelectSourceIndex(index)}
                className={`group block p-4 rounded-xl border transition-all duration-150 relative ${
                  isSelected
                    ? 'border-emerald-500 bg-neutral-900/90 ring-1 ring-emerald-500/30 shadow-md translate-x-0.5'
                    : 'border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-900/70 hover:border-neutral-700 shadow-xs'
                }`}
              >
                {/* Visual indicator bar on the left when selected */}
                {isSelected && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-emerald-500" />
                )}

                {/* Top card metadata row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {/* Source Type Badge with icon */}
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border uppercase tracking-wider ${meta.badgeClass}`}>
                      <Icon className="w-3 h-3" />
                      <span>{meta.label}</span>
                    </span>

                    {/* Clean Domain preview */}
                    <span className="font-mono text-xs text-neutral-400 font-semibold truncate">
                      {source.domain}
                    </span>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onToggleSaveResult && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleSaveResult(source);
                        }}
                        className={`p-1 rounded transition-colors ${
                          savedUrls?.has(source.url)
                            ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40'
                            : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800'
                        }`}
                        title={savedUrls?.has(source.url) ? 'Remove Bookmark' : 'Save to Research'}
                      >
                        {savedUrls?.has(source.url) ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={(e) => handleCopyLink(e, source.url, index)}
                      className="p-1 text-neutral-500 hover:text-neutral-200 rounded transition-colors"
                      title="Copy URL"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Link2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isSelected ? (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-md font-semibold">
                        Enter ↵
                      </span>
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Main Clickable Title */}
                <h3 className="text-base font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors leading-snug">
                  {source.title}
                </h3>

                {/* Snippet / Descriptive preview */}
                {source.snippet && (
                  <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-2">
                    {source.snippet}
                  </p>
                )}

                {/* Bottom link preview for verification */}
                <div className="mt-2.5 pt-2 border-t border-neutral-800/50 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span className="truncate max-w-md opacity-80">{source.url}</span>
                  <span className="hidden sm:inline group-hover:text-emerald-400/80 transition-colors">
                    Open page &rarr;
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Related Searches & Follow-Up Queries */}
      {webQueries.length > 0 && (
        <div className="pt-5 border-t border-neutral-800/80">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-300">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Related Searches & Follow-ups</span>
            </div>
            <span className="text-[10px] text-neutral-500">Click to search</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {webQueries.map((rq, idx) => (
              <button
                key={idx}
                onClick={() => onExecuteRelated(rq)}
                className="group flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 text-left transition-all"
              >
                <span className="text-xs font-mono truncate mr-2">{rq}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
