import React, { useEffect, useMemo, useState } from 'react';
import { HistoryIcon, DocumentStackIcon, SearchIcon, FunnelIcon, DownloadIcon } from './icons.jsx';

const HistoryTable = ({ history = [], branches = {}, currentBranchId, onPreview, onDownload, onReceipt, onIssueSurcharge, disableActions = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState(currentBranchId || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    if (currentBranchId) {
      setBranchFilter(currentBranchId);
    }
  }, [currentBranchId]);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('el-GR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }), []);

  const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

  const branchOptions = useMemo(() => {
    const options = Object.values(branches || {}).map((branch) => ({ id: branch.id, label: branch.label }));
    return [{ id: 'all', label: 'Όλα τα υποκαταστήματα' }, ...options];
  }, [branches]);

  const fromTimestamp = useMemo(() => {
    if (!fromDate) return null;
    const date = new Date(fromDate);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }, [fromDate]);

  const toTimestamp = useMemo(() => {
    if (!toDate) return null;
    const date = new Date(toDate);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(23, 59, 59, 999);
    return date.getTime();
  }, [toDate]);

  const deriveTotals = (entry) => {
    const totals = entry?.totals || {};
    const net = Number(totals.net != null ? totals.net : 0);
    const vat = Number(totals.vat != null ? totals.vat : 0);
    const surcharge = totals.surcharge != null ? Number(totals.surcharge) : Number(entry?.surcharge || 0);
    const gross = totals.gross != null ? Number(totals.gross) : net + vat + surcharge;
    return { net, vat, gross, surcharge };
  };

  const filteredRows = useMemo(() => {
    return (history || [])
      .filter((entry) => {
        if (!branchFilter || branchFilter === 'all') return true;
        return entry.branchId === branchFilter;
      })
      .filter((entry) => {
        if (statusFilter === 'all') return true;
        return entry.status === statusFilter;
      })
      .filter((entry) => {
        if (fromTimestamp == null && toTimestamp == null) return true;
        const dateValue = entry.issueDate || entry.invoiceDate;
        if (!dateValue) return false;
        const date = new Date(dateValue);
        const ts = date.getTime();
        if (Number.isNaN(ts)) return false;
        if (fromTimestamp != null && ts < fromTimestamp) return false;
        if (toTimestamp != null && ts > toTimestamp) return false;
        return true;
      })
      .filter((entry) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const branchLabel = branches[entry.branchId]?.label || entry.branchId || '';
        const totals = deriveTotals(entry);
        return [
          entry.invoiceNumber,
          entry.customer?.name,
          entry.customer?.vat,
          branchLabel,
          entry.status,
          entry.mark,
          entry.error,
          totals.gross,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      })
      .sort((a, b) => {
        const aTime = a.timestamp || new Date(a.issueDate || a.invoiceDate || 0).getTime();
        const bTime = b.timestamp || new Date(b.issueDate || b.invoiceDate || 0).getTime();
        return bTime - aTime;
      });
  }, [history, branchFilter, statusFilter, fromTimestamp, toTimestamp, searchTerm, branches]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (acc, entry) => {
        acc.total += 1;
        if (entry.status === 'sent') acc.sent += 1;
        if (entry.status === 'failed') acc.failed += 1;
        const totals = deriveTotals(entry);
        acc.net += totals.net;
        acc.vat += totals.vat;
        acc.gross += totals.gross;
        return acc;
      },
      { total: 0, sent: 0, failed: 0, net: 0, vat: 0, gross: 0 }
    );
  }, [filteredRows]);

  const hasActiveFilters = useMemo(() => {
    const initialBranch = currentBranchId || 'all';
    return Boolean(searchTerm || fromDate || toDate || statusFilter !== 'all' || branchFilter !== initialBranch);
  }, [searchTerm, fromDate, toDate, statusFilter, branchFilter, currentBranchId]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
    setBranchFilter(currentBranchId || 'all');
  };

  const exportCSV = () => {
    if (!filteredRows.length) return;
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const header = [
      'Ημερομηνία',
      'Υποκατάστημα',
      'Αριθμός',
      'Πελάτης',
      'ΑΦΜ',
      'Καθαρή',
      'ΦΠΑ',
      'Σύνολο',
      'Κατάσταση',
      'MARK / Σφάλμα',
    ];
    const rows = filteredRows.map((entry) => {
      const totals = deriveTotals(entry);
      const branchLabel = branches[entry.branchId]?.label || entry.branchId || '';
      const issueDate = entry.issueDate || entry.invoiceDate || '';
      const statusLabel = entry.status === 'sent' ? 'Επιτυχία' : 'Αποτυχία';
      const markOrError = entry.mark || entry.error || '';
      return [
        issueDate,
        branchLabel,
        entry.invoiceNumber || '',
        entry.customer?.name || '',
        entry.customer?.vat || '',
        formatCurrency(totals.net),
        formatCurrency(totals.vat),
        formatCurrency(totals.gross),
        statusLabel,
        markOrError,
      ].map(escape).join(',');
    });
    const csvContent = [header.map(escape).join(','), ...rows].join('\r\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_history_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!filteredRows.length) return;
    if (typeof pdfMake === 'undefined') {
      alert('Η βιβλιοθήκη PDFMake δεν είναι διαθέσιμη. Παρακαλώ φορτώστε τη σελίδα ξανά.');
      return;
    }
    const body = [
      [
        { text: 'Ημερομηνία', style: 'tableHeader' },
        { text: 'Υποκατάστημα', style: 'tableHeader' },
        { text: 'Αρ. Τιμολ.', style: 'tableHeader' },
        { text: 'Πελάτης', style: 'tableHeader' },
        { text: 'Σύνολο', style: 'tableHeader', alignment: 'right' },
        { text: 'Κατάσταση', style: 'tableHeader' },
        { text: 'MARK / Σφάλμα', style: 'tableHeader' },
      ],
    ];
    filteredRows.forEach((entry) => {
      const totals = deriveTotals(entry);
      const branchLabel = branches[entry.branchId]?.label || entry.branchId || '';
      body.push([
        { text: entry.issueDate || entry.invoiceDate || '', fontSize: 9 },
        { text: branchLabel, fontSize: 9 },
        { text: entry.invoiceNumber || '', fontSize: 9 },
        { text: entry.customer?.name || '', fontSize: 9 },
        { text: `${formatCurrency(totals.gross)} €`, fontSize: 9, alignment: 'right' },
        { text: entry.status === 'sent' ? 'Επιτυχία' : 'Αποτυχία', fontSize: 9 },
        { text: entry.mark || entry.error || '', fontSize: 8 },
      ]);
    });
    const docDefinition = {
      content: [
        { text: 'Ιστορικό Τιμολογίων', style: 'title' },
        {
          text: `Εγγραφές: ${summary.total} | Επιτυχίες: ${summary.sent} | Αποτυχίες: ${summary.failed}`,
          style: 'subtitle',
          margin: [0, 4, 0, 12],
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', '*', 'auto', 'auto', '*'],
            body,
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        title: { fontSize: 16, bold: true, margin: [0, 0, 0, 4] },
        subtitle: { fontSize: 9, color: '#94a3b8' },
        tableHeader: { fillColor: '#0f172a', color: '#cbd5f5', bold: true, fontSize: 9 },
      },
      defaultStyle: {
        fontSize: 9,
      },
    };
    pdfMake.createPdf(docDefinition).download(`invoice_history_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const disableExport = disableActions || !filteredRows.length;

  return (
    <div className="bg-slate-900/80 rounded-2xl shadow-xl border border-slate-800/60 overflow-hidden backdrop-blur">
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800/60">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800/70 text-slate-300">
              <HistoryIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Ιστορικό Τιμολογίων</h3>
              <p className="text-sm text-slate-400">Φιλτραρίσμενο αρχείο υποβολών και αποτελεσμάτων</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-slate-700/60 px-3 py-1">Εγγραφές: {summary.total}</span>
            <span className="rounded-full border border-emerald-600/40 px-3 py-1 text-emerald-200">Επιτυχίες: {summary.sent}</span>
            <span className="rounded-full border border-rose-600/40 px-3 py-1 text-rose-200">Αποτυχίες: {summary.failed}</span>
            <span className="rounded-full border border-slate-700/60 px-3 py-1">Σύνολο: {formatCurrency(summary.gross)} €</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid gap-4 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-2">Αναζήτηση</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 focus-within:border-slate-500/80">
              <SearchIcon className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Αρ. τιμολογίου, πελάτης, ΑΦΜ, MARK..."
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-2">Υποκατάστημα</label>
            <div className="relative">
              <FunnelIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <select
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-700/60 bg-slate-900/60 py-2 pl-9 pr-10 text-sm text-slate-200 focus:border-slate-500/80 focus:outline-none"
              >
                {branchOptions.map((branchOption) => (
                  <option key={branchOption.id} value={branchOption.id}>
                    {branchOption.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">▼</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-2">Κατάσταση</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-sm text-slate-200 focus:border-slate-500/80 focus:outline-none"
            >
              <option value="all">Όλες</option>
              <option value="sent">Επιτυχία</option>
              <option value="failed">Αποτυχία</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-2">Από</label>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-sm text-slate-200 focus:border-slate-500/80 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-2">Έως</label>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-sm text-slate-200 focus:border-slate-500/80 focus:outline-none"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters || disableActions}
              className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Καθαρισμός φίλτρων
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Εμφανίζονται {filteredRows.length} από {history.length} εγγραφές.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCSV}
              disabled={disableExport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DownloadIcon className="h-4 w-4 text-slate-400" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={exportPDF}
              disabled={disableExport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DocumentStackIcon className="h-4 w-4 text-slate-400" />
              Export PDF
            </button>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-700/60 bg-slate-900/70 text-slate-400">
              <DocumentStackIcon className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-semibold text-slate-200 mb-2">Δεν βρέθηκαν τιμολόγια</h4>
            <p className="text-sm text-slate-400">Δοκίμασε να αλλάξεις τα φίλτρα ή να δημιουργήσεις ένα νέο παραστατικό.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-100">
              <thead>
                <tr className="border-b border-slate-800/60 text-xs uppercase tracking-[0.25em] text-slate-500">
                  <th className="text-left py-3 px-3 font-semibold">Ημερομηνία</th>
                  <th className="text-left py-3 px-3 font-semibold">Υποκατάστημα</th>
                  <th className="text-left py-3 px-3 font-semibold">Αρ. Τιμ.</th>
                  <th className="text-left py-3 px-3 font-semibold">Πελάτης</th>
                  <th className="text-left py-3 px-3 font-semibold">ΑΦΜ</th>
                  <th className="text-right py-3 px-3 font-semibold">Καθαρή</th>
                  <th className="text-right py-3 px-3 font-semibold">ΦΠΑ</th>
                  <th className="text-right py-3 px-3 font-semibold">Σύνολο</th>
                  <th className="text-center py-3 px-3 font-semibold">Κατάσταση</th>
                  <th className="text-center py-3 px-3 font-semibold">MARK / Σφάλμα</th>
                  <th className="text-center py-3 px-3 font-semibold">Ενέργειες</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((entry, index) => {
                  const totals = deriveTotals(entry);
                  const branchLabel = branches[entry.branchId]?.label || entry.branchId || '';
                  const key = entry.id || entry.invoiceNumber || entry.timestamp || index;
                  return (
                    <tr key={key} className="border-b border-slate-800/40 hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-200">{entry.issueDate || entry.invoiceDate}</td>
                      <td className="py-3 px-3 text-slate-300">{branchLabel}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-100">{entry.invoiceNumber}</td>
                      <td className="py-3 px-3 text-slate-300">{entry.customer?.name || '—'}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{entry.customer?.vat || '—'}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-200">{formatCurrency(totals.net)} €</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-200">{formatCurrency(totals.vat)} €</td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-emerald-300">{formatCurrency(totals.gross)} €</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            entry.status === 'sent'
                              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/20'
                              : 'bg-rose-500/20 text-rose-200 border border-rose-500/20'
                          }`}
                        >
                          {entry.status === 'sent' ? 'Επιτυχία' : 'Αποτυχία'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-center font-mono text-slate-400">{entry.mark || entry.error || '—'}</td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap justify-center gap-2">
                          {onPreview && (
                            <button
                              type="button"
                              onClick={() => onPreview(entry)}
                              disabled={disableActions}
                              className="px-3 py-1 rounded-lg border border-sky-500/40 bg-sky-500/15 text-xs font-medium text-sky-200 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Προεπισκόπηση
                            </button>
                          )}
                          {onDownload && (
                            <button
                              type="button"
                              onClick={() => onDownload(entry)}
                              disabled={disableActions}
                              className="px-3 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Λήψη
                            </button>
                          )}
                          {onReceipt && (
                            <button
                              type="button"
                              onClick={() => onReceipt(entry)}
                              disabled={disableActions}
                              className="px-3 py-1 rounded-lg border border-slate-500/30 bg-slate-700/10 text-xs font-medium text-slate-200 transition hover:bg-slate-700/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Print Receipt (80mm)
                            </button>
                          )}
                          {onIssueSurcharge && (['villa1','villa2'].includes(entry.branchId)) && (
                            <button
                              type="button"
                              onClick={() => onIssueSurcharge(entry)}
                              disabled={disableActions}
                              className="px-3 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Έκδοση TAAK
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTable;
