'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  parseTranscriptLine,
  detectStepEntities,
  summarizeTranscriptSteps,
  listBrainConversations
} = require('../src/transcript-parser');

const SAMPLE_CATALOG = Object.freeze({
  ring1Agents: ['planner', 'architect', 'tdd-guide', 'security-reviewer'],
  ring2Skills: ['unified-memory', 'verification-loop', 'security-review'],
  ring3AgentsOD: ['homelab-architect', 'go-reviewer'],
  ring4SkillsOD: ['kubernetes-patterns', 'osint-investigation', 'homelab-wireguard-vpn'],
  rules: ['common-secdevops-router', 'common-testing', 'common-security']
});

test('parseTranscriptLine returns null for invalid JSON or empty input', () => {
  assert.equal(parseTranscriptLine(''), null);
  assert.equal(parseTranscriptLine('   '), null);
  assert.equal(parseTranscriptLine('{bad json'), null);
  assert.equal(parseTranscriptLine(null), null);
});

test('detectStepEntities identifies preloaded and on-demand skills and agents from tool calls', () => {
  const stepObj = {
    step_index: 4,
    type: 'PLANNER_RESPONSE',
    thinking: 'Reading kubernetes-patterns skill on demand with architect.',
    input_tokens: 16200,
    cache_read_tokens: 14500,
    output_tokens: 210,
    tool_calls: [
      {
        name: 'read_file',
        args: { Path: 'E:/antigravity-kit/secdevops-antigravity/skills/kubernetes-patterns/SKILL.md' }
      }
    ]
  };

  const detected = detectStepEntities(stepObj, SAMPLE_CATALOG);
  assert.equal(detected.skill, 'kubernetes-patterns');
  assert.equal(detected.skillRing, 4);
  assert.equal(detected.isOnDemandSkill, true);
  assert.equal(detected.tool, 'read_file');
  assert.match(detected.target, /kubernetes-patterns\/SKILL\.md/);
});

test('detectStepEntities identifies invoked subagent and testing rule on doctor.js run', () => {
  const stepObj = {
    step_index: 7,
    type: 'PLANNER_RESPONSE',
    thinking: 'Running doctor.js to verify installation.',
    input_tokens: 19400,
    cache_read_tokens: 17600,
    output_tokens: 180,
    tool_calls: [
      {
        name: 'invoke_subagent',
        args: { TypeName: 'tdd-guide', Role: 'TDD Specialist' }
      },
      {
        name: 'run_command',
        args: { CommandLine: 'node scripts/doctor.js --target antigravity' }
      }
    ]
  };

  const detected = detectStepEntities(stepObj, SAMPLE_CATALOG);
  assert.equal(detected.agent, 'tdd-guide');
  assert.equal(detected.agentRing, 1);
  assert.equal(detected.isOnDemandAgent, false);
});

test('summarizeTranscriptSteps aggregates tokens, hit counts, and steps immutably', () => {
  const rawLines = [
    JSON.stringify({
      step_index: 1,
      type: 'PLANNER_RESPONSE',
      created_at: '2026-11-06T04:43:26Z',
      thinking: 'Checking context/00-STATE.md first.',
      input_tokens: 14311,
      cache_read_tokens: 12000,
      output_tokens: 136,
      tool_calls: [{ name: 'read_file', args: { Path: 'e:\\antigravity-kit\\global-profile\\context\\00-STATE.md' } }]
    }),
    JSON.stringify({
      step_index: 2,
      type: 'PLANNER_RESPONSE',
      created_at: '2026-11-06T10:37:35Z',
      thinking: 'Loading kubernetes-patterns on demand.',
      input_tokens: 16800,
      cache_read_tokens: 14900,
      output_tokens: 220,
      tool_calls: [{ name: 'read_file', args: { Path: 'E:/antigravity-kit/secdevops-antigravity/skills/kubernetes-patterns/SKILL.md' } }]
    })
  ];

  const summary = summarizeTranscriptSteps(rawLines, SAMPLE_CATALOG);
  assert.equal(summary.steps.length, 2);
  assert.equal(summary.totals.latestInputTokens, 16800);
  assert.equal(summary.totals.totalOutputTokens, 356);
  assert.equal(summary.steps[1].skill, 'kubernetes-patterns');
  assert.equal(summary.steps[1].skillRing, 4);
  assert.equal(summary.usageCounts.skills['kubernetes-patterns'], 1);
});

test('listBrainConversations extracts friendly title, kind, and stepCount for main and subagent sessions', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-brain-test-'));
  try {
    const mainDir = path.join(tmpDir, '55921528-f516-4b19-a39d-e2c22e785852', '.system_generated', 'logs');
    const subDir = path.join(tmpDir, '96c5425b-840f-4150-a59a-16004e27a386', '.system_generated', 'logs');
    fs.mkdirSync(mainDir, { recursive: true });
    fs.mkdirSync(subDir, { recursive: true });

    fs.writeFileSync(
      path.join(mainDir, 'transcript.jsonl'),
      [
        JSON.stringify({
          step_index: 0,
          type: 'USER_INPUT',
          content: '<USER_REQUEST>\npega o contexto aí e vamos seguir o roadmap\n</USER_REQUEST>'
        }),
        JSON.stringify({ step_index: 1, type: 'PLANNER_RESPONSE', input_tokens: 1000, output_tokens: 50 }),
        JSON.stringify({ step_index: 2, type: 'PLANNER_RESPONSE', input_tokens: 1200, output_tokens: 60 })
      ].join('\n'),
      'utf8'
    );

    fs.writeFileSync(
      path.join(subDir, 'transcript.jsonl'),
      [
        JSON.stringify({
          step_index: 0,
          type: 'SYSTEM_MESSAGE',
          content: '<SYSTEM_MESSAGE>\n[Message] timestamp=2026-11-06T15:30:46Z sender=55921528 content=Quero segmentar a minha rede de casa separando dispositivos IoT\n</SYSTEM_MESSAGE>'
        }),
        JSON.stringify({ step_index: 1, type: 'PLANNER_RESPONSE', input_tokens: 900, output_tokens: 40 })
      ].join('\n'),
      'utf8'
    );

    const convs = listBrainConversations(tmpDir);
    assert.equal(convs.length, 2);
    const mainConv = convs.find(c => c.shortId === '55921528');
    const subConv = convs.find(c => c.shortId === '96c5425b');

    assert.equal(mainConv.kind, 'main');
    assert.equal(mainConv.stepCount, 2);
    assert.match(mainConv.title, /pega o contexto aí/i);

    assert.equal(subConv.kind, 'subagent');
    assert.equal(subConv.stepCount, 1);
    assert.match(subConv.title, /Quero segmentar a minha rede/i);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
