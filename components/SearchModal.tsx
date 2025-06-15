'use client';

import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import { SearchResult } from '@/types/paper';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onAddPaper: (paper: SearchResult) => Promise<void>;
  isPaperSaved: (paperId: string) => boolean;
  isSavingPaper: Record<string, boolean>;
  isSearching: boolean;
  searchError: string | null;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSearch,
  onAddPaper,
  isPaperSaved,
  isSavingPaper,
  isSearching,
  searchError
}: SearchModalProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    const results = await onSearch(query);
    setSearchResults(results);
    setHasSearched(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 bg-black border border-[var(--border)] rounded-lg shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-light text-white">Search Papers</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-white transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[var(--border)]">
          <SearchBar 
            onSearch={handleSearch}
            isSearching={isSearching}
          />
          {searchError && (
            <div className="mt-3 p-3 subtle-border bg-[var(--subtle)]">
              <p className="text-white text-sm font-light">Error: {searchError}</p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[60vh]">
          {hasSearched ? (
            <div className="p-4">
              <SearchResults
                results={searchResults}
                onAddPaper={onAddPaper}
                isPaperSaved={isPaperSaved}
                isSavingPaper={isSavingPaper}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--muted)]">
              <p className="text-sm font-light">
                Enter search terms above to find papers from Semantic Scholar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}