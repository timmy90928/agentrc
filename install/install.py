#!/usr/bin/env python3
"""agentrc cross-platform installer (Windows / macOS / Linux).

Copies this repo's source-of-truth artifacts into the live tool config dirs:
  - skills/*          -> ~/.claude/skills/, ~/.gemini/skills/, ~/.codex/skills/   (cross-tool SKILL.md)
                         (+ ~/.agents/skills/ alongside the gemini install, for Google Antigravity)
  - shared + delta    -> ~/.claude/CLAUDE.md / ~/.gemini/GEMINI.md / ~/.codex/AGENTS.md  (concatenated per tool)
  - <tool>/agents/*   -> ~/.<tool>/agents/   (claude/gemini = *.md, codex = *.toml)
  - mcp/servers.json  -> per-tool MCP registration                    (cross-tool servers)

Only artifacts owned by this repo are touched; other skills already in a tool's
skills/ dir are left alone. Existing instruction files are backed up before overwrite.

Note (Codex skills): Codex reads ~/.codex/skills today (current installer convention);
official docs are steering users toward ~/.agents/skills (tracked in openai/skills#420).

Note (Antigravity): Google Antigravity (agy CLI / IDE) is Gemini-family and reuses ~/.gemini/
(reads ~/.gemini/GEMINI.md), so the gemini install ALSO serves Antigravity -- no separate tool.
To cover Antigravity's differing paths, the gemini install additionally mirrors skills to
~/.agents/skills/ and writes MCP to ~/.gemini/config/mcp_config.json (besides settings.json).
Verified 2026-06-12; these paths are medium-confidence -- check on the target machine.

Wrappers: install.cmd (Windows -> python) and install.sh (macOS/Linux -> python3).
Flags:  --dry-run            print actions, write nothing
        --tool claude|gemini|codex|all   (default: all)
"""
import argparse
import json
import shutil
import subprocess
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HOME = Path.home()

SHARED = REPO / "shared" / "principles.md"
SKILLS_SRC = REPO / "skills"
MCP_SRC = REPO / "mcp" / "servers.json"

TOOLS = {
    "claude": {
        "home": HOME / ".claude",
        "instr_name": "CLAUDE.md",
        "delta": REPO / "claude" / "CLAUDE.delta.md",
        "agents_src": REPO / "claude" / "agents",
        "agents_glob": "*.md",
    },
    "gemini": {
        "home": HOME / ".gemini",
        "instr_name": "GEMINI.md",
        "delta": REPO / "gemini" / "GEMINI.delta.md",
        "agents_src": REPO / "gemini" / "agents",
        "agents_glob": "*.md",
        # Google Antigravity (agy CLI / IDE) is Gemini-family and reuses ~/.gemini, so the
        # gemini install also serves it: detect `agy` too, and mirror skills to ~/.agents/skills.
        "detect_clis": ["gemini", "agy"],
        "extra_skills_dirs": [HOME / ".agents" / "skills"],
    },
    "codex": {
        "home": HOME / ".codex",
        "instr_name": "AGENTS.md",
        "delta": REPO / "codex" / "AGENTS.delta.md",
        "agents_src": REPO / "codex" / "agents",
        "agents_glob": "*.toml",  # Codex subagents are TOML, not Markdown-with-frontmatter
    },
}

DRY = False


def log(msg):
    print(msg)


def act(msg):
    print(("[dry-run] " if DRY else "[write]   ") + msg)


def backup(path: Path):
    if path.exists():
        b = path.with_name(path.name + ".bak-" + time.strftime("%Y%m%d-%H%M%S"))
        act(f"backup {path.name} -> {b.name}")
        if not DRY:
            shutil.copy2(path, b)


def write_text(path: Path, text: str):
    act(f"write {path}")
    if not DRY:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")


def tool_available(tool: str, forced: bool) -> bool:
    if tool == "claude":
        return True  # primary; ~/.claude always present
    # gemini / codex: present if forced, config dir exists, or a detect CLI is on PATH
    if forced or TOOLS[tool]["home"].exists():
        return True
    return any(shutil.which(cli) for cli in TOOLS[tool].get("detect_clis", [tool]))


def install_skills(tool: str):
    if not SKILLS_SRC.exists():
        return
    # main per-tool skills dir + any cross-tool extras (e.g. ~/.agents/skills for Antigravity)
    dst_roots = [TOOLS[tool]["home"] / "skills", *TOOLS[tool].get("extra_skills_dirs", [])]
    for sk in sorted(p for p in SKILLS_SRC.iterdir() if p.is_dir()):
        for dst_root in dst_roots:
            dst = dst_root / sk.name
            act(f"copy skill {sk.name} -> {dst}  (replaces repo-managed copy only)")
            if not DRY:
                dst_root.mkdir(parents=True, exist_ok=True)
                if dst.exists():
                    shutil.rmtree(dst)
                shutil.copytree(sk, dst)


