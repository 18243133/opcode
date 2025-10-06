import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { FileNode } from '@/components/CodeEditor';

export interface FileEntry {
  path: string;
  name: string;
  is_directory: boolean;
  size?: number;
  modified?: number;
}

export interface UseFileOperationsReturn {
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  createFile: (path: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  createDirectory: (path: string) => Promise<void>;
  listDirectory: (path: string) => Promise<FileEntry[]>;
  listDirectoryTree: (path: string, maxDepth?: number) => Promise<FileNode>;
  pathExists: (path: string) => Promise<boolean>;
  isDirectory: (path: string) => Promise<boolean>;
  getFileMetadata: (path: string) => Promise<FileEntry>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for file system operations
 * 
 * @example
 * const { readFile, writeFile, listDirectoryTree } = useFileOperations();
 * 
 * const content = await readFile('/path/to/file.txt');
 * await writeFile('/path/to/file.txt', 'new content');
 * const tree = await listDirectoryTree('/path/to/directory');
 */
export function useFileOperations(): UseFileOperationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOperation = useCallback(async <T,>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const readFile = useCallback(async (path: string): Promise<string> => {
    return handleOperation(async () => {
      return await invoke<string>('read_file_content', { path });
    });
  }, [handleOperation]);

  const writeFile = useCallback(async (path: string, content: string): Promise<void> => {
    return handleOperation(async () => {
      await invoke('write_file_content', { path, content });
    });
  }, [handleOperation]);

  const createFile = useCallback(async (path: string): Promise<void> => {
    return handleOperation(async () => {
      await invoke('create_file', { path });
    });
  }, [handleOperation]);

  const deleteFile = useCallback(async (path: string): Promise<void> => {
    return handleOperation(async () => {
      await invoke('delete_file', { path });
    });
  }, [handleOperation]);

  const renameFile = useCallback(async (oldPath: string, newPath: string): Promise<void> => {
    return handleOperation(async () => {
      await invoke('rename_file', { oldPath, newPath });
    });
  }, [handleOperation]);

  const createDirectory = useCallback(async (path: string): Promise<void> => {
    return handleOperation(async () => {
      await invoke('create_directory', { path });
    });
  }, [handleOperation]);

  const listDirectory = useCallback(async (path: string): Promise<FileEntry[]> => {
    return handleOperation(async () => {
      return await invoke<FileEntry[]>('list_directory', { path });
    });
  }, [handleOperation]);

  const listDirectoryTree = useCallback(async (
    path: string,
    maxDepth: number = 10
  ): Promise<FileNode> => {
    return handleOperation(async () => {
      const result = await invoke<any>('list_directory_tree', { path, maxDepth });
      return convertToFileNode(result);
    });
  }, [handleOperation]);

  const pathExists = useCallback(async (path: string): Promise<boolean> => {
    return handleOperation(async () => {
      return await invoke<boolean>('path_exists', { path });
    });
  }, [handleOperation]);

  const isDirectory = useCallback(async (path: string): Promise<boolean> => {
    return handleOperation(async () => {
      return await invoke<boolean>('is_directory', { path });
    });
  }, [handleOperation]);

  const getFileMetadata = useCallback(async (path: string): Promise<FileEntry> => {
    return handleOperation(async () => {
      return await invoke<FileEntry>('get_file_metadata', { path });
    });
  }, [handleOperation]);

  return {
    readFile,
    writeFile,
    createFile,
    deleteFile,
    renameFile,
    createDirectory,
    listDirectory,
    listDirectoryTree,
    pathExists,
    isDirectory,
    getFileMetadata,
    loading,
    error,
  };
}

/**
 * Convert Rust FileTreeNode to TypeScript FileNode
 */
function convertToFileNode(rustNode: any): FileNode {
  return {
    name: rustNode.name,
    path: rustNode.path,
    isDirectory: rustNode.is_directory,
    children: rustNode.children?.map(convertToFileNode),
  };
}

