# -*- coding: utf-8 -*-
"""sync_engine.py — 把通用引擎正本 inline 注入各風格頁 (timmy-web 方案乙)

正本     : skills/timmy-web/assets/tw-engine.js
目標各頁 : skills/timmy-web/examples/styles/*.html

正本含兩段,各以註解標記界定:
    /* ==TW-PREPAINT== */ … /* ==/TW-PREPAINT== */   通用 pre-paint
    /* ==TW-MAIN== */     … /* ==/TW-MAIN== */        主引擎

各頁含對應 HTML 標記,標記「之間」(不含標記本身)會被換成最新內容、包進 <script>:
    <!-- TW-PREPAINT:START --> … <!-- TW-PREPAINT:END -->   ← PREPAINT 段
    <!-- TW-MAIN:START -->     … <!-- TW-MAIN:END -->        ← MAIN 段

特性:
  - 冪等 (idempotent):重跑不再變動已同步的頁(以正規化後內容比對)。
  - 只動標記「之間」;標記行、per-page <script>window.TW_CONFIG={…}</script>、
    其餘頁面內容一律不碰。
  - 沒有任一標記的頁面會被略過(不報錯,僅計入 skipped)。
  - 標記不成對 / 順序顛倒 → 該頁報錯並跳過,exit code 非 0。

用法 (Windows):
    PYTHONUTF8=1 python skills/timmy-web/scripts/sync_engine.py
    # 預覽不寫檔:加 --check(有檔需更新則 exit 1,供 CI / 冪等驗證)
"""
import re
import sys
import argparse
from pathlib import Path

# scripts/ 的上一層 = skills/timmy-web/
SKILL_DIR = Path(__file__).resolve().parent.parent
ENGINE    = SKILL_DIR / "assets" / "tw-engine.js"
STYLES    = SKILL_DIR / "examples" / "styles"

# 正本內的段落標記(註解形式)。用 re.DOTALL 抓「之間」內容。
SRC_MARKERS = {
    "PREPAINT": (r"/\*\s*==TW-PREPAINT==\s*\*/", r"/\*\s*==/TW-PREPAINT==\s*\*/"),
    "MAIN":     (r"/\*\s*==TW-MAIN==\s*\*/",     r"/\*\s*==/TW-MAIN==\s*\*/"),
}

# 各頁 HTML 標記(注入點)。被換的是 START 與 END「之間」。
HTML_MARKERS = {
    "PREPAINT": ("<!-- TW-PREPAINT:START -->", "<!-- TW-PREPAINT:END -->"),
    "MAIN":     ("<!-- TW-MAIN:START -->",     "<!-- TW-MAIN:END -->"),
}


def extract_segment(src: str, name: str) -> str:
    """從正本擷取某段(標記之間),回傳去除前後空白行的內容。"""
    open_pat, close_pat = SRC_MARKERS[name]
    m = re.search(open_pat + r"(.*?)" + close_pat, src, re.DOTALL)
    if not m:
        raise SystemExit(f"[FATAL] 正本 tw-engine.js 找不到 {name} 段標記({open_pat} … {close_pat})")
    return m.group(1).strip("\n")


def build_block(name: str, segment: str) -> str:
    """組出要寫進 START/END 之間的內容:換行 + <script> 包住該段 + 換行。"""
    return f"\n<script>\n{segment}\n</script>\n"


def sync_file(path: Path, blocks: dict, write: bool):
    """回傳 (status, note)。status ∈ {'updated','unchanged','skipped','error'}"""
    text = path.read_text(encoding="utf-8")
    original = text
    present = []

    for name, (start_tok, end_tok) in HTML_MARKERS.items():
        n_start, n_end = text.count(start_tok), text.count(end_tok)
        if n_start == 0 and n_end == 0:
            continue  # 此頁無該標記,略過該段
        present.append(name)
        if n_start != 1 or n_end != 1:
            return "error", f"{name} 標記數量異常 (START={n_start}, END={n_end});需各恰好 1 個"
        si, ei = text.index(start_tok), text.index(end_tok)
        if si > ei:
            return "error", f"{name} 標記順序顛倒 (START 在 END 之後)"

        # 換掉 START 與 END「之間」(保留標記行本身)
        head = text[: si + len(start_tok)]
        tail = text[ei:]
        text = head + blocks[name] + tail

    if not present:
        return "skipped", "無任何 TW 標記"

    if text == original:
        return "unchanged", "已是最新 (" + "+".join(present) + ")"

    if write:
        path.write_text(text, encoding="utf-8", newline="")
    return "updated", "已注入 " + "+".join(present)


def main():
    ap = argparse.ArgumentParser(description="把 tw-engine.js 兩段 inline 注入各風格頁")
    ap.add_argument("--check", action="store_true",
                    help="只檢查不寫檔;有檔需更新則 exit 1(冪等 / CI 用)")
    args = ap.parse_args()
    write = not args.check

    if not ENGINE.exists():
        raise SystemExit(f"[FATAL] 找不到正本:{ENGINE}")
    src = ENGINE.read_text(encoding="utf-8")

    blocks = {name: build_block(name, extract_segment(src, name)) for name in SRC_MARKERS}

    targets = sorted(STYLES.glob("*.html"))
    if not targets:
        raise SystemExit(f"[FATAL] 找不到風格頁:{STYLES}/*.html")

    counts = {"updated": 0, "unchanged": 0, "skipped": 0, "error": 0}
    updated_files, error_files = [], []

    print(f"正本: {ENGINE}")
    print(f"  PREPAINT 段 {len(blocks['PREPAINT'])} 字元 / MAIN 段 {len(blocks['MAIN'])} 字元")
    print(f"目標: {STYLES}  ({len(targets)} 檔)")
    print("-" * 60)
    for p in targets:
        status, note = sync_file(p, blocks, write)
        counts[status] += 1
        if status == "updated":
            updated_files.append(p.name)
        elif status == "error":
            error_files.append((p.name, note))
        tag = {"updated": "UPDATED ", "unchanged": "unchanged", "skipped": "skipped ", "error": "ERROR   "}[status]
        print(f"  [{tag}] {p.name:32s} {note}")
    print("-" * 60)
    verb = "需更新" if args.check else "已更新"
    print(f"{verb}: {counts['updated']}  / 未變: {counts['unchanged']}  / 略過: {counts['skipped']}  / 錯誤: {counts['error']}")
    if updated_files:
        print(("將更新" if args.check else "更新了") + ": " + ", ".join(updated_files))

    if counts["error"]:
        print("有檔案標記異常,請修正後重跑。")
        sys.exit(2)
    if args.check and counts["updated"]:
        # --check 模式下「有檔需更新」視為未同步(非冪等),回非 0 供 CI 捕捉
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
