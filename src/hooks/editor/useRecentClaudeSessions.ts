import { useState, useEffect, useCallback } from 'react';
import { api, type Project } from '@/lib/api';

/**
 * Recent Claude project (not individual session)
 */
export interface RecentClaudeSession {
  projectId: string;
  projectPath: string;
  projectName: string;
  mostRecentSessionTime: number;
  sessionCount: number;
}

/**
 * Hook to manage recent Claude projects (not individual sessions)
 * Fetches projects from ~/.claude/projects and shows each project once
 */
export const useRecentClaudeSessions = (maxProjects: number = 10) => {
  const [recentSessions, setRecentSessions] = useState<RecentClaudeSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load recent Claude projects (each project shown once)
   */
  const loadRecentSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useRecentClaudeSessions] Loading projects...');

      // Get all projects
      const projects = await api.listProjects();
      console.log(`[useRecentClaudeSessions] Found ${projects.length} projects`);

      if (projects.length === 0) {
        setRecentSessions([]);
        setIsLoading(false);
        return;
      }

      // Convert projects to RecentClaudeSession format
      const projectList: RecentClaudeSession[] = projects.map((project: Project) => ({
        projectId: project.id,
        projectPath: project.path,
        projectName: project.path.split(/[/\\]/).pop() || project.path,
        mostRecentSessionTime: project.most_recent_session || project.created_at,
        sessionCount: project.sessions.length,
      }));

      // Sort by most recent session time (newest first)
      const sortedProjects = projectList.sort((a, b) => b.mostRecentSessionTime - a.mostRecentSessionTime);

      // Take only the most recent N projects
      const recentProjectsList = sortedProjects.slice(0, maxProjects);

      console.log(`[useRecentClaudeSessions] Recent projects (${recentProjectsList.length}):`,
        recentProjectsList.map(p => ({ name: p.projectName, sessions: p.sessionCount }))
      );

      setRecentSessions(recentProjectsList);
    } catch (err) {
      console.error('[useRecentClaudeSessions] Failed to load projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recent projects');
      setRecentSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [maxProjects]);

  /**
   * Load sessions on mount
   */
  useEffect(() => {
    loadRecentSessions();
  }, [loadRecentSessions]);

  /**
   * Refresh sessions manually
   */
  const refresh = useCallback(() => {
    loadRecentSessions();
  }, [loadRecentSessions]);

  return {
    recentSessions,
    isLoading,
    error,
    refresh,
  };
};

