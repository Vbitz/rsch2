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
}

export default function PaperList({ 
  papers, 
  onRemovePaper, 
  onToggleExpansion, 
  onAddFromReference, 
  isPaperSaved, 
  isSavingPaper 
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-light text-white mb-6 tracking-wide">
        Your Library ({papers.length} papers)
      </h2>
      {papers.map((paper) => (
        <PaperCard
          key={paper.paperId}
          paper={paper}
          onAdd={() => onAddFromReference(paper.paperId)}
          onRemove={() => onRemovePaper(paper.paperId)}
          onToggleExpansion={() => onToggleExpansion(paper.paperId)}
          onAddFromReference={onAddFromReference}
          showRemoveButton={true}
          isPaperSaved={isPaperSaved}
          isSavingPaper={isSavingPaper[paper.paperId]}
          isSavingPaperRecord={isSavingPaper}
        />
      ))}
    </div>
  );
}