def install_instructions(tool: str):
    delta = TOOLS[tool]["delta"]
    target = TOOLS[tool]["home"] / TOOLS[tool]["instr_name"]
    shared_text = SHARED.read_text(encoding="utf-8")
    delta_text = delta.read_text(encoding="utf-8") if delta.exists() else ""
    combined = shared_text.rstrip() + "\n\n" + delta_text.lstrip()
    backup(target)
    write_text(target, combined)


def install_agents(tool: str):
    src = TOOLS[tool]["agents_src"]
    dst = TOOLS[tool]["home"] / "agents"
    if not src.exists():
        return
    files = [f for f in sorted(src.glob(TOOLS[tool]["agents_glob"])) if f.name.lower() != "readme.md"]
    if not files:
        log(f"  ({tool}) no agents to install (scaffold only) — skipping")
        return
    for f in files:
        act(f"copy agent {f.name} -> {dst}")
        if not DRY:
            dst.mkdir(parents=True, exist_ok=True)
            shutil.copy2(f, dst / f.name)


def merge_mcp_json(path: Path, servers: dict):
    """Merge `servers` into the `mcpServers` key of a JSON config file (create if absent)."""
    data = {}
    if path.exists():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            data = {}
    data.setdefault("mcpServers", {}).update(servers)
    backup(path)
    write_text(path, json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def install_mcp(tool: str):
    """Register MCP servers per tool. Servers are cross-tool; config wiring is not.

    NOTE: exact per-tool wiring should be confirmed against current Claude Code /
    Gemini CLI / Codex CLI docs before relying on it. Dormant while servers.json is empty.
    """
    servers = {}
    if MCP_SRC.exists():
        try:
            servers = json.loads(MCP_SRC.read_text(encoding="utf-8")).get("mcpServers", {})
        except json.JSONDecodeError as e:
            log(f"  ({tool}) mcp/servers.json invalid JSON: {e} — skipping")
            return
    if not servers:
        log(f"  ({tool}) no MCP servers in mcp/servers.json — skipping")
        return

    if tool == "gemini":
        # Gemini CLI reads ~/.gemini/settings.json; Google Antigravity (shares ~/.gemini)
        # reads ~/.gemini/config/mcp_config.json. Both are JSON with an `mcpServers` key.
        gem_home = TOOLS["gemini"]["home"]
        for target in (gem_home / "settings.json", gem_home / "config" / "mcp_config.json"):
            merge_mcp_json(target, servers)
    elif tool == "claude":
        claude = shutil.which("claude")
        if not claude:
            log("  (claude) `claude` CLI not on PATH — register MCP manually; skipping")
            return
        for name, cfg in servers.items():
            # Verify `claude mcp` subcommand/args against current docs before trusting.
            act(f"claude mcp add-json -s user {name}")
            if not DRY:
                subprocess.run(
                    [claude, "mcp", "add-json", "-s", "user", name, json.dumps(cfg)],
                    check=False,
                )
    elif tool == "codex":
        # Codex: STDIO servers via `codex mcp add <name> [--env K=V] -- <command> [args...]`,
        # or [mcp_servers.<name>] tables in ~/.codex/config.toml. HTTP servers (url/bearer)
        # aren't covered here — add those to config.toml manually. Verify flags before trusting.
        codex = shutil.which("codex")
        if not codex:
            log("  (codex) `codex` CLI not on PATH — add via [mcp_servers] in ~/.codex/config.toml manually; skipping")
            return
        for name, cfg in servers.items():
            if not cfg.get("command"):
                log(f"  (codex) {name}: no `command` (HTTP server?) — add to config.toml manually; skipping")
                continue
            cmd = [codex, "mcp", "add", name]
            for k, v in (cfg.get("env") or {}).items():
                cmd += ["--env", f"{k}={v}"]
            cmd += ["--", cfg["command"], *cfg.get("args", [])]
            act(f"codex mcp add {name}")
            if not DRY:
                subprocess.run(cmd, check=False)


def main():
    global DRY
    ap = argparse.ArgumentParser(description="agentrc cross-platform installer")
    ap.add_argument("--dry-run", action="store_true", help="print actions, write nothing")
    ap.add_argument("--tool", choices=["claude", "gemini", "codex", "all"], default="all")
    args = ap.parse_args()
    DRY = args.dry_run

    tools = ["claude", "gemini", "codex"] if args.tool == "all" else [args.tool]
    log(f"agentrc install | repo={REPO} | home={HOME} | tool={args.tool} | dry_run={DRY}")
    for tool in tools:
        forced = args.tool == tool
        if not tool_available(tool, forced):
            log(f"== {tool}: not detected (no {TOOLS[tool]['home']} and not on PATH) "
                f"— skipping. Use --tool {tool} to force.")
            continue
        log(f"== {tool}: installing into {TOOLS[tool]['home']}")
        install_skills(tool)
        install_instructions(tool)
        install_agents(tool)
        install_mcp(tool)
        if tool == "gemini":
            log("  (gemini) note: ~/.gemini is shared by Google Antigravity (agy CLI / IDE); "
                "skills also mirrored to ~/.agents/skills/ and MCP to ~/.gemini/config/mcp_config.json")
    log("done." + (" (dry-run, nothing written)" if DRY else ""))


if __name__ == "__main__":
    main()
