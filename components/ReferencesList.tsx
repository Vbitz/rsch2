'use client';

import { PaperReference } from '@/types/paper';
import PaperCard from './PaperCard';

interface ReferencesListProps {
  title: string;
  references: PaperReference[];
  isLoading?: boolean;
  onAddPaper?: (paperId: string) => void;
  isPaperSaved?: (paperId: string) => boolean;
  isSavingPaper?: Record<string, boolean>;
}

export default function ReferencesList({
  title,
  references,
  isLoading = false,
  onAddPaper,
  isPaperSaved,
  isSavingPaper = {}
}: ReferencesListProps) {
  if (isLoading) {
    return (
      <div className="mt-6">
        <h4 className="text-lg font-light text-white mb-4 tracking-wide">{title}</h4>
        <div className="text-sm text-[var(--muted)] font-light">Loading {title.toLowerCase()}...</div>
      </div>
    );
  }

  if (references.length === 0) {
    return (
      <div className="mt-6">
        <h4 className="text-lg font-light text-white mb-4 tracking-wide">{title} (0)</h4>
        <div className="text-sm text-[var(--muted)] font-light">No {title.toLowerCase()} found</div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-light text-white mb-4 tracking-wide">
        {title} ({references.length})
      </h4>
      <div className="space-y-4">
        {references.map((ref) => {
          // Convert PaperReference to SearchResult format for PaperCard
          const searchResult = {
            paperId: ref.paperId,
            title: ref.title,
            abstract: '', // References don't have abstracts
            authors: ref.authors,
            year: ref.year || 0,
            citationCount: ref.citationCount || 0,
            url: ref.url || `https://www.semanticscholar.org/paper/${ref.paperId}`,
            venue: ref.venue,
            publicationDate: undefined
          };

          return (
            <PaperCard
              key={ref.paperId}
              paper={searchResult}
              onAdd={() => onAddPaper?.(ref.paperId)}
              isAlreadySaved={isPaperSaved?.(ref.paperId) || false}
              showAddButton={true}
              showRemoveButton={false}
              isSavingPaper={isSavingPaper[ref.paperId] || false}
            />
          );
        })}
      </div>
    </div>
  );
}