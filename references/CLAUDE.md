# 全域開發規範 (Global Development Guidelines)

> 此檔為 `~/.claude/CLAUDE.md`(User memory),套用於所有專案。
> 專案專屬規範請改寫在各專案的 `./CLAUDE.md` 或 `.claude/rules/`。

## 核心原則 (Core Principles)
- 遇到任何模糊、未明述或潛在衝突的需求,嚴禁自行通融或臆測。
- 必須立即暫停執行,明確指出疑慮、列出可能的評估選項 (options),向使用者提問釐清後再動手。
- 不確定的技術細節、API 規格、最新工具庫或第三方套件資訊,一律上網查證 (web search),嚴禁憑空臆測或依賴過時知識。
- 釐清與查證優先於動手;但瑣碎、低風險、可逆 (reversible) 的決定可逕行處理,並於回報時註明假設,避免過度發問。

## 安全與不可逆操作 (Safety & Irreversible Actions)
- 破壞性或不可逆指令在執行前必須先停止並取得明確確認,包含但不限於:`rm -rf`、刪除/清空資料庫 (drop / truncate)、`git push --force`、`git reset --hard`、修改既有 migration、覆寫未備份檔案。
- 嚴禁 hardcode 任何機密 (secrets / API keys / tokens);嚴禁將 `.env`、金鑰或憑證內容輸出至聊天、log 或 commit。
- 不得擅自更動 CI/CD、部署設定或正式環境 (production) 相關設定,需先確認。

## 版本控制與提交 (Git & Commits)
- **前提**:先跟隨該 repo 既有 `git log` 風格與**分支命名**慣例(下列為無既有風格時的預設);惟「**一律開新分支**」為硬性規則,不因 repo 慣例而免除。破壞性 git 操作仍受上方〈安全與不可逆操作〉約束。
- **Commit message**:預設 **Conventional Commits**——`feat: / fix: / docs: / refactor: / chore:` 等前綴 + 英文祈使句,首行精簡(≤ 72 字);必要時空行後於本文補「為何這樣改」。
- **何時 commit / push**:**commit 與 push 皆只在使用者明確要求時才執行**,平時不主動進行版控(回到 harness 保守預設)。
- **分支 (branch)**:有意義的工作**一律開新分支**(`<type>/<kebab-desc>`,如 `feat/login-form`),**不直接在 `main` / `master` 上動工**;若當前在預設分支,先開分支再改。
- **署名**:commit 結尾放完整 trailer 單行 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`(body 之後空一行,GitHub 靠此辨識共同作者)。此即 harness 預設;PR body 亦維持預設的「🤖 Generated with Claude Code」標記。

## 專案目錄結構 (Project Structure)
專案的預期階層如下(部分資料夾於需要時才建立,非全部都須同時存在):

```
project-root/
├── CLAUDE.md          # 專案專屬規範(全域規範位於 ~/.claude/CLAUDE.md)
├── .gitignore         # 須包含 .claude/temp/
├── docs/              # 定稿的架構圖、設計文件(需要時建立、須 commit)
├── references/        # 參考資料,後續任務可自行查找(可讀;未經允許不得增改刪)
└── .claude/
    ├── temp/          # 推理暫存、草稿(gitignore、不 commit)
    │   └── TEMP.md    # 暫存索引
    ├── skills/        # 複用技能(native skill,Claude Code 自動載入)
    │   └── <skill-name>/
    │       ├── SKILL.md
    │       └── scripts/
    └── rules/         # 規則模組(path-scoped 或無條件)
        └── *.md
