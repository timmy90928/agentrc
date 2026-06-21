# generating-check-reports

依**檢查清單 (checklist)** 逐項檢查任意目標(codebase / 專案 / 文件 / 部署…),產出一份精美的**單檔 HTML 檢查報告**(Tailwind CDN、淺主題、總覽 / 本次結果 / 歷史趨勢三分頁、單檔可攜)。

> 📌 本檔是人看的門面;**完整 runtime 規格以正本 [`SKILL.md`](SKILL.md) 為準。**

## 特點

- **清單驅動・通用**:吃使用者自帶清單,或用內建起手清單(專案交付前 / 文件完整性 / 簡易資安),或依目標推導。
- **確定性渲染**:模型產出結果 JSON → `scripts/render_report.py` 注入模板出 HTML,品質一致、可重跑、跨工具一致。
- **不長 v2/v3**:每個目標固定一份報告,重檢**原地覆寫**,並累積**歷史趨勢**與**與上次差異**(新修好 / 新壞掉 / 仍失敗)。
- **單檔・零 CDN・可離線**:全部 CSS/JS 內嵌、不依賴外部資源,瀏覽器直接開、斷網也能看。
- **互動**:淺 / 深主題切換、列印 / 存 PDF(自動攤平三分頁)、關鍵字搜尋 + 狀態篩選、逐項勾選「已處理」(存 localStorage)。

## 結構

```
generating-check-reports/
├── SKILL.md                       # 正本:何時用 / workflow / 版本管理
├── README.md                      # 本檔(門面)
├── assets/report-template.html    # 報告模板正本(單檔 HTML + Tailwind、三分頁)
├── scripts/render_report.py       # results JSON → HTML;維護 history/delta
├── references/
│   ├── results-schema.md          # 結果 JSON schema + 計分 / verdict 規則
│   └── preset-checklists.md       # 內建起手清單
└── examples/
    ├── sample-results.json        # 範例輸入(含多次 run 歷史)
    └── sample-check-report.html   # 渲染成品(直接開啟看長相)
```

## 快速用法

```sh
# Windows 加 PYTHONUTF8=1
PYTHONUTF8=1 python skills/generating-check-reports/scripts/render_report.py <results.json> <out.html>
```

依 [`references/results-schema.md`](references/results-schema.md) 備妥 `results.json`,跑上列指令即得報告;重檢沿用同一組檔名即覆寫並累積歷史。先看 [`examples/sample-check-report.html`](examples/sample-check-report.html) 了解成品。

> 本 skill 為 [`agentrc`](../../README.md) 跨工具正本,須經 `install` 部署到各工具 `skills/` 才會被探索。
