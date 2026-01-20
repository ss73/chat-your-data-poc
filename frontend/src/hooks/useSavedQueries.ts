import { useState, useEffect, useCallback } from 'react';
import type { SavedQuery } from '../types';

const STORAGE_KEY_PREFIX = 'chat-your-data-saved-queries';

function getStorageKey(dataset: string): string {
  return `${STORAGE_KEY_PREFIX}-${dataset}`;
}

export function useSavedQueries(dataset: string) {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(dataset));
    if (stored) {
      try {
        setSavedQueries(JSON.parse(stored));
      } catch {
        console.error('Failed to parse saved queries');
      }
    } else {
      setSavedQueries([]);
    }
  }, [dataset]);

  const saveQuery = useCallback((query: Omit<SavedQuery, 'id'>) => {
    const newQuery: SavedQuery = {
      ...query,
      id: crypto.randomUUID(),
    };
    setSavedQueries((prev) => {
      const updated = [...prev, newQuery];
      localStorage.setItem(getStorageKey(dataset), JSON.stringify(updated));
      return updated;
    });
    return newQuery;
  }, [dataset]);

  const deleteQuery = useCallback((id: string) => {
    setSavedQueries((prev) => {
      const updated = prev.filter((q) => q.id !== id);
      localStorage.setItem(getStorageKey(dataset), JSON.stringify(updated));
      return updated;
    });
  }, [dataset]);

  return {
    savedQueries,
    saveQuery,
    deleteQuery,
  };
}
