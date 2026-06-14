---
name: timmy-web
description: >-
  產出「單檔 HTML + Tailwind CDN」網頁,可選 10 款策展風格——預設 = Timmy 招牌「編輯/手札風」(暖紙 + 深藏青 + 金棕、Noto Serif TC 襯線、雙線報頭);另有 薄荷柑橘、清爽扁平、毛玻璃、粉彩便當、鮮豔漸層、彩色雜誌、彩色藍圖、彩色 IDE、撞色粗野派。每款內建 淺/深/系統主題切換、繁中/English i18n、RWD 貼邊寬版、主色/背景設定、右下角浮動 AI 聊天助理(BYOK 自帶金鑰・Gemini/OpenAI/Claude)與一鍵匯出乾淨 HTML。涵蓋履歷、作品集、landing 行銷頁、部落格、活動、產品、文件、dashboard、HTML 報告。
  只要 Timmy 要求製作、設計、美化任何網頁/網站/landing/hero/儀表板/HTML 報告,或說「我的風格」「弄成我那種樣子」「像我之前那個網站」,就使用本 skill——即使他沒明講風格名稱。任何 Timmy 要的 HTML/前端畫面,優先用這套而非預設或通用樣式。
allowed-tools: Read, Write, Edit, Glob
---

# timmy-web

產出單檔 HTML 網頁(**Tailwind Play CDN + 內嵌 config + 少量 inline CSS/JS**),提供 **10 款策展風格**;**預設 = Timmy 招牌編輯/手札風**(暖紙底、襯線字、細線分層、深藏青 + 金棕)。10 款共用同一套主題引擎:**淺/深/系統 + i18n(繁中/EN)+ RWD 貼邊寬版 + 主色/背景 + 匯出乾淨 HTML**(引擎規格見 `references/theme-engine.md`)。

## 何時用

見上方 description。要點:Timmy 任何網頁/網站/landing/dashboard/HTML 報告需求,或提到「我的風格」,都走這套,不要用通用樣式。預設用編輯風,使用者可在風格實驗室改選其餘 9 款。

## 開始前:需求訪談 (intake)

