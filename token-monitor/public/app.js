'use strict';

let currentLang = 'pt';
let showOnDemand = true;
let liveFollow = true;
let userPinnedConvId = null;
let liveState = null;
let currentStepIdx = 0;
let tick = 0;
let pulse = 0;
let hitZones = [];
let hoveredBall = null;
let activePipWindow = null;

const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');
const mCanvas = document.getElementById('miniPopupCanvas');
const mctx = mCanvas.getContext('2d');

function t(key) {
  return (window.AGY_I18N[currentLang] && window.AGY_I18N[currentLang][key]) || key;
}

function getFilteredSteps() {
  if (!liveState || !Array.isArray(liveState.steps)) return [];
  if (showOnDemand) return liveState.steps;
  const preloadedOnly = liveState.steps.filter(s => !s.isOnDemandSkill && !s.isOnDemandAgent);
  return preloadedOnly.length > 0 ? preloadedOnly : liveState.steps;
}

function setLanguage(lang) {
  currentLang = lang === 'en' ? 'en' : 'pt';
  document.documentElement.lang = currentLang === 'pt' ? 'pt-BR' : 'en';
  document.getElementById('btnLangPt').className = currentLang === 'pt'
    ? 'px-2.5 py-1 rounded-md bg-indigo-600 text-white transition'
    : 'px-2.5 py-1 rounded-md text-slate-400 hover:text-white transition';
  document.getElementById('btnLangEn').className = currentLang === 'en'
    ? 'px-2.5 py-1 rounded-md bg-indigo-600 text-white transition'
    : 'px-2.5 py-1 rounded-md text-slate-400 hover:text-white transition';
  applyTranslations();
  if (liveState) {
    populateConversationsDropdown(liveState.conversations || [], liveState.activeConversationId);
  }
  renderUI();
}

function toggleOnDemand() {
  showOnDemand = !showOnDemand;
  const steps = getFilteredSteps();
  currentStepIdx = liveFollow && steps.length > 0 ? steps.length - 1 : 0;
  pulse = 0;
  document.getElementById('legRing3').className = showOnDemand ? '' : 'hidden';
  document.getElementById('legRing4').className = showOnDemand ? '' : 'hidden';
  applyTranslations();
  renderUI();
}

