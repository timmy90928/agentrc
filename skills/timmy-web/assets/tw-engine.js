/* =========================================================================
 * tw-engine.js — timmy-web 風格頁「通用主題引擎」正本 (source of truth)
 * =========================================================================
 *
 * 本檔是「給人編輯」的單一正本。各風格頁 (examples/styles/*.html) 實際存的
 * 是「inline 後」的程式碼(file:// 不能 fetch 同層檔,故不能用 <script src>)。
 *
 * 流程:改本檔一處 → 跑 `PYTHONUTF8=1 python scripts/sync_engine.py`
 *      → 各頁標記區之間被換成最新內容。各頁始終為 inline、單檔自包含。
 *
 * 檔內含「兩段」,各以明確分隔註解標記,供 sync_engine.py 擷取:
 *
 *   /* ==TW-PREPAINT== * /  …  /* ==/TW-PREPAINT== * /
 *     通用 pre-paint。放各頁 <head>(CSS 之後、body 前)。讀 store + URL,
 *     設 data-mode/lang、inline accent、light 才 inline bg。無 per-page 設定。
 *
 *   /* ==TW-MAIN== * /  …  /* ==/TW-MAIN== * /
 *     主引擎。放各頁頁尾 per-page `<script>window.TW_CONFIG={…}</script>` 之後。
 *     共用 I18N 內容 + mode/i18n 引擎 + data-set-* 監聽 + twSetAccent/twSetBg。
 *     讀 window.TW_CONFIG 取 per-page 的 style/defaultAccent/defaultBg/
 *     i18nChrome/onApply。
 *
 * 契約細節見 references/theme-engine.md(尤其 §7 引擎、§10/§11 必踩坑)。
 * ========================================================================= */


/* ==TW-PREPAINT== */
/* 通用 pre-paint(theme-engine §7a / §10-6):body 前定 data-mode / lang / accent。
   只有 light 才寫 inline --bg(dark 留給 :root[data-mode=dark]{--bg} 規則,inline
   specificity 最高會蓋過規則)。讀統一 store timmy-web-stylelab + URL ?accent/bg。
   不需任何 per-page 設定 —— 9+1 款共用同一段。 */
(function(){ try{
  var el = document.documentElement,
      s  = JSON.parse(localStorage.getItem('timmy-web-stylelab') || '{}'),
      p  = new URLSearchParams(location.search),
      m  = s.mode || 'light',
      dark = (m === 'dark') || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  el.dataset.mode = dark ? 'dark' : 'light';
  if (s.lang) el.lang = s.lang;
  // hex 容錯:無 '#' 且非函式色(rgb()/color-mix())時補上 '#'
  function norm(c){ return (c.charAt(0) === '#' || c.indexOf('(') > -1) ? c : '#' + c; }
  var pa = p.get('accent');
  if (s.accent) el.style.setProperty('--accent', s.accent);  // accent 兩模式皆 inline
  if (pa)       el.style.setProperty('--accent', norm(pa));
  // 只有 light 才寫 inline --bg;dark 交給 :root[data-mode="dark"]{--bg} 規則
  if (!dark){ var bg = p.get('bg') || s.bg; if (bg) el.style.setProperty('--bg', norm(bg)); }
}catch(e){} })();
/* ==/TW-PREPAINT== */


/* ==TW-MAIN== */
/* 主引擎(theme-engine §7b / §10 / §11)。依賴 per-page 先定義 window.TW_CONFIG:
     {
       style:        '06-terminal-light',   // 本頁 key(= 同目錄 html 檔名,不含 .html)
       defaultAccent:'#5B6CF0',             // 出廠 accent(色票「原色」與 reset 用,不可 computed)
       defaultBg:    '#E7E1F7',             // 出廠 light bg(色票「原色」與 light 還原用)
       i18nChrome: { 'zh-Hant':{…}, 'en':{…} },  // 本款 chrome.* / style.name(覆寫/補進共用 I18N)
       onApply:      function(){…}          // 切語言/載入後要重繪的動態文字(breadcrumb、JS 風格清單、色票標籤…)
     }
   引擎對外提供:window.twSetAccent(hex) / window.twSetBg(hex)(含 dark 守衛)、
   window.patchStore(obj)、window.__twApplyMode / window.__twApplyI18n。
   各頁色票 / 風格切換 / reset handler 呼叫上述,勿自行重寫 store / mode 邏輯。 */
