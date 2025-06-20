'use client';

import { Paper, SearchResult } from '@/types/paper';

interface PaperCardProps {
  paper: Paper | SearchResult;
  onAdd?: () => void;
  onRemove?: () => void;
  onToggleExpansion?: () => void;
  onAddFromReference?: (paperId: string) => void;
  onJumpToSourcePaper?: (paperId: string) => void;
  onRetryFailed?: (paperId: string) => void;
  onRefreshFull?: (paperId: string) => void;
  isAlreadySaved?: boolean;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  isPaperSaved?: (paperId: string) => boolean;
  isSavingPaper?: boolean;
}

export default function PaperCard({
  paper,
  onAdd,
  onRemove,
  onToggleExpansion,
  onJumpToSourcePaper,
  onRetryFailed,
  onRefreshFull,
  isAlreadySaved = false,
  showAddButton = false,
  showRemoveButton = false,
  isSavingPaper = false,
}: PaperCardProps) {
  const isPaper = 'savedAt' in paper;
  const isExpanded = isPaper ? paper.isExpanded : false;
  const isExplicitlyAdded = isPaper ? paper.isExplicitlyAdded : true;
  const isReferencedPaper = isPaper && !paper.isExplicitlyAdded;
  
  // Determine what this paper is referenced/cited by
  const referencedBy = isPaper ? paper.referencedBy || [] : [];
  const citedBy = isPaper ? paper.citedBy || [] : [];
  
  // Check if there's content to expand
  const hasExpandableContent = paper.abstract && paper.abstract.trim().length > 0;
  
  return (
    <div className={`subtle-border p-5 transition-colors ${
      isReferencedPaper 
        ? 'bg-[var(--subtle)]/40 border-[var(--border-light)]/60' 
        : 'bg-black hover:bg-[var(--subtle)]'
    }`}>
      <div className="flex gap-4">
        {/* Left side - year and expansion */}
        <div className="flex flex-col items-center gap-2 w-16 flex-shrink-0">
          <div className={`text-lg font-bold tracking-tight ${isReferencedPaper ? 'text-[var(--muted)]' : 'text-white'}`}>
            {paper.year || '—'}
          </div>
          {isPaper && hasExpandableContent && (
            <button
              onClick={onToggleExpansion}
              className="text-[var(--muted)] hover:text-white transition-colors text-xs"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title and badges row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className={`text-lg font-medium leading-tight ${isReferencedPaper ? 'text-[var(--muted)]' : 'text-white'}`}>
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
              <div className="flex gap-1 text-xs flex-shrink-0">
                {referencedBy.length > 0 && (
                  <button
                    onClick={() => onJumpToSourcePaper?.(referencedBy[0])}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded subtle-border-light hover:bg-blue-500/30 transition-colors cursor-pointer"
                    title={`Jump to source paper`}
                  >
                    Ref →
                  </button>
                )}
                {citedBy.length > 0 && (
                  <button
                    onClick={() => onJumpToSourcePaper?.(citedBy[0])}
                    className="px-2 py-1 bg-green-500/20 text-green-300 rounded subtle-border-light hover:bg-green-500/30 transition-colors cursor-pointer"
                    title={`Jump to citing paper`}
                  >
                    Cit →
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Authors and venue row */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="text-sm text-[var(--muted)] font-light flex-1 min-w-0">
              <span className="truncate">
                {paper.authors.slice(0, 3).map(author => author.name).join(', ')}
                {paper.authors.length > 3 && ' et al.'}
              </span>
              {paper.venue && (
                <span className="hidden sm:inline"> • {paper.venue}</span>
              )}
            </div>
            <div className="text-xs text-[var(--muted)] font-light flex-shrink-0">
              {isPaper && (paper.references || paper.citations) ? (
                <div className="flex gap-3">
                  {typeof paper.citescore === 'number' && (
                    <span className="text-[var(--accent)] font-medium">
                      {paper.citescore} cs
                    </span>
                  )}
                  {paper.references && paper.references.length > 0 && (
                    <span>{paper.references.length} refs</span>
                  )}
                  {paper.citations && paper.citations.length > 0 && (
                    <span>{paper.citations.length} cits</span>
                  )}
                  <span>•</span>
                  <span>{paper.citationCount} total cits</span>
                </div>
              ) : (
                <div className="flex gap-3">
                  {isPaper && typeof paper.citescore === 'number' && (
                    <span className="text-[var(--accent)] font-medium">
                      {paper.citescore} cs
                    </span>
                  )}
                  <span>{paper.citationCount} citations</span>
                </div>
              )}
            </div>
          </div>

          {/* Abstract */}
          {hasExpandableContent && (
            !isExpanded ? (
              <p className="text-white text-sm font-light leading-relaxed line-clamp-2 mb-3">
                {paper.abstract}
              </p>
            ) : (
              <p className="text-white text-sm font-light leading-relaxed mb-3">
                {paper.abstract}
              </p>
            )
          )}

          {/* Footer info */}
          {'savedAt' in paper && (
            <div className="text-xs text-[var(--muted)] font-light">
              Saved: {new Date(paper.savedAt).toLocaleDateString()}
              {paper.fetchErrors && paper.fetchErrors.length > 0 && (
                <span className="ml-2 text-yellow-400">
                  ⚠ Incomplete data
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side - action buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0 w-28">
          {showAddButton && (
            <button
              onClick={onAdd}
              disabled={isAlreadySaved}
              className={`px-3 py-2 subtle-border text-xs font-light transition-all ${
                isAlreadySaved || isSavingPaper
                  ? 'bg-[var(--muted-bg)] text-[var(--muted)] cursor-not-allowed'
                  : 'bg-black text-white hover:bg-[var(--subtle)] hover:border-[var(--border-light)]'
              }`}
            >
              {isSavingPaper ? 'Adding...' : isAlreadySaved ? 'Saved' : 'Add'}
            </button>
          )}
          
          {isReferencedPaper && (
            <button
              onClick={onAdd}
              className="px-3 py-2 subtle-border bg-blue-500/20 text-blue-300 text-xs font-light hover:bg-blue-500/30 hover:border-blue-400/50 transition-all"
            >
              + Add
            </button>
          )}
          
          {showRemoveButton && isExplicitlyAdded && (
            <button
              onClick={onRemove}
              className="px-3 py-2 subtle-border bg-black text-white text-xs font-light hover:bg-[var(--subtle)] hover:border-[var(--border-light)] transition-all"
            >
              Remove
            </button>
          )}
          
          {isPaper && isExplicitlyAdded && onRefreshFull && (
            <button
              onClick={() => onRefreshFull(paper.paperId)}
              className="px-3 py-2 subtle-border bg-purple-500/20 text-purple-300 text-xs font-light hover:bg-purple-500/30 hover:border-purple-400/50 transition-all"
              title="Refresh paper details and restore missing references"
            >
              ↻ Refresh
            </button>
          )}
          
          {isPaper && paper.fetchErrors && paper.fetchErrors.length > 0 && onRetryFailed && (
            <button
              onClick={() => onRetryFailed(paper.paperId)}
              className="px-3 py-2 subtle-border bg-yellow-500/20 text-yellow-300 text-xs font-light hover:bg-yellow-500/30 hover:border-yellow-400/50 transition-all"
              title={`Retry fetching data. Errors: ${paper.fetchErrors.join(', ')}`}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}