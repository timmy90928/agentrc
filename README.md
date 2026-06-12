# agentrc

跨工具(Claude Code + Gemini CLI + Codex CLI + Google Antigravity…)的個人 **AI agent 中央設定庫**:集中保管 **skills / MCP / 全域指示檔 / agents** 的**正本 (source of truth)**,再由 `install` 部署到各工具的設定目錄。(Antigravity 為 Gemini 家族、**共用 Gemini 設定**,非獨立部署目標 —— 見〈現況〉。)

> 📌 本檔(**README**)是**人看的單一正本**——目的、結構、可攜性、install、開發流程都在這。各工具的指示檔(`CLAUDE.md` / `GEMINI.md` / `AGENTS.md`)只是「工具入口」並回指本檔:因為這是三個 AI 工具共用的 repo,canonical 文件理應放在**工具中立、GitHub 會渲染**的 README,而非只有 Claude 載入的 `CLAUDE.md`。

## 專案目的 (Purpose)

- 單一、版控的設定正本 → `install` 部署到 `~/.claude/` / `~/.gemini/` / `~/.codex/`。
- **跨工具共用甜區**:`skills/` 與 `mcp/`(開放標準,Claude / Gemini / Codex 通用,只差安裝目錄)。
- **per-tool(內容可共用、接線各異)**:全域指示檔(`CLAUDE.md` / `GEMINI.md` / `AGENTS.md`)與 `agents/`。
- 散布:`install` 到本機各工具;或把單一 skill 複製到目標專案的 skills 目錄供團隊共用。

## 指示檔架構:shared 核心 + 各工具 delta

全域指示檔大半內容(核心原則 / 安全 / git / 輸出溝通)**工具中立**,少半(`.claude/` / `.gemini/` / `.codex/` 路徑與指示檔名、native skills、subagents 格式、path-scoped rules 有無、署名 trailer)**per-tool**。故拆成:

- `shared/principles.md` — 工具中立通則(**單一來源**)。
- `claude/CLAUDE.delta.md` / `gemini/GEMINI.delta.md` / `codex/AGENTS.delta.md` — 各工具專屬機制。
- `install` 串接 `shared/principles.md` + `<tool>.delta` → `~/.claude/CLAUDE.md` / `~/.gemini/GEMINI.md` / `~/.codex/AGENTS.md`。

> ⚠️ **勿直接編輯安裝後的 `~/.<tool>/…`(install 會覆蓋)**。要改全域規範:改 `shared/`(共通)或對應 `*/*.delta.md`(專屬),再重跑 `install`。

## 目錄結構 (Structure)

```
agentrc/
├── README.md                 # 人看的正本:完整說明(目的/結構/可攜性/install/開發流程)— GitHub 渲染
├── CLAUDE.md                 # Claude Code 工作入口(精簡;@import README + agent 操作提醒)
├── .gitignore
├── skills/                   # 【跨工具・正本】自有 skills(一子夾 = 一 skill)
│   └── timmy-web/            #   SKILL.md(正本)+ README + references/ + scripts/ + examples/…
├── mcp/                      # 【跨工具・正本】MCP server 清單
│   ├── servers.json          #   單一來源(目前空 scaffold)
│   └── README.md
├── shared/                   # 【指示檔共用核心・正本】工具中立通則
│   ├── principles.md
│   └── README.md
├── claude/                   # 【Claude 側・正本】只裝回 ~/.claude
│   ├── CLAUDE.delta.md       #   Claude 專屬機制
│   ├── agents/               #   Claude subagents(*.md,空 scaffold)
│   └── README.md
├── gemini/                   # 【Gemini 側・正本】只裝回 ~/.gemini
│   ├── GEMINI.delta.md       #   Gemini 專屬機制
│   ├── agents/               #   Gemini subagents(*.md,空 scaffold)
│   └── README.md
├── codex/                    # 【Codex 側・正本】只裝回 ~/.codex
│   ├── AGENTS.delta.md       #   Codex 專屬機制
│   ├── agents/               #   Codex subagents(*.toml,空 scaffold)
│   └── README.md
├── install/                  # 跨平台 copy-based 安裝器
│   ├── install.py            #   核心邏輯(唯一來源)
│   ├── install.cmd           #   Windows 薄包裝 → python install.py
│   ├── install.sh            #   macOS/Linux 薄包裝 → python3 install.py
│   └── README.md
├── template/                 # 新 skill 起手範本(SKILL.md + README)
└── references/               # 參考資料(可讀;未經允許不得增改刪)
    ├── skill-authoring.md    #   SKILL.md 撰寫規範(權威版,撰寫/改進 skill 前必讀)
    └── README.md
```

