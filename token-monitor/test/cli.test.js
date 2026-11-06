'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createMonitorServer } = require('../src/server');
const { checkServerStatus, runCliCommand } = require('../src/cli');

test('checkServerStatus detects when monitor server is running and when stopped', async () => {
  const stopped = await checkServerStatus(59991);
  assert.equal(stopped.running, false);

  const server = createMonitorServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const live = await checkServerStatus(port);
    assert.equal(live.running, true);
    assert.ok(live.state.catalog.ring1Agents.length === 11);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('runCliCommand status returns token summary even when server is offline', async () => {
  process.env.AGY_NO_OPEN = '1';
  const res = await runCliCommand('status');
  assert.equal(res.action, 'status');
  assert.equal(typeof res.latestInputTokens, 'number');
  assert.match(res.url, /127\.0\.0\.1:4317/);
});
