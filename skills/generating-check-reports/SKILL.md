---
name: generating-check-reports
description: >-
  依「檢查清單 (checklist)」逐項檢查任意目標(codebase / 專案 / 文件 / 部署 / 交付物…),
  把結果整理成結構化 results JSON,再用內建 render script 產出一份精美的**單檔 HTML 檢查報告**
  (Tailwind CDN、淺主題、總覽/本次結果/歷史趨勢三分頁、單檔可攜)。
  內建「專案交付前 / 文件完整性 / 簡易資安」等起手清單,使用者也可完全自帶清單。
  重檢時**原地覆寫同一份報告**並累積歷史趨勢與「與上次差異(新修好/新壞掉/仍失敗)」,不再產生 v2/v3 散檔。
  只要使用者要「檢查、稽核、審查、check、audit、跑交付前檢查 / 合規檢查 / 健檢」,或要把檢查/稽核結果
  「做成報告 / 出一份檢查報告 / inspection report / compliance report」,就使用本 skill。
allowed-tools: Read, Write, Edit, Glob, Bash
---

# generating-check-reports

把「逐項檢查」變成一份可保存、可回看、可追蹤進度的**單檔 HTML 報告**。模型負責「跑檢查、產出結果 JSON」;`scripts/render_report.py`(確定性)負責「把 JSON 渲染成 HTML」——分工固定,輸出品質一致、可重跑、跨工具一致。

## 何時用

見上方 description。任何「依清單逐項檢查某對象並要一份報告」的需求都走這套。若使用者只要口頭結論、不需保存的交付物,可直接 inline 回覆,不必動用本 skill。

## 使用步驟 (Workflow)

1. **決定 checklist 來源**(模糊時先問,勿臆測):
   - 使用者**自帶**清單(貼上的條列、既有規範文件)→ 直接採用。
   - 從 `references/preset-checklists.md` 選一組**內建起手清單**(專案交付前 / 文件完整性 / 簡易資安)。
   - 依檢查目標**自行推導**合理清單(並在報告 `checklist` 欄註明來源)。
2. **決定檢查目標與範圍**:哪個 repo / 資料夾 / 檔案 / 服務;範圍多大。
3. **逐項檢查、蒐證**:對每個檢查點實際查證(讀檔、跑唯讀指令、grep…),為每項判定:
   - `status` ∈ `pass` / `fail` / `warn` / `na` / `info`;
   - `severity` ∈ `critical` / `high` / `medium` / `low` / `info`(僅 fail/warn 需在意);
   - `evidence`:具體證據(`file:line`、指令輸出摘要),**勿空泛**;
   - `recommendation`:未過項目給可執行建議;
   - `fix`(選用,**修正涉及改文字 / 設定 / 值時務必填**):精確指出**哪裡 (`where`)、什麼 (`what`)、改成什麼 (`from` → `to`)**。報告會渲染成醒目的 before → after,不要只留一句模糊建議。**論文 / 文件修改**等同字多次出現的場景,另補 `before` / `after` 前後文,報告會以「原文 / 改為」兩行把改動嵌進上下文高亮(見 `references/results-schema.md`)。
4. **組裝 results JSON**:依 `references/results-schema.md` 的 schema 寫出 `title / target / checklist / date / items[]`。
   **`date` 由你填入對話當下時間**(render script 不取系統時間);可只到日 `YYYY-MM-DD`,或細到分 `YYYY-MM-DD HH:MM`。**此字串也是歷史去重鍵**:同日多次重檢想各留一個趨勢點就帶上時間(不同時間戳→新增點;相同→覆寫)。
   **`model` 填你自己的 AI 模型名稱**(如 `Claude Opus 4.8`),會顯示在報告頁尾標明由哪個模型產生。
5. **渲染**(Windows 加 `PYTHONUTF8=1`):
   ```
   PYTHONUTF8=1 python skills/generating-check-reports/scripts/render_report.py <results.json> <out.html>
   ```
   script 會算計數/通過率、維護 `history[]`、算 `delta`,**寫回 results.json**(狀態正本)再輸出 HTML。
6. **存放**(報告類交付物 → 網頁):
   - 可保存 → 專案 `docs/<kebab-代稱>-check-report.html`(須 commit),狀態正本 `docs/<kebab-代稱>-check-report.results.json` 同放。
   - 一次性 → `.claude/temp/`。**嚴禁放專案根**。檔名英文 kebab-case + 任務代稱,勿用中文/空格。
