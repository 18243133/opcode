# Monaco Editor 使用指南

## 🎉 功能概述

Opcode现在集成了完整的Monaco Editor（VS Code的核心编辑器），提供专业级的代码编辑体验！

### ✨ 主要特性

- ✅ **完整的Monaco编辑器** - VS Code同款编辑器
- ✅ **100+编程语言支持** - 语法高亮、智能提示
- ✅ **文件树浏览器** - 可展开/折叠的目录结构
- ✅ **多标签编辑** - 同时打开多个文件
- ✅ **智能代码补全** - IntelliSense支持
- ✅ **快捷键支持** - 熟悉的VS Code快捷键
- ✅ **文件保存/读取** - 完整的文件操作
- ✅ **深色主题** - VS Code风格界面
- ✅ **状态栏** - 显示文件信息和状态

## 🚀 如何使用

### 方法1：通过App.tsx访问

在`App.tsx`中，代码编辑器已经集成为一个新的视图：

```typescript
// 在App.tsx中切换到代码编辑器视图
setView("code-editor");
```

### 方法2：直接使用组件

```typescript
import { CodeEditorView } from '@/components/CodeEditor';

function MyComponent() {
  return (
    <CodeEditorView
      initialDirectory="/path/to/project"
      onFileOpen={(filePath) => console.log('Opened:', filePath)}
    />
  );
}
```

### 方法3：集成Claude的编辑器

```typescript
import { CodeEditorWithClaude } from '@/components/CodeEditor';

function MyComponent() {
  return (
    <CodeEditorWithClaude
      initialDirectory="/path/to/project"
      projectId="project-123"
      sessionId="session-456"
    />
  );
}
```

## ⌨️ 快捷键

### 文件操作
- `Ctrl+S` / `Cmd+S` - 保存当前文件
- `Ctrl+Shift+S` / `Cmd+Shift+S` - 保存所有文件
- `Ctrl+W` / `Cmd+W` - 关闭当前标签

### 标签导航
- `Ctrl+Tab` - 下一个标签
- `Ctrl+Shift+Tab` - 上一个标签

### 编辑器功能
- `Ctrl+F` / `Cmd+F` - 查找
- `Ctrl+H` / `Cmd+H` - 替换
- `Ctrl+/` / `Cmd+/` - 切换注释
- `Alt+↑/↓` - 移动行
- `Shift+Alt+↑/↓` - 复制行
- `Ctrl+D` / `Cmd+D` - 选择下一个匹配项
- `Ctrl+Shift+L` / `Cmd+Shift+L` - 选择所有匹配项

## 📁 文件操作API

### 后端API（Rust）

所有文件操作都通过Tauri命令实现：

```rust
// 读取文件
read_file_content(path: String) -> Result<String, String>

// 写入文件
write_file_content(path: String, content: String) -> Result<(), String>

// 创建文件
create_file(path: String) -> Result<(), String>

// 删除文件
delete_file(path: String) -> Result<(), String>

// 重命名文件
rename_file(old_path: String, new_path: String) -> Result<(), String>

// 创建目录
create_directory(path: String) -> Result<(), String>

// 列出目录
list_directory(path: String) -> Result<Vec<FileEntry>, String>

// 获取目录树
list_directory_tree(path: String, max_depth: Option<usize>) -> Result<FileTreeNode, String>

// 检查路径是否存在
path_exists(path: String) -> Result<bool, String>

// 检查是否为目录
is_directory(path: String) -> Result<bool, String>

// 获取文件元数据
get_file_metadata(path: String) -> Result<FileEntry, String>
```

### 前端Hook

使用`useFileOperations` Hook进行文件操作：

```typescript
import { useFileOperations } from '@/hooks/editor';

function MyComponent() {
  const fileOps = useFileOperations();

  const handleReadFile = async () => {
    const content = await fileOps.readFile('/path/to/file.txt');
    console.log(content);
  };

  const handleWriteFile = async () => {
    await fileOps.writeFile('/path/to/file.txt', 'new content');
  };

  const handleLoadTree = async () => {
    const tree = await fileOps.listDirectoryTree('/path/to/directory');
    console.log(tree);
  };

  return (
    <div>
      <button onClick={handleReadFile}>Read File</button>
      <button onClick={handleWriteFile}>Write File</button>
      <button onClick={handleLoadTree}>Load Tree</button>
    </div>
  );
}
```

## 🎨 组件架构

### 核心组件

