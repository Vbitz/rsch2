'use client';

import { SearchResult } from '@/types/paper';
import PaperCard from './PaperCard';

interface SearchResultsProps {
  results: SearchResult[];
  onAddPaper: (paper: SearchResult) => void;
  isPaperSaved: (paperId: string) => boolean;
  isSavingPaper: Record<string, boolean>;
}

export default function SearchResults({ results, onAddPaper, isPaperSaved, isSavingPaper }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 subtle-border bg-[var(--subtle)]">
        <p className="text-[var(--muted)] text-sm font-light">
          No results found. Try a different search query.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-light text-white mb-6 tracking-wide">
        Search Results ({results.length} papers)
      </h2>
      {results.map((paper) => (
        <PaperCard
          key={paper.paperId}
          paper={paper}
          onAdd={() => onAddPaper(paper)}
          isAlreadySaved={isPaperSaved(paper.paperId)}
          isSavingPaper={isSavingPaper[paper.paperId]}
          showAddButton={true}
        />
      ))}
    </div>
  );
}