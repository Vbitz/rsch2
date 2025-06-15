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
  onBulkAddPapers?: (papers: SearchResult[]) => Promise<void>;
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
  onBulkAddPapers,
  isPaperSaved,
  isSavingPaper,
  isSearching,
  searchError
}: SearchModalProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchResults([]);
      setHasSearched(false);
      setIsBulkAdding(false);
    }
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    const results = await onSearch(query);
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleBulkAdd = async () => {
    if (!onBulkAddPapers || searchResults.length === 0) return;
    
    setIsBulkAdding(true);
    try {
      // Filter out papers that are already saved
      const newPapers = searchResults.filter(paper => !isPaperSaved(paper.paperId));
      if (newPapers.length > 0) {
        await onBulkAddPapers(newPapers);
      }
    } catch (error) {
      console.error('Error bulk adding papers:', error);
    } finally {
      setIsBulkAdding(false);
    }
  };

  const newPapersCount = searchResults.filter(paper => !isPaperSaved(paper.paperId)).length;

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

        {/* Bulk Add Section */}
        {hasSearched && searchResults.length > 0 && onBulkAddPapers && newPapersCount > 0 && (
          <div className="p-4 border-b border-[var(--border)] bg-[var(--subtle)]/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[var(--muted)] font-light">
                Found {searchResults.length} papers, {newPapersCount} new
              </div>
              <button
                onClick={handleBulkAdd}
                disabled={isBulkAdding}
                className="px-4 py-2 bg-[var(--accent)] text-black text-sm font-medium rounded hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkAdding ? 'Adding...' : `+ Add All ${newPapersCount} as References`}
              </button>
            </div>
          </div>
        )}

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