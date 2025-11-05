import React, { useState } from 'react';
import { DocumentStackIcon, CheckCircleIcon, CloudFailIcon } from './icons.jsx';

const TestsPanel = ({ BRANCHES, validateInvoiceForAADE, buildMyDataPayload }) => {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    try {
      const out = [];
      const inv1 = {
        branchId: 'central',
        invoiceDate: '2025-08-14',
        invoiceNumber: 'TST-0001',
        customer: { name: 'ACME SA', vat: '123456789' },
        items: [
          { description: 'Γεύμα', qty: 2, price: 10, vatRate: 13 },
          { description: 'Ποτό', qty: 1, price: 8, vatRate: 24 },
        ],
        surcharge: 0,
      };
      const cfg1 = BRANCHES[inv1.branchId];
      const errs1 = validateInvoiceForAADE(inv1, cfg1);
      const p1 = buildMyDataPayload(inv1, cfg1);
      const cond1 = errs1.length === 0 && p1.totals.net === 28 && p1.totals.vat === 4.52 && p1.totals.gross === 32.52;
      out.push({ name: 'Restaurant basic VAT mix', pass: cond1, detail: p1 });

      const inv2 = {
        branchId: 'villa1',
        invoiceDate: '2025-08-14',
        invoiceNumber: 'TST-0002',
        customer: { name: 'John Doe', vat: 'EL999999999' },
        items: [ { description: 'Διαμονή 2 νύχτες', qty: 2, price: 50, vatRate: 13 } ],
        surcharge: 3.5,
      };
      const cfg2 = BRANCHES[inv2.branchId];
      const errs2 = validateInvoiceForAADE(inv2, cfg2);
      const p2 = buildMyDataPayload(inv2, cfg2);
      const cond2 = errs2.length === 0 && p2.totals.net === 100 && p2.totals.vat === 13 && p2.totals.gross === 116.5;
      out.push({ name: 'Villa 13% + surcharge', pass: cond2, detail: p2 });

      const inv3 = {
        branchId: 'villa2',
        invoiceDate: '2025-08-14',
        invoiceNumber: 'TST-0003',
        customer: { name: 'Bad VAT Client', vat: '111111111' },
        items: [ { description: 'Διαμονή', qty: 1, price: 100, vatRate: 99 } ],
        surcharge: 0,
      };
      const cfg3 = BRANCHES[inv3.branchId];
      const errs3 = validateInvoiceForAADE(inv3, cfg3);
      out.push({ name: 'Invalid VAT rate should be rejected', pass: errs3.length > 0, detail: errs3 });

      setResults(out);
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800/70 text-slate-300">
              <DocumentStackIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Tests (AADE Mock)</h3>
              <p className="text-xs text-slate-400">Γρήγορα checks για validators και payloads</p>
            </div>
          </div>
          <button
            type="button"
            onClick={runTests}
            disabled={running}
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? 'Εκτέλεση…' : 'Run Tests'}
          </button>
        </div>
        <div className="p-6">
          {results.length === 0 ? (
            <p className="text-sm text-slate-400">Πάτησε «Run Tests» για να εκτελεστούν τα βασικά σενάρια.</p>
          ) : (
            <ul className="space-y-3">
              {results.map((r, i) => (
                <li
                  key={i}
                  className={`rounded-xl border px-4 py-3 ${
                    r.pass
                      ? 'border-emerald-600/30 bg-emerald-500/10'
                      : 'border-rose-600/30 bg-rose-500/10'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {r.pass ? (
                        <CheckCircleIcon className="h-5 w-5 text-emerald-300" />
                      ) : (
                        <CloudFailIcon className="h-5 w-5 text-rose-300" />
                      )}
                      <span className="text-sm font-semibold text-slate-100">{r.name}</span>
                    </div>
                    <span className={`text-xs font-semibold ${r.pass ? 'text-emerald-300' : 'text-rose-300'}`}>{r.pass ? 'PASS' : 'FAIL'}</span>
                  </div>
                  <pre className="max-h-64 overflow-auto rounded-lg bg-slate-950/70 p-3 text-xs text-slate-300">{JSON.stringify(r.detail, null, 2)}</pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestsPanel;
