import React, { useState } from 'react';
import { FolderOpen, Clock, Code2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RecentClaudeSession } from '@/hooks/editor/useRecentClaudeSessions';

export interface WelcomePageProps {
  /**
   * Callback when user selects a directory
   */
  onOpenFolder: () => void;
  /**
   * Callback when user opens a recent Claude project
   */
  onOpenSession: (projectId: string, projectPath: string, actualProjectId: string) => void;
  /**
   * Recent Claude projects
   */
  recentSessions?: RecentClaudeSession[];
  /**
   * Loading state
   */
  isLoadingSessions?: boolean;
}

/**
 * WelcomePage - VS Code style welcome page for code editor
 */
export const WelcomePage: React.FC<WelcomePageProps> = ({
  onOpenFolder,
  onOpenSession,
  recentSessions = [],
  isLoadingSessions = false,
}) => {
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    // Convert Unix timestamp (seconds) to milliseconds
    const timestampMs = timestamp * 1000;
    const now = Date.now();
    const diff = now - timestampMs;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    const date = new Date(timestampMs);
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#cccccc]">
      <div className="max-w-4xl w-full px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="w-16 h-16 text-[#007acc]" />
            <h1 className="text-5xl font-light">Opcode</h1>
          </div>
          <p className="text-lg text-[#888]">专业的代码编辑器</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <Button
            onClick={onOpenFolder}
            className="h-24 flex flex-col items-center justify-center gap-3 bg-[#2d2d30] hover:bg-[#3e3e42] border border-[#3e3e42] text-[#cccccc]"
          >
            <FolderOpen className="w-8 h-8 text-[#007acc]" />
            <span className="text-base">打开项目</span>
          </Button>

          <Button
            onClick={() => {
              // TODO: Clone repository
              console.log('Clone repository');
            }}
            className="h-24 flex flex-col items-center justify-center gap-3 bg-[#2d2d30] hover:bg-[#3e3e42] border border-[#3e3e42] text-[#cccccc]"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-base">克隆仓库</span>
          </Button>

          <Button
            onClick={() => {
              // TODO: Connect to SSH
              console.log('Connect to SSH');
            }}
            className="h-24 flex flex-col items-center justify-center gap-3 bg-[#2d2d30] hover:bg-[#3e3e42] border border-[#3e3e42] text-[#cccccc]"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span className="text-base">远程 SSH 连接</span>
          </Button>
        </div>

        {/* Recent Claude Projects */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#888]" />
            <h2 className="text-xl font-light">最近的Claude项目</h2>
          </div>

          {isLoadingSessions ? (
            <div className="p-8 text-center text-[#888] bg-[#252526] rounded-md border border-[#2d2d30]">
              <p className="text-sm">加载中...</p>
            </div>
          ) : recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.map((project) => (
                <div
                  key={project.projectId}
                  className={cn(
                    "group relative flex items-center justify-between p-3 rounded-md transition-colors cursor-pointer",
                    hoveredProjectId === project.projectId
                      ? "bg-[#2d2d30]"
                      : "hover:bg-[#2d2d30]"
                  )}
                  onMouseEnter={() => setHoveredProjectId(project.projectId)}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  onClick={() => onOpenSession(project.projectId, project.projectPath, project.projectId)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FolderOpen className="w-5 h-5 text-[#007acc] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {project.projectName}
                      </div>
                      <div className="text-sm text-[#888] truncate">
                        {project.projectPath} • {project.sessionCount} 个会话
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#888]">
                      {formatDate(project.mostRecentSessionTime)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[#888] bg-[#252526] rounded-md border border-[#2d2d30]">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">还没有Claude对话历史</p>
              <p className="text-xs mt-2">打开项目后开始与Claude对话</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 pt-8 border-t border-[#2d2d30]">
          <h3 className="text-sm text-[#888] mb-4">快速操作</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button className="text-left p-2 rounded hover:bg-[#2d2d30] text-[#007acc]">
              打开首选项命令 <kbd className="ml-2 text-xs text-[#888]">Ctrl+L</kbd>
            </button>
            <button className="text-left p-2 rounded hover:bg-[#2d2d30] text-[#007acc]">
              打开 Quest 模式 <kbd className="ml-2 text-xs text-[#888]">Ctrl+E</kbd>
            </button>
            <button className="text-left p-2 rounded hover:bg-[#2d2d30] text-[#007acc]">
              打开首选项 <kbd className="ml-2 text-xs text-[#888]">Ctrl+I</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

