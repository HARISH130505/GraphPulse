const express = require('express');
const cors = require('cors');
const bfhlRouter = require('./controllers/bfhlController');

const app = express();
const PORT = 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));

// ── Routes ──────────────────────────────────────────────────
app.use('/bfhl', bfhlRouter);

// Health probe
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[GraphPulse]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () =>
  console.log(`[GraphPulse] API running on http://localhost:${PORT}`)
);

module.exports = app;
