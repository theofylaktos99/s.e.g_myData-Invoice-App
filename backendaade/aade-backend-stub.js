const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

function ok(data) { return { ok: true, ...data }; }
function fail(msg) { return { ok: false, error: msg }; }

app.post('/api/aade/validate', (req, res) => {
  console.log('POST /api/aade/validate', req.body);
  const p = req.body || {};
  if (!p?.header?.aa || !p?.header?.issueDate) return res.json(fail('Λείπουν βασικά στοιχεία header.'));
  if (!Array.isArray(p.lines) || p.lines.length === 0) return res.json(fail('Δεν υπάρχουν γραμμές.'));
  const bad = p.lines.find(x => !(x.qty > 0) || !(x.unitPrice >= 0));
  if (bad) return res.json(fail('Μη έγκυρες ποσότητες/τιμές.'));
  return res.json(ok({ message: 'VALID' }));
});

app.post('/api/aade/submit', async (req, res) => {
  console.log('POST /api/aade/submit', req.body);
  const p = req.body || {};
  const rndFail = Math.random() < 0.25;
  if (rndFail || String(p?.header?.counterparty?.vat || '').toUpperCase().includes('FAIL')) {
    return res.json(fail('AADE gateway προσωρινά μη διαθέσιμο.'));
  }
  const mark = `MARK-${Date.now()}`;
  return res.json(ok({ mark }));
});

app.post('/api/aade/retry', async (req, res) => {
  console.log('POST /api/aade/retry', req.body);
  const p = req.body || {};
  const mark = `MARK-${Date.now()}`;
  return res.json(ok({ mark }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AADE stub listening on ${PORT}`));
