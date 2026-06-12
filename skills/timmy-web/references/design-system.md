# timmy-web 設計系統 (design system)

這套風格的「為什麼」與唯一真實來源 (source of truth)。需要新增元件、或判斷某個畫面是否「在風格內」時讀這份。日常組裝請用 [components.md](components.md);視覺全貌請開 [../examples/showcase.html](../examples/showcase.html)。

## 目錄 (Contents)

- [設計理念](#設計理念)
- [色彩 tokens](#色彩-tokens)
- [主題引擎:深色與強調色](#主題引擎深色與強調色)
- [字體與排版](#字體與排版)
- [造形與空間](#造形與空間)
- [招牌手法 signature devices](#招牌手法-signature-devices)
- [Tailwind config(canonical)](#tailwind-configcanonical)
- [Do / Don't](#do--dont)
- [如何演進這套風格](#如何演進這套風格)

---

## 設計理念

**編輯／手札風 (editorial almanac)**:像一本印刷講究的旅誌或學術別冊。暖紙質地、襯線字、寬鬆行距,用**細線與留白**而非陰影與色塊來分層;深藏青為骨幹,金棕與燒赭做點綴。沉穩、耐讀、有紙感,一眼可辨。

判準:畫面像「印在好紙上的刊物」就對了;像「SaaS 後台 / Material 卡片浮起來」就偏了。

## 色彩 tokens

| token | hex | 用途 (semantic) |
| :-- | :-- | :-- |
| `paper` | `#f4efe3` | 頁面底色(暖紙) |
| `surface` | `#fbf8f1` | 卡片 / 表格面(比紙更亮一階) |
| `ink` | `#23201a` | 主文字(暖墨,非純黑) |
| `muted` | `#6f6757` | 次要文字 / 標籤 / 附註 |
| `accent` | `#1d3557` | 主色:深藏青(標題數值、連結、報頭線) |
| `accent-soft` | `#e8ecf2` | 主色淡:hover 底、輕量強調 |
| `gold` | `#9a7b4f` | 金棕:裝飾線、active 底線、箭頭、頁尾飾線 |
| `highlight` | `#8a5224` | 燒赭:重點、警醒、最佳選項 |
| `done` | `#3f6b3f` | 墨綠:完成 / 成功 |
| `line` | `#d9d0bd` | 暖褐:邊框 / 分隔線(細線的靈魂) |
| `warn` | `#b23a2e` | 磚紅:錯誤 / 取消 / 警示 |

用色紀律:背景只在 `paper`/`surface` 之間;文字 `ink`/`muted`;強調靠 `accent`,點綴才用 `gold`/`highlight`。一個畫面別超過這組;不要引入飽和度高的「品牌色」。

## 主題引擎:深色與強調色

色票皆為 CSS 變數,定義在 `<style>`、由 `<html>` 的 `data-*` 切換,故能即時改全頁並存 `localStorage`(`timmy-web-prefs`),含開畫前防閃白。維度:

- **背景 `data-bg`**(紙色,僅淺色;深色由 `data-mode` 覆蓋):

  | bg | paper | surface |
  | :-- | :-- | :-- |
  | cream(預設) | `#f4efe3` | `#fbf8f1` |
  | ivory | `#f8f5ee` | `#fffdf9` |
  | snow | `#fbfaf6` | `#ffffff` |
  | sand | `#ece1cc` | `#f6eede` |
  | greige | `#e9e4d6` | `#f4efe2` |
  | stone | `#eae7e0` | `#f4f1ec` |
  | mist | `#eaecec` | `#f6f7f6` |

- **強調色 `data-accent`**(只換主色,中性暖紙不動):

  | accent | 淺色 `--c-accent` | 深色 `--c-accent` |
  | :-- | :-- | :-- |
  | navy(預設) | `#1d3557` | `#7da7d9` |
  | teal | `#1f5560` | `#6fb6c2` |
  | forest | `#2f5840` | `#8fc0a0` |
  | olive | `#5b5a2c` | `#c4be79` |
  | gold | `#856226` | `#d8b677` |
  | rust | `#9c4a2a` | `#e0926a` |
  | claret | `#7a2a33` | `#d79aa0` |
  | plum | `#5d3a5e` | `#c89ac9` |
  | slate | `#3c4654` | `#a3b3c6` |
  | ink | `#33312c` | `#cdc6b8` |

  每色另有 `--c-accent-soft`(淺=淡 hover 底;深=暗底)。

- **模式 `data-mode="light|dark"`**(`system` 由 JS 解析 `prefers-color-scheme`)。深色中性與二級色:

  | token | 深色值 |
  | :-- | :-- |
  | paper / surface | `#1b1916` / `#252220` |
  | ink / muted | `#ece5d7` / `#a99f8d` |
  | line | `#39342c` |
  | gold / highlight / done / warn | `#c2a373` / `#d18a4f` / `#82a96d` / `#e0735f` |

- **字級 `data-fs="s|m|l"`** → `--fs-mult` 0.92 / 1 / 1.12,套在 `html{font-size}`,全頁等比縮放。

原則:深色維持「暖調、非純黑」(暖墨底 + 米字),延續紙感;二級色於深底適度調亮以保對比。控制項在報頭使用者選單與設定 modal,標記與 JS 見 `assets/base-template.html`。

**匯出設定檔**:設定→外觀的「匯出設定檔 (.css)」用隱藏探針 (probe div) 讀取「當前選擇」的解析色票,輸出 `:root` + `@media (prefers-color-scheme: dark)` + `[data-mode="dark"]` 的 `.css`,供開發者直接 `<link>`/貼入或併入 `tailwind.config`。

## 字體與排版

- **字體**:`Noto Serif TC`(襯線為主),fallback `Georgia, "Times New Roman", PMingLiU, MingLiU, serif`。全站襯線是這套風格的根。
- **內文**:`17px`、`line-height 1.85`(寬鬆、耐讀)。
- **字重**:400 / 500 / 600(標題)/ 700(強調、數值)。
- **字距 letter-spacing**:標籤、kicker、表頭用大寫 + `0.12em–0.16em`;`h1` 約 `0.04em`;品牌 `0.1em`。
- **斜體 italic**:lead 前言、頁尾、英文小注 —— 編輯味的點睛。
- **尺寸階層(rem,root 16px)**:h1 `1.95rem` / h2 `1.3rem` / h3 `1.2rem` / 數值 `1.75rem` / 標籤 `0.68–0.72rem`。

## 造形與空間

- **圓角**:`2px`(`rounded`)。近乎方正、印刷感。**不要**大圓角。
- **分層靠線不靠影**:用 `1px solid line` 或 `1px dotted line`;**幾乎不用 box-shadow**(僅地圖 pin 等少數例外)。
- **閱讀欄寬**:`max-w-content`(760px)→ `lg`(≥1024)1100px → `wide`(≥1440)1280px,置中。內文窄、好讀。
- **節奏**:`main` 上下 `pt-10 pb-12`、左右 `px-6`;h2 上方 `mt-9`;卡片 `p-5`。留白寬鬆。

## 招牌手法 signature devices

辨識度最高、務必保留:

1. **雙線報頭** masthead:`border-bottom: 3px double accent`(雙線作為 bar 下緣底線、頂端保持乾淨;因 Tailwind `border-double` 套四邊,用 inline `.masthead`)。
2. **區段標題下細線**:`h2` 配 `border-b border-line pb-1.5`。
3. **導覽 active 金色底線** + 藏青粗體。
4. **外框 pill** 徽章:大寫、字距寬、`border` 不填色。
5. **三欄 stat 數據盒**:細線分隔的報紙式數據。
6. **左色條 callout**:左邊框 3px 金/赭(用 inline `style="border-left:3px solid …"` 蓋過 1px 細線框,避免 Tailwind 整圈邊色 `border-line`/`border-highlight` 的產生順序問題),側欄點題。
7. **點線分隔** `border-dotted`、**金色 60px 頁尾飾線**。

## Tailwind config(canonical)

每個輸出檔都內嵌這段(已在 `assets/base-template.html`)。色票**引用 CSS 變數**,實際值定義在 `<style>`(見[主題引擎]),故能即時切換:

```js
tailwind.config = { theme: { extend: {
  colors: { // 全部引用 CSS 變數
    paper:'var(--c-paper)', surface:'var(--c-surface)', ink:'var(--c-ink)', muted:'var(--c-muted)',
    accent:'var(--c-accent)', 'accent-soft':'var(--c-accent-soft)', gold:'var(--c-gold)',
    highlight:'var(--c-highlight)', done:'var(--c-done)', line:'var(--c-line)', warn:'var(--c-warn)',
  },
  fontFamily: { serif: ['"Noto Serif TC"','Georgia','"Times New Roman"','"PMingLiU"','"MingLiU"','serif'] },
  borderRadius: { DEFAULT: '2px' },
  maxWidth: { content:'760px', 'content-lg':'1100px', 'content-xl':'1280px' },
  screens: { wide: '1440px' },
}}}
```

## Do / Don't

- ✅ 紙底 + 細線 + 襯線 + 寬行距;強調用藏青,點綴用金/赭。
- ✅ 資料密集畫面(dashboard)也走「表格 + 數據盒 + kv 清單 + 細線」,不要浮起的彩色卡。
- ❌ 大圓角、明顯陰影、漸層、霓虹/高飽和色、無襯線當內文、過窄行距。
- ❌ 引入 Bootstrap 既視感的元件(藥丸按鈕、卡片陰影)。

## 如何演進這套風格

這是你的風格,日後會大改。色票現在是 `<style>` 裡的 CSS 變數,改動時同步以下「傳播點」避免漂移 (drift):

1. **改色票 / 深色 / 強調色** → 改 `assets/base-template.html` `<style>` 的 `:root`、`[data-mode="dark"]`、`[data-accent="…"]` 變數,並同步本檔[色彩 tokens]與[主題引擎]表。
2. **新增一個主色** → 在 `<style>` 加 `[data-accent="x"]` 與 `[data-mode="dark"][data-accent="x"]`,並在設定 modal 加一顆 `.accent-sw[data-set-accent="x"]` 色票鈕。
3. **改字體 / 圓角 / 斷點** → 改 `tailwind.config`(非顏色部分)。
4. **改招牌細節(雙線報頭等)** → 改 inline `<style>` 的 `.masthead` 等,並同步[招牌手法]。
5. **新增/改元件** → 改 `references/components.md`。
6. **每次改完** → 同步 `examples/showcase.html`(同一份變數與 JS;是試色、目視驗證與對外展示的活樣張)。

建議流程:在 `showcase.html` 右上設定即時試色/試深色 → 滿意的值寫進 `:root`/`[data-accent]` → 回填 `base-template.html`、更新本檔表 → 一輪完成。

> 已安裝 Playwright;`.claude/temp/verify_timmy.py` 可截圖回歸驗證改版後的淺/深/換色外觀(scratch 腳本,gitignore)。

> 風格萃取來源:`references/style-samples/GASS2026/`(Astro 多頁站 + A0 海報)。
