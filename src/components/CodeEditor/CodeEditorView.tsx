import React, { useState, useEffect, useCallback } from 'react';
import { Search, FolderOpen } from 'lucide-react';
import { MonacoEditor, getLanguageFromPath } from './MonacoEditor';
import { EditorTabs } from './EditorTabs';
import { FileTree } from './FileTree';
import { WelcomePage } from './WelcomePage';
import type { FileNode } from './FileTree';
import { useEditorTabs } from '@/hooks/editor/useEditorTabs';
import { useFileOperations } from '@/hooks/editor/useFileOperations';
import { useRecentWorkspaces } from '@/hooks/editor/useRecentWorkspaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface CodeEditorViewProps {
  /**
   * Initial directory to open
   */
  initialDirectory?: string;
  /**
   * Callback when a file is opened
   */
  onFileOpen?: (filePath: string, content?: string) => void;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * CodeEditorView - Main code editor interface
 * 
 * @example
 * <CodeEditorView
 *   initialDirectory="/path/to/project"
 *   showClaudePanel={true}
 * />
 */
export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  initialDirectory,
  onFileOpen,
  className,
}) => {
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [currentDirectory, setCurrentDirectory] = useState<string>(initialDirectory || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  const fileOps = useFileOperations();
  const { recentWorkspaces, addRecentWorkspace, removeRecentWorkspace } = useRecentWorkspaces();
  
  const {
    tabs,
    activeTab,
    activeTabId,
    openFile,
    closeTab,
    updateTabContent,
    saveTab,
    saveAllTabs,
    setActiveTabId,
    hasUnsavedChanges,
  } = useEditorTabs(async (filePath, content) => {
    // Save file callback
    await fileOps.writeFile(filePath, content);
    console.log(`Saved ${filePath.split(/[/\\]/).pop()}`);
  });

  /**
   * Load directory tree
   */
  const loadDirectoryTree = useCallback(async (dirPath: string) => {
    if (!dirPath) return;

    setIsLoadingTree(true);
    try {
      const tree = await fileOps.listDirectoryTree(dirPath, 5);
      setFileTree(tree);
      setCurrentDirectory(dirPath);
      // Add to recent workspaces
      addRecentWorkspace(dirPath);
    } catch (error) {
      console.error('Failed to load directory tree:', error);
    } finally {
      setIsLoadingTree(false);
    }
  }, [fileOps, addRecentWorkspace]);

  /**
   * Handle file click in tree
   */
  const handleFileClick = useCallback(async (filePath: string) => {
    console.log('[CodeEditorView] File clicked:', filePath);
    try {
      // Check if it's a directory
      const isDir = await fileOps.isDirectory(filePath);
      console.log('[CodeEditorView] Is directory:', isDir);
      if (isDir) {
        // Expand/collapse directory (handled by FileTree component)
        return;
      }

      // Read file content
      console.log('[CodeEditorView] Reading file content...');
      const content = await fileOps.readFile(filePath);
      console.log('[CodeEditorView] File content read, length:', content?.length);

      const language = getLanguageFromPath(filePath);
      console.log('[CodeEditorView] Detected language:', language);

      // Open in editor
      console.log('[CodeEditorView] Opening file in editor...');
      openFile(filePath, content, language);
      console.log('[CodeEditorView] File opened successfully');

      // Notify parent with file content
      onFileOpen?.(filePath, content);
    } catch (error) {
      console.error('[CodeEditorView] Failed to open file:', error);
    }
  }, [fileOps, openFile, onFileOpen]);

  /**
   * Handle save shortcut
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S - Save active tab
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        if (activeTabId) {
          saveTab(activeTabId);
        }
      }

      // Ctrl+Shift+S / Cmd+Shift+S - Save all
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        saveAllTabs();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, saveTab, saveAllTabs]);

  /**
   * Load initial directory
   */
  useEffect(() => {
    if (initialDirectory) {
      loadDirectoryTree(initialDirectory);
    }
  }, [initialDirectory, loadDirectoryTree]);

  /**
   * Handle directory selection
   */
  const handleSelectDirectory = useCallback(async () => {
    try {
      // Use Tauri dialog to select directory
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: currentDirectory || undefined,
      });

      if (selected && typeof selected === 'string') {
        loadDirectoryTree(selected);
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  }, [currentDirectory, loadDirectoryTree]);

  return (
    <div className={cn("flex h-full bg-[#1e1e1e]", className)}>
      {/* Show welcome page if no directory is open */}
      {!currentDirectory && tabs.length === 0 ? (
        <WelcomePage
          onOpenFolder={handleSelectDirectory}
          onOpenRecent={(path) => loadDirectoryTree(path)}
          recentWorkspaces={recentWorkspaces}
          onRemoveRecent={removeRecentWorkspace}
        />
      ) : (
        <>
      {/* Left sidebar - File tree */}
      <div className="w-64 bg-[#252526] border-r border-[#2d2d30] flex flex-col">
        {/* Toolbar */}
        <div className="p-2 border-b border-[#2d2d30] flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectDirectory}
            className="flex-1 justify-start text-xs"
            title="Open Folder"
          >
            <FolderOpen className="w-3 h-3 mr-1" />
            {currentDirectory ? currentDirectory.split(/[/\\]/).pop() : 'Open Folder'}
          </Button>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-[#2d2d30]">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#888]" />
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-7 text-xs bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc]"
            />
          </div>
        </div>

        {/* File tree */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingTree ? (
            <div className="p-4 text-center text-sm text-[#888]">
              Loading...
            </div>
          ) : fileTree ? (
            <FileTree
              root={fileTree}
              onFileClick={handleFileClick}
              selectedPath={activeTab?.filePath}
            />
          ) : (
            <div className="p-4 text-center text-sm text-[#888]">
              No folder opened
            </div>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col">
        {/* Tab bar */}
        <EditorTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={setActiveTabId}
          onTabClose={closeTab}
        />

        {/* Editor */}
        <div className="flex-1 relative">
          {activeTab ? (
            <MonacoEditor
              value={activeTab.content}
              language={activeTab.language}
              path={activeTab.filePath}
              onChange={(value) => updateTabContent(activeTab.id, value || '')}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#888]">
              <div className="text-center">
                <p className="text-lg mb-2">No file opened</p>
                <p className="text-sm">Select a file from the file tree to start editing</p>
              </div>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="h-6 bg-[#007acc] px-3 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-4">
            {activeTab && (
              <>
                <span>{activeTab.language}</span>
                <span>{activeTab.filePath}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                Unsaved changes
              </span>
            )}
            <span>{tabs.length} file{tabs.length !== 1 ? 's' : ''} opened</span>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

