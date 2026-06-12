# timmy-web 元件庫 (components)

可直接複製貼進 `base-template.html` 的 `<main>` 的片段。所有 class 已對齊招牌編輯風;色票/字體由 `assets/base-template.html` 的 `tailwind.config` 提供。完整視覺請開 `examples/showcase.html`。

## 目錄 (Contents)

- [報頭與導覽 masthead / nav](#報頭與導覽-masthead--nav)
- [頁首:標題 + 前言 h1 / lead](#頁首標題--前言-h1--lead)
- [區段標題 h2 / h3](#區段標題-h2--h3)
- [卡片 card](#卡片-card)
- [徽章 pill](#徽章-pill)
- [數據盒 stat grid](#數據盒-stat-grid)
- [左色條 callout](#左色條-callout)
- [箭頭快速連結 quick links](#箭頭快速連結-quick-links)
- [封面圖 cover](#封面圖-cover)
- [表格 table](#表格-table)
- [鍵值清單 key-value](#鍵值清單-key-value)
- [表單控制項 input / select / button](#表單控制項-input--select--button)
- [清單 list(點線 / 勾選)](#清單-list點線--勾選)
- [子分頁 subtabs(sticky + JS)](#子分頁-subtablssticky--js)
- [頁尾 footer](#頁尾-footer)
- [使用者選單 + 設定 + 主題引擎](#使用者選單--設定--主題引擎)

---

## 報頭與導覽 masthead / nav

各頁共用。當前頁的連結加「金色底線 + 藏青粗體」表示 active。

```html
<header class="masthead bg-paper">
  <div class="mx-auto max-w-content lg:max-w-content-lg wide:max-w-content-xl px-6 py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
    <a href="/" class="flex flex-col leading-tight no-underline text-ink">
      <span class="text-[1.4rem] font-bold tracking-[0.1em]">網站名稱</span>
      <span class="text-[0.68rem] tracking-[0.16em] text-muted">KICKER · 副標</span>
    </a>
    <nav class="flex flex-wrap gap-x-6 gap-y-1 text-[0.98rem]">
      <a href="#" class="no-underline tracking-[0.05em] text-accent font-bold border-b-2 border-gold pb-0.5">總覽</a>
      <a href="#" class="no-underline tracking-[0.05em] text-muted hover:text-accent border-b-2 border-transparent hover:border-gold pb-0.5 transition-colors">每日行程</a>
    </nav>
  </div>
</header>
```

## 頁首:標題 + 前言 h1 / lead

```html
<h1 class="text-[1.95rem] font-bold tracking-[0.04em] mb-1.5">頁面標題</h1>
<p class="text-muted italic mb-6 pb-5 border-b border-line">前言一句話定調,斜體,收於一條細線之上。</p>
```

## 區段標題 h2 / h3

`h2` 的招牌是「標題 + 下細線」。

```html
<h2 class="text-[1.3rem] font-semibold mt-9 mb-4 pb-1.5 border-b border-line">區段標題</h2>
<h3 class="text-[1.2rem] font-semibold mt-6 mb-2">小節標題</h3>
```

## 卡片 card

```html
<div class="bg-surface border border-line rounded p-5">
  <p class="m-0">卡片內容。</p>
</div>
```

## 徽章 pill

外框式(非填色)、大寫、字距寬。variants:預設(藏青)/ highlight(燒赭)/ done(墨綠)/ tbd(灰)。

```html
<span class="inline-block text-[0.68rem] font-semibold tracking-[0.14em] uppercase px-2 py-0.5 border rounded align-middle border-accent text-accent">預設</span>
<span class="inline-block text-[0.68rem] font-semibold tracking-[0.14em] uppercase px-2 py-0.5 border rounded align-middle border-highlight text-highlight">重點</span>
<span class="inline-block text-[0.68rem] font-semibold tracking-[0.14em] uppercase px-2 py-0.5 border rounded align-middle border-done text-done">完成</span>
<span class="inline-block text-[0.68rem] font-semibold tracking-[0.14em] uppercase px-2 py-0.5 border rounded align-middle border-muted text-muted">待定</span>
```

## 數據盒 stat grid

報紙式三欄數據,細線分隔。手機收成單欄。

```html
<div class="grid grid-cols-1 sm:grid-cols-3 border border-line rounded bg-surface mb-6 divide-y sm:divide-y-0 sm:divide-x divide-line">
  <div class="flex flex-col gap-1 text-center p-5">
    <span class="text-[0.72rem] tracking-[0.16em] uppercase text-muted">出發</span>
    <span class="text-[1.75rem] font-bold text-accent">08/13</span>
    <span class="text-[0.85rem] text-muted">臺北 → 布達佩斯</span>
  </div>
  <div class="flex flex-col gap-1 text-center p-5">
    <span class="text-[0.72rem] tracking-[0.16em] uppercase text-muted">研討會</span>
    <span class="text-[1.75rem] font-bold text-accent">08/15–22</span>
    <span class="text-[0.85rem] text-muted">克拉科夫</span>
  </div>
  <div class="flex flex-col gap-1 text-center p-5">
    <span class="text-[0.72rem] tracking-[0.16em] uppercase text-muted">返抵</span>
    <span class="text-[1.75rem] font-bold text-accent">08/23</span>
    <span class="text-[0.85rem] text-muted">自波蘭返程</span>
  </div>
</div>
```

## 左色條 callout

用左邊框點題的側欄手法。highlight(燒赭)用於重點;gold(金棕)用於資訊/住宿。

左邊框用 inline `style` 設(specificity 最高),避免 Tailwind 整圈邊色 `border-line`/`border-highlight` 互相覆蓋的順序問題;其餘三邊維持 1px 細線。

```html
<!-- highlight 用 #8a5224;gold 用 #9a7b4f -->
<div class="bg-surface border border-line rounded p-5" style="border-left:3px solid #8a5224">
  <span class="inline-block text-[0.68rem] font-semibold tracking-[0.14em] uppercase px-2 py-0.5 border border-highlight text-highlight rounded">重點</span>
  <h3 class="text-[1.15rem] font-semibold mt-2 mb-1">標題</h3>
  <p class="m-0 text-muted">說明文字。</p>
</div>
```

## 箭頭快速連結 quick links

自動換行的連結卡;箭頭用金色。

```html
<div class="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
  <a href="#" class="flex justify-between items-center no-underline font-semibold text-ink bg-surface border border-line rounded p-4 hover:border-accent hover:text-accent transition-colors">每日行程 <span class="text-gold">→</span></a>
  <a href="#" class="flex justify-between items-center no-underline font-semibold text-ink bg-surface border border-line rounded p-4 hover:border-accent hover:text-accent transition-colors">官方網站 <span class="text-gold">↗</span></a>
</div>
```

## 封面圖 cover

置中、有框、圓角極小。

```html
<figure class="mx-auto mb-6 max-w-[560px] border border-line rounded overflow-hidden bg-surface">
  <img src="cover.png" alt="封面" class="block w-full h-auto" />
</figure>
```

## 表格 table

大寫 muted 表頭、細線分隔。外層 `overflow-x-auto` 供手機橫捲。

```html
<div class="overflow-x-auto">
  <table class="w-full border-collapse bg-surface border border-line rounded text-[0.9rem]">
    <thead>
      <tr>
        <th class="text-left p-3 bg-paper text-muted text-[0.7rem] tracking-[0.12em] uppercase font-semibold border-b border-line whitespace-nowrap">時間</th>
        <th class="text-left p-3 bg-paper text-muted text-[0.7rem] tracking-[0.12em] uppercase font-semibold border-b border-line">項目</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="p-3 border-b border-line align-top whitespace-nowrap font-bold text-accent">09:00</td><td class="p-3 border-b border-line align-top">開幕</td></tr>
      <tr><td class="p-3 align-top whitespace-nowrap font-bold text-accent">10:30</td><td class="p-3 align-top">專題演講</td></tr>
    </tbody>
  </table>
</div>
```

## 鍵值清單 key-value

`dl` 雙欄(標籤 + 值),適合資訊摘要 / dashboard。

```html
<dl class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 m-0">
  <dt class="font-bold text-muted">航班</dt><dd class="m-0">BR061</dd>
  <dt class="font-bold text-muted">時間</dt><dd class="m-0">23:55 → 06:30+1</dd>
</dl>
```

## 表單控制項 input / select / button

工具/儀表板用。按鈕為主色文字 + 紙底,hover 淡藍。

```html
<input type="text" class="font-serif border border-line rounded bg-white text-ink px-2.5 py-2" placeholder="輸入…" />
<select class="font-serif border border-line rounded bg-white text-ink px-2.5 py-2"><option>選項</option></select>
<button class="font-serif border border-line rounded bg-paper text-accent px-3 py-2 cursor-pointer hover:bg-accent-soft transition-colors">送出</button>
```

## 清單 list(點線 / 勾選)

```html
<!-- 點線分隔清單 -->
<ul class="list-none m-0 p-0">
  <li class="flex justify-between gap-3 py-2 border-b border-dotted border-line last:border-b-0">
    <span>項目</span><span class="text-muted text-[0.85rem]">附註</span>
  </li>
</ul>

<!-- 勾選(done 用刪除線 + 變灰) -->
<label class="flex items-start gap-2 cursor-pointer leading-relaxed">
  <input type="checkbox" class="mt-1 w-[1.05rem] h-[1.05rem] shrink-0" />
  <span>待辦項目</span>
</label>
```

## 子分頁 subtabs(sticky + JS)

頁內分頁;active 金色底線。需要下方小段 JS。

```html
<div class="flex flex-nowrap gap-1 overflow-x-auto border-b border-line mb-6 sticky top-0 z-20 bg-paper" id="subtabs">
  <button data-tab="a" class="subtab shrink-0 font-serif text-[0.95rem] tracking-[0.04em] text-accent font-bold bg-transparent border-0 border-b-2 border-gold px-3.5 py-2 cursor-pointer whitespace-nowrap">分頁 A</button>
  <button data-tab="b" class="subtab shrink-0 font-serif text-[0.95rem] tracking-[0.04em] text-muted bg-transparent border-0 border-b-2 border-transparent px-3.5 py-2 cursor-pointer whitespace-nowrap hover:text-accent transition-colors">分頁 B</button>
</div>
<section data-panel="a">A 的內容</section>
<section data-panel="b" class="hidden">B 的內容</section>
<script>
  const tabs = document.getElementById('subtabs');
  tabs.addEventListener('click', e => {
    const btn = e.target.closest('.subtab'); if (!btn) return;
    const key = btn.dataset.tab;
    tabs.querySelectorAll('.subtab').forEach(b => {
      const on = b === btn;
      b.classList.toggle('text-accent', on); b.classList.toggle('font-bold', on); b.classList.toggle('border-gold', on);
      b.classList.toggle('text-muted', !on); b.classList.toggle('border-transparent', !on);
    });
    document.querySelectorAll('[data-panel]').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== key));
  });
</script>
```

## 頁尾 footer

```html
<footer class="text-center text-muted text-[0.85rem] italic px-4 pt-4 pb-12">
  <span class="block w-[60px] h-px bg-gold mx-auto mb-4"></span>
  <p class="m-0">頁尾文字 · 版權/說明</p>
</footer>
```

## 使用者選單 + 設定 + 主題引擎

報頭最右的使用者 icon、下拉選單、Claude 式設定 modal、主題引擎與 i18n 的**完整可運作標記與 JS 都在 [`../assets/base-template.html`](../assets/base-template.html)**(新頁從它複製即內建)。這裡只說明使用與擴充:

**主題引擎**:色票皆為 CSS 變數;切換靠 `<html>` 的 `data-*` 屬性:

- `data-mode="light|dark"`(`system` 由 JS 解析 `prefers-color-scheme`)
- `data-bg="cream|ivory|snow|sand|greige|stone|mist"`(背景紙色,僅淺色;深色由 `data-mode` 覆蓋)
- `data-accent="navy|teal|forest|olive|gold|rust|claret|plum|slate|ink"`
- `data-fs="s|m|l"`

JS 把選擇存 `localStorage('timmy-web-prefs')`,並在 `<head>` 開畫前先套用(防閃白)。控制項用 `data-set-mode/-accent/-fs/-lang` 屬性,點擊由事件委派處理,active 態以 `aria-pressed` + CSS 呈現。

**加一個主色**:在 `<style>` 補 `[data-accent="x"]{ --c-accent:…; --c-accent-soft:… }` 與 `[data-mode="dark"][data-accent="x"]{…}`,再於設定 modal 加一顆 `.accent-sw[data-set-accent="x"]` 色票鈕(詳見 design-system.md)。

**i18n**:要翻譯的元素加 `data-i18n="key"`,並在 JS 的 `I18N` 字典補各語言的 `key`;未列入的 key 保留原文。

**匯出設定檔**:設定→外觀底部「匯出設定檔 (.css)」會下載當前主題的 CSS 變數(`:root` + 深色),供開發者直接引用。

**版本紀錄**:在設定 modal 的 `data-panel-sec="changelog"` 區塊,依範例新增版本條目:

```html
<li class="pl-4" style="border-left:2px solid var(--c-line)">
  <div class="flex items-baseline gap-2 mb-1">
    <span class="inline-block text-[0.68rem] font-semibold tracking-[0.14em] uppercase px-2 py-0.5 border border-accent text-accent rounded">v1.2</span>
    <time class="text-muted text-[0.85rem]">2026-07-01</time>
  </div>
  <ul class="list-disc pl-5 m-0 text-[0.92rem] space-y-1"><li>變更說明…</li></ul>
</li>
```
