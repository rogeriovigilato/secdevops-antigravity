#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_BRAIN = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');
const DEFAULT_CONFIG = path.join(__dirname, 'baseline-runs.json');
const DEFAULT_OUT_JSON = path.join(__dirname, 'results', 'baseline-2026-11-08.json');
const DEFAULT_OUT_MD = path.join(__dirname, 'results', 'baseline-2026-11-08.md');

function parseArgs(argv) {
  const options = {
    brain: DEFAULT_BRAIN,
    config: DEFAULT_CONFIG,
    outJson: DEFAULT_OUT_JSON,
    outMd: DEFAULT_OUT_MD
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--brain' && next) {
      options.brain = path.resolve(next);
      i += 1;
    } else if (arg === '--config' && next) {
      options.config = path.resolve(next);
      i += 1;
    } else if (arg === '--out-json' && next) {
      options.outJson = path.resolve(next);
      i += 1;
    } else if (arg === '--out-md' && next) {
      options.outMd = path.resolve(next);
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node benchmarks/extract-metrics.js [--brain <dir>] [--config <json>] [--out-json <file>] [--out-md <file>]');
      process.exit(0);
    }
  }

  return options;
}

function findConversation(brainRoot, shortId) {
  const entries = fs.readdirSync(brainRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith(shortId));

  if (entries.length === 0) {
    throw new Error(`Conversation not found for id prefix: ${shortId}`);
  }
  if (entries.length > 1) {
    throw new Error(`Ambiguous conversation id prefix ${shortId}: ${entries.map(entry => entry.name).join(', ')}`);
  }

  return path.join(brainRoot, entries[0].name);
}

function transcriptPath(conversationDir) {
  const logsDir = path.join(conversationDir, '.system_generated', 'logs');
  const full = path.join(logsDir, 'transcript_full.jsonl');
  const compact = path.join(logsDir, 'transcript.jsonl');

  if (fs.existsSync(full)) return full;
  if (fs.existsSync(compact)) return compact;
  throw new Error(`No transcript found in ${conversationDir}`);
}

function readRun(brainRoot, shortId) {
  const conversationDir = findConversation(brainRoot, shortId);
  const file = transcriptPath(conversationDir);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
  const byStep = new Map();

  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (!entry || entry.type !== 'PLANNER_RESPONSE') continue;

    const input = Number(entry.input_tokens) || 0;
    const cache = Number(entry.cache_read_tokens) || 0;
    const output = Number(entry.output_tokens) || 0;
    if (input === 0 && output === 0) continue;

    const toolCalls = Array.isArray(entry.tool_calls)
      ? entry.tool_calls.map(call => call && call.name).filter(Boolean)
      : [];

    const step = {
      step: Number(entry.step_index) || 0,
      input,
      cache,
      output,
      prompt: input + cache,
      tools: toolCalls
    };

    // The runtime can emit more than one PLANNER_RESPONSE per step. Keep the
    // token-bearing entry with the largest payload instead of double-counting.
    const previous = byStep.get(step.step);
    if (!previous || (step.input + step.output) > (previous.input + previous.output)) {
      byStep.set(step.step, step);
    }
  }

  const steps = [...byStep.values()].sort((a, b) => a.step - b.step);
  if (steps.length === 0) {
    throw new Error(`No token-bearing PLANNER_RESPONSE entries in ${shortId}`);
  }

  const first = steps[0];
  const last = steps[steps.length - 1];
  const totals = steps.reduce((accumulator, step) => {
    accumulator.input += step.input;
    accumulator.cache += step.cache;
    accumulator.output += step.output;
    accumulator.prompt += step.prompt;
    return accumulator;
  }, { input: 0, cache: 0, output: 0, prompt: 0 });

  return {
    id: shortId,
    cacheStart: first.cache === 0 ? 'cold' : 'warm',
    stepCount: steps.length,
    steps,
    step1: first,
    lastStep: last,
    totals
  };
}

function stats(values) {
  const nums = values.filter(value => Number.isFinite(value));
  if (nums.length === 0) {
    return { n: 0, mean: null, median: null, sd: null, min: null, max: null };
  }

  const sorted = [...nums].sort((a, b) => a - b);
  const mean = nums.reduce((sum, value) => sum + value, 0) / nums.length;
  const variance = nums.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / nums.length;
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];

  return {
    n: nums.length,
    mean,
    median,
    sd: Math.sqrt(variance),
    min: sorted[0],
    max: sorted[sorted.length - 1]
  };
}

function aggregate(runs) {
  const coldRuns = runs.filter(run => run.cacheStart === 'cold');
  const step2Runs = runs.filter(run => run.stepCount >= 2 && run.steps[1]);

  return {
    step1Prompt: stats(runs.map(run => run.step1.prompt)),
    step2Prompt: stats(step2Runs.map(run => run.steps[1].prompt)),
    cumulativePrompt: stats(runs.map(run => run.totals.prompt)),
    newInputAll: stats(runs.map(run => run.totals.input)),
    newInputCold: stats(coldRuns.map(run => run.totals.input)),
    output: stats(runs.map(run => run.totals.output)),
    coldRuns: coldRuns.length,
    warmRuns: runs.length - coldRuns.length
  };
}

