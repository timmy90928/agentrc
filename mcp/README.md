# mcp/ — MCP server 單一來源 (cross-tool)

MCP (Model Context Protocol) 是開放、跨 client 的協定:**同一個 server 可被 Claude Code、Gemini CLI、Codex CLI 等重用**,但各工具的「註冊設定檔位置/格式」不同。本資料夾的 `servers.json` 為 server 清單**正本**;`install` 讀它後分別寫入各工具的 MCP 設定。

> 目前 `servers.json` 為**空 scaffold**(`{"mcpServers": {}}`)——本機尚未設定任何 MCP server。要新增時照下方格式填入,再重跑 install。

## servers.json 格式

以 server 名為 key,值描述如何啟動該 server(本機 stdio 範例):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:/some/dir"],
      "env": {}
    }
  }
}
```

遠端 (HTTP/SSE) server 則用 `url`(視工具支援):

```json
{
  "mcpServers": {
    "example-remote": { "url": "https://mcp.example.com/sse" }
  }
}
```

## install 如何接到各工具(實作時依一手文件確認)

- **Claude Code**:user-scope 透過 `claude mcp add -s user …`,實際存於 `~/.claude.json`(待確認)。
- **Gemini CLI**:寫入 `~/.gemini/settings.json` 的 `mcpServers` 鍵(待確認)。
- **Codex CLI**(查證日 2026-06-12):`codex mcp add <name> [--env K=V] -- <command> [args]`,或 `~/.codex/config.toml` 的 `[mcp_servers.<name>]`(STDIO `command`/`args`/`env`/`env_vars`/`cwd`;streamable-HTTP `url`/`bearer_token_env_var`)。`install.py` 目前對 STDIO server 走 `codex mcp add`;HTTP server 請手動填 `config.toml`。

> ⚠️ 各工具的鍵名/結構可能與本 `servers.json` 略有差異;`install.py` 負責「正本 → 各工具格式」的轉換。轉換細節在 `install.py` 落地前先查 Claude Code / Gemini CLI / Codex CLI 官方文件,勿臆測。
>
> **機密**:server 的 token/key 走 `env` 並以**環境變數參照**為主,**勿** hardcode 進此檔(此檔會 commit)。
