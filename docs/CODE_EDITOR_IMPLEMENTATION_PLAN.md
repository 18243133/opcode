# CodeEditor 实施计划详解

## 📋 目录
- [Phase 1: 基础增强实施细节](#phase-1-基础增强实施细节)
- [Phase 2: AI集成实施细节](#phase-2-ai集成实施细节)
- [技术架构设计](#技术架构设计)
- [代码示例](#代码示例)

---

## 🎯 Phase 1: 基础增强实施细节

### Week 1-2: 右键菜单 + 文件操作增强

#### 任务分解

**Day 1-2: 右键菜单组件**
```typescript
// src/components/CodeEditor/ContextMenu.tsx
interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void | Promise<void>;
  disabled?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  position,
  onClose
}) => {
  // 实现右键菜单
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bg-[#252526] border border-[#454545] rounded-md shadow-lg z-50"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item) => (
        item.separator ? (
          <div key={item.id} className="h-px bg-[#454545] my-1" />
        ) : (
          <button
            key={item.id}
            onClick={() => {
              item.action();
              onClose();
            }}
            disabled={item.disabled}
            className="w-full px-4 py-2 text-left hover:bg-[#2a2d2e] flex items-center gap-2"
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-[#888]">{item.shortcut}</span>
            )}
          </button>
        )
      ))}
    </motion.div>
  );
};
```

**Day 3-4: 文件操作对话框**
```typescript
// src/components/CodeEditor/FileOperationDialog.tsx
interface FileOperationDialogProps {
  type: 'create' | 'rename' | 'delete';
  currentPath?: string;
  onConfirm: (newPath: string) => Promise<void>;
  onCancel: () => void;
}

export const FileOperationDialog: React.FC<FileOperationDialogProps> = ({
  type,
  currentPath,
  onConfirm,
  onCancel
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onConfirm(inputValue);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'create' && '新建文件'}
            {type === 'rename' && '重命名'}
            {type === 'delete' && '删除确认'}
          </DialogTitle>
        </DialogHeader>
        
        {type !== 'delete' ? (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入文件名..."
            autoFocus
          />
        ) : (
          <p>确定要删除 {currentPath} 吗？</p>
        )}
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>取消</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? '处理中...' : '确定'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

**Day 5-7: 集成到FileTree**
```typescript
// src/components/CodeEditor/FileTree.tsx 增强版
export const FileTree: React.FC<FileTreeProps> = ({
  root,
  onFileClick,
  selectedPath,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    node: FileNode;
  } | null>(null);
  
  const [operationDialog, setOperationDialog] = useState<{
    type: 'create' | 'rename' | 'delete';
    node: FileNode;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      node
    });
  };

  const getContextMenuItems = (node: FileNode): ContextMenuItem[] => {
    return [
      {
        id: 'new-file',
        label: '新建文件',
        icon: <FileIcon />,
        action: () => setOperationDialog({ type: 'create', node }),
        disabled: !node.isDirectory
      },
      {
        id: 'new-folder',
        label: '新建文件夹',
        icon: <FolderIcon />,
        action: () => setOperationDialog({ type: 'create', node }),
        disabled: !node.isDirectory
      },
      { id: 'sep1', separator: true },
      {
        id: 'rename',
        label: '重命名',
        icon: <EditIcon />,
        shortcut: 'F2',
        action: () => setOperationDialog({ type: 'rename', node })
      },
      {
        id: 'delete',
        label: '删除',
        icon: <TrashIcon />,
        shortcut: 'Del',
        action: () => setOperationDialog({ type: 'delete', node })
      },
      { id: 'sep2', separator: true },
      {
        id: 'copy-path',
        label: '复制路径',
        icon: <CopyIcon />,
        action: () => navigator.clipboard.writeText(node.path)
      },
      {
        id: 'reveal',
        label: '在文件管理器中显示',
        icon: <ExternalLinkIcon />,
        action: () => invoke('reveal_in_explorer', { path: node.path })
      }
    ];
  };

  return (
    <div>
      {/* 文件树渲染 */}
      {renderNode(root)}
      
      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          items={getContextMenuItems(contextMenu.node)}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}
      
      {/* 操作对话框 */}
      {operationDialog && (
        <FileOperationDialog
          type={operationDialog.type}
          currentPath={operationDialog.node.path}
          onConfirm={async (newPath) => {
            // 执行文件操作
            await handleFileOperation(operationDialog.type, newPath);
            setOperationDialog(null);
          }}
          onCancel={() => setOperationDialog(null)}
        />
      )}
    </div>
  );
};
```

**Day 8-10: 拖拽功能**
```typescript
// src/hooks/editor/useDragAndDrop.ts
export function useDragAndDrop() {
  const [draggedNode, setDraggedNode] = useState<FileNode | null>(null);
  const [dropTarget, setDropTarget] = useState<FileNode | null>(null);

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.path);
  };

  const handleDragOver = (e: React.DragEvent, node: FileNode) => {
    if (!node.isDirectory) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(node);
  };

  const handleDrop = async (e: React.DragEvent, targetNode: FileNode) => {
    e.preventDefault();
    if (!draggedNode || !targetNode.isDirectory) return;

    const sourcePath = draggedNode.path;
    const targetPath = `${targetNode.path}/${draggedNode.name}`;

    try {
      await invoke('move_file', { sourcePath, targetPath });
      // 刷新文件树
    } catch (err) {
      console.error('Move failed:', err);
    } finally {
      setDraggedNode(null);
      setDropTarget(null);
    }
  };

  return {
    draggedNode,
    dropTarget,
    handleDragStart,
    handleDragOver,
    handleDrop
  };
}
```

---

### Week 3-4: 全局搜索替换

#### 任务分解

**Day 1-3: 搜索面板UI**
```typescript
// src/components/CodeEditor/SearchPanel.tsx
interface SearchPanelProps {
  projectPath: string;
  onResultClick: (filePath: string, line: number) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  projectPath,
  onResultClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [options, setOptions] = useState({
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    includePattern: '',
    excludePattern: ''
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await invoke<SearchResult[]>('search_in_files', {
        path: projectPath,
        query: searchQuery,
        options
      });
      setResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#252526]">
      {/* 搜索输入 */}
      <div className="p-4 border-b border-[#454545]">
        <div className="relative mb-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索..."
            className="pr-24"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              size="sm"
              variant={options.caseSensitive ? 'default' : 'ghost'}
              onClick={() => setOptions({ ...options, caseSensitive: !options.caseSensitive })}
              title="区分大小写"
            >
              Aa
            </Button>
            <Button
              size="sm"
              variant={options.wholeWord ? 'default' : 'ghost'}
              onClick={() => setOptions({ ...options, wholeWord: !options.wholeWord })}
              title="全词匹配"
            >
              Ab
            </Button>
            <Button
              size="sm"
              variant={options.regex ? 'default' : 'ghost'}
              onClick={() => setOptions({ ...options, regex: !options.regex })}
              title="正则表达式"
            >
              .*
            </Button>
          </div>
        </div>
        
        <Input
          value={replaceQuery}
          onChange={(e) => setReplaceQuery(e.target.value)}
          placeholder="替换为..."
          className="mb-2"
        />
        
        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={isSearching} className="flex-1">
            {isSearching ? '搜索中...' : '搜索'}
          </Button>
          <Button variant="outline" onClick={handleReplaceAll}>
            全部替换
          </Button>
        </div>
      </div>

      {/* 搜索结果 */}
      <div className="flex-1 overflow-y-auto">
        <SearchResults
          results={results}
          onResultClick={onResultClick}
        />
      </div>
    </div>
  );
};
```

**Day 4-7: 后端搜索实现**
```rust
// src-tauri/src/commands/search.rs
use ripgrep::Searcher;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchOptions {
    case_sensitive: bool,
    whole_word: bool,
    regex: bool,
    include_pattern: Option<String>,
    exclude_pattern: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    file_path: String,
    line_number: usize,
    line_content: String,
    match_start: usize,
    match_end: usize,
}

#[tauri::command]
pub async fn search_in_files(
    path: String,
    query: String,
    options: SearchOptions,
) -> Result<Vec<SearchResult>, String> {
    let mut results = Vec::new();
    
    // 使用ripgrep进行搜索
    let mut searcher = Searcher::new();
    
    if options.case_sensitive {
        searcher = searcher.case_sensitive(true);
    }
    
    if options.whole_word {
        searcher = searcher.word_regexp(true);
    }
    
    // 执行搜索
    searcher.search_path(
        &query,
        &path,
        |line_num, line_content, matches| {
            for m in matches {
                results.push(SearchResult {
                    file_path: path.clone(),
                    line_number: line_num,
                    line_content: line_content.to_string(),
                    match_start: m.start(),
                    match_end: m.end(),
                });
            }
            Ok(())
        },
    )?;
    
    Ok(results)
}

#[tauri::command]
pub async fn replace_in_files(
    results: Vec<SearchResult>,
    replace_text: String,
) -> Result<usize, String> {
    let mut replaced_count = 0;
    
    // 按文件分组
    let mut files: HashMap<String, Vec<SearchResult>> = HashMap::new();
    for result in results {
        files.entry(result.file_path.clone())
            .or_insert_with(Vec::new)
            .push(result);
    }
    
    // 逐文件替换
    for (file_path, file_results) in files {
        let content = fs::read_to_string(&file_path)?;
        let mut new_content = content.clone();
        
        // 从后往前替换，避免位置偏移
        for result in file_results.iter().rev() {
            let start = result.match_start;
            let end = result.match_end;
            new_content.replace_range(start..end, &replace_text);
            replaced_count += 1;
        }
        
        fs::write(&file_path, new_content)?;
    }
    
    Ok(replaced_count)
}
```

---

## 🤖 Phase 2: AI集成实施细节

### Week 1-2: 内联AI助手基础框架

#### 架构设计

```
┌─────────────────────────────────────────────┐
│ Monaco Editor                               │
│                                             │
│  function hello() {                         │
│    console.log("Hello");  ← [选中代码]      │
│  }                                          │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ 💬 Claude建议                         │  │
│  │ ─────────────────────────────────────│  │
│  │ 这段代码可以优化为：                  │  │
│  │ const hello = () => console.log(...   │  │
│  │                                       │  │
│  │ [应用] [拒绝] [修改提示]              │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

#### 实现代码

```typescript
// src/components/CodeEditor/InlineAIWidget.tsx
interface InlineAIWidgetProps {
  editor: monaco.editor.IStandaloneCodeEditor;
  position: monaco.Position;
  selectedCode: string;
  onApply: (suggestion: string) => void;
  onDismiss: () => void;
}

export const InlineAIWidget: React.FC<InlineAIWidgetProps> = ({
  editor,
  position,
  selectedCode,
  onApply,
  onDismiss
}) => {
  const [prompt, setPrompt] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    setIsLoading(true);
    try {
      const response = await invoke<string>('ask_claude_about_code', {
        code: selectedCode,
        prompt: prompt
      });
      setSuggestion(response);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute z-50 bg-[#252526] border border-[#454545] rounded-lg shadow-xl p-4 min-w-[400px]"
      style={{
        left: position.column * 8, // 粗略计算
        top: position.lineNumber * 20
      }}
    >
      {!suggestion ? (
        <>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="问Claude关于这段代码..."
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <Button onClick={handleAsk} disabled={isLoading}>
              {isLoading ? '思考中...' : '询问'}
            </Button>
            <Button variant="ghost" onClick={onDismiss}>取消</Button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-2">
            <h4 className="font-semibold mb-2">Claude建议：</h4>
            <pre className="bg-[#1e1e1e] p-2 rounded text-sm overflow-x-auto">
              {suggestion}
            </pre>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onApply(suggestion)}>应用</Button>
            <Button variant="outline" onClick={() => setSuggestion('')}>
              修改提示
            </Button>
            <Button variant="ghost" onClick={onDismiss}>拒绝</Button>
          </div>
        </>
      )}
    </motion.div>
  );
};
```


