'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const { loadCatalog } = require('./catalog');
const { summarizeTranscriptSteps, listBrainConversations } = require('./transcript-parser');

const DEFAULT_PORT = 4317;
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_BRAIN_ROOT = 'C:\\Users\\roger\\.gemini\\antigravity\\brain';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME_TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
});

function buildLiveState(options = {}) {
  const brainRoot = options.brainRoot || DEFAULT_BRAIN_ROOT;
  const catalog = loadCatalog(options);
  const conversations = listBrainConversations(brainRoot);

  const requestedConvId = options.conversationId || (conversations[0] ? conversations[0].id : null);
  const activeConv = conversations.find(c => c.id === requestedConvId) || conversations[0] || null;

  let lines = [];
  if (activeConv && activeConv.logPath && fs.existsSync(activeConv.logPath)) {
    try {
      lines = fs.readFileSync(activeConv.logPath, 'utf8').split(/\r?\n/);
    } catch {
      lines = [];
    }
  }

  const summary = summarizeTranscriptSteps(lines, catalog);

  return Object.freeze({
    timestamp: new Date().toISOString(),
    activeConversationId: activeConv ? activeConv.id : null,
    conversations: conversations.map(c => ({
      id: c.id,
      shortId: c.shortId,
      kind: c.kind,
      title: c.title,
      stepCount: c.stepCount,
      updatedAt: c.updatedAt
    })),
    catalog,
    ...summary
  });
}

function serveStaticFile(reqPath, res) {
  const safeRel = reqPath === '/' ? 'index.html' : reqPath.replace(/^\/+/, '');
  const resolved = path.resolve(PUBLIC_DIR, safeRel);
  if (!resolved.startsWith(PUBLIC_DIR) || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }
  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store'
  });
  res.end(fs.readFileSync(resolved));
}

function createMonitorServer(options = {}) {
  const clients = new Set();

  const server = http.createServer((req, res) => {
    try {
      const parsedUrl = new URL(req.url || '/', `http://${DEFAULT_HOST}`);
      const pathname = parsedUrl.pathname;

      if (pathname === '/api/state') {
        const convId = parsedUrl.searchParams.get('conv') || undefined;
        const state = buildLiveState({ ...options, conversationId: convId });
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store'
        });
        res.end(JSON.stringify(state));
        return;
      }

      if (pathname === '/api/events') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive'
        });
        res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
        clients.add(res);
        req.on('close', () => clients.delete(res));
        return;
      }

      serveStaticFile(pathname, res);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Internal server error', detail: err.message }));
    }
  });

  const interval = setInterval(() => {
    if (clients.size === 0) return;
    const state = buildLiveState(options);
    const payload = `data: ${JSON.stringify(state)}\n\n`;
    for (const client of clients) {
      try {
        client.write(payload);
      } catch {
        clients.delete(client);
      }
    }
  }, 2500);
  interval.unref();

  return server;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const server = createMonitorServer();
  server.listen(port, DEFAULT_HOST, () => {
    console.log(`Antigravity Token Monitor running at http://${DEFAULT_HOST}:${port}`);
  });
}

module.exports = {
  buildLiveState,
  createMonitorServer,
  DEFAULT_HOST,
  DEFAULT_PORT
};
