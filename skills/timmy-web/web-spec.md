# Web Page Spec · 網頁規格表

> 用途:這是 **timmy-web skill 的「需求訪談」範本 (template)**。當有人要用本 skill 生成網頁時,Claude 先依下方「## 問題」逐題詢問**那位要做網頁的使用者(開發者)**。
> ⚠️ **本範本維持乾淨、勿就地填寫。** 請先把此檔複製到「正在做網頁的那個專案」的 `.claude/web-spec-<任務代稱>.md`(英文 kebab-case,如 `.claude/web-spec-portfolio.md`),再把回答勾選/填入**該複本**(`- [x]` = 選中,可複選;`- [ ]` = 未選;空白處填文字)。
> ⚠️ **被問的對象是「要做這個網頁的人」,不是 skill 作者。** 執行 skill 時問對方,並把答案記錄到上述複本。
> 訪談順序即題號 **Q1 → Q11**;其中 **Q10 風格 / Q11 主色背景留到最後**,由 skill 依「Q1 主題 + Q5 區塊 + Q6 功能 + Q7 內容」**主動建議 1–2 款風格與配色**,使用者確認或微調(請使用者到線上風格實驗室 https://timmy-web-style.pages.dev/choose_style.html 即時預覽 10 款並挑選;離線退用本機 `examples/choose_style.html`)。
> Q5/Q6 依 Q1 主題用對應子清單勾選。問完於「決議摘要」彙整 → 才產出。一個專案可做多個網頁,各存一份 `.claude/web-spec-<任務代稱>.md`(檔名不同、不互相覆蓋)。

---

## 問題

### Q1. 主題 / 類型 (Theme)
- [ ] 個人履歷 Resume / CV
- [ ] 作品集 Portfolio
- [ ] Landing / 行銷頁
- [ ] 部落格 / 文章 Blog
- [ ] 活動 / 報名頁 Event
- [ ] 產品介紹 Product
- [ ] 文件 / 知識庫 Docs
- [ ] 其他:＿＿＿＿

### Q2. 靜態 vs 動態 (Static / Dynamic)
- [ ] 純靜態(HTML / CSS,少量 JS)
- [ ] 互動式(較多前端 JS,無後端)
- [ ] 動態(需後端 / 資料庫 / API)

### Q3. 深淺色 (Light / Dark)
- [ ] 只淺色
- [ ] 只深色
- [ ] 淺 / 深可切換
- [ ] 跟隨系統 auto
- [ ] 淺 / 深可切換 + 跟隨系統(light / dark / auto 三選)

### Q4. 語言 (Language)
- [ ] 單一語言 → 繁體中文
- [ ] 單一語言 → English
- [ ] 單一語言 → 其他:＿＿＿＿
- [ ] 多語言 → 繁中 + English (i18n)
- [ ] 多語言 → 其他組合 (i18n):＿＿＿＿
> 規則:只有**一種語言**才不用 i18n;**兩種(含)以上一律用 i18n**。

### Q5. 區塊 / 頁面 (Sections / Pages) — 依 Q1 主題選用對應子清單
> 依 Q1 選定主題,用下方對應子清單勾選需要的區塊;主題若為「其他」則臨時增列。常見共用:Hero、關於、聯絡、頁尾。

#### 個人履歷 Resume
- [ ] 個人簡介 / Hero(姓名・頭銜・一句話)
- [ ] 關於我 About
- [ ] 工作經歷 Experience
- [ ] 學歷 Education
- [ ] 技能 Skills
- [ ] 專案 / 作品 Projects
- [ ] 證照 / 獎項 Certs / Awards
- [ ] 語言能力 Languages
- [ ] 推薦 / 評價 Testimonials
- [ ] 聯絡方式 Contact
- [ ] 下載履歷 (PDF)

#### 作品集 Portfolio
- [ ] Hero / 簡介
- [ ] 關於 About
- [ ] 作品列表 Works(網格 / 分類 / 篩選)
- [ ] 作品詳情 Case study
- [ ] 服務 / 專長 Services
- [ ] 客戶 / 合作 Clients
- [ ] 評價 Testimonials
- [ ] 社群連結 Social
- [ ] 聯絡 Contact

#### Landing 行銷頁
- [ ] Hero(主打 + CTA)
- [ ] 痛點 / 問題 Problem
- [ ] 特色 / 功能 Features
- [ ] 運作方式 How it works
- [ ] 社會證明 / 客戶 logo
- [ ] 評價 Testimonials
- [ ] 定價 Pricing
- [ ] FAQ
- [ ] 行動呼籲 CTA
- [ ] 訂閱 / 名單表單 Lead form
- [ ] 頁尾 Footer

#### 部落格 / 文章 Blog
- [ ] 文章列表 Post list
- [ ] 分類 / 標籤 Categories / Tags
- [ ] 文章內文 Article
- [ ] 作者介紹 Author
- [ ] 搜尋 Search
- [ ] 相關文章 Related
- [ ] 訂閱 Newsletter
- [ ] 留言 Comments

#### 活動 / 報名 Event
- [ ] Hero(活動名・日期・地點)
- [ ] 活動簡介 About
- [ ] 議程 / 流程 Agenda
- [ ] 講者 / 來賓 Speakers
- [ ] 票券 / 報名 Register
- [ ] 地點 / 交通 Venue / Map
- [ ] 贊助 Sponsors
- [ ] 倒數計時 Countdown
- [ ] FAQ

#### 產品介紹 Product
- [ ] Hero(產品 + 主圖)
- [ ] 特色 Features
- [ ] 規格 Specs
- [ ] 展示 / 圖庫 Gallery
- [ ] 比較 Comparison
- [ ] 定價 Pricing
- [ ] 評價 Reviews
- [ ] FAQ
- [ ] 購買 / CTA

#### 文件 / 知識庫 Docs
- [ ] 側邊導覽 Sidebar
- [ ] 快速開始 Getting started
- [ ] 章節內文 Content
- [ ] 目錄 TOC
- [ ] 搜尋 Search
- [ ] 程式碼範例 Code
- [ ] API 參考 Reference
- [ ] 版本紀錄 Changelog

### Q6. 互動功能 (Features) — 通用 + 依 Q1 主題選用
> 先看「通用」,再依 Q1 主題用對應子清單加勾。

#### 通用(各主題皆可)
- [ ] 分頁 Tabs
- [ ] 深 / 淺色切換(需 Q3 選可切換)
- [ ] 語言切換(需 Q4 多語 i18n)
- [ ] 進場 / 捲動動畫
- [ ] 平滑捲動 / 錨點導覽
- [ ] 響應式 RWD(預設開)
- [ ] AI 聊天助理 chatbot(右下浮動・BYOK 自帶金鑰・💡 動態推薦問題;**引擎預設已啟用**,不需要才取消 → 產出頁設 `window.TW_CONFIG.chat = false` 停用)
- [ ] 其他:＿＿＿＿

#### 個人履歷 Resume
- [ ] 下載履歷 PDF / 列印友善
- [ ] 技能進度條 / 評級
- [ ] 經歷時間軸 Timeline
- [ ] 聯絡連結 / 表單

#### 作品集 Portfolio
- [ ] 作品篩選 / 分類
- [ ] 燈箱 Lightbox / 圖庫輪播
- [ ] 作品詳情 Modal / Case study
- [ ] Hover 互動效果
- [ ] 聯絡表單

#### Landing 行銷頁
- [ ] 名單 / 訂閱表單
- [ ] FAQ 摺疊 Accordion
- [ ] 價格切換(月 / 年)
- [ ] 倒數計時(促銷)
- [ ] 浮動 / 黏性 CTA
- [ ] 通知條 Banner

#### 部落格 / 文章 Blog
- [ ] 搜尋
- [ ] 分類 / 標籤篩選
- [ ] 目錄 TOC / 閱讀進度
- [ ] 程式碼高亮
- [ ] 訂閱表單
- [ ] 留言

#### 活動 / 報名 Event
- [ ] 報名 / 票券表單
- [ ] 倒數計時 Countdown
- [ ] 議程時間軸 / 分頁
- [ ] 地圖
- [ ] 加入行事曆 (.ics)
- [ ] FAQ 摺疊

#### 產品介紹 Product
- [ ] 圖庫 / 輪播 Carousel
- [ ] 規格比較表
- [ ] 價格切換
- [ ] 評價輪播
- [ ] FAQ 摺疊
- [ ] 購買 / 加入購物車 CTA

#### 文件 / 知識庫 Docs
- [ ] 側邊導覽 + 錨點
- [ ] 搜尋
- [ ] 目錄 TOC
- [ ] 程式碼複製鈕
- [ ] 版本切換
- [ ] 深 / 淺切換

### Q7. 內容來源 (Content)
- [ ] 我提供文字
- [ ] 用佔位內容
- [ ] 請你幫我擬

### Q8. 輸出與技術棧 (Output & Tech stack)
> timmy-web 原生 = **單檔 HTML + Tailwind CDN**(免建置)。以下記錄目標技術;**非原生者** skill 仍以單檔 HTML+Tailwind 產出,再以「提供可貼入的 styled markup / 元件」或「標明界線(後端另接)」方式處理,**不代建框架專案**。
- [ ] 單檔 HTML + Tailwind CDN(timmy-web 原生・**預設**)
- [ ] 多檔原生(HTML + 獨立 CSS / JS,無框架)
- [ ] 整合進現有前端框架(React / Vue / Svelte / Astro …)→ skill 給可貼入的 styled markup,不建專案骨架
- [ ] 動態 / 全端(需後端 / 資料庫 / API:Node·Express、Python·FastAPI、Next·Nuxt·SvelteKit、Cloudflare Workers …)→ 前端走原生,後端另接 · 另議
- [ ] 其他:＿＿＿＿
> 對應 Q2:選「動態(需後端)」→ 這裡選動態/全端;純靜態 → 前兩項即可。對應 Q9 部署:全端需 VPS / 容器或 serverless 平台。

### Q9. 部署 (Deployment)
- [ ] GitHub Pages(純靜態)
- [ ] Netlify(靜態 + Functions 動態)
- [ ] Vercel(靜態 + Serverless 動態)
- [ ] Cloudflare Pages / Workers(靜態 + Workers 動態 / API / KV·D1)
- [ ] 自有主機 / VPS / 容器(完整後端)
- [ ] 不部署(只要檔案,本機開啟)
- [ ] 其他:＿＿＿＿
> Netlify / Vercel / Cloudflare 皆可同時做**靜態 + serverless 動態**(Functions / Workers);GitHub Pages 僅靜態;需長駐後端或自管環境才用 VPS / 容器。

### Q10. 風格 (Style — timmy-web 10 款) — ⏳ 最後決定
> ❗不要一開始就問。待 Q1 主題 + Q5 區塊 + Q6 功能 + Q7 內容定案後,由 skill **主動建議 1–2 款**最合適的風格,使用者於下方確認(或自選)。**10 款皆支援 淺/深/系統 + i18n + RWD 貼邊寬版;預設 = 編輯手札。**
- [ ] 編輯手札 editorial(**預設・Timmy 招牌**:暖紙 + 藏青 + 金棕襯線)
- [ ] 薄荷柑橘 mintcitrus
- [ ] 清爽扁平 soft-flat
- [ ] 毛玻璃 glassmorphism
- [ ] 粉彩便當 pastel-bento
- [ ] 鮮豔漸層 gradient-pop
- [ ] 彩色雜誌 modern-broadsheet
- [ ] 彩色藍圖 blueprint
- [ ] 彩色 IDE terminal-light
- [ ] 撞色粗野派 neo-brutalist
- [ ] 其他 / 全新風格:＿＿＿＿
（線上風格實驗室 https://timmy-web-style.pages.dev/choose_style.html 預覽切換 10 款 + 主色/背景;離線用本機 `examples/choose_style.html`)

### Q11. 主色 / 背景色 (Accent / Background) — ⏳ 最後決定(隨 Q10)
> 由 skill 隨 Q10 風格一併**建議配色**(主色 + 背景),使用者確認或微調(每款在實驗室都有主色/背景色票即時換;深色模式用各款策展深色基底):
- 主色 Accent:＿＿＿＿(編輯風預設 #1d3557 藏青)
- 背景 Background:＿＿＿＿(編輯風預設 #f4efe3 暖紙)

---

## 決議摘要 (Summary)
（問答完成後在此彙整:主題 / 靜動態 / 區塊 / 功能 / 內容 / 語言 / 深淺 / 輸出與技術棧 / 部署;**最後**附上 skill 建議並經使用者確認的 **風格 + 配色**。然後才開始產出。)
