'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createMonitorServer, isSafePublicPath } = require('../src/server');
const { validateLocalMonitorUrl } = require('../src/cli');

function rawHttpGet(port, reqPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: reqPath,
        method: 'GET',
        headers
      },
      res => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

test('Security [CWE-350]: blocks DNS Rebinding requests with untrusted Host header (403 Forbidden)', async () => {
  const server = createMonitorServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const rebindRes = await rawHttpGet(port, '/api/state', {
      Host: 'evil-rebind.attacker.com:4317'
    });
    assert.equal(rebindRes.statusCode, 403);
    assert.equal(rebindRes.headers['x-content-type-options'], 'nosniff');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('Security [CWE-22]: isSafePublicPath blocks sibling prefix bypass and parent traversal', () => {
  assert.equal(typeof isSafePublicPath, 'function');
  const fakePublic = path.resolve('C:/app/public');
  const siblingBypass = path.resolve('C:/app/public-secret/token.txt');
  const parentTraversal = path.resolve('C:/app/package.json');
  const validAsset = path.resolve('C:/app/public/app.js');

  assert.equal(isSafePublicPath(fakePublic, siblingBypass), false);
  assert.equal(isSafePublicPath(fakePublic, parentTraversal), false);
  assert.equal(isSafePublicPath(fakePublic, validAsset), true);
});

test('Security [CWE-693 & CWE-209]: responses include defensive security headers and 500 hides internal details', async () => {
  const server = createMonitorServer();
  await new Promise(resolve => server.close ? resolve() : resolve());
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const res = await rawHttpGet(port, '/api/state', {
      Host: `127.0.0.1:${port}`
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-frame-options'], 'DENY');
    assert.equal(res.headers['referrer-policy'], 'no-referrer');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('Security [CWE-78]: validateLocalMonitorUrl rejects untrusted hosts, protocols, and shell metacharacters', () => {
  assert.equal(typeof validateLocalMonitorUrl, 'function');
  assert.equal(validateLocalMonitorUrl('http://127.0.0.1:4317'), 'http://127.0.0.1:4317/');
  assert.equal(validateLocalMonitorUrl('http://localhost:4317'), 'http://localhost:4317/');

  assert.throws(() => validateLocalMonitorUrl('javascript:alert(1)'), /Invalid monitor URL/);
  assert.throws(() => validateLocalMonitorUrl('http://evil.com:4317'), /Untrusted monitor host/);
  assert.throws(() => validateLocalMonitorUrl("http://127.0.0.1:4317/';calc.exe;'"), /Invalid monitor URL/);
});

test('Security [CWE-79]: app.js escapes agent and skill names in innerHTML chip rendering', () => {
  const appJsPath = path.join(__dirname, '..', 'public', 'app.js');
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.match(appJs, /\$\{escapeHtml\(ag\)\}\s*\(\$\{hits\}x\)/);
  assert.match(appJs, /\$\{escapeHtml\(sk\)\}\s*\(\$\{hits\}x\)/);
  assert.match(appJs, /★\s*\$\{escapeHtml\(s\.skill\)\}\s*\(\$\{odHits\}x\)/);
});
