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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Literature Review Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search and organize research papers from Semantic Scholar
          </p>
        </header>

        <SearchBar 
          onSearch={handleSearch} 
          isSearching={isSearching}
        />

        {searchError && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded-md">
            <p className="text-red-700 dark:text-red-400">Error: {searchError}</p>
          </div>
        )}

        {showSearchResults ? (
          <>
            <div className="mt-6 mb-4">
              <button
                onClick={handleBackToLibrary}
                className="text-blue-600 dark:text-blue-400 hover:underline"
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