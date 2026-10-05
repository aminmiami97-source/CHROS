import { SearchCategory } from './types';

export const DEFAULT_CATEGORIES: SearchCategory[] = [
  {
    id: 'all',
    label: 'All',
    keyNumber: 1,
    description: 'Comprehensive web search powered by Google index',
    domains: [],
    enabled: true,
  },
  {
    id: 'tech',
    label: 'Tech & Code',
    keyNumber: 2,
    description: 'Developer documentation, GitHub, StackOverflow, and code architecture',
    domains: ['github.com', 'stackoverflow.com', 'developer.mozilla.org', 'dev.to', 'news.ycombinator.com'],
    enabled: true,
  },
  {
    id: 'academic',
    label: 'Research',
    keyNumber: 3,
    description: 'Peer-reviewed research, arXiv preprints, scientific benchmarks, and papers',
    domains: ['arxiv.org', 'nature.com', 'scholar.google.com', 'semanticscholar.org', 'wikipedia.org'],
    enabled: true,
  },
  {
    id: 'news',
    label: 'News',
    keyNumber: 4,
    description: 'Recent journalistic coverage, verified global updates, and timely headlines',
    domains: ['reuters.com', 'apnews.com', 'bloomberg.com', 'bbc.com', 'theverge.com'],
    enabled: true,
  },
  {
    id: 'discussions',
    label: 'Discussions',
    keyNumber: 5,
    description: 'Technical community discussions, Reddit postmortems, and forum insight',
    domains: ['news.ycombinator.com', 'reddit.com', 'stackexchange.com', 'lobste.rs'],
    enabled: true,
  },
  {
    id: 'docs',
    label: 'Docs & Specs',
    keyNumber: 6,
    description: 'Official API documentation, RFCs, specification standards, and language guides',
    domains: ['rfc-editor.org', 'w3.org', 'tc39.es', 'docs.python.org', 'rust-lang.org', 'go.dev'],
    enabled: true,
  },
];

export const BANG_COMMANDS = [
  { bang: '!g', name: 'Google Search', url: 'https://www.google.com/search?q={q}' },
  { bang: '!gh', name: 'GitHub Repositories', url: 'https://github.com/search?q={q}' },
  { bang: '!so', name: 'StackOverflow', url: 'https://stackoverflow.com/search?q={q}' },
  { bang: '!w', name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Search?search={q}' },
  { bang: '!hn', name: 'Hacker News', url: 'https://hn.algolia.com/?q={q}' },
  { bang: '!arxiv', name: 'arXiv Papers', url: 'https://arxiv.org/search/?query={q}&searchtype=all' },
  { bang: '!r', name: 'Reddit', url: 'https://www.reddit.com/search/?q={q}' },
  { bang: '!yt', name: 'YouTube', url: 'https://www.youtube.com/results?search_query={q}' },
];
