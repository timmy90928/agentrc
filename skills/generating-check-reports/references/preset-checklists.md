# 內建起手 checklist 範本

幾組常用清單,供「沒有現成清單」時快速起手。**這些只是起點**——依實際目標增刪項目;使用者也可完全自帶清單。
每個檢查點對應一個 `items[]`(自填 `id` / `category` / `title`,檢查後判 `status` / `severity` / `evidence`)。

## A. 專案交付前檢查(project-delivery)

> 適合「這個 repo 可以交付 / 合併 / 發布了嗎」。

- **目錄結構**:`.gitignore` 含 `.claude/temp/`;無暫存 / 產物誤入版控;打算散布的子夾皆附 `README`。
- **文件**:`README` 結構樹與實際佈局一致(無 drift);`CLAUDE.md` 回指 `README`;每個 `SKILL.md` 本文 < 500 行。
- **Git 規範**:於非 `main`/`master` 分支工作;近期 commit 遵循 Conventional Commits;無大型二進位誤入。
- **安全**:無 hardcoded secrets / API key;`.env` / 憑證未進版控;破壞性操作均先確認。
- **建置 / 測試**:測試通過;lint / type-check 無誤;依賴可安裝。

## B. 文件完整性(doc-completeness)

> 適合審查文件齊備度與一致性。

- 必備檔存在:`README` / 安裝說明 / 使用說明 / 授權 (LICENSE)。
- 結構單一事實來源:詳本與門面擇一為正本、另一精簡並指向(避免兩份結構樹漂移)。
- 連結有效:內部相對連結、錨點、範例路徑可達。
- 範例可跑:文件中的指令 / 程式片段與現況一致。
- 術語一致:同一概念用同一個詞;中英對照齊全。

## C. 簡易資安(basic-security)

> 輕量自檢,非完整滲透測試。

- 無 hardcoded secrets / token / 私鑰(grep 常見樣式)。
- `.env`、金鑰、憑證未被版控追蹤;`.gitignore` 已涵蓋。
- 危險指令(`rm -rf`、`drop`/`truncate`、`push --force`)無未經確認的使用。
- 依賴無已知高風險漏洞(有 lockfile / audit 機制時)。
- 對外輸出 / log 不外洩敏感資訊。
- 權限最小化:對外服務、token scope、檔案權限合理。

---

**用法**:挑一組 → 把每個檢查點實際查證後填成 `items[]`(schema 見 `results-schema.md`)→ 跑 `render_report.py` 出報告。
混用多組或自增項目皆可;在報告 `checklist` 欄註明採用了哪份清單。
