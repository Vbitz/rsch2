'use client';

import { useState, useEffect } from 'react';
import { Paper, SearchResult } from '@/types/paper';

const STORAGE_KEY = 'literature-review-papers';

export function usePapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPapers = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setPapers(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading papers from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPapers();
  }, []);

  const savePaper = (searchResult: SearchResult) => {
    const paper: Paper = {
      ...searchResult,
      savedAt: new Date().toISOString(),
    };

    const newPapers = [...papers, paper];
    setPapers(newPapers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPapers));
  };

  const removePaper = (paperId: string) => {
    const newPapers = papers.filter(p => p.paperId !== paperId);
    setPapers(newPapers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPapers));
  };

  const isPaperSaved = (paperId: string) => {
    return papers.some(p => p.paperId === paperId);
  };

  return {
    papers,
    isLoading,
    savePaper,
    removePaper,
    isPaperSaved,
  };
}