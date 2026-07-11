<!-- ===== Codex CLI 專屬機制 (delta);接在 shared/principles.md 之後,串接成 ~/.codex/AGENTS.md ===== -->

> 以下為 **OpenAI Codex CLI 專屬**段落(`AGENTS.md` 階層、`~/.codex/` 路徑、native skills、TOML subagents、`config.toml`、署名),由 install 接在工具中立通則(`shared/principles.md`)之後。
> 機制依 Codex **官方一手文件**與本機 CLI 查證(`developers.openai.com/codex/*`、`codex --help` / `codex debug models`),**查證日 2026-07-11**;Codex 演進快(尤其 models、subagents 與 skills 路徑),沿用前應以當下官方文件與本機 catalog 實測確認。
> 專案專屬規範請改寫在各專案的 repo-root `AGENTS.md` 或子目錄 `AGENTS.md`。

## 版本控制:Codex 署名 (co-author trailer)
- **Codex CLI 有官方預設 co-author trailer**:`Co-authored-by: Codex <noreply@openai.com>`(自 PR #11617 起預設啟用)。
- 由 `config.toml` 的 `[features].codex_git_commit` 之 `commit_attribution` 控制:預設 `"Codex <noreply@openai.com>"`;設 `""` 關閉;可自訂(如 `Codex Agent <codex-agent@yourco.com>`)。**注入 prompt(非 git hook)**,由模型寫進 commit message。
- **PR body 標記**:無官方既定(NOT FOUND)——勿臆造。
- 跟隨 repo 既有 `git log` 風格;trailer 之外的通則見 shared〈版本控制與提交〉。

## Agent 分工調度 (Model Dispatch)——建議而非強制
- **實質任務才分派，瑣碎工作直接做**；只有工作可清楚切成獨立、具體的子任務時才使用 subagent，避免不必要的 token 與協調成本。
- **重推理**（架構、複雜根因、演算法、技術選型與取捨）→ `deep-reasoner`（`gpt-5.6-sol` / `high` / `read-only`）。
- **機械執行**（規格明確的批次修改、局部 refactor、格式整理、依樣板產檔、測試 / lint / build）→ `fast-worker`（`gpt-5.6-terra` / `low` / `workspace-write`）。
- 主 agent 負責拆解、授權邊界、整合與驗收；subagent 產出仍須由主 agent 查證後才能回報使用者。
- 兩個 agent 的正本在 agentrc `codex/agents/`，由 install 部署到 `~/.codex/agents/`。若 agent 尚未安裝或目前 client 未重新載入，退回主 agent 自行處理，不臆造可用性。

## 專案目錄結構 (Project Structure) — Codex 對應
與 Claude / Gemini 版同義,差別在指示檔名(`AGENTS.md`)、工具目錄(`.codex/`)與 subagents 為 **TOML**。預期階層(部分資料夾按需建立):

```
project-root/
├── AGENTS.md          # 專案專屬規範(全域在 ~/.codex/AGENTS.md);AGENTS.override.md 優先;可逐目錄 nested
├── .gitignore         # 須包含 .codex/temp/
├── docs/              # 定稿的架構圖、設計文件(需要時建立、須 commit)
├── references/        # 參考資料(可讀;未經允許不得增改刪)
├── .agents/
│   └── skills/        # 專案層 Agent Skills(Codex 文件指向的 repo-scoped 位置)
│       └── <skill-name>/SKILL.md
└── .codex/
    ├── temp/          # 推理暫存、草稿(gitignore、不 commit)
    │   └── TEMP.md    # 暫存索引
    ├── agents/        # Codex subagents(.toml,一檔一 agent)
    └── prompts/       # 自訂提示(.md;官方已 deprecated → 改用 skills)
```

- 「每個專案 root `AGENTS.md` 記載自身目錄結構」「git 散布 repo 備精簡 `README.md` 指向正本」「目錄名用英文」「`references/` 保護」等通則與 Claude 版相同,只是檔名為 `AGENTS.md`。
- **無 `.codex/rules/`**:Codex 沒有 path-scoped glob 規則;局部規範靠把 `AGENTS.md` 放進該子目錄(見下方「記憶」)。

## 狀態保存與技能累積 (State & Skills) — Codex 對應
- 暫存草稿 → `.codex/temp/`(gitignore);長期產出 → `docs/`(commit)。`agents/`、`.agents/skills/` 通常需 commit 以利共享。

### 推理暫存 (.codex/temp/)
- 與 Claude 版同義:複雜推理 / 架構 / 重構 / 多步驟任務的暫存寫入 `.codex/temp/`,有後續參考價值者記入 `.codex/temp/TEMP.md`;定稿放 `docs/` 並 commit。

### 複用技能 (skills) — 原生 Agent Skills
- **Codex CLI 自 ~2025-12 起原生支援 `SKILL.md` Agent Skills**,採開放標準、**跨工具可攜**,與 Claude / Gemini **共用同一份 `SKILL.md` 正本**(由 `agentrc` install 一併複製,只差安裝目錄)。
- **安裝目錄(過渡中,務必先確認)**:使用者層 **`~/.codex/skills/<name>/`**(現行 installer 慣例,Codex 今日仍讀)——官方文件正轉向 **`~/.agents/skills/`**(見 `openai/skills#420`);專案層 `.agents/skills/`;另有 admin `/etc/codex/skills`、內建系統 skills。`agentrc` install 目前裝到 `~/.codex/skills/`。
- frontmatter 至少 `name` + `description`;叫用:`/skills` 或 `$<skill>`,或依 `description` **隱式自動選用**。**自動偵測變更**(更新沒出現再重啟)。可選 `agents/openai.yaml` 補 Codex 專屬 UI metadata。

### 記憶 / 規則(AGENTS.md 階層) — 取代 path-scoped rules
- **無 path-scoped glob、無 `@import`**。Codex 用 **階層式 `AGENTS.md`**:全域 `~/.codex/AGENTS.md` → repo-root `AGENTS.md` → 逐目錄 **nested `AGENTS.md`**,自 root 往 leaf **串接(concatenate)**,**越深(越接近 CWD)越優先**(後出現者覆寫)。
- 每層先找 `AGENTS.override.md` 再找 `AGENTS.md`(取首個非空);可由 `project_doc_fallback_filenames` 增備援檔名。**局部 / 深度規範**:把 `AGENTS.md` 放進對應子目錄即可(純文字串接,無條件 glob)。
- 改 `AGENTS.md` 需**新 session** 才生效(無 mid-session hot-reload)。

### 自訂提示 / 指令 (~/.codex/prompts/)
- `~/.codex/prompts/*.md`(一檔一提示);TUI 打 `/` 叫用,規範形式 `/prompts:<name>`。參數:`$1`–`$9`、`$ARGUMENTS`、具名 `KEY=value`(對應 `$KEY`)、`$$` 出字面 `$`。
- **官方已標記 deprecated → 改用 skills**(reusable instructions 一律走 skills)。改提示需重啟。

### Subagents (.codex/agents/*.toml)
- **全域設定**:`config.toml` 的 `[agents]` 表(`max_threads`、`max_depth`、`job_max_runtime_seconds`、`interrupt_message`)；官方目前預設 `max_threads = 6`、`max_depth = 1`。
- **自訂 agent = TOML 檔**(一檔一 agent):個人 `~/.codex/agents/<name>.toml`、專案 `.codex/agents/<name>.toml`。
- **必填**:`name`、`description`、`developer_instructions`(= system prompt 本文)。**選填(略則繼承父 session)**:`model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers`、`skills.config`、`nickname_candidates`。
- Codex 內建 `default`、`worker`、`explorer`；自訂 agent 同名時會覆蓋內建角色。subagent 仍會套用父 turn 的即時 sandbox / approval overrides。
- 叫用 `/agent` 切換 / 檢視。注意 `codex exec` 是**非互動腳本模式,非 subagent**。

### config 與 MCP (~/.codex/config.toml)
- 主設定 `~/.codex/config.toml`(TOML):`model`、`model_provider`、`approval_policy`、`sandbox_mode`、`[profiles.<NAME>]`(`--profile` 選用)、`[features]`。改 config 需重啟。
- **MCP**:`codex mcp add <name> [--env K=V] -- <command> [args...]`(列出 / 移除:`codex mcp list` / `remove`),或 `config.toml` 的 `[mcp_servers.<name>]`。支援 **STDIO**(`command` 必填 + `args`/`env`/`env_vars`/`cwd`)與 **streamable-HTTP**(`url` 必填 + `bearer_token_env_var`)。
