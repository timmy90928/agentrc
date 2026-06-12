@echo off
REM agentrc installer - Windows thin wrapper. Runs the cross-platform install.py.
REM Usage:  install\install.cmd [--dry-run] [--tool claude/gemini/all]
setlocal

REM avoid UnicodeDecodeError on non-UTF-8 Windows locales
set "PYTHONUTF8=1"

set "PY=python"
where python >nul 2>nul || set "PY=python3"
where %PY%   >nul 2>nul || (
  >&2 echo Python not found on PATH ^(need python or python3^).
  exit /b 1
)

"%PY%" "%~dp0install.py" %*
exit /b %ERRORLEVEL%