產出任何網頁前,**先依 `web-spec.md` 的「## 問題」訪談使用者**(= 要做這個網頁的人 / 開發者,**不是 skill 作者**)。
- **訪談順序**:Q1 主題 → Q2 靜/動態 → Q3 深淺 → Q4 語言 → Q5 區塊(依 Q1 主題用對應子清單)→ Q6 功能 → Q7 內容 → Q8 輸出與技術棧 → Q9 部署 → Q10 AI 聊天助理(選用・預設啟用)。
- **風格 (Q11) 與主色/背景 (Q12) 留到最後**:不要一開始問;依「Q1 主題 + Q5 區塊 + Q6 功能 + Q7 內容」**主動建議 1–2 款風格與配色**給使用者確認/微調(**請使用者到線上風格實驗室 https://timmy-web-style.pages.dev/choose_style.html 即時預覽 10 款、調主色/背景並挑選喜歡的**;離線時退用本機 `examples/choose_style.html`)。
- **複製範本到目標專案再填**:skill 內 `web-spec.md` 是**乾淨範本,勿就地填寫**(避免污染正本)。把它複製成「正在做網頁的那個專案」的 `.claude/web-spec-<任務代稱>.md`(英文 kebab-case,如 `.claude/web-spec-portfolio.md`),再把對方的回答**勾選/填入該複本**(`- [x]` 選中、可複選;空白填文字)。一個專案做多個網頁就各存一份(檔名不同、不互相覆蓋)。
- 問完、於「決議摘要」彙整後,再依結果進入下方組裝流程產出。

## 組裝流程 (workflow)

1. **依選定風格起手**:複製 `examples/styles/<選定風格>.html`(預設 `00-editorial`)作為基礎。每款都已內含該風格視覺 + 完整引擎:Tailwind config、主題引擎(淺/深/系統)、i18n、RWD 貼邊寬版、設定面板(風格/主色/背景/模式/語言)、一鍵匯出乾淨 HTML。**不要從零手刻**。
2. **換成使用者內容**:把示範內容(登山手記)換成依 intake 決議的主題 + 區塊(Q5)/功能(Q6)/內容(Q7);改 `<title>`、報頭品牌、導覽。多語 (Q4) 則每個可見文字加 `data-i18n`(含行內 markup 用 `data-i18n-html`)並擴充該頁 `I18N` 字典。
3. **守住該款風格**:沿用該風格頁既有 tokens / 元件樣式延伸;**編輯風(預設)**的色票、招牌手法、Do/Don't 見 `references/design-system.md` 與 `references/components.md`。
4. **不要破壞引擎**:改內容時別動主題引擎 / 設定面板 / i18n / RWD 結構;深色色票與寬版規則見 `references/theme-engine.md`(尤其:Tailwind 透明度色用通道格式 `rgb(var(--x-rgb)/<alpha-value>)`、深色 `:root[data-mode="dark"]`、貼邊 `max-w-[1760px] + px-4 sm:px-6 lg:px-10`)。
5. **輸出**:用該頁設定面板的「**下載 HTML**」匯出單一自包含檔(自動剝除風格切換器與設定面板、保留內容 + 主題 + 分頁),或直接存檔。以任務命名,瀏覽器直接開,無需建置。

## 響應式與寬度(強制 RWD)

- **一律 RWD(硬性要求,不是選項)**:每個產出頁面都必須響應式 —— 手機 / 平板 / 桌機都能正常閱讀與操作(Tailwind 響應式斷點、彈性版面、圖文不溢出、可觸控)。
- **善用寬度、貼近邊緣**:寬螢幕要把內容**盡量撐滿、貼近視窗左右邊緣**,只留小 gutter(`px-4 sm:px-6 lg:px-10`,上限 `max-w-[1760px]`);**不要**用窄欄置中而兩側留大片空白。
- 小螢幕 gutter 收窄、版面自然堆疊;大螢幕內容寬展(必要時多欄)。長文可在寬容器內用適度行寬或多欄維持可讀性,但整體版面要貼邊、不浪費寬度。

## 十款風格 (styles)

`examples/styles/` 下,每款都是完整可用範本(該風格 + 引擎 + i18n + RWD + 面板 + 匯出):

- `00-editorial` 編輯手札(**預設・招牌**:暖紙 + 藏青 + 金棕襯線)、`g09-mintcitrus` 薄荷柑橘、`16-soft-flat` 清爽扁平、`11-glassmorphism` 毛玻璃、`14-pastel-bento` 粉彩便當、`15-gradient-pop` 鮮豔漸層、`04-modern-broadsheet` 彩色雜誌、`02-blueprint-grid` 彩色藍圖、`06-terminal-light` 彩色 IDE、`01-neo-brutalist` 撞色粗野派。
- 預覽/比較:**線上風格實驗室 → https://timmy-web-style.pages.dev/choose_style.html**(即時切 10 款 + 主色/背景並挑選;單款直連 `https://timmy-web-style.pages.dev/styles/<style>.html`,支援 `?accent=&bg=`)。離線退用本機 `examples/choose_style.html`(預設 `00-editorial`)。

## 編輯風(預設款)的不可動搖樣貌(摘要)

完整見 `references/design-system.md`。最關鍵:

- **色票**:暖紙 `paper#f4efe3` / 卡片 `surface#fbf8f1` / 墨 `ink#23201a` / 次要 `muted#6f6757` / 主色藏青 `accent#1d3557` / 金棕 `gold#9a7b4f` / 燒赭 `highlight#8a5224` / 墨綠 `done#3f6b3f` / 細線 `line#d9d0bd` / 警示 `warn#b23a2e`。
- **字體**:Noto Serif TC 襯線;內文 17px / line-height 1.85;標籤大寫 + 寬字距。
- **造形**:圓角 2px;**細線 > 陰影**;貼邊寬版(`max-w-[1760px]` + 小 gutter),長文以多欄/適度行寬維持可讀。
- **招牌**:雙線報頭、h2 下細線、導覽金色 active 底線、外框 pill、三欄數據盒、左色條 callout、金色頁尾飾線。

## 主題與使用者設定(10 款內建)

每款風格頁都內含設定面板與主題引擎,新頁自動具備,無需重寫(引擎契約見 `references/theme-engine.md`):

- **設定面板**(各款以自身視覺呈現):風格切換(10 款)、**主色 Accent**、**背景 Background**、**模式**(淺/深/系統)、**語言**(繁中/English)、**下載 HTML**(匯出乾淨自包含檔)。
- **主題引擎**:`--accent`/`--bg` 為 hex(其餘色由 `color-mix` 派生),`?accent=&bg=` 可外部覆寫;`<html data-mode>` 切淺/深(`system` 跟 OS);統一存 `localStorage['timmy-web-stylelab']`,含開畫前防閃白 (FOUC) 預載。深色 = 各款策展深色色票 `:root[data-mode="dark"]`。
- **i18n**:`data-i18n`(textContent)/`data-i18n-html`(含行內 markup)/`data-i18n-attr`(屬性)+ 內建 `I18N` 字典(共用內容 + 各款 chrome);切語言即時套用,記得重跑「JS 動態產生文字」的 render。
- **RWD 貼邊寬版**:`max-w-[1760px]` + `px-4 sm:px-6 lg:px-10`。
- 改色 / 深色換算 / 必踩坑見 `references/theme-engine.md`;編輯風視覺另見 `references/design-system.md`。

## AI 助理(浮動聊天 widget・10 款內建)

每款風格頁右下角內建一顆浮動 icon,點開即 AI 聊天面板;由共用引擎注入(改一處、10 款同步,無需逐頁手改)。

- **BYOK(Bring Your Own Key)**:使用者在面板 ⚙ 設定填自己的 API 金鑰,存 `localStorage['timmy-web-chat']`(**僅本機**),由**瀏覽器直接呼叫** LLM,不經任何中介伺服器。**嚴禁** hardcode 任何金鑰。
- **金鑰即驗證**:填金鑰**失焦當下**就打 list-models 確認金鑰可用(綠 ✓ / 紅 ✗)、載入該金鑰可用模型,並**存入金鑰**;按「儲存」再以一次最小生成請求確認並存模型(失敗顯示原因不存)。
- **開關**:右下角 FAB 即開關鈕,開啟時 icon 變 ✕、面板浮於其上;再點即關。
- **RWD**:桌機為右下浮動面板(寬 380、浮於 FAB 上方);**手機(≤480px)開啟時全螢幕**(滿版、去圓角、收起 FAB,靠 header ✕ 關;用 `inset:0` 避開 `100vh` 網址列破版)。
- **供應商**:預設 **Gemini**(`gemini-2.5-flash`);另支援 **OpenAI**(`gpt-4o-mini`)、**Claude / Anthropic**(`claude-sonnet-4-6`)。Anthropic 瀏覽器直呼需 `anthropic-dangerous-direct-browser-access: true` 標頭(引擎已帶)。
- **選模型(動態)**:填好金鑰後,模型下拉**自動向該供應商的 list-models API 抓取「該金鑰實際可用」的模型**(切供應商 / 改金鑰 / 按 ↻ 重抓);保留「自訂…」可手打任意 model id。
- **推薦問題**:由 AI 依「目前對話 + 本頁標題/標題列」生成 3 個追問,呈現為可點 chips(點一下即送出)。
  - **起手問題(cold start)**:金鑰驗證通過後自動備好第一組「依本頁內容」的起手問題,**快取進 localStorage(per-page)**;之後開啟即時顯示、不再花 API(換頁 / 換金鑰 / 手動 💡 才重生)。
  - **自動追問**:**預設開**——每次 AI 回覆後自動更新追問(每輪多一次 API;設定面板「自動推薦問題」開關可即時關閉省額度)。**尚無建議時**輸入框上方才顯示「💡 推薦問題」鈕;**有建議後該鈕隱藏**,改由問題 chips 後的「🔄 換一批」(最後一顆)重生一組。
- **可開關(per-page)**:**引擎預設全頁啟用**;某頁不要 chatbot 時,於該頁 `window.TW_CONFIG.chat = false` 即不注入(對應 `web-spec.md` Q10 選「不要」→ 產出時設此旗標)。
- **per-page build-time 設定(`TW_CONFIG.chat*`,皆選用)**:`chatStarters`(字串陣列・作者預設起手問題,設了就用作者的、免 API)、`chatAutoSuggest`(true/false・自動推薦預設)、`chatProvider`(gemini/openai/anthropic)、`chatModel`(預設模型)。對應 `web-spec.md` Q10;未設則用引擎預設(Gemini / 自動推薦開 / AI 生成起手問題)。其餘(`chatTitle`/`chatGreeting`/`chatSystem` 人設 /`chatScope` 整站)仍規劃中。
- **沿用主題**:配色取自該頁 `--accent` / `--bg` + `[data-mode]`,自動適配 10 款與淺/深;標籤走 i18n(`chat.*` key,繁中 / English)。
- **匯出**:下載乾淨 HTML 時**自動剝除**聊天 widget(視為預覽期工具,同設定面板);此剝除由引擎**集中處理**,不需逐頁改 export 邏輯。
- **改它**:屬共用引擎一部分 → 只改正本 `assets/tw-engine.js`(`chat.*` 字典 + widget IIFE)再跑 `sync_engine.py`;**勿逐頁手改**。新風格頁若用新的「下載」鈕 id,於引擎 `EXPORT_TRIGGERS` 補一個即可。

## 各頁型提示

- **Landing**:封面圖 → h1+lead → 三欄數據盒 → 左色條 callout(重點)→ 區段(h2 細線)→ 箭頭快速連結 → 頁尾。
- **多頁網站**:報頭/導覽/頁尾各頁一致,僅當前頁 active 不同。
- **Dashboard/工具**:數據盒 + 鍵值清單 (kv) + 表格 + 表單控制項 + sticky 子分頁。

## 檔案

- `examples/styles/` — **10 款風格頁**(每款 = 完整範本:風格 + 引擎 + i18n + RWD + 面板 + 匯出)。產出時從選定款起手。
- `examples/choose_style.html` — **風格實驗室**(本機版):一次預覽/切換 10 款 + 主色 + 背景(預設 `00-editorial`)。**線上版**(部署於 Cloudflare Pages):https://timmy-web-style.pages.dev/(挑選頁 `/choose_style.html`、單款 `/styles/<style>.html`)。
- `assets/tw-engine.js` — **共用引擎正本 (source of truth)**:10 款共用的 dark / i18n / store 引擎 **+ AI 聊天 widget**(pre-paint + main 兩段 + 共用 I18N 內容字典)。**改引擎只改這裡**。
- `scripts/sync_engine.py` — 把正本 inline 注入各頁標記區(`PYTHONUTF8=1 python skills/timmy-web/scripts/sync_engine.py`;加 `--check` 只驗不寫 / 冪等檢查)。改完正本**必跑**。
- `references/theme-engine.md` — **引擎契約**:dark + i18n + 貼邊寬版的共用規格與必踩坑(改任何風格頁前必讀)。
- `references/design-system.md` — 編輯風(預設款)tokens、原則、Do/Don't、如何演進。
- `references/components.md` — 編輯風元件片段。
- `assets/base-template.html` — 編輯風 named-token 版樣板(早期版,含版本紀錄 / .css 匯出;現產出以 `styles/00-editorial.html` 為主)。

## 演進

10 款持續調整。**改任何風格頁前先讀 `references/theme-engine.md`**。
- **改共用引擎(dark / i18n / store / 寬版邏輯)**:只改正本 `assets/tw-engine.js` → 跑 `PYTHONUTF8=1 python skills/timmy-web/scripts/sync_engine.py` → 10 頁同步(`--check` 驗冪等)。**切勿逐頁手改引擎**(會 drift)。各頁的 `window.TW_CONFIG`(預設色 / chrome 字典 / onApply 動態重繪)仍逐頁維護。
- 改**編輯風視覺**則同步 `design-system.md` / `components.md` / `styles/00-editorial.html`。
- 新增或改風格時,各頁風格切換清單與 `examples/choose_style.html` 一併更新,避免漂移。
