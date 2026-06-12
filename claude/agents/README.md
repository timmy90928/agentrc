# claude/agents/ — Claude Code subagents (正本)

放 Claude Code subagent 定義(`*.md`);`install` 複製到 `~/.claude/agents/`。**目前為空 scaffold**(本機尚無自訂 agent)。

## 格式(Claude Code)

Markdown + YAML frontmatter;**body = 該 agent 的 system prompt**。

```markdown
---
name: code-reviewer
description: Reviews diffs for correctness bugs and cleanups. Use after writing code.
tools: Read, Grep, Glob, Bash      # 選用;省略則繼承全部
model: inherit                      # 選用;sonnet/opus/haiku/inherit 或具體 id
---
你是嚴謹的程式碼審查者……(system prompt 本文)
```

## 與 Gemini 的可攜性

- **可共用**:body(system prompt)、`name`、`description`。
- **不通用(各填各的)**:`tools` 工具名(Claude 用 `Read`/`Edit`/`Grep`/`Bash`;Gemini 用 `read_file`/`grep_search`/…)、`model` id、Gemini 多出的 `kind`/`temperature`/`max_turns`。
- 之後若要共用:把 body 抽成共用、frontmatter 各工具一份(屆時再決定,現無存量、好改)。
