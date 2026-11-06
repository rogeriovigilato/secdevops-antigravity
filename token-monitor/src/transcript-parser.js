'use strict';

const fs = require('node:fs');
const path = require('node:path');

const CONTEXT_WINDOW_TOKENS = 200000;

function parseTranscriptLine(line) {
  if (typeof line !== 'string' || !line.trim()) {
    return null;
  }
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function extractTargetFromToolCall(toolCall) {
  if (!toolCall || typeof toolCall !== 'object') return '';
  const args = toolCall.args || {};
  return String(
    args.Path ||
    args.CommandLine ||
    args.TypeName ||
    args.Query ||
    args.SearchPath ||
    toolCall.name ||
    ''
  ).replace(/^"+|"+$/g, '').replace(/\\\\/g, '/').replace(/\\/g, '/');
}

function matchAllItemsFromText(text, list) {
  if (!text || !Array.isArray(list)) return [];
  const lower = text.toLowerCase();
  return list.filter(item => lower.includes(item.toLowerCase()));
}

function matchItemFromText(text, list) {
  const matches = matchAllItemsFromText(text, list);
  return matches.length > 0 ? matches[0] : null;
}

function inferRuleFromContext(combinedText, toolName) {
  const lower = combinedText.toLowerCase();
  if (lower.includes('context/') || lower.includes('00-state') || lower.includes('01-roadmap') || lower.includes('skills/')) {
    return 'common-secdevops-router';
  }
  if (lower.includes('test') || lower.includes('doctor.js') || lower.includes('tdd')) {
    return 'common-testing';
  }
  if (lower.includes('secret') || lower.includes('security') || lower.includes('gitignore')) {
    return 'common-security';
  }
  if (lower.includes('git ') || lower.includes('commit')) {
    return 'common-git-workflow';
  }
  if (toolName === 'edit_file' || toolName === 'write_file') {
    return 'common-coding-style';
  }
  return 'common-development-workflow';
}

function buildLocalizedThoughts(entities, rawThinking) {
  const shortTarget = entities.target.length > 70
    ? '...' + entities.target.slice(-67)
    : entities.target;

  const layerPt = entities.isOnDemandSkill ? 'Anel 4 (Sob Demanda)' : 'Anel 2 (Pré-carregada)';
  const layerEn = entities.isOnDemandSkill ? 'Ring 4 (On-Demand)' : 'Ring 2 (Preloaded)';

  const extraSkillsPt = entities.allMatchedSkills && entities.allMatchedSkills.length > 1
    ? ` (Skills acionadas: ${entities.allMatchedSkills.join(', ')})`
    : '';
  const extraSkillsEn = entities.allMatchedSkills && entities.allMatchedSkills.length > 1
    ? ` (Triggered skills: ${entities.allMatchedSkills.join(', ')})`
    : '';

  const thoughtPt = `Acionando subagent [${entities.agent}] + skill [${entities.skill}] (${layerPt}) via ${entities.tool} em "${shortTarget}"${extraSkillsPt}.`;
  const thoughtEn = rawThinking && rawThinking.trim()
    ? rawThinking.trim().slice(0, 260)
    : `Running subagent [${entities.agent}] + skill [${entities.skill}] (${layerEn}) via ${entities.tool} on "${shortTarget}"${extraSkillsEn}.`;

  return { thoughtPt, thoughtEn };
}

function detectStepEntities(stepObj, catalog, previousEntities = null) {
  const toolCalls = Array.isArray(stepObj.tool_calls) ? stepObj.tool_calls : [];
  const primaryCall = toolCalls[0] || { name: 'thinking', args: {} };
  const allTargets = toolCalls.map(extractTargetFromToolCall).join(' | ');
  const thought = typeof stepObj.thinking === 'string' ? stepObj.thinking.trim() : '';
  const combined = `${allTargets} ${thought}`;

  const matchedOdSkills = matchAllItemsFromText(combined, catalog.ring4SkillsOD);
  const matchedPreSkills = matchAllItemsFromText(combined, catalog.ring2Skills);
  const allMatchedSkills = [...matchedOdSkills, ...matchedPreSkills];

  const odSkill = matchedOdSkills[0] || null;
  const preSkill = matchedPreSkills[0] || null;

  let skill = odSkill || preSkill;
  let isOnDemandSkill = Boolean(odSkill);

  if (!skill) {
    const lower = combined.toLowerCase();
    if (lower.includes('memory-vault') || lower.includes('context/') || lower.includes('00-state') || lower.includes('01-roadmap')) {
      skill = 'unified-memory';
      isOnDemandSkill = false;
    } else if (lower.includes('doctor.js') || lower.includes('test')) {
      skill = 'verification-loop';
      isOnDemandSkill = false;
    } else if (previousEntities && previousEntities.skill) {
      skill = previousEntities.skill;
      isOnDemandSkill = Boolean(previousEntities.isOnDemandSkill);
    } else {
      skill = 'unified-memory';
      isOnDemandSkill = false;
    }
  }
  const skillRing = isOnDemandSkill ? 4 : 2;

  const subCall = toolCalls.find(tc => tc.name === 'invoke_subagent');
  const explicitAgent = subCall && subCall.args ? String(subCall.args.TypeName || '').replace(/^"+|"+$/g, '') : null;
  const odAgent = explicitAgent && catalog.ring3AgentsOD.includes(explicitAgent)
    ? explicitAgent
    : matchItemFromText(combined, catalog.ring3AgentsOD);
  const preAgent = explicitAgent && catalog.ring1Agents.includes(explicitAgent)
    ? explicitAgent
    : matchItemFromText(combined, catalog.ring1Agents);

  const lower = combined.toLowerCase();
  const agent = odAgent || preAgent || (
    lower.includes('vlan') || lower.includes('cisco') || lower.includes('network') ? 'network-config-reviewer'
      : primaryCall.name === 'run_command' ? 'tdd-guide'
        : primaryCall.name === 'edit_file' || primaryCall.name === 'write_file' ? 'code-reviewer'
          : (previousEntities && previousEntities.agent) ? previousEntities.agent : 'planner'
  );
  const isOnDemandAgent = Boolean(odAgent);
  const agentRing = isOnDemandAgent ? 3 : 1;

  const rule = inferRuleFromContext(combined, primaryCall.name);

  // Pick the most informative target path (prefer SKILL.md or code file over generic rule)
  const skillCall = toolCalls.find(tc => extractTargetFromToolCall(tc).includes('SKILL.md')) || primaryCall;

  return Object.freeze({
    tool: skillCall.name || primaryCall.name || 'thinking',
    target: extractTargetFromToolCall(skillCall) || 'session-context',
    skill,
    skillRing,
    isOnDemandSkill,
    allMatchedSkills: Object.freeze(allMatchedSkills.length > 0 ? allMatchedSkills : [skill]),
    agent,
    agentRing,
    isOnDemandAgent,
    rule
  });
}

function summarizeTranscriptSteps(lines, catalog) {
  const steps = [];
  const skillCounts = {};
  const agentCounts = {};
  let totalOutputTokens = 0;
  let latestInputTokens = 0;
  let latestCacheTokens = 0;
  let lastEntities = null;

  for (const rawLine of lines) {
    const parsed = typeof rawLine === 'string' ? parseTranscriptLine(rawLine) : rawLine;
    if (!parsed || parsed.type !== 'PLANNER_RESPONSE') continue;

    const inputTokens = Number(parsed.input_tokens) || 0;
    const cacheReadTokens = Number(parsed.cache_read_tokens) || 0;
    const outputTokens = Number(parsed.output_tokens) || 0;
    if (inputTokens === 0 && outputTokens === 0) continue;

    const entities = detectStepEntities(parsed, catalog, lastEntities);
    lastEntities = entities;

    for (const sk of entities.allMatchedSkills) {
      skillCounts[sk] = (skillCounts[sk] || 0) + 1;
    }
    agentCounts[entities.agent] = (agentCounts[entities.agent] || 0) + 1;

    totalOutputTokens += outputTokens;
    latestInputTokens = inputTokens;
    latestCacheTokens = cacheReadTokens;

    const { thoughtPt, thoughtEn } = buildLocalizedThoughts(entities, parsed.thinking);
    const totalPromptTokens = inputTokens + cacheReadTokens;
    const totalStepTokens = totalPromptTokens + outputTokens;

    steps.push(Object.freeze({
      stepNumber: steps.length + 1,
      rawStepIndex: parsed.step_index,
      createdAt: parsed.created_at || null,
      inputTokens,
      cacheReadTokens,
      outputTokens,
      totalPromptTokens,
      totalStepTokens,
      cacheHitPct: totalPromptTokens > 0 ? Math.round((cacheReadTokens / totalPromptTokens) * 100) : 0,
      contextWindowPct: Math.min(100, Math.round((totalPromptTokens / CONTEXT_WINDOW_TOKENS) * 100)),
      thought: thoughtPt,
      thoughtPt,
      thoughtEn,
      ...entities
    }));
  }

  const latestTotalPrompt = latestInputTokens + latestCacheTokens;

  return Object.freeze({
    steps: Object.freeze(steps),
    totals: Object.freeze({
      stepCount: steps.length,
      latestInputTokens,
      latestCacheTokens,
      latestTotalPrompt,
      totalOutputTokens,
      latestCacheHitPct: latestTotalPrompt > 0 ? Math.round((latestCacheTokens / latestTotalPrompt) * 100) : 0,
      latestContextPct: Math.min(100, Math.round((latestTotalPrompt / CONTEXT_WINDOW_TOKENS) * 100))
    }),
    usageCounts: Object.freeze({
      skills: Object.freeze({ ...skillCounts }),
      agents: Object.freeze({ ...agentCounts })
    })
  });
}

function cleanSnippet(rawText, maxLen = 38) {
  const cleaned = String(rawText || '')
    .replace(/<\/?[A-Z_]+>/g, ' ')
    .replace(/\[Message\][^\n]*?content=/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '';
  return cleaned.length > maxLen ? `${cleaned.slice(0, maxLen - 1).trim()}…` : cleaned;
}

function extractConversationMetadata(logPath, shortId) {
  let kind = 'main';
  let title = shortId;
  let stepCount = 0;

  try {
    const raw = fs.readFileSync(logPath, 'utf8');
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
      const obj = parseTranscriptLine(line);
      if (!obj) continue;

      if (obj.type === 'PLANNER_RESPONSE') {
        stepCount += 1;
      }

      if (obj.step_index === 0 || title === shortId) {
        if (obj.type === 'SYSTEM_MESSAGE') {
          kind = 'subagent';
          const content = String(obj.content || '');
          const quotedMatch = content.match(/"([^"]{10,})"/);
          if (quotedMatch) {
            title = cleanSnippet(quotedMatch[1]);
          } else {
            title = cleanSnippet(content) || shortId;
          }
        } else if (obj.type === 'USER_INPUT' && title === shortId) {
          kind = 'main';
          const content = String(obj.content || '');
          const reqMatch = content.match(/<USER_REQUEST>\s*([\s\S]*?)\s*<\/USER_REQUEST>/i);
          title = cleanSnippet(reqMatch ? reqMatch[1] : content) || shortId;
        }
      }
    }
  } catch {
    // Keep fallback metadata
  }

  return Object.freeze({ kind, title, stepCount });
}

