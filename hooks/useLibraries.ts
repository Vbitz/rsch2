'use client';

import { useState, useEffect } from 'react';
import { Library, LibraryMetadata } from '@/types/library';
import { Paper, SearchResult, PaperReference } from '@/types/paper';

const LIBRARIES_KEY = 'rsch-libraries';
const CURRENT_LIBRARY_KEY = 'rsch-current-library';
const DEFAULT_LIBRARY_ID = 'default';

function generateLibraryId(): string {
  return `lib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createDefaultLibrary(): Library {
  return {
    id: DEFAULT_LIBRARY_ID,
    name: 'Main Library',
    description: 'Your primary research library',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    papers: []
  };
}

export function useLibraries() {
  const [libraries, setLibraries] = useState<Record<string, Library>>({});
  const [currentLibraryId, setCurrentLibraryId] = useState<string>(DEFAULT_LIBRARY_ID);
  const [isLoading, setIsLoading] = useState(true);

  // Load libraries from localStorage
  useEffect(() => {
    const loadLibraries = () => {
      try {
        const stored = localStorage.getItem(LIBRARIES_KEY);
        const currentId = localStorage.getItem(CURRENT_LIBRARY_KEY);
        
        if (stored) {
          const librariesData = JSON.parse(stored);
          setLibraries(librariesData);
          
          if (currentId && librariesData[currentId]) {
            setCurrentLibraryId(currentId);
          } else if (librariesData[DEFAULT_LIBRARY_ID]) {
            setCurrentLibraryId(DEFAULT_LIBRARY_ID);
          } else {
            // Create default library if none exist
            const defaultLib = createDefaultLibrary();
            const newLibraries = { [DEFAULT_LIBRARY_ID]: defaultLib };
            setLibraries(newLibraries);
            setCurrentLibraryId(DEFAULT_LIBRARY_ID);
            localStorage.setItem(LIBRARIES_KEY, JSON.stringify(newLibraries));
            localStorage.setItem(CURRENT_LIBRARY_KEY, DEFAULT_LIBRARY_ID);
          }
        } else {
          // First time - create default library
          const defaultLib = createDefaultLibrary();
          const newLibraries = { [DEFAULT_LIBRARY_ID]: defaultLib };
          setLibraries(newLibraries);
          setCurrentLibraryId(DEFAULT_LIBRARY_ID);
          localStorage.setItem(LIBRARIES_KEY, JSON.stringify(newLibraries));
          localStorage.setItem(CURRENT_LIBRARY_KEY, DEFAULT_LIBRARY_ID);
        }
      } catch (error) {
        console.error('Error loading libraries:', error);
        // Fallback to default library
        const defaultLib = createDefaultLibrary();
        const newLibraries = { [DEFAULT_LIBRARY_ID]: defaultLib };
        setLibraries(newLibraries);
        setCurrentLibraryId(DEFAULT_LIBRARY_ID);
      } finally {
        setIsLoading(false);
      }
    };

    loadLibraries();
  }, []);

  const updateLibrary = (libraryId: string, updatedLibrary: Library) => {
    const newLibraries = {
      ...libraries,
      [libraryId]: {
        ...updatedLibrary,
        lastModified: new Date().toISOString()
      }
    };
    setLibraries(newLibraries);
    localStorage.setItem(LIBRARIES_KEY, JSON.stringify(newLibraries));
  };

  const createLibrary = (name: string, description?: string): string => {
    const id = generateLibraryId();
    const newLibrary: Library = {
      id,
      name,
      description,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      papers: []
    };
    
    const newLibraries = { ...libraries, [id]: newLibrary };
    setLibraries(newLibraries);
    localStorage.setItem(LIBRARIES_KEY, JSON.stringify(newLibraries));
    
    return id;
  };

  const deleteLibrary = (libraryId: string) => {
    if (libraryId === DEFAULT_LIBRARY_ID) {
      console.warn('Cannot delete default library');
      return;
    }
    
    const newLibraries = { ...libraries };
    delete newLibraries[libraryId];
    
    // If deleting current library, switch to default
    if (currentLibraryId === libraryId) {
      setCurrentLibraryId(DEFAULT_LIBRARY_ID);
      localStorage.setItem(CURRENT_LIBRARY_KEY, DEFAULT_LIBRARY_ID);
    }
    
    setLibraries(newLibraries);
    localStorage.setItem(LIBRARIES_KEY, JSON.stringify(newLibraries));
  };

  const switchLibrary = (libraryId: string) => {
    if (libraries[libraryId]) {
      setCurrentLibraryId(libraryId);
      localStorage.setItem(CURRENT_LIBRARY_KEY, libraryId);
    }
  };

  const renameLibrary = (libraryId: string, newName: string) => {
    const library = libraries[libraryId];
    if (library) {
      updateLibrary(libraryId, { ...library, name: newName });
    }
  };

  const getLibraryMetadata = (): LibraryMetadata[] => {
    return Object.values(libraries).map(lib => ({
      id: lib.id,
      name: lib.name,
      description: lib.description,
      createdAt: lib.createdAt,
      lastModified: lib.lastModified,
      paperCount: lib.papers.length
    }));
  };

  const getCurrentLibrary = (): Library | null => {
    return libraries[currentLibraryId] || null;
  };

  return {
    libraries,
    currentLibraryId,
    currentLibrary: getCurrentLibrary(),
    isLoading,
    createLibrary,
    deleteLibrary,
    switchLibrary,
    renameLibrary,
    updateLibrary,
    getLibraryMetadata
  };
}