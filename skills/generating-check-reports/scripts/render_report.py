# -*- coding: utf-8 -*-
"""render_report.py — 把檢查結果 (results JSON) 注入模板,輸出單檔 HTML 檢查報告。

正本模板 : skills/generating-check-reports/assets/report-template.html
            模板含唯一佔位符  "__REPORT_DATA__"(JSON 字串字面值),整段被換成結果 JSON。

用法 (Windows 加 PYTHONUTF8=1 以免非 UTF-8 locale 出錯):
    PYTHONUTF8=1 python skills/generating-check-reports/scripts/render_report.py <results.json> <output.html>

行為:
  - 讀 <results.json>,由 items[] 算本次計數與通過率。
  - 維護 history[]:以「日期」為鍵 —— 同日重跑取代當日該筆(冪等),跨日則 append。
  - 算 delta(對照上一筆「不同」run 的逐項狀態):fixed / regressed / still_failing。
  - 把更新後的 history/delta「寫回 <results.json>」(狀態正本),再渲染 HTML(原地覆寫 <output.html>)。
  - → 同一(目標 × checklist)永遠只有一份 results.json + 一份 HTML,重檢覆寫、不產生 v2/v3。

通過率定義: pass_rate = pass / (pass + fail + warn) * 100,排除 na / info(無法評分項)。
不呼叫系統時間: 報告日期一律取自 results.json 的 "date"(由模型於檢查時填入)。
"""
import json
import sys
from pathlib import Path

# scripts/ 的上一層 = skills/generating-check-reports/
SKILL_DIR = Path(__file__).resolve().parent.parent
TEMPLATE = SKILL_DIR / "assets" / "report-template.html"
PLACEHOLDER = '"__REPORT_DATA__"'  # 模板內唯一佔位符(含外層雙引號)

SCORED = ("pass", "fail", "warn")      # 計入通過率的狀態
FAILING = ("fail", "warn")             # 視為「未過」的狀態(供 delta 用)
VALID_STATUS = ("pass", "fail", "warn", "na", "info")


def die(msg: str) -> "None":
    """印出明確錯誤並以非 0 結束(腳本自行處理錯誤,不丟回給呼叫者猜)。"""
    print(f"[FATAL] {msg}", file=sys.stderr)
    sys.exit(2)


def load_json(path: Path) -> dict:
    if not path.exists():
        die(f"找不到 results JSON:{path}")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        die(f"results JSON 格式錯誤:{path}\n  {e}")
    if not isinstance(data, dict):
        die("results JSON 頂層必須是物件 (object)")
    if not isinstance(data.get("items"), list) or not data["items"]:
        die('results JSON 缺少非空的 "items" 陣列')
    return data


def count_items(items: list) -> dict:
    """由 items[] 算各狀態計數與通過率。未知 status 視為 info 並警告。"""
    counts = {s: 0 for s in VALID_STATUS}
    for it in items:
        st = it.get("status", "info")
        if st not in counts:
            print(f"[WARN] 未知 status {st!r}(item id={it.get('id')}),計為 info", file=sys.stderr)
            st = "info"
        counts[st] += 1
    scored = sum(counts[s] for s in SCORED)
    pass_rate = round(counts["pass"] / scored * 100, 1) if scored else 0.0
    return {
        "total": len(items),
        "pass": counts["pass"], "fail": counts["fail"], "warn": counts["warn"],
        "na": counts["na"], "info": counts["info"],
        "pass_rate": pass_rate,
    }


def status_map(items: list) -> dict:
    """{item_id: status};供 delta 與歷史快照比對。id 缺漏時以索引補。"""
    out = {}
    for i, it in enumerate(items):
        out[str(it.get("id", f"#{i}"))] = it.get("status", "info")
    return out


def title_of(items: list, item_id: str) -> str:
    for i, it in enumerate(items):
        if str(it.get("id", f"#{i}")) == item_id:
            return it.get("title", item_id)
    return item_id


def compute_delta(items: list, cur: dict, prev: "dict|None") -> dict:
    """對照上一筆 run 的逐項狀態,分類出 fixed / regressed / still_failing(各為標題清單)。"""
    if not prev:
        return {"fixed": [], "regressed": [], "still_failing": [], "has_prev": False}
    fixed, regressed, still = [], [], []
    for iid, st in cur.items():
        was = prev.get(iid)
        if was is None:
            continue  # 新增項,不算進 delta
        if was in FAILING and st == "pass":
            fixed.append(title_of(items, iid))
        elif was == "pass" and st in FAILING:
            regressed.append(title_of(items, iid))
        elif was in FAILING and st in FAILING:
            still.append(title_of(items, iid))
    return {"fixed": fixed, "regressed": regressed, "still_failing": still, "has_prev": True}


