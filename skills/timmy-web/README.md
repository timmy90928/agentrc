# timmy-web

單檔 **HTML + Tailwind CDN** 網頁產生器,內建 **10 款策展風格**(預設 = 編輯/手札風:暖紙 + 深藏青 + 金棕襯線)。每款共用同一套引擎:淺/深/系統主題、繁中 / English i18n、RWD 貼邊寬版、主色/背景設定、一鍵匯出乾淨 HTML。

## 🎨 線上風格實驗室 (Live demo)

**<https://timmy-web-style.pages.dev/>** — 部署於 Cloudflare Pages,可即時預覽/挑選 10 款風格並調主色/背景:

- **挑選頁(風格實驗室)**:<https://timmy-web-style.pages.dev/choose_style.html>
- **單款直連**:`https://timmy-web-style.pages.dev/styles/<style>.html`(支援 `?accent=&bg=` 外部調色)

> 用本 skill 產網頁時,可直接把上面網址給使用者線上挑風格;離線則退用本機 `examples/choose_style.html`。

## 10 款風格

`00-editorial` 編輯手札(預設・招牌)、`g09-mintcitrus` 薄荷柑橘、`16-soft-flat` 清爽扁平、`11-glassmorphism` 毛玻璃、`14-pastel-bento` 粉彩便當、`15-gradient-pop` 鮮豔漸層、`04-modern-broadsheet` 彩色雜誌、`02-blueprint-grid` 彩色藍圖、`06-terminal-light` 彩色 IDE、`01-neo-brutalist` 撞色粗野派。

## 適用

履歷、作品集、landing 行銷頁、部落格、活動、產品、文件、dashboard、HTML 報告等。

## 結構(精簡;詳規以 `SKILL.md` 為正本)

```
timmy-web/
├── SKILL.md            # 權威正本:何時用、訪談、組裝流程、引擎契約(Claude 載入此檔)
├── web-spec.md         # 需求訪談範本(Q1–Q11)
├── examples/           # 10 款風格頁 + choose_style.html(= 線上站台來源)
├── assets/             # tw-engine.js(引擎正本)+ base-template.html
├── references/         # design-system / components / theme-engine 規格
└── scripts/            # sync_engine.py(引擎正本 → 各頁同步)
```

> Claude / Gemini / Codex 自動載入的是 **`SKILL.md`**,不是本檔;本 README 為人看的精簡門面。**完整使用方式、風格規格、引擎契約一律以 [`SKILL.md`](SKILL.md) 為準。**
