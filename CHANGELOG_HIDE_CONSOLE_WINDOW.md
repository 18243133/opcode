# 隐藏控制台窗口修复变更日志

## 概述
修复Windows下每次执行Claude会话时弹出黑色控制台窗口的问题。

## 变更日期
2025-10-05

## 问题描述

### 用户反馈
用户报告每次与Claude对话时都会弹出一个黑色的控制台窗口，影响使用体验。

### 技术原因
在Windows平台下，使用`tokio::process::Command`启动Claude CLI进程时，默认会创建一个可见的控制台窗口。这是因为：
1. Claude CLI是一个命令行工具
2. Windows默认为命令行程序创建控制台窗口
3. 没有设置隐藏窗口的标志

### 上下文保持机制
用户同时询问了关于上下文保持的问题。经过分析，当前实现已经有完善的上下文保持机制：

**第一次提问**：
- 调用 `execute_claude_code()`
- 启动新的Claude CLI进程
- Claude CLI创建session并保存到 `~/.claude/projects/{project_id}/{session_id}.jsonl`

**后续提问**：
- 调用 `resume_claude_code()` 或 `continue_claude_code()`
- 使用 `--resume` 或 `-c` 参数
- Claude CLI读取之前的session文件，保持完整上下文

**结论**：
- ✅ 上下文已经通过session_id机制保持
- ❌ 每次仍然启动新进程（但这是Claude CLI的设计）
- ✅ 可以通过隐藏窗口改善用户体验

## 解决方案

### 技术实现

在Windows平台下，使用`CREATE_NO_WINDOW`标志来隐藏控制台窗口。

#### 修改位置1：src-tauri/src/commands/claude.rs

**函数**：`create_system_command` (第282-308行)

**修改前**：
```rust
fn create_system_command(
    claude_path: &str,
    args: Vec<String>,
    project_path: &str,
) -> Command {
    let mut cmd = create_command_with_env(claude_path);
    
    for arg in args {
        cmd.arg(arg);
    }
    
    cmd.current_dir(project_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    
    cmd
}
```

**修改后**：
```rust
fn create_system_command(
    claude_path: &str,
    args: Vec<String>,
    project_path: &str,
) -> Command {
    let mut cmd = create_command_with_env(claude_path);
    
    for arg in args {
        cmd.arg(arg);
    }
    
    cmd.current_dir(project_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    
    // Hide console window on Windows
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }
    
    cmd
}
```

#### 修改位置2：src-tauri/src/commands/agents.rs

**函数**：`create_agent_system_command` (第781-808行)

**修改前**：
```rust
fn create_agent_system_command(
    claude_path: &str,
    args: Vec<String>,
    project_path: &str,
) -> Command {
    let mut cmd = create_command_with_env(claude_path);
    
    for arg in args {
        cmd.arg(arg);
    }
    
    cmd.current_dir(project_path)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    
    cmd
}
```

**修改后**：
```rust
fn create_agent_system_command(
    claude_path: &str,
    args: Vec<String>,
    project_path: &str,
) -> Command {
    let mut cmd = create_command_with_env(claude_path);
    
    for arg in args {
        cmd.arg(arg);
    }
    
    cmd.current_dir(project_path)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    
    // Hide console window on Windows
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }
    
    cmd
}
```

### 技术细节

#### CREATE_NO_WINDOW标志
- **值**：`0x08000000`
- **作用**：告诉Windows不要为新进程创建控制台窗口
- **来源**：Windows API的`CreateProcess`函数的`dwCreationFlags`参数

#### 平台特定编译
使用Rust的条件编译特性：
```rust
#[cfg(target_os = "windows")]
{
    // 只在Windows平台编译这段代码
}
```

这样确保：
- ✅ Windows平台：隐藏控制台窗口
- ✅ macOS/Linux：不受影响，保持原有行为
- ✅ 跨平台兼容性

#### CommandExt trait
- **来源**：`std::os::windows::process::CommandExt`
- **作用**：为`Command`添加Windows特定的方法
- **方法**：`creation_flags(u32)` - 设置进程创建标志

## 影响范围

### 受影响的功能
1. **Claude Code会话** - 所有通过`execute_claude_code`、`continue_claude_code`、`resume_claude_code`启动的会话
2. **Agent执行** - 所有通过`execute_agent`启动的agent任务

### 不受影响的功能
- 进程的stdout/stderr捕获（仍然正常工作）
- 会话上下文保持（通过session_id机制）
- 跨平台兼容性（macOS/Linux不受影响）
- 进程管理和取消功能

## 测试建议

### 功能测试
1. **基本会话测试**
   - 启动新的Claude Code会话
   - 验证不会弹出黑色窗口
   - 验证输出正常显示在UI中

2. **上下文保持测试**
   - 发送第一个提示
   - 发送后续提示
   - 验证Claude能记住之前的对话内容

3. **Agent测试**
   - 执行一个agent任务
   - 验证不会弹出黑色窗口
   - 验证agent输出正常

4. **错误处理测试**
   - 测试Claude CLI执行失败的情况
   - 验证错误信息正常显示

### 跨平台测试
- ✅ Windows 10/11 - 主要测试平台
- ⚠️ macOS - 确保不受影响
- ⚠️ Linux - 确保不受影响

## 编译状态

### 前端
✅ **编译成功** - 5.63秒
- 无TypeScript错误
- 无运行时警告

### 后端
✅ **编译成功** - 3分11秒
- 2个警告（unused import，不影响功能）
- 1个警告（unused method，不影响功能）

### 生成的文件
- **位置**：`D:\OpenSource\opcode\src-tauri\target\release\opcode.exe`
- **大小**：15,621,120 字节（约 14.9 MB）
- **生成时间**：2025/10/5 23:32:19

## Git提交

**Commit ID**：78f2136  
**提交消息**：fix: 隐藏Windows下Claude CLI的控制台窗口

**修改统计**：
- 2个文件修改
- 22行新增
- 6行删除

## 总结

### 用户体验改进
- ✅ 不再弹出黑色控制台窗口
- ✅ 界面更加简洁专业
- ✅ 不影响任何功能

### 技术优势
- ✅ 最小化改动（只修改2个函数）
- ✅ 平台特定处理（不影响其他平台）
- ✅ 保持原有架构（不改变进程管理方式）
- ✅ 上下文完整保留（通过session机制）

### 后续优化建议
如果未来需要进一步优化，可以考虑：
1. 研究Claude CLI是否支持长连接模式
2. 实现进程池复用机制
3. 优化进程启动速度

但当前的实现已经满足用户需求，且符合Claude CLI的设计理念。

