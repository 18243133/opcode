# Monaco Editor 集成快速开始指南

## 🚀 5分钟快速体验

### 步骤1：安装依赖（1分钟）

```bash
cd d:\OpenSource\opcode
npm install @monaco-editor/react monaco-editor
```

### 步骤2：创建基础编辑器组件（2分钟）

创建文件：`src/components/CodeEditor/MonacoEditor.tsx`

```tsx
import React from 'react';
import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language,
  onChange,
  readOnly = false,
}) => {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme="vs-dark"
      onChange={onChange}
      options={{
        readOnly,
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      }}
    />
  );
};
```

### 步骤3：在现有页面中使用（2分钟）

修改 `src/App.tsx`，添加测试页面：

```tsx
import { MonacoEditor } from '@/components/CodeEditor/MonacoEditor';

// 在 AppContent 组件中添加
const [testCode, setTestCode] = useState(`function hello() {
  console.log("Hello Monaco!");
}`);

// 在 renderView 中添加新的 case
case "monaco-test":
  return (
    <div className="h-full p-4">
      <h1 className="text-2xl mb-4">Monaco Editor 测试</h1>
      <div className="h-[600px] border border-border rounded-lg overflow-hidden">
        <MonacoEditor
          value={testCode}
          language="javascript"
          onChange={(value) => setTestCode(value || '')}
        />
      </div>
    </div>
  );
```

### 步骤4：测试（立即）

```bash
npm run tauri dev
```

在应用中导航到测试页面，你应该能看到Monaco编辑器！

## 📚 完整实现步骤

### 第一阶段：基础组件（1天）

#### 1. 创建目录结构

```bash
mkdir -p src/components/CodeEditor
mkdir -p src/hooks/editor
mkdir -p src/lib/monaco
```

#### 2. 创建核心组件

**MonacoEditor.tsx** - 编辑器封装
```tsx
// 见上面的示例
```

