# theme-engine.md — 風格頁共用引擎契約 (dark + i18n)

> **目的**:讓 `examples/styles/*.html` 的 **9(+1)款風格**全部支援 **淺/深/系統 (data-mode)** 與 **繁中/English (i18n)**,共用同一套引擎與同一個 localStorage store,同時保留各款既有的 `--accent`/`--bg`(hex)+ `color-mix` 調色機制。
> 本檔是逐款升級的**唯一規格**,每款都照此實作,確保一致。改任何風格頁前先讀本檔。
> **引擎正本**:此契約的實作已落為 `assets/tw-engine.js`(source of truth)。各頁的引擎是用 `scripts/sync_engine.py` 從正本 **inline 注入**的同步版(`<!-- TW-PREPAINT -->` / `<!-- TW-MAIN -->` 標記區)——**改引擎 = 改正本後跑 `PYTHONUTF8=1 python skills/timmy-web/scripts/sync_engine.py`**(`--check` 驗冪等),**勿逐頁手改引擎**。各頁只逐頁維護 `window.TW_CONFIG`(預設色 / `i18nChrome` / `onApply`)。本檔以下為設計/規格說明。

## 目錄
- [1. 不變量 (invariants)](#1-不變量)
- [2. 狀態與 store](#2-狀態與-store)
- [3. 深色 (dark) 機制 — 關鍵:inline --bg 處理](#3-深色機制)
- [4. 各款深色色票配方](#4-各款深色色票配方)
- [5. i18n 機制](#5-i18n-機制)
- [6. 設定面板要加的控制](#6-設定面板控制)
- [7. 共用引擎 JS(可貼）](#7-共用引擎-js)
- [8. 驗證清單](#8-驗證清單)
- [9. 編輯風(第 10 款)特例](#9-編輯風特例)
- [12. AI 助理(浮動聊天 widget)](#12-ai-助理浮動聊天-widget)

---

## 1. 不變量
- 單檔 HTML + Tailwind Play CDN,**無建置**;一切 inline。
- 既有 `--accent`/`--bg`(hex,可由 `?accent=&bg=`、面板色票、localStorage 覆寫)**保留不變**。
- 既有「9 款風格切換、下載 HTML export」**保留**。
- 升級**只新增** dark + i18n,**不得破壊**現有 light 外觀(light 模式截圖應與升級前一致)。

## 2. 狀態與 store
- **單一** localStorage key:`timmy-web-stylelab` = `{ style, accent, bg, mode, lang }`。
  - 既有頁面散用 `localStorage['accent']`/`['bg']` → 改為一律讀寫此單一 store(下方引擎已處理;舊鍵可順手移除)。
- `mode`:`'light' | 'dark' | 'system'`(預設 `'light'`)。
- `lang`:`'zh-Hant' | 'en'`(預設 `'zh-Hant'`)。
- URL:`?accent=&bg=`(hex)維持;**不**新增 mode/lang 到 URL(由 store 決定),避免複雜化。

## 3. 深色機制
`<html data-mode="light|dark">`(`system` 於執行期用 `matchMedia` 解析成 light/dark)。

**關鍵陷阱**:風格頁用 `documentElement.style.setProperty('--bg', hex)`(inline)設背景,inline specificity 最高,會**蓋過** `:root[data-mode="dark"]{ --bg:… }` 樣式規則。因此:

- **light**:引擎把使用者選的 `--bg`(hex)寫成 inline(現狀)。
- **dark**:引擎**移除** inline `--bg`(`el.style.removeProperty('--bg')`),改讓 CSS 規則 `:root[data-mode="dark"]{ --bg:<該款深色基底> }` 生效。
- `--accent`(hex)**兩個模式都保留** inline(主色不隨深淺變;若該色在深色下對比不足,於 `[data-mode="dark"]` 內**重定義由 accent 派生的文字/邊框變數**,而非改 `--accent` 本身)。
- **預載 (pre-paint)**:在 `<head>`、body 前先定 `data-mode`,且**只有 light 才寫 inline `--bg`**(dark 不寫),避免 FOUC 與背景閃爍。
- **背景色票 (bg swatches)**:定義為「**只調 light 模式底色**」;dark 一律用該款策展好的深色基底。面板上可標註或在 dark 時淡化 bg 區塊(P1 至少做到:dark 時點 bg 不破版)。

> 結論:**dark = 用該款專屬深色色票(CSS 規則);light = 用使用者 hex bg(inline)。** accent 兩模式皆套用。

## 4. 各款深色色票配方
每款在自己的 `:root{ … }`(light)之後,新增一段 `:root[data-mode="dark"]{ … }`,**逐一重定義**「原本假設淺底而以 `color-mix(... white/淺色 ...)` 派生」的變數,改為深色版:

配方原則:
1. `--bg` → 該款風格調性的**深色基底**(例:IDE 偏冷藍黑 `#14131c`、雜誌偏暖墨 `#1c1a17`、毛玻璃偏深霧 `#15171c`)。
2. 文字:原 `--ink`/`--text-*` → 改為淺色(`#e7e5f0` 類),`--muted` → 中淺灰。
3. 面板/卡片/表面(`--panel`/`--surface`/`--glass-*`)→ 由「mix 向 white」改成「mix 向深基底 + 微量 accent 染色」,確保層次。
4. 邊框/分隔 `--line` → 深色低對比(`#2b2a38` 類)。
5. 陰影 → 加深、降不透明度;發光感可改用 accent 低透明 glow。
6. `--accent` 不動;若 accent 當文字對比不足,於此段把 accent 文字變數 `color-mix(accent X%, #e7e5f0)` 提亮。

**IDE(06)範例骨架**(示意,實作以該頁實際變數清單為準):
```css
:root[data-mode="dark"]{
  --bg:#14131c; --surface:#17161f; --panel:#1b1a24; --line:#2b2a38;
  --ink:#e7e5f0; --muted:#a09db5;
  --accent-soft: color-mix(in srgb, var(--accent) 26%, transparent);
  --text-primary: color-mix(in srgb, var(--accent) 55%, #e7e5f0 45%);
  --text-secondary:#c9c6db; --text-muted:#8e8ba6;
  /* …把該頁所有『假設淺底』的派生變數補齊… */
}
```

> 品質要求:深色要**像精心設計的深色主題**,不是把淺色反相。對比達 WCAG AA 內文;accent 在深底上仍鮮明。

## 5. i18n 機制
- `<html lang="zh-Hant|en">`。
- **每個可見文字節點**包 `data-i18n="<key>"`;屬性(title/aria-label/placeholder)用 `data-i18n-attr="title:key, aria-label:key2"`(引擎支援見下)。
- 字典 `I18N = { 'zh-Hant': {...}, 'en': {...} }`:
  - **共用內容**(各款相同的登山示範 + 分頁 總覽/路線/裝備/隨筆 + 通用 UI)→ 收在共用區塊,**9 款共用同一份**(複製貼上即可,內容一致)。
  - **各款專屬 chrome**(IDE 的 File/Edit/EXPLORER、雜誌的報頭、終端提示等)→ 各自補 key。
- key 命名:`nav.*`(分頁)、`hero.*`、`stats.*`、`callout.*`、`quick.*`、`ui.*`(模式/語言/下載等)、`chrome.*`(該款外殼)。
- `applyI18n()`:換 `textContent`(及 `data-i18n-attr` 指定屬性);載入時與切語言時各跑一次。
- 缺 key 時保留原文(不可變空白)。

## 6. 設定面板控制
在每款**既有設定面板**內、accent/bg 附近,新增兩組控制,**用該款自身的視覺語言**呈現:
- **模式 Mode**:淺 / 深 / 系統 三段(`data-set-mode="light|dark|system"`)。
- **語言 Language**:中文 / English(`data-set-lang="zh-Hant|en"`)。
- 用 `aria-pressed` 標示當前值(引擎會同步)。
- IDE 款:做成 command-palette 列(同 STYLE/ACCENT 區塊風格);毛玻璃款:玻璃膠囊;雜誌款:報頭式分段……依款式。

## 7. 共用引擎 JS
兩段。**pre-paint** 放 `<head>`(body 前);**main** 放頁尾既有 script 區(與既有 setAccent/setBg 整合)。

**(a) pre-paint(避免 FOUC,放 `<head>`):**
```html
<script>
(function(){ try{
  var el=document.documentElement,
      s=JSON.parse(localStorage.getItem('timmy-web-stylelab')||'{}'),
      p=new URLSearchParams(location.search),
      m=s.mode||'light',
      dark=(m==='dark')||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
  el.dataset.mode=dark?'dark':'light';
  if(s.lang) el.lang=s.lang;
  if(s.accent) el.style.setProperty('--accent', s.accent);
  if(p.get('accent')) el.style.setProperty('--accent', p.get('accent'));
  // 只有 light 才寫 inline --bg;dark 留給 [data-mode=dark] 規則
  if(!dark){ var bg=p.get('bg')||s.bg; if(bg) el.style.setProperty('--bg', bg); }
}catch(e){} })();
</script>
```

**(b) main engine(放頁尾;與既有 accent/bg 邏輯整合):**
```js
(function(){
  var el=document.documentElement, KEY='timmy-web-stylelab';
  var store=load(); function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}}
  var mql=matchMedia('(prefers-color-scheme: dark)');
  function effDark(){var m=store.mode||'light';return m==='dark'||(m==='system'&&mql.matches);}

  // 取得使用者選的 light bg(供 light 還原)
  function userBg(){ return store.bg || (window.DEFAULT_BG||''); }

  function applyMode(){
    var dark=effDark(); el.dataset.mode=dark?'dark':'light';
    if(dark){ el.style.removeProperty('--bg'); }      // 讓 [data-mode=dark]{--bg} 生效
    else { var b=userBg(); if(b) el.style.setProperty('--bg', b); }
    mark('[data-set-mode]','setMode', store.mode||'light');
  }

  // i18n
  var I18N={ 'zh-Hant':{}, 'en':{} };  // ← 各頁填入(共用內容 + 該款 chrome)
  function lang(){ return store.lang||el.lang||'zh-Hant'; }
  function applyI18n(){
    var d=I18N[lang()]||I18N['zh-Hant'];
    document.querySelectorAll('[data-i18n]').forEach(function(n){
      var k=n.getAttribute('data-i18n'); if(d[k]!=null) n.textContent=d[k];
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function(n){
      n.getAttribute('data-i18n-attr').split(',').forEach(function(pair){
        var kv=pair.split(':'); var attr=kv[0].trim(), key=(kv[1]||'').trim();
        if(d[key]!=null) n.setAttribute(attr, d[key]);
      });
    });
    el.lang=lang(); mark('[data-set-lang]','setLang', lang());
  }
  function mark(sel,dk,val){ document.querySelectorAll(sel).forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset[dk]===val)); }); }

  document.addEventListener('click', function(e){
    var t=e.target.closest('[data-set-mode]'); if(t){ store.mode=t.dataset.setMode; save(); applyMode(); return; }
    var l=e.target.closest('[data-set-lang]'); if(l){ store.lang=l.dataset.setLang; save(); applyI18n(); return; }
  });
  mql.addEventListener('change', function(){ if((store.mode||'light')==='system') applyMode(); });

  // 對外:讓既有 setAccent/setBg 也寫進統一 store(於既有函式內呼叫 patchStore)
  window.patchStore=function(o){ Object.assign(store,o); save(); };

  applyMode(); applyI18n();
})();
```
> 整合既有 `setBg(hex)`:在其中加 `patchStore({bg:hex})`(並維持只在 light 模式即時可見);`setAccent(hex)` 加 `patchStore({accent:hex})`。`gotoStyle` 跨頁時 store 已含 mode/lang,新頁 pre-paint 會沿用。

## 8. 驗證清單(每款 Playwright 過一次)
1. console / pageerror **零錯誤**(light、dark 各測)。
2. **light 模式外觀與升級前一致**(對比升級前截圖,不可走樣)。
3. **dark**:`data-mode=dark` 時整頁深色、內文對比足、accent 仍鮮明、無殘留淺色區塊。
4. **accent/bg** 在 light 仍可換;dark 用該款深色基底(點 bg 不破版)。
5. **語言**:切 en → 所有 `data-i18n` 文字變英文;切回中文還原;持久化(reload 後保持)。
6. **system**:OS 深色時自動深色;切換 OS 主題即時跟隨。
7. **下載 HTML export**:仍可匯出;匯出檔保留目前 mode/lang 狀態且自身可運作。
8. 截圖留存:`light-zh`、`dark-zh`、`dark-en` 三張。

## 9. 編輯風特例
編輯風 base-template 已有 dark+i18n,但用的是 **named token**(`data-accent="navy"`/`data-bg="cream"` + `[data-mode=dark]` 派生),與 9 款的 **hex --accent/--bg** 機制不同。P2 處理:
- 將其落成 `styles/00-editorial.html`,key=`00-editorial`、名稱「編輯手札」,設為**預設**與首推。
- 對齊 store(`timmy-web-stylelab`)、設定面板結構、9+1 款風格切換清單(含自己)。
- 其 accent/bg 可保留 named-token 機制(它本就完整),但風格切換、mode/lang、export 行為要與其他款**對外一致**(同樣的 data-set-* 介面)。
- 細節到 P2 再定;P1 先把 9 款做完並驗證契約。

---

## 10. 試點驗證後的必修點(P1 fan-out 必讀)
IDE(06)試點已驗證契約並修掉以下坑。**每款都必踩,務必照辦**;並以 `examples/styles/06-terminal-light.html` 為**引擎與做法的範本**(其 pre-paint / main engine / `setBg` 守衛 / export 可直接複用,只改該款專屬部分)。

1. **Tailwind config 寫死 hex → 深色文字不會變(最常見、最隱性)。** 多數款的 `tailwind.config.theme.colors`(如 `ink/muted/surface`)是 hardcode,被 `text-ink`/`bg-surface` 等工具類大量使用。**動手前先做**:把 config 這些色改成 `var(--ink)` 等,並在 light `:root{}` 補上對應變數;深色段才重定義。先 grep 該款 `text-ink|text-muted|bg-surface|#[0-9A-Fa-f]{6}` 盤點。
2. **內容區 inline 寫死的淺色(callout/警示框 `style="background:#FFF…"`)在深色會殘留。** 一律改走變數,深色段重定義(例 `--callout-bg`)。
3. **色票「原色」用常數,別用 `getComputedStyle('--bg')`。** 深色載入時 computed `--bg` 是深色基底,會讓「原色」顆粒錯掉。每款定義 `window.DEFAULT_BG='<該款 light 出廠 bg>'`(及需要時 `DEFAULT_ACCENT`),light 還原與原色顆粒都用它。
4. **`setBg` 要加深色守衛**:`function setBg(hex){ patchStore({bg:hex}); if(!effDark()) el.style.setProperty('--bg',hex); … }` —— dark 時不可寫 inline `--bg`(否則蓋掉深色基底破版)。
5. **切語言後要重跑所有「JS 動態產生文字」的 render**:breadcrumb、JS 渲染的風格清單名稱、色票 aria-label 等不在 `data-i18n` 靜態節點內者,`applyI18n()` 末尾需呼叫它們重繪,否則切 en 殘留中文。
6. **export 三要點**:(a) `system` 先解析成具體 light/dark 寫進 `<html data-mode>`;(b) 動態文字(分頁 sym 等)烘成「當前語言字串」;(c) 注入的 `:root{--bg}` 只放 light bg,深色靠保留的 `:root[data-mode=dark]` 規則(specificity 較高)自然勝出。
7. **i18n 範圍**:`textContent` 與 `data-i18n-attr`(title/aria-label/placeholder)都要;`<title>` 也用 JS 依語言換。

**字典共用**:`I18N` 分兩塊——「共用內容」(`hero/stats/callout/quick/routes/gear/journal/nav/ui.*`)9 款**完全一致、直接複製**;只有 `chrome.*`(各款外殼)與 `style.name` 逐款改。以 06 的共用區塊為 canonical,避免翻譯漂移。

**面板視覺**:MODE/LANGUAGE 用各款自身語彙(06 = 命令列檔列;毛玻璃 = 玻璃膠囊;雜誌 = 報頭分段……);但 `data-set-mode`/`data-set-lang`/`aria-pressed` 介面 9 款一致,引擎不改。

---

## 11. 第二輪(9 款 fan-out)後的補充規則
9 款升級時普遍出現、§10 未完整涵蓋的坑,務必納入(P2 編輯風與日後維護同樣適用):

8. **Tailwind 透明度修飾 + `var()` 不相容(最常見,彩色款必踩)。** 把 config 色改成 `var(--x)`(rule 1)後,既有 `text-x/NN`、`bg-x/NN`、`bg-white/NN` 等**透明度修飾會靜默塌成純黑/失效**(不報錯,light 就壞)。正解:config 用**通道格式** `'rgb(var(--x-rgb) / <alpha-value>)'`,變數存 `--x-rgb: R G B`(light/dark 兩段都通道格式);CSS 直接引用處用 `rgb(var(--x-rgb))` 或 `rgb(var(--x-rgb)/.5)`。改 config 後先 grep `text-[\w-]+/\d+|bg-white/\d+` 盤點。
9. **含行內 markup 的可翻譯文字用 `data-i18n-html`(非 textContent)。** 標題含 `<br>`、內文含重點 `<span>`(雜誌報頭、漸層/粗野派大標、路線概要的彩色地名)若掛 `data-i18n` 會被 textContent 清掉 markup。引擎加 `data-i18n-html` 分支(innerHTML),字典用 `*_html` key;`applyI18n` 一併處理。**統一用 `data-i18n-html` 這個名稱**(勿各自發明)。
10. **token 雙重語意(實心塊 vs 文字)。** 若同一 token(如 brutalist 的 `ink`)既當「文字/邊框」(深色→淺)又當「實心深塊背景 `bg-ink`」(深色→維持深),深色段要 `[data-mode=dark] .bg-ink{background:<深黑>}` 單獨壓回,且塊上文字走恆淺色變數(如 `--cream-fixed`)。落在「維持鮮明的撞色塊」內、明寫 `text-ink` 的子孫也要 `[data-mode=dark] .<pop> .text-ink{color:<深>}` 壓回。
11. **export 補充(rule 6 續)**:(d) 匯出前**移除 clone `<html>` 的 inline style**(否則 pre-paint 寫入的 inline `--accent/--bg` 蓋過注入的 `:root`,配色錯亂);(e) 每款 tailwind config script 必須 `id="tw-config"`,export 以 id/src 身分白名單保留(CDN + `tw-config` + `tab-script`)。
12. **驗證注意**:Chromium 對 `color-mix()` 派生色的 `getComputedStyle` 可能回 `color(srgb r g b)`(0–1 浮點)而非 `rgb()`,斷言要相容兩格式。語言選擇鈕標籤「繁體中文 / English」刻意各自原文,非缺漏。

---

## 12. AI 助理(浮動聊天 widget)

右下角浮動 icon → 聊天面板,**BYOK(Bring Your Own Key)**:使用者自帶 API 金鑰、瀏覽器直呼 LLM。屬**共用引擎**一部分,落在正本 `assets/tw-engine.js` 的 `==TW-MAIN==` 段(緊接主引擎 IIFE 之後的第二個 IIFE),10 款由 `sync_engine.py` 一併注入 —— **勿逐頁手改**。

**不變量 / 設計要點**
1. **注入而非逐頁標記**:widget 的 `<style id="tw-chatbot-style">`(進 `<head>`)與容器 `<div id="tw-chatbot">`(進 `<body>`)由引擎 JS 在載入時建立;不依賴各頁 HTML 標記,故無需新增第三組 sync 標記。
2. **配色沿用主題**:只依賴兩個保證存在的 token `var(--accent)` / `var(--bg)`,其餘以 `color-mix` 派生;深淺靠 `:root[data-mode="dark"] #tw-chatbot{…}` 覆寫。CSS 用獨立命名空間 `twc-`,不污染頁面 / Tailwind。FAB 與使用者氣泡用該頁 accent → 自動適配 10 款。
3. **i18n**:標籤掛 `data-i18n` / `data-i18n-attr`,key 為 `chat.*`(收在共用 `I18N` 字典,繁中 + EN);widget 建好後呼叫一次 `window.__twApplyI18n()`(引擎首次 `applyI18n` 在 widget 建立前已跑),之後切語言由引擎既有流程自動重譯。
4. **持久化**:獨立 localStorage key `timmy-web-chat` = `{ provider, key, model, turns }`(**與主題 store `timmy-web-stylelab` 分開**);對話最多保留最近 40 turn。金鑰**僅存本機**,絕不 hardcode。
5. **供應商**(規格查證日 2026-06-13,皆瀏覽器直呼):
   - **Gemini**(預設,`gemini-2.5-flash`):`POST generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`,header `x-goog-api-key`;body `{systemInstruction,contents:[{role:user|model,parts:[{text}]}]}`;回 `candidates[0].content.parts[].text`。
   - **OpenAI**(`gpt-4o-mini`):`POST api.openai.com/v1/chat/completions`,`Authorization: Bearer`;回 `choices[0].message.content`。
   - **Anthropic**(`claude-sonnet-4-6`):`POST api.anthropic.com/v1/messages`,header `x-api-key` + `anthropic-version: 2023-06-01` + **`anthropic-dangerous-direct-browser-access: true`**(瀏覽器 CORS 必備);回 `content[].text`。
   - 模型欄可自訂;model 名稱會漂移,預設值僅起手。
   - **選模型(動態 list-models)**:各供應商另有 `list(key)` 抓「該金鑰可用模型」填下拉 —— Gemini `GET /v1beta/models`(篩 `supportedGenerationMethods`/`supportedActions` 含 `generateContent`、去 `models/` 前綴)、OpenAI `GET /v1/models`(篩 `^(gpt-|o1|o3|o4|chatgpt)`)、Anthropic `GET /v1/models`(同 messages 的三個標頭)。觸發:填金鑰(`change`)/ 切供應商 / 按 ↻ / 開設定;結果按 `provider|key` 快取避免重複請求;失敗或無金鑰時保留「自訂…」可手打。選到的 model 於**儲存時驗證並寫入** `state.model`。
6. **安全**:訊息氣泡一律用 `textContent`(非 innerHTML)寫入,避免模型輸出注入 HTML。
7. **匯出剝除(集中、零逐頁改)**:各頁「下載乾淨 HTML」同步 `cloneNode` live DOM;引擎在 `document` 上掛 **capture 階段** click listener,先於各頁 export handler 觸發,在 clone 前把 `#tw-chatbot` / `#tw-chatbot-style` 暫時卸下,於本輪事件結束後(`queueMicrotask`,paint 前)還原 → 匯出檔不含 widget、畫面不閃動。觸發鈕 id 集中於引擎常數 **`EXPORT_TRIGGERS`**(現含 `#downloadBtn,#download-html,#settings-download,#sp-download,[data-tw-export]`,涵蓋 10 款);新頁若用新 id,於此補一個。
8. **儲存即驗證 (validate-on-save)**:點「儲存」不直接存,先用填入的 provider/key/model 發一個最小請求(複用 `PROVIDERS[].send`,prompt `'Hi'`)驗證「金鑰 + 模型 + CORS」是否真的可用 —— **通過才寫 localStorage**(status 顯示綠 ✓、自動收合設定);**失敗顯示原因、不儲存**(紅字)。i18n key:`chat.validating` / `chat.valid` / `chat.invalid` / `chat.nokey_save`。
9. **FAB 即開關**:`data-act="toggle"`,開/關同一顆鈕;icon 由 `[data-open]` 在 💬 / ✕ 間 CSS 切換(`.twc-ic-open` / `.twc-ic-close`),桌機開啟時面板浮在 FAB 上方(`bottom:72px`)、FAB 不隱藏;`aria-label` 隨狀態在 `chat.open` / `chat.close` 切換。
10. **RWD**:桌機 = 右下浮動面板(寬 `min(380px,…)`、`bottom:72px` 浮於 FAB 上);**手機(`@media max-width:480px`)開啟全螢幕** —— `.twc-panel{position:fixed;inset:0;border-radius:0;border-width:0}` 滿版(用 `inset:0` 而非 `100vh`,避開行動瀏覽器網址列高度造成的破版/捲動),且 `[data-open="true"] .twc-fab{display:none}` 收起 FAB,改靠 header ✕(`data-act="close"`)關閉。
11. **推薦問題(suggested questions)**:面板「💡 推薦問題」鈕(`data-act="suggest"`)**點按才**觸發 —— 以 `pageContext()`(`document.title` + 前 6 個 h1/h2)+ 最近 6 turn 對話組 prompt,請 AI 生成「exactly 3」個追問;回覆按行 split、去前綴編號/符號後取前 3,渲染成 `.twc-chip` 可點鈕(點擊 = 填入並 `send()`)。送出 / 清除對話時 `clearChips()`。i18n:`chat.suggest` / `chat.suggesting`。只在點按時才呼叫 API(不自動追問)。
12. **可開關 (opt-out)**:widget IIFE 開頭檢查 `window.TW_CONFIG.chat === false` 則直接 `return` 不注入(預設 undefined → 啟用)。供 `web-spec.md` Q6 功能未勾選時,產出頁於 per-page `TW_CONFIG` 設 `chat:false` 停用;10 款示範頁皆預設啟用。

**驗證**(`.claude/temp/verify_chatbot.py`,Playwright file://,29 項):FAB 出現、開面板、無金鑰自動開設定、FAB 開啟時可見且顯示 ✕、動態載入模型清單(過濾非對話模型)、「自訂…」逃生口切換、儲存觸發驗證(mock 成功→存/失敗→不存)、選到的 model 寫入並用於送出、(mock fetch)送出渲染回覆、**「💡 推薦問題」生成 3 chips + 點 chip 送出 + 送出後清空**、FAB 切換開關、深色適配、EN i18n、手機全螢幕、匯出檔不含 widget 且還原 live、**`TW_CONFIG.chat=false` 不注入 widget**、console 零錯誤。