(function(){
  var el = document.documentElement, rootStyle = el.style;
  var KEY = 'timmy-web-stylelab';
  var mql = matchMedia('(prefers-color-scheme: dark)');
  var CFG = window.TW_CONFIG || (window.TW_CONFIG = {});

  /* ---- 統一 store(theme-engine §2)---- */
  function loadStore(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){ return {}; } }
  function saveStore(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }
  function patchStore(o){ var s = loadStore(); Object.assign(s, o); saveStore(s); }
  window.patchStore = patchStore;

  /* ---- 出廠值(來自 per-page;不可由 computed 讀,深色時 --bg 是深色基底)---- */
  function defAccent(){ return CFG.defaultAccent || '#000000'; }
  function defBg(){ return CFG.defaultBg || '#ffffff'; }

  /* ---- i18n 字典(theme-engine §5 / §10):共用內容 9 款一致;chrome.* / style.name 逐款由 i18nChrome 覆寫 ---- */
  var I18N = {
    'zh-Hant': {
      // 分頁 nav(breadcrumb / 狀態列 doc 用)
      'nav.overview':'總覽','nav.routes':'路線','nav.gear':'裝備','nav.journal':'隨筆',
      // hero / 共用內容
      'hero.kicker':'MOUNTAIN TRAILS · FIELD JOURNAL','hero.title':'高山縱走 2026 行記',
      'hero.lead':'三條經典稜線、十四日徒步——本手記彙整路線、補給與沿途隨筆。',
      // stats
      'stats.overview':'數據概覽','stats.season':'最佳季節',
      'stats.routes_label':'路線','stats.routes_sub':'條經典稜線',
      'stats.dist_label':'總里程','stats.dist_sub':'含接駁',
      'stats.days_label':'天數','stats.days_sub':'含整裝日',
      // callout 季節
      'callout.season_tag':'⚠ SEASON · 重點','callout.season_lead':'最佳季節',
      'callout.season_body':'7–9 月,避開梅雨與初雪;入秋後留意首波寒流。',
      'callout.season_full':'最佳季節 7–9 月,避開梅雨與初雪;入秋後留意首波寒流。',
      // quick links
      'quick.title':'快速前往','quick.routes':'路線詳解','quick.supply':'補給點地圖',
      'quick.weather':'天氣與水源','quick.permit':'申請與入山證',
      // routes 內容
      'routes.title':'路線','routes.summary_h':'路線概要',
      'routes.summary_p':'本季由北段奇萊連峰入山,沿主稜南下接能高安東軍,最後由南三段出能高越嶺道;全程多為高山箭竹與冷杉林,水源點集中於營地附近,需提前規劃補給。',
      'routes.daily_h':'每日重點','routes.col_seg':'區段','routes.col_focus':'重點',
      'routes.r1_seg':'D1–D3 奇萊主北','routes.r1_focus':'高度適應、看雲海日出',
      'routes.r2_seg':'D4–D7 能高安東軍','routes.r2_focus':'草原稜線、最長水線',
      'routes.r3_seg':'D8–D11 丹大林道','routes.r3_focus':'廢棄索道與獵徑',
      'routes.r4_seg':'D12–D14 能高越嶺','routes.r4_focus':'下山接駁、溫泉整裝',
      // gear 內容
      'gear.title':'裝備','gear.list_h':'裝備清單',
      'gear.i1':'60L 背包','gear.i2':'三季睡袋(-5°C)','gear.i3':'輕量帳','gear.i4':'濾水器',
      'gear.i5':'行動糧 5 日','gear.i6':'頭燈備用電池','gear.i7':'急救包','gear.i8':'離線地圖',
      // journal 內容
      'journal.title':'隨筆','journal.season_p':'最佳季節 7–9 月,避開梅雨與初雪;入秋後留意首波寒流。',
      // 通用 UI / 設定面板
      'ui.footer_note':'個人山徑手記 · 內容若有異動以現場與官方公告為準。',
      'ui.tabs_summary':'總覽 / 路線 / 裝備 / 隨筆',
      'ui.prompt_hint':'主題 · 主色 · 背景 · 模式 · 語言',
      'ui.sec_style':'STYLE · 風格','ui.sec_accent':'ACCENT · 主色','ui.sec_bg':'BACKGROUND · 背景色',
      'ui.sec_mode':'MODE · 模式','ui.sec_lang':'LANGUAGE · 語言','ui.sec_export':'EXPORT · 下載',
      'ui.bg_hint':'深色模式下以策展深色基底為準,背景色票僅作用於淺色',
      'ui.light':'淺色','ui.dark':'深色','ui.system':'跟隨系統',
      'ui.download':'下載 HTML','ui.export_title':'匯出目前頁面為自包含 HTML(固定目前配色與深色/語言)',
      'ui.export_hint':'匯出目前頁面為單一檔案,固定目前配色與深色/語言狀態,移除設定面板與設定 script,保留分頁切換與全部內容。',
      'ui.close':'關閉 (Esc)','ui.close_label':'關閉','ui.apply':'套用',
      // AI 助理(浮動聊天 widget・BYOK)
      'chat.open':'開啟 AI 助理','chat.title':'AI 助理','chat.close':'關閉','chat.settings':'設定','chat.clear':'清除對話',
      'chat.provider':'供應商','chat.apikey':'API 金鑰','chat.apikey_ph':'貼上你的 API 金鑰','chat.model':'模型',
      'chat.save':'儲存','chat.saved':'已儲存 ✓',
      'chat.keyhint':'BYOK:金鑰只存在本機瀏覽器 (localStorage),由瀏覽器直接呼叫 API,不會上傳到任何第三方伺服器。',
      'chat.needkey':'請先點右上 ⚙ 在設定填入 API 金鑰。',
      'chat.placeholder':'輸入訊息…(Enter 送出 / Shift+Enter 換行)','chat.send':'送出',
      'chat.greeting':'嗨!我是這個頁面的 AI 助理,有什麼想問的嗎?','chat.error':'發生錯誤:',
      'chat.validating':'驗證金鑰中…','chat.valid':'金鑰可用 ✓','chat.invalid':'金鑰無法使用:','chat.nokey_save':'請先填入 API 金鑰。',
      'chat.model_auto':'(填金鑰後自動載入清單)','chat.model_loading':'載入模型清單中…','chat.model_loadfail':'無法載入清單,可改用「自訂…」手動輸入','chat.model_custom':'自訂…','chat.model_custom_ph':'輸入 model id','chat.model_refresh':'重新載入模型',
      'chat.suggest':'💡 推薦問題','chat.suggesting':'生成中…','chat.autosuggest':'自動推薦問題','chat.keybad':'金鑰無法使用 ✗','chat.another':'🔄 換一批'
    },
    'en': {
      'nav.overview':'Overview','nav.routes':'Routes','nav.gear':'Gear','nav.journal':'Journal',
      'hero.kicker':'MOUNTAIN TRAILS · FIELD JOURNAL','hero.title':'High-Mountain Traverse 2026 Field Log',
      'hero.lead':'Three classic ridgelines, fourteen days on foot — this log gathers routes, resupply and trail notes.',
      'stats.overview':'At a Glance','stats.season':'Best Season',
      'stats.routes_label':'Routes','stats.routes_sub':'classic ridgelines',
      'stats.dist_label':'Distance','stats.dist_sub':'incl. shuttle',
      'stats.days_label':'Days','stats.days_sub':'incl. packing day',
      'callout.season_tag':'⚠ SEASON · KEY','callout.season_lead':'Best season',
      'callout.season_body':'Jul–Sep; avoid the plum rains and early snow, and watch for the first cold front in autumn.',
      'callout.season_full':'Best season Jul–Sep; avoid the plum rains and early snow, and watch for the first cold front in autumn.',
      'quick.title':'Quick Links','quick.routes':'Route details','quick.supply':'Resupply map',
      'quick.weather':'Weather & water','quick.permit':'Permits & entry',
      'routes.title':'Routes','routes.summary_h':'Route Overview',
      'routes.summary_p':'This season enters via the Qilai Range to the north, heads south along the main ridge to Nenggao-Andongjun, then exits the Nanthreesection by the Nenggao Crossing Trail; the route runs mostly through alpine arrow bamboo and fir forest, with water sources clustered near campsites — plan resupply ahead.',
      'routes.daily_h':'Daily Highlights','routes.col_seg':'Segment','routes.col_focus':'Highlights',
      'routes.r1_seg':'D1–D3 Qilai Main-North','routes.r1_focus':'Acclimatization, sea-of-clouds sunrise',
      'routes.r2_seg':'D4–D7 Nenggao-Andongjun','routes.r2_focus':'Grassland ridge, longest water leg',
      'routes.r3_seg':'D8–D11 Danda Forest Road','routes.r3_focus':'Abandoned cableway and hunting trails',
      'routes.r4_seg':'D12–D14 Nenggao Crossing','routes.r4_focus':'Descent shuttle, hot-spring resupply',
      'gear.title':'Gear','gear.list_h':'Gear Checklist',
      'gear.i1':'60L backpack','gear.i2':'3-season bag (-5°C)','gear.i3':'Lightweight tent','gear.i4':'Water filter',
      'gear.i5':'5 days of trail food','gear.i6':'Headlamp spare batteries','gear.i7':'First-aid kit','gear.i8':'Offline map',
      'journal.title':'Journal','journal.season_p':'Best season Jul–Sep; avoid the plum rains and early snow, and watch for the first cold front in autumn.',
      'ui.footer_note':'Personal trail journal · details subject to on-site and official notices.',
      'ui.tabs_summary':'Overview / Routes / Gear / Journal',
      'ui.prompt_hint':'theme · accent · background · mode · language',
      'ui.sec_style':'STYLE','ui.sec_accent':'ACCENT','ui.sec_bg':'BACKGROUND',
      'ui.sec_mode':'MODE','ui.sec_lang':'LANGUAGE','ui.sec_export':'EXPORT',
      'ui.bg_hint':'In dark mode the curated dark base is used; background swatches apply to light mode only.',
      'ui.light':'Light','ui.dark':'Dark','ui.system':'System',
      'ui.download':'Download HTML','ui.export_title':'Export this page as a self-contained HTML (fixes current colors, mode & language)',
      'ui.export_hint':'Export this page as a single file, fixing the current colors plus dark/language state, removing the settings panel and its scripts while keeping tab switching and all content.',
      'ui.close':'Close (Esc)','ui.close_label':'Close','ui.apply':'Apply',
      // AI assistant (floating chat widget · BYOK)
      'chat.open':'Open AI assistant','chat.title':'AI Assistant','chat.close':'Close','chat.settings':'Settings','chat.clear':'Clear chat',
      'chat.provider':'Provider','chat.apikey':'API key','chat.apikey_ph':'Paste your API key','chat.model':'Model',
      'chat.save':'Save','chat.saved':'Saved ✓',
      'chat.keyhint':'BYOK: your key stays in this browser (localStorage) and is called directly from the browser — never sent to any third-party server.',
      'chat.needkey':'Set your API key in settings ⚙ (top-right) first.',
      'chat.placeholder':'Type a message…  (Enter to send / Shift+Enter for newline)','chat.send':'Send',
      'chat.greeting':'Hi! I\'m the AI assistant for this page. Ask me anything.','chat.error':'Error: ',
      'chat.validating':'Verifying key…','chat.valid':'Key works ✓','chat.invalid':'Key not usable: ','chat.nokey_save':'Enter an API key first.',
      'chat.model_auto':'(enter key to auto-load list)','chat.model_loading':'Loading models…','chat.model_loadfail':'Could not load list — use “Custom…” to type one','chat.model_custom':'Custom…','chat.model_custom_ph':'Enter model id','chat.model_refresh':'Reload models',
      'chat.suggest':'💡 Suggest questions','chat.suggesting':'Generating…','chat.autosuggest':'Auto-suggest questions','chat.keybad':'Key not usable ✗','chat.another':'🔄 Another set'
    }
  };

  /* per-page chrome.* / style.name 併入(淺拷貝 merge,per-page 覆寫共用) */
  (function mergeChrome(){
    var c = CFG.i18nChrome || {};
    ['zh-Hant','en'].forEach(function(lng){
      if (c[lng]) for (var k in c[lng]) if (Object.prototype.hasOwnProperty.call(c[lng], k)) I18N[lng][k] = c[lng][k];
    });
  })();

  function curLang(){ var s = loadStore(); return s.lang || el.lang || 'zh-Hant'; }
  /* 對外查字典:缺 key 回中文,再缺回 key 本身(供 onApply 內動態文字用) */
  window.twT = function(key){ var d = I18N[curLang()] || I18N['zh-Hant']; return d[key] != null ? d[key] : (I18N['zh-Hant'][key] != null ? I18N['zh-Hant'][key] : key); };
  window.twLang = curLang;
  window.twI18n = I18N;

  /* ---- mode ---- */
  function effDark(){ var m = loadStore().mode || 'light'; return m === 'dark' || (m === 'system' && mql.matches); }
  function userBg(){ return loadStore().bg || defBg(); }
  window.twEffDark = effDark;

  function mark(sel, dataKey, val){
    document.querySelectorAll(sel).forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset[dataKey] === val)); });
  }

  function applyMode(){
    var dark = effDark(); el.dataset.mode = dark ? 'dark' : 'light';
    if (dark){ rootStyle.removeProperty('--bg'); }        // 讓 :root[data-mode=dark]{--bg} 生效
    else { var b = userBg(); if (b) rootStyle.setProperty('--bg', b); }
    var mv = document.getElementById('modeVal'); if (mv) mv.textContent = loadStore().mode || 'light';
    mark('[data-set-mode]', 'setMode', loadStore().mode || 'light');
  }
  window.__twApplyMode = applyMode;

  /* ---- i18n:textContent + data-i18n-html(innerHTML)+ data-i18n-attr(屬性) ---- */
  function applyI18n(){
    var d = I18N[curLang()] || I18N['zh-Hant'];
    document.querySelectorAll('[data-i18n]').forEach(function(n){
      var k = n.getAttribute('data-i18n'); if (d[k] != null) n.textContent = d[k];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function(n){
      var k = n.getAttribute('data-i18n-html'); if (d[k] != null) n.innerHTML = d[k];
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function(n){
      n.getAttribute('data-i18n-attr').split(',').forEach(function(pair){
        var kv = pair.split(':'), attr = (kv[0] || '').trim(), key = (kv[1] || '').trim();
        if (attr && d[key] != null) n.setAttribute(attr, d[key]);
      });
    });
    el.lang = curLang();
    var lv = document.getElementById('langVal'); if (lv) lv.textContent = curLang();
    mark('[data-set-lang]', 'setLang', curLang());
    // per-page 動態文字重繪(breadcrumb、JS 風格清單名、色票標籤、<title> 等)
    if (typeof CFG.onApply === 'function'){ try{ CFG.onApply(); }catch(e){} }
  }
  window.__twApplyI18n = applyI18n;

  /* ---- 對外:色票 / reset handler 呼叫(含 dark 守衛)---- */
  // accent:兩模式皆 inline 套用;同步 store + #accentVal 顯示
  window.twSetAccent = function(hex){
    rootStyle.setProperty('--accent', hex);
    patchStore({ accent: hex });
    var v = document.getElementById('accentVal'); if (v) v.textContent = (hex || '').toUpperCase();
  };
  // bg:只有 light 才 inline(dark 交給 :root[data-mode=dark]{--bg};寫 inline 會破版);同步 store + #bgVal
  window.twSetBg = function(hex){
    patchStore({ bg: hex });
    if (!effDark()) rootStyle.setProperty('--bg', hex);
    var v = document.getElementById('bgVal'); if (v) v.textContent = (hex || '').toUpperCase();
  };

  /* ---- 事件:模式 / 語言切換;系統主題跟隨 ---- */
  document.addEventListener('click', function(e){
    var tm = e.target.closest('[data-set-mode]'); if (tm){ patchStore({ mode: tm.dataset.setMode }); applyMode(); return; }
    var tl = e.target.closest('[data-set-lang]'); if (tl){ patchStore({ lang: tl.dataset.setLang }); applyI18n(); return; }
  });
  mql.addEventListener('change', function(){ if ((loadStore().mode || 'light') === 'system') applyMode(); });

  /* ---- 初始套用 ---- */
  applyMode();
  applyI18n();
})();


