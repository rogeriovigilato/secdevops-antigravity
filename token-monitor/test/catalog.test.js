'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCatalog } = require('../src/catalog');

test('loadCatalog loads preloaded and on-demand rings without overlap', () => {
  const catalog = loadCatalog({
    preloadedRoot: 'E:\\antigravity-kit\\global-profile\\.agents',
    catalogRoot: 'E:\\antigravity-kit\\secdevops-antigravity'
  });

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
