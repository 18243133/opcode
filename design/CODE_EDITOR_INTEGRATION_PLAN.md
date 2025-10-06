# Opcode - VS Code风格代码编辑器集成方案

## 📋 目标

将Opcode从单纯的Claude Code GUI界面升级为集成代码编辑器的完整IDE，提供类似VS Code的开发体验。

## 🎯 核心功能

### 1. 文件浏览器（File Explorer）
- ✅ **已有基础**：`FilePicker.tsx`
- 🔧 **需要增强**：
  - 树形结构展示
  - 文件夹展开/折叠
  - 右键菜单（新建、删除、重命名）
  - 拖拽文件
  - 文件图标（根据文件类型）
  - 搜索过滤

### 2. 代码编辑器（Code Editor）
- ❌ **需要新建**：Monaco Editor集成
- 功能：
  - 语法高亮（100+语言）
  - 智能提示（IntelliSense）
  - 代码折叠
  - 多光标编辑
  - 查找替换
  - 代码格式化
  - 错误提示
  - Git差异显示

### 3. 多标签编辑（Tabs）
- ✅ **已有基础**：`TabManager.tsx`（用于Claude会话）
- 🔧 **需要扩展**：
  - 文件标签
  - 标签拖拽排序
  - 标签分组
  - 未保存标识（圆点）
  - 关闭所有/关闭其他

### 4. 分割视图（Split View）
- ✅ **已有基础**：`split-pane.tsx`
- 🔧 **需要增强**：
  - 水平/垂直分割
  - 多个编辑器并排
  - 拖拽调整大小

### 5. Claude集成（AI Assistant）
- ✅ **已有**：`ClaudeCodeSession.tsx`
- 🔧 **需要优化**：
  - 侧边栏聊天面板
  - 代码上下文自动传递
  - 内联代码建议
  - 快速修复建议

## 🏗️ 技术方案

### 方案A：Monaco Editor（推荐）⭐

#### 依赖安装
```bash
npm install @monaco-editor/react monaco-editor
```

#### 优点
- ✅ VS Code的核心编辑器
- ✅ 功能最强大（智能提示、代码折叠、多光标等）
- ✅ 支持100+编程语言
- ✅ 性能优秀
- ✅ TypeScript支持完善
- ✅ 活跃的社区

#### 缺点
- ❌ 包体积较大（~3MB gzipped）
- ❌ 配置相对复杂
- ❌ 需要Web Worker支持

#### 包体积影响
- 当前前端包：~3.7MB（gzipped）
- 添加Monaco后：~6.7MB（gzipped）
- 增加：~3MB（可接受）

### 方案B：CodeMirror 6（备选）

#### 依赖安装
```bash
npm install @codemirror/state @codemirror/view @codemirror/lang-javascript
```

#### 优点
- ✅ 轻量级（~500KB gzipped）
- ✅ 高度可定制
- ✅ 性能好
- ✅ 现代化架构

#### 缺点
- ❌ 功能不如Monaco
- ❌ 需要手动配置语言支持
- ❌ 智能提示需要额外配置

## 📐 UI布局设计

### 三栏布局

```
┌─────────────────────────────────────────────────────────┐
│                      标题栏 (Titlebar)                    │
├──────────┬────────────────────────────┬──────────────────┤
│          │      标签栏 (Tabs)          │                  │
│  文件树  ├────────────────────────────┤   Claude聊天     │
│          │                            │                  │
│ (250px)  │   Monaco编辑器 (Flex)       │    (400px)       │
│          │                            │                  │
│          │                            │                  │
├──────────┴────────────────────────────┴──────────────────┤
│                    状态栏 (Statusbar)                     │
└─────────────────────────────────────────────────────────┘
```

### 组件层次

```
App
├── CustomTitlebar
├── MainLayout
│   ├── FileExplorer (左侧)
│   │   ├── FileTree
│   │   └── ContextMenu
│   ├── EditorArea (中间)
│   │   ├── TabBar
│   │   │   └── Tab[]
│   │   └── MonacoEditor
│   └── ClaudePanel (右侧)
│       ├── ChatMessages
│       └── PromptInput
└── Statusbar
```

## 🔧 实现步骤

### 阶段1：基础集成（1-2天）

#### 1.1 安装依赖
```bash
npm install @monaco-editor/react monaco-editor
npm install @types/node --save-dev
```

#### 1.2 创建基础组件
- `src/components/CodeEditor/MonacoEditor.tsx` - Monaco编辑器封装
- `src/components/CodeEditor/EditorTabs.tsx` - 编辑器标签栏
- `src/components/CodeEditor/FileTree.tsx` - 文件树组件

#### 1.3 配置Monaco
- 配置语言支持
- 配置主题（Dark/Light）
- 配置Web Worker

### 阶段2：文件操作（2-3天）

#### 2.1 后端API
在`src-tauri/src/commands/`添加：
- `file_operations.rs` - 文件CRUD操作
  - `read_file_content(path)` - 读取文件
  - `write_file_content(path, content)` - 写入文件
  - `create_file(path)` - 创建文件
  - `delete_file(path)` - 删除文件
  - `rename_file(old_path, new_path)` - 重命名
  - `list_directory_tree(path)` - 获取目录树

