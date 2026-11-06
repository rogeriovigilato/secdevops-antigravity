---
description: Start, open, or check the Antigravity Galaxy Mind & Token Radar (/monitor start, /monitor popup, /monitor status, /monitor stop).
---

# Monitor Command (`/monitor`)

Launch or inspect the **Antigravity Galaxy Mind & Token Radar** (`E:\antigravity-kit\token-monitor`) on `http://127.0.0.1:4317` without manually opening folders or executables.

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

1. First, check if the server is already running with `E:\nodejs\node.exe E:\antigravity-kit\token-monitor\src\cli.js status`.
2. If `running` is `false`, launch the server using `run_command` with **`IsDaemon: true`** (`WaitMsBeforeAsync: 1500`) so Antigravity keeps the background process alive across turns:

```powershell
E:\nodejs\node.exe E:\antigravity-kit\token-monitor\src\server.js
```

3. Open the browser tab (or popup window) using:

```powershell
E:\nodejs\node.exe E:\antigravity-kit\token-monitor\src\cli.js start
```
*(If the user requested `/monitor popup`, pass `popup` instead of `start`.)*

### 2. For `/monitor status`

Run:

```powershell
$env:Path='E:\nodejs;'+$env:Path
E:\nodejs\node.exe E:\antigravity-kit\token-monitor\src\cli.js status
```

Report the returned status (`running`, `url`, `stepCount`, `latestInputTokens`, `latestCacheTokens`, `totalOutputTokens`) concisely to the user.

### 3. For `/monitor stop`

Stop any Node process listening on local port `4317`:

```powershell
Get-NetTCPConnection -LocalPort 4317 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
```

Confirm to the user that the Token Monitor server on `127.0.0.1:4317` has been stopped.
