---
# 複製整個 template/ 到 skills/<your-skill-name>/ 後,把下列 name 改成與資料夾同名。
name: my-skill
# description 是「觸發關鍵」:第三人稱,寫清楚「做什麼 + 何時用(含使用者會說的關鍵詞)」。≤1024 字元。
description: <一句話描述此 skill 做什麼,以及何時該用>。範例:Extract text and tables from PDF files, fill forms, merge documents. Use when the user mentions PDFs, forms, or document extraction.
# ── 以下皆為選用 (optional);不需要就整行刪掉 ──
# when_to_use: 補充觸發語句或範例請求(會接在 description 後,計入清單字元上限)
# allowed-tools: Read, Grep            # 啟用此 skill 時免確認即可用的工具
# disable-model-invocation: true       # 只允許手動 /my-skill 觸發(有副作用的工作流建議開)
# user-invocable: false                # 只讓 Claude 自動載入,不出現在 / 選單
# argument-hint: [檔名]                # 自動完成時顯示的參數提示
# model: inherit                       # 此 skill 啟用時的模型;inherit = 沿用當前
# context: fork                        # 在子代理 (subagent) 隔離執行
# agent: Explore                       # 搭配 context: fork 指定子代理類型
# paths: "src/**/*.ts"                 # 僅在處理符合 glob 的檔案時自動載入
---

# My Skill

簡述用途(1–2 句)。Claude 已經很聰明 ── 只寫它「不知道的、本專案專屬的」知識,別解釋常識。

## 使用步驟 (Workflow)

1. 第一步……
2. 第二步……
3. 第三步……

<!-- 多步驟或高風險任務,可提供 checklist 讓 Claude 逐項勾選:
- [ ] Step 1: ...
- [ ] Step 2: ...
-->

## 注意事項

- 路徑一律用正斜線 (forward slashes):`scripts/run.py`,勿用反斜線。
- 需要的套件先列出並確認可用,別假設已安裝。
- 用語前後一致(同一概念固定用同一個詞)。

## 進階參考 (Progressive disclosure)

<!-- 細節拆到附檔,保持本文 < 500 行;連結只保持一層深 -->
- 詳細 API:見 `reference.md`
- 範例:見 `examples.md`
- 工具腳本:執行 `python scripts/run.py`(執行,不需讀入 context)
