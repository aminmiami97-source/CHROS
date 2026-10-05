export type ThemeMode = 'dark' | 'oled' | 'light';

export interface SearchSource {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

export interface SearchResponse {
  query: string;
  overview?: string;
  sources?: SearchSource[];
  webSearchQueries?: string[];
  googleDirectUrl?: string;
  category?: string;
  grounded?: boolean;
  quotaLimited?: boolean;
  cached?: boolean;
  durationMs?: number;
  bangRedirect?: {
    bang: string;
    destinationUrl: string;
    query: string;
  };
}

export interface SearchCategory {
  id: string;
  label: string;
  keyNumber: number;
  description: string;
  domains: string[];
  enabled: boolean;
  isCustom?: boolean;
}

export interface SearchTrend {
  id: string;
  query: string;
  category: string;
  change: string;
  tag: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  category: string;
  timestamp: number;
  resultsCount: number;
}
