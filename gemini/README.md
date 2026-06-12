# gemini/ — Gemini CLI 側正本 (只裝回 ~/.gemini)

Gemini CLI 專屬的設定正本;`install` 只把這裡的內容裝回 `~/.gemini/`。

- [`GEMINI.delta.md`](GEMINI.delta.md) — Gemini 專屬機制(`.gemini/` 路徑、原生 `SKILL.md`、階層式 `GEMINI.md` + `@import`(無 path-scoped glob)、TOML custom commands、subagents)。`install` 串接在 [`../shared/principles.md`](../shared/principles.md) 之後 → `~/.gemini/GEMINI.md`。
- [`agents/`](agents/) — Gemini subagents(`*.md` + YAML frontmatter,目前空 scaffold)。

> **同時服務 Google Antigravity**:Antigravity(`agy` CLI + IDE)是 Gemini 家族、**共用 `~/.gemini/`** 並讀 `~/.gemini/GEMINI.md`,故本側的 Gemini 部署亦涵蓋 Antigravity(**不另開第 4 套**)。為補齊路徑差異,**`install` 裝 Gemini 時已主動**把 skills 鏡像到 `~/.agents/skills/`、MCP 寫入 `~/.gemini/config/mcp_config.json`,並把 `agy` 納入偵測。Antigravity 與 Gemini CLI 共寫同一 `~/.gemini/GEMINI.md`(gemini-cli#16058)。查證日 2026-06-12,路徑首次於本機實測。

完整架構見根目錄 [`../README.md`](../README.md)(人看正本)。
