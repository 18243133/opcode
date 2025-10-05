# Opcode 项目编译规则

本文档记录了Opcode项目的编译规则，说明什么情况下需要重新编译EXE文件。

## 📦 项目架构

Opcode是一个基于Tauri的桌面应用，包含两个主要部分：

1. **前端（Frontend）** - React + TypeScript + Vite
   - 位置：`src/`、`src/components/`、`src/lib/`
   - 编译命令：`npm run build`
   - 输出目录：`dist/`
   - 编译时间：约5-7秒

2. **后端（Backend）** - Rust + Tauri
   - 位置：`src-tauri/src/`
   - 编译命令：`npm run tauri build`
   - 输出文件：`src-tauri/target/release/opcode.exe`
   - 编译时间：约3-4分钟

## 🔄 编译规则

### 只需前端编译（npm run build）

修改以下文件时，**只需要**运行 `npm run build`：

#### UI组件
- `src/components/*.tsx` - 所有React组件
- `src/App.tsx` - 主应用组件
- `src/main.tsx` - 入口文件

#### 样式文件
- `src/index.css` - 全局样式
- `src/App.css` - 应用样式
- 任何CSS/SCSS文件

#### 前端逻辑
- `src/lib/api.ts` - API调用（不涉及Tauri命令签名变更）
- `src/lib/utils.ts` - 工具函数
- `src/lib/analytics.ts` - 分析追踪
- `src/lib/*.ts` - 其他前端工具库

#### 配置文件（前端）
- `vite.config.ts` - Vite配置
- `tsconfig.json` - TypeScript配置
- `package.json` - 依赖管理（仅前端依赖）

#### 静态资源
- `public/*` - 静态文件
- 图片、字体等资源文件

**编译后操作**：
- 前端编译后，`dist/`目录会更新
- Tauri在运行时会自动加载最新的`dist/`内容
- **开发模式**（`npm run tauri dev`）：自动热重载，无需手动编译
- **生产模式**：需要重启应用才能看到变化

### 必须重新编译EXE（npm run tauri build）

修改以下文件时，**必须**运行 `npm run tauri build` 重新生成EXE：

#### Rust后端代码
- `src-tauri/src/main.rs` - 主入口
- `src-tauri/src/commands/*.rs` - 所有Tauri命令
  - `claude.rs` - Claude CLI相关命令
  - `agents.rs` - Agent执行命令
  - `mcp.rs` - MCP服务器命令
  - `proxy.rs` - 代理相关命令
  - `slash_commands.rs` - 斜杠命令管理
  - 等等...
- `src-tauri/src/*.rs` - 其他Rust模块

#### Tauri配置
- `src-tauri/tauri.conf.json` - Tauri配置
  - 窗口设置
  - 权限配置
  - 应用元数据
  - 构建选项

#### Cargo配置
- `src-tauri/Cargo.toml` - Rust依赖管理
  - 添加/删除/更新依赖
  - 修改features
  - 修改构建配置

#### 系统集成
- 进程创建标志（如`CREATE_NO_WINDOW`）
- 系统命令调用
- 文件系统操作
- 进程管理

#### API签名变更
- 修改Tauri命令的参数
- 修改Tauri命令的返回值
- 添加/删除Tauri命令
- 修改事件名称

**编译后操作**：
- 新的EXE文件位于：`src-tauri/target/release/opcode.exe`
- 文件大小：约15-16 MB
- 需要关闭旧应用，运行新EXE

## 🚀 完整编译流程

### 开发模式（推荐）

```bash
# 启动开发服务器（自动热重载）
npm run tauri dev
```

**特点**：
- 前端修改自动热重载
- 后端修改自动重新编译
- 无需手动编译
- 适合快速开发

### 生产模式

```bash
# 1. 仅前端修改
npm run build

# 2. 后端修改或完整构建
npm run tauri build
```

**注意**：
- `npm run tauri build` 会自动先运行 `npm run build`
- 所以后端修改时只需运行一个命令

## 📋 常见场景

### 场景1：修改UI样式/布局
**修改文件**：`src/components/ClaudeCodeSession.tsx`（仅UI部分）  
**编译命令**：`npm run build`  
**是否需要新EXE**：❌ 否

### 场景2：修改前端逻辑（不涉及API）
**修改文件**：`src/lib/utils.ts`  
**编译命令**：`npm run build`  
**是否需要新EXE**：❌ 否