**EditorTabs.tsx** - 标签栏
```tsx
import React from 'react';
import { X } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  filePath: string;
  isDirty: boolean;
}

interface EditorTabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
}) => {
  return (
    <div className="flex bg-[#2d2d2d] border-b border-[#2d2d30]">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`
            flex items-center gap-2 px-3 py-2 cursor-pointer
            border-r border-[#2d2d30] min-w-[120px] max-w-[200px]
            ${tab.id === activeTabId ? 'bg-[#1e1e1e] border-b-2 border-b-[#007acc]' : 'hover:bg-[#2a2d2e]'}
          `}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="flex-1 truncate text-sm">
            {tab.isDirty && <span className="text-[#007acc] mr-1">●</span>}
            {tab.label}
          </span>
          <X
            className="w-4 h-4 opacity-60 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};
```

**FileTree.tsx** - 文件树
```tsx
import React, { useState } from 'react';
import { ChevronRight, Folder, File } from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

interface FileTreeProps {
  root: FileNode;
  onFileClick: (path: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ root, onFileClick }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set([root.path]));

  const toggleExpand = (path: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expanded.has(node.path);
    const Icon = node.isDirectory ? Folder : File;

    return (
      <div key={node.path}>
        <div
          className="flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.isDirectory) {
              toggleExpand(node.path);
            } else {
              onFileClick(node.path);
            }
          }}
        >
          {node.isDirectory && (
            <ChevronRight
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          )}
          <Icon className="w-4 h-4" />
          <span className="text-sm">{node.name}</span>
        </div>
        {node.isDirectory && isExpanded && node.children?.map(child =>
          renderNode(child, level + 1)
        )}
      </div>
    );
  };

  return <div className="py-2">{renderNode(root)}</div>;
};
```

#### 3. 创建Hooks

**useEditorTabs.ts**
```tsx
import { useState, useCallback } from 'react';

interface EditorTab {
  id: string;
  label: string;
  filePath: string;
  content: string;
  language: string;
  isDirty: boolean;
}

export const useEditorTabs = () => {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openFile = useCallback((filePath: string, content: string, language: string) => {
    const existingTab = tabs.find(t => t.filePath === filePath);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      label: filePath.split('/').pop() || 'Untitled',
      filePath,
      content,
      language,
      isDirty: false,
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs]);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => prev.filter(t => t.id !== tabId));
    if (activeTabId === tabId) {
      setActiveTabId(tabs[0]?.id || null);
    }
  }, [tabs, activeTabId]);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, content, isDirty: true } : t
    ));
  }, []);

  const activeTab = tabs.find(t => t.id === activeTabId);

  return {
    tabs,
    activeTab,
    activeTabId,
    openFile,
    closeTab,
    updateTabContent,
    setActiveTabId,
  };
};
```

### 第二阶段：后端集成（1天）

#### 1. 创建Rust命令

创建文件：`src-tauri/src/commands/file_operations.rs`

```rust
use std::fs;
use std::path::Path;

#[tauri::command]
pub async fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn write_file_content(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub async fn list_directory_tree(path: String) -> Result<serde_json::Value, String> {
    // 实现目录树遍历
    // 返回JSON格式的文件树
    Ok(serde_json::json!({
        "name": "root",
        "path": path,
        "isDirectory": true,
        "children": []
    }))
}
```

#### 2. 注册命令

修改 `src-tauri/src/main.rs`：

```rust
mod commands;
use commands::file_operations;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // ... 现有命令
            file_operations::read_file_content,
            file_operations::write_file_content,
            file_operations::list_directory_tree,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 第三阶段：完整集成（2天）

#### 1. 创建主编辑器视图

**CodeEditorView.tsx**
```tsx
import React, { useState, useEffect } from 'react';
import { MonacoEditor } from './MonacoEditor';
import { EditorTabs } from './EditorTabs';
import { FileTree } from './FileTree';
import { useEditorTabs } from '@/hooks/editor/useEditorTabs';
import { api } from '@/lib/api';

export const CodeEditorView: React.FC = () => {
  const { tabs, activeTab, openFile, closeTab, updateTabContent, setActiveTabId } = useEditorTabs();
  const [fileTree, setFileTree] = useState(null);

  const handleFileClick = async (filePath: string) => {
    const content = await api.readFileContent(filePath);
    const language = getLanguageFromPath(filePath);
    openFile(filePath, content, language);
  };

  return (
    <div className="flex h-full">
      {/* 左侧文件树 */}
      <div className="w-64 bg-[#252526] border-r border-[#2d2d30]">
        <div className="p-2 text-xs uppercase text-[#888] font-semibold">
          文件浏览器
        </div>
        {fileTree && (
          <FileTree root={fileTree} onFileClick={handleFileClick} />
        )}
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 flex flex-col">
        <EditorTabs
          tabs={tabs}
          activeTabId={activeTab?.id || ''}
          onTabClick={setActiveTabId}
          onTabClose={closeTab}
        />
        <div className="flex-1">
          {activeTab && (
            <MonacoEditor
              value={activeTab.content}
              language={activeTab.language}
              onChange={(value) => updateTabContent(activeTab.id, value || '')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'py': 'python',
    'rs': 'rust',
    'md': 'markdown',
    'json': 'json',
    'html': 'html',
    'css': 'css',
  };
  return langMap[ext || ''] || 'plaintext';
}
```

## 🎨 样式配置

创建 `src/lib/monaco/theme.ts`：

```typescript
export const darkTheme = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#cccccc',
    'editor.lineHighlightBackground': '#2a2d2e',
    'editorCursor.foreground': '#ffffff',
    'editor.selectionBackground': '#264f78',
  },
};
```

## ✅ 验证清单

- [ ] Monaco编辑器正常显示
- [ ] 语法高亮工作正常
- [ ] 文件可以打开和编辑
- [ ] 标签可以切换和关闭
- [ ] 文件树可以展开/折叠
- [ ] 保存功能正常
- [ ] 性能流畅（无卡顿）

## 🐛 常见问题

### 问题1：Monaco加载失败
**解决**：检查Web Worker配置

### 问题2：语法高亮不工作
**解决**：确保语言包已加载

### 问题3：性能问题
**解决**：启用虚拟滚动和懒加载

## 📚 下一步

1. 添加更多语言支持
2. 集成Claude代码建议
3. 添加搜索功能
4. 添加Git集成
5. 优化性能

## 🎯 预期结果

完成后，你将拥有：
- ✅ 完整的代码编辑器
- ✅ 文件浏览和管理
- ✅ 多标签编辑
- ✅ 语法高亮和智能提示
- ✅ 与Claude深度集成的IDE体验

