# AGENTS.md — agentrc（Codex 工作入口）

> Codex 在此 repo 工作時會自動載入本檔。Codex **不支援 `@import`**；進行實質工作前，必須自行完整讀取 [`README.md`](README.md)。README 是目的、架構、安裝流程與現況的單一正本，本檔只保留 Codex 執行時不可漏掉的操作規則。

## 正本與範圍

- repo 內的 `AGENTS.md` 是此專案的 Codex 規則入口；部署到使用者層的全域規範正本則是 `shared/principles.md` + `codex/AGENTS.delta.md`。
- 修改全域規範時，只改上述正本並重跑 `install`；不要直接修改 `~/.codex/AGENTS.md`，因為安裝器會覆寫它。
- `references/` 是參考資料，未經使用者明確允許不得新增、修改或刪除。

## Repo 佈局

- `skills/`：跨工具 skills 正本。
- `shared/`：工具中立的全域原則。
- `claude/`、`gemini/`、`codex/`：各工具專屬 delta 與 agents 正本。
- `install/`：跨平台 copy-based 安裝器。
- `mcp/`：跨工具 MCP server 清單。
- `template/`：新 skill 起手範本。
- `references/`：唯讀參考資料。
- `docs/`：定稿文件與可回看的報告。

## Agent 分工

- 使用者或適用規則明確要求 delegation / subagents 時：高推理分析交給 `deep-reasoner`，規格明確的機械實作與驗證交給 `fast-worker`。
- 只分派邊界清楚、可獨立完成的子任務；主 agent 保留決策、授權、整合與最終驗收責任。
- agent 正本在 `codex/agents/`，須先由 `install` 部署到 `~/.codex/agents/`；未安裝或尚未重新載入時由主 agent 自行處理。

## 動手規則

- 撰寫或修改任何 skill 前，先完整讀取 [`references/skill-authoring.md`](references/skill-authoring.md)。
- 修改 `timmy-web` 共用引擎時，只改 `skills/timmy-web/assets/tw-engine.js`，再執行 `PYTHONUTF8=1 python skills/timmy-web/scripts/sync_engine.py`；用 `--check` 驗證冪等。其他 timmy-web 變更依其 `SKILL.md` 與 references 執行。
- 打算隨 git 散布的新子資料夾應附精簡 `README.md`，並指向真正的規格正本，避免兩份詳本漂移。
- Codex 推理草稿放 `.codex/temp/`（必須 gitignore、不 commit）；長期文件放 `docs/`。只有使用者明確要求時才 commit 或 push。
- 有意義的工作使用獨立分支；遵循 repo 既有 commit 風格與安全規範。
