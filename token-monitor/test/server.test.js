'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { buildLiveState, createMonitorServer } = require('../src/server');

function httpGet(port, pathUrl) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path: pathUrl }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

test('buildLiveState returns real conversations, catalog rings, and parsed steps', () => {
  const state = buildLiveState();
  assert.ok(state.timestamp);
  assert.equal(state.catalog.ring1Agents.length, 11);
  assert.equal(state.catalog.ring2Skills.length, 15);
  assert.ok(Array.isArray(state.conversations));
  assert.ok(Array.isArray(state.steps));
  assert.ok(state.steps.length > 0);
});

test('createMonitorServer serves /api/state, index.html, and 404 for unknown files', async () => {
  const server = createMonitorServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const apiRes = await httpGet(port, '/api/state');
    assert.equal(apiRes.statusCode, 200);
    const data = JSON.parse(apiRes.body);
    assert.equal(data.catalog.ring1Agents.length, 11);
    assert.ok(data.steps.length > 0);

    const htmlRes = await httpGet(port, '/');
    assert.equal(htmlRes.statusCode, 200);
    assert.match(htmlRes.body, /Antigravity Galaxy Mind/);

    const notFoundRes = await httpGet(port, '/nonexistent.file');
    assert.equal(notFoundRes.statusCode, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
