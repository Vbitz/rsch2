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
}

export interface Author {
  authorId: string;
  name: string;
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