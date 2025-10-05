import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SessionAnalysis } from '@/utils/sessionContextManager';

interface SessionContextIndicatorProps {
  analysis: SessionAnalysis;
  onOptimize?: () => void;
  onRestart?: () => void;
  onNewSession?: () => void;
  className?: string;
}

export const SessionContextIndicator: React.FC<SessionContextIndicatorProps> = ({
  analysis,
  onOptimize,
  onRestart,
  onNewSession,
  className
}) => {
  const getHealthIcon = () => {
    switch (analysis.contextHealth) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getHealthColor = () => {
    switch (analysis.contextHealth) {
      case 'good':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  const getHealthMessage = () => {
    switch (analysis.contextHealth) {
      case 'good':
        return '会话上下文正常';
      case 'warning':
        return '会话上下文较重，建议优化';
      case 'critical':
        return '会话上下文过重，需要立即处理';
    }
  };

  if (analysis.contextHealth === 'good' && !analysis.isContextHeavy) {
    return null; // Don't show indicator when everything is fine
  }

  return (
    <Card className={`p-3 ${getHealthColor()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getHealthIcon()}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{getHealthMessage()}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                {analysis.totalTokens.toLocaleString()} tokens
              </Badge>
              <Badge variant="outline" className="text-xs">
                {analysis.messageCount} 条消息
              </Badge>
            </div>
          </div>
        </div>
        
        {analysis.suggestedAction !== 'none' && (
          <div className="flex items-center gap-2">
            {analysis.suggestedAction === 'summarize' && onOptimize && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onOptimize}
                className="text-xs"
              >
                优化上下文
              </Button>
            )}
            {analysis.suggestedAction === 'restart' && (onRestart || onNewSession) && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onRestart || onNewSession}
                className="text-xs"
              >
                重新开始
              </Button>
            )}
          </div>
        )}
      </div>
      
      {analysis.isContextHeavy && (
        <div className="mt-2 text-xs opacity-75">
          平均每条消息 {Math.round(analysis.avgTokensPerMessage)} tokens
        </div>
      )}
    </Card>
  );
};