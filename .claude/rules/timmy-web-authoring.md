---
paths:
  - "skills/timmy-web/**"
---
# timmy-web 開發守則 (authoring rules)

開發 / 編輯 `timmy-web` skill 時適用。產出網頁的「**執行期 (runtime)**」規格一律以 `SKILL.md` 與 `references/` 為準;本檔只記「**開發此 skill 時**」容易踩錯、且 SKILL.md 不會在開發階段載入的受眾分辨。

## 訪談問卷的受眾 = 終端使用者,不是 Timmy 本人
- `web-spec.md` 的「## 問題」(Q1–Q11)是設計給 **skill 執行時、問「要做這個網頁的那位使用者 / 開發者 (end-user)」** 的問卷,答案勾填進 `web-spec.md`。runtime 行為見 `SKILL.md`「開始前:需求訪談」段。
- **開發階段不要把這些問卷選項用 `AskUserQuestion` 直接彈給 Timmy。** 曾如此做被糾正:「這些選項是要問開發者,不是問我。」
- 一般「這個 skill 該怎麼開發 / 設計」的需求釐清,仍可正常問 Timmy;只有「網頁內容 / 版面 / 風格」這類 end-user 問卷不該拿來問作者 (author)。

## 通則 (general)
替任何 skill 建構「與 end-user 互動」的提示 / 問卷 / 流程時,受眾都是該 skill 的 end-user;作者階段只負責把問題與流程「**寫進 skill**」,不要把那些問題拿來問作者本人。
