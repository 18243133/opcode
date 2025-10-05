import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { validatePromptLength } from '@/utils/promptValidation';

interface PromptLengthIndicatorProps {
  prompt: string;
  className?: string;
}

export const PromptLengthIndicator: React.FC<PromptLengthIndicatorProps> = ({
  prompt,
  className
}) => {
  const validation = validatePromptLength(prompt);

  if (validation.tokenCount < 1000) {
    return null; // Don't show for short prompts
  }

  const getIcon = () => {
    if (!validation.isValid) {
      return <XCircle className="h-3 w-3 text-red-500" />;
    }
    if (validation.isWarning) {
      return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    }
    return <CheckCircle className="h-3 w-3 text-green-500" />;
  };

  const getVariant = (): "default" | "destructive" | "outline" | "secondary" => {
    if (!validation.isValid) return "destructive";
    if (validation.isWarning) return "outline";
    return "secondary";
  };

  const getDisplayText = () => {
    const tokenText = `${validation.tokenCount.toLocaleString()} tokens`;
    if (!validation.isValid) {
      return `${tokenText} (超出限制)`;
    }
    if (validation.isWarning) {
      return `${tokenText} (接近限制)`;
    }
    return tokenText;
  };

  return (
    <Badge variant={getVariant()} className={`text-xs ${className}`}>
      {getIcon()}
      <span className="ml-1">{getDisplayText()}</span>
    </Badge>
  );
};