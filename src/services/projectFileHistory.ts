/**
 * Service for managing project file history
 * Stores which files were open for each project
 */

const STORAGE_KEY_PREFIX = 'opcode_project_files_';

export interface ProjectFileHistory {
  projectPath: string;
  openFiles: string[];
  activeFile?: string;
  lastUpdated: number;
}

/**
 * Get the storage key for a project
 */
function getStorageKey(projectPath: string): string {
  // Encode project path to use as storage key
  const encoded = btoa(projectPath).replace(/[/+=]/g, '_');
  return `${STORAGE_KEY_PREFIX}${encoded}`;
}

/**
 * Load file history for a project
 */
export function loadProjectFileHistory(projectPath: string): ProjectFileHistory | null {
  try {
    const key = getStorageKey(projectPath);
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return null;
    }
    
    const history: ProjectFileHistory = JSON.parse(stored);
    console.log('[ProjectFileHistory] Loaded history for', projectPath, ':', history.openFiles.length, 'files');
    return history;
  } catch (err) {
    console.error('[ProjectFileHistory] Failed to load history:', err);
    return null;
  }
}

/**
 * Save file history for a project
 */
export function saveProjectFileHistory(
  projectPath: string,
  openFiles: string[],
  activeFile?: string
): void {
  try {
    const key = getStorageKey(projectPath);
    const history: ProjectFileHistory = {
      projectPath,
      openFiles,
      activeFile,
      lastUpdated: Date.now(),
    };
    
    localStorage.setItem(key, JSON.stringify(history));
    console.log('[ProjectFileHistory] Saved history for', projectPath, ':', openFiles.length, 'files');
  } catch (err) {
    console.error('[ProjectFileHistory] Failed to save history:', err);
  }
}

/**
 * Clear file history for a project
 */
export function clearProjectFileHistory(projectPath: string): void {
  try {
    const key = getStorageKey(projectPath);
    localStorage.removeItem(key);
    console.log('[ProjectFileHistory] Cleared history for', projectPath);
  } catch (err) {
    console.error('[ProjectFileHistory] Failed to clear history:', err);
  }
}

/**
 * Get all project histories
 */
export function getAllProjectHistories(): ProjectFileHistory[] {
  const histories: ProjectFileHistory[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const history: ProjectFileHistory = JSON.parse(stored);
          histories.push(history);
        }
      }
    }
  } catch (err) {
    console.error('[ProjectFileHistory] Failed to get all histories:', err);
  }
  
  return histories;
}

/**
 * Clean up old project histories (older than 30 days)
 */
export function cleanupOldHistories(): void {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const history: ProjectFileHistory = JSON.parse(stored);
          if (history.lastUpdated < thirtyDaysAgo) {
            keysToRemove.push(key);
          }
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (keysToRemove.length > 0) {
      console.log('[ProjectFileHistory] Cleaned up', keysToRemove.length, 'old histories');
    }
  } catch (err) {
    console.error('[ProjectFileHistory] Failed to cleanup old histories:', err);
  }
}

