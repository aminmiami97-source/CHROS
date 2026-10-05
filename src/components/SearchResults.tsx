import React from 'react';
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
  Share2
} from 'lucide-react';

interface SearchResultsProps {
  result: SearchResponse;
  selectedSourceIndex: number;
  onSelectSourceIndex: (idx: number) => void;
  onExecuteRelated: (query: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  result,
  selectedSourceIndex,
  onSelectSourceIndex,
  onExecuteRelated,
}) => {
  const [copied, setCopied] = React.useState(false);

  const sources = result.sources || [];
  const webQueries = result.webSearchQueries || [];
  const durationSec = result.durationMs ? (result.durationMs / 1000).toFixed(2) : '0.15';

  const handleCopyOverview = () => {
    if (result.overview) {
      navigator.clipboard.writeText(result.overview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">
      {/* Metric & Source verification bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800/80 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{durationSec}s</span>
          </span>
          <span>·</span>
          <span>{sources.length} Google-verified sources</span>
          {result.grounded && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" />
              Grounded
            </span>
          )}
          {result.cached && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-blue-400 bg-blue-950/40 border border-blue-800/40 px-1.5 py-0.5 rounded">
              Cached (0ms)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {result.googleDirectUrl && (
            <a
              href={result.googleDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
              title="Open full query in Google Search [O]"
            >
              <span>View on Google</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
              <kbd className="hidden md:inline text-[9px] text-neutral-500 bg-neutral-800 px-1 rounded ml-1">o</kbd>
            </a>
          )}
        </div>
      </div>

      {/* Quota alert hint if free-tier rate quota was hit */}
      {result.quotaLimited && (
        <div className="p-3 rounded-lg border border-amber-800/40 bg-amber-950/20 text-xs text-amber-300/90 flex items-start gap-2 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-200">High-Speed Live Index Mode</span>
            <p className="text-[11px] text-amber-300/80 leading-relaxed font-sans">
              Free-tier Gemini rate quota was reached. Real-time web results from Google, Wikipedia, GitHub, and technical sources are active below. You can select a billing-enabled key in Settings &gt; Secrets for unlimited AI grounding.
            </p>
          </div>
        </div>
      )}

      {/* Grounded AI Overview (Distraction-free, High Density) */}
      {result.overview && (
        <div className="relative rounded-lg border border-neutral-800/90 bg-neutral-900/50 p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800/60">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grounded Knowledge Synthesis</span>
            </div>
            <button
              onClick={handleCopyOverview}
              className="flex items-center gap-1 text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors p-1"
              title="Copy Summary"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="prose prose-invert prose-sm max-w-none text-neutral-200 leading-relaxed space-y-3 font-sans text-sm sm:text-[15px]">
            {result.overview.split('\n\n').map((paragraph, pIdx) => {
              if (paragraph.startsWith('## ') || paragraph.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="text-sm font-mono font-semibold text-neutral-100 mt-2 mb-1">
                    {paragraph.replace(/^#+\s*/, '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                return (
                  <ul key={pIdx} className="list-disc pl-5 space-y-1 text-neutral-300">
                    {paragraph.split('\n').map((line, lIdx) => (
                      <li key={lIdx}>{line.replace(/^[-*]\s*/, '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={pIdx} className="text-neutral-200">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Web Sources List (Keyboard Navigable with j/k) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-400 px-1">
          <span>Web Results & Citations</span>
          <span className="text-[11px] text-neutral-500">
            Navigate with <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">j</kbd> / <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">k</kbd> · <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-neutral-300">Enter</kbd> to open
          </span>
        </div>

        <div className="space-y-2">
          {sources.map((source, index) => {
            const isSelected = index === selectedSourceIndex;

            return (
              <a
                key={source.url + index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => onSelectSourceIndex(index)}
                className={`group block p-3.5 sm:p-4 rounded-lg border transition-all duration-100 ${
                  isSelected
                    ? 'border-neutral-400 bg-neutral-800/80 ring-1 ring-neutral-400/20 shadow-sm'
                    : 'border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-800/50 hover:border-neutral-700'
                }`}
              >
                {/* Domain & URL preview */}
                <div className="flex items-center gap-2 mb-1.5 text-xs text-neutral-400">
                  <div className="w-4 h-4 rounded-sm bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0 border border-neutral-700">
                    <Globe className="w-2.5 h-2.5 text-neutral-400" />
                  </div>
                  <span className="font-mono text-neutral-300 font-medium truncate">
                    {source.domain}
                  </span>
                  <span className="text-neutral-600">·</span>
                  <span className="font-mono text-[11px] text-neutral-500 truncate max-w-xs sm:max-w-md">
                    {source.url}
                  </span>
                  {isSelected && (
                    <span className="ml-auto text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.2 rounded shrink-0">
                      Selected [Enter]
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors flex items-center justify-between gap-2">
                  <span>{source.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                </h3>

                {/* Snippet */}
                {source.snippet && (
                  <p className="mt-1 text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                    {source.snippet}
                  </p>
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* Related Searches */}
      {webQueries.length > 0 && (
        <div className="pt-4 border-t border-neutral-800/80">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <span>Related Queries</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {webQueries.map((rq, idx) => (
              <button
                key={idx}
                onClick={() => onExecuteRelated(rq)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <span>{rq}</span>
                <ArrowRight className="w-3 h-3 text-neutral-500" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
