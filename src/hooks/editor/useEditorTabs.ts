import { useState, useCallback, useRef, useEffect } from 'react';
import type { EditorTab } from '@/components/CodeEditor';

export interface EditorTabData extends EditorTab {
  content: string;
  originalContent: string; // For tracking changes
  scrollPosition?: number;
  cursorPosition?: { lineNumber: number; column: number };
}

export interface UseEditorTabsReturn {
  tabs: EditorTabData[];
  activeTab: EditorTabData | null;
  activeTabId: string | null;
  openFile: (filePath: string, content: string, language: string) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  saveTab: (tabId: string) => void;
  saveAllTabs: () => void;
  setActiveTabId: (tabId: string | null) => void;
  getTabByPath: (filePath: string) => EditorTabData | undefined;
  hasUnsavedChanges: boolean;
}

/**
 * Hook for managing editor tabs
 * 
 * @example
 * const {
 *   tabs,
 *   activeTab,
 *   openFile,
 *   closeTab,
 *   updateTabContent,
 * } = useEditorTabs();
 */
export function useEditorTabs(
  onSaveFile?: (filePath: string, content: string) => Promise<void>
): UseEditorTabsReturn {
  const [tabs, setTabs] = useState<EditorTabData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const tabIdCounter = useRef(0);

  // Get active tab
  const activeTab = tabs.find(t => t.id === activeTabId) || null;

  // Check if there are unsaved changes
  const hasUnsavedChanges = tabs.some(t => t.isDirty);

  /**
   * Open a file in a new tab or switch to existing tab
   */
  const openFile = useCallback((filePath: string, content: string, language: string) => {
    console.log('[useEditorTabs] Opening file:', { filePath, contentLength: content?.length, language });
    setTabs(prevTabs => {
      // Check if file is already open
      const existingTab = prevTabs.find(t => t.filePath === filePath);

      if (existingTab) {
        // Switch to existing tab
        console.log('[useEditorTabs] File already open, switching to tab:', existingTab.id);
        setActiveTabId(existingTab.id);
        return prevTabs;
      }

      // Create new tab
      const fileName = filePath.split(/[/\\]/).pop() || 'Untitled';
      const newTab: EditorTabData = {
        id: `tab-${++tabIdCounter.current}`,
        label: fileName,
        filePath,
        content,
        originalContent: content,
        language,
        isDirty: false,
      };

      console.log('[useEditorTabs] Created new tab:', newTab.id);
      setActiveTabId(newTab.id);
      return [...prevTabs, newTab];
    });
  }, []);

  /**
   * Close a tab
   */
  const closeTab = useCallback((tabId: string) => {
    setTabs(prevTabs => {
      const tabIndex = prevTabs.findIndex(t => t.id === tabId);
      if (tabIndex === -1) return prevTabs;

      const newTabs = prevTabs.filter(t => t.id !== tabId);

      // If closing active tab, switch to another tab
      if (activeTabId === tabId) {
        if (newTabs.length > 0) {
          // Switch to the tab to the right, or the last tab if closing the rightmost
          const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
          setActiveTabId(newTabs[newActiveIndex].id);
        } else {
          setActiveTabId(null);
        }
      }

      return newTabs;
    });
  }, [activeTabId]);

  /**
   * Close all tabs
   */
  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
  }, []);

  /**
   * Close all tabs except the specified one
   */
  const closeOtherTabs = useCallback((tabId: string) => {
    setTabs(prevTabs => {
      const tab = prevTabs.find(t => t.id === tabId);
      if (!tab) return prevTabs;
      
      setActiveTabId(tabId);
      return [tab];
    });
  }, []);

  /**
   * Update tab content
   */
  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs(prevTabs => prevTabs.map(tab => {
      if (tab.id !== tabId) return tab;
      
      const isDirty = content !== tab.originalContent;
      return { ...tab, content, isDirty };
    }));
  }, []);

  /**
   * Save a tab
   */
  const saveTab = useCallback(async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || !tab.isDirty) return;

    try {
      if (onSaveFile) {
        await onSaveFile(tab.filePath, tab.content);
      }

      // Mark as saved
      setTabs(prevTabs => prevTabs.map(t => {
        if (t.id !== tabId) return t;
        return { ...t, originalContent: t.content, isDirty: false };
      }));
    } catch (error) {
      console.error('Failed to save file:', error);
      throw error;
    }
  }, [tabs, onSaveFile]);

  /**
   * Save all dirty tabs
   */
  const saveAllTabs = useCallback(async () => {
    const dirtyTabs = tabs.filter(t => t.isDirty);
    
    for (const tab of dirtyTabs) {
      await saveTab(tab.id);
    }
  }, [tabs, saveTab]);

  /**
   * Get tab by file path
   */
  const getTabByPath = useCallback((filePath: string) => {
    return tabs.find(t => t.filePath === filePath);
  }, [tabs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+W / Cmd+W - Close active tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
      }

      // Ctrl+S / Cmd+S - Save active tab
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeTabId) {
          saveTab(activeTabId);
        }
      }

      // Ctrl+Shift+S / Cmd+Shift+S - Save all tabs
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        saveAllTabs();
      }

      // Ctrl+Tab - Next tab
      if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        if (tabs.length > 0 && activeTabId) {
          const currentIndex = tabs.findIndex(t => t.id === activeTabId);
          const nextIndex = (currentIndex + 1) % tabs.length;
          setActiveTabId(tabs[nextIndex].id);
        }
      }

      // Ctrl+Shift+Tab - Previous tab
      if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        if (tabs.length > 0 && activeTabId) {
          const currentIndex = tabs.findIndex(t => t.id === activeTabId);
          const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          setActiveTabId(tabs[prevIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, closeTab, saveTab, saveAllTabs]);

  return {
    tabs,
    activeTab,
    activeTabId,
    openFile,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    updateTabContent,
    saveTab,
    saveAllTabs,
    setActiveTabId,
    getTabByPath,
    hasUnsavedChanges,
  };
}

