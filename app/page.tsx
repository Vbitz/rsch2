'use client';

import { useState, useMemo } from 'react';
import { usePapers } from '@/hooks/usePapers';
import { useSemanticScholar } from '@/hooks/useSemanticScholar';
import PaperList from '@/components/PaperList';
import SearchModal from '@/components/SearchModal';
import Logo from '@/components/Logo';
import { SearchResult } from '@/types/paper';
import { calculateAllCitescores, sortByCitescore } from '@/utils/citescore';

export default function Home() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [sortByCitescoreEnabled, setSortByCitescoreEnabled] = useState(false);
  
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
    return await searchPapers(query);
  };

  const handleAddPaper = async (paper: SearchResult) => {
    await savePaper(paper, fetchCompleteePaperData);
  };

  const handleAddFromReference = async (paperId: string) => {
    // Check if it's already in the library as a referenced paper
    const existingPaper = papers.find(p => p.paperId === paperId);
    if (existingPaper && !existingPaper.isExplicitlyAdded) {
      // Promote the referenced paper to explicitly added and fetch complete data
      await addReferencedPaper(paperId, fetchCompleteePaperData);
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

  // Calculate citescores and filter/sort papers
  const processedPapers = useMemo(() => {
    // First calculate citescores for all papers
    const papersWithCitescores = calculateAllCitescores(papers);
    
    // Apply text filtering
    let filtered = papersWithCitescores;
    if (filterText.trim()) {
      const searchTerms = filterText.toLowerCase().split(' ').filter(term => term.length > 0);
      
      filtered = papersWithCitescores.filter(paper => {
        const searchableText = [
          paper.title,
          paper.abstract,
          paper.authors.map(a => a.name).join(' '),
          paper.venue || '',
          paper.year?.toString() || ''
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
      });
    }
    
    // Apply sorting
    if (sortByCitescoreEnabled) {
      return sortByCitescore(filtered);
    }
    
    return filtered;
  }, [papers, filterText, sortByCitescoreEnabled]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your library...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Logo />
              <div className="h-6 w-px bg-[var(--border)]"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter papers..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-64 px-3 py-1.5 text-sm bg-[var(--subtle)] border border-[var(--border)] rounded text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                {filterText && (
                  <button
                    onClick={() => setFilterText('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--muted)] font-light">
              <button
                onClick={() => setSortByCitescoreEnabled(!sortByCitescoreEnabled)}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  sortByCitescoreEnabled 
                    ? 'bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]'
                    : 'bg-[var(--subtle)] text-white hover:bg-[var(--muted-bg)] border border-[var(--border)]'
                }`}
              >
                {sortByCitescoreEnabled ? '✓ ' : ''}Citescore
              </button>
              <button
                onClick={() => setShowSearchModal(true)}
                className="px-3 py-1.5 bg-[var(--accent)] text-black text-sm font-medium rounded hover:bg-[var(--accent-hover)] transition-colors"
              >
                + Search Papers
              </button>
              <span>
                {processedPapers.length}{processedPapers.length !== papers.length && ` of ${papers.length}`} papers
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 max-w-7xl mx-auto px-6 py-6">

        {searchError && (
          <div className="mt-4 p-4 subtle-border bg-[var(--subtle)]">
            <p className="text-white text-sm font-light">Error: {searchError}</p>
          </div>
        )}

        <PaperList
          papers={processedPapers}
          onRemovePaper={removePaper}
          onToggleExpansion={togglePaperExpansion}
          onAddFromReference={handleAddFromReference}
          onJumpToSourcePaper={handleJumpToSourcePaper}
          isPaperSaved={isPaperSaved}
          isSavingPaper={isSavingPaper}
        />

        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onSearch={handleSearch}
          onAddPaper={handleAddPaper}
          isPaperSaved={isPaperSaved}
          isSavingPaper={isSavingPaper}
          isSearching={isSearching}
          searchError={searchError}
        />
      </div>
    </div>
  );
}