#### 2.2 前端集成
- 文件打开/保存
- 文件监听（自动刷新）
- 未保存提示

### 阶段3：高级功能（3-4天）

#### 3.1 多标签管理
- 标签拖拽排序
- 标签分组
- 快捷键切换（Ctrl+Tab）

#### 3.2 分割视图
- 水平/垂直分割
- 拖拽调整大小
- 同步滚动（可选）

#### 3.3 搜索功能
- 文件内搜索（Ctrl+F）
- 全局搜索（Ctrl+Shift+F）
- 替换功能

### 阶段4：Claude集成优化（2-3天）

#### 4.1 上下文传递
- 自动传递当前文件内容
- 传递选中代码
- 传递光标位置

#### 4.2 代码应用
- 一键应用Claude建议
- Diff预览
- 撤销/重做

#### 4.3 快捷操作
- 右键菜单"Ask Claude"
- 内联代码建议
- 快速修复

## 📦 文件结构

```
src/
├── components/
│   ├── CodeEditor/
│   │   ├── MonacoEditor.tsx          # Monaco编辑器封装
│   │   ├── EditorTabs.tsx            # 标签栏
│   │   ├── FileTree.tsx              # 文件树
│   │   ├── FileTreeItem.tsx          # 文件树项
│   │   ├── ContextMenu.tsx           # 右键菜单
│   │   ├── SearchPanel.tsx           # 搜索面板
│   │   └── index.ts
│   └── ...
├── hooks/
│   ├── useMonacoEditor.ts            # Monaco编辑器Hook
│   ├── useFileOperations.ts          # 文件操作Hook
│   └── useEditorTabs.ts              # 标签管理Hook
└── lib/
    ├── monaco-config.ts              # Monaco配置
    └── file-icons.ts                 # 文件图标映射

src-tauri/src/
└── commands/
    ├── file_operations.rs            # 文件操作命令
    └── mod.rs                        # 导出命令
```

## 🎨 UI设计要点

### 颜色方案（Dark主题）
- 背景：`#1e1e1e`
- 侧边栏：`#252526`
- 标签栏：`#2d2d2d`
- 边框：`#2d2d30`
- 主色调：`#007acc`（VS Code蓝）
- 文本：`#cccccc`
- 次要文本：`#888888`

### 字体
- 编辑器：`Consolas, Monaco, 'Courier New', monospace`
- UI：`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`

### 图标
- 使用`lucide-react`现有图标
- 文件类型图标：可使用`vscode-icons`或自定义

## ⚡ 性能优化

### 1. 虚拟滚动
- 文件树使用虚拟滚动（大项目）
- 标签栏虚拟化（多标签）

### 2. 懒加载
- Monaco按需加载语言支持
- 文件内容按需加载

### 3. 缓存
- 文件内容缓存
- 目录树缓存
- 编辑器状态缓存

### 4. Web Worker
- Monaco在Worker中运行
- 语法分析在Worker中

## 🔐 安全考虑

### 文件访问控制
- 限制访问范围（项目目录内）
- 敏感文件过滤（.env, .git等）
- 文件大小限制（避免加载超大文件）

### 权限管理
- Tauri权限配置
- 文件系统访问权限

## 📊 预期效果

### 用户体验提升
- ✅ 无需切换到外部编辑器
- ✅ 代码和AI助手在同一界面
- ✅ 快速编辑和测试
- ✅ 完整的IDE体验

### 功能对比

| 功能 | 当前 | 集成后 |
|------|------|--------|
| 代码编辑 | ❌ 无 | ✅ Monaco |
| 文件浏览 | ⚠️ 简单选择器 | ✅ 完整树形结构 |
| 多文件编辑 | ❌ 无 | ✅ 多标签 |
| 语法高亮 | ⚠️ 仅显示 | ✅ 完整支持 |
| 智能提示 | ❌ 无 | ✅ IntelliSense |
| Claude集成 | ✅ 独立会话 | ✅ 深度集成 |

## 🚀 后续扩展

### 可选功能（未来）
- Git集成（状态、提交、分支）
- 终端集成（内置终端）
- 调试器集成
- 扩展系统（插件）
- 主题自定义
- 快捷键自定义

## 📝 注意事项

### 1. 包体积
- Monaco会增加约3MB
- 考虑按需加载语言支持
- 生产环境使用CDN（可选）

### 2. 兼容性
- 确保Tauri文件API兼容
- 测试Windows/macOS/Linux

### 3. 用户习惯
- 保持现有Claude会话功能
- 提供切换视图选项
- 渐进式引入新功能

## 🎯 成功指标

- ✅ 编辑器加载时间 < 1秒
- ✅ 文件打开响应 < 200ms
- ✅ 支持至少20种常用语言
- ✅ 同时打开10+文件不卡顿
- ✅ 用户满意度提升

## 📚 参考资料

- [Monaco Editor文档](https://microsoft.github.io/monaco-editor/)
- [VS Code源码](https://github.com/microsoft/vscode)
- [Tauri文件系统API](https://tauri.app/v1/api/js/fs)
- [React Monaco Editor](https://github.com/suren-atoyan/monaco-react)

