# shared/ — 指示檔共用核心 (tool-neutral source of truth)

工具中立的全域開發通則(核心原則 / 安全 / git / 輸出溝通),**Claude / Gemini / Codex 共用**。

- 正本:[`principles.md`](principles.md)。
- `install` 串接 `principles.md` + 各工具 delta(`../claude/CLAUDE.delta.md`、`../gemini/GEMINI.delta.md`、`../codex/AGENTS.delta.md`)→ `~/.claude/CLAUDE.md` / `~/.gemini/GEMINI.md` / `~/.codex/AGENTS.md`。
- ⚠️ 勿直接編輯安裝後的 `~/.<tool>/…`(install 會覆蓋):**共通**規範改這裡,**工具專屬**機制改對應 delta,再重跑 `install`。

完整架構見根目錄 [`../README.md`](../README.md)(人看正本)。
