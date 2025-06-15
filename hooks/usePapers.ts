'use client';

import { useState, useEffect } from 'react';
import { Paper, SearchResult, PaperReference } from '@/types/paper';

const STORAGE_KEY = 'literature-review-papers';

function addReferencesAndCitationsToLibrary(
  currentPapers: Paper[], 
  parentPaperId: string, 
  references: PaperReference[], 
  citations: PaperReference[]
): Paper[] {
  const paperMap = new Map(currentPapers.map(p => [p.paperId, p]));
  
  // Add references to library
  references.forEach(ref => {
    if (!paperMap.has(ref.paperId)) {
      const referencePaper: Paper = {
        paperId: ref.paperId,
        title: ref.title,
        abstract: '',
        authors: ref.authors,
        year: ref.year || 0,
        citationCount: ref.citationCount || 0,
        url: ref.url || `https://www.semanticscholar.org/paper/${ref.paperId}`,
        venue: ref.venue,
        savedAt: new Date().toISOString(),
        isExpanded: false,
        referencesLoaded: false,
        citationsLoaded: false,
        references: [],
        citations: [],
        isExplicitlyAdded: false,
        referencedBy: [parentPaperId],
      };
      paperMap.set(ref.paperId, referencePaper);
    } else {
      const existingPaper = paperMap.get(ref.paperId)!;
      const referencedBy = existingPaper.referencedBy || [];
      if (!referencedBy.includes(parentPaperId)) {
        paperMap.set(ref.paperId, {
          ...existingPaper,
          referencedBy: [...referencedBy, parentPaperId]
        });
      }
    }
  });
  
  // Add citations to library
  citations.forEach(citation => {
    if (!paperMap.has(citation.paperId)) {
      const citationPaper: Paper = {
        paperId: citation.paperId,
        title: citation.title,
        abstract: '',
        authors: citation.authors,
        year: citation.year || 0,
        citationCount: citation.citationCount || 0,
        url: citation.url || `https://www.semanticscholar.org/paper/${citation.paperId}`,
        venue: citation.venue,
        savedAt: new Date().toISOString(),
        isExpanded: false,
        referencesLoaded: false,
        citationsLoaded: false,
        references: [],
        citations: [],
        isExplicitlyAdded: false,
        citedBy: [parentPaperId],
      };
      paperMap.set(citation.paperId, citationPaper);
    } else {
      const existingPaper = paperMap.get(citation.paperId)!;
      const citedBy = existingPaper.citedBy || [];
      if (!citedBy.includes(parentPaperId)) {
        paperMap.set(citation.paperId, {
          ...existingPaper,
          citedBy: [...citedBy, parentPaperId]
        });
      }
    }
  });

  // Update the parent paper with references and citations
  const parentPaper = paperMap.get(parentPaperId);
  if (parentPaper) {
    paperMap.set(parentPaperId, {
      ...parentPaper,
      references,
      citations,
      referencesLoaded: true,
      citationsLoaded: true
    });
  }

  return Array.from(paperMap.values());
}

export function usePapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPapers = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setPapers(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading papers from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPapers();
  }, []);

  const savePaper = async (searchResult: SearchResult, fetchCompleteData: (paperId: string) => Promise<{ references: PaperReference[], citations: PaperReference[] }>) => {
    // First add the paper with basic info
    const basicPaper: Paper = {
      ...searchResult,
      savedAt: new Date().toISOString(),
      isExpanded: false,
      referencesLoaded: false,
      citationsLoaded: false,
      references: [],
      citations: [],
      isExplicitlyAdded: true,
    };

    const newPapers = [...papers, basicPaper];
    setPapers(newPapers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPapers));

    // Then fetch complete data and update
    try {
      const { references, citations } = await fetchCompleteData(searchResult.paperId);
      
      const updatedPapers = addReferencesAndCitationsToLibrary(newPapers, searchResult.paperId, references, citations);
      
      setPapers(updatedPapers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPapers));
    } catch (error) {
      console.error('Error fetching complete paper data:', error);
    }
  };

  const removePaper = (paperId: string) => {
    const paperToRemove = papers.find(p => p.paperId === paperId);
    if (!paperToRemove) return;

    // If it's an explicitly added paper, remove it and clean up relationships
    if (paperToRemove.isExplicitlyAdded) {
      const newPapers = papers.map(paper => {
        // Remove references to the removed paper
        const referencedBy = (paper.referencedBy || []).filter(id => id !== paperId);
        const citedBy = (paper.citedBy || []).filter(id => id !== paperId);
        
        // If paper is no longer referenced/cited by anyone and not explicitly added, remove it
        if (!paper.isExplicitlyAdded && referencedBy.length === 0 && citedBy.length === 0) {
          return null;
        }
        
        return {
          ...paper,
          referencedBy: referencedBy.length > 0 ? referencedBy : undefined,
          citedBy: citedBy.length > 0 ? citedBy : undefined
        };
      }).filter((paper): paper is Paper => paper !== null && paper.paperId !== paperId);
      
      setPapers(newPapers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPapers));
    }
  };

  const togglePaperExpansion = (paperId: string) => {
    const newPapers = papers.map(paper =>
      paper.paperId === paperId
        ? { ...paper, isExpanded: !paper.isExpanded }
        : paper
    );
    setPapers(newPapers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPapers));
  };


  const getSortedPapers = () => {
    return [...papers].sort((a, b) => {
      // Sort by publication date (newest first), then by year, then by title
      if (a.publicationDate && b.publicationDate) {
        return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
      }
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return a.title.localeCompare(b.title);
    });
  };

  const isPaperSaved = (paperId: string) => {
    return papers.some(p => p.paperId === paperId);
  };

  const addReferencedPaper = (paperId: string) => {
    const paper = papers.find(p => p.paperId === paperId);
    if (paper && !paper.isExplicitlyAdded) {
      const newPapers = papers.map(p =>
        p.paperId === paperId
          ? { ...p, isExplicitlyAdded: true }
          : p
      );
      setPapers(newPapers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPapers));
    }
  };

  return {
    papers: getSortedPapers(),
    isLoading,
    savePaper,
    removePaper,
    togglePaperExpansion,
    isPaperSaved,
    addReferencedPaper,
  };
}