7. **重檢同一目標**(關鍵——避免 v2/v3 散檔):**沿用同一組檔名**。更新 `results.json` 的 `items` 後重跑 step 5;script 自動覆寫 HTML、累積歷史趨勢與「與上次差異」。詳見〈版本管理〉。
8. **版控**:`commit` / `push` 僅使用者明確要求時;有意義工作先開新分支。

## 版本管理(同一目標只留一份報告)

- **穩定檔名 + 原地覆寫**:每個(目標 × checklist)固定對應一份 `…-check-report.html` 與旁邊的 `…-check-report.results.json`;重檢覆寫同檔,**不遞增檔名**。
- **歷史兩條路**:① 檔內——HTML「歷史趨勢」分頁顯示通過率走勢 +**逐次變更時間軸**(每個日期列出該次修好了什麼、又新發現什麼、哪些仍未解);② 版控——report 已 commit,任何舊版可由 git 還原 / diff。
- 同日重跑冪等:`history[]` 以日期為鍵,同日重渲染取代當日該筆(不重複長點);跨日才新增一點。

## 注意事項

- 路徑一律正斜線:`scripts/render_report.py`。
- 依賴:僅 Python 3 標準庫(`json` / `pathlib`),無需 `pip install`。
- render script 是「**執行**」(`Run …`)而非當參考讀。
- 報告日期來自 JSON `date`;script 不呼叫系統時間(確保可重跑、可重現)。
- 不要把金鑰 / `.env` 內容寫進 `evidence`;證據只放足以佐證的最小資訊。

## 報告內建功能(由模板提供,無需設定)

產出的 HTML 自帶這些互動,匯出後仍可用:

- **三分頁**:總覽 / 本次結果 / 歷史趨勢。
- **總覽增能**:選用 `intro` 介紹、通過率「較上次」變化 + 迷你走勢線、「需優先處理」(critical/high 失敗 + fix 一行)、嚴重度 / 分類 / 統計卡可點 → 跳到本次結果對應篩選。
- **檢查次數**:報頭顯示「第 N 次」、趨勢卡顯示「共 N 次檢查」(取自 `history` 累積筆數)。
- **逐項狀態起點**:每項顯示「自第 N 次(時間)起通過 / 未解決」(目前狀態的連續區間起點;≥2 次檢查才顯示)。
- **逐項迷你狀態軌**:每項一條歷次色塊(左舊→右新,本次有圈記),一眼看完該項 pass/warn/fail 演變。
- **本次新通過高亮**:本次才由未過轉綠的項目給淡綠底 + 「✨ 本次新通過」,呼應時間軸的「本次修好」。
- **淺 / 深主題切換**:右上角按鈕,記憶於 `localStorage`(預設淺色)。
- **列印 / 存 PDF**:右上角按鈕;列印時自動把三分頁攤平、隱藏工具列、強制淺色省墨。
- **離線可開**:全部 CSS / JS 內嵌、**不依賴任何 CDN**(字型走 Google Fonts,離線自動退回系統字)。
- **搜尋 + 篩選**:本次結果頁可依關鍵字 / 狀態過濾。
- **逐項勾選**:每項可打勾標記「已處理」,狀態存 `localStorage`(per-report),重開仍在。

## 檔案

- `scripts/render_report.py` — **執行**:results JSON → 單檔 HTML;並維護 `history[]` / `delta` 寫回 JSON。
- `assets/report-template.html` — 報告模板正本(單檔、**自帶 CSS/JS 零 CDN**、淺/深主題、列印友善、三分頁);含唯一佔位符 `"__REPORT_DATA__"`。
- `references/results-schema.md` — results JSON 結構、狀態/嚴重度列舉、通過率/verdict 計算規則 + 完整範例。
- `references/preset-checklists.md` — 內建起手清單(專案交付前 / 文件完整性 / 簡易資安)。
- `examples/sample-results.json` / `examples/sample-check-report.html` — 範例輸入與渲染成品(展示報告長相,可直接開啟)。

## 演進

- **改報告外觀 / 版面**:只改正本 `assets/report-template.html`(模板)或渲染欄位,**勿手改產出的 HTML**(會被下次 render 覆寫)。改完用 `examples/sample-results.json` 重跑 render 驗證三分頁。
- **改結果結構 / 計分規則**:同步 `scripts/render_report.py`、`references/results-schema.md` 與範例,三者勿漂移。
