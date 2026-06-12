<!-- ===== Gemini CLI 專屬機制 (delta);接在 shared/principles.md 之後,串接成 ~/.gemini/GEMINI.md ===== -->

> 以下為 **Gemini CLI 專屬**段落(`.gemini/` 路徑、native skills、記憶/`GEMINI.md` 階層、custom commands、subagents、署名),由 install 接在工具中立通則(`shared/principles.md`)之後。
> 機制依 Gemini CLI **官方一手文件**查證(`docs/cli/skills.md`、`docs/cli/gemini-md.md`、`docs/cli/custom-commands`、`docs/core/subagents.md`),**查證日 2026-06-11**;Gemini CLI 演進快,沿用前建議以 `/help`、`/memory show`、`/skills`、`/memory reload` 實測確認。
> 專案專屬規範請改寫在各專案的 `./GEMINI.md` 或子目錄 `GEMINI.md`。

## 版本控制:Gemini 署名 (co-author trailer)
- **Gemini CLI 目前無官方既定的 commit co-author trailer 與 PR body 標記**(官方 repo 的署名討論串維護者未拍板,且有信箱未對應有效 CLA 帳號的 open issue)。**嚴禁臆造 `Co-Authored-By:` 信箱**。
- 由 Gemini 產出 commit / PR 時:**先詢問使用者**要用的 trailer / 標記字串再寫入;使用者未指定則**不加** co-author trailer。
- 註:坊間流傳的 `gemini-code-assist[bot]` 等字串屬非官方提案,非 CLI 預設,勿逕用。

## 專案目錄結構 (Project Structure) — Gemini 對應
與 Claude 版同義,差別僅在工具目錄(`.claude/` → `.gemini/`)與「無 path-scoped 規則目錄」。預期階層(部分資料夾按需建立):

```
project-root/
├── GEMINI.md          # 專案專屬規範(全域規範位於 ~/.gemini/GEMINI.md);可用 @相對路徑.md 拆檔
├── .gitignore         # 須包含 .gemini/temp/
├── docs/              # 定稿的架構圖、設計文件(需要時建立、須 commit)
├── references/        # 參考資料(可讀;未經允許不得增改刪)
└── .gemini/
    ├── temp/          # 推理暫存、草稿(gitignore、不 commit)
    │   └── TEMP.md    # 暫存索引
    ├── skills/        # Agent Skills(原生;~/.gemini/skills/ 或專案 .gemini/skills/)
    │   └── <skill-name>/SKILL.md
    ├── commands/      # 自訂 slash commands(.toml;子目錄即命名空間)
    └── agents/        # Gemini subagents(.md + YAML frontmatter)
```

- 「每個專案 `./GEMINI.md` 記載自身目錄結構」「git 散布 repo 備精簡 `README.md` 指向正本」「目錄名用英文」「`references/` 保護」等通則與 Claude 版相同,只是檔名為 `GEMINI.md`。
- **無 `.gemini/rules/`**:Gemini CLI 沒有 Claude `.claude/rules/` + `paths:` glob 的 path-scoped 規則機制;局部 / 深度規範改用下方「記憶模組化」的階層式 `GEMINI.md` + `@import`。

## 狀態保存與技能累積 (State & Skills) — Gemini 對應
- 以下 `.gemini/` 均指「當前專案」的 `.gemini/`。暫存草稿 → `.gemini/temp/`(gitignore);長期產出 → `docs/`(commit)。`.gemini/skills/`、`.gemini/commands/`、`.gemini/agents/` 通常需 commit 以利共享。

### 推理暫存 (.gemini/temp/)
- 與 Claude 版同義:複雜推理 / 架構 / 重構 / 多步驟任務的暫存、草稿、步驟清單寫入 `.gemini/temp/`,有後續參考價值者記入 `.gemini/temp/TEMP.md`;定稿產出放 `docs/` 並 commit。

