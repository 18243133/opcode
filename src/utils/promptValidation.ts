// Token estimation utilities for prompt validation

export const MAX_TOKENS = 180000; // Conservative limit for Claude
export const WARNING_TOKENS = 150000; // Show warning at this threshold

/**
 * Estimate token count for mixed English/Chinese text
 * Chinese characters typically use more tokens than English
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;

  // Count Chinese characters (Unicode range for CJK)
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const otherChars = text.length - chineseChars;

  // Chinese chars ≈ 1.5 tokens each, other chars ≈ 0.25 tokens each
  return Math.ceil(chineseChars * 1.5 + otherChars * 0.25);
}

/**
 * Check if prompt is within safe limits
 */
export function validatePromptLength(text: string): {
  isValid: boolean;
  tokenCount: number;
  isWarning: boolean;
  message?: string;
} {
  const tokenCount = estimateTokenCount(text);
  
  if (tokenCount > MAX_TOKENS) {
    return {
      isValid: false,
      tokenCount,
      isWarning: false,
      message: `Prompt too long: ${tokenCount} tokens (max: ${MAX_TOKENS})`
    };
  }
  
  if (tokenCount > WARNING_TOKENS) {
    return {
      isValid: true,
      tokenCount,
      isWarning: true,
      message: `Prompt approaching limit: ${tokenCount} tokens`
    };
  }
  
  return {
    isValid: true,
    tokenCount,
    isWarning: false
  };
}

/**
 * Validate prompt for length and token count
 */
export function validatePrompt(prompt: string): {
  isValid: boolean;
  tokenCount: number;
  isWarning: boolean;
  message?: string;
} {
  return validatePromptLength(prompt);
}

/**
 * Optimize prompt by removing or summarizing old context
 */
export function optimizePrompt(originalPrompt: string): {
  optimizedPrompt: string;
  removedTokens: number;
  strategy: string;
  optimized: string;
  originalTokens: number;
  optimizedTokens: number;
  wasTruncated: boolean;
} {
  const lines = originalPrompt.split('\n');
  let optimizedLines = [...lines];
  let removedTokens = 0;
  let strategy = 'none';

  // Strategy 1: Remove code snippets in the middle
  if (estimateTokenCount(optimizedLines.join('\n')) > MAX_TOKENS) {
    const codeBlockStart = optimizedLines.findIndex(line => line.includes('```'));
    const codeBlockEnd = optimizedLines.findIndex((line, i) => i > codeBlockStart && line.includes('```'));
    
    if (codeBlockStart !== -1 && codeBlockEnd !== -1 && codeBlockEnd - codeBlockStart > 10) {
      const removedLines = optimizedLines.splice(codeBlockStart, codeBlockEnd - codeBlockStart + 1, 
        '```\n[Code block removed to save space]\n```');
      removedTokens += estimateTokenCount(removedLines.join('\n'));
      strategy = 'code-removal';
    }
  }

  // Strategy 2: Truncate middle content
  if (estimateTokenCount(optimizedLines.join('\n')) > MAX_TOKENS) {
    const midpoint = Math.floor(optimizedLines.length / 2);
    const removeCount = Math.floor(optimizedLines.length * 0.3); // Remove 30% from middle
    const removedLines = optimizedLines.splice(midpoint - removeCount/2, removeCount, 
      '[... content truncated to fit token limit ...]');
    removedTokens += estimateTokenCount(removedLines.join('\n'));
    strategy = strategy === 'none' ? 'truncation' : 'code-removal-and-truncation';
  }

  const optimizedPrompt = optimizedLines.join('\n');
  const originalTokens = estimateTokenCount(originalPrompt);
  const optimizedTokens = estimateTokenCount(optimizedPrompt);
  
  return {
    optimizedPrompt,
    removedTokens,
    strategy,
    optimized: optimizedPrompt,
    originalTokens,
    optimizedTokens,
    wasTruncated: strategy !== 'none'
  };
}