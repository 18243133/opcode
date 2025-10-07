import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
  Replace,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { invoke } from '@tauri-apps/api/core';

export interface SearchResult {
  file_path: string;
  line_number: number;
  line_content: string;
  match_start: number;
  match_end: number;
}

export interface SearchOptions {
  case_sensitive: boolean;
  whole_word: boolean;
  regex: boolean;
  include_pattern?: string;
  exclude_pattern?: string;
}

interface SearchPanelProps {
  projectPath: string;
  onResultClick: (filePath: string, lineNumber: number) => void;
  onClose: () => void;
}

/**
 * SearchPanel - Global search and replace panel
 * 
 * @example
 * <SearchPanel
 *   projectPath="/path/to/project"
 *   onResultClick={(path, line) => openFile(path, line)}
 *   onClose={() => setShowSearch(false)}
 * />
 */
export const SearchPanel: React.FC<SearchPanelProps> = ({
  projectPath,
  onResultClick,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [options, setOptions] = useState<SearchOptions>({
    case_sensitive: false,
    whole_word: false,
    regex: false,
    include_pattern: '',
    exclude_pattern: ''
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  // Group results by file
  const groupedResults = useCallback(() => {
    const groups = new Map<string, SearchResult[]>();
    results.forEach(result => {
      const existing = groups.get(result.file_path) || [];
      existing.push(result);
      groups.set(result.file_path, existing);
    });
    return groups;
  }, [results]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('请输入搜索内容');
      return;
    }

    setIsSearching(true);
    setError('');
    
    try {
      const searchResults = await invoke<SearchResult[]>('search_in_files', {
        path: projectPath,
        query: searchQuery,
        options: {
          caseSensitive: options.case_sensitive,
          wholeWord: options.whole_word,
          regex: options.regex,
          includePattern: options.include_pattern || undefined,
          excludePattern: options.exclude_pattern || undefined
        }
      });
      
      setResults(searchResults);
      
      // Auto-expand all files
      const files = new Set(searchResults.map(r => r.file_path));
      setExpandedFiles(files);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSearching(false);
    }
  }, [projectPath, searchQuery, options]);

  const handleReplaceAll = useCallback(async () => {
    if (!replaceQuery && replaceQuery !== '') {
      setError('请输入替换内容');
      return;
    }

    if (results.length === 0) {
      setError('没有搜索结果可以替换');
      return;
    }

    setIsReplacing(true);
    setError('');

    try {
      const replacedCount = await invoke<number>('replace_in_files', {
        results,
        replaceText: replaceQuery
      });

      // Refresh search results
      await handleSearch();
      
      alert(`成功替换 ${replacedCount} 处`);
    } catch (err) {
      console.error('Replace failed:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsReplacing(false);
    }
  }, [results, replaceQuery, handleSearch]);

  const toggleFileExpanded = useCallback((filePath: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  const getRelativePath = useCallback((filePath: string) => {
    return filePath.replace(projectPath, '').replace(/^[/\\]/, '');
  }, [projectPath]);

  const highlightMatch = useCallback((content: string, start: number, end: number) => {
    const before = content.substring(0, start);
    const match = content.substring(start, end);
    const after = content.substring(end);
    
    return (
      <>
        {before}
        <span className="bg-yellow-500/30 text-yellow-200 font-semibold">
          {match}
        </span>
        {after}
      </>
    );
  }, []);

  const grouped = groupedResults();
  const totalMatches = results.length;
  const totalFiles = grouped.size;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#454545]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#454545]">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-[#cccccc]" />
          <span className="text-sm font-semibold text-[#cccccc]">搜索</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="p-3 space-y-2 border-b border-[#454545]">
        {/* Search Query */}
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索..."
            autoFocus
            className="bg-[#3c3c3c] border-[#454545] text-[#cccccc] pr-24"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              size="sm"
              variant={options.case_sensitive ? 'default' : 'ghost'}
              onClick={() => setOptions({ ...options, case_sensitive: !options.case_sensitive })}
              title="区分大小写 (Alt+C)"
              className="h-6 w-6 p-0 text-xs"
            >
              Aa
            </Button>
            <Button
              size="sm"
              variant={options.whole_word ? 'default' : 'ghost'}
              onClick={() => setOptions({ ...options, whole_word: !options.whole_word })}
              title="全词匹配 (Alt+W)"
              className="h-6 w-6 p-0 text-xs"
            >
              Ab
            </Button>
            <Button
              size="sm"
              variant={options.regex ? 'default' : 'ghost'}
              onClick={() => setOptions({ ...options, regex: !options.regex })}
              title="正则表达式 (Alt+R)"
              className="h-6 w-6 p-0 text-xs"
            >
              .*
            </Button>
          </div>
        </div>

        {/* Replace Query */}
        <div className="relative">
          <Input
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="替换为..."
            className="bg-[#3c3c3c] border-[#454545] text-[#cccccc]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="flex-1 h-8"
            size="sm"
          >
            {isSearching ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                搜索中...
              </>
            ) : (
              <>
                <Search className="h-3 w-3 mr-1" />
                搜索
              </>
            )}
          </Button>
          <Button
            onClick={handleReplaceAll}
            disabled={isReplacing || results.length === 0}
            variant="outline"
            className="h-8"
            size="sm"
          >
            {isReplacing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                替换中...
              </>
            ) : (
              <>
                <Replace className="h-3 w-3 mr-1" />
                全部替换
              </>
            )}
          </Button>
        </div>

        {/* Advanced Options Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full h-6 text-xs justify-start"
        >
          {showAdvanced ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
          高级选项
        </Button>

        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <Input
                value={options.include_pattern || ''}
                onChange={(e) => setOptions({ ...options, include_pattern: e.target.value })}
                placeholder="包含文件 (例如: *.ts,*.tsx)"
                className="bg-[#3c3c3c] border-[#454545] text-[#cccccc] text-xs h-7"
              />
              <Input
                value={options.exclude_pattern || ''}
                onChange={(e) => setOptions({ ...options, exclude_pattern: e.target.value })}
                placeholder="排除文件 (例如: node_modules,dist)"
                className="bg-[#3c3c3c] border-[#454545] text-[#cccccc] text-xs h-7"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded px-2 py-1"
          >
            {error}
          </motion.div>
        )}
      </div>

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="px-3 py-2 text-xs text-[#888] border-b border-[#454545]">
          找到 {totalMatches} 个匹配项，共 {totalFiles} 个文件
        </div>
      )}

      {/* Results List */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 && !isSearching && searchQuery && (
          <div className="p-4 text-center text-sm text-[#888]">
            没有找到匹配项
          </div>
        )}

        {Array.from(grouped.entries()).map(([filePath, fileResults]) => {
          const isExpanded = expandedFiles.has(filePath);
          const relativePath = getRelativePath(filePath);

          return (
            <div key={filePath} className="border-b border-[#2d2d2d]">
              {/* File Header */}
              <button
                onClick={() => toggleFileExpanded(filePath)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2a2d2e] transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-[#888] flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-[#888] flex-shrink-0" />
                )}
                <FileText className="h-3 w-3 text-[#888] flex-shrink-0" />
                <span className="text-sm text-[#cccccc] truncate flex-1">
                  {relativePath}
                </span>
                <span className="text-xs text-[#888] flex-shrink-0">
                  {fileResults.length}
                </span>
              </button>

              {/* File Results */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {fileResults.map((result, index) => (
                      <button
                        key={`${result.file_path}-${result.line_number}-${index}`}
                        onClick={() => onResultClick(result.file_path, result.line_number)}
                        className="w-full px-3 py-1.5 pl-10 hover:bg-[#2a2d2e] transition-colors text-left"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-[#888] flex-shrink-0 w-8 text-right">
                            {result.line_number}
                          </span>
                          <span className="text-xs text-[#cccccc] font-mono flex-1 truncate">
                            {highlightMatch(
                              result.line_content.trim(),
                              result.match_start,
                              result.match_end
                            )}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

