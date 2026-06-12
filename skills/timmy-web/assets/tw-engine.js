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
      'ui.close':'關閉 (Esc)','ui.close_label':'關閉','ui.apply':'套用'
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
      'ui.close':'Close (Esc)','ui.close_label':'Close','ui.apply':'Apply'
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
/* ==/TW-MAIN== */
