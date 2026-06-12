# install/ — 跨平台安裝器

把本 repo 正本 **copy 部署**到各工具設定目錄(`~/.claude`、`~/.gemini`、`~/.codex`)。copy-based(非 symlink)、冪等、覆寫指示檔前自動備份(`*.bak-<時間>`)。

- [`install.py`](install.py) — 核心邏輯(**唯一來源**)。
- [`install.cmd`](install.cmd) — Windows 薄包裝 → `python install.py`(已設 `PYTHONUTF8=1`)。
- [`install.sh`](install.sh) — macOS / Linux 薄包裝 → `python3 install.py`。

## 用法

```bat
REM Windows
.\install\install.cmd --dry-run
.\install\install.cmd
```

```sh
# macOS / Linux
./install/install.sh --dry-run
./install/install.sh
```

旗標:`--dry-run`(只列不寫)、`--tool claude|gemini|codex|all`(預設 `all`;未偵測到的工具自動略過,`--tool <tool>` 可強制預覽)。

行為與部署細節見根目錄 [`../README.md`](../README.md)(人看正本)。
