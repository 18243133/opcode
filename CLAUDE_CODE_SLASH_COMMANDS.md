# Claude Code 内置斜杠命令完整列表

本文档记录了Claude Code REPL的所有内置斜杠命令（官方完整列表）。

## 📋 完整命令列表（按字母顺序）

| 命令 | 说明 |
|------|------|
| `/add-dir` | 添加其他工作目录 |
| `/agents` | 管理自定义AI子代理以执行专门任务 |
| `/bug` | 报告错误（将对话发送给Anthropic） |
| `/clear` | 清除对话历史记录 |
| `/compact [instructions]` | 紧凑的对话，带有可选的焦点指示 |
| `/config` | 打开设置界面（配置选项卡） |
| `/cost` | 显示令牌使用情况统计信息 |
| `/doctor` | 检查Claude Code安装的健康状况 |
| `/help` | 获取使用帮助 |
| `/init` | 使用CLAUDE.md指南初始化项目 |
| `/login` | 切换Anthropic帐户 |
| `/logout` | 退出您的Anthropic帐户 |
| `/mcp` | 管理MCP服务器连接和OAuth身份验证 |
| `/memory` | 编辑CLAUDE.md内存文件 |
| `/model` | 选择或更改AI模型 |
| `/permissions` | 查看或更新权限 |
| `/pr_comments` | 查看拉取请求评论 |
| `/review` | 请求代码审查 |
| `/rewind` | 回放对话和/或代码 |
| `/status` | 打开设置界面（状态选项卡），显示版本、型号、帐户和连接性 |
| `/terminal-setup` | 安装换行符的Shift+Enter键绑定（仅限iTerm2和VSCode） |
| `/usage` | 显示计划使用限制和速率限制状态（仅限订阅计划） |
| `/vim` | 进入vim模式，交替切换插入模式和命令模式 |

**总计：23个内置命令**

## 🔧 实现说明

### 当前状态
opcode项目目前支持**自定义斜杠命令**（通过SlashCommandPicker），这些是用户在`.claude/commands/`或`~/.claude/commands/`中定义的Markdown文件。

### 需要实现的功能
上述列出的是**Claude Code REPL的内置命令**，它们是Claude CLI本身的功能，不是自定义命令。

### 实现方案

#### 方案1：直接传递给Claude CLI（推荐）
当用户输入以`/`开头的命令时：
1. 检查是否是内置REPL命令（匹配上述列表）
2. 如果是，直接将整个命令字符串传递给Claude CLI
3. Claude CLI会处理这些命令并返回结果

**优点**：
- 简单，不需要在前端实现每个命令的逻辑
- 与Claude CLI保持一致
- 自动获得所有新命令的支持

**缺点**：
- 需要Claude CLI支持交互式命令输入

#### 方案2：前端模拟（备选）
为每个命令实现前端逻辑：
- `/clear` - 清空messages数组
- `/config` - 打开设置对话框
- `/model` - 打开模型选择器
- 等等...

**优点**：
- 完全控制UI/UX
- 可以添加自定义功能

**缺点**：
- 工作量大
- 需要维护与Claude CLI的一致性
- 某些命令（如`/doctor`、`/bug`）难以实现

### 推荐实现步骤

1. **识别命令类型**
   - 在`FloatingPromptInput`中检测输入是否以`/`开头
   - 匹配内置命令列表
   - 如果匹配，标记为REPL命令

2. **传递给Claude CLI**
   - 修改`handleSendPrompt`，对REPL命令使用特殊处理
   - 可能需要添加新的API方法：`api.executeReplCommand(command)`

3. **显示结果**
   - 接收Claude CLI的响应
   - 在消息流中显示命令执行结果

4. **UI增强**
   - 在SlashCommandPicker中显示内置命令（带特殊标记）
   - 添加命令说明和参数提示
   - 区分内置命令和自定义命令

## 📝 注意事项

1. **命令优先级**：内置命令应优先于同名的自定义命令
2. **参数处理**：某些命令接受参数（如`/compact [instructions]`）
3. **交互式命令**：某些命令可能需要用户交互（如`/config`、`/permissions`）
4. **错误处理**：需要处理命令执行失败的情况

## 🔗 参考资料

- [Claude Code CLI Reference](https://docs.claude.com/en/docs/claude-code/cli-reference)
- [Claude Code Slash Commands](https://docs.claude.com/en/docs/claude-code/slash-commands)
- [Claude Code Interactive Mode](https://docs.claude.com/en/docs/claude-code/interactive-mode)

