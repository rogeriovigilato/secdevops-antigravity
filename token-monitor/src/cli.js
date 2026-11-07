'use strict';

const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { DEFAULT_HOST, DEFAULT_PORT, buildLiveState } = require('./server');

function checkServerStatus(port = DEFAULT_PORT, host = DEFAULT_HOST) {
  return new Promise(resolve => {
    const req = http.get({ host, port, path: '/api/state', timeout: 1200 }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({ running: res.statusCode === 200, state: data });
        } catch {
          resolve({ running: false, state: null });
        }
      });
    });
    req.on('error', () => resolve({ running: false, state: null }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ running: false, state: null });
    });
  });
}

function startBackgroundServer(options = {}) {
  const nodeBin = options.nodeBin || process.execPath;
  const serverScript = path.join(__dirname, 'server.js');
  const child = spawn(nodeBin, [serverScript], {
    cwd: path.join(__dirname, '..'),
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });
  child.unref();
  return child.pid;
}

function validateLocalMonitorUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(String(rawUrl || ''));
  } catch {
    throw new Error('Invalid monitor URL');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Invalid monitor URL protocol');
  }
  const host = parsed.hostname.toLowerCase();
  if (host !== '127.0.0.1' && host !== 'localhost') {
    throw new Error('Untrusted monitor host');
  }
  if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw new Error('Invalid monitor URL path');
  }
  return parsed.href;
}

function openBrowserUrl(url, mode = 'tab') {
  if (process.env.AGY_NO_OPEN === '1') return;
  const safeUrl = validateLocalMonitorUrl(url);
  if (mode === 'popup') {
    const cmd = `Start-Process msedge -ArgumentList '--app=${safeUrl}','--window-size=420,320' -ErrorAction SilentlyContinue`;
    const child = spawn('powershell.exe', ['-NoProfile', '-Command', cmd], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    child.unref();
    return;
  }
  const child = spawn('cmd.exe', ['/c', 'start', '', safeUrl], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });
  child.unref();
}

async function runCliCommand(rawAction = 'start') {
  const action = String(rawAction || 'start').toLowerCase().trim();
  const url = `http://${DEFAULT_HOST}:${DEFAULT_PORT}`;

  if (action === 'status') {
    const status = await checkServerStatus();
    const state = status.state || buildLiveState();
    return {
      action: 'status',
      running: status.running,
      url,
      stepCount: state.totals.stepCount,
      latestInputTokens: state.totals.latestInputTokens,
      latestCacheTokens: state.totals.latestCacheTokens,
      totalOutputTokens: state.totals.totalOutputTokens
    };
  }

  if (action === 'start' || action === 'popup') {
    const before = await checkServerStatus();
    let pid = null;
    if (!before.running) {
      pid = startBackgroundServer();
      await new Promise(r => setTimeout(r, 600));
    }
    openBrowserUrl(url, action === 'popup' ? 'popup' : 'tab');
    const after = await checkServerStatus();
    return {
      action,
      running: after.running,
      alreadyRunning: before.running,
      pid,
      url
    };
  }

  return { action: 'unknown', running: false, url };
}

if (require.main === module) {
  const arg = process.argv[2] || 'start';
  runCliCommand(arg).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}

module.exports = {
  checkServerStatus,
  runCliCommand,
  validateLocalMonitorUrl
};
