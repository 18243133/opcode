import React, { useState, useCallback, useRef } from 'react';
import { CodeEditorView } from './CodeEditorView';
import { ClaudeCodeSession } from '@/components/ClaudeCodeSession';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Code2, MessageSquare } from 'lucide-react';
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
export const CodeEditorWithClaude: React.FC<CodeEditorWithClaudeProps> = ({
  initialDirectory,
  sessionId,
  projectId,
  className,
}) => {
  const [showClaude, setShowClaude] = useState(true);
  const [claudePanelWidth, setClaudePanelWidth] = useState(400);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const isDragging = useRef(false);

  /**
   * Handle file open - send context to Claude
   */
  const handleFileOpen = useCallback((filePath: string) => {
    setCurrentFilePath(filePath);
    // Could automatically send file context to Claude here
  }, []);

  /**
   * Send current file to Claude
   */
  const sendFileToClaude = useCallback(() => {
    if (!currentFilePath) return;

    // This would send the file path to Claude
    // Implementation depends on how ClaudeCodeSession handles context
    console.log('Sending file to Claude:', currentFilePath);
  }, [currentFilePath]);



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
    setClaudePanelWidth(Math.max(300, Math.min(800, newWidth)));
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

  return (
    <div className={cn("flex h-full relative", className)}>
      {/* Code Editor */}
      <div className="flex-1 min-w-0">
        <CodeEditorView
          initialDirectory={initialDirectory}
          onFileOpen={handleFileOpen}
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
          {/* Claude panel header */}
          <div className="h-10 bg-[#2d2d2d] border-b border-[#2d2d30] flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#007acc]" />
              <span className="text-sm text-[#cccccc] font-medium">Claude Assistant</span>
            </div>
            <div className="flex items-center gap-1">
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
            </div>
          </div>

          {/* Claude session */}
          <div className="flex-1 overflow-hidden">
            {sessionId && projectId ? (
              <ClaudeCodeSession
                session={{ id: sessionId, project_id: projectId } as any}
                onBack={() => {}}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[#888]">
                <div className="text-center p-4">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm mb-2">No Claude session active</p>
                  <p className="text-xs">Open a project to start chatting with Claude</p>
                </div>
              </div>
            )}
          </div>
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

