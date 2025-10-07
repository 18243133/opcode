import React, { useState, useCallback, useRef } from 'react';
import { CodeEditorView } from './CodeEditorView';
import { ClaudeCodeSession, type ClaudeCodeSessionRef } from '@/components/ClaudeCodeSession';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CodeEditorWithClaudeProps {
  /**
   * Initial directory to open
   */
  initialDirectory?: string;
  /**
   * Initial session ID for Claude
   */
  sessionId?: string;
  /**
   * Project ID for Claude
   */
  projectId?: string;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Callback when project directory changes
   */
  onProjectChange?: (projectPath: string) => void;
  /**
   * Callback when a file is opened
   */
  onFileOpen?: (filePath: string, content: string) => void;
}

/**
 * CodeEditorWithClaude - Integrated code editor with Claude chat
 * 
 * @example
 * <CodeEditorWithClaude
 *   initialDirectory="/path/to/project"
 *   projectId="project-123"
 *   sessionId="session-456"
 * />
 */
const CLAUDE_PANEL_WIDTH_KEY = 'opcode_claude_panel_width';
const CLAUDE_PANEL_VISIBLE_KEY = 'opcode_claude_panel_visible';
const DEFAULT_CLAUDE_PANEL_WIDTH = 450;
const MIN_CLAUDE_PANEL_WIDTH = 350;
const MAX_CLAUDE_PANEL_WIDTH = 800;

export const CodeEditorWithClaude: React.FC<CodeEditorWithClaudeProps> = ({
  initialDirectory,
  className,
  onProjectChange,
  onFileOpen,
}) => {
  // Load saved preferences from localStorage
  const [showClaude, setShowClaude] = useState(() => {
    const saved = localStorage.getItem(CLAUDE_PANEL_VISIBLE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const [claudePanelWidth, setClaudePanelWidth] = useState(() => {
    const saved = localStorage.getItem(CLAUDE_PANEL_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_CLAUDE_PANEL_WIDTH;
  });

  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [currentFileContent, setCurrentFileContent] = useState<string>('');
  const [currentProjectPath, setCurrentProjectPath] = useState<string | undefined>(initialDirectory);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined);
  const isDragging = useRef(false);
  const claudeSessionRef = useRef<ClaudeCodeSessionRef>(null);

  // Save preferences to localStorage
  React.useEffect(() => {
    localStorage.setItem(CLAUDE_PANEL_VISIBLE_KEY, showClaude.toString());
  }, [showClaude]);

  React.useEffect(() => {
    localStorage.setItem(CLAUDE_PANEL_WIDTH_KEY, claudePanelWidth.toString());
  }, [claudePanelWidth]);

  /**
   * Handle file open - store file path and content
   */
  const handleFileOpen = useCallback((filePath: string, content?: string) => {
    console.log('[CodeEditorWithClaude] File opened:', filePath);
    setCurrentFilePath(filePath);
    if (content !== undefined) {
      setCurrentFileContent(content);
    }
    // Notify parent component
    if (onFileOpen && content !== undefined) {
      onFileOpen(filePath, content);
    }
  }, [onFileOpen]);

  /**
   * Handle opening a Claude project from welcome page
   */
  const handleOpenSession = useCallback((_projectId: string, projectPath: string, actualProjectId: string) => {
    // Update project path for Claude (pass actualProjectId for session loading)
    setCurrentProjectPath(projectPath);
    setCurrentProjectId(actualProjectId);

    // Show Claude panel if hidden
    if (!showClaude) {
      setShowClaude(true);
    }

    // Notify parent component
    onProjectChange?.(projectPath);
  }, [showClaude, onProjectChange]);

  /**
   * Get language from file path
   */
  const getLanguageFromPath = useCallback((path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'rs': 'rust',
      'go': 'go',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'rb': 'ruby',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin',
      'md': 'markdown',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sql': 'sql',
      'sh': 'bash',
    };
    return languageMap[ext] || ext;
  }, []);

  /**
   * Send current file to Claude
   */
  const sendFileToClaude = useCallback(() => {
    if (!currentFilePath || !currentFileContent) {
      console.warn('[CodeEditorWithClaude] No file to send');
      return;
    }

    const fileName = currentFilePath.split(/[/\\]/).pop() || 'file';
    const language = getLanguageFromPath(currentFilePath);

    const prompt = `Here is the current file I'm working on:

\`\`\`${language}
// File: ${fileName}
${currentFileContent}
\`\`\`

Please review this code and let me know if you have any suggestions.`;

    console.log('[CodeEditorWithClaude] Sending file to Claude:', fileName);

    // Send to Claude via ref
    if (claudeSessionRef.current?.sendPrompt) {
      claudeSessionRef.current.sendPrompt(prompt);
    } else {
      console.error('[CodeEditorWithClaude] Claude session ref not available');
    }
  }, [currentFilePath, currentFileContent, getLanguageFromPath]);



  /**
   * Handle resize of Claude panel
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;

    const newWidth = window.innerWidth - e.clientX;
    setClaudePanelWidth(Math.max(MIN_CLAUDE_PANEL_WIDTH, Math.min(MAX_CLAUDE_PANEL_WIDTH, newWidth)));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  React.useEffect(() => {
    if (isDragging.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B: Toggle Claude panel
      if (e.ctrlKey && e.key === 'b' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        setShowClaude(prev => !prev);
        console.log('[CodeEditorWithClaude] Toggle Claude panel');
      }

      // Ctrl+Shift+L: Send file to Claude
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        sendFileToClaude();
        console.log('[CodeEditorWithClaude] Send file to Claude (Ctrl+Shift+L)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sendFileToClaude]);

  return (
    <div className={cn("flex h-full relative", className)}>
      {/* Code Editor */}
      <div className="flex-1 min-w-0">
        <CodeEditorView
          initialDirectory={initialDirectory}
          onFileOpen={handleFileOpen}
          onProjectChange={onProjectChange}
          onOpenSession={handleOpenSession}
        />
      </div>

      {/* Resize handle */}
      {showClaude && (
        <div
          className="w-1 bg-[#2d2d30] hover:bg-[#007acc] cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Claude Panel */}
      {showClaude && (
        <div
          className="bg-[#1e1e1e] border-l border-[#2d2d30] flex flex-col"
          style={{ width: `${claudePanelWidth}px` }}
        >
          {/* Claude session with sidebar mode */}
          <ClaudeCodeSession
            ref={claudeSessionRef}
            initialProjectPath={currentProjectPath}
            initialProjectId={currentProjectId}
            sidebarMode={true}
            onBack={() => {}}
            className="flex-1"
            extraHeaderActions={
              <>
                {currentFilePath && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={sendFileToClaude}
                    className="h-6 px-2 text-xs"
                    title="Send current file to Claude"
                  >
                    <Code2 className="w-3 h-3 mr-1" />
                    Send File
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClaude(false)}
                  className="h-6 w-6 p-0"
                  title="Hide Claude panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            }
          />
        </div>
      )}

      {/* Toggle button when Claude panel is hidden */}
      {!showClaude && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowClaude(true)}
          className="absolute right-2 top-2 h-8 px-2"
          title="Show Claude panel"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Claude
        </Button>
      )}
    </div>
  );
};