**重要**:Claude Code / Gemini CLI / Codex CLI **不會**自動探索本 repo 頂層 `skills/`。它們只探索各自的 `~/.<tool>/skills/`、專案層 skills 目錄等。因此本 repo 的 skill 必須先 `install`(複製)到那些位置才能被測試或使用。

## 跨工具可攜性速查

| artifact | Claude | Gemini | Codex | 共用程度 |
|---|---|---|---|---|
| **skills (SKILL.md)** | `~/.claude/skills/` | `~/.gemini/skills/` | `~/.codex/skills/` | **真共用(三方)**:同一份正本,只差安裝目錄(Codex 文件正轉向 `~/.agents/skills/`) |
| **MCP server** | `claude mcp` / `~/.claude.json` | `~/.gemini/settings.json` | `~/.codex/config.toml` `[mcp_servers]` | server 共用、**註冊設定各做** |
| **指示檔** | `CLAUDE.md` | `GEMINI.md` | `AGENTS.md` | 本文共用(`shared/`)、**機制 delta 各做**;均回指本 README |
| **agents** | `~/.claude/agents/`(md) | `~/.gemini/agents/`(md) | `~/.codex/agents/`(toml) | 說明/prompt 本文共用、**檔案格式各做** |

> **Google Antigravity**(`agy` CLI + IDE,Gemini 家族、Gemini CLI 官方後繼):**共用 `~/.gemini/`** 並讀 `~/.gemini/GEMINI.md`,故 agentrc 的 **Gemini 部署即同時涵蓋 Antigravity**(不另開第 4 套,等同 Gemini 欄)。`install` 裝 Gemini 時**額外**把 skills 鏡像到 `~/.agents/skills/`、MCP 寫入 `~/.gemini/config/mcp_config.json`,補齊 Antigravity 路徑差異。詳見〈現況 / 開放項〉。

## install(部署)

- 跨平台:`install/install.py`(核心邏輯)+ `install.cmd` / `install.sh`(薄包裝,僅轉呼叫並透傳參數)。
- **copy-based**(非 symlink);冪等;覆寫指示檔前自動備份(`*.bak-<時間>`)。

```bat
REM Windows(在 cmd / PowerShell 執行,非 git-bash)
.\install\install.cmd --dry-run
.\install\install.cmd
```

```sh
# macOS / Linux
./install/install.sh --dry-run
./install/install.sh
```

- 旗標:`--dry-run`(只列不寫)、`--tool claude|gemini|codex|all`(預設 `all`;未偵測到的工具自動略過,`--tool <tool>` 可強制預覽)。
- 行為:`skills/*` → 三工具 `skills/`(裝 Gemini 時**另鏡像到 `~/.agents/skills/`** 供 Antigravity);`shared+delta` 串接 → 各工具指示檔(`CLAUDE.md`/`GEMINI.md`/`AGENTS.md`);`<tool>/agents/*` → 各工具 `agents/`(claude/gemini=`*.md`、codex=`*.toml`);`mcp/servers.json` → 各工具 MCP 註冊(Gemini **另寫 Antigravity 的 `~/.gemini/config/mcp_config.json`**;空則略過)。
- **只替換本 repo 自有的 skill**(如 `timmy-web`),**不動**各工具已存在的其他 skill。

## 開發與測試流程

1. 改正本:`skills/`、`shared/`、`claude/`、`gemini/`、`codex/`、`mcp/`。
2. `install --dry-run` 預覽 → 確認 → 正式 `install` 部署。
3. 測試:輸入 `/<skill-name>` 觸發,或用符合 `description` 的自然語句測自動觸發;Claude `/doctor` 查 `description` 是否被截斷。
4. 改共用引擎類 skill(如 timmy-web)仍依該 skill 自身的 `scripts/` 流程(見其 `SKILL.md`)。

## SKILL.md 撰寫規範(重點)

**撰寫或改進任何 skill 前,先讀 [`references/skill-authoring.md`](references/skill-authoring.md)。** 不可違反的重點:

- `name`:≤ 64 字元,僅小寫字母 / 數字 / 連字號;不可含保留字 `anthropic` / `claude`;建議用動名詞 (gerund)。
- `description`:非空、≤ 1024 字元;**第三人稱**;含「做什麼 + 何時用」。指令名稱來自**資料夾名**;請讓資料夾名 = frontmatter `name`。
- `SKILL.md` 本文 **< 500 行**;超過拆到附檔。參考檔 **> 100 行加 TOC**;reference 連結保持離 `SKILL.md` 一層。
- 路徑一律用正斜線 `scripts/run.py`;腳本要明說「執行」或「當參考讀」。別假設套件已裝,先列依賴;MCP 工具用全名 `Server:tool`。

