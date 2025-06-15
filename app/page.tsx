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
  
  const { papers, isLoading, savePaper, removePaper, isPaperSaved } = usePapers();
  const { searchPapers, isSearching, searchError } = useSemanticScholar();

  const handleSearch = async (query: string) => {
    const results = await searchPapers(query);
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleAddPaper = (paper: SearchResult) => {
    savePaper(paper);
  };

  const handleBackToLibrary = () => {
    setShowSearchResults(false);
    setSearchResults([]);
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
      <div className="max-w-5xl mx-auto px-8 py-8">
        <header className="mb-8 subtle-border p-6">
          <h1 className="text-2xl font-light mb-3 tracking-wide">
            Literature Review Platform
          </h1>
          <p className="text-[var(--muted)] text-sm font-light">
            Search and organize research papers from Semantic Scholar
          </p>
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
            />
          </>
        ) : (
          <PaperList
            papers={papers}
            onRemovePaper={removePaper}
          />
        )}
      </div>
    </div>
  );
}