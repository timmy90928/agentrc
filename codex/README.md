# codex/ — OpenAI Codex CLI 側正本 (只裝回 ~/.codex)

Codex CLI 專屬的設定正本;`install` 只把這裡的內容裝回 `~/.codex/`。

- [`AGENTS.delta.md`](AGENTS.delta.md) — Codex 專屬機制(`AGENTS.md` 階層、`~/.codex/` 路徑、原生 `SKILL.md`、TOML subagents、`config.toml` / MCP、官方 commit trailer `Co-authored-by: Codex <noreply@openai.com>`)。`install` 串接在 [`../shared/principles.md`](../shared/principles.md) 之後 → `~/.codex/AGENTS.md`。
- [`agents/`](agents/) — Codex subagents(**`*.toml`**):`deep-reasoner`（`gpt-5.6-sol` / `high` / 唯讀深度分析）、`fast-worker`（`gpt-5.6-terra` / `low` / workspace 實作）；調度指引見 `AGENTS.delta.md`〈Agent 分工調度〉。

完整架構見根目錄 [`../README.md`](../README.md)(人看正本)。
