'use client';

import { Paper, SearchResult } from '@/types/paper';

interface PaperCardProps {
  paper: Paper | SearchResult;
  onAdd?: () => void;
  onRemove?: () => void;
  isAlreadySaved?: boolean;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
}

export default function PaperCard({
  paper,
  onAdd,
  onRemove,
  isAlreadySaved = false,
  showAddButton = false,
  showRemoveButton = false,
}: PaperCardProps) {
  return (
    <div className="subtle-border p-6 bg-black hover:bg-[var(--subtle)] transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white mb-3">
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent)] transition-colors"
            >
              {paper.title}
            </a>
          </h3>
          
          <div className="text-sm text-[var(--muted)] mb-3 font-light">
            {paper.authors.slice(0, 3).map(author => author.name).join(', ')}
            {paper.authors.length > 3 && ' et al.'}
            {paper.year && ` • ${paper.year}`}
            {paper.venue && ` • ${paper.venue}`}
          </div>

          <p className="text-white mb-4 line-clamp-3 text-sm font-light leading-relaxed">
            {paper.abstract}
          </p>

          <div className="flex items-center gap-4 text-sm text-[var(--muted)] font-light">
            <span>Citations: {paper.citationCount}</span>
            {'savedAt' in paper && (
              <span>Saved: {new Date(paper.savedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {showAddButton && (
            <button
              onClick={onAdd}
              disabled={isAlreadySaved}
              className={`px-4 py-2 subtle-border text-sm font-light transition-all ${
                isAlreadySaved
                  ? 'bg-[var(--muted-bg)] text-[var(--muted)] cursor-not-allowed'
                  : 'bg-black text-white hover:bg-[var(--subtle)] hover:border-[var(--border-light)]'
              }`}
            >
              {isAlreadySaved ? 'Saved' : 'Add to Library'}
            </button>
          )}
          
          {showRemoveButton && (
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