function escapeHtml(raw) {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toggleAutoWalk() {
  liveFollow = !liveFollow;
  if (liveFollow) {
    const steps = getFilteredSteps();
    if (steps.length > 0) {
      currentStepIdx = steps.length - 1;
      pulse = 0;
    }
    fetchState(userPinnedConvId || undefined, true);
  }
  applyTranslations();
  renderUI();
}

function inspectStep(idx) {
  const steps = getFilteredSteps();
  if (steps.length === 0) return;
  liveFollow = false;
  currentStepIdx = Math.max(0, Math.min(idx, steps.length - 1));
  pulse = 0;
  applyTranslations();
  renderUI();
}

function stepBackward() {
  const steps = getFilteredSteps();
  if (steps.length === 0) return;
  liveFollow = false;
  currentStepIdx = (currentStepIdx - 1 + steps.length) % steps.length;
  pulse = 0;
  applyTranslations();
  renderUI();
}

function stepForward() {
  const steps = getFilteredSteps();
  if (steps.length === 0) return;
  liveFollow = false;
  currentStepIdx = (currentStepIdx + 1) % steps.length;
  pulse = 0;
  applyTranslations();
  renderUI();
}

function applyTranslations() {
  document.getElementById('t_title').textContent = t('title');
  document.getElementById('t_subtitle').textContent = t('subtitle');
  document.getElementById('btnToggleOD').textContent = showOnDemand ? t('showOnDemandOn') : t('showOnDemandOff');
  document.getElementById('btnToggleOD').className = showOnDemand
    ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/50 hover:bg-amber-500/30 transition'
    : 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30 transition';
  const btnAuto = document.getElementById('btnAuto');
  btnAuto.textContent = liveFollow ? t('autoWalkOn') : t('autoWalkOff');
  btnAuto.className = liveFollow
    ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 hover:bg-emerald-500/30 transition'
    : 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 transition';
  const btnPrev = document.getElementById('btnPrev');
  if (btnPrev) btnPrev.textContent = t('prevStep');
  const btnRefresh = document.getElementById('btnRefreshConv');
  if (btnRefresh) btnRefresh.textContent = t('refreshBtn');
  document.getElementById('btnNext').textContent = t('nextStep');
  document.getElementById('btnPopup').textContent = t('popupBtn');
  document.getElementById('t_cardSkill').textContent = t('cardSkill');
  document.getElementById('t_cardAgent').textContent = t('cardAgent');
  document.getElementById('t_cardTool').textContent = t('cardTool');
  document.getElementById('t_cardTokens').textContent = t('cardTokens');
  document.getElementById('t_ring1').textContent = t('ring1Label');
  document.getElementById('t_ring2').textContent = t('ring2Label');
  document.getElementById('t_ring3').textContent = t('ring3Label');
  document.getElementById('t_ring4').textContent = t('ring4Label');
  document.getElementById('t_thoughtTitle').textContent = t('thoughtTitle');
  document.getElementById('t_peaksTitle').textContent = t('peaksTitle');
  const peaksSub = document.getElementById('t_peaksSubtitle');
  if (peaksSub) peaksSub.textContent = t('peaksSubtitle');
  document.getElementById('t_preloadedAgentsTitle').textContent = t('preloadedAgentsTitle');
  document.getElementById('t_preloadedSkillsTitle').textContent = t('preloadedSkillsTitle');
  const popTitleEl = document.getElementById('t_popupTitle') ||
    (activePipWindow && activePipWindow.document.getElementById('t_popupTitle'));
  if (popTitleEl) popTitleEl.textContent = t('popupTitle');
  if (!hoveredBall) {
    document.getElementById('hoverBadge').textContent = t('hoverPrompt');
  }
}

async function fetchState(convId, jumpToLatest = false) {
  try {
    const isFirstLoad = !liveState;
    const prevActiveId = liveState ? liveState.activeConversationId : null;
    const prevStepCount = getFilteredSteps().length;
    const query = convId ? `?conv=${encodeURIComponent(convId)}` : '';
    const res = await fetch(`/api/state${query}`);
    if (!res.ok) return;
    const data = await res.json();
    liveState = data;
    populateConversationsDropdown(data.conversations || [], data.activeConversationId);
    const steps = getFilteredSteps();
    const hasNewActivity = data.activeConversationId !== prevActiveId || steps.length !== prevStepCount;
    if (steps.length > 0 && (isFirstLoad || jumpToLatest || liveFollow || currentStepIdx >= steps.length)) {
      const latestIdx = steps.length - 1;
      if (currentStepIdx !== latestIdx || hasNewActivity) {
        pulse = 0;
      }
      currentStepIdx = latestIdx;
    }
    renderUI();
  } catch {
    // Retry quietly on next cycle
  }
}

function populateConversationsDropdown(convs, activeId) {
  const sel = document.getElementById('selConv');
  if (!sel) return;
  sel.innerHTML = convs.map((c, i) => {
    const selected = c.id === activeId ? 'selected' : '';
    const isSub = c.kind === 'subagent';
    const badge = isSub ? '🤖' : (i === 0 ? '🟢' : '💬');
    const kindLabel = isSub ? t('subagentSessionLabel') : t('mainSessionLabel');
    const titleSnippet = escapeHtml(c.title || c.shortId);
    const count = typeof c.stepCount === 'number' ? c.stepCount : 0;
    return `<option value="${escapeHtml(c.id)}" ${selected}>${badge} ${kindLabel}: "${titleSnippet}" (${escapeHtml(c.shortId)} • ${count} ${t('stepsWord')})</option>`;
  }).join('');
}

function onSelectConversation(convId) {
  userPinnedConvId = convId || null;
  fetchState(convId, true);
}

async function refreshConversations() {
  const btn = document.getElementById('btnRefreshConv');
  if (btn) {
    btn.textContent = t('refreshedBtn');
  }
  userPinnedConvId = null;
  liveFollow = true;
  applyTranslations();
  await fetchState(undefined, true);
  if (btn) {
    setTimeout(() => {
      btn.textContent = t('refreshBtn');
    }, 900);
  }
}

function getPopupElement(id) {
  return document.getElementById(id) ||
    (activePipWindow && activePipWindow.document ? activePipWindow.document.getElementById(id) : null);
}

function getStepActionIcon(st) {
  if (st.tool === 'invoke_subagent') return '🤖';
  if (st.tool === 'read_file' && /SKILL\.md/i.test(String(st.target || ''))) return '⚡';
  if (st.tool === 'run_command') return '💻';
  if (st.tool === 'write_file' || st.tool === 'edit_file') return '✏️';
  if (st.tool === 'read_file') return '📄';
  return '💬';
}

function renderUI() {
  const steps = getFilteredSteps();
  if (!liveState || steps.length === 0) return;
  if (currentStepIdx >= steps.length) currentStepIdx = 0;
  const s = steps[currentStepIdx] || steps[steps.length - 1];
  const counts = liveState.usageCounts || { skills: {}, agents: {} };
  const catalog = liveState.catalog;
  const locale = currentLang === 'pt' ? 'pt-BR' : 'en-US';

  const skillDisplay = Array.isArray(s.activeSkills) && s.activeSkills.length > 1
    ? s.activeSkills.join(' + ')
    : s.skill;
  document.getElementById('valSkill').textContent = skillDisplay;
  const skL = document.getElementById('valSkillLayer');
  skL.textContent = s.isOnDemandSkill ? t('layerOnDemandSkill') : t('layerPreloadedSkill');
  skL.className = s.isOnDemandSkill ? 'text-amber-400 font-semibold mt-0.5' : 'text-cyan-400 mt-0.5';

  document.getElementById('valAgent').textContent = s.agent;
  const agL = document.getElementById('valAgentLayer');
  agL.textContent = s.isOnDemandAgent ? t('layerOnDemandAgent') : t('layerPreloadedAgent');
  agL.className = s.isOnDemandAgent ? 'text-pink-400 font-semibold mt-0.5' : 'text-purple-300 mt-0.5';

  document.getElementById('valTool').textContent = s.tool;
  document.getElementById('valTarget').textContent = s.target;
  document.getElementById('valTokens').textContent = `${s.totalStepTokens.toLocaleString(locale)} tokens`;
  document.getElementById('valCacheCtx').textContent = `${t('cacheHit')}: ${s.cacheHitPct}% · ${t('contextWin')}: ${s.contextWindowPct}%`;

  document.getElementById('stepBadge').textContent = `${t('stepWord')} #${currentStepIdx + 1}/${steps.length}`;
  const localizedThought = currentLang === 'en' ? (s.thoughtEn || s.thought) : (s.thoughtPt || s.thought);
  document.getElementById('thoughtBox').textContent = localizedThought;

  // Mini Popup sync (works whether in main document or inside PiP window)
  const popSkill = getPopupElement('popSkill');
  const popAgent = getPopupElement('popAgent');
  const popThought = getPopupElement('popThought');
  const popTok = getPopupElement('popTok');
  const popCache = getPopupElement('popCache');
  if (popSkill) popSkill.textContent = skillDisplay;
  if (popAgent) popAgent.textContent = s.agent;
  if (popThought) popThought.textContent = localizedThought;
  if (popTok) popTok.textContent = `${(s.totalStepTokens / 1000).toFixed(1)}k tok`;
  if (popCache) popCache.textContent = `${s.cacheHitPct}% ${t('cachedShort')}`;

  // Peaks Chart: sliding 6-step window centered around currentStepIdx with single clear delta label + action icon
  const maxStart = Math.max(0, steps.length - 6);
  const offset = Math.max(0, Math.min(currentStepIdx - 3, maxStart));
  const visibleSteps = steps.slice(offset, offset + 6);
  const values = visibleSteps.map(x => x.inputTokens + x.outputTokens);
  const maxDelta = Math.max(...values, 1000);
  const minDelta = Math.min(...values, 0);
  const span = Math.max(maxDelta - minDelta, 500);

  const rangeBadge = document.getElementById('peaksRangeBadge');
  if (rangeBadge) {
    rangeBadge.textContent = `#${offset + 1}–#${offset + visibleSteps.length} / ${steps.length}`;
  }

  document.getElementById('peaksChart').innerHTML = visibleSteps.map((st, idxInSlice) => {
    const realIdx = offset + idxInSlice;
    const stepDelta = st.inputTokens + st.outputTokens;
    const normalized = Math.round(((stepDelta - minDelta) / span) * 68) + 28;
    const h = Math.min(100, Math.max(24, normalized));
    const act = realIdx === currentStepIdx;
    const deltaLabel = stepDelta >= 1000
      ? `+${(stepDelta / 1000).toFixed(1)}k`
      : `+${stepDelta}`;
    const icon = getStepActionIcon(st);
    const tip = `${t('stepWord')} #${realIdx + 1} | ${deltaLabel} ${t('newTokensShort')} (${t('totalContextShort')}: ${Math.round(st.totalStepTokens / 1000)}k) | ${st.tool} → ${st.skill}`;

    return `<div onclick="inspectStep(${realIdx});" title="${escapeHtml(tip)}" class="flex flex-col items-center cursor-pointer group">
      <div class="text-xs font-mono leading-tight mb-1 ${act ? 'text-amber-300 font-bold' : 'text-slate-300'}">${deltaLabel}</div>
      <div class="w-full bg-[#11172b] rounded-t-md overflow-hidden flex items-end border ${act ? 'border-amber-400 shadow-sm' : 'border-slate-800'}" style="height:56px">
        <div class="${act ? 'bg-emerald-400' : 'bg-indigo-500/80 group-hover:bg-indigo-400'} w-full transition-all duration-300" style="height:${h}%"></div>
      </div>
      <div class="text-[11px] font-mono mt-1 ${act ? 'text-cyan-300 font-bold' : 'text-slate-400'}">${icon}#${realIdx + 1}</div>
    </div>`;
  }).join('');

  const stepSummary = document.getElementById('peaksStepSummary');
  if (stepSummary) {
    const curDelta = s.inputTokens + s.outputTokens;
    const curIcon = getStepActionIcon(s);
    stepSummary.innerHTML = `<span class="truncate"><strong class="text-amber-300">${curIcon} ${t('stepWord')} #${currentStepIdx + 1}</strong>: +${curDelta.toLocaleString(locale)} ${t('newTokensShort')} (${escapeHtml(s.tool)})</span><span class="text-emerald-400 shrink-0">${t('totalContextShort')}: ${Math.round(s.totalStepTokens / 1000)}k (${s.cacheHitPct}% ${t('cachedShort')})</span>`;
  }

  // Agents Chips
  document.getElementById('agentsChips').innerHTML = catalog.ring1Agents.map(ag => {
    const hits = counts.agents[ag] || 0;
    const act = ag === s.agent;
    return `<span class="px-1.5 py-0.5 rounded text-xs font-mono border ${
      act ? 'bg-purple-600 text-white border-purple-300 font-bold' : 'bg-[#11172b] text-slate-400 border-slate-800'
    }">${ag} (${hits}x)</span>`;
  }).join('');

  // Skills Chips
  let skHtml = catalog.ring2Skills.map(sk => {
    const hits = counts.skills[sk] || 0;
    const act = sk === s.skill;
    return `<span class="px-1.5 py-0.5 rounded text-xs font-mono border ${
      act ? 'bg-cyan-600 text-white border-cyan-300 font-bold' : 'bg-[#11172b] text-slate-400 border-slate-800'
    }">${sk} (${hits}x)</span>`;
  }).join('');
  if (showOnDemand && s.isOnDemandSkill) {
    const odHits = counts.skills[s.skill] || 1;
    skHtml += `<span class="px-1.5 py-0.5 rounded text-xs font-mono border bg-amber-500/20 text-amber-300 border-amber-400 font-bold">★ ${s.skill} (${odHits}x)</span>`;
  }
  document.getElementById('skillsChips').innerHTML = skHtml;
}

canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  const mx = (e.clientX - r.left) * (canvas.width / r.width);
  const my = (e.clientY - r.top) * (canvas.height / r.height);
  hoveredBall = hitZones.find(z => Math.hypot(mx - z.x, my - z.y) < z.rad + 5) || null;
  const hb = document.getElementById('hoverBadge');
  if (hoveredBall) {
    hb.textContent = `🔎 ${hoveredBall.ring}: ${hoveredBall.name} (${hoveredBall.hits} ${t('usesWord')})`;
    hb.className = 'px-2.5 py-0.5 rounded bg-indigo-950 border border-amber-400 text-amber-300 font-mono';
  } else {
    hb.textContent = t('hoverPrompt');
    hb.className = 'px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono';
  }
});

