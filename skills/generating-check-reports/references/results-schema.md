# results JSON schema(檢查結果結構)

`render_report.py` 的輸入 / 狀態正本。模型負責填 `title / target / checklist / date / items[]`;
`history[]`、`delta`、`summary` 由 render script 自動維護(首次可省略,勿手填)。

## 頂層欄位

| 欄位 | 必要 | 說明 |
| :-- | :-- | :-- |
| `title` | ✅ | 報告標題,如 `agentrc 交付前檢查`。 |
| `target` | ✅ | 檢查對象,如 `repo @ branch`、資料夾路徑、服務名。 |
| `checklist` | ✅ | 採用的清單名稱 / 來源(內建清單名、使用者自帶、或「依目標推導」)。 |
| `intro` | 選用 | 一段簡短介紹:這份報告在檢查什麼、範圍 / 背景(1–3 句)。顯示在總覽頂部。 |
| `date` | ✅ | 檢查時間戳,**由模型填對話當下時間**(script 不取系統時間)。可只到日 `YYYY-MM-DD`,或細到分 `YYYY-MM-DD HH:MM`(24 小時制)。**此字串同時是歷史去重鍵**:同字串重渲染→覆寫該筆;不同時間戳→新增一個歷史/趨勢點。故同日多次重檢想各自留點,就帶上時間。 |
| `verdict` | 選用 | 覆寫自動總評;留空則由 script/模板自動判定(見下)。 |
| `model` | 選用 | 產生此報告的 **AI 模型名稱**(如 `Claude Opus 4.8`),由模型填自己的名稱;顯示於頁尾。 |
| `items` | ✅ | 檢查項目陣列(非空),見下。 |
| `history` | 自動 | run 摘要陣列(script 維護;重檢累積,含各次 statuses 快照)。 |
| `delta` | 自動 | 最新一次相對上一次的逐項差異(script 計算)。 |
| `timeline` | 自動 | 逐次變更時間軸(每筆:該次相對前次的 fixed / new_issues / still_failing);僅注入 HTML,供歷史頁。 |
| `items[].since` | 自動 | 每項「目前狀態的連續區間起點」`{n, date}`(自第幾次、何時起);僅注入 HTML,本次結果頁顯示「自第 N 次(時間)起通過 / 未解決」。 |
| `items[].track` | 自動 | 每項歷次狀態序列(各次的 status,未列入該次為 `null`);僅注入 HTML,渲染成迷你狀態軌。 |
| `summary` | 自動 | 本次計數與通過率(script 計算)。 |

## `items[]` 每項

| 欄位 | 必要 | 說明 |
| :-- | :-- | :-- |
| `id` | ✅ | 穩定唯一識別碼(如 `git-1`)。**重檢務必沿用同一 id**,delta/歷史才對得上。 |
| `category` | ✅ | 分組用,如 `目錄結構` / `安全`。同 category 在報告中歸為一節。 |
| `title` | ✅ | 檢查點敘述(一句)。 |
| `status` | ✅ | `pass`(通過)/ `fail`(失敗)/ `warn`(提醒)/ `na`(不適用)/ `info`(僅參考)。 |
| `severity` | 建議 | `critical` / `high` / `medium` / `low` / `info`;主要供 fail/warn 排序與 verdict。 |
| `evidence` | 建議 | 具體證據:`file:line`、指令輸出摘要。**勿放金鑰 / `.env` 內容**。 |
| `recommendation` | 建議 | 未過項目的可執行修正建議(一句話的方向)。 |
| `fix` | 選用 | **修正涉及「改文字/設定」時填**:結構化指出哪裡、什麼、改成什麼。見下。 |

### `fix` 物件(精確的 before → after)

當某項的修正是「改某處文字 / 設定 / 值」,填 `fix` 讓報告明確標出**哪裡、什麼東西、改成什麼**(而非只給模糊建議)。報告會渲染成琥珀色「需修改」盒,並以紅刪除線 → 綠標出 before → after。

| 欄位 | 必要 | 說明 |
| :-- | :-- | :-- |
| `where` | 建議 | 位置:`file:line`、設定鍵、區塊名(如 `README.md:118`)。 |
| `what` | 建議 | 要改的東西(如「安裝指令的腳本路徑」)。 |
| `from` | 選用 | **被改的片段**(省略 = 新增)。保持精短,真正改動的字即可。 |
| `to` | 選用 | 改成的片段(省略 = 刪除)。 |
| `before` | 選用 | `from` **前面的上下文**字串。 |
| `after` | 選用 | `from` **後面的上下文**字串。 |

> **前後文規則(論文 / 文件修改場景)**:**只要被改的字前後還有其他文字(它是句子 / 行中的一段),就一定補 `before`/`after`。** 因為文中同樣的字常出現多次(如多個「18%」),只給 `from/to` 無法定位。補上後報告會渲染成 **原文 / 改為** 兩行,把改動的字嵌進上下文高亮——例如 `before:"A 組通過率為 "`、`from:"18%"`、`to:"20%"`、`after:",高於對照組"` → 原文「A 組通過率為 ~~18%~~,高於對照組」/ 改為「A 組通過率為 **20%**,高於對照組」。只有整行 / 整個值被替換、前後無其他字時才可省略。

## 計算規則(由 script / 模板執行)

- **通過率** `pass_rate = pass / (pass + fail + warn) × 100`,**排除 `na` / `info`**(無法評分項)。
- **自動 verdict**(未指定 `verdict` 時):
  - 有 `fail` 且其 severity 為 `critical`/`high` → **需修正**;
  - 否則有任何 `fail` → **有缺失**;
  - 否則有任何 `warn` → **大致通過**;
  - 全數通過 → **通過**。
- **delta**(對照上一筆 run 的逐項 status):
  - `fixed`:上次 fail/warn → 本次 pass;
  - `regressed`:上次 pass → 本次 fail/warn;
  - `still_failing`:上次與本次皆 fail/warn。
  - 新增項目(上次無此 id)不計入 delta。
- **history**:以 `date` 為鍵——同日重渲染取代當日該筆(冪等),跨日新增一筆。

## 最小範例

```json
{
  "title": "我的服務健檢",
  "target": "api-gateway @ prod",
  "checklist": "簡易資安",
  "date": "2026-06-21",
  "items": [
    { "id": "sec-1", "category": "安全", "title": "無 hardcoded secrets",
      "status": "pass", "severity": "critical", "evidence": "grep 無命中", "recommendation": "" },
    { "id": "sec-2", "category": "安全", "title": "TLS 憑證未過期",
      "status": "warn", "severity": "high", "evidence": "30 天內到期", "recommendation": "排程更新憑證" }
  ]
}
```

完整、含多次 run 歷史的範例見 `examples/sample-results.json`(及其渲染成品 `examples/sample-check-report.html`)。