def build_timeline(history: list, id_title: dict) -> list:
    """走訪整段 history(每筆含 statuses),逐次算出「該次相對前次」的變更:
       fixed(修好)/ new_issues(新發現問題)/ still_failing(仍未解)。供歷史頁畫成時間軸。"""
    tl = []
    prev = None
    for e in history:
        cur = e.get("statuses", {}) or {}
        fixed, new_issues, still = [], [], []
        for iid, st in cur.items():
            title = id_title.get(iid, iid)
            if prev is None:
                if st in FAILING:
                    new_issues.append(title)          # 初次檢查:當下未過項即「初次發現」
            else:
                was = prev.get(iid)
                if was in FAILING and st == "pass":
                    fixed.append(title)
                elif was not in FAILING and st in FAILING:
                    new_issues.append(title)          # 上次未失敗(含新增項)→ 本次失敗
                elif was in FAILING and st in FAILING:
                    still.append(title)
        tl.append({
            "date": e.get("date", ""), "pass_rate": e.get("pass_rate", 0),
            "pass": e.get("pass", 0), "fail": e.get("fail", 0), "warn": e.get("warn", 0),
            "fixed": fixed, "new_issues": new_issues, "still_failing": still,
            "is_first": prev is None,
        })
        prev = cur
    return tl


def compute_since(items: list, history: list) -> list:
    """對每個 item 算出「目前狀態的連續區間起點」:回傳與 items 同序的清單,
       每元素為 {"n": 第幾次(1-based), "date": 該次時間戳} 或 None(無歷史時)。
       作法:從最後一次往前走,狀態與當前相同就延伸,一遇不同即停 → 區間起點。"""
    n = len(history)
    out = []
    for i, it in enumerate(items):
        iid = str(it.get("id", f"#{i}"))
        cur = it.get("status")
        start = None
        for k in range(n - 1, -1, -1):
            if (history[k].get("statuses") or {}).get(iid) == cur:
                start = k
            else:
                break
        out.append({"n": start + 1, "date": history[start].get("date", "")} if start is not None else None)
    return out


def update_history(data: dict, summary: dict, cur_status: dict) -> "dict|None":
    """以日期為鍵維護 history[];回傳「上一筆不同 run」的 statuses 供 delta 用。

    規則:history[-1] 與本次同日 → 取代當日該筆(同日重跑冪等),delta 對照 history[-2];
          否則 → append 新筆,delta 對照原 history[-1]。
    """
    history = data.get("history")
    if not isinstance(history, list):
        history = []
    date = data.get("date", "")
    entry = {"date": date, **summary, "statuses": cur_status}

    same_day = history and history[-1].get("date") == date
    prev_statuses = (history[-2].get("statuses") if same_day and len(history) >= 2
                     else (history[-1].get("statuses") if not same_day and history else None))
    if same_day:
        history[-1] = entry
    else:
        history.append(entry)
    data["history"] = history
    return prev_statuses


def render(template: str, data: dict) -> str:
    if template.count(PLACEHOLDER) != 1:
        die(f"模板佔位符 {PLACEHOLDER} 必須恰好出現 1 次(目前 {template.count(PLACEHOLDER)} 次):{TEMPLATE}")
    payload = json.dumps(data, ensure_ascii=False)
    # JSON 內若含 </script 會提前關閉 <script>;轉義之以保單檔 HTML 完整。
    payload = payload.replace("</", "<\\/")
    return template.replace(PLACEHOLDER, payload)


def main():
    if len(sys.argv) != 3:
        die("用法:render_report.py <results.json> <output.html>")
    results_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])

    if not TEMPLATE.exists():
        die(f"找不到模板:{TEMPLATE}")
    template = TEMPLATE.read_text(encoding="utf-8")

    data = load_json(results_path)
    items = data["items"]

    summary = count_items(items)
    cur_status = status_map(items)
    prev_status = update_history(data, summary, cur_status)
    data["delta"] = compute_delta(items, cur_status, prev_status)
    data["summary"] = summary  # 注入供模板總覽用(與 history[-1] 計數一致)

    # 寫回狀態正本(含累積 history / delta),再渲染 HTML 視圖。
    results_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # 逐次變更時間軸(由 history 的 statuses 鏈計算;供歷史頁呈現)。
    id_title = {str(it.get("id", f"#{i}")): it.get("title", str(it.get("id", f"#{i}")))
                for i, it in enumerate(items)}
    timeline = build_timeline(data["history"], id_title)

    # 每項「自第幾次起為此狀態」(用含 statuses 的 data.history 計算)。
    since = compute_since(items, data["history"])

    # 注入 HTML 時剝掉 history 內的 statuses 快照(僅供腳本比對,毋須進視圖)。
    view = json.loads(json.dumps(data))  # deep copy
    for h in view.get("history", []):
        h.pop("statuses", None)
    view["timeline"] = timeline
    hist = data["history"]
    for idx, it in enumerate(view.get("items", [])):
        if idx < len(since) and since[idx]:
            it["since"] = since[idx]
        iid = str(it.get("id", f"#{idx}"))
        # 逐項歷次狀態序列(供迷你狀態軌):每次該項的 status,未列入該次則為 null。
        it["track"] = [(h.get("statuses") or {}).get(iid) for h in hist]

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(render(template, view), encoding="utf-8")

    d = data["delta"]
    print(f"OK  通過率 {summary['pass_rate']}%  "
          f"(pass {summary['pass']} / fail {summary['fail']} / warn {summary['warn']} "
          f"/ na {summary['na']} / info {summary['info']}; 共 {summary['total']} 項)")
    print(f"    history {len(data['history'])} 筆  |  "
          f"delta fixed {len(d['fixed'])} / regressed {len(d['regressed'])} / still {len(d['still_failing'])}")
    print(f"    狀態正本: {results_path}")
    print(f"    報告 HTML: {out_path}")


if __name__ == "__main__":
    main()