function drawOrbitRing(items, radius, speed, baseColor, activeColor, activeName, ringLabel, ballSize, countMap, extraActiveList = []) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.strokeStyle = baseColor + '44';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  items.forEach((name, i) => {
    const a = (i / items.length) * Math.PI * 2 + tick * speed;
    const x = cx + Math.cos(a) * radius;
    const y = cy + Math.sin(a) * radius;
    const isAct = name === activeName || (Array.isArray(extraActiveList) && extraActiveList.includes(name));
    const isHov = hoveredBall && hoveredBall.name === name;
    const hits = (countMap && countMap[name]) || 0;

    hitZones.push({ x, y, rad: ballSize + 3, name, ring: ringLabel, hits });

    if (isAct) {
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      const px = cx + (x - cx) * pulse;
      const py = cy + (y - cy) * pulse;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, ballSize + 4 + pulse * 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = isAct || isHov ? activeColor : baseColor;
    ctx.strokeStyle = isAct || isHov ? '#ffffff' : activeColor;
    ctx.lineWidth = isAct || isHov ? 2.2 : 0.8;
    ctx.beginPath();
    ctx.arc(x, y, isAct || isHov ? ballSize + 4.5 : ballSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (isAct || isHov) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${name} (${hits}x)`, x, y - (ballSize + 9));
    }
  });
}

function drawLoop() {
  tick += 0.0055;
  pulse = (pulse + 0.022) % 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hitZones = [];

  const steps = getFilteredSteps();
  if (liveState && liveState.catalog && steps.length > 0) {
    const cat = liveState.catalog;
    const s = steps[currentStepIdx] || steps[steps.length - 1];
    const counts = liveState.usageCounts || { skills: {}, agents: {} };
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const r1Radius = showOnDemand ? 62 : 95;
    const r2Radius = showOnDemand ? 108 : 165;
    const activeSkillsList = s.allMatchedSkills || [s.skill];

    drawOrbitRing(cat.ring1Agents, r1Radius, 0.35, '#581c87', '#c084fc', s.agent, t('ring1Label'), 5.8, counts.agents);
    drawOrbitRing(cat.ring2Skills, r2Radius, -0.25, '#0c4a6e', '#38bdf8', s.skill, t('ring2Label'), 5.8, counts.skills, activeSkillsList);

    if (showOnDemand) {
      drawOrbitRing(cat.ring3AgentsOD, 154, 0.16, '#4c0519', '#f472b6', s.agent, t('ring3Label'), 4.3, counts.agents);
      drawOrbitRing(cat.ring4SkillsOD, 202, -0.10, '#451a03', '#fbbf24', s.skill, t('ring4Label'), 3.6, counts.skills, activeSkillsList);
    }

    // Core
    const g = ctx.createRadialGradient(cx, cy, 3, cx, cy, 25);
    g.addColorStop(0, '#38bdf8');
    g.addColorStop(0.6, '#6366f1');
    g.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AGY', cx, cy + 4);

    // Mini Popup Canvas
    mctx.clearRect(0, 0, 96, 96);
    const rings = showOnDemand ? [14, 24, 34, 43] : [22, 38];
    rings.forEach((mr, ri) => {
      mctx.strokeStyle = ri < 2 ? 'rgba(56,189,248,0.35)' : 'rgba(251,191,36,0.28)';
      mctx.beginPath(); mctx.arc(48, 48, mr, 0, Math.PI * 2); mctx.stroke();
    });
    const targetR = (showOnDemand && s.isOnDemandSkill) ? 43 : rings[rings.length - 1];
    const ma = tick * 2.2;
    const mx = 48 + Math.cos(ma) * targetR, my = 48 + Math.sin(ma) * targetR;
    mctx.strokeStyle = s.isOnDemandSkill ? '#fbbf24' : '#38bdf8';
    mctx.beginPath(); mctx.moveTo(48, 48); mctx.lineTo(mx, my); mctx.stroke();
    mctx.fillStyle = s.isOnDemandSkill ? '#fbbf24' : '#38bdf8';
    mctx.beginPath(); mctx.arc(mx, my, 4, 0, Math.PI * 2); mctx.fill();
    mctx.fillStyle = '#6366f1'; mctx.beginPath(); mctx.arc(48, 48, 7, 0, Math.PI * 2); mctx.fill();
  }

  requestAnimationFrame(drawLoop);
}

const PIP_SELF_CONTAINED_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #05070f;
    color: #f1f5f9;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    padding: 8px;
    overflow: hidden;
    user-select: none;
  }
  #cornerPopup {
    display: block !important;
    background: #070a14;
    border: 1.5px solid rgba(99, 102, 241, 0.75);
    border-radius: 14px;
    padding: 10px 12px;
    width: 100%;
    height: 100%;
    box-shadow: 0 10px 25px rgba(0,0,0,0.6);
  }
  #cornerPopup > div:first-child {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #1e293b;
    padding-bottom: 6px;
    margin-bottom: 8px;
  }
  #cornerPopup > div:first-child > div {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .animate-ping {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #34d399;
  }
  #t_popupTitle { font-size: 12px; font-weight: 700; color: #ffffff; }
  button {
    background: #1e293b;
    color: #cbd5e1;
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 2px 7px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  button:hover { background: #e11d48; color: #ffffff; border-color: #f43f5e; }
  #cornerPopup > div:last-child {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  #miniPopupCanvas {
    width: 86px;
    height: 86px;
    background: #05070f;
    border: 1px solid #1e293b;
    border-radius: 10px;
    flex-shrink: 0;
  }
  .min-w-0 { min-width: 0; flex: 1; font-size: 12px; line-height: 1.45; }
  .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  #popSkill { color: #fcd34d; font-weight: 700; }
  #popAgent { color: #d8b4fe; font-weight: 700; }
  #popThought { color: #cbd5e1; margin-top: 2px; }
  .font-mono {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #1e293b;
    padding-top: 5px;
    margin-top: 5px;
    font-family: ui-monospace, Consolas, monospace;
  }
  #popTok { color: #fcd34d; font-weight: 700; }
  #popCache { color: #34d399; font-weight: 600; }
`;

function closeCornerPopup() {
  if (activePipWindow && !activePipWindow.closed) {
    activePipWindow.close();
    activePipWindow = null;
    return;
  }
  const popupCard = document.getElementById('cornerPopup');
  if (popupCard) {
    popupCard.style.display = 'none';
  }
}

async function openCornerPopup() {
  if (activePipWindow && !activePipWindow.closed) {
    activePipWindow.focus();
    return;
  }
  const popupCard = document.getElementById('cornerPopup');
  if (!popupCard) return;

  if ('documentPictureInPicture' in window) {
    try {
      const pipWin = await window.documentPictureInPicture.requestWindow({ width: 350, height: 158 });
      activePipWindow = pipWin;
      const styleEl = pipWin.document.createElement('style');
      styleEl.textContent = PIP_SELF_CONTAINED_CSS;
      pipWin.document.head.appendChild(styleEl);
      pipWin.document.body.appendChild(popupCard);
      popupCard.style.display = 'block';
      pipWin.closeCornerPopup = closeCornerPopup;

      pipWin.addEventListener('pagehide', () => {
        activePipWindow = null;
        popupCard.style.display = 'none';
        document.body.appendChild(popupCard);
      });
      return;
    } catch {
      // Fallback to in-page floating corner popup
    }
  }

  popupCard.style.display = popupCard.style.display === 'none' ? 'block' : 'none';
}

setInterval(() => {
  fetchState(userPinnedConvId || undefined);
}, 1500);

applyTranslations();
fetchState();
drawLoop();
