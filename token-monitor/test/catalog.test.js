'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { loadCatalog, resolveDefaultPreloadedRoot, resolveDefaultCatalogRoot } = require('../src/catalog');
const { DEFAULT_BRAIN_ROOT } = require('../src/server');

test('loadCatalog loads preloaded and on-demand rings without overlap', () => {
  const catalog = loadCatalog();

  assert.ok(Array.isArray(catalog.ring1Agents));
  assert.ok(Array.isArray(catalog.ring2Skills));
  assert.ok(Array.isArray(catalog.ring3AgentsOD));
  assert.ok(Array.isArray(catalog.ring4SkillsOD));

  assert.equal(catalog.ring1Agents.length, 11);
  assert.equal(catalog.ring2Skills.length, 15);
  assert.ok(catalog.ring3AgentsOD.length >= 19);
  assert.ok(catalog.ring4SkillsOD.length >= 65);

  // Ensure no preloaded skill is duplicated in on-demand ring 4
  const overlapSkills = catalog.ring4SkillsOD.filter(s => catalog.ring2Skills.includes(s));
  assert.deepEqual(overlapSkills, []);

  // Ensure no preloaded agent is duplicated in on-demand ring 3
  const overlapAgents = catalog.ring3AgentsOD.filter(a => catalog.ring1Agents.includes(a));
  assert.deepEqual(overlapAgents, []);
});

test('portable defaults resolve relative to repo root and os.homedir() instead of hardcoded username or E: drive', () => {
  assert.ok(resolveDefaultPreloadedRoot().endsWith('.agents'));
  assert.ok(DEFAULT_BRAIN_ROOT.startsWith(os.homedir()) || Boolean(process.env.AGY_BRAIN_ROOT));
  assert.ok(path.isAbsolute(resolveDefaultCatalogRoot()));
});