function listBrainConversations(brainRoot) {
  try {
    if (!fs.existsSync(brainRoot)) return [];
    const entries = fs.readdirSync(brainRoot, { withFileTypes: true })
      .filter(e => e.isDirectory());

    const list = [];
    for (const entry of entries) {
      const fullLog = path.join(brainRoot, entry.name, '.system_generated', 'logs', 'transcript_full.jsonl');
      const compactLog = path.join(brainRoot, entry.name, '.system_generated', 'logs', 'transcript.jsonl');
      const logPath = fs.existsSync(fullLog) ? fullLog : (fs.existsSync(compactLog) ? compactLog : null);
      if (!logPath) continue;
      const metaSource = fs.existsSync(compactLog) ? compactLog : logPath;
      const shortId = entry.name.slice(0, 8);
      const meta = extractConversationMetadata(metaSource, shortId);
      const stat = fs.statSync(logPath);
      list.push({
        id: entry.name,
        shortId,
        kind: meta.kind,
        title: meta.title,
        stepCount: meta.stepCount,
        logPath,
        updatedAt: stat.mtime.toISOString(),
        mtimeMs: stat.mtimeMs
      });
    }
    return list.sort((a, b) => b.mtimeMs - a.mtimeMs);
  } catch {
    return [];
  }
}

module.exports = {
  parseTranscriptLine,
  detectStepEntities,
  summarizeTranscriptSteps,
  listBrainConversations
};
