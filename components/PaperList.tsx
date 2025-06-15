'use client';

import { Paper } from '@/types/paper';
import PaperCard from './PaperCard';

interface PaperListProps {
  papers: Paper[];
  onRemovePaper: (paperId: string) => void;
}

export default function PaperList({ papers, onRemovePaper }: PaperListProps) {
  if (papers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No papers saved yet. Start by searching for papers above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Your Library ({papers.length} papers)
      </h2>
      {papers.map((paper) => (
        <PaperCard
          key={paper.paperId}
          paper={paper}
          onRemove={() => onRemovePaper(paper.paperId)}
          showRemoveButton={true}
        />
      ))}
    </div>
  );
}