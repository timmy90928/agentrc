# gemini/agents/ — Gemini CLI subagents (正本)

放 Gemini CLI subagent 定義(`*.md`);`install` 複製到 `~/.gemini/agents/`。**目前為空 scaffold**(本機尚無自訂 agent)。

## 格式(Gemini CLI)

Markdown + YAML frontmatter;**body = system prompt**。欄位與 Claude 近似但**工具名/欄位不同**:

```markdown
---
name: frontend-specialist
description: Frontend specialist for accessible, high-performance web apps.
tools:                       # Gemini 工具名(snake_case);亦支援萬用字元
  - read_file
  - grep_search
  - glob
  - list_directory
  # "*" 全部工具 / "mcp_*" 所有 MCP 工具 / "mcp_<server>_*" 指定 server
model: inherit               # inherit = 跟隨主 session model
# kind: local                # 選用(local/remote)
# temperature: 0.2           # 選用
# max_turns: 20              # 選用
---
你是前端專家……(system prompt 本文)
```

## 與 Claude 的可攜性
- **可共用**:body、`name`、`description`。
- **不通用**:`tools`(`read_file` vs `Read`)、`model` id、Gemini 專屬的 `kind`/`temperature`/`max_turns`。
- 來源:Gemini CLI 官方 subagents 文件 <https://geminicli.com/docs/core/subagents/>。
