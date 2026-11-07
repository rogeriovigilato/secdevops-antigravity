'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
const appJsPath = path.join(__dirname, '..', 'public', 'app.js');

test('UI Regression: cornerPopup starts hidden and uses explicit closeCornerPopup()', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /id="cornerPopup"\s+style="display:\s*none;"/);
  assert.match(html, /onclick="closeCornerPopup\(\)"/);

  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.match(appJs, /function closeCornerPopup\(\)/);
  assert.match(appJs, /pipWin\.closeCornerPopup\s*=\s*closeCornerPopup/);
});

test('UI Regression: PiP window injects self-contained dark CSS without external script failure', () => {
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.match(appJs, /const PIP_SELF_CONTAINED_CSS/);
  assert.match(appJs, /background:\s*#05070f/);
  assert.doesNotMatch(appJs, /pipWin\.document\.createElement\('script'\)/);
});

test('UI Regression: peaksChart uses 6-column grid without clipping height or horizontal scrollbar', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /id="peaksChart"\s+class="grid grid-cols-6/);
  assert.doesNotMatch(html, /id="peaksChart"[^>]*overflow-x-auto/);
  assert.doesNotMatch(html, /id="peaksChart"[^>]*h-24/);
  assert.match(html, /id="t_peaksSubtitle"/);
  assert.match(html, /id="peaksRangeBadge"/);
  assert.match(html, /id="peaksStepSummary"/);
});

test('UI Regression: conversation dropdown renders friendly title and stepCount, and peaksChart slides with currentStepIdx', () => {
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.match(appJs, /c\.title/);
  assert.match(appJs, /c\.stepCount/);
  assert.match(appJs, /function stepBackward\(\)/);
  assert.match(appJs, /Math\.max\(0,\s*Math\.min\(currentStepIdx/);
  assert.match(appJs, /peaksStepSummary/);
});

test('UI Regression: refresh button (#btnRefreshConv) exists next to session dropdown and calls refreshConversations()', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /id="btnRefreshConv"/);
  assert.match(html, /onclick="refreshConversations\(\)"/);

  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.match(appJs, /async function refreshConversations\(\)/);
});

test('UI Regression: real-time liveFollow mode tracks latest step without 4.2s slideshow jumping', () => {
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.match(appJs, /let liveFollow = true/);
  assert.match(appJs, /function inspectStep\(/);
  assert.doesNotMatch(appJs, /4200/);
});

test('UI Regression: clicking an orbiting sphere opens #nodeInspectorCard with summary description', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /id="nodeInspectorCard"\s+style="display:\s*none;"/);
  assert.match(html, /id="nodeInspectorDesc"/);
  assert.match(html, /onclick="closeNodeInspector\(\)"/);

  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.match(appJs, /canvas\.addEventListener\('click'/);
  assert.match(appJs, /function selectOrbitNode\(/);
  assert.match(appJs, /function closeNodeInspector\(/);
});
