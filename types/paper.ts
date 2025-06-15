export interface Paper {
  paperId: string;
  title: string;
  abstract: string;
  authors: Author[];
  year: number;
  citationCount: number;
  url: string;
  venue?: string;
  publicationDate?: string;
  savedAt: string;
  references?: PaperReference[];
  citations?: PaperReference[];
  referencesLoaded?: boolean;
  citationsLoaded?: boolean;
  isExpanded?: boolean;
  isExplicitlyAdded?: boolean;
  referencedBy?: string[];
  citedBy?: string[];
  citescore?: number;
  hasCompleteFetch?: boolean;
  lastFetchAttempt?: string;
  fetchErrors?: string[];
}

export interface Author {
  authorId: string;
  name: string;
}

export interface PaperReference {
  paperId: string;
  title: string;
  authors: Author[];
  year?: number;
  venue?: string;
  citationCount?: number;
  url?: string;
}

export interface SearchResult {
  paperId: string;
  title: string;
  abstract: string;
  authors: Author[];
  year: number;
  citationCount: number;
  url: string;
  venue?: string;
  publicationDate?: string;
}