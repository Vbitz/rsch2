'use client';

import { useState, useEffect } from 'react';
import { Paper, SearchResult, PaperReference } from '@/types/paper';
import { useLibraries } from './useLibraries';
import { handleNetworkError } from '@/utils/network-errors';

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
  const { currentLibrary, updateLibrary, currentLibraryId, isLoading: librariesLoading } = useLibraries();
  const [isLoading, setIsLoading] = useState(true);
  
  const papers = currentLibrary?.papers || [];

  useEffect(() => {
    if (!librariesLoading) {
      setIsLoading(false);
    }
  }, [librariesLoading]);

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
      lastFetchAttempt: new Date().toISOString(),
    };

    const newPapers = [...papers, basicPaper];
    if (currentLibrary) {
      updateLibrary(currentLibraryId, { ...currentLibrary, papers: newPapers });
    }

    // Then fetch complete data and update
    try {
      const { references, citations } = await fetchCompleteData(searchResult.paperId);
      
      const updatedPapers = addReferencesAndCitationsToLibrary(newPapers, searchResult.paperId, references, citations);
      
      // Mark as successfully fetched
      const finalPapers = updatedPapers.map(p =>
        p.paperId === searchResult.paperId
          ? { ...p, hasCompleteFetch: true, fetchErrors: undefined }
          : p
      );
      
      if (currentLibrary) {
        updateLibrary(currentLibraryId, { ...currentLibrary, papers: finalPapers });
      }
    } catch (error) {
      console.error('Error fetching complete paper data:', error);
      
      // Mark the error but keep the paper
      const { message } = await handleNetworkError(error, undefined, 'fetching complete paper data');
      const errorMsg = message;
      const failedPapers = newPapers.map(p =>
        p.paperId === searchResult.paperId
          ? { 
              ...p, 
              hasCompleteFetch: false, 
              fetchErrors: [errorMsg]
            }
          : p
      );
      
      if (currentLibrary) {
        updateLibrary(currentLibraryId, { ...currentLibrary, papers: failedPapers });
      }
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
      
      if (currentLibrary) {
        updateLibrary(currentLibraryId, { ...currentLibrary, papers: newPapers });
      }
    }
  };

  const togglePaperExpansion = (paperId: string) => {
    const newPapers = papers.map(paper =>
      paper.paperId === paperId
        ? { ...paper, isExpanded: !paper.isExpanded }
        : paper
    );
    if (currentLibrary) {
      updateLibrary(currentLibraryId, { ...currentLibrary, papers: newPapers });
    }
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

  const bulkAddPapers = async (searchResults: SearchResult[]) => {
    const newPapers = searchResults.map(result => {
      const basicPaper: Paper = {
        ...result,
        savedAt: new Date().toISOString(),
        isExpanded: false,
        referencesLoaded: false,
        citationsLoaded: false,
        references: [],
        citations: [],
        isExplicitlyAdded: false, // Add as referenced papers (half-added)
      };
      return basicPaper;
    });

    // Filter out any papers that are already in the library
    const existingPaperIds = new Set(papers.map(p => p.paperId));
    const uniqueNewPapers = newPapers.filter(paper => !existingPaperIds.has(paper.paperId));

    if (uniqueNewPapers.length > 0) {
      const updatedPapers = [...papers, ...uniqueNewPapers];
      if (currentLibrary) {
        updateLibrary(currentLibraryId, { ...currentLibrary, papers: updatedPapers });
      }
    }
  };

  const addReferencedPaper = async (paperId: string, fetchCompleteData?: (paperId: string) => Promise<{ references: PaperReference[], citations: PaperReference[] }>) => {
    const paper = papers.find(p => p.paperId === paperId);
    if (paper && !paper.isExplicitlyAdded) {
      // First mark as explicitly added
      let newPapers = papers.map(p =>
        p.paperId === paperId
          ? { 
              ...p, 
              isExplicitlyAdded: true,
              lastFetchAttempt: new Date().toISOString(),
              fetchErrors: []
            }
          : p
      );
      if (currentLibrary) {
        updateLibrary(currentLibraryId, { ...currentLibrary, papers: newPapers });
      }

      let hasErrors = false;
      const errors: string[] = [];

      // Fetch complete paper details including abstract if missing
      if (!paper.abstract || paper.abstract === '' || !paper.hasCompleteFetch) {
        try {
          const response = await fetch(
            `https://api.semanticscholar.org/graph/v1/paper/${paperId}?fields=paperId,title,abstract,authors,year,citationCount,url,venue,publicationDate`
          );
          
          if (response.ok) {
            const paperData = await response.json();
            newPapers = newPapers.map(p =>
              p.paperId === paperId
                ? { 
                    ...p, 
                    abstract: paperData.abstract || 'No abstract available',
                    title: paperData.title || p.title,
                    venue: paperData.venue || p.venue,
                    publicationDate: paperData.publicationDate || p.publicationDate
                  }
                : p
            );
          } else {
            hasErrors = true;
            const { message } = await handleNetworkError(null, response, 'fetching paper details');
            errors.push(message);
          }
        } catch (error) {
          hasErrors = true;
          const { message } = await handleNetworkError(error, undefined, 'fetching paper details');
          errors.push(message);
          console.error('Error fetching paper details during upgrade:', error);
        }
      }

      // Then fetch references and citations if function is provided
      if (fetchCompleteData && (!paper.referencesLoaded || !paper.citationsLoaded)) {
        try {
          const { references, citations } = await fetchCompleteData(paperId);
          
          newPapers = addReferencesAndCitationsToLibrary(newPapers, paperId, references, citations);
        } catch (error) {
          hasErrors = true;
          const { message } = await handleNetworkError(error, undefined, 'fetching references and citations');
          errors.push(message);
          console.error('Error fetching complete paper data during upgrade:', error);
        }
      }

      // Update paper with completion status and any errors
      newPapers = newPapers.map(p =>
        p.paperId === paperId
          ? {
              ...p,
              hasCompleteFetch: !hasErrors,
              fetchErrors: errors.length > 0 ? errors : undefined
            }
          : p
      );

      if (currentLibrary) {
        updateLibrary(currentLibraryId, { ...currentLibrary, papers: newPapers });
      }
    }
  };

  const retryFailedPaper = async (paperId: string, fetchCompleteData?: (paperId: string) => Promise<{ references: PaperReference[], citations: PaperReference[] }>) => {
    const paper = papers.find(p => p.paperId === paperId);
    if (!paper || !paper.isExplicitlyAdded || (!paper.fetchErrors || paper.fetchErrors.length === 0)) {
      return;
    }

    // Mark as attempting retry and clear previous errors
    let newPapers = papers.map(p =>
      p.paperId === paperId
        ? { 
            ...p, 
            lastFetchAttempt: new Date().toISOString(),
            fetchErrors: undefined
          }
        : p
    );
    if (currentLibrary) {
      updateLibrary(currentLibraryId, { ...currentLibrary, papers: newPapers });
    }

    let hasErrors = false;
    const errors: string[] = [];

    // Retry fetching complete paper details including abstract if missing
    if (!paper.abstract || paper.abstract === '' || !paper.hasCompleteFetch) {
      try {
        const response = await fetch(
          `https://api.semanticscholar.org/graph/v1/paper/${paperId}?fields=paperId,title,abstract,authors,year,citationCount,url,venue,publicationDate`
        );
        
        if (response.ok) {
          const paperData = await response.json();
          newPapers = newPapers.map(p =>
            p.paperId === paperId
              ? { 
                  ...p, 
                  abstract: paperData.abstract || 'No abstract available',
                  title: paperData.title || p.title,
                  venue: paperData.venue || p.venue,
                  publicationDate: paperData.publicationDate || p.publicationDate
                }
              : p
          );
        } else {
          hasErrors = true;
          const { message } = await handleNetworkError(null, response, 'fetching paper details');
          errors.push(message);
        }
      } catch (error) {
        hasErrors = true;
        const { message } = await handleNetworkError(error, undefined, 'fetching paper details');
        errors.push(message);
        console.error('Error retrying paper details fetch:', error);
      }
    }

    // Retry fetching references and citations if function is provided
    if (fetchCompleteData && (!paper.referencesLoaded || !paper.citationsLoaded)) {
      try {
        const { references, citations } = await fetchCompleteData(paperId);
        
        newPapers = addReferencesAndCitationsToLibrary(newPapers, paperId, references, citations);
      } catch (error) {
        hasErrors = true;
        const { message } = await handleNetworkError(error, undefined, 'fetching references and citations');
        errors.push(message);
        console.error('Error retrying complete paper data fetch:', error);
      }
    }

    // Update paper with completion status and any errors
    newPapers = newPapers.map(p =>
      p.paperId === paperId
        ? {
            ...p,
            hasCompleteFetch: !hasErrors,
            fetchErrors: errors.length > 0 ? errors : undefined
          }
        : p
    );

    if (currentLibrary) {
      updateLibrary(currentLibraryId, { ...currentLibrary, papers: newPapers });
    }
  };

  const refreshFullPaper = async (paperId: string, fetchCompleteData?: (paperId: string) => Promise<{ references: PaperReference[], citations: PaperReference[] }>) => {
    const paper = papers.find(p => p.paperId === paperId);
    if (!paper || !paper.isExplicitlyAdded || !fetchCompleteData || !currentLibrary) return;
    
    try {
      // Refetch complete data for this explicitly added paper
      const { references, citations } = await fetchCompleteData(paperId);
      
      // Update with new references and citations, which will add any missing half-added papers
      const updatedPapers = addReferencesAndCitationsToLibrary(papers, paperId, references, citations);
      
      // Mark as successfully refreshed
      const finalPapers = updatedPapers.map(p =>
        p.paperId === paperId
          ? { 
              ...p, 
              hasCompleteFetch: true, 
              fetchErrors: undefined,
              lastFetchAttempt: new Date().toISOString()
            }
          : p
      );
      
      updateLibrary(currentLibraryId, { ...currentLibrary, papers: finalPapers });
    } catch (error) {
      console.error(`Error refreshing paper ${paperId}:`, error);
      
      // Mark the error but keep the paper
      const { message } = await handleNetworkError(error, undefined, 'refreshing paper data');
      const errorMsg = message;
      const failedPapers = papers.map(p =>
        p.paperId === paperId
          ? { 
              ...p, 
              hasCompleteFetch: false, 
              fetchErrors: [errorMsg],
              lastFetchAttempt: new Date().toISOString()
            }
          : p
      );
      
      updateLibrary(currentLibraryId, { ...currentLibrary, papers: failedPapers });
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
    bulkAddPapers,
    retryFailedPaper,
    refreshFullPaper,
  };
}