'use client';

import { useState } from 'react';
import { LibraryMetadata } from '@/types/library';

interface LibraryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  libraries: LibraryMetadata[];
  currentLibraryId: string;
  onSwitchLibrary: (libraryId: string) => void;
  onCreateLibrary: (name: string, description?: string) => string;
  onDeleteLibrary: (libraryId: string) => void;
  onRenameLibrary: (libraryId: string, newName: string) => void;
}

export default function LibraryManagementModal({
  isOpen,
  onClose,
  libraries,
  currentLibraryId,
  onSwitchLibrary,
  onCreateLibrary,
  onDeleteLibrary,
  onRenameLibrary
}: LibraryManagementModalProps) {
  const [newLibraryName, setNewLibraryName] = useState('');
  const [newLibraryDescription, setNewLibraryDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingLibrary, setEditingLibrary] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isOpen) return null;

  const handleCreateLibrary = async () => {
    if (!newLibraryName.trim()) return;
    
    setIsCreating(true);
    try {
      const newId = onCreateLibrary(newLibraryName.trim(), newLibraryDescription.trim() || undefined);
      onSwitchLibrary(newId);
      setNewLibraryName('');
      setNewLibraryDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating library:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRename = (libraryId: string) => {
    if (editName.trim() && editName.trim() !== libraries.find(l => l.id === libraryId)?.name) {
      onRenameLibrary(libraryId, editName.trim());
    }
    setEditingLibrary(null);
    setEditName('');
  };

  const startEditing = (library: LibraryMetadata) => {
    setEditingLibrary(library.id);
    setEditName(library.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-black border border-[var(--border)] rounded-lg shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-light text-white">Manage Libraries</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-white transition-colors text-xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {/* Create New Library */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--subtle)]/20">
            <h3 className="text-sm font-medium text-white mb-3">Create New Library</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Library name"
                value={newLibraryName}
                onChange={(e) => setNewLibraryName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--subtle)] border border-[var(--border)] rounded text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newLibraryDescription}
                onChange={(e) => setNewLibraryDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--subtle)] border border-[var(--border)] rounded text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <button
                onClick={handleCreateLibrary}
                disabled={!newLibraryName.trim() || isCreating}
                className="px-4 py-2 bg-[var(--accent)] text-black text-sm font-medium rounded hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Library'}
              </button>
            </div>
          </div>

          {/* Library List */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-white mb-3">Your Libraries</h3>
            <div className="space-y-2">
              {libraries.map((library) => (
                <div
                  key={library.id}
                  className={`p-3 rounded border transition-colors ${
                    library.id === currentLibraryId
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-[var(--border)] hover:border-[var(--border-light)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingLibrary === library.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm bg-[var(--subtle)] border border-[var(--border)] rounded text-white focus:outline-none focus:border-[var(--accent)]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(library.id);
                              if (e.key === 'Escape') {
                                setEditingLibrary(null);
                                setEditName('');
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleRename(library.id)}
                            className="px-2 py-1 text-xs bg-[var(--accent)] text-black rounded hover:bg-[var(--accent-hover)]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingLibrary(null);
                              setEditName('');
                            }}
                            className="px-2 py-1 text-xs text-[var(--muted)] hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white truncate">{library.name}</h4>
                            {library.id === currentLibraryId && (
                              <span className="px-2 py-0.5 text-xs bg-[var(--accent)] text-black rounded">
                                Current
                              </span>
                            )}
                          </div>
                          {library.description && (
                            <p className="text-xs text-[var(--muted)] mt-1">{library.description}</p>
                          )}
                          <p className="text-xs text-[var(--muted)] mt-1">
                            {library.paperCount} papers • Created {new Date(library.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {editingLibrary !== library.id && (
                      <div className="flex items-center gap-2 ml-4">
                        {library.id !== currentLibraryId && (
                          <button
                            onClick={() => onSwitchLibrary(library.id)}
                            className="px-3 py-1 text-xs bg-[var(--subtle)] text-white rounded hover:bg-[var(--muted-bg)] transition-colors"
                          >
                            Switch
                          </button>
                        )}
                        <button
                          onClick={() => startEditing(library)}
                          className="px-2 py-1 text-xs text-[var(--muted)] hover:text-white"
                        >
                          Rename
                        </button>
                        {library.id !== 'default' && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${library.name}"? This action cannot be undone.`)) {
                                onDeleteLibrary(library.id);
                              }
                            }}
                            className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}