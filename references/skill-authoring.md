# Skill 撰寫規範(完整版)

> 撰寫或改進任何 skill 前先讀本檔。內容濃縮自 Anthropic 官方文件(來源見文末),如與官方最新版衝突,以官方為準。

## 目錄 (Contents)

1. [Frontmatter 欄位(Claude Code)](#1-frontmatter-欄位claude-code)
2. [name 與 description](#2-name-與-description)
3. [Progressive disclosure 與檔案組織](#3-progressive-disclosure-與檔案組織)
4. [Degrees of freedom(指示鬆緊度)](#4-degrees-of-freedom指示鬆緊度)
5. [Workflows、checklist 與 feedback loop](#5-workflowschecklist-與-feedback-loop)
6. [內容守則](#6-內容守則)
7. [腳本 (scripts) 進階](#7-腳本-scripts-進階)
8. [動態 context 注入與字串替換](#8-動態-context-注入與字串替換)
9. [Skill 生命週期與 compaction](#9-skill-生命週期與-compaction)
10. [Eval 驅動開發](#10-eval-驅動開發)
11. [最終 checklist](#11-最終-checklist)

---

## 1. Frontmatter 欄位(Claude Code)

`SKILL.md` 開頭以 `---` 包住的 YAML。所有欄位皆選用,但 `description` 強烈建議。

| 欄位 | 必要 | 說明 |
| :-- | :-- | :-- |
| `name` | 否 | 清單顯示名,預設等於資料夾名。**指令名稱取自資料夾名**,非此欄位。 |
| `description` | 建議 | 做什麼 + 何時用。Claude 據此決定是否套用。與 `when_to_use` 合併後在清單中截斷於 1,536 字元。 |
| `when_to_use` | 否 | 補充觸發語 / 範例請求,接在 `description` 後,計入 1,536 字元上限。 |
| `argument-hint` | 否 | 自動完成提示,例:`[issue-number]`。 |
| `arguments` | 否 | 具名位置參數,供 `$name` 替換;空白分隔字串或 YAML list。 |
| `disable-model-invocation` | 否 | `true` = 只能手動 `/name` 觸發(有副作用的工作流用);預設 `false`。 |
| `user-invocable` | 否 | `false` = 只讓 Claude 自動載入、不在 `/` 選單(純背景知識用);預設 `true`。 |
| `allowed-tools` | 否 | 啟用此 skill 時免確認即可用的工具(不限制其他工具)。 |
| `disallowed-tools` | 否 | 啟用期間自工具池移除的工具。 |
| `model` | 否 | 此 skill 啟用時的模型;同 `/model` 值,或 `inherit`。 |
| `effort` | 否 | `low`/`medium`/`high`/`xhigh`/`max`,覆蓋 session 設定。 |
| `context` | 否 | `fork` = 在子代理 (subagent) 隔離執行(skill 內容即其 prompt)。 |
| `agent` | 否 | 搭配 `context: fork` 指定子代理類型(`Explore`/`Plan`/`general-purpose`/自訂)。 |
| `hooks` | 否 | 綁定此 skill 生命週期的 hooks。 |
| `paths` | 否 | glob;設定後僅在處理符合的檔案時自動載入(逗號分隔或 YAML list)。 |
| `shell` | 否 | `` !`cmd` `` 用的 shell:`bash`(預設)或 `powershell`。 |

> 純 API 上傳的 skill 只驗證 `name`(≤64)與 `description`(≤1024、非空),兩者皆不可含 XML tag,`name` 不可含保留字 `anthropic`/`claude`。Claude Code 額外支援上表其餘欄位。

## 2. name 與 description

**name**:≤64 字元,僅小寫字母/數字/連字號;建議動名詞 (gerund):`processing-pdfs`、`analyzing-spreadsheets`。避免 `helper`、`utils`、`tools`、`data` 等含糊名。讓資料夾名 = `name`。

**description**(最重要):
- **第三人稱**。好:`Processes Excel files and generates reports`。避免:`I can help…` / `You can use this…`。
- 同時寫「做什麼」+「何時用(具體觸發詞/情境)」。
- 範例:
  ```yaml
  description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
  ```
- 避免含糊:`Helps with documents` / `Processes data` / `Does stuff with files`。

## 3. Progressive disclosure 與檔案組織

三層載入:① 啟動只預載 `name`+`description` → ② 命中才讀 `SKILL.md` 本文 → ③ 附檔/腳本按需讀取或執行。

- `SKILL.md` 本文 **< 500 行**;逼近上限就拆檔。
- 參考檔 **> 100 行** 在開頭放**目錄 (TOC)**(Claude 預覽 partial read 時也能看到全貌)。
- **連結只保持一層深**:所有 reference 直接從 `SKILL.md` 連出,勿 `SKILL.md → a.md → b.md` 巢狀(Claude 可能只 `head` 預覽巢狀檔導致資訊不全)。
- 目錄佈局範例:
  ```
  skill-name/
  ├── SKILL.md            # 主指示(命中時載入)
  ├── reference.md        # API 參考(按需載入)
  ├── examples.md         # 範例(按需載入)
  └── scripts/
      └── run.py          # 工具腳本(執行,不讀入)
  ```
- 多領域 skill:依領域分檔(`reference/finance.md`、`reference/sales.md`),問哪塊讀哪塊,省 context。
- 檔名要表意:`form_validation_rules.md`,別用 `doc2.md`。

## 4. Degrees of freedom(指示鬆緊度)

依任務的脆弱度調整具體程度:
- **高自由度**(純文字指示):多種作法皆可、需依情境判斷時。例:code review 流程。
- **中自由度**(帶參數的 pseudocode/腳本):有偏好模式、允許部分變化時。
- **低自由度**(固定腳本、少/無參數):操作脆弱、必須照精確順序時。例:DB migration ──「照這行跑,勿改」。

別給太多選項;**給一個預設 + 逃生口**:「用 pdfplumber 抽文字;掃描檔需 OCR 時改用 pdf2image + pytesseract」。

## 5. Workflows、checklist 與 feedback loop

- 複雜任務拆成清楚的循序步驟;特別複雜時提供可勾選 checklist 讓 Claude 複製進回應逐項追蹤。
- **Feedback loop**(跑驗證 → 修錯 → 重跑)能大幅提升品質。有腳本的例子:
  1. 改 `word/document.xml`
  2. 立即驗證:`python ooxml/scripts/validate.py unpacked_dir/`
  3. 失敗 → 看錯誤、修、再驗;**通過才繼續**
  4. 重打包並測試輸出
- 無腳本也適用:以 `STYLE_GUIDE.md` 當「驗證器」,讀完對照清單再修。

## 6. 內容守則

- **精簡**:Claude 已很聰明,只加它沒有的脈絡;每段都要值得它的 token 成本。
- **避免時效性內容**:別寫「2025/08 前用舊 API」。歷史資訊放 `<details>` 的「舊作法 (old patterns)」區塊。
- **用語一致**:固定用 `field`(別混 `box`/`element`)、`extract`(別混 `pull`/`get`)。
- **Template pattern**:要嚴格格式就給「ALWAYS use this exact template」;要彈性就給「sensible default, use judgment」。
- **Examples pattern**:輸出品質依賴範例時,給 input→output 配對(如 commit message 風格)。
- **路徑一律正斜線**,連 Windows 也是:`scripts/helper.py`,不要 `scripts\helper.py`。

## 7. 腳本 (scripts) 進階

- **自己解決,別丟回給 Claude**:腳本要顯式處理 `FileNotFoundError`/`PermissionError` 等,而非裸 `open().read()` 讓它去猜。
- **不要 voodoo constants**:每個常數寫明理由(`REQUEST_TIMEOUT = 30  # 慢連線預留`),別 `TIMEOUT = 47  # Why 47?`。
- **預先寫好工具腳本**比讓 Claude 現寫更可靠、省 token、結果一致。明說是「執行」(`Run analyze_form.py`)還是「當參考讀」(`See analyze_form.py for the algorithm`)── 多數情況用執行。
- **列出依賴、別假設已安裝**:`pip install pypdf` 後再用。
- **MCP 工具用全名** `Server:tool`,如 `BigQuery:bigquery_schema`、`GitHub:create_issue`,否則可能 tool not found。
- **Plan-validate-execute**:批次/破壞性/高風險操作 → 先產生計畫檔(如 `changes.json`)→ 用腳本驗證 → 再執行 → 驗證輸出。驗證訊息要具體(列出可用欄位名)。
- **環境差異**:claude.ai 可裝 npm/PyPI 套件;Claude API 無網路、不可 runtime 安裝 ── 在 `SKILL.md` 列出所需套件並確認可用。

## 8. 動態 context 注入與字串替換

- `` !`<command>` `` 會在 skill 內容送給 Claude **之前**先執行,輸出取代該佔位符(這是預處理,不是 Claude 執行)。多行用 ` ```! ` fenced block。
- 僅當 `!` 在行首或緊接空白後才生效;`KEY=!`cmd`` 不會執行。
- Windows 用 PowerShell:frontmatter 設 `shell: powershell` 並啟用 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`。
- 字串替換:

  | 變數 | 說明 |
  | :-- | :-- |
  | `$ARGUMENTS` | 全部參數;未出現於內容時自動以 `ARGUMENTS: <value>` 附加。 |
  | `$ARGUMENTS[N]` / `$N` | 第 N 個參數(0-based)。多字參數用引號包成單一參數。 |
  | `$name` | `arguments` frontmatter 宣告的具名參數,依序對應位置。 |
  | `${CLAUDE_SESSION_ID}` | 當前 session ID。 |
  | `${CLAUDE_EFFORT}` | 當前 effort(`low`/`medium`/`high`/`xhigh`/`max`)。 |
  | `${CLAUDE_SKILL_DIR}` | 此 `SKILL.md` 所在目錄;在 bash 注入中引用 bundled 腳本最穩(不受 CWD 影響)。 |

## 9. Skill 生命週期與 compaction

- 被觸發後,渲染好的 `SKILL.md` 以單一訊息進入對話並**留到 session 結束**;Claude Code **不會於後續輪重讀**。→ 寫成「整段任務適用的常規指示」,而非一次性步驟。
- Auto-compaction 會在摘要後重新附上「每個 skill 最近一次觸發」的前 5,000 tokens,共用 25,000 tokens 預算(從最近觸發者起算,舊的可能被丟棄)。
- 若 skill 似乎「失效」:內容通常還在,只是模型選了別的作法 ── 強化 `description`/指示,或改用 hooks 強制;大型 skill 可在 compaction 後重新觸發以還原全文。
- 觸發太頻繁 → `description` 寫更精確,或加 `disable-model-invocation: true`;不觸發 → 在 `description` 補使用者會說的關鍵詞,並確認它出現在「What skills are available?」。

## 10. Eval 驅動開發

**先寫 eval 再寫文件**,確保解決真實問題:
1. 沒有 skill 時讓 Claude 跑代表性任務,記錄失敗。
2. 針對缺口建 3 個情境 eval。
3. 量測無 skill 的 baseline。
4. 寫「剛好夠」的指示讓 eval 通過。
5. 疊代。

eval 結構範例(目前無內建執行器,可自建;`/skill-creator` 提供 eval/benchmark):
```json
{
  "skills": ["pdf-processing"],
  "query": "Extract all text from this PDF and save to output.txt",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "讀取 PDF",
    "抽出所有頁文字、不漏頁",
    "存成可讀的 output.txt"
  ]
}
```

**用 Claude A / Claude B 疊代**:Claude A(協助你寫/改 skill)↔ Claude B(載入 skill 實際做事)↔ 觀察 B 行為帶回 A 改進。跨 Haiku / Sonnet / Opus 測試(Haiku 需更多指引,Opus 別過度解釋)。

## 11. 最終 checklist

核心品質:
- [ ] `description` 具體、含關鍵詞,且寫了「做什麼 + 何時用」
- [ ] `SKILL.md` 本文 < 500 行;細節已拆附檔
- [ ] 無時效性內容(或放「舊作法」區塊);用語一致
- [ ] 範例具體;檔案引用只一層深;progressive disclosure 得當
- [ ] workflow 步驟清楚

程式/腳本:
- [ ] 腳本自行處理錯誤、無 voodoo constants、有文件
- [ ] 依賴已列出並確認可用;路徑全用正斜線
- [ ] 關鍵操作有驗證/feedback loop

測試:
- [ ] 至少 3 個 eval;跨 Haiku/Sonnet/Opus;真實情境測過

---

## 來源 (Sources)

- [Skill authoring best practices — Claude Docs](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices)
- [Extend Claude with skills — Claude Code Docs](https://code.claude.com/docs/en/skills)
- [anthropics/skills (GitHub)](https://github.com/anthropics/skills)
