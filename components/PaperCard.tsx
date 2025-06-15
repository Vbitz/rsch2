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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              {paper.title}
            </a>
          </h3>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {paper.authors.slice(0, 3).map(author => author.name).join(', ')}
            {paper.authors.length > 3 && ' et al.'}
            {paper.year && ` • ${paper.year}`}
            {paper.venue && ` • ${paper.venue}`}
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
            {paper.abstract}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAlreadySaved
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isAlreadySaved ? 'Saved' : 'Add to Library'}
            </button>
          )}
          
          {showRemoveButton && (
            <button
              onClick={onRemove}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}