## 現有 skills

- [`timmy-web`](skills/timmy-web/) — 單檔 HTML + Tailwind CDN 網頁,10 款策展風格(預設編輯/手札風)、淺/深/系統主題、繁中 / English i18n、RWD 貼邊寬版、一鍵匯出。線上實驗室:<https://timmy-web-style.pages.dev/>。詳見 [`README`](skills/timmy-web/README.md) / 正本 [`SKILL.md`](skills/timmy-web/SKILL.md)。

## 現況 / 開放項

- **官方 8 skill 不 vendor**:`canvas-design` / `docx` / `frontend-design` / `pdf` / `pptx` / `skill-creator` / `theme-factory` / `webapp-testing` 留在各工具 `skills/` 既有,不納入本 repo;需要時用 `git sparse-checkout` 從 `github.com/anthropics/skills` 取得。
- `mcp/servers.json` 目前為空 scaffold。
- `gemini/GEMINI.delta.md` **已依 Gemini CLI 官方文件查證補完**(2026-06-11):原生 `SKILL.md`(v0.26.0 起)、`GEMINI.md` 階層 + `@import`(無 path-scoped glob)、TOML custom commands、`.gemini/agents/*.md` subagents。**Gemini 無官方 commit trailer**,由 Gemini 產 commit 時須先問使用者、勿臆造信箱。
- `codex/AGENTS.delta.md` **已依 Codex CLI 官方文件查證補完**(2026-06-12):原生 `SKILL.md`(~2025-12 起,跨工具可攜)、`AGENTS.md` 階層(root→leaf 串接、deeper override;`AGENTS.override.md` 優先;無 `@import`、無 path-scoped glob)、`~/.codex/agents/*.toml` subagents、`config.toml` `[mcp_servers]`/`codex mcp add`。**官方有預設 commit trailer** `Co-authored-by: Codex <noreply@openai.com>`。**待留意**:skills 使用者目錄 `~/.codex/skills` ↔ `~/.agents/skills` 過渡中(install 暫裝前者,見 `openai/skills#420`)。
- **Google Antigravity**(查證日 2026-06-12;依「沿用既有」決議,**不另開第 4 套**):Google 的 agentic 平台(IDE + **`agy` CLI** + SDK),**Gemini 3 家族**、Gemini CLI 官方後繼(Gemini CLI 個人版 **2026-06-18 日落**)。**共用 `~/.gemini/` 設定根**並讀 `~/.gemini/GEMINI.md` → agentrc 的 **Gemini 部署已涵蓋其全域指示檔**。為補齊 Antigravity 路徑差異,**`install` 裝 Gemini 時已主動**:② 把 **skills 鏡像到 `~/.agents/skills/`**(Antigravity 全域 skills;專案則 `.agents/skills/`)外加 `~/.gemini/skills/`;③ 把 **MCP 同時寫入 `~/.gemini/config/mcp_config.json`**(JSON `mcpServers`)外加 `~/.gemini/settings.json`;並把 **`agy`** 納入 Gemini 工具偵測(只裝 Antigravity 也會觸發)。其餘:① 也讀專案 `AGENTS.md`(precedence:System > `GEMINI.md` > `AGENTS.md` > `.agents/rules/`);④ **無**官方 commit trailer。⚠️ Antigravity 與 Gemini CLI **共寫同一 `~/.gemini/GEMINI.md`**(gemini-cli#16058);install 覆寫前自動備份,仍留意互蓋。**路徑類細節為中度信心,首次於本機以 `agy` / `~/.gemini/` 實測確認。**
- `claude/agents/`、`gemini/agents/`、`codex/agents/` 為空 scaffold(目前零自訂 agent)。

## Windows / 跨平台補充

- `install` 走 Python;Windows 包裝(`install.cmd`)已設 `PYTHONUTF8=1` 以免非 UTF-8 locale 的 `UnicodeDecodeError`;請在 **cmd / PowerShell** 執行 `.\install\install.cmd`(git-bash 不吃 `.\…\.cmd`)。
- skill 內動態注入 `` !`cmd` `` 預設走 bash;要改 PowerShell 需 frontmatter `shell: powershell` 並啟用 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`(此為 Claude Code 機制)。
- `install` 部署到 `~/.claude`、`~/.gemini`、`~/.codex` 的產物屬本機環境,**不**納入本 repo 版控。
