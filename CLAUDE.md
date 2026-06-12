# CLAUDE.md — agentrc(Claude Code 工作入口)

> Claude Code 在 `agentrc` repo 工作時自動載入本檔。**完整說明(目的 / 指示檔架構 / 目錄結構 / 跨工具可攜性 / install / 開發流程 / SKILL.md 規範 / 現況)以 [`README.md`](README.md) 為單一正本** —— 這是 Claude / Gemini / Codex 三工具共用的 repo,canonical 文件放在工具中立、GitHub 會渲染的 README;`CLAUDE.md` 只當 Claude 入口並回指。Gemini / Codex 同樣以 README 為準(它們不載入本檔,改讀 `GEMINI.md` / `AGENTS.md`,目前 repo 根未另設,開發時請直接看 README)。

@README.md

## 在本 repo 工作時(Claude agent 操作提醒)

以下為 agent 面向的「怎麼動手」要點;**為什麼這樣設計、完整結構與規格見上方 @import 的 README。**

- **改全域規範**:改 `shared/principles.md`(共通)或 `claude/CLAUDE.delta.md` / `gemini/GEMINI.delta.md` / `codex/AGENTS.delta.md`(專屬)→ 重跑 `install`;**勿**直接編輯安裝後的 `~/.claude/CLAUDE.md`、`~/.gemini/GEMINI.md`、`~/.codex/AGENTS.md`(install 會覆蓋)。
- **改 `timmy-web` 共用引擎**:只改 `skills/timmy-web/assets/tw-engine.js` → 跑 `PYTHONUTF8=1 python skills/timmy-web/scripts/sync_engine.py`(`--check` 驗冪等);**勿逐頁手改**(會 drift)。其餘 timmy-web 開發守則見 `.claude/rules/timmy-web-authoring.md`。
- **撰寫 / 改任何 skill 前**:先讀 [`references/skill-authoring.md`](references/skill-authoring.md)。
- **新增資料夾**:打算 git 散布的子夾都應附 `README.md`(GitHub 只渲染 README);詳本/正本另置(如 skill 的 `SKILL.md`),README 為精簡門面並指向正本,避免漂移。
- **暫存與產出**:推理草稿 → `.claude/temp/`(gitignore、不 commit);定稿產出 → `docs/` 並 commit。
- **版控**:`commit` / `push` 只在使用者明確要求時執行;有意義的工作一律開新分支。
