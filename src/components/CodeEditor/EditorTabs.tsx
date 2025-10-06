import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFileIcon } from './MonacoEditor';

export interface EditorTab {
  id: string;
  label: string;
  filePath: string;
  isDirty: boolean;
  language: string;
}

export interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  className?: string;
}

/**
 * EditorTabs component - Tab bar for open files
 * 
 * @example
 * <EditorTabs
 *   tabs={tabs}
 *   activeTabId={activeTab?.id}
 *   onTabClick={setActiveTabId}
 *   onTabClose={closeTab}
 * />
 */
export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  className,
}) => {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "flex bg-[#2d2d2d] border-b border-[#2d2d30] overflow-x-auto scrollbar-thin",
      className
    )}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        const icon = getFileIcon(tab.label);
        
        return (
          <div
            key={tab.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 cursor-pointer",
              "border-r border-[#2d2d30] min-w-[120px] max-w-[200px]",
              "transition-colors duration-150",
              isActive 
                ? "bg-[#1e1e1e] border-b-2 border-b-[#007acc]" 
                : "hover:bg-[#2a2d2e]"
            )}
            onClick={() => onTabClick(tab.id)}
            title={tab.filePath}
          >
            {/* File icon */}
            <span className="text-sm">{icon}</span>
            
            {/* File name */}
            <span className="flex-1 truncate text-sm text-[#cccccc]">
              {tab.isDirty && (
                <span className="text-[#007acc] mr-1">●</span>
              )}
              {tab.label}
            </span>
            
            {/* Close button */}
            <button
              className={cn(
                "flex items-center justify-center w-4 h-4",
                "opacity-60 hover:opacity-100 hover:bg-[#3e3e42] rounded",
                "transition-opacity duration-150"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              title="Close (Ctrl+W)"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

