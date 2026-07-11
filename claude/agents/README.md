# claude/agents/ — Claude Code subagents (正本)

放 Claude Code subagent 定義(`*.md`);`install` 複製到 `~/.claude/agents/`。

## 現有 agents

- **`deep-reasoner`**(Opus)— 深度推理:架構設計、根因分析、演算法、技術取捨。
- **`fast-worker`**(Sonnet)— 機械執行:規格明確的批次修改、跑測試 / lint / build、格式整理、依樣板產檔。
- **`codex-runner`**(Sonnet 外殼)— 橋接 OpenAI Codex CLI:把明確工作透過 `codex exec` 分派給 Codex(第二執行引擎 / 第二視角 / Codex 專屬 review),本身只組指令與驗證、不親自改檔。

> 三個 agent 的調度與 `codex-runner` 寫入授權邊界見 `claude/CLAUDE.delta.md`〈模型分工調度〉。

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
