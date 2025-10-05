# 模型更新变更日志

## 概述
将项目中的Claude模型标识符从简短ID更新为完整的API模型名称，主要是将默认的"sonnet"改为最新的"claude-sonnet-4-5-20250929"。

## 变更日期
2025-10-05

## 模型映射

| 旧模型ID | 新完整API名称 | 说明 |
|---------|--------------|------|
| `sonnet` | `claude-sonnet-4-5-20250929` | 最新Sonnet 4.5模型 |
| `opus` | `claude-opus-4-20250514` | Claude 4 Opus模型 |
| `sonnet45` | 已移除（合并到主sonnet） | 统一使用最新Sonnet |
| `opusplan` | `opusplan` | 保持不变（特殊模式） |

## 修改文件清单

### 前端文件 (TypeScript/React)

#### 1. `src/components/FloatingPromptInput.tsx`
- **变更**: 更新MODELS数组定义
- **详情**:
  - 将Model类型的id从固定枚举改为string类型
  - 更新模型ID为完整API名称
  - 移除sonnet45，统一使用claude-sonnet-4-5-20250929
  - 更新默认模型值

#### 2. `src/components/CreateAgent.tsx`
- **变更**: 更新Agent创建/编辑界面的模型选择
- **详情**:
  - 默认模型从 `"sonnet"` 改为 `"claude-sonnet-4-5-20250929"`
  - 更新所有模型选择按钮的值和比较逻辑
  - 移除sonnet45选项

#### 3. `src/components/AgentExecution.tsx`
- **变更**: 更新Agent执行界面的模型选择
- **详情**:
  - 默认模型从 `"sonnet"` 改为 `"claude-sonnet-4-5-20250929"`
  - 更新模型选择按钮
  - 更新模型显示名称逻辑
  - 移除sonnet45选项

#### 4. `src/components/ClaudeCodeSession.tsx`
- **变更**: 更新类型定义
- **详情**:
  - 将queuedPrompts的model类型从固定枚举改为string
  - 更新handleSendPrompt函数签名

#### 5. `src/components/ClaudeCodeSession.refactored.tsx`
- **变更**: 更新类型定义
- **详情**:
  - 将queuedPrompts的model类型从固定枚举改为string
  - 更新handleSendPrompt函数签名

#### 6. `src/components/claude-code-session/PromptQueue.tsx`
- **变更**: 更新队列提示的类型和显示
- **详情**:
  - QueuedPrompt接口的model类型改为string
  - 更新模型图标和名称的显示逻辑，使用includes()方法

#### 7. `src/components/UsageDashboard.tsx`
- **变更**: 更新模型显示名称映射
- **详情**:
  - 添加新模型名称映射
  - 保留旧模型名称以支持历史数据

### 后端文件 (Rust)

#### 8. `src-tauri/src/commands/agents.rs`
- **变更**: 更新数据库默认值和fallback值
- **详情**:
  - 数据库表定义中的默认值: `'sonnet'` → `'claude-sonnet-4-5-20250929'`
  - ALTER TABLE语句中的默认值更新
  - 所有`unwrap_or_else`中的fallback值更新
  - 共6处更新

### 配置文件

#### 9. `.github/workflows/claude.yml`
- **变更**: 更新GitHub Actions中的模型配置
- **详情**:
  - model参数从 `"claude-opus-4-20250514"` 改为 `"claude-sonnet-4-5-20250929"`
  - 更新注释说明

#### 10. `cc_agents/git-commit-bot.opcode.json`
- **变更**: 更新示例agent配置
- **详情**:
  - model字段从 `"sonnet"` 改为 `"claude-sonnet-4-5-20250929"`

#### 11. `cc_agents/security-scanner.opcode.json`
- **变更**: 更新示例agent配置
- **详情**:
  - model字段从 `"opus"` 改为 `"claude-opus-4-20250514"`

#### 12. `cc_agents/unit-tests-bot.opcode.json`
- **变更**: 更新示例agent配置
- **详情**:
  - model字段从 `"opus"` 改为 `"claude-opus-4-20250514"`

## 未修改的文件

### `src-tauri/src/commands/usage.rs`
- **原因**: 成本计算逻辑已经使用`contains()`方法匹配模型名称
- **现有逻辑**: 
  - `model.contains("opus-4")` 或 `model.contains("claude-opus-4")`
  - `model.contains("sonnet-4")` 或 `model.contains("claude-sonnet-4")`
- **结论**: 无需修改，已支持新格式

## 向后兼容性

### 数据库中的历史数据
- 旧的模型ID（如"sonnet"、"opus"）在数据库中仍然有效
- UsageDashboard中的映射函数支持新旧格式
- 成本计算逻辑支持新旧格式

### 建议
如需完全迁移历史数据，可运行以下SQL（可选）：
```sql
UPDATE agents SET model = 'claude-sonnet-4-5-20250929' WHERE model = 'sonnet';
UPDATE agents SET model = 'claude-opus-4-20250514' WHERE model = 'opus';
UPDATE agents SET model = 'claude-sonnet-4-5-20250929' WHERE model = 'sonnet45';
```

## 编译状态

### 前端
✅ **成功** - TypeScript编译通过，Vite构建成功

### 后端
⚠️ **需要Rust环境** - 需要安装Rust/Cargo工具链进行编译

## 测试建议

1. **模型选择测试**
   - 创建新Agent时选择不同模型
   - 编辑现有Agent的模型设置
   - 执行Agent时切换模型

2. **历史数据测试**
   - 查看使用旧模型ID的历史Agent
   - 检查Usage Dashboard中的模型显示
   - 验证成本计算是否正确

3. **Claude CLI集成测试**
   - 使用新模型ID执行Claude Code会话
   - 验证模型参数正确传递给CLI

## 参考文档

- [Claude CLI文档](https://docs.claude.com/en/docs/claude-code/cli-reference)
- Claude Sonnet 4.5模型: `claude-sonnet-4-5-20250929`
- Claude Opus 4模型: `claude-opus-4-20250514`

## 注意事项

1. 新的模型ID是完整的API模型名称，包含版本日期
2. 这确保了与Claude CLI的完全兼容性
3. 旧的简短ID仍在代码中被识别以支持历史数据
4. 建议用户在使用前确认其Claude CLI版本支持这些模型

