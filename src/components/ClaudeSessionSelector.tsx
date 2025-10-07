import React, { useState, useEffect } from "react";
import { ChevronDown, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { api, type Session } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ClaudeSessionSelectorProps {
  projectId: string;
  currentSessionId?: string | null;
  onSessionSelect: (sessionId: string) => void;
  className?: string;
}

export const ClaudeSessionSelector: React.FC<ClaudeSessionSelectorProps> = ({
  projectId,
  currentSessionId,
  onSessionSelect,
  className,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cachedProjectId, setCachedProjectId] = useState<string>('');

  // Load sessions when project ID changes (not when dropdown opens)
  useEffect(() => {
    if (projectId && projectId !== cachedProjectId) {
      console.log('[ClaudeSessionSelector] Project changed, loading sessions for:', projectId);
      loadSessions();
      setCachedProjectId(projectId);
    }
  }, [projectId]);

  const loadSessions = async () => {
    if (!projectId) return;

    console.log('[ClaudeSessionSelector] Loading sessions for project:', projectId);
    setIsLoading(true);
    try {
      // Get sessions from backend
      const sessionList = await api.getProjectSessions(projectId);
      console.log('[ClaudeSessionSelector] Loaded', sessionList.length, 'sessions');

      // Sort by created_at descending (newest first)
      sessionList.sort((a, b) => b.created_at - a.created_at);

      setSessions(sessionList);
    } catch (err) {
      console.error("[ClaudeSessionSelector] Failed to load sessions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 text-xs text-[#cccccc] hover:text-white hover:bg-[#3e3e42] gap-1.5 max-w-[200px]",
            className
          )}
        >
          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            {currentSession 
              ? truncateMessage(currentSession.first_message || "New conversation", 20)
              : "选择会话"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-[320px] max-h-[400px] overflow-y-auto bg-[#252526] border-[#3e3e42]"
      >
        {isLoading ? (
          <div className="py-6 text-center text-sm text-[#858585]">
            加载中...
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#858585]">
            暂无会话历史
          </div>
        ) : (
          <>
            <div className="px-2 py-1.5 text-xs font-medium text-[#858585]">
              会话历史 ({sessions.length})
            </div>
            <DropdownMenuSeparator className="bg-[#3e3e42]" />
            {sessions.map((session) => (
              <DropdownMenuItem
                key={session.id}
                onClick={() => {
                  onSessionSelect(session.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex flex-col items-start gap-1 px-3 py-2 cursor-pointer",
                  "hover:bg-[#2a2d2e] focus:bg-[#2a2d2e]",
                  currentSessionId === session.id && "bg-[#37373d]"
                )}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <span className="text-sm text-[#cccccc] line-clamp-2 flex-1">
                    {session.first_message}
                  </span>
                  {currentSessionId === session.id && (
                    <div className="w-2 h-2 rounded-full bg-[#007acc] flex-shrink-0 mt-1" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#858585]">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(session.created_at)}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