#### 1. MonacoEditor
Monaco编辑器的React封装

```typescript
<MonacoEditor
  value={code}
  language="typescript"
  onChange={(value) => setCode(value || '')}
  readOnly={false}
  theme="vs-dark"
/>
```

#### 2. EditorTabs
标签栏组件

```typescript
<EditorTabs
  tabs={tabs}
  activeTabId={activeTabId}
  onTabClick={setActiveTabId}
  onTabClose={closeTab}
/>
```

#### 3. FileTree
文件树组件

```typescript
<FileTree
  root={fileTree}
  onFileClick={handleFileClick}
  selectedPath={currentFilePath}
/>
```

#### 4. CodeEditorView
完整的编辑器视图（文件树 + 编辑器 + 标签栏）

```typescript
<CodeEditorView
  initialDirectory="/path/to/project"
  onFileOpen={(path) => console.log('Opened:', path)}
/>
```

#### 5. CodeEditorWithClaude
集成Claude的编辑器（编辑器 + Claude聊天）

```typescript
<CodeEditorWithClaude
  initialDirectory="/path/to/project"
  projectId="project-123"
  sessionId="session-456"
/>
```

### Hooks

#### useEditorTabs
管理编辑器标签

```typescript
const {
  tabs,
  activeTab,
  openFile,
  closeTab,
  updateTabContent,
  saveTab,
  saveAllTabs,
  hasUnsavedChanges,
} = useEditorTabs(async (filePath, content) => {
  // 保存文件回调
  await saveToBackend(filePath, content);
});
```

#### useFileOperations
文件系统操作

```typescript
const {
  readFile,
  writeFile,
  createFile,
  deleteFile,
  listDirectoryTree,
  loading,
  error,
} = useFileOperations();
```

## 🎯 使用场景

### 场景1：浏览和编辑项目文件

```typescript
function ProjectEditor() {
  return (
    <CodeEditorView
      initialDirectory="/path/to/my-project"
      onFileOpen={(path) => {
        console.log('User opened:', path);
      }}
    />
  );
}
```

### 场景2：与Claude协作编码

```typescript
function ClaudeCodeEditor() {
  const [projectId, setProjectId] = useState('project-123');
  const [sessionId, setSessionId] = useState('session-456');

  return (
    <CodeEditorWithClaude
      initialDirectory="/path/to/project"
      projectId={projectId}
      sessionId={sessionId}
    />
  );
}
```

### 场景3：自定义编辑器

```typescript
function CustomEditor() {
  const [code, setCode] = useState('// Start coding');

  return (
    <MonacoEditor
      value={code}
      language="javascript"
      onChange={(value) => setCode(value || '')}
      theme="vs-dark"
    />
  );
}
```

## 📊 性能优化

### 已实现的优化

1. **懒加载** - Monaco编辑器按需加载
2. **虚拟滚动** - 文件树使用虚拟滚动（大项目）
3. **缓存** - 文件内容和目录树缓存
4. **Web Worker** - Monaco在Worker中运行
5. **增量更新** - 只更新变化的部分

### 包体积

- Monaco Editor: ~3MB (gzipped)
- 总前端包: ~6.7MB (gzipped)
- 增加: ~81% (可接受)

## 🐛 已知问题

1. **首次加载** - Monaco首次加载需要~1-2秒
2. **大文件** - 超大文件（>10MB）可能卡顿
3. **内存** - 同时打开多个大文件会占用较多内存

## 🔮 未来计划

- [ ] Git集成（状态、提交、分支）
- [ ] 终端集成（内置终端）
- [ ] 调试器集成
- [ ] 扩展系统（插件）
- [ ] 主题自定义
- [ ] 快捷键自定义
- [ ] 代码格式化
- [ ] 代码片段
- [ ] 多光标编辑增强

## 📚 参考资料

- [Monaco Editor文档](https://microsoft.github.io/monaco-editor/)
- [VS Code源码](https://github.com/microsoft/vscode)
- [React Monaco Editor](https://github.com/suren-atoyan/monaco-react)
- [Tauri文件系统API](https://tauri.app/v1/api/js/fs)

## 🎊 总结

Monaco Editor集成为Opcode带来了完整的IDE体验！现在你可以：

- ✅ 在Opcode中直接编辑代码
- ✅ 享受VS Code级别的编辑体验
- ✅ 与Claude AI无缝协作
- ✅ 无需切换到外部编辑器

开始使用吧！🚀

