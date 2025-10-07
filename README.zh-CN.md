
<div align="center">
  <img src="src-tauri/icons/icon.png" alt="opcode Logo" width="120" height="120">

  <h1>opcode</h1>

  <p>
    <strong>强大的 Claude Code GUI 应用和工具包</strong>
  </p>
  <p>
    <strong>创建自定义代理、管理交互式 Claude Code 会话、运行安全的后台代理等功能。</strong>
  </p>

  <p>
    <a href="#功能特性"><img src="https://img.shields.io/badge/功能特性-✨-blue?style=for-the-badge" alt="Features"></a>
    <a href="#安装"><img src="https://img.shields.io/badge/安装-🚀-green?style=for-the-badge" alt="Installation"></a>
    <a href="#使用指南"><img src="https://img.shields.io/badge/使用指南-📖-purple?style=for-the-badge" alt="Usage"></a>
    <a href="#开发"><img src="https://img.shields.io/badge/开发-🛠️-orange?style=for-the-badge" alt="Development"></a>
    <a href="https://discord.com/invite/KYwhHVzUsY"><img src="https://img.shields.io/badge/Discord-加入-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"></a>
  </p>

  <p>
    <a href="README.md">English</a> | <strong>简体中文</strong>
  </p>
</div>

![457013521-6133a738-d0cb-4d3e-8746-c6768c82672c](https://github.com/user-attachments/assets/a028de9e-d881-44d8-bae5-7326ab3558b9)



https://github.com/user-attachments/assets/6bceea0f-60b6-4c3e-a745-b891de00b8d0

### 🎬 核心功能展示

**💻 现代化代码编辑器**
- 多标签编辑，支持语法高亮
- 文件树，支持右键菜单操作
- 全局搜索和替换
- 自动保存和文件历史恢复

**🔍 强大的搜索功能**
- 支持正则表达式
- 大小写敏感和全词匹配
- 文件包含/排除模式
- 批量替换功能

> [!TIP]
> **⭐ 给项目点个星，关注 [@getAsterisk](https://x.com/getAsterisk) 获取 `asteria-swe-v0` 的早期访问权限**。

> [!NOTE]
> 本项目与 Anthropic 无关联、未获得其认可或赞助。Claude 是 Anthropic, PBC 的商标。这是一个使用 Claude 的独立开发者项目。

## 🌟 概述

**opcode** 是一款强大的桌面应用程序，改变了您与 Claude Code 的交互方式。基于 Tauri 2 构建，它为管理 Claude Code 会话、创建自定义代理、跟踪使用情况等提供了美观的 GUI。

将 opcode 视为您的 Claude Code 指挥中心 - 在命令行工具和可视化体验之间架起桥梁，使 AI 辅助开发更加直观和高效。

## 📋 目录

- [🌟 概述](#-概述)
- [✨ 功能特性](#-功能特性)
  - [🗂️ 项目与会话管理](#️-项目与会话管理)
  - [🤖 CC 代理](#-cc-代理)
  - [💻 现代化代码编辑器](#-现代化代码编辑器-)
  - [📊 使用分析仪表板](#-使用分析仪表板)
  - [🔌 MCP 服务器管理](#-mcp-服务器管理)
  - [⏰ 时间线与检查点](#-时间线与检查点)
  - [📝 CLAUDE.md 管理](#-claudemd-管理)
- [🚧 路线图 - 即将推出](#-路线图---即将推出)
  - [🎯 阶段 1：智能编辑功能](#-阶段-1智能编辑功能-进行中)
  - [🧠 阶段 2：智能代码辅助](#-阶段-2智能代码辅助-下一步)
  - [🤖 阶段 3：深度 Claude 集成](#-阶段-3深度-claude-集成-计划中)
  - [🔄 阶段 4：协作与版本控制](#-阶段-4协作与版本控制-未来)
  - [⚡ 阶段 5：高级功能](#-阶段-5高级功能-未来)
- [📖 使用指南](#-使用指南)
  - [快速开始](#快速开始)
  - [管理项目](#管理项目)
  - [使用代码编辑器](#使用代码编辑器)
  - [创建代理](#创建代理)
  - [跟踪使用情况](#跟踪使用情况)
  - [使用 MCP 服务器](#使用-mcp-服务器)
- [🚀 安装](#-安装)
- [🔨 从源码构建](#-从源码构建)
- [🛠️ 开发](#️-开发)
- [🔒 安全性](#-安全性)
- [🤝 贡献](#-贡献)
- [📄 许可证](#-许可证)
- [🙏 致谢](#-致谢)

## ✨ 功能特性

### 🗂️ **项目与会话管理**
- **可视化项目浏览器**：浏览 `~/.claude/projects/` 中的所有 Claude Code 项目
- **会话历史**：查看和恢复过去的编码会话，保留完整上下文
- **智能搜索**：通过内置搜索快速查找项目和会话
- **会话洞察**：一目了然地查看首条消息、时间戳和会话元数据
- **自动滚动**：对话期间自动滚动到最新消息
- **文件历史**：重新打开项目时自动恢复之前打开的文件

### 🤖 **CC 代理**
- **自定义 AI 代理**：使用自定义系统提示和行为创建专门的代理
- **代理库**：为不同任务构建专用代理集合
- **后台执行**：在独立进程中运行代理，实现非阻塞操作
- **执行历史**：跟踪所有代理运行，包含详细日志和性能指标

### 💻 **现代化代码编辑器** ✨ 新功能
- **Monaco 编辑器集成**：功能完整的代码编辑器，支持 100+ 种语言的语法高亮
- **多标签编辑**：通过标签管理同时处理多个文件
- **文件树浏览器**：通过直观的文件树导航项目结构
- **右键菜单操作**：右键创建、重命名、删除文件和文件夹
- **全局搜索与替换**：
  - 在项目的所有文件中搜索
  - 支持正则表达式、大小写敏感和全词匹配
  - 文件包含/排除模式（例如：`*.ts`，排除 `node_modules`）
  - 批量替换功能
  - 高亮显示匹配项和行号
- **智能文件操作**：
  - 创建新文件和文件夹
  - 带验证的重命名
  - 带确认的删除
  - 复制文件路径（绝对路径和相对路径）
  - 在系统文件管理器中显示
- **自动保存**：输入时自动保存更改
- **未保存更改指示器**：修改文件的视觉反馈

### 📊 **使用分析仪表板**
- **成本跟踪**：实时监控 Claude API 使用情况和成本
- **令牌分析**：按模型、项目和时间段详细分解
- **可视化图表**：显示使用趋势和模式的精美图表
- **导出数据**：导出使用数据用于会计和分析

### 🔌 **MCP 服务器管理**
- **服务器注册表**：从中央 UI 管理模型上下文协议服务器
- **简易配置**：通过 UI 添加服务器或从现有配置导入
- **连接测试**：使用前验证服务器连接
- **Claude Desktop 导入**：从 Claude Desktop 导入服务器配置

### ⏰ **时间线与检查点**
- **会话版本控制**：在编码会话的任何时刻创建检查点
- **可视化时间线**：通过分支时间线导航会话历史
- **即时恢复**：一键跳转到任何检查点
- **分叉会话**：从现有检查点创建新分支
- **差异查看器**：准确查看检查点之间的变化

### 📝 **CLAUDE.md 管理**
- **内置编辑器**：直接在应用内编辑 CLAUDE.md 文件
- **实时预览**：实时查看渲染的 markdown
- **项目扫描器**：查找项目中的所有 CLAUDE.md 文件
- **语法高亮**：完整的 markdown 支持和语法高亮

## 🚧 路线图 - 即将推出

### 🎯 **阶段 1：智能编辑功能**（进行中）
- [ ] **代码格式化**：Prettier 集成，自动代码格式化
- [ ] **代码片段**：内置和自定义代码片段系统
- [ ] **多光标编辑**：Alt+点击多光标，Ctrl+D 选择下一个匹配项
- [ ] **代码折叠**：折叠/展开函数、类和区域
- [ ] **迷你地图**：代码结构的可视化概览

### 🧠 **阶段 2：智能代码辅助**（下一步）
- [ ] **LSP 集成**：语言服务器协议支持智能代码补全
- [ ] **AI 驱动的补全**：Claude 辅助的代码建议
- [ ] **实时诊断**：语法错误、类型检查和 linting
- [ ] **快速修复**：一键修复常见问题
- [ ] **代码导航**：跳转到定义、查找引用、符号搜索
- [ ] **智能重构**：重命名符号、提取函数、内联变量

### 🤖 **阶段 3：深度 Claude 集成**（计划中）
- [ ] **内联 AI 助手**：直接在编辑器中询问 Claude 关于选定代码的问题
- [ ] **代码解释**：自动生成代码文档和注释
- [ ] **代码生成**：从自然语言描述生成代码
- [ ] **智能代码审查**：AI 驱动的代码质量和安全分析
- [ ] **上下文感知对话**：使用 @ 提及引用文件和符号
- [ ] **项目级理解**：自动代码库索引和依赖分析

### 🔄 **阶段 4：协作与版本控制**（未来）
- [ ] **Git 集成**：可视化差异、提交、推送、拉取、分支管理
- [ ] **AI 提交消息**：自动生成有意义的提交消息
- [ ] **合并冲突解决**：AI 辅助的冲突解决
- [ ] **实时协作**：多用户编辑，光标同步
- [ ] **代码审查工具**：内联评论和建议

### ⚡ **阶段 5：高级功能**（未来）
- [ ] **集成终端**：无需离开编辑器即可运行命令
- [ ] **扩展系统**：自定义功能的插件架构
- [ ] **性能优化**：虚拟滚动、延迟加载、Web Workers
- [ ] **调试支持**：断点、单步调试
- [ ] **测试集成**：内联运行和查看测试结果
- [ ] **Docker 集成**：从编辑器管理容器

## 📖 使用指南

### 快速开始

1. **启动 opcode**：安装后打开应用程序
2. **欢迎屏幕**：在 CC 代理或项目之间选择
3. **首次设置**：opcode 将自动检测您的 `~/.claude` 目录

### 管理项目

```
项目 → 选择项目 → 查看会话 → 恢复或开始新会话
```

- 点击任何项目查看其会话
- 每个会话显示首条消息和时间戳
- 直接恢复会话或开始新会话
- 之前打开的文件会自动恢复

### 使用代码编辑器

```
项目 → 选择项目 → 代码编辑器 → 编辑文件
```

**文件操作：**
- 右键点击文件/文件夹打开上下文菜单
- 创建新文件和文件夹
- 重命名、删除、复制路径
- 在系统文件管理器中显示

**搜索与替换：**
1. 点击文件树工具栏中的搜索图标
2. 输入搜索查询
3. 切换选项：大小写敏感（Aa）、全词匹配（Ab）、正则表达式（.*）
4. 使用高级选项过滤文件
5. 点击结果跳转到位置
6. 使用"全部替换"进行批量替换

**键盘快捷键：**
- `Ctrl+S` - 保存当前文件
- `Ctrl+Shift+F` - 打开搜索面板
- `F2` - 重命名文件
- `Del` - 删除文件
- `Esc` - 关闭搜索面板

### 创建代理

```
CC 代理 → 创建代理 → 配置 → 执行
```

1. **设计您的代理**：设置名称、图标和系统提示
2. **配置模型**：在可用的 Claude 模型中选择
3. **设置权限**：配置文件读/写和网络访问
4. **执行任务**：在任何项目上运行您的代理

### 跟踪使用情况

```
菜单 → 使用仪表板 → 查看分析
```

- 按模型、项目和日期监控成本
- 导出数据用于报告
- 设置使用警报（即将推出）

### 使用 MCP 服务器

```
菜单 → MCP 管理器 → 添加服务器 → 配置
```

- 手动添加服务器或通过 JSON
- 从 Claude Desktop 配置导入
- 使用前测试连接

## 🚀 安装

### 前置要求

- **Claude Code CLI**：从 [Claude 官方网站](https://claude.ai/code) 安装

### 发布版可执行文件即将发布

## 🔨 从源码构建

### 前置要求

在从源码构建 opcode 之前，请确保已安装以下内容：

#### 系统要求

- **操作系统**：Windows 10/11、macOS 11+ 或 Linux（Ubuntu 20.04+）
- **内存**：最低 4GB（推荐 8GB）
- **存储**：至少 1GB 可用空间

#### 必需工具

1. **Rust**（1.70.0 或更高版本）
   ```bash
   # 通过 rustup 安装
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Bun**（最新版本）
   ```bash
   # 安装 bun
   curl -fsSL https://bun.sh/install | bash
   ```

3. **Git**
   ```bash
   # 通常预装，但如果没有：
   # Ubuntu/Debian: sudo apt install git
   # macOS: brew install git
   # Windows: 从 https://git-scm.com 下载
   ```

4. **Claude Code CLI**
   - 从 [Claude 官方网站](https://claude.ai/code) 下载并安装
   - 确保 `claude` 在您的 PATH 中可用

#### 平台特定依赖

**Linux（Ubuntu/Debian）**
```bash
# 安装系统依赖
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libxdo-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev
```

**macOS**
```bash
# 安装 Xcode 命令行工具
xcode-select --install

# 通过 Homebrew 安装额外依赖（可选）
brew install pkg-config
```

**Windows**
- 安装 [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- 安装 [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/)（Windows 11 通常预装）

### 构建步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/getAsterisk/opcode.git
   cd opcode
   ```

2. **安装前端依赖**
   ```bash
   bun install
   ```

3. **构建应用程序**

   **开发模式（带热重载）**
   ```bash
   bun run tauri dev
   ```

   **生产构建**
   ```bash
   # 构建应用程序
   bun run tauri build

   # 构建的可执行文件将位于：
   # - Linux: src-tauri/target/release/
   # - macOS: src-tauri/target/release/
   # - Windows: src-tauri/target/release/
   ```

4. **平台特定构建选项**

   **调试构建（编译更快，二进制文件更大）**
   ```bash
   bun run tauri build --debug
   ```

   **macOS 通用二进制（Intel + Apple Silicon）**
   ```bash
   bun run tauri build --target universal-apple-darwin
   ```

### 故障排除

#### 常见问题

1. **"cargo not found" 错误**
   - 确保已安装 Rust 且 `~/.cargo/bin` 在您的 PATH 中
   - 运行 `source ~/.cargo/env` 或重启终端

2. **Linux："webkit2gtk not found" 错误**
   - 安装上面列出的 webkit2gtk 开发包
   - 在较新的 Ubuntu 版本上，您可能需要 `libwebkit2gtk-4.0-dev`

3. **Windows："MSVC not found" 错误**
   - 安装带 C++ 支持的 Visual Studio Build Tools
   - 安装后重启终端

4. **"claude command not found" 错误**
   - 确保已安装 Claude Code CLI 且在您的 PATH 中
   - 使用 `claude --version` 测试

5. **构建失败，提示 "out of memory"**
   - 尝试使用更少的并行作业构建：`cargo build -j 2`
   - 关闭其他应用程序以释放内存

#### 验证您的构建

构建后，您可以验证应用程序是否正常工作：

```bash
# 直接运行构建的可执行文件
# Linux/macOS
./src-tauri/target/release/opcode

# Windows
./src-tauri/target/release/opcode.exe
```

### 构建产物

构建过程会创建多个产物：

- **可执行文件**：主 opcode 应用程序
- **安装程序**（使用 `tauri build` 时）：
  - `.deb` 包（Linux）
  - `.AppImage`（Linux）
  - `.dmg` 安装程序（macOS）
  - `.msi` 安装程序（Windows）
  - `.exe` 安装程序（Windows）

所有产物都位于 `src-tauri/target/release/`。

## 🛠️ 开发

### 技术栈

- **前端**：React 18 + TypeScript + Vite 6
- **后端**：Rust with Tauri 2
- **UI 框架**：Tailwind CSS v4 + shadcn/ui
- **数据库**：SQLite（通过 rusqlite）
- **包管理器**：Bun

### 项目结构

```
opcode/
├── src/                   # React 前端
│   ├── components/        # UI 组件
│   ├── lib/               # API 客户端和工具
│   └── assets/            # 静态资源
├── src-tauri/             # Rust 后端
│   ├── src/
│   │   ├── commands/      # Tauri 命令处理器
│   │   ├── checkpoint/    # 时间线管理
│   │   └── process/       # 进程管理
│   └── tests/             # Rust 测试套件
└── public/                # 公共资源
```

### 开发命令

```bash
# 启动开发服务器
bun run tauri dev

# 仅运行前端
bun run dev

# 类型检查
bunx tsc --noEmit

# 运行 Rust 测试
cd src-tauri && cargo test

# 格式化代码
cd src-tauri && cargo fmt
```

## 🔒 安全性

opcode 优先考虑您的隐私和安全：

1. **进程隔离**：代理在独立进程中运行
2. **权限控制**：为每个代理配置文件和网络访问
3. **本地存储**：所有数据保留在您的机器上
4. **无遥测**：无数据收集或跟踪
5. **开源**：通过开源代码实现完全透明

## 🤝 贡献

我们欢迎贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解详情。

### 贡献领域

- 🐛 错误修复和改进
- ✨ 新功能和增强
- 📚 文档改进
- 🎨 UI/UX 增强
- 🧪 测试覆盖率
- 🌐 国际化

## 📄 许可证

本项目采用 AGPL 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 使用 [Tauri](https://tauri.app/) 构建 - 用于构建桌面应用的安全框架
- Anthropic 的 [Claude](https://claude.ai)

---

<div align="center">
  <p>
    <strong>由 <a href="https://asterisk.so/">Asterisk</a> 用 ❤️ 制作</strong>
  </p>
  <p>
    <a href="https://github.com/getAsterisk/opcode/issues">报告错误</a>
    ·
    <a href="https://github.com/getAsterisk/opcode/issues">请求功能</a>
  </p>
</div>


## Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=getAsterisk/opcode&type=Date)](https://www.star-history.com/#getAsterisk/opcode&Date)
