// Session context analysis and management utilities

import { estimateTokenCount, MAX_TOKENS } from './promptValidation';

export interface SessionAnalysis {
  totalTokens: number;
  messageCount: number;
  avgTokensPerMessage: number;
  isContextHeavy: boolean;
  suggestedAction: 'none' | 'summarize' | 'restart';
  contextHealth: 'good' | 'warning' | 'critical';
  historyTokens: number;
}

export interface SessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokenCount?: number;
}

/**
 * Analyze session context to determine if it needs optimization
 */
export function analyzeSessionContext(messages: SessionMessage[]): SessionAnalysis {
  const totalTokens = messages.reduce((sum, msg) => {
    return sum + (msg.tokenCount || estimateTokenCount(msg.content));
  }, 0);
  
  const messageCount = messages.length;
  const avgTokensPerMessage = messageCount > 0 ? totalTokens / messageCount : 0;
  
  // Determine context health
  let contextHealth: 'good' | 'warning' | 'critical' = 'good';
  let suggestedAction: 'none' | 'summarize' | 'restart' = 'none';
  
  if (totalTokens > MAX_TOKENS * 0.8) {
    contextHealth = 'critical';
    suggestedAction = 'restart';
  } else if (totalTokens > MAX_TOKENS * 0.6) {
    contextHealth = 'warning';
    suggestedAction = 'summarize';
  }
  
  const isContextHeavy = avgTokensPerMessage > 1000 || messageCount > 50;
  
  return {
    totalTokens,
    messageCount,
    avgTokensPerMessage,
    isContextHeavy,
    suggestedAction,
    contextHealth,
    historyTokens: totalTokens
  };
}

/**
 * Create a context summary to reduce token usage
 */
export function createContextSummary(messages: SessionMessage[]): {
  summary: string;
  originalTokens: number;
  summaryTokens: number;
  savedTokens: number;
} {
  const originalTokens = messages.reduce((sum, msg) => {
    return sum + estimateTokenCount(msg.content);
  }, 0);
  
  // Create a concise summary focusing on key points
  const keyMessages = messages.filter((_, i) => 
    i < 3 || i >= messages.length - 3 || messages.length <= 6
  );
  
  const summary = `Session Summary:
- Started with: ${messages[0]?.content.substring(0, 100)}...
- Key interactions: ${keyMessages.length} messages
- Current context: ${messages[messages.length - 1]?.content.substring(0, 100)}...
[Previous context summarized to save tokens]`;
  
  const summaryTokens = estimateTokenCount(summary);
  
  return {
    summary,
    originalTokens,
    summaryTokens,
    savedTokens: originalTokens - summaryTokens
  };
}

/**
 * Optimize session by removing or summarizing old messages
 */
export function optimizeSessionMessages(messages: SessionMessage[]): {
  optimizedMessages: SessionMessage[];
  removedCount: number;
  savedTokens: number;
  strategy: string;
} {
  if (messages.length <= 6) {
    return {
      optimizedMessages: messages,
      removedCount: 0,
      savedTokens: 0,
      strategy: 'no-optimization-needed'
    };
  }
  
  // Keep first 2 and last 4 messages, summarize the middle
  const keepStart = messages.slice(0, 2);
  const keepEnd = messages.slice(-4);
  const middleMessages = messages.slice(2, -4);
  
  if (middleMessages.length === 0) {
    return {
      optimizedMessages: messages,
      removedCount: 0,
      savedTokens: 0,
      strategy: 'no-optimization-needed'
    };
  }
  
  const summary = createContextSummary(middleMessages);
  const summaryMessage: SessionMessage = {
    role: 'assistant',
    content: summary.summary,
    timestamp: Date.now(),
    tokenCount: summary.summaryTokens
  };
  
  const optimizedMessages = [...keepStart, summaryMessage, ...keepEnd];
  
  return {
    optimizedMessages,
    removedCount: middleMessages.length,
    savedTokens: summary.savedTokens,
    strategy: 'middle-summarization'
  };
}

/**
 * Generate context warning message
 */
export function generateContextWarning(messages: SessionMessage[], contextHealth: string): string {
  const analysis = analyzeSessionContext(messages);
  
  switch (contextHealth) {
    case 'warning':
      return `会话上下文较重 (${analysis.totalTokens} tokens)，建议优化以获得更好性能`;
    case 'critical':
      return `会话上下文过重 (${analysis.totalTokens} tokens)，可能影响响应质量，建议立即处理`;
    default:
      return '';
  }
}

/**
 * Check if sending should be blocked due to context size
 */
export function shouldBlockSending(messages: SessionMessage[], prompt?: string): boolean {
  const analysis = analyzeSessionContext(messages);
  const promptTokens = prompt ? estimateTokenCount(prompt) : 0;
  
  return analysis.totalTokens + promptTokens > MAX_TOKENS;
}