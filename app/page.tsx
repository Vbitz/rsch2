'use client';

import { useState } from 'react';
import { usePapers } from '@/hooks/usePapers';
import { useSemanticScholar } from '@/hooks/useSemanticScholar';
import SearchBar from '@/components/SearchBar';
import PaperList from '@/components/PaperList';
import SearchResults from '@/components/SearchResults';
import { SearchResult } from '@/types/paper';

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const { 
    papers, 
    isLoading, 
    savePaper, 
    removePaper, 
    togglePaperExpansion, 
    isPaperSaved,
    addReferencedPaper
  } = usePapers();
  const { 
    searchPapers, 
    fetchCompleteePaperData, 
    isSearching, 
    searchError, 
    isSavingPaper 
  } = useSemanticScholar();

  const handleSearch = async (query: string) => {
    const results = await searchPapers(query);
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleAddPaper = async (paper: SearchResult) => {
    await savePaper(paper, fetchCompleteePaperData);
  };

  const handleAddFromReference = async (paperId: string) => {
    // Check if it's already in the library as a referenced paper
    const existingPaper = papers.find(p => p.paperId === paperId);
    if (existingPaper && !existingPaper.isExplicitlyAdded) {
      // Just promote the referenced paper to explicitly added
      addReferencedPaper(paperId);
      return;
    }
    
    // If not in library at all, fetch and add with complete data
    if (!isPaperSaved(paperId)) {
      try {
        const response = await fetch(
          `https://api.semanticscholar.org/graph/v1/paper/${paperId}?fields=paperId,title,abstract,authors,year,citationCount,url,venue,publicationDate`
        );
        
        if (response.ok) {
          const paperData = await response.json();
          const searchResult: SearchResult = {
            paperId: paperData.paperId,
            title: paperData.title || 'Untitled',
            abstract: paperData.abstract || 'No abstract available',
            authors: paperData.authors || [],
            year: paperData.year || 0,
            citationCount: paperData.citationCount || 0,
            url: paperData.url || `https://www.semanticscholar.org/paper/${paperId}`,
            venue: paperData.venue,
            publicationDate: paperData.publicationDate,
          };
          
          await savePaper(searchResult, fetchCompleteePaperData);
        }
      } catch (error) {
        console.error('Error adding paper from reference:', error);
      }
    }
  };

  const handleBackToLibrary = () => {
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const handleJumpToSourcePaper = (paperId: string) => {
    const element = document.getElementById(`paper-${paperId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight effect
      element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      element.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      setTimeout(() => {
        element.style.backgroundColor = '';
        element.style.borderColor = '';
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your library...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <header className="mb-6 subtle-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-light mb-1 tracking-wide">
                Literature Review Platform
              </h1>
              <p className="text-[var(--muted)] text-xs font-light">
                Search and organize research papers from Semantic Scholar
              </p>
            </div>
            <div className="text-xs text-[var(--muted)] font-light">
              {papers.length} papers
            </div>
          </div>
        </header>

        <SearchBar 
          onSearch={handleSearch} 
          isSearching={isSearching}
        />

        {searchError && (
          <div className="mt-4 p-4 subtle-border bg-[var(--subtle)]">
            <p className="text-white text-sm font-light">Error: {searchError}</p>
          </div>
        )}

        {showSearchResults ? (
          <>
            <div className="mt-6 mb-6">
              <button
                onClick={handleBackToLibrary}
                className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm font-light transition-colors"
              >
                ← Back to Library
              </button>
            </div>
            <SearchResults
              results={searchResults}
              onAddPaper={handleAddPaper}
              isPaperSaved={isPaperSaved}
              isSavingPaper={isSavingPaper}
            />
          </>
        ) : (
          <PaperList
            papers={papers}
            onRemovePaper={removePaper}
            onToggleExpansion={togglePaperExpansion}
            onAddFromReference={handleAddFromReference}
            onJumpToSourcePaper={handleJumpToSourcePaper}
            isPaperSaved={isPaperSaved}
            isSavingPaper={isSavingPaper}
          />
        )}
      </div>
    </div>
  );
}