'use client';

import { Paper, SearchResult } from '@/types/paper';

interface PaperCardProps {
  paper: Paper | SearchResult;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleExpansion?: () => void;
  onAddFromReference?: (paperId: string) => void;
  isAlreadySaved?: boolean;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  isPaperSaved?: (paperId: string) => boolean;
  isSavingPaper?: boolean;
  isSavingPaperRecord?: Record<string, boolean>;
}

export default function PaperCard({
  paper,
  onAdd,
  onRemove,
  onToggleExpansion,
  onAddFromReference,
  isAlreadySaved = false,
  showAddButton = false,
  showRemoveButton = false,
  isPaperSaved,
  isSavingPaper = false,
  isSavingPaperRecord = {},
}: PaperCardProps) {
  const isPaper = 'savedAt' in paper;
  const isExpanded = isPaper ? paper.isExpanded : false;
  const isExplicitlyAdded = isPaper ? paper.isExplicitlyAdded : true;
  const isReferencedPaper = isPaper && !paper.isExplicitlyAdded;
  
  // Determine what this paper is referenced/cited by
  const referencedBy = isPaper ? paper.referencedBy || [] : [];
  const citedBy = isPaper ? paper.citedBy || [] : [];
  
  return (
    <div className={`subtle-border p-6 transition-colors ${
      isReferencedPaper 
        ? 'bg-[var(--subtle)] border-[var(--border-light)] opacity-80' 
        : 'bg-black hover:bg-[var(--subtle)]'
    }`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {isPaper && (
              <button
                onClick={onToggleExpansion}
                className="text-[var(--muted)] hover:text-white transition-colors text-sm font-light"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            <h3 className={`text-lg font-medium ${isReferencedPaper ? 'text-[var(--muted)]' : 'text-white'}`}>
              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)] transition-colors"
              >
                {paper.title}
              </a>
            </h3>
            {isReferencedPaper && (
              <div className="flex gap-1 text-xs">
                {referencedBy.length > 0 && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded subtle-border-light">
                    Referenced
                  </span>
                )}
                {citedBy.length > 0 && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded subtle-border-light">
                    Citation
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="text-sm text-[var(--muted)] mb-3 font-light">
            {paper.authors.slice(0, 3).map(author => author.name).join(', ')}
            {paper.authors.length > 3 && ' et al.'}
            {paper.year && ` • ${paper.year}`}
            {paper.venue && ` • ${paper.venue}`}
          </div>

          {!isExpanded ? (
            <p className="text-white mb-4 line-clamp-3 text-sm font-light leading-relaxed">
              {paper.abstract}
            </p>
          ) : (
            <p className="text-white mb-4 text-sm font-light leading-relaxed">
              {paper.abstract}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-[var(--muted)] font-light">
            <span>Citations: {paper.citationCount}</span>
            {'savedAt' in paper && (
              <span>Saved: {new Date(paper.savedAt).toLocaleDateString()}</span>
            )}
          </div>

        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {showAddButton && (
            <button
              onClick={onAdd}
              disabled={isAlreadySaved}
              className={`px-4 py-2 subtle-border text-sm font-light transition-all ${
                isAlreadySaved || isSavingPaper
                  ? 'bg-[var(--muted-bg)] text-[var(--muted)] cursor-not-allowed'
                  : 'bg-black text-white hover:bg-[var(--subtle)] hover:border-[var(--border-light)]'
              }`}
            >
              {isSavingPaper ? 'Adding...' : isAlreadySaved ? 'Saved' : 'Add to Library'}
            </button>
          )}
          
          {isReferencedPaper && (
            <button
              onClick={onAdd}
              className="px-4 py-2 subtle-border bg-blue-500/20 text-blue-300 text-sm font-light hover:bg-blue-500/30 hover:border-blue-400/50 transition-all"
            >
              + Add to Library
            </button>
          )}
          
          {showRemoveButton && isExplicitlyAdded && (
            <button
              onClick={onRemove}
              className="px-4 py-2 subtle-border bg-black text-white text-sm font-light hover:bg-[var(--subtle)] hover:border-[var(--border-light)] transition-all"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}