### 複用技能 (.gemini/skills/) — 原生 Agent Skills
- **Gemini CLI 自 v0.26.0(2026-01)起原生支援 `SKILL.md` Agent Skills**,與 Claude Code **共用同一份 `SKILL.md` 開放標準正本**(由 `agentrc` install 一併複製,只差安裝目錄)。
- **探索目錄(優先序低→高)**:內建 → extension 內附 → **使用者** `~/.gemini/skills/`(別名 `~/.agents/skills/`)→ **工作區** `.gemini/skills/`(別名 `.agents/skills/`);同層 `.agents/skills/` 優先於 `.gemini/skills/`。
- `SKILL.md` 置於 skills 目錄根或**下一層** `<skill-name>/SKILL.md`(建議下一層,便於附帶 `scripts/`、`references/`);frontmatter 至少 `name`(= 資料夾名)+ `description`(觸發關鍵,務必具體)。叫用時 Gemini 以 `activate_skill` 工具把 `SKILL.md` 本文與目錄結構載入。
- **熱重載,無需重啟**:新增 / 改 skill 後跑 `/skills reload`(別名 `/skills refresh`)重掃即可生效(對比 Claude:新建 skills 目錄需重啟)。
- **無官方 `skill-creator`**:可沿用 Claude `/skill-creator` 產出的 `SKILL.md`(標準相同、跨工具通用),或依 `references/skill-authoring.md` 手寫。

### 記憶 / 規則模組化 (GEMINI.md 階層 + @import) — 取代 Claude path-scoped rules
- **無 path-scoped glob 規則**。Gemini 的局部 / 深度知識管理改用:
  1. **階層式 `GEMINI.md`**:全域 `~/.gemini/GEMINI.md` → 專案根 `./GEMINI.md` → **子目錄 `GEMINI.md`**(JIT:當工具存取某目錄 / 其上層時自動載入該層 `GEMINI.md`);全部串接進 prompt。**唯一的「條件式」載入是子目錄 JIT —— 依被存取的目錄,而非自訂 glob。**
  2. **`@相對路徑.md` import**:把大 `GEMINI.md` 拆成多檔。**注意**:`@import` 仍 inline 展開、計入 context(與 Claude `@import` 同理),**不省 context**;真正想省 context 用上面的子目錄 JIT。
  3. **`context.fileName`**(`settings.json`):可改記憶檔名或設定多個。
- 檢視 / 重載:`/memory show`(看串接後全文)、`/memory reload`(重掃所有 `GEMINI.md`)。確認規則是否生效用 `/memory show`,勿憑假設。

### 自訂指令與 extensions (.gemini/commands/、gemini-extension.json)
- **自訂 slash commands(TOML)**:`~/.gemini/commands/`(全域)、`.gemini/commands/`(專案,覆寫同名);**子目錄 = 命名空間**(`.gemini/commands/git/commit.toml` → `/git:commit`,冒號分隔,檔名大小寫敏感)。欄位:`prompt`(**必填**,送給模型的提示)、`description`(選填,`/help` 顯示)。動態注入:`{{args}}`(使用者參數)、`!{...}`(shell 執行,需確認)、`@{...}`(注入檔案 / 目錄內容)。
- **Extensions**:以 `gemini-extension.json` 為清單的可散布套件,可內含 `GEMINI.md` + `commands/`(同 TOML 格式)+ 內附 skills,作為「打包出貨」單位。

### Subagents (.gemini/agents/*.md)
- **位置**:專案 `.gemini/agents/*.md`(隨團隊共享)、使用者 `~/.gemini/agents/*.md`(個人)。
- **格式**:Markdown + **YAML frontmatter**(須以 `---` 起);**body = 該 agent 的 system prompt**。
- **frontmatter 欄位**:`name`(必,小寫字母 / 數字 / 連字號 / 底線)、`description`(必)、`kind`(`local` / `remote`)、`tools`(陣列,支援萬用 `*` / `mcp_*` / `mcp_<server>_*`)、`mcpServers`、`model`、`temperature`、`max_turns`、`timeout_mins`。
