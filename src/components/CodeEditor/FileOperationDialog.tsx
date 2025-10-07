import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { File, Folder, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type FileOperationType = 'create-file' | 'create-folder' | 'rename' | 'delete';

export interface FileOperationDialogProps {
  type: FileOperationType;
  currentPath?: string;
  currentName?: string;
  isDirectory?: boolean;
  onConfirm: (newPath: string) => Promise<void>;
  onCancel: () => void;
  open: boolean;
}

/**
 * FileOperationDialog - Dialog for file/folder operations
 * 
 * @example
 * <FileOperationDialog
 *   type="create-file"
 *   currentPath="/path/to/folder"
 *   onConfirm={async (name) => await createFile(name)}
 *   onCancel={() => setShowDialog(false)}
 *   open={showDialog}
 * />
 */
export const FileOperationDialog: React.FC<FileOperationDialogProps> = ({
  type,
  currentPath,
  currentName,
  isDirectory = false,
  onConfirm,
  onCancel,
  open
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize input value
  useEffect(() => {
    if (open) {
      if (type === 'rename' && currentName) {
        setInputValue(currentName);
      } else {
        setInputValue('');
      }
      setError('');
    }
  }, [open, type, currentName]);

  const getTitle = () => {
    switch (type) {
      case 'create-file':
        return '新建文件';
      case 'create-folder':
        return '新建文件夹';
      case 'rename':
        return isDirectory ? '重命名文件夹' : '重命名文件';
      case 'delete':
        return isDirectory ? '删除文件夹' : '删除文件';
      default:
        return '';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'create-file':
        return '输入新文件的名称';
      case 'create-folder':
        return '输入新文件夹的名称';
      case 'rename':
        return '输入新的名称';
      case 'delete':
        return `确定要删除 "${currentName}" 吗？此操作无法撤销。`;
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'create-file':
      case 'rename':
        return !isDirectory ? <File className="h-5 w-5" /> : <Folder className="h-5 w-5" />;
      case 'create-folder':
        return <Folder className="h-5 w-5" />;
      case 'delete':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const validateInput = (): string | null => {
    if (type === 'delete') return null;

    if (!inputValue.trim()) {
      return '名称不能为空';
    }

    // Check for invalid characters
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(inputValue)) {
      return '名称包含无效字符';
    }

    // Check for reserved names (Windows)
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const nameWithoutExt = inputValue.split('.')[0].toUpperCase();
    if (reservedNames.includes(nameWithoutExt)) {
      return '名称为系统保留名称';
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onConfirm(inputValue);
      onCancel(); // Close dialog on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px] bg-[#252526] border-[#454545]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#cccccc]">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-[#888]">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {type !== 'delete' ? (
          <div className="py-4">
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                type === 'create-file' ? '例如: index.tsx' :
                type === 'create-folder' ? '例如: components' :
                '输入新名称...'
              }
              autoFocus
              disabled={isLoading}
              className={cn(
                "bg-[#3c3c3c] border-[#454545] text-[#cccccc]",
                error && "border-red-500"
              )}
            />

            {/* Current path hint */}
            {currentPath && (
              <p className="text-xs text-[#888] mt-2">
                位置: {currentPath}
              </p>
            )}

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 mt-2 flex items-center gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                {error}
              </motion.p>
            )}
          </div>
        ) : (
          <div className="py-4">
            <div className="bg-red-900/20 border border-red-500/30 rounded-md p-3">
              <p className="text-sm text-[#cccccc]">
                路径: <span className="font-mono text-red-400">{currentPath}</span>
              </p>
              {isDirectory && (
                <p className="text-xs text-[#888] mt-2">
                  ⚠️ 此文件夹及其所有内容将被删除
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="text-[#cccccc] hover:bg-[#2a2d2e]"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            variant={type === 'delete' ? 'destructive' : 'default'}
            className={cn(
              type === 'delete' && "bg-red-600 hover:bg-red-700"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="rotating-symbol" />
                处理中...
              </span>
            ) : (
              type === 'delete' ? '删除' : '确定'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

