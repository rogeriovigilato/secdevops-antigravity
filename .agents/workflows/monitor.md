---
description: Start, open, or check the Antigravity Galaxy Mind & Token Radar (/monitor start, /monitor popup, /monitor status, /monitor stop).
---

# Monitor Command (`/monitor`)

Launch or inspect the **Antigravity Galaxy Mind & Token Radar** on `http://127.0.0.1:4317` without manually opening folders or executables.

**Requirements:** Node.js >= 18. The monitor runs a local HTTP server on `127.0.0.1:4317`; if `node` is not in `PATH`, set `AGY_NODE_BIN` to the binary.

## Usage

```text
/monitor                # starts the background server and opens http://127.0.0.1:4317
/monitor start          # starts the background server and opens the full dashboard
/monitor popup          # starts the background server and opens a compact corner popup window
/monitor status         # shows server status and current session token metrics in chat
/monitor stop           # stops the background monitor server on port 4317
```

## Process

### 1. For `/monitor`, `/monitor start`, or `/monitor popup`

1. Resolve the portable `node` binary: `node` in `PATH` → `AGY_NODE_BIN` env var → `E:\nodejs\node.exe` (last-resort legacy fallback of the original author; see README). Resolve the `token-monitor` directory: `.\token-monitor` in the workspace root → `AGY_MONITOR_DIR` env var. If neither exists, stop and tell the user to clone the repository (the monitor ships in `token-monitor/`).
2. Check if the server is already running with `node <token-monitor>/src/cli.js status`.
3. If `running` is `false`, launch the server using `run_command` with **`IsDaemon: true`** (`WaitMsBeforeAsync: 1500`) so Antigravity keeps the background process alive across turns:

```powershell
$node = if (Get-Command node -ErrorAction SilentlyContinue) { 'node' } elseif ($env:AGY_NODE_BIN) { $env:AGY_NODE_BIN } else { 'E:\nodejs\node.exe' }  # last-resort legacy path
$dir  = if (Test-Path '.\token-monitor\src\server.js') { '.\token-monitor' } elseif ($env:AGY_MONITOR_DIR) { $env:AGY_MONITOR_DIR } else { throw 'token-monitor not found: run /monitor from the repository root or set AGY_MONITOR_DIR' }
& $node "$dir\src\server.js"
```

4. Open the browser tab (or popup window) using:

```powershell
$node = if (Get-Command node -ErrorAction SilentlyContinue) { 'node' } elseif ($env:AGY_NODE_BIN) { $env:AGY_NODE_BIN } else { 'E:\nodejs\node.exe' }  # last-resort legacy path
$dir  = if (Test-Path '.\token-monitor\src\cli.js') { '.\token-monitor' } elseif ($env:AGY_MONITOR_DIR) { $env:AGY_MONITOR_DIR } else { throw 'token-monitor not found: run /monitor from the repository root or set AGY_MONITOR_DIR' }
& $node "$dir\src\cli.js" start
```
*(If the user requested `/monitor popup`, pass `popup` instead of `start`.)*

### 2. For `/monitor status`

Run:

```powershell
$node = if (Get-Command node -ErrorAction SilentlyContinue) { 'node' } elseif ($env:AGY_NODE_BIN) { $env:AGY_NODE_BIN } else { 'E:\nodejs\node.exe' }  # last-resort legacy path
$dir  = if (Test-Path '.\token-monitor\src\cli.js') { '.\token-monitor' } elseif ($env:AGY_MONITOR_DIR) { $env:AGY_MONITOR_DIR } else { throw 'token-monitor not found: run /monitor from the repository root or set AGY_MONITOR_DIR' }
& $node "$dir\src\cli.js" status
```

Report the returned status (`running`, `url`, `stepCount`, `latestInputTokens`, `latestCacheTokens`, `totalOutputTokens`) concisely to the user.

### 3. For `/monitor stop`

Stop any Node process listening on local port `4317`:

```powershell
Get-NetTCPConnection -LocalPort 4317 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
```

Confirm to the user that the Token Monitor server on `127.0.0.1:4317` has been stopped.