### 场景3：添加新的Tauri命令
**修改文件**：`src-tauri/src/commands/claude.rs`  
**编译命令**：`npm run tauri build`  
**是否需要新EXE**：✅ 是

### 场景4：修改进程创建标志
**修改文件**：`src-tauri/src/commands/claude.rs`（添加CREATE_NO_WINDOW）  
**编译命令**：`npm run tauri build`  
**是否需要新EXE**：✅ 是

### 场景5：修改Tauri配置
**修改文件**：`src-tauri/tauri.conf.json`  
**编译命令**：`npm run tauri build`  
**是否需要新EXE**：✅ 是

### 场景6：添加Rust依赖
**修改文件**：`src-tauri/Cargo.toml`  
**编译命令**：`npm run tauri build`  
**是否需要新EXE**：✅ 是

### 场景7：修改前端API调用（不改后端）
**修改文件**：`src/lib/api.ts`（仅调用方式）  
**编译命令**：`npm run build`  
**是否需要新EXE**：❌ 否

### 场景8：同时修改前后端
**修改文件**：前端组件 + Rust命令  
**编译命令**：`npm run tauri build`（会自动编译前端）  
**是否需要新EXE**：✅ 是

## 🎯 快速判断规则

### 简单判断法

**问自己一个问题**：这个修改是否涉及Rust代码或Tauri配置？

- **是** → 需要重新编译EXE（`npm run tauri build`）
- **否** → 只需前端编译（`npm run build`）

### 文件路径判断法

- `src/` 开头 → 前端，只需 `npm run build`
- `src-tauri/` 开头 → 后端，需要 `npm run tauri build`

### 文件扩展名判断法

- `.tsx`, `.ts`, `.css`, `.html` → 前端编译
- `.rs`, `.toml` → 后端编译，需要新EXE

## ⚠️ 特殊注意事项

### 1. 开发模式 vs 生产模式

- **开发模式**（`npm run tauri dev`）：
  - 前端修改立即生效
  - 后端修改自动重新编译
  - 不生成独立EXE

- **生产模式**（`npm run tauri build`）：
  - 生成优化的EXE文件
  - 文件更小，性能更好
  - 用于发布和分发

### 2. 前端编译不影响EXE

- 前端编译只更新 `dist/` 目录
- Tauri应用在运行时读取 `dist/` 内容
- 所以前端修改后，重启应用即可看到变化
- **不需要**重新生成EXE

### 3. 后端修改必须重新编译

- Rust代码编译到EXE中
- 修改后必须重新生成EXE
- 无法通过重启应用生效

### 4. 混合修改的处理

如果同时修改了前端和后端：
- 运行 `npm run tauri build` 即可
- 它会自动先编译前端，再编译后端
- 不需要分别运行两个命令

## 📊 编译时间参考

| 操作 | 命令 | 时间 | 输出 |
|------|------|------|------|
| 前端编译 | `npm run build` | 5-7秒 | `dist/` 目录 |
| 后端编译（首次） | `npm run tauri build` | 5-10分钟 | `opcode.exe` |
| 后端编译（增量） | `npm run tauri build` | 3-4分钟 | `opcode.exe` |
| 开发模式启动 | `npm run tauri dev` | 10-20秒 | 开发窗口 |

## 🔍 验证编译结果

### 前端编译验证

```bash
# 检查dist目录更新时间
ls -l dist/

# 查看编译输出
# 应该看到 "✓ built in X.XXs"
```

### 后端编译验证

```bash
# 检查EXE文件
Get-Item "src-tauri/target/release/opcode.exe" | Select-Object Name, Length, LastWriteTime | Format-List

# 应该看到最新的修改时间
```

## 📝 最佳实践

1. **开发时使用开发模式**
   ```bash
   npm run tauri dev
   ```
   - 自动热重载
   - 快速迭代

2. **测试时编译生产版本**
   ```bash
   npm run tauri build
   ```
   - 验证生产环境行为
   - 测试性能

3. **发布前完整构建**
   ```bash
   # 清理旧构建
   rm -rf dist/
   rm -rf src-tauri/target/release/
   
   # 完整构建
   npm run tauri build
   ```

4. **提交代码前检查**
   - 确保代码编译通过
   - 运行测试（如果有）
   - 验证功能正常

## 🎓 总结

**记住这个核心原则**：

> **前端修改 = 只需前端编译**  
> **后端修改 = 必须重新生成EXE**

当不确定时，运行 `npm run tauri build` 总是安全的选择，它会完整编译整个项目。

