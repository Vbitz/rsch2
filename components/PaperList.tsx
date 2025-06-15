'use client';

import { Paper } from '@/types/paper';
import PaperCard from './PaperCard';

interface PaperListProps {
  papers: Paper[];
  onRemovePaper: (paperId: string) => void;
  onToggleExpansion: (paperId: string) => void;
  onAddFromReference: (paperId: string) => void;
  isPaperSaved: (paperId: string) => boolean;
  isSavingPaper: Record<string, boolean>;
  onJumpToSourcePaper?: (paperId: string) => void;
  onRetryFailed?: (paperId: string) => void;
  onRefreshFull?: (paperId: string) => void;
}

export default function PaperList({ 
  papers, 
  onRemovePaper, 
  onToggleExpansion, 
  onAddFromReference, 
  isPaperSaved, 
  isSavingPaper,
  onJumpToSourcePaper,
  onRetryFailed,
  onRefreshFull
}: PaperListProps) {
  if (papers.length === 0) {
    return (
      <div className="text-center py-12 subtle-border bg-[var(--subtle)]">
        <p className="text-[var(--muted)] text-sm font-light">
          No papers saved yet. Start by searching for papers above.
        </p>
      </div>
    );
  }

  const explicitPapers = papers.filter(p => p.isExplicitlyAdded);
  const referencedPapers = papers.filter(p => !p.isExplicitlyAdded);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-light text-white tracking-wide">
          Your Library
        </h2>
        <div className="text-xs text-[var(--muted)] font-light">
          {explicitPapers.length} added, {referencedPapers.length} referenced
        </div>
      </div>
      {papers.map((paper) => (
        <div key={paper.paperId} id={`paper-${paper.paperId}`}>
          <PaperCard
            paper={paper}
            onAdd={() => onAddFromReference(paper.paperId)}
            onRemove={() => onRemovePaper(paper.paperId)}
            onToggleExpansion={() => onToggleExpansion(paper.paperId)}
            onAddFromReference={onAddFromReference}
            onJumpToSourcePaper={onJumpToSourcePaper}
            onRetryFailed={onRetryFailed}
            onRefreshFull={onRefreshFull}
            showRemoveButton={true}
            isPaperSaved={isPaperSaved}
            isSavingPaper={isSavingPaper[paper.paperId]}
            isSavingPaperRecord={isSavingPaper}
          />
        </div>
      ))}
    </div>
  );
}