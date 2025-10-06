import { useState, useEffect, useCallback } from 'react';

export interface RecentWorkspace {
  path: string;
  name: string;
  lastOpened: number;
}

const STORAGE_KEY = 'opcode_recent_workspaces';
const MAX_RECENT = 10;

/**
 * Hook to manage recent workspaces
 */
export function useRecentWorkspaces() {
  const [recentWorkspaces, setRecentWorkspaces] = useState<RecentWorkspace[]>([]);

  // Load recent workspaces from localStorage
  useEffect(() => {
    console.log('[useRecentWorkspaces] Loading from localStorage, key:', STORAGE_KEY);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('[useRecentWorkspaces] Stored data:', stored);
      if (stored) {
        const workspaces = JSON.parse(stored) as RecentWorkspace[];
        console.log('[useRecentWorkspaces] Loaded workspaces:', workspaces);
        setRecentWorkspaces(workspaces);
      } else {
        console.log('[useRecentWorkspaces] No stored workspaces found');
      }
    } catch (error) {
      console.error('[useRecentWorkspaces] Failed to load recent workspaces:', error);
    }
  }, []);

  // Save recent workspaces to localStorage
  const saveToStorage = useCallback((workspaces: RecentWorkspace[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
    } catch (error) {
      console.error('Failed to save recent workspaces:', error);
    }
  }, []);

  /**
   * Add a workspace to recent list
   */
  const addRecentWorkspace = useCallback((path: string) => {
    console.log('[useRecentWorkspaces] Adding workspace:', path);
    const name = path.split(/[/\\]/).pop() || path;
    const now = Date.now();

    setRecentWorkspaces((prev) => {
      // Remove if already exists
      const filtered = prev.filter((w) => w.path !== path);

      // Add to front
      const updated = [
        { path, name, lastOpened: now },
        ...filtered,
      ].slice(0, MAX_RECENT);

      console.log('[useRecentWorkspaces] Updated workspaces:', updated);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  /**
   * Remove a workspace from recent list
   */
  const removeRecentWorkspace = useCallback((path: string) => {
    setRecentWorkspaces((prev) => {
      const updated = prev.filter((w) => w.path !== path);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  /**
   * Clear all recent workspaces
   */
  const clearRecentWorkspaces = useCallback(() => {
    setRecentWorkspaces([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentWorkspaces,
    addRecentWorkspace,
    removeRecentWorkspace,
    clearRecentWorkspaces,
  };
}

