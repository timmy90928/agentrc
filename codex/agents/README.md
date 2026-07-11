# codex/agents/ — Codex CLI subagents (正本)

放 Codex CLI subagent 定義(**`*.toml`**,一檔一 agent);`install` 複製到 `~/.codex/agents/`。

## 現有 agents

- [`deep-reasoner.toml`](deep-reasoner.toml) — `gpt-5.6-sol` + `high` + `read-only`；架構、複雜根因、演算法與技術取捨。
- [`fast-worker.toml`](fast-worker.toml) — `gpt-5.6-terra` + `low` + `workspace-write`；規格明確的修改、格式整理與驗證。

兩個 model ID 依 GPT-5.6 limited preview 官方命名固定；目前本機 `codex debug models` 尚未列出它們，實際啟用取決於帳號／組織 preview access。父 turn 的即時 sandbox / approval override 仍優先於 agent 檔。

## 格式(Codex CLI)— 與 Claude / Gemini 不同:TOML

Codex subagent 是 **TOML 檔**(非 Markdown + frontmatter)。`developer_instructions` = system prompt 本文:

```toml
# ~/.codex/agents/reviewer.toml(或專案 .codex/agents/reviewer.toml)
name = "reviewer"                       # 必填
description = "PR reviewer focused on correctness and security."   # 必填
developer_instructions = """            # 必填:= system prompt 本文
Review code like an owner. Flag correctness bugs and security issues first…
"""
# —— 以下選填,略則繼承父 session ——
# model = "gpt-5.4"
# model_reasoning_effort = "high"
# sandbox_mode = "read-only"            # read-only / workspace-write / danger-full-access
# mcp_servers = ["context7"]
# nickname_candidates = ["rev", "owl"]
```

全域設定另在 `~/.codex/config.toml` 的 `[agents]` 表(`max_threads` / `max_depth` / `job_max_runtime_seconds` / `interrupt_message`)。官方目前預設 `max_threads = 6`、`max_depth = 1`;叫用:CLI 內 `/agent`。

## 與 Claude / Gemini 的可攜性
- **可共用(概念層)**:`description` 與 system prompt 本文(Codex 放 `developer_instructions`,Claude/Gemini 放 Markdown body)。
- **不通用**:**檔案格式**(Codex = TOML;Claude/Gemini = Markdown + YAML frontmatter)、欄位名(`developer_instructions` vs body、`model_reasoning_effort`/`sandbox_mode` 為 Codex 專屬)、`model` id、工具命名。
- 來源:Codex CLI 官方 subagents 文件 <https://developers.openai.com/codex/subagents>(查證日 2026-06-12)。
