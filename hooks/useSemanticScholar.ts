'use client';

import { useState } from 'react';
import { SearchResult, PaperReference } from '@/types/paper';

const API_BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export function useSemanticScholar() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSavingPaper, setIsSavingPaper] = useState<Record<string, boolean>>({});

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

  const fetchCompleteePaperData = async (paperId: string): Promise<{
    references: PaperReference[];
    citations: PaperReference[];
  }> => {
    setIsSavingPaper(prev => ({ ...prev, [paperId]: true }));

    try {
      // Fetch references and citations in parallel
      const [referencesResponse, citationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/paper/${paperId}/references?fields=paperId,title,authors,year,venue,citationCount,url&limit=50`),
        fetch(`${API_BASE_URL}/paper/${paperId}/citations?fields=paperId,title,authors,year,venue,citationCount,url&limit=50`)
      ]);

      const references = referencesResponse.ok ? 
        (await referencesResponse.json()).data.map((ref: any) => ({
          paperId: ref.citedPaper.paperId,
          title: ref.citedPaper.title || 'Untitled',
          authors: ref.citedPaper.authors || [],
          year: ref.citedPaper.year,
          venue: ref.citedPaper.venue,
          citationCount: ref.citedPaper.citationCount,
          url: ref.citedPaper.url || `https://www.semanticscholar.org/paper/${ref.citedPaper.paperId}`,
        })) : [];

      const citations = citationsResponse.ok ?
        (await citationsResponse.json()).data.map((citation: any) => ({
          paperId: citation.citingPaper.paperId,
          title: citation.citingPaper.title || 'Untitled',
          authors: citation.citingPaper.authors || [],
          year: citation.citingPaper.year,
          venue: citation.citingPaper.venue,
          citationCount: citation.citingPaper.citationCount,
          url: citation.citingPaper.url || `https://www.semanticscholar.org/paper/${citation.citingPaper.paperId}`,
        })) : [];

      return { references, citations };
    } catch (error) {
      console.error('Error fetching complete paper data:', error);
      return { references: [], citations: [] };
    } finally {
      setIsSavingPaper(prev => ({ ...prev, [paperId]: false }));
    }
  };

  return {
    searchPapers,
    fetchCompleteePaperData,
    isSearching,
    searchError,
    isSavingPaper,
  };
}