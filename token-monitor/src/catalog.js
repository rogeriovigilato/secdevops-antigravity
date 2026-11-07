'use strict';

const fs = require('node:fs');
const path = require('node:path');

const FALLBACK_PRELOADED_ROOT = 'E:\\antigravity-kit\\global-profile\\.agents';
const FALLBACK_CATALOG_ROOT = 'E:\\antigravity-kit\\secdevops-antigravity';

function resolveDefaultPreloadedRoot() {
  if (process.env.AGY_PRELOADED_ROOT) return process.env.AGY_PRELOADED_ROOT;
  const repoAgents = path.resolve(__dirname, '..', '..', '.agents');
  if (fs.existsSync(path.join(repoAgents, 'skills'))) return repoAgents;
  return FALLBACK_PRELOADED_ROOT;
}

function resolveDefaultCatalogRoot() {
  if (process.env.AGY_CATALOG_ROOT) return process.env.AGY_CATALOG_ROOT;
  const repoRoot = path.resolve(__dirname, '..', '..');
  if (fs.existsSync(path.join(repoRoot, 'skills')) && fs.existsSync(path.join(repoRoot, 'agents'))) {
    return repoRoot;
  }
  return FALLBACK_CATALOG_ROOT;
}

function readDirSubfolders(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort();
  } catch {
    return [];
  }
}

function readMarkdownBasenames(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
      .map(entry => path.basename(entry.name, '.md'))
      .sort();
  } catch {
    return [];
  }
}

function extractFrontmatterDescription(filePath) {
  try {
    if (!fs.existsSync(filePath)) return '';
    const raw = fs.readFileSync(filePath, 'utf8');
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) return '';
    const descMatch = fmMatch[1].match(/^description:\s*(.+)$/m);
    if (!descMatch) return '';
    return descMatch[1].trim().replace(/^["']|["']$/g, '');
  } catch {
    return '';
  }
}

let cachedCatalogKey = null;
let cachedCatalogObj = null;

function loadCatalog(options = {}) {
  const preloadedRoot = options.preloadedRoot || resolveDefaultPreloadedRoot();
  const catalogRoot = options.catalogRoot || resolveDefaultCatalogRoot();
  const cacheKey = `${preloadedRoot}|${catalogRoot}`;
  if (cachedCatalogKey === cacheKey && cachedCatalogObj) {
    return cachedCatalogObj;
  }

  const ring1Agents = readMarkdownBasenames(path.join(preloadedRoot, 'agents'));
  const ring2Skills = readDirSubfolders(path.join(preloadedRoot, 'skills'));
  const rules = readMarkdownBasenames(path.join(preloadedRoot, 'rules'))
    .filter(name => name.startsWith('common-'));
  const workflows = readMarkdownBasenames(path.join(preloadedRoot, 'workflows'));

  const allAgents = readMarkdownBasenames(path.join(catalogRoot, 'agents'));
  const allSkills = readDirSubfolders(path.join(catalogRoot, 'skills'));

  const preloadedAgentSet = new Set(ring1Agents);
  const preloadedSkillSet = new Set(ring2Skills);

  const ring3AgentsOD = allAgents.filter(name => !preloadedAgentSet.has(name));
  const ring4SkillsOD = allSkills.filter(name => !preloadedSkillSet.has(name));

  const skillDescriptions = {};
  for (const sk of [...ring2Skills, ...ring4SkillsOD]) {
    const prePath = path.join(preloadedRoot, 'skills', sk, 'SKILL.md');
    const catPath = path.join(catalogRoot, 'skills', sk, 'SKILL.md');
    skillDescriptions[sk] = extractFrontmatterDescription(fs.existsSync(prePath) ? prePath : catPath);
  }

  const agentDescriptions = {};
  for (const ag of [...ring1Agents, ...ring3AgentsOD]) {
    const prePath = path.join(preloadedRoot, 'agents', `${ag}.md`);
    const catPath = path.join(catalogRoot, 'agents', `${ag}.md`);
    agentDescriptions[ag] = extractFrontmatterDescription(fs.existsSync(prePath) ? prePath : catPath);
  }

  cachedCatalogObj = Object.freeze({
    ring1Agents: Object.freeze(ring1Agents),
    ring2Skills: Object.freeze(ring2Skills),
    ring3AgentsOD: Object.freeze(ring3AgentsOD),
    ring4SkillsOD: Object.freeze(ring4SkillsOD),
    rules: Object.freeze(rules),
    workflows: Object.freeze(workflows),
    descriptions: Object.freeze({
      skills: Object.freeze(skillDescriptions),
      agents: Object.freeze(agentDescriptions)
    })
  });
  cachedCatalogKey = cacheKey;
  return cachedCatalogObj;
}

module.exports = {
  loadCatalog,
  extractFrontmatterDescription,
  resolveDefaultPreloadedRoot,
  resolveDefaultCatalogRoot,
  readDirSubfolders,
  readMarkdownBasenames
};