function loadConfig(configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!config.scenarios || typeof config.scenarios !== 'object') {
    throw new Error('Config must contain a "scenarios" object');
  }
  return config;
}

function renderMarkdown(result) {
  const lines = [];
  lines.push(`# Token Benchmark Baseline (${result.date})`);
  lines.push('');
  lines.push(`Generated at: ${result.generatedAt}`);
  lines.push('');
  lines.push(`Task: ${result.task}`);
  lines.push('');
  lines.push('Source: Antigravity runtime `transcript.jsonl` counters. Raw transcripts are not committed.');
  lines.push('');

  for (const [scenarioId, scenario] of Object.entries(result.scenarios)) {
    lines.push(`## ${scenarioId} — ${scenario.label}`);
    lines.push('');
    lines.push('| Run | Cache start | Step #1 prompt | Step #2 prompt | Cumulative prompt | New input | Output |');
    lines.push('| :--- | :--- | ---: | ---: | ---: | ---: | ---: |');

    for (const run of scenario.runs) {
      const step2 = run.steps[1] ? run.steps[1].prompt : '—';
      lines.push(`| \`${run.id}\` | ${run.cacheStart} | ${run.step1.prompt} | ${step2} | ${run.totals.prompt} | ${run.totals.input} | ${run.totals.output} |`);
    }

    const a = scenario.aggregates;
    lines.push(`| **Mean** | — | **${Math.round(a.step1Prompt.mean)}** | **${a.step2Prompt.mean === null ? '—' : Math.round(a.step2Prompt.mean)}** | **${Math.round(a.cumulativePrompt.mean)}** | **${Math.round(a.newInputCold.mean)}** | **${Math.round(a.output.mean)}** |`);
    lines.push('');
    if (a.warmRuns > 0) {
      lines.push(`> Cold-start new-input mean uses N=${a.newInputCold.n}; ${a.warmRuns} warm-start run(s) are excluded from that column. The all-run new-input mean is ${Math.round(a.newInputAll.mean)}.`);
      lines.push('');
    }
    lines.push(`- Step #1 prompt mean: N=${a.step1Prompt.n}, sd=${a.step1Prompt.sd.toFixed(1)}`);
    lines.push(`- Step #2 prompt mean: N=${a.step2Prompt.n}, sd=${a.step2Prompt.sd === null ? '—' : a.step2Prompt.sd.toFixed(1)}`);
    lines.push(`- Cumulative prompt mean: N=${a.cumulativePrompt.n}, sd=${a.cumulativePrompt.sd.toFixed(1)}`);
    lines.push(`- New input mean (all runs): N=${a.newInputAll.n}, mean=${Math.round(a.newInputAll.mean)}`);
    lines.push(`- New input mean (cold-start runs only): N=${a.newInputCold.n}, mean=${Math.round(a.newInputCold.mean)}`);
    lines.push(`- Output mean: N=${a.output.n}, sd=${a.output.sd.toFixed(1)}`);
    lines.push(`- Runs: ${a.coldRuns} cold-start, ${a.warmRuns} warm-start`);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = loadConfig(options.config);

  if (!fs.existsSync(options.brain)) {
    throw new Error(`Antigravity brain directory not found: ${options.brain}`);
  }

  const result = {
    generatedAt: new Date().toISOString(),
    date: config.date,
    task: config.task,
    source: 'Antigravity transcript.jsonl',
    scenarios: {}
  };

  for (const [scenarioId, scenario] of Object.entries(config.scenarios)) {
    const runs = scenario.runs.map(shortId => readRun(options.brain, shortId));
    result.scenarios[scenarioId] = {
      label: scenario.label,
      runs,
      aggregates: aggregate(runs)
    };
  }

  fs.mkdirSync(path.dirname(options.outJson), { recursive: true });
  fs.writeFileSync(options.outJson, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(options.outMd, renderMarkdown(result), 'utf8');

  for (const [scenarioId, scenario] of Object.entries(result.scenarios)) {
    const a = scenario.aggregates;
    console.log(`${scenarioId}: step1=${Math.round(a.step1Prompt.mean)} | step2=${a.step2Prompt.mean === null ? '—' : Math.round(a.step2Prompt.mean)} | cumulative=${Math.round(a.cumulativePrompt.mean)} | newInput(cold)=${Math.round(a.newInputCold.mean)} (N=${a.newInputCold.n}) | output=${Math.round(a.output.mean)}`);
  }
  console.log(`Wrote ${path.relative(REPO_ROOT, options.outJson)}`);
  console.log(`Wrote ${path.relative(REPO_ROOT, options.outMd)}`);
}

try {
  main();
} catch (error) {
  console.error(`benchmark extraction failed: ${error.message}`);
  process.exitCode = 1;
}
