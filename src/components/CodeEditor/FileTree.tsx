import React, { useState, useCallback } from 'react';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FilePlus,
  FolderPlus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFileIcon } from './MonacoEditor';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import { FileOperationDialog, FileOperationType } from './FileOperationDialog';
import { AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

export interface FileTreeProps {
  root: FileNode;
  onFileClick: (path: string) => void;
  onFolderClick?: (path: string) => void;
  selectedPath?: string;
  className?: string;
  onRefresh?: () => void;
}

/**
 * FileTree component - Hierarchical file browser with context menu support
 *
 * @example
 * <FileTree
 *   root={fileTree}
 *   onFileClick={handleFileClick}
 *   selectedPath={currentFilePath}
 *   onRefresh={() => reloadTree()}
 * />
 */
export const FileTree: React.FC<FileTreeProps> = ({
  root,
  onFileClick,
  onFolderClick,
  selectedPath,
  className,
  onRefresh,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set([root.path]));
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    node: FileNode;
  } | null>(null);
  const [operationDialog, setOperationDialog] = useState<{
    type: FileOperationType;
    node: FileNode;
  } | null>(null);

  const toggleExpand = useCallback((path: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleNodeClick = useCallback((node: FileNode) => {
    if (node.isDirectory) {
      toggleExpand(node.path);
      onFolderClick?.(node.path);
    } else {
      onFileClick(node.path);
    }
  }, [toggleExpand, onFileClick, onFolderClick]);

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      node
    });
  }, []);

  const getContextMenuItems = useCallback((node: FileNode): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [];

    // New File/Folder (only for directories)
    if (node.isDirectory) {
      items.push({
        id: 'new-file',
        label: '新建文件',
        icon: <FilePlus className="h-4 w-4" />,
        action: () => setOperationDialog({ type: 'create-file', node })
      });
      items.push({
        id: 'new-folder',
        label: '新建文件夹',
        icon: <FolderPlus className="h-4 w-4" />,
        action: () => setOperationDialog({ type: 'create-folder', node })
      });
      items.push({ id: 'sep1', separator: true });
    }

    // Rename
    items.push({
      id: 'rename',
      label: '重命名',
      icon: <Edit2 className="h-4 w-4" />,
      shortcut: 'F2',
      action: () => setOperationDialog({ type: 'rename', node })
    });

    // Delete
    items.push({
      id: 'delete',
      label: '删除',
      icon: <Trash2 className="h-4 w-4" />,
      shortcut: 'Del',
      danger: true,
      action: () => setOperationDialog({ type: 'delete', node })
    });

    items.push({ id: 'sep2', separator: true });

    // Copy Path
    items.push({
      id: 'copy-path',
      label: '复制路径',
      icon: <Copy className="h-4 w-4" />,
      action: async () => {
        await navigator.clipboard.writeText(node.path);
      }
    });

    // Copy Relative Path
    items.push({
      id: 'copy-relative-path',
      label: '复制相对路径',
      icon: <Copy className="h-4 w-4" />,
      action: async () => {
        const relativePath = node.path.replace(root.path, '').replace(/^[/\\]/, '');
        await navigator.clipboard.writeText(relativePath);
      }
    });

    items.push({ id: 'sep3', separator: true });

    // Reveal in Explorer
    items.push({
      id: 'reveal',
      label: '在文件管理器中显示',
      icon: <ExternalLink className="h-4 w-4" />,
      action: async () => {
        try {
          await invoke('reveal_in_explorer', { path: node.path });
        } catch (err) {
          console.error('Failed to reveal in explorer:', err);
        }
      }
    });

    return items;
  }, [root.path]);

  const handleFileOperation = useCallback(async (type: FileOperationType, node: FileNode, newName?: string) => {
    try {
      switch (type) {
        case 'create-file': {
          if (!newName) return;
          const newPath = `${node.path}/${newName}`;
          await invoke('create_file', { path: newPath });
          break;
        }
        case 'create-folder': {
          if (!newName) return;
          const newPath = `${node.path}/${newName}`;
          await invoke('create_directory', { path: newPath });
          break;
        }
        case 'rename': {
          if (!newName) return;
          const parentPath = node.path.substring(0, node.path.lastIndexOf('/'));
          const newPath = `${parentPath}/${newName}`;
          await invoke('rename_file', { oldPath: node.path, newPath });
          break;
        }
        case 'delete': {
          await invoke('delete_file', { path: node.path });
          break;
        }
      }

      // Refresh the file tree
      onRefresh?.();
    } catch (err) {
      console.error('File operation failed:', err);
      throw err;
    }
  }, [onRefresh]);

  const renderNode = (node: FileNode, level: number = 0): React.ReactNode => {
    const isExpanded = expanded.has(node.path);
    const isSelected = selectedPath === node.path;
    const hasChildren = node.children && node.children.length > 0;

    // Sort children: directories first, then files, both alphabetically
    const sortedChildren = node.children?.slice().sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <div key={node.path}>
        <div
          className={cn(
            "flex items-center gap-1 py-1 px-2 cursor-pointer",
            "hover:bg-[#2a2d2e] transition-colors duration-150",
            "text-sm text-[#cccccc]",
            isSelected && "bg-[#094771]"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleNodeClick(node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
          title={node.path}
        >
          {/* Chevron for directories */}
          {node.isDirectory && (
            <ChevronRight
              className={cn(
                "w-3 h-3 transition-transform duration-150 flex-shrink-0",
                isExpanded && "rotate-90"
              )}
            />
          )}
          {!node.isDirectory && <span className="w-3" />}

          {/* Icon */}
          {node.isDirectory ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-[#dcb67a] flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-[#dcb67a] flex-shrink-0" />
            )
          ) : (
            <span className="text-sm flex-shrink-0">{getFileIcon(node.name)}</span>
          )}

          {/* Name */}
          <span className="truncate flex-1">{node.name}</span>
        </div>

        {/* Children */}
        {node.isDirectory && isExpanded && hasChildren && (
          <div>
            {sortedChildren!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={cn("py-2 overflow-y-auto", className)}>
        {renderNode(root)}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            items={getContextMenuItems(contextMenu.node)}
            position={contextMenu.position}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* File Operation Dialog */}
      {operationDialog && (
        <FileOperationDialog
          type={operationDialog.type}
          currentPath={operationDialog.node.path}
          currentName={operationDialog.node.name}
          isDirectory={operationDialog.node.isDirectory}
          onConfirm={async (newName) => {
            await handleFileOperation(operationDialog.type, operationDialog.node, newName);
            setOperationDialog(null);
          }}
          onCancel={() => setOperationDialog(null)}
          open={true}
        />
      )}
    </>
  );
};

/**
 * Build file tree from flat file list
 */
export function buildFileTree(files: Array<{ path: string; isDirectory: boolean }>, rootPath: string): FileNode {
  const root: FileNode = {
    name: rootPath.split(/[/\\]/).pop() || rootPath,
    path: rootPath,
    isDirectory: true,
    children: [],
  };

  const nodeMap = new Map<string, FileNode>();
  nodeMap.set(rootPath, root);

  // Sort files by path depth to ensure parents are created before children
  const sortedFiles = files.slice().sort((a, b) => {
    const depthA = a.path.split(/[/\\]/).length;
    const depthB = b.path.split(/[/\\]/).length;
    return depthA - depthB;
  });

  for (const file of sortedFiles) {
    const parts = file.path.replace(rootPath, '').split(/[/\\]/).filter(Boolean);
    let currentPath = rootPath;
    let currentNode = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      currentPath = `${currentPath}/${part}`.replace(/\/+/g, '/');

      let node = nodeMap.get(currentPath);
      
      if (!node) {
        node = {
          name: part,
          path: currentPath,
          isDirectory: !isLast || file.isDirectory,
          children: [],
        };
        
        if (!currentNode.children) {
          currentNode.children = [];
        }
        currentNode.children.push(node);
        nodeMap.set(currentPath, node);
      }

      currentNode = node;
    }
  }

  return root;
}

/**
 * Filter file tree by search query
 */
export function filterFileTree(node: FileNode, query: string): FileNode | null {
  if (!query) return node;

  const lowerQuery = query.toLowerCase();
  const nameMatches = node.name.toLowerCase().includes(lowerQuery);

  if (node.isDirectory) {
    const filteredChildren = node.children
      ?.map(child => filterFileTree(child, query))
      .filter((child): child is FileNode => child !== null) || [];

    if (nameMatches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
      };
    }
    return null;
  }

  return nameMatches ? node : null;
}

