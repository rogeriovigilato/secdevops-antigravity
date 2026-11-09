#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUT = path.join(__dirname, 'results', 'disk-footprint-2026-11-08.json');

function parseArgs(argv) {
  const options = { out: DEFAULT_OUT };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out' && argv[i + 1]) {
      options.out = path.resolve(argv[i + 1]);
      i += 1;
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('Usage: node benchmarks/disk-footprint.js [--out <json>]');
      process.exit(0);
    }
  }
  return options;
}

function listFiles(root, predicate) {
  const results = [];
  if (!fs.existsSync(root)) return results;

  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        const relative = path.relative(REPO_ROOT, full).replace(/\\/g, '/');
        if (!predicate || predicate(relative)) {
          results.push({ path: relative, bytes: fs.statSync(full).size });
        }
      }
    }
  }
  return results;
}

function sum(files) {
  return files.reduce((total, file) => total + file.bytes, 0);
}

function kb(bytes) {
  return Math.round((bytes / 1024) * 10) / 10;
}

function percentage(part, whole) {
  return Math.round((100 * part / whole) * 10) / 10;
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  const catalogAll = listFiles(path.join(REPO_ROOT, 'skills'))
    .concat(listFiles(path.join(REPO_ROOT, 'agents')))
    .concat(listFiles(path.join(REPO_ROOT, 'rules')));

  const catalogMain = listFiles(path.join(REPO_ROOT, 'skills'), file => /^skills\/[^/]+\/SKILL\.md$/.test(file))
    .concat(listFiles(path.join(REPO_ROOT, 'agents'), file => /^agents\/[^/]+\.md$/.test(file)))
    .concat(listFiles(path.join(REPO_ROOT, 'rules'), file => /^rules\/.+\.md$/.test(file) && file !== 'rules/README.md'));

  const preloadedMain = listFiles(path.join(REPO_ROOT, '.agents', 'skills'), file => /^\.agents\/skills\/[^/]+\/SKILL\.md$/.test(file))
    .concat(listFiles(path.join(REPO_ROOT, '.agents', 'agents'), file => /^\.agents\/agents\/[^/]+\.md$/.test(file)))
    .concat(listFiles(path.join(REPO_ROOT, '.agents', 'rules'), file => /^\.agents\/rules\/[^/]+\.md$/.test(file) && file !== '.agents/rules/README.md'))
    .concat(listFiles(path.join(REPO_ROOT, '.agents', 'workflows'), file => /^\.agents\/workflows\/[^/]+\.md$/.test(file)));

  const preloadedAll = listFiles(path.join(REPO_ROOT, '.agents'));

  const catalogAllBytes = sum(catalogAll);
  const catalogMainBytes = sum(catalogMain);
  const preloadedMainBytes = sum(preloadedMain);
  const preloadedAllBytes = sum(preloadedAll);

  const result = {
    generatedAt: new Date().toISOString(),
    definitions: {
      catalogAll: 'Every file under skills/, agents/, and rules/ (recursive).',
      catalogMain: 'skills/*/SKILL.md + agents/*.md + rules/**/*.md excluding rules/README.md.',
      preloadedMain: '.agents/skills/*/SKILL.md + .agents/agents/*.md + .agents/rules/*.md excluding .agents/rules/README.md + .agents/workflows/*.md.',
      preloadedAll: 'Every file under .agents/ (recursive), including references and READMEs.'
    },
    sizes: {
      catalogAll: { bytes: catalogAllBytes, kb: kb(catalogAllBytes), files: catalogAll.length },
      catalogMain: { bytes: catalogMainBytes, kb: kb(catalogMainBytes), files: catalogMain.length },
      preloadedMain: { bytes: preloadedMainBytes, kb: kb(preloadedMainBytes), files: preloadedMain.length },
      preloadedAll: { bytes: preloadedAllBytes, kb: kb(preloadedAllBytes), files: preloadedAll.length }
    },
    comparisons: {
      catalogAllVsPreloadedMain: {
        reductionPct: percentage(catalogAllBytes - preloadedMainBytes, catalogAllBytes),
        ratioPct: percentage(preloadedMainBytes, catalogAllBytes)
      },
      catalogMainVsPreloadedMain: {
        reductionPct: percentage(catalogMainBytes - preloadedMainBytes, catalogMainBytes),
        ratioPct: percentage(preloadedMainBytes, catalogMainBytes)
      },
      catalogAllVsPreloadedAll: {
        reductionPct: percentage(catalogAllBytes - preloadedAllBytes, catalogAllBytes),
        ratioPct: percentage(preloadedAllBytes, catalogAllBytes)
      }
    }
  };

  fs.mkdirSync(path.dirname(options.out), { recursive: true });
  fs.writeFileSync(options.out, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

  console.log(`catalogAll: ${result.sizes.catalogAll.kb} KB (${result.sizes.catalogAll.files} files)`);
  console.log(`catalogMain: ${result.sizes.catalogMain.kb} KB (${result.sizes.catalogMain.files} files)`);
  console.log(`preloadedMain: ${result.sizes.preloadedMain.kb} KB (${result.sizes.preloadedMain.files} files)`);
  console.log(`preloadedAll: ${result.sizes.preloadedAll.kb} KB (${result.sizes.preloadedAll.files} files)`);
  console.log(`catalogAll -> preloadedMain: -${result.comparisons.catalogAllVsPreloadedMain.reductionPct}%`);
  console.log(`catalogMain -> preloadedMain: -${result.comparisons.catalogMainVsPreloadedMain.reductionPct}%`);
  console.log(`catalogAll -> preloadedAll: -${result.comparisons.catalogAllVsPreloadedAll.reductionPct}%`);
  console.log(`Wrote ${path.relative(REPO_ROOT, options.out)}`);
}

try {
  main();
} catch (error) {
  console.error(`disk footprint failed: ${error.message}`);
  process.exitCode = 1;
}
