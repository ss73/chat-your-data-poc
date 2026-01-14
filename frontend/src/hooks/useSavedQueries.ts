import { useState, useEffect, useCallback } from 'react';
import type { SavedQuery } from '../types';

const STORAGE_KEY = 'chat-your-data-saved-queries';

export function useSavedQueries() {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedQueries(JSON.parse(stored));
      } catch {
        console.error('Failed to parse saved queries');
      }
    }
  }, []);

  const saveQuery = useCallback((query: Omit<SavedQuery, 'id'>) => {
    const newQuery: SavedQuery = {
      ...query,
      id: crypto.randomUUID(),
    };
    setSavedQueries((prev) => {
      const updated = [...prev, newQuery];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    return newQuery;
  }, []);

  const deleteQuery = useCallback((id: string) => {
    setSavedQueries((prev) => {
      const updated = prev.filter((q) => q.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    savedQueries,
    saveQuery,
    deleteQuery,
  };
}