/* =========================================================================
 * timmy-web AI 助理 —— 右下角浮動聊天 widget(BYOK・瀏覽器直呼)
 * -------------------------------------------------------------------------
 * 形態:右下角浮動 icon → 開啟聊天面板。10 款風格頁皆由本引擎注入,無需逐頁手改。
 * BYOK(Bring Your Own Key):使用者在設定 ⚙ 貼自己的 API 金鑰,存
 *   localStorage['timmy-web-chat'](僅本機),由瀏覽器直接 fetch LLM —— 不經任何中介。
 * 供應商:預設 Gemini;另支援 OpenAI、Claude(Anthropic)。模型可自訂。
 * 配色:沿用各頁 var(--accent) / var(--bg) + [data-mode] 深淺,自動適配 10 款。
 * 匯出:下載乾淨 HTML 時自動剝除(視為預覽期工具,如設定面板)——由本段集中處理,
 *       不依賴各頁 export 邏輯(各頁 export 觸發 id 不一,見下方 EXPORT_TRIGGERS)。
 * 引擎契約見 references/theme-engine.md。
 * ========================================================================= */
(function(){
  if (window.__twChatInit) return; window.__twChatInit = true;
  // 該頁可停用 AI 助理:per-page 設 window.TW_CONFIG.chat = false 即不注入(web-spec.md Q10 選「不要」時用)。預設啟用。
  if (window.TW_CONFIG && window.TW_CONFIG.chat === false) return;
  // per-page build-time 設定(web-spec.md Q10):chatStarters(字串陣列・作者預設起手問題)、
  //   chatAutoSuggest(bool・自動推薦預設)、chatProvider / chatModel(預設供應商 / 模型)。皆選用,未設則用引擎預設。
  var CFG = window.TW_CONFIG || {};
  var T = function(k){ return window.twT ? window.twT(k) : k; };
  var CKEY = 'timmy-web-chat';
  // 各風格頁的「下載乾淨 HTML」觸發鈕 id(集中於此,新頁若用新 id 在此補一個即可)
  var EXPORT_TRIGGERS = '#downloadBtn,#download-html,#settings-download,#sp-download,[data-tw-export]';

  /* ---- 持久化:provider / key / model / 對話 turns ---- */
  function load(){ try{ return JSON.parse(localStorage.getItem(CKEY)) || {}; }catch(e){ return {}; } }
  function save(){ try{ localStorage.setItem(CKEY, JSON.stringify(state)); }catch(e){} }
  var state = load();
  state.provider = state.provider || CFG.chatProvider || 'gemini';        // build-time 預設供應商(curProv 仍會把無效值回退 gemini)
  state.turns = Array.isArray(state.turns) ? state.turns : [];
  if (!state.model && CFG.chatModel) state.model = CFG.chatModel;          // build-time 預設模型
  if (typeof state.autosuggest !== 'boolean') state.autosuggest = (typeof CFG.chatAutoSuggest === 'boolean') ? CFG.chatAutoSuggest : true;  // build-time 自動推薦預設(否則開)

  /* ---- 供應商(BYOK,瀏覽器直呼;規格查證日 2026-06-13)---- */
  var SYS = "You are a helpful, concise AI assistant embedded in a web page built with timmy-web. Reply in the user's language. Keep answers focused; use light Markdown.";
  function readJson(r){
    return r.json().catch(function(){ return {}; }).then(function(d){
      if (!r.ok){ var m = d && d.error && (d.error.message || d.error); throw new Error((typeof m === 'string' ? m : null) || ('HTTP ' + r.status)); }
      return d;
    });
  }
  var PROVIDERS = {
    gemini: {
      label: 'Gemini', model: 'gemini-2.5-flash',
      send: function(key, model, turns){
        var body = {
          systemInstruction: { parts: [{ text: SYS }] },
          contents: turns.map(function(m){ return { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }; })
        };
        return fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent',
          { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) })
          .then(readJson).then(function(d){
            var c = d.candidates && d.candidates[0], ps = (c && c.content && c.content.parts) || [];
            return ps.map(function(p){ return p.text || ''; }).join('').trim();
          });
      },
      list: function(key){
        return fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000',
          { headers: { 'x-goog-api-key': key } }).then(readJson).then(function(d){
          return (d.models || []).filter(function(m){ return (m.supportedGenerationMethods || m.supportedActions || []).indexOf('generateContent') > -1; })
            .map(function(m){ return (m.name || '').replace(/^models\//, ''); }).filter(Boolean);
        });
      }
    },
    openai: {
      label: 'OpenAI', model: 'gpt-4o-mini',
      send: function(key, model, turns){
        var msgs = [{ role: 'system', content: SYS }].concat(turns.map(function(m){ return { role: m.role, content: m.content }; }));
        return fetch('https://api.openai.com/v1/chat/completions',
          { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key }, body: JSON.stringify({ model: model, messages: msgs }) })
          .then(readJson).then(function(d){
            return (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || '').trim();
          });
      },
      list: function(key){
        return fetch('https://api.openai.com/v1/models', { headers: { 'Authorization': 'Bearer ' + key } })
          .then(readJson).then(function(d){
          return (d.data || []).map(function(m){ return m.id; })
            .filter(function(id){ return /^(gpt-|o1|o3|o4|chatgpt)/.test(id); }).sort();
        });
      }
    },
    anthropic: {
      label: 'Claude', model: 'claude-sonnet-4-6',
      send: function(key, model, turns){
        var body = { model: model, max_tokens: 1024, system: SYS, messages: turns.map(function(m){ return { role: m.role, content: m.content }; }) };
        return fetch('https://api.anthropic.com/v1/messages',
          { method: 'POST', headers: {
              'Content-Type': 'application/json', 'x-api-key': key,
              'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true'
            }, body: JSON.stringify(body) })
          .then(readJson).then(function(d){
            return (d.content || []).map(function(b){ return b.text || ''; }).join('').trim();
          });
      },
      list: function(key){
        return fetch('https://api.anthropic.com/v1/models?limit=1000', { headers: {
            'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true'
          } }).then(readJson).then(function(d){ return (d.data || []).map(function(m){ return m.id; }); });
      }
    }
  };
  function curProv(){ return PROVIDERS[state.provider] ? state.provider : 'gemini'; }

  /* ---- 樣式(沿用頁面 --accent / --bg;深淺由 [data-mode] 切;色獨立命名空間 twc-)---- */
  var CSS = [
    '#tw-chatbot,#tw-chatbot *{box-sizing:border-box}',
    '#tw-chatbot{position:fixed;z-index:2147483000;right:18px;bottom:18px;',
      'font-family:ui-sans-serif,system-ui,-apple-system,"Noto Sans TC","Segoe UI",sans-serif;font-size:14px;line-height:1.55;',
      '--twc-accent:var(--accent,#1d3557);--twc-ink:#22262e;--twc-soft:#646b78;',
      '--twc-panel:#fff;--twc-head:color-mix(in srgb,var(--accent,#1d3557) 9%,#fff);',
      '--twc-line:color-mix(in srgb,var(--accent,#1d3557) 16%,#e6e7ea);',
      '--twc-bot:color-mix(in srgb,var(--accent,#1d3557) 7%,#f1f2f4);--twc-field:#fff}',
    ':root[data-mode="dark"] #tw-chatbot{--twc-ink:#e9eaef;--twc-soft:#a8adba;',
      '--twc-panel:color-mix(in srgb,var(--bg,#14131c) 74%,#fff 6%);',
      '--twc-head:color-mix(in srgb,var(--bg,#14131c) 56%,#fff 9%);',
      '--twc-line:color-mix(in srgb,#fff 14%,transparent);',
      '--twc-bot:color-mix(in srgb,var(--accent,#5b6cf0) 17%,#1b1d25);',
      '--twc-field:color-mix(in srgb,var(--bg,#14131c) 60%,#fff 6%)}',
    '.twc-fab{width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;background:var(--twc-accent);color:#fff;',
      'display:grid;place-items:center;box-shadow:0 10px 26px rgba(0,0,0,.26);transition:transform .15s,box-shadow .15s}',
    '.twc-fab:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(0,0,0,.32)}',
    '.twc-fab svg{width:26px;height:26px}',
    '.twc-fab .twc-ic{display:grid;place-items:center}',
    '#tw-chatbot[data-open="true"] .twc-ic-open{display:none}',
    '#tw-chatbot[data-open="false"] .twc-ic-close{display:none}',
    '.twc-panel{position:absolute;right:0;bottom:72px;width:min(380px,calc(100vw - 36px));height:min(560px,calc(100vh - 108px));',
      'display:none;flex-direction:column;background:var(--twc-panel);color:var(--twc-ink);border:1px solid var(--twc-line);',
      'border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.30)}',
    '#tw-chatbot[data-open="true"] .twc-panel{display:flex}',
    '.twc-head{display:flex;align-items:center;gap:8px;padding:12px 14px;background:var(--twc-head);border-bottom:1px solid var(--twc-line)}',
    '.twc-dot{width:9px;height:9px;border-radius:50%;background:var(--twc-accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--twc-accent) 22%,transparent)}',
    '.twc-title{font-weight:700;letter-spacing:.01em}',
    '.twc-sp{margin-left:auto}',
    '.twc-ib{width:30px;height:30px;border:0;border-radius:9px;cursor:pointer;background:transparent;color:var(--twc-soft);display:grid;place-items:center}',
    '.twc-ib:hover{background:color-mix(in srgb,var(--twc-accent) 12%,transparent);color:var(--twc-ink)}',
    '.twc-ib svg{width:18px;height:18px}',
    '.twc-settings{display:none;flex-direction:column;gap:9px;padding:13px 14px;background:var(--twc-head);border-bottom:1px solid var(--twc-line)}',
    '#tw-chatbot[data-settings="true"] .twc-settings{display:flex}',
    '.twc-settings label{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--twc-soft);display:block;margin-bottom:4px}',
    '.twc-settings select,.twc-settings input{width:100%;padding:8px 10px;border:1px solid var(--twc-line);border-radius:9px;background:var(--twc-field);color:var(--twc-ink);font:inherit;outline:none}',
    '.twc-settings select:focus,.twc-settings input:focus{border-color:var(--twc-accent)}',
    '.twc-hint{font-size:11px;color:var(--twc-soft);line-height:1.5;margin:0}',
    '.twc-check{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--twc-ink);cursor:pointer}',
    '.twc-settings input[type=checkbox]{width:auto;flex:none;margin:0;accent-color:var(--twc-accent);cursor:pointer}',
    '.twc-modelrow{display:flex;gap:8px;align-items:stretch}',
    '.twc-modelrow .twc-model-sel{flex:1;min-width:0}',
    '.twc-mrefresh{flex:none;width:38px;border:1px solid var(--twc-line);border-radius:9px;background:var(--twc-field);color:var(--twc-soft);cursor:pointer;display:grid;place-items:center}',
    '.twc-mrefresh:hover{color:var(--twc-ink);border-color:var(--twc-accent)}',
    '.twc-mrefresh:disabled{opacity:.5;cursor:default}',
    '.twc-mrefresh svg{width:16px;height:16px}',
    '.twc-settings .twc-model{margin-top:8px}',
    '.twc-hide{display:none}',
    '.twc-mnote{margin:6px 0 0;font-size:11px;color:var(--twc-soft);line-height:1.45}',
    '.twc-saverow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
    '.twc-save{padding:7px 18px;border:0;border-radius:9px;background:var(--twc-accent);color:#fff;font-weight:700;cursor:pointer;font:inherit}',
    '.twc-save:disabled{opacity:.6;cursor:default}',
    '.twc-status{font-size:11px;font-weight:600;line-height:1.4}',
    '.twc-status.ok{color:#2e9e4f}.twc-status.err{color:#d9534f}',
    '.twc-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}',
    '.twc-msg{max-width:84%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere}',
    '.twc-bot{align-self:flex-start;background:var(--twc-bot);color:var(--twc-ink);border-bottom-left-radius:5px}',
    '.twc-user{align-self:flex-end;background:var(--twc-accent);color:#fff;border-bottom-right-radius:5px}',
    '.twc-err{align-self:flex-start;background:color-mix(in srgb,#d23a2e 14%,var(--twc-panel));color:#c02a1e;border:1px solid color-mix(in srgb,#d23a2e 38%,transparent)}',
    '.twc-typing{display:inline-flex;gap:4px;padding:2px 0}',
    '.twc-typing i{width:6px;height:6px;border-radius:50%;background:var(--twc-soft);animation:twcblink 1s infinite}',
    '.twc-typing i:nth-child(2){animation-delay:.15s}.twc-typing i:nth-child(3){animation-delay:.3s}',
    '@keyframes twcblink{0%,80%,100%{opacity:.25}40%{opacity:1}}',
    '.twc-form{display:flex;gap:8px;padding:10px;border-top:1px solid var(--twc-line);align-items:flex-end}',
    '.twc-input{flex:1;resize:none;max-height:120px;min-height:40px;padding:9px 11px;border:1px solid var(--twc-line);border-radius:11px;background:var(--twc-field);color:var(--twc-ink);font:inherit;outline:none}',
    '.twc-input:focus{border-color:var(--twc-accent)}',
    '.twc-send{width:40px;height:40px;border:0;border-radius:11px;cursor:pointer;background:var(--twc-accent);color:#fff;display:grid;place-items:center;flex:none}',
    '.twc-send:disabled{opacity:.5;cursor:default}.twc-send svg{width:18px;height:18px}',
    '.twc-sugbar{display:flex;padding:8px 10px 0}',
    '.twc-sug{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid var(--twc-line);border-radius:999px;background:color-mix(in srgb,var(--twc-accent) 8%,var(--twc-panel));color:var(--twc-accent);font:inherit;font-weight:600;font-size:12px;cursor:pointer}',
    '.twc-sug:hover{background:color-mix(in srgb,var(--twc-accent) 16%,var(--twc-panel))}',
    '.twc-sug:disabled{opacity:.6;cursor:default}',
    '.twc-chips{display:none;flex-wrap:wrap;gap:6px;padding:8px 10px 0}',
    '.twc-chip{text-align:left;padding:7px 11px;border:1px solid var(--twc-line);border-radius:12px;background:var(--twc-panel);color:var(--twc-ink);font:inherit;font-size:12.5px;line-height:1.4;cursor:pointer;max-width:100%}',
    '.twc-chip:hover{border-color:var(--twc-accent);background:color-mix(in srgb,var(--twc-accent) 7%,var(--twc-panel))}',
    '.twc-more{align-self:flex-start;padding:7px 12px;border:1px solid var(--twc-accent);border-radius:12px;background:color-mix(in srgb,var(--twc-accent) 10%,var(--twc-panel));color:var(--twc-accent);font:inherit;font-size:12.5px;font-weight:600;cursor:pointer}',
    '.twc-more:hover{background:color-mix(in srgb,var(--twc-accent) 18%,var(--twc-panel))}',
    '@media (max-width:480px){#tw-chatbot{right:12px;bottom:12px}',
    '#tw-chatbot[data-open="true"] .twc-fab{display:none}',          /* 手機全螢幕:收起 FAB,靠 header ✕ 關 */
    '.twc-panel{position:fixed;inset:0;width:auto;height:auto;border-radius:0;border-width:0}}'   /* inset:0 滿版,避開 100vh 網址列破版 */
  ].join('');

  /* ---- 圖示 ---- */
  var I = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    clear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>'
  };

  var HTML =
    '<button class="twc-fab" type="button" data-act="toggle" data-i18n-attr="aria-label:chat.open" aria-label="Open AI assistant">' +
      '<span class="twc-ic twc-ic-open">' + I.chat + '</span><span class="twc-ic twc-ic-close">' + I.close + '</span></button>' +
    '<div class="twc-panel" role="dialog" aria-modal="false" data-i18n-attr="aria-label:chat.title" aria-label="AI Assistant">' +
      '<div class="twc-head">' +
        '<span class="twc-dot"></span>' +
        '<span class="twc-title" data-i18n="chat.title">AI 助理</span>' +
        '<button class="twc-ib twc-sp" type="button" data-act="settings" data-i18n-attr="aria-label:chat.settings" aria-label="Settings">' + I.gear + '</button>' +
        '<button class="twc-ib" type="button" data-act="clear" data-i18n-attr="aria-label:chat.clear" aria-label="Clear chat">' + I.clear + '</button>' +
        '<button class="twc-ib" type="button" data-act="close" data-i18n-attr="aria-label:chat.close" aria-label="Close">' + I.close + '</button>' +
      '</div>' +
      '<div class="twc-settings">' +
        '<div><label data-i18n="chat.provider">供應商</label>' +
          '<select class="twc-provider">' +
            '<option value="gemini">Gemini</option><option value="openai">OpenAI</option><option value="anthropic">Claude (Anthropic)</option>' +
          '</select></div>' +
        '<div><label data-i18n="chat.apikey">API 金鑰</label>' +
          '<input class="twc-key" type="password" autocomplete="off" spellcheck="false" data-i18n-attr="placeholder:chat.apikey_ph" placeholder="貼上你的 API 金鑰"></div>' +
        '<div><label data-i18n="chat.model">模型</label>' +
          '<div class="twc-modelrow">' +
            '<select class="twc-model-sel"></select>' +
            '<button class="twc-mrefresh" type="button" data-act="reload-models" data-i18n-attr="aria-label:chat.model_refresh" aria-label="Reload models">' + I.refresh + '</button>' +
          '</div>' +
          '<input class="twc-model twc-hide" type="text" autocomplete="off" spellcheck="false" data-i18n-attr="placeholder:chat.model_custom_ph" placeholder="輸入 model id">' +
          '<p class="twc-mnote"></p></div>' +
        '<label class="twc-check"><input type="checkbox" class="twc-autosug"><span data-i18n="chat.autosuggest">自動推薦問題</span></label>' +
        '<p class="twc-hint" data-i18n="chat.keyhint"></p>' +
        '<div class="twc-saverow"><button class="twc-save" type="button" data-act="save" data-i18n="chat.save">儲存</button>' +
          '<span class="twc-status" role="status" aria-live="polite"></span></div>' +
      '</div>' +
      '<div class="twc-msgs"></div>' +
      '<div class="twc-sugbar"><button class="twc-sug" type="button" data-act="suggest" data-i18n="chat.suggest">💡 推薦問題</button></div>' +
      '<div class="twc-chips"></div>' +
      '<form class="twc-form">' +
        '<textarea class="twc-input" rows="1" data-i18n-attr="placeholder:chat.placeholder" placeholder="輸入訊息…"></textarea>' +
        '<button class="twc-send" type="submit" data-act="send" data-i18n-attr="aria-label:chat.send" aria-label="Send">' + I.send + '</button>' +
      '</form>' +
    '</div>';

  /* ---- 建立 widget(<style> 進 head、容器進 body)---- */
  function build(){
    if (!document.getElementById('tw-chatbot-style')){
      var st = document.createElement('style'); st.id = 'tw-chatbot-style'; st.textContent = CSS; document.head.appendChild(st);
    }
    var root = document.createElement('div');
    root.id = 'tw-chatbot'; root.setAttribute('data-open', 'false'); root.setAttribute('data-settings', 'false');
    root.innerHTML = HTML; document.body.appendChild(root);
    return root;
  }
  var root  = build();
  var elMsgs = root.querySelector('.twc-msgs');
  var elInput = root.querySelector('.twc-input');
  var elSend = root.querySelector('.twc-send');
  var elChips = root.querySelector('.twc-chips');
  var elSug = root.querySelector('.twc-sug');
  var sugBusy = false;
  var elProv = root.querySelector('.twc-provider');
  var elKey = root.querySelector('.twc-key');
  var elModel = root.querySelector('.twc-model');          // 自訂 model id(逃生口)
  var elModelSel = root.querySelector('.twc-model-sel');   // 動態模型下拉
  var elAutoSug = root.querySelector('.twc-autosug');      // 「自動推薦問題」開關
  var modelCache = {};   // provider -> [model id]
  var loadedSig = null;  // 'provider|key':已抓過的識別,避免同金鑰重複請求
  var uiModel = state.model || '';  // 下拉「目前選擇」(獨立於已存 state.model;切供應商會重置、↻ 不丟失)
  var mnoteKey = '';     // 目前提示的 i18n key(切語言時據此重譯)

  function setMNote(key){ mnoteKey = key || ''; var n = root.querySelector('.twc-mnote'); if (n) n.textContent = mnoteKey ? T(mnoteKey) : ''; }
  function opt(val, label, sel){ var o = document.createElement('option'); o.value = val; o.textContent = label; if (sel) o.selected = true; return o; }
  // 依清單重建下拉:預選 uiModel(或該供應商預設);清單外的既有 model 視為「自訂」並開手打框
  function renderModelOptions(list){
    list = list || []; var cur = uiModel || ''; var def = PROVIDERS[curProv()].model;
    var pick = cur || def; var isCustom = !!cur && list.length > 0 && list.indexOf(cur) === -1;
    elModelSel.innerHTML = '';
    if (!list.length){ elModelSel.appendChild(opt(pick || '', pick || T('chat.model_auto'), !isCustom)); }
    else { list.forEach(function(id){ elModelSel.appendChild(opt(id, id, id === pick && !isCustom)); }); }
    elModelSel.appendChild(opt('__custom__', T('chat.model_custom'), isCustom));
    if (isCustom){ elModel.classList.remove('twc-hide'); elModel.value = cur; }
    else { elModel.classList.add('twc-hide'); }
  }
  // 動態載入:用目前 provider + key 打 list-models;通過才填清單,失敗保留「自訂…」可手打
  // 回傳 Promise:成功 resolve 模型陣列(可能為空陣列),失敗 / 無金鑰 resolve null(不 reject,呼叫端可據此判定金鑰是否可用)。
  function loadModels(force){
    var prov = curProv(); var key = elKey.value.trim();
    if (!key){ setMNote('chat.model_auto'); renderModelOptions(modelCache[prov]); return Promise.resolve(null); }
    var sig = prov + '|' + key;
    if (!force && loadedSig === sig && modelCache[prov]){ renderModelOptions(modelCache[prov]); return Promise.resolve(modelCache[prov]); }
    setMNote('chat.model_loading');
    var rb = root.querySelector('.twc-mrefresh'); if (rb) rb.disabled = true;
    return PROVIDERS[prov].list(key).then(function(listed){
      modelCache[prov] = listed; loadedSig = sig; renderModelOptions(listed);
      setMNote(listed.length ? '' : 'chat.model_loadfail'); if (rb) rb.disabled = false; return listed;
    }).catch(function(){
      setMNote('chat.model_loadfail'); renderModelOptions(modelCache[prov]); if (rb) rb.disabled = false; return null;
    });
  }

  function fillSettings(){
    elProv.value = curProv();
    elKey.value = state.key || '';
    elAutoSug.checked = (state.autosuggest !== false);
    renderModelOptions(modelCache[curProv()]);
    loadModels();                       // 有金鑰即自動抓真實清單
  }
  fillSettings();
  elProv.addEventListener('change', function(){ state.provider = elProv.value; uiModel = ''; loadModels(); });
  // 填金鑰當下:打 list-models 同時「確認金鑰可用 ✓ / ✗」+ 載入該金鑰可用模型;成功 → 存入瀏覽器並立刻備好第一組起手問題(快取)。
  elKey.addEventListener('change', function(){
    var key = elKey.value.trim(); if (!key) return;
    setStatus('', T('chat.validating'));
    loadModels(true).then(function(listed){
      if (listed){ state.key = key; save(); setStatus('ok', T('chat.valid')); primeStarters(); }
      else { setStatus('err', T('chat.keybad')); }
    });
  });
  elModelSel.addEventListener('change', function(){
    if (elModelSel.value === '__custom__'){ elModel.classList.remove('twc-hide'); uiModel = elModel.value.trim(); elModel.focus(); }
    else { elModel.classList.add('twc-hide'); uiModel = elModelSel.value; }
  });
  elModel.addEventListener('input', function(){ uiModel = elModel.value.trim(); });
  // 「自動推薦問題」開關即時生效並持久化(獨立於「儲存」鈕,不需重新驗證金鑰)
  elAutoSug.addEventListener('change', function(){ state.autosuggest = elAutoSug.checked; save(); });

  /* ---- 訊息 ---- */
  function addMsg(kind, text){
    var d = document.createElement('div');
    d.className = 'twc-msg ' + (kind === 'user' ? 'twc-user' : kind === 'error' ? 'twc-err' : 'twc-bot');
    d.textContent = text;                       // textContent:避免模型輸出注入 HTML
    elMsgs.appendChild(d); elMsgs.scrollTop = elMsgs.scrollHeight; return d;
  }
  function renderHistory(){
    elMsgs.innerHTML = '';
    var g = document.createElement('div'); g.className = 'twc-msg twc-bot';
    g.setAttribute('data-i18n', 'chat.greeting'); g.textContent = T('chat.greeting'); // 切語言時引擎會重譯
    elMsgs.appendChild(g);
    state.turns.forEach(function(m){ addMsg(m.role === 'assistant' ? 'bot' : 'user', m.content); });
    elMsgs.scrollTop = elMsgs.scrollHeight;
  }
  renderHistory();
  showCachedStartersIfAny();   // 載入時:本頁若有快取的起手問題且尚無對話即顯示(0 API)

  var busy = false;
  function setBusy(b){ busy = b; elSend.disabled = b; }
  function typing(){
    var d = document.createElement('div'); d.className = 'twc-msg twc-bot';
    d.innerHTML = '<span class="twc-typing"><i></i><i></i><i></i></span>';
    elMsgs.appendChild(d); elMsgs.scrollTop = elMsgs.scrollHeight; return d;
  }
  function persist(){ if (state.turns.length > 40) state.turns = state.turns.slice(-40); save(); }

  function send(){
    if (busy) return;
    var text = (elInput.value || '').trim(); if (!text) return;
    var key = (state.key || '').trim();
    if (!key){ setOpen(true); root.setAttribute('data-settings', 'true'); addMsg('error', T('chat.needkey')); elKey.focus(); return; }
    elInput.value = ''; autoGrow(); clearChips();
    addMsg('user', text); state.turns.push({ role: 'user', content: text }); persist();
    setBusy(true);
    var ind = typing();
    var p = PROVIDERS[curProv()];
    var model = (state.model || '').trim() || p.model;
    p.send(key, model, state.turns).then(function(reply){
      if (ind.parentNode) ind.parentNode.removeChild(ind);
      reply = reply || '(empty response)';
      addMsg('bot', reply); state.turns.push({ role: 'assistant', content: reply }); persist();
      if (state.autosuggest) suggestQuestions(true);   // 自動依對話更新推薦問題(silent:失敗不打擾)
    }).catch(function(err){
      if (ind.parentNode) ind.parentNode.removeChild(ind);
      addMsg('error', T('chat.error') + (err && err.message ? err.message : err));
    }).then(function(){ setBusy(false); elInput.focus(); });
  }

  /* ---- 推薦問題:點按鈕才請 AI 依「目前對話 + 本頁內容」生成 3 個追問,呈現為可點 chips ---- */
  function pageContext(){
    var hs = Array.prototype.slice.call(document.querySelectorAll('h1,h2')).slice(0, 6)
      .map(function(h){ return (h.textContent || '').trim(); }).filter(Boolean).join(' / ');
    return ((document.title || '') + (hs ? ' — ' + hs : '')).slice(0, 400);
  }
  function regenerate(){ if (!state.turns.length) primeStarters(true); else suggestQuestions(); }  // 「推薦問題」鈕 / chips 後的「換一批」共用
  // 已有建議(chips)時就不顯示「💡 推薦問題」鈕(避免重複);改由問題後的「🔄 換一批」重生。
  function syncSugbar(){ var b = root.querySelector('.twc-sugbar'); if (b) b.style.display = elChips.children.length ? 'none' : 'flex'; }
  function clearChips(){ elChips.innerHTML = ''; elChips.style.display = 'none'; syncSugbar(); }
  function renderChips(qs){
    elChips.innerHTML = '';
    qs.forEach(function(q){
      var c = document.createElement('button'); c.type = 'button'; c.className = 'twc-chip'; c.textContent = q;
      c.addEventListener('click', function(){ clearChips(); elInput.value = q; autoGrow(); send(); });
      elChips.appendChild(c);
    });
    if (qs.length){   // 在問題 chips 後面接一顆「🔄 換一批」(重生一組)
      var more = document.createElement('button'); more.type = 'button'; more.className = 'twc-more'; more.textContent = T('chat.another');
      more.addEventListener('click', regenerate);
      elChips.appendChild(more);
    }
    elChips.style.display = qs.length ? 'flex' : 'none'; syncSugbar();
  }
  function pageId(){ return (location.pathname || '/') + '#' + (document.title || ''); }   // 本頁識別(快取以此為 key)
  // 共用:組 prompt → 請 AI → 回傳最多 3 個問題(陣列)。依「最近對話 + 本頁內容」。
  function requestSuggestions(){
    var lang = (window.twLang ? window.twLang() : 'zh-Hant');
    var prompt = 'Based on this web page and our conversation, propose exactly 3 short, distinct questions the user is likely to want to ask next. '
      + 'Page context: "' + pageContext() + '". Reply with ONLY the 3 questions, each on its own line — no numbering, no bullets, no extra text. '
      + 'Write them in ' + (lang === 'en' ? 'English' : 'Traditional Chinese') + '.';
    var p = PROVIDERS[curProv()];
    var model = (state.model || '').trim() || p.model;
    var turns = state.turns.slice(-6).concat([{ role: 'user', content: prompt }]);
    return p.send((state.key || '').trim(), model, turns).then(function(text){
      return (text || '').split('\n').map(function(s){ return s.replace(/^[\s\-*\d.)、。]+/, '').trim(); }).filter(Boolean).slice(0, 3);
    });
  }
  // 手動 / 自動追問:依對話即時生成(ephemeral,不快取)。silent=true → 無金鑰 / 失敗時靜默略過。
  function suggestQuestions(silent){
    if (sugBusy) return;
    if (!(state.key || '').trim()){ if (!silent){ setOpen(true); root.setAttribute('data-settings', 'true'); addMsg('error', T('chat.needkey')); elKey.focus(); } return; }
    sugBusy = true; elSug.disabled = true; elSug.textContent = T('chat.suggesting'); clearChips();
    requestSuggestions().then(renderChips).catch(function(err){
      if (!silent) addMsg('error', T('chat.error') + (err && err.message ? err.message : err));
    }).then(function(){ sugBusy = false; elSug.disabled = false; elSug.textContent = T('chat.suggest'); });
  }
  // 起手問題(cold start):有本頁快取就直接顯示(0 API);否則生成並快取進 localStorage。填金鑰確認後 / 載入時呼叫。
  // 作者預設起手問題(TW_CONFIG.chatStarters,字串陣列・最多 4 個);設了就用作者的,免 API。
  function cfgStarters(){
    if (!Array.isArray(CFG.chatStarters)) return null;
    var a = CFG.chatStarters.filter(function(s){ return typeof s === 'string' && s.trim(); }).slice(0, 4);
    return a.length ? a : null;
  }
  function showCachedStartersIfAny(){
    if (state.turns.length) return false;
    var fixed = cfgStarters();
    if (fixed){ renderChips(fixed); return true; }             // 作者固定起手優先
    var c = state.starters;
    if (c && c.page === pageId() && c.qs && c.qs.length){ renderChips(c.qs); return true; }
    return false;
  }
  function primeStarters(force){
    if (cfgStarters()){ showCachedStartersIfAny(); return; }    // 作者固定起手 → 顯示作者的,不 AI 生成/快取
    if (!force && showCachedStartersIfAny()) return;            // 有快取 → 用快取,不重生
    if (sugBusy || !(state.key || '').trim()) return;
    sugBusy = true; elSug.disabled = true; elSug.textContent = T('chat.suggesting');
    requestSuggestions().then(function(qs){
      if (qs.length){ state.starters = { page: pageId(), qs: qs }; save(); if (!state.turns.length) renderChips(qs); }
    }).catch(function(){}).then(function(){ sugBusy = false; elSug.disabled = false; elSug.textContent = T('chat.suggest'); });
  }

  function autoGrow(){ elInput.style.height = 'auto'; elInput.style.height = Math.min(elInput.scrollHeight, 120) + 'px'; }
  function setStatus(kind, text){
    var s = root.querySelector('.twc-status');
    s.className = 'twc-status' + (kind ? ' ' + kind : ''); s.textContent = text || '';
  }
  // 儲存前先發一個最小請求,驗證「金鑰 + 模型 + CORS」是否真的可用;通過才存,失敗顯示原因不存。
  function saveSettings(){
    var prov = PROVIDERS[elProv.value] ? elProv.value : 'gemini';
    var key = elKey.value.trim();
    var sel = elModelSel.value;
    var model = (sel === '__custom__' ? elModel.value.trim() : sel) || PROVIDERS[prov].model;
    if (!key){ setStatus('err', T('chat.nokey_save')); elKey.focus(); return; }
    var sb = root.querySelector('.twc-save'); sb.disabled = true; setStatus('', T('chat.validating'));
    PROVIDERS[prov].send(key, model, [{ role: 'user', content: 'Hi' }]).then(function(){
      state.provider = prov; state.key = key; state.model = model; uiModel = model; save();
      setStatus('ok', T('chat.valid'));
      setTimeout(function(){
        if (root.querySelector('.twc-status').classList.contains('ok')){ root.setAttribute('data-settings', 'false'); setStatus('', ''); elInput.focus(); }
      }, 950);
    }).catch(function(err){
      setStatus('err', T('chat.invalid') + (err && err.message ? err.message : err));   // 驗證失敗 → 不儲存
    }).then(function(){ sb.disabled = false; });
  }

  /* ---- 事件 ---- */
  // 開/關:FAB 同一顆鈕(icon 由 [data-open] 在 💬 / ✕ 間切換),aria-label 同步
  function setOpen(open){
    root.setAttribute('data-open', open ? 'true' : 'false');
    if (open && !state.key) root.setAttribute('data-settings', 'true');
    var fab = root.querySelector('.twc-fab'); if (fab) fab.setAttribute('aria-label', open ? T('chat.close') : T('chat.open'));
    if (open) setTimeout(function(){ (state.key ? elInput : elKey).focus(); }, 60);
  }
  root.addEventListener('click', function(e){
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'send') return;                  // 交給 form submit
    if (act === 'toggle'){ setOpen(root.getAttribute('data-open') !== 'true'); }
    else if (act === 'close'){ setOpen(false); }
    else if (act === 'settings'){ var openS = root.getAttribute('data-settings') !== 'true'; root.setAttribute('data-settings', openS ? 'true' : 'false'); if (openS) loadModels(); }
    else if (act === 'reload-models'){ loadModels(true); }
    else if (act === 'suggest'){ regenerate(); }   // 冷啟動 → 重生並更新起手快取;對話中 → 即時追問
    else if (act === 'clear'){ state.turns = []; save(); renderHistory(); clearChips(); showCachedStartersIfAny(); }
    else if (act === 'save'){ saveSettings(); }
  });
  root.querySelector('.twc-form').addEventListener('submit', function(e){ e.preventDefault(); send(); });
  elInput.addEventListener('keydown', function(e){ if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send(); } });
  elInput.addEventListener('input', autoGrow);

  /* ---- 套用一次 i18n(引擎首次 applyI18n 在 widget 建立前已跑過)---- */
  if (window.__twApplyI18n){ try{ window.__twApplyI18n(); }catch(e){} }

  /* 切語言時重繪「JS 動態產生」的下拉選項(自訂…/placeholder)與提示文字;
     靜態 data-i18n / data-i18n-attr 節點由引擎 applyI18n 自行重譯,毋須處理。 */
  document.addEventListener('click', function(e){
    if (e.target.closest && e.target.closest('[data-set-lang]')){
      setTimeout(function(){ renderModelOptions(modelCache[curProv()]); setMNote(mnoteKey); var m = elChips.querySelector('.twc-more'); if (m) m.textContent = T('chat.another'); }, 0);
    }
  });

  /* ---- 匯出乾淨 HTML 時剝除 widget(集中處理;capture 先於各頁 export handler)----
     各頁 export 同步 clone live DOM;此 capture listener 在 clone 前把 widget 暫時卸下,
     於本輪事件結束後(queueMicrotask,paint 前)還原 —— 匯出檔不含 widget,畫面不閃動。 */
  document.addEventListener('click', function(e){
    if (!e.target.closest || !e.target.closest(EXPORT_TRIGGERS)) return;
    var r = document.getElementById('tw-chatbot'), s = document.getElementById('tw-chatbot-style');
    var rp = r && r.parentNode, sp = s && s.parentNode;
    if (rp) rp.removeChild(r); if (sp) sp.removeChild(s);
    var restore = function(){ if (rp) rp.appendChild(r); if (sp) sp.appendChild(s); };
    if (window.queueMicrotask) queueMicrotask(restore); else setTimeout(restore, 0);
  }, true);
})();
/* ==/TW-MAIN== */
