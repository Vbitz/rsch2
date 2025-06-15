'use client';

import { useState } from 'react';
import { SearchResult } from '@/types/paper';

const API_BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export function useSemanticScholar() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchPapers = async (query: string): Promise<SearchResult[]> => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/paper/search?query=${encodeURIComponent(query)}&fields=paperId,title,abstract,authors,year,citationCount,url,venue,publicationDate&limit=20`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.data.map((paper: any) => ({
        paperId: paper.paperId,
        title: paper.title || 'Untitled',
        abstract: paper.abstract || 'No abstract available',
        authors: paper.authors || [],
        year: paper.year || 0,
        citationCount: paper.citationCount || 0,
        url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
        venue: paper.venue,
        publicationDate: paper.publicationDate,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setSearchError(errorMessage);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchPapers,
    isSearching,
    searchError,
  };
}