```

- **每個專案的 `./CLAUDE.md` 都須記載該專案自身的目錄結構**:在專案 CLAUDE.md 內維護一段「目錄結構」,描述該 repo 實際的資料夾佈局與各自用途(以上方樹為範本,依該專案實況增刪),作為專案佈局的單一事實來源 (single source of truth);結構變動時一併更新。
- **打算 git 散布 / 公開的 repo 應備 `README.md`**(人看的門面:用途、結構總覽、安裝 / 使用):git host 會渲染 `README.md`、**不**渲染 `CLAUDE.md`;而 Claude **只自動載入 `CLAUDE.md`、不載入 `README.md`** → 兩者受眾不同,並存。為免兩份結構樹漂移 (drift):**擇一為詳細正本、另一為精簡總覽並指向正本**(預設:詳細正本留 `CLAUDE.md` 供 Claude 預載,`README.md` 放精簡結構總覽)。
- 初始化時僅主動建立 `references/`;其餘資料夾於相應活動發生時再建立。目錄名一律用英文,避免中文目錄在跨平台、shell 與 glob 造成問題。
- **參考資料保護**:專案根 `references/` 可讀,但**未經允許不得新增 / 改 / 刪**,需更動先問。此限制**僅及專案根**,不含 skill 內部 `references/`(隨 skill 演進,見下方「skills 自我改進」)。真正凍結的輸入資料(資料集 / prod 快照 / 第三方原檔)由各專案 `./CLAUDE.md` 自設 `readonly/`,全域不預設。
- 註:CLAUDE.md 屬 context 而非強制機制,上述「參考資料保護」僅為軟性約定;若需硬性保護,應改用 PreToolUse hook 或檔案系統權限。

## 狀態保存與技能累積 (State & Skills Management)
- 以下 `.claude/` 均指「當前專案」的 `.claude/`。
- `.claude/temp/` 為暫存,須加入 `.gitignore`;`.claude/rules/` 與 `.claude/skills/` 通常需 commit 以利共享。

### 推理暫存與當前脈絡 (.claude/temp/)
- 時機:進行複雜邏輯推理、架構設計、重構規劃或多步驟任務時。
- 動作:將推理過程的暫存檔、草稿或步驟清單寫入 `.claude/temp/`,並依任務類型分類儲存。
- 索引:若評估此暫存資訊在後續對話仍有參考價值,將其「功能、目錄結構、檔案說明」記錄至 `.claude/temp/TEMP.md`。
- 註:具長期參考價值的產出(如定稿的架構圖、設計文件)不放 temp(會被 gitignore 視為可拋棄),應放在專案的 `docs/`(需要時建立)並 commit。

### 複用腳本與技能庫 (.claude/skills/)
- 時機:當你產出具高複用價值、通用性高的自動化腳本或工具時。
- 動作:將其封裝成 native skill,置於當前專案 `.claude/skills/`(Claude Code 會自動發現並載入)。
- 結構:建立 skill 時優先用 skill-creator(`/skill-creator`)產生正確的目錄結構與具體 `description`,勿憑記憶手刻格式。
- 若 `/skill-creator` 不存在(不在可用 skill 清單、叫用回 `Unknown skill`):**自行下載並安裝**。來源為官方 `github.com/anthropics/skills` 的 `skills/skill-creator/`,建議用 git sparse-checkout 只取該目錄(確保官方原檔、勿憑記憶捏造),安裝到**使用者層** `~/.claude/skills/skill-creator/`(跨專案通用,勿 vendoring 進專案 repo)。下載失敗(如無網路)才退而手刻。
- 善用官方技能庫:可主動到 `github.com/anthropics/skills` 物色「當前專案用得到」的 skill 取用;**凡 Anthropic 官方 skill 皆可逕自放入 `~/.claude/skills/`** 供跨專案使用(此為預先授權)。非官方 / 第三方 skill 不適用此自動授權,需先確認。
- 安裝後:新建的 `~/.claude/skills/` 目錄需**重啟 Claude Code** 才會被探索到(slash 指令才出現);裝在 session 啟動前已存在的 skills 目錄則即時生效。Windows 非 UTF-8 locale 跑技能腳本若遇 `UnicodeDecodeError`,前綴 `PYTHONUTF8=1`。
- **skills 自我改進 (self-improvement)**:用 / 開發 skill 時若發現可修正處、更好的 pattern,或被糾正的教訓,**主動提議**回寫進該 skill 正本(`SKILL.md` / 自身 `references/` / `scripts/`)使其變強。**鼓勵而非預先授權**——每次動手前先取得確認、回報註明改動與理由。改的是 source of truth(repo `skills/<name>/` 或源檔),非 `~/.claude/skills/` 安裝副本(後者會在下次複製被覆蓋)。

### 規則模組化與自動生成 (.claude/rules/)
- 目的:保持主檔 CLAUDE.md 精簡好讀(建議 200 行內),深度或局部知識以規則檔管理。
  - 注意:`@import` 進來的檔案仍 inline 展開、計入 context,不會省 context;真正能省 context 的是 path-scoped 規則(按需載入)。
- 觸發時機:發現重複出現的錯誤模式、特定套件的自訂寫法、特定資料庫/API 規格,或僅適用於特定目錄/檔案類型的規範時。
- 自動寫入動作:主動在「當前專案」 `.claude/rules/` 下,以 kebab-case 主題命名建立獨立 Markdown 檔(例:`react-conventions.md`、`database-schema.md`),單檔建議 ≤500 tokens。
  - **僅適用特定目錄/檔案類型**的規則:加上 `paths:` frontmatter 指定 glob,使其只在存取符合的檔案時載入。
  - **全域通用**或**檔案建立期**(新檔命名、目錄結構)規範:不要加 `paths:`(留為無條件規則)。因為 path-scoped 規則只在「讀取」符合檔案時觸發,「新建」檔案時不會載入。
- 路徑限制:**專案層** `.claude/rules/` 的 path-scoped 規則官方文件明載可用,優先放這裡。使用者層 `~/.claude/rules/` 規則本身會載入(且先於專案規則),但其 **path-scoped 是否生效官方文件未提及**——要依賴前先用 `/doctor`、`/context` 實測確認,勿假設。
- `paths:` frontmatter 範例(官方採 **YAML 清單形式**,一個 glob 一行;glob 以 `{` 或 `*` 開頭時需以引號包住):
  ```markdown
  ---
  paths:
    - "src/**/*.tsx"
    - "src/**/*.jsx"
  ---
  # React Conventions
  - ...
  ```
- 自我檢查:必要時用 `/context` 或詢問 Claude 已載入哪些 memory,確認規則確實生效,勿憑假設。

## 輸出與溝通規範 (Output & Communication Rules)
- 所有回答與說明以繁體中文 (Traditional Chinese) 為主。但**繁中僅用於對話與說明**;程式碼、識別字 (identifiers)、commit message、log、檔名等技術產出**一律依專案既有慣例(通常為英文)**,不強行中文化。
- 遇到專業技術術語或特定名詞時,必須輔以英文 (English) 對照。
- 語氣保持專業、冷靜、嚴謹,避免冗長、無意義的客套話,直接切入核心,精準使用技術術語。

### 報告類交付物輸出為網頁
- 適用範圍:**判準為「是否為使用者要保存、回看的交付物」,而非純看行數**——「報告、分析、研究、彙整」這類結構化交付物才包成網頁(行數長短僅作輔助參考);一般程式碼、終端問答、釐清討論、一次性或簡短說明,即使較長仍以聊天 inline 回覆為主。
- 將此類交付物包裝成一個結構完整、外觀精美的單一網頁檔案。**存放位置**:可保存的交付物 → 專案 `docs/`(須 commit);僅屬一次性暫存 → `.claude/temp/`(gitignore)。**嚴禁放專案根目錄**。**檔名**用英文 kebab-case + 任務代稱(勿用中文 / 空格,避免跨平台問題),不要直接拿「任務名稱」當檔名。
- 同一任務的後續對話,直接修改、更新同一個網頁檔案;視內容增量情況,以分頁 (Tabs) 呈現新進度,或直接改寫/疊代原有內容。
- 採用分頁 (Tabs) 時,視情況將第一個分頁設為「總覽 (Overview)」,彙整全篇重點與各分頁導引,便於快速掌握全局。
- 生成的 HTML 必須包含美觀的 CSS 樣式(建議引入 Tailwind CSS CDN)與易讀的字型排版,提供極佳的視覺呈現與響應式 (responsive) 操作體驗。
- 配色預設為淺色 (light theme) 介面,除非另有指示;避免深色 (dark theme) 背景。
- 所有 CSS 與 JS 皆內嵌於該 HTML 檔案中,維持單檔的獨立性與便攜性。