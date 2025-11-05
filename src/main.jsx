// jsPDF will be loaded via script tag in HTML
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './pdfGenerator.js';

// Import premium components
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import StatusMessage from './components/StatusMessage.jsx';
import CustomerPanel from './components/CustomerPanel.jsx';
import InvoiceMetadata from './components/InvoiceMetadata.jsx';
import ItemsTable from './components/ItemsTable.jsx';
import TotalsPanel from './components/TotalsPanel.jsx';
import FailedSubmissions from './components/FailedSubmissions.jsx';
import HistoryTable from './components/HistoryTable.jsx';
import BackendControls from './components/BackendControls.jsx';
import TestsPanel from './components/TestsPanel.jsx';
import DashboardSummary from './components/DashboardSummary.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import PDFPreviewModal from './components/PDFPreviewModal.jsx';

const BRANCHES = {
  central: {
    id: 'central',
    label: 'Italian Corner - Meeting Point',
    series: 'I-REST',
    revenueMapping: {
      documentType: '1.1',
      revenueCategory: 'RESTAURANT_SERVICES',
      defaultVat: 13,
      allowedVatRates: [13, 24],
      vatMap: { 13: 'VAT_13', 24: 'VAT_24', 0: 'VAT_0' },
      e3: { code: 'E3_RESTAURANT' },
      e3Surcharge: { code: 'E3_SURCHARGE' },
    },
    issuer: {
      name: "ITALIAN CORNER 'meeting point'",
      vat: '099999999',
      address: 'Μάρκου Πορτάλιου 25',
      city: 'Ρέθυμνο',
      zip: '74100',
      phone: '+302831020010',
    },
  },
  villa1: {
    id: 'villa1',
    label: 'Villa Alexandros',
    series: 'I-VILLA1',
    revenueMapping: {
      documentType: '1.1',
      revenueCategory: 'ACCOMMODATION',
      defaultVat: 13,
      allowedVatRates: [13, 24],
      vatMap: { 13: 'VAT_13', 24: 'VAT_24', 0: 'VAT_0' },
      e3: { code: 'E3_ACCOMMODATION' },
      e3Surcharge: { code: 'E3_SURCHARGE' },
      // Auto surcharge calculation rule: TAAK (seasonal per-night)
      // Summer (Apr-Oct): 8€/night, Winter (Nov-Mar): 2€/night
      surchargeRule: { mode: 'seasonalPerNight', summerRate: 8, winterRate: 2 },
    },
    issuer: {
      name: 'Villa Alexandros OE',
      vat: '088888888',
      address: 'Eparchiaki Odos Viran Episkopis-Monis Arkadiou 35',
      city: 'Σκουλούφια',
      zip: '74052',
      phone: '',
    },
  },
  villa2: {
    id: 'villa2',
    label: "3A's Family Luxury Villa",
    series: 'I-VILLA2',
    revenueMapping: {
      documentType: '1.1',
      revenueCategory: 'ACCOMMODATION',
      defaultVat: 13,
      allowedVatRates: [13, 24],
      vatMap: { 13: 'VAT_13', 24: 'VAT_24', 0: 'VAT_0' },
      e3: { code: 'E3_ACCOMMODATION' },
      e3Surcharge: { code: 'E3_SURCHARGE' },
      // Same TAAK seasonal rule for this villa
      surchargeRule: { mode: 'seasonalPerNight', summerRate: 8, winterRate: 2 },
    },
    issuer: {
      name: "3A's Family Luxury Villa OE",
      vat: '077777777',
      address: 'Akadimias Vivi, 39',
      city: 'Ρέθυμνο Πόλη',
      zip: '74150',
      phone: '',
    },
  },
};

function validateInvoiceForAADE(invoice, branchCfg) {
  const errors = [];
  if (!invoice.invoiceNumber) errors.push('Αριθμός τιμολογίου είναι υποχρεωτικός.');
  if (!invoice.invoiceDate) errors.push('Ημερομηνία είναι υποχρεωτική.');
  if (!invoice.branchId || !BRANCHES[invoice.branchId]) errors.push('Άκυρο υποκατάστημα.');
  if (!invoice.customer?.name) errors.push('Επωνυμία πελάτη είναι υποχρεωτική.');
  if (!invoice.customer?.vat) errors.push('ΑΦΜ πελάτη είναι υποχρεωτικό.');
  if (!invoice.items?.length) errors.push('Πρέπει να υπάρχει τουλάχιστον μία γραμμή είδους/υπηρεσίας.');
  invoice.items.forEach((it, i) => {
    if (!it.description) errors.push(`Γραμμή ${i + 1}: Περιγραφή υποχρεωτική.`);
    if (!(it.qty > 0)) errors.push(`Γραμμή ${i + 1}: Ποσότητα > 0.`);
    if (!(it.price >= 0)) errors.push(`Γραμμή ${i + 1}: Τιμή >= 0.`);
    if (!branchCfg.revenueMapping.allowedVatRates.includes(Number(it.vatRate))) {
      errors.push(`Γραμμή ${i + 1}: Μη επιτρεπτός συντελεστής ΦΠΑ για ${branchCfg.label}.`);
    }
  });
  return errors;
}

function buildMyDataPayload(invoice, branchCfg, opts = {}) {
  const vatMap = branchCfg?.revenueMapping?.vatMap || { 13: 'VAT_13', 24: 'VAT_24', 0: 'VAT_0' };
  const e3Map = branchCfg?.revenueMapping?.e3 || { code: 'E3_GENERIC' };
  const header = {
    series: branchCfg.series,
    aa: invoice.invoiceNumber,
    issueDate: invoice.invoiceDate,
    docType: branchCfg.revenueMapping.documentType,
    issuer: branchCfg.issuer,
    counterparty: {
      name: invoice.customer.name,
      vat: invoice.customer.vat,
      email: invoice.customer.email || undefined,
      address: invoice.customer.address || undefined,
      city: invoice.customer.city || undefined,
    },
    paymentMethod: invoice.paymentMethod || 'cash',
  };
  const baseLines = (invoice.items || []).map((it, idx) => {
    const net = it.qty * it.price;
    const vatAmt = net * (it.vatRate / 100);
    return {
      lineNumber: idx + 1,
      description: it.description,
      qty: it.qty,
      unitPrice: it.price,
      netAmount: round2(net),
      vatCategory: vatMap[it.vatRate] || `${it.vatRate}%`,
      vatAmount: round2(vatAmt),
      revenueClassification: e3Map.code || branchCfg.revenueMapping.revenueCategory,
    };
  });
  const surcharge = Number(invoice.surcharge || 0);
  let lines = [...baseLines];
  const totalsBase = calcTotals(invoice.items || []);
  let totals = { net: totalsBase.net, vat: totalsBase.vat };

  const mode = opts.surchargeMode || 'autoLine'; // 'autoLine' | 'separateInvoice' | 'surchargeOnly'
  if (mode === 'autoLine') {
    if (surcharge > 0) {
      lines.push({
        lineNumber: baseLines.length + 1,
        description: 'Τέλος Ανθεκτικότητας (TAAK)',
        qty: 1,
        unitPrice: round2(surcharge),
        netAmount: round2(surcharge),
        vatCategory: vatMap[0] || 'VAT_0',
        vatAmount: 0,
        revenueClassification: (branchCfg?.revenueMapping?.e3Surcharge?.code) || (e3Map.surchargeCode) || 'E3_SURCHARGE',
      });
    }
    totals = { net: totalsBase.net + surcharge, vat: totalsBase.vat };
  } else if (mode === 'separateInvoice') {
    // μην συμπεριλάβεις το surcharge εδώ
    totals = { net: totalsBase.net, vat: totalsBase.vat };
  } else if (mode === 'surchargeOnly') {
    // μόνο γραμμή surcharge
    lines = surcharge > 0 ? [{
      lineNumber: 1,
      description: 'Τέλος Ανθεκτικότητας (TAAK)',
      qty: 1,
      unitPrice: round2(surcharge),
      netAmount: round2(surcharge),
      vatCategory: vatMap[0] || 'VAT_0',
      vatAmount: 0,
      revenueClassification: (branchCfg?.revenueMapping?.e3Surcharge?.code) || (e3Map.surchargeCode) || 'E3_SURCHARGE',
    }] : [];
    totals = { net: round2(surcharge), vat: 0 };
  }
  return {
    header,
    lines,
    totals: {
      net: round2(totals.net),
      vat: round2(totals.vat),
      gross: round2(totals.net + totals.vat),
      surcharge: round2(surcharge),
    },
    meta: {
      branchId: invoice.branchId,
      sandbox: true,
    },
  };
}

function calcTotals(items) {
  const net = items.reduce((s, i) => s + i.qty * i.price, 0);
  const vat = items.reduce((s, i) => s + i.qty * i.price * (i.vatRate / 100), 0);
  return { net, vat };
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

async function submitToAADEMock(payload) {
  await new Promise((r) => setTimeout(r, 650));
  const fail = Math.random() < 0.35 || String(payload?.header?.counterparty?.vat || '').toUpperCase().includes('FAIL');
  if (fail) return { ok: false, error: 'Αποτυχία επικοινωνίας με AADE (mock).' };
  const mark = `MARK-${Date.now()}`;
  return { ok: true, mark };
}

function storageKeyCustomers(branchId){
  return `customers_${branchId}`;
}

function storageKeyHistory(){
  return 'invoices_history';
}

function invoiceSequenceKey(branchId) {
  return `invoice_sequence_${branchId}`;
}

function parseInvoiceSequence(value) {
  const match = String(value ?? '').match(/(\d+)(?!.*\d)/);
  return match ? parseInt(match[1], 10) : null;
}

function computeHighestSequenceFromHistory(branchId, historyList) {
  return historyList.reduce((max, entry) => {
    if (entry.branchId !== branchId) return max;
    const seq = parseInvoiceSequence(entry.invoiceNumber);
    return seq !== null && seq > max ? seq : max;
  }, 0);
}

function syncInvoiceSequence(branchId, historyList) {
  const highest = computeHighestSequenceFromHistory(branchId, historyList);
  const stored = Number(localStorage.getItem(invoiceSequenceKey(branchId)) || 0);
  if (highest > stored) {
    localStorage.setItem(invoiceSequenceKey(branchId), String(highest));
  }
}

function generateNextInvoiceNumberValue(branchId, historyList) {
  const stored = Number(localStorage.getItem(invoiceSequenceKey(branchId)) || 0);
  const highest = computeHighestSequenceFromHistory(branchId, historyList);
  const next = Math.max(stored, highest) + 1;
  return next.toString().padStart(4, '0');
}

function commitInvoiceSequence(branchId, invoiceNumber) {
  const seq = parseInvoiceSequence(invoiceNumber);
  if (seq !== null) {
    localStorage.setItem(invoiceSequenceKey(branchId), String(seq));
  }
}

function InvoiceAppMock() {
  // Navigation state
  const [activeSection, setActiveSection] = useState('invoice');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State management
  const [branch, setBranch] = useState('central');
  const branchCfg = useMemo(() => BRANCHES[branch], [branch]);
  const [customer, setCustomer] = useState({ name: '', vat: '', email: '', address: '', city: '' });
  const [items, setItems] = useState([{ description: '', qty: 1, price: 0, vatRate: 13 }]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().substring(0, 10));
  const [invoiceNumber, setInvoiceNumber] = useState('0001');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [surcharge, setSurcharge] = useState(0);
  const [separateSurcharge, setSeparateSurcharge] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', msg: '' });
  const [loadingState, setLoadingState] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [failedQueue, setFailedQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aade_failed_queue') || '[]'); } catch { return []; }
  });
  const [logoUrl, setLogoUrl] = useState('/assets/italiancornerDesktop App Icon.png');
  const dynamicLogoUrl = useMemo(() => {
    const logoMap = {
      central: '/assets/italian_corner.png',
      villa1: '/assets/villa_alexandros.png',
      villa2: '/assets/villa_3as.png',
    };
    return logoMap[branch] || '/assets/italiancornerDesktop App Icon.png';
  }, [branch]);
  const [customers, setCustomers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKeyCustomers('central')) || '[]'); } catch { return []; }
  });
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKeyHistory()) || '[]'); } catch { return []; }
  });
  // Default to backend in local dev, mock in production/live
  const [useBackend, setUseBackend] = useState(() => (location.hostname === 'localhost' || location.hostname === '127.0.0.1'));
  const [backendBase, setBackendBase] = useState(() => (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:3000' : '');
  const [pdfPreviewState, setPdfPreviewState] = useState({ open: false, url: null, blob: null, fileName: '' });
  const totals = useMemo(() => calcTotals(items), [items]);
  const isVilla = branch === 'villa1' || branch === 'villa2';
  useEffect(() => { if (!isVilla) setSurcharge(0); }, [branch, isVilla]);
  // Auto-calc surcharge for villas based on simple per-branch rule
  useEffect(() => {
    if (!isVilla) return;
    const rule = branchCfg?.revenueMapping?.surchargeRule || null;
    if (!rule) return;
    let value = 0;
    if (rule.mode === 'perNight') {
      const nights = items.reduce((s, it) => s + Number(it.qty || 0), 0);
      value = Number(rule.rate || 0) * nights;
    } else if (rule.mode === 'seasonalPerNight') {
      const nights = items.reduce((s, it) => s + Number(it.qty || 0), 0);
      const d = new Date(invoiceDate);
      const m = isNaN(d.getTime()) ? (new Date()).getMonth() + 1 : d.getMonth() + 1; // 1..12
      const isSummer = m >= 4 && m <= 10; // Απρίλιος-Οκτώβριος
      const rate = isSummer ? Number(rule.summerRate || 0) : Number(rule.winterRate || 0);
      value = rate * nights;
    } else if (rule.mode === 'percentNet') {
      const net = items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.price || 0), 0);
      value = net * Number(rule.percent || 0);
    } else if (rule.mode === 'flatPerInvoice') {
      value = Number(rule.amount || 0);
    }
    // snap to 2 decimals
    value = Math.round((value + Number.EPSILON) * 100) / 100;
    setSurcharge(value);
  }, [isVilla, branchCfg, items, invoiceDate]);
  useEffect(() => { try { const data = JSON.parse(localStorage.getItem(storageKeyCustomers(branch)) || '[]'); setCustomers(Array.isArray(data)?data:[]); } catch { setCustomers([]); } }, [branch]);
  // Sync internal invoice sequence counter with history when branch or history changes
  useEffect(() => { try { syncInvoiceSequence(branch, history); } catch {} }, [branch, history]);
  // Always compute and set the next invoice number automatically based on branch and history
  useEffect(() => {
    try {
      const nextVal = generateNextInvoiceNumberValue(branch, history);
      setInvoiceNumber(nextVal);
    } catch {}
  }, [branch, history]);
  const persistFailedQueue = (q) => { setFailedQueue(q); localStorage.setItem('aade_failed_queue', JSON.stringify(q)); };
  const persistCustomers = (list) => { setCustomers(list); localStorage.setItem(storageKeyCustomers(branch), JSON.stringify(list)); };
  const persistHistory = (list) => { setHistory(list); localStorage.setItem(storageKeyHistory(), JSON.stringify(list)); };
  const openConfirm = (config) => setConfirmState(config);
  const closeConfirm = () => setConfirmState(null);
  const handleDialogConfirm = async () => {
    try {
      if (confirmState?.onConfirm) {
        await Promise.resolve(confirmState.onConfirm());
      }
    } finally {
      closeConfirm();
    }
  };
  const handleDialogCancel = () => closeConfirm();
  const saveDraft = () => { const draft = { branchId: branchCfg.id, invoiceDate, invoiceNumber, customer, items, surcharge, paymentMethod, separateSurcharge }; localStorage.setItem('invoice_draft', JSON.stringify(draft)); setStatus({ type: 'info', msg: 'Αποθηκεύτηκε πρόχειρο.' }); };
  const loadDraft = () => { try { const d = JSON.parse(localStorage.getItem('invoice_draft') || 'null'); if (!d) { setStatus({ type: 'error', msg: 'Δεν βρέθηκε πρόχειρο.' }); return; } setBranch(d.branchId in BRANCHES ? d.branchId : 'central'); setCustomer(d.customer || { name: '', vat: '', email: '', address: '', city: '' }); setItems(d.items || [{ description: '', qty: 1, price: 0, vatRate: 13 }]); setInvoiceDate(d.invoiceDate || new Date().toISOString().substring(0,10)); /* invoiceNumber auto-set by effect */ setSurcharge(d.surcharge || 0); setPaymentMethod(d.paymentMethod || 'cash'); setSeparateSurcharge(Boolean(d.separateSurcharge)); setStatus({ type: 'success', msg: 'Φορτώθηκε πρόχειρο.' }); } catch { setStatus({ type: 'error', msg: 'Σφάλμα ανάγνωσης προχείρου.' }); } };
  const addItem = () => setItems((prev) => [...prev, { description: '', qty: 1, price: 0, vatRate: branchCfg.revenueMapping.defaultVat }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const addCustomer = () => { if (!customer.name || !customer.vat) { setStatus({ type: 'error', msg: 'Συμπλήρωσε Επωνυμία και ΑΦΜ για αποθήκευση πελάτη.' }); return; } const exists = customers.some(c => c.vat === customer.vat); const list = exists ? customers.map(c => c.vat === customer.vat ? { ...customer } : c) : [{ ...customer }, ...customers]; persistCustomers(list); setStatus({ type: 'success', msg: exists ? 'Ενημερώθηκε ο πελάτης.' : 'Προστέθηκε νέος πελάτης.' }); };
  const deleteCustomer = (vat, name) => {
    const list = customers.filter(c => c.vat !== vat);
    persistCustomers(list);
    if (customer.vat === vat) setCustomer({ name: '', vat: '', email: '', address: '', city: '' });
    setStatus({ type: 'success', msg: `Διαγράφηκε ο πελάτης ${name || vat}.` });
  };
  const requestCustomerDeletion = (customerToRemove) => {
    if (!customerToRemove) return;
    const label = customerToRemove.name || customerToRemove.vat;
    openConfirm({
      title: 'Διαγραφή πελάτη',
      message: `Η επαφή «${label}» θα διαγραφεί από το πελατολόγιο. Θέλετε να συνεχίσετε;`,
      confirmLabel: 'Διαγραφή',
      cancelLabel: 'Άκυρο',
      intent: 'danger',
      onConfirm: () => deleteCustomer(customerToRemove.vat, label),
    });
  };
  const pickCustomer = (vat) => { const c = customers.find(x => x.vat === vat); if (c) setCustomer({ ...c }); };
  const addHistoryEntry = (entry) => { const list = [{ id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, ...entry }, ...history]; persistHistory(list); };
  const updateHistoryEntryByInvoice = (invoiceNumber, patch) => { const list = history.map(h => h.invoiceNumber === invoiceNumber ? { ...h, ...patch } : h); persistHistory(list); };
  const serverValidate = async (payload) => { const url = `${backendBase.replace(/\/$/,'')}/api/aade/validate`; const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Validate failed'); return res.json(); };
  const serverSubmit = async (payload) => { const url = `${backendBase.replace(/\/$/,'')}/api/aade/submit`; const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }; return res.json(); };
  const serverRetry = async (payload) => { const url = `${backendBase.replace(/\/$/,'')}/api/aade/retry`; const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }; return res.json(); };
  const removeFailedEntry = (index) => {
    const q = failedQueue.filter((_, idx) => idx !== index);
    persistFailedQueue(q);
    setStatus({ type: 'info', msg: 'Η αποτυχημένη υποβολή αφαιρέθηκε.' });
  };
  const handleSubmit = async () => {
    setStatus({ type: 'info', msg: 'Υποβολή σε AADE…' });
    const invoice = { branchId: branchCfg.id, invoiceDate, invoiceNumber, customer, items, surcharge };
    const errors = validateInvoiceForAADE(invoice, branchCfg);
    if (errors.length) { setStatus({ type: 'error', msg: errors.join('\n') }); return; }
    const payload = buildMyDataPayload(invoice, branchCfg, { surchargeMode: (isVilla && separateSurcharge) ? 'separateInvoice' : 'autoLine' });
    setLoadingState({ type: 'submit', message: 'Υποβολή τιμολογίου στο myDATA…' });
    
    try {
      let result;
      if (useBackend) {
        // Validation
        const validateResult = await serverValidate(payload);
        if (!validateResult.ok) {
          setStatus({ type: 'error', msg: `Αποτυχία επικύρωσης: ${validateResult.error}` });
          return;
        }
        
        // Submission
        result = await serverSubmit(payload);
      } else {
        // Mock submission
        result = await submitToAADEMock(payload);
      }
      
      if (result.ok) {
        const historyEntry = {
          ...invoice,
          totals: payload.totals,
          status: 'sent',
          mark: result.mark,
          timestamp: Date.now(),
          issueDate: invoiceDate
        };
        addHistoryEntry(historyEntry);
        // Commit used invoice number and pre-fill next suggested number
        try {
          commitInvoiceSequence(branchCfg.id, invoiceNumber);
          const nextVal = generateNextInvoiceNumberValue(branchCfg.id, [historyEntry, ...history]);
          setInvoiceNumber(nextVal);
        } catch {}
        setStatus({ type: 'success', msg: `🎉 ΕΠΙΤΥΧΗΣ ΚΑΤΑΧΩΡΗΣΗ! 🎉\n\nΤο τιμολόγιο ${invoiceNumber} καταχωρήθηκε επιτυχώς στο myDATA.\nΚωδικός AADE: ${result.mark}` });
        
        // Don't clear form automatically - let user decide
      } else {
        const failedEntry = {
          ts: Date.now(),
          payload,
          error: result.error || 'Άγνωστο σφάλμα'
        };
        const newQueue = [...failedQueue, failedEntry];
        persistFailedQueue(newQueue);
        
        const historyEntry = {
          ...invoice,
          totals: payload.totals,
          status: 'failed',
          error: result.error,
          timestamp: Date.now(),
          issueDate: invoiceDate
        };
        addHistoryEntry(historyEntry);
        setStatus({ type: 'error', msg: `Αποτυχία υποβολής: ${result.error}` });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus({ type: 'error', msg: `Σφάλμα δικτύου: ${error.message}` });
    } finally {
      setLoadingState(null);
    }
  };

  const resetForm = () => {
    setBranch('central');
    setCustomer({ name: '', vat: '', email: '', address: '', city: '' });
    setItems([{ description: '', qty: 1, price: 0, vatRate: 13 }]);
    setInvoiceDate(new Date().toISOString().substring(0, 10));
    // invoiceNumber will be auto-set by the effect using branch/history
    setSurcharge(0);
    setSeparateSurcharge(false);
    setStatus({ type: 'info', msg: 'Καθαρίστηκαν όλα τα πεδία.' });
  };
  const requestFormReset = () => {
    openConfirm({
      title: 'Καθαρισμός φόρμας',
      message: 'Θα διαγραφούν τα δεδομένα του τρέχοντος τιμολογίου. Θέλετε να συνεχίσετε;',
      confirmLabel: 'Καθαρισμός',
      cancelLabel: 'Άκυρο',
      intent: 'danger',
      onConfirm: resetForm,
    });
  };

  const retryAll = async () => {
    if (!failedQueue.length) return;
    setStatus({ type: 'info', msg: 'Επανάληψη όλων των αποτυχημένων υποβολών...' });
    setLoadingState({ type: 'retryAll', message: 'Επανάληψη όλων των αποτυχημένων υποβολών…' });
    try {
      for (let i = 0; i < failedQueue.length; i++) {
        await retryOne(i, { showLoader: false });
      }
    } finally {
      setLoadingState(null);
    }
  };

  const retryOne = async (index, { showLoader = true } = {}) => {
    const entry = failedQueue[index];
    if (!entry) return;
    if (showLoader) setLoadingState({ type: 'retryOne', message: `Επανάληψη υποβολής #${index + 1}…` });
    
    try {
      const result = useBackend ? 
        await serverRetry(entry.payload) : 
        await submitToAADEMock(entry.payload);
      
      if (result.ok) {
        removeFailedEntry(index);
        setStatus({ type: 'success', msg: `Επιτυχής επανάληψη υποβολής #${index + 1}` });
      } else {
        setStatus({ type: 'error', msg: `Αποτυχία επανάληψης: ${result.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: `Σφάλμα επανάληψης: ${err.message}` });
    } finally {
      if (showLoader) setLoadingState(null);
    }
  };

  const branchIssuer = branchCfg.issuer;
  const buildCurrentInvoice = () => ({
    branchId: branchCfg.id,
    invoiceDate,
    issueDate: invoiceDate,
    invoiceNumber,
    customer: { ...customer },
    items: items.map((item) => ({ ...item })),
    paymentMethod,
    surcharge,
  });

  const prepareInvoiceForPreview = (invoiceData) => normalizeInvoiceForPdf(invoiceData);

  const openPreviewForInvoice = async (invoiceData) => {
    if (!window.PDFGenerator?.generateInvoicePDFBlob) {
      setStatus({ type: 'error', msg: 'Το PDF module δεν είναι διαθέσιμο. Παρακαλώ ανανεώστε τη σελίδα.' });
      return;
    }

    setLoadingState({ type: 'pdf-preview', message: 'Δημιουργία προεπισκόπησης PDF…' });
    try {
      const preparedInvoice = prepareInvoiceForPreview(invoiceData);
      const blob = await window.PDFGenerator.generateInvoicePDFBlob(preparedInvoice, BRANCHES);
      const fileName = `invoice_${preparedInvoice.invoiceNumber || 'preview'}.pdf`;
      const objectUrl = URL.createObjectURL(blob);
      setPdfPreviewState((prev) => {
        if (prev.url) URL.revokeObjectURL(prev.url);
        return { open: true, url: objectUrl, blob, fileName };
      });
    } catch (error) {
      console.error('PDF preview error:', error);
      setStatus({ type: 'error', msg: `Σφάλμα δημιουργίας PDF: ${error.message}` });
    } finally {
      setLoadingState(null);
    }
  };

  const handlePreviewCurrentInvoice = async () => {
    const invoice = buildCurrentInvoice();
    const errors = validateInvoiceForAADE(invoice, branchCfg);
    if (errors.length) {
      setStatus({ type: 'error', msg: errors.join('\n') });
      return;
    }
    const invoiceWithTotals = {
      ...invoice,
      totals: {
        net: round2(totals.net),
        vat: round2(totals.vat),
        gross: round2(totals.net + totals.vat + ((isVilla && separateSurcharge) ? 0 : Number(surcharge || 0))),
        surcharge: round2(Number(surcharge || 0)),
      },
    };
    await openPreviewForInvoice(invoiceWithTotals);
  };

  const handlePreviewHistoryInvoice = async (historyEntry) => {
    if (!historyEntry) return;
    await openPreviewForInvoice(historyEntry);
  };

  const handleReceiptHistoryInvoice = (historyEntry) => {
    if (!historyEntry) return;
    if (typeof window.PDFGenerator?.generateThermalReceiptPDFBlob !== 'function') {
      setStatus({ type: 'error', msg: 'Το PDF module δεν υποστηρίζει thermal αποδείξεις.' });
      return;
    }
    (async () => {
      try {
        setLoadingState({ type: 'pdf-preview', message: 'Δημιουργία προεπισκόπησης αποδείκτη…' });
        const prepared = normalizeInvoiceForPdf(historyEntry);
        const blob = await window.PDFGenerator.generateThermalReceiptPDFBlob(prepared, BRANCHES, dynamicLogoUrl, { qr: true });
        const fileName = `receipt_${prepared.invoiceNumber || 'preview'}.pdf`;
        const objectUrl = URL.createObjectURL(blob);
        setPdfPreviewState((prev) => {
          if (prev.url) URL.revokeObjectURL(prev.url);
          return { open: true, url: objectUrl, blob, fileName };
        });
      } catch (err) {
        console.error('Receipt preview error', err);
        setStatus({ type: 'error', msg: `Σφάλμα δημιουργίας αποδέκτη: ${err.message || String(err)}` });
      } finally {
        setLoadingState(null);
      }
    })();
  };

  const handlePrintThermalCurrentInvoice = () => {
    const invoice = buildCurrentInvoice();
    const errors = validateInvoiceForAADE(invoice, branchCfg);
    if (errors.length) {
      setStatus({ type: 'error', msg: errors.join('\n') });
      return;
    }
    if (typeof window.PDFGenerator?.generateThermalReceiptPDFBlob !== 'function') {
      setStatus({ type: 'error', msg: 'Το PDF module δεν υποστηρίζει thermal αποδείξεις.' });
      return;
    }
    (async () => {
      try {
        setLoadingState({ type: 'pdf-preview', message: 'Δημιουργία προεπισκόπησης αποδείκτη…' });
        const prepared = normalizeInvoiceForPdf({
          ...invoice,
          totals: {
            net: round2(totals.net),
            vat: round2(totals.vat),
            gross: round2(totals.net + totals.vat + ((isVilla && separateSurcharge) ? 0 : Number(surcharge || 0))),
            surcharge: round2(Number(surcharge || 0)),
          }
        });
        const blob = await window.PDFGenerator.generateThermalReceiptPDFBlob(prepared, BRANCHES, dynamicLogoUrl, { qr: true });
        const fileName = `receipt_${prepared.invoiceNumber || 'preview'}.pdf`;
        const objectUrl = URL.createObjectURL(blob);
        setPdfPreviewState((prev) => {
          if (prev.url) URL.revokeObjectURL(prev.url);
          return { open: true, url: objectUrl, blob, fileName };
        });
      } catch (err) {
        console.error('Receipt preview error', err);
        setStatus({ type: 'error', msg: `Σφάλμα δημιουργίας αποδέκτη: ${err.message || String(err)}` });
      } finally {
        setLoadingState(null);
      }
    })();
  };

  const closePdfPreview = () => {
    setPdfPreviewState((prev) => {
      if (prev.url) URL.revokeObjectURL(prev.url);
      return { open: false, url: null, blob: null, fileName: '' };
    });
  };

  // Issue separate TAAK document for a history invoice (villas)
  const handleIssueSurchargeForHistory = async (historyEntry) => {
    if (!historyEntry) return;
    const targetBranch = historyEntry.branchId;
    const cfg = BRANCHES[targetBranch];
    if (!cfg) { setStatus({ type: 'error', msg: 'Άγνωστο υποκατάστημα για TAAK.' }); return; }
    const isVillaRow = targetBranch === 'villa1' || targetBranch === 'villa2';
    if (!isVillaRow) { setStatus({ type: 'error', msg: 'Το TAAK ισχύει μόνο για τις βίλες.' }); return; }

    // Υπολόγισε surcharge βάσει κανόνα/ημερομηνίας του entry
    let surchargeValue = Number(historyEntry?.surcharge || historyEntry?.totals?.surcharge || 0);
    if (!surchargeValue) {
      // αν δεν έχει αποθηκευτεί, υπολόγισε ξανά με βάση τον κανόνα του branch
      const rule = cfg?.revenueMapping?.surchargeRule;
      if (rule) {
        const nights = (historyEntry.items || []).reduce((s, it) => s + Number(it.qty || 0), 0);
        let v = 0;
        if (rule.mode === 'seasonalPerNight') {
          const d = new Date(historyEntry.issueDate || historyEntry.invoiceDate || new Date());
          const m = isNaN(d.getTime()) ? (new Date()).getMonth() + 1 : d.getMonth() + 1;
          const isSummer = m >= 4 && m <= 10;
          const rate = isSummer ? Number(rule.summerRate || 0) : Number(rule.winterRate || 0);
          v = rate * nights;
        } else if (rule.mode === 'perNight') {
          v = Number(rule.rate || 0) * nights;
        } else if (rule.mode === 'flatPerInvoice') {
          v = Number(rule.amount || 0);
        }
        surchargeValue = Math.round((v + Number.EPSILON) * 100) / 100;
      }
    }
    if (!surchargeValue) { setStatus({ type: 'error', msg: 'Δεν προέκυψε ποσό TAAK για έκδοση.' }); return; }

    // Δημιούργησε νέο τιμολόγιο μόνο με TAAK
    const newNumber = generateNextInvoiceNumberValue(targetBranch, history);
    const today = new Date().toISOString().slice(0,10);
    const surchargeInvoice = {
      branchId: targetBranch,
      invoiceDate: today,
      issueDate: today,
      invoiceNumber: newNumber,
      customer: { ...(historyEntry.customer || {}) },
      items: [],
      surcharge: surchargeValue,
      paymentMethod: historyEntry.paymentMethod || 'cash',
    };
    const payload = buildMyDataPayload(surchargeInvoice, cfg, { surchargeMode: 'surchargeOnly' });

    setLoadingState({ type: 'submit', message: 'Έκδοση TAAK…' });
    try {
      const result = useBackend ? await serverSubmit(payload) : await submitToAADEMock(payload);
      const historyEntry2 = {
        ...surchargeInvoice,
        totals: payload.totals,
        status: result.ok ? 'sent' : 'failed',
        mark: result.ok ? result.mark : undefined,
        error: result.ok ? undefined : (result.error || 'Άγνωστο σφάλμα'),
        timestamp: Date.now(),
      };
      addHistoryEntry(historyEntry2);
      if (result.ok) {
        commitInvoiceSequence(targetBranch, newNumber);
        setStatus({ type: 'success', msg: `Εκδόθηκε TAAK #${newNumber} (${surchargeValue.toFixed(2)} €). MARK: ${result.mark}` });
      } else {
        setStatus({ type: 'error', msg: `Αποτυχία έκδοσης TAAK: ${result.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: `Σφάλμα δικτύου: ${err.message}` });
    } finally {
      setLoadingState(null);
    }
  };

  const handlePreviewDownload = () => {
    const { blob, fileName, url } = pdfPreviewState;
    if (!blob && !url) return;
    const downloadUrl = url || URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || 'invoice.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (!url && blob) {
      URL.revokeObjectURL(downloadUrl);
    }
  };

  useEffect(() => () => {
    if (pdfPreviewState.url) {
      URL.revokeObjectURL(pdfPreviewState.url);
    }
  }, [pdfPreviewState.url]);

  const summaryStats = useMemo(() => {
    const branchHistory = history.filter((entry) => entry.branchId === branch);
    const totalInvoices = branchHistory.length;
    const sentInvoices = branchHistory.filter((entry) => entry.status === 'sent').length;
    const failedInvoices = branchHistory.filter((entry) => entry.status === 'failed').length;
    const queueLength = failedQueue.length;
    const sentPercentage = totalInvoices ? Math.round((sentInvoices / totalInvoices) * 100) : 0;

    const now = new Date();
    const monthlyHistory = branchHistory.filter((entry) => {
      const issue = entry.issueDate || entry.invoiceDate;
      if (!issue) return false;
      const date = new Date(issue);
      return !Number.isNaN(date.getTime()) &&
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth();
    });

    const monthlyTotals = monthlyHistory.reduce(
      (acc, entry) => {
        const totals = entry.totals || {};
        const net = Number(totals.net || 0);
        const vat = Number(totals.vat || 0);
        const gross = totals.gross != null ? Number(totals.gross) : net + vat;
        acc.net += net;
        acc.vat += vat;
        acc.gross += gross;
        return acc;
      },
      { net: 0, vat: 0, gross: 0 }
    );

    return {
      totalInvoices,
      currentBranchLabel: branchCfg.label,
      sentInvoices,
      failedInvoices,
      queueLength,
      sentPercentage,
      monthlyNet: round2(monthlyTotals.net || 0),
      monthlyVat: round2(monthlyTotals.vat || 0),
      monthlyGross: round2(monthlyTotals.gross || 0),
    };
  }, [branch, branchCfg.label, failedQueue.length, history]);
  const loadingType = loadingState?.type;
  const isProcessing = Boolean(loadingState);
  const handleNavigate = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  // Render invoice creation section
  const renderInvoiceSection = () => (
    <div className="space-y-6">
      <DashboardSummary stats={summaryStats} />

      <CustomerPanel
        customer={customer}
        customers={customers}
        onCustomerChange={setCustomer}
        onAddCustomer={addCustomer}
        onRequestDeleteCustomer={(payload) => requestCustomerDeletion(payload)}
        onPickCustomer={(vat) => pickCustomer(vat)}
      />
      
      <InvoiceMetadata
        branch={branch}
        branches={BRANCHES}
        branchCfg={branchCfg}
        invoiceNumber={invoiceNumber}
        invoiceDate={invoiceDate}
        paymentMethod={paymentMethod}
        onBranchChange={setBranch}
        onInvoiceNumberChange={setInvoiceNumber}
        onInvoiceDateChange={setInvoiceDate}
        onPaymentMethodChange={setPaymentMethod}
      />

      <ItemsTable
        items={items}
        branchCfg={branchCfg}
        onChangeItem={(idx, patch) => {
          const arr = [...items];
          arr[idx] = { ...arr[idx], ...patch };
          setItems(arr);
        }}
        onAddItem={addItem}
        onRemoveItem={removeItem}
      />

      <TotalsPanel
        isVilla={isVilla}
        totals={totals}
        surcharge={surcharge}
        onSurchargeChange={setSurcharge}
        separateSurcharge={separateSurcharge}
        onToggleSeparateSurcharge={setSeparateSurcharge}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <button
          onClick={handlePreviewCurrentInvoice}
          disabled={isProcessing}
          className="w-full px-6 py-3 bg-sky-700 text-white rounded-2xl font-semibold text-sm shadow-sm hover:shadow-md transform transition hover:-translate-y-0.5 border border-sky-600/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Προεπισκόπηση PDF
        </button>

        {/* Removed manual Next Number button; invoice number is auto-managed */}

        <div className="lg:col-span-1 xl:col-span-2">
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5 border border-emerald-600/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Υποβολή σε myDATA (Sandbox)
          </button>
        </div>

        <button
          onClick={handlePrintThermalCurrentInvoice}
          disabled={isProcessing}
          className="w-full px-6 py-3 bg-slate-800 text-slate-100 rounded-2xl font-semibold text-sm shadow-sm hover:shadow-md transform transition hover:-translate-y-0.5 border border-slate-700/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Print Receipt (80mm)
        </button>

        <button
          onClick={saveDraft}
          disabled={isProcessing}
          className="w-full px-6 py-3 bg-slate-900/70 text-slate-200 rounded-2xl font-semibold text-sm shadow-sm hover:shadow-md transform transition hover:-translate-y-0.5 border border-slate-700/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Αποθήκευση Προχείρου
        </button>

        <button
          onClick={loadDraft}
          disabled={isProcessing}
          className="w-full px-6 py-3 bg-violet-700 text-white rounded-2xl font-semibold text-sm shadow-sm hover:shadow-md transform transition hover:-translate-y-0.5 border border-violet-600/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Φόρτωση Προχείρου
        </button>

        <button
          onClick={requestFormReset}
          disabled={isProcessing}
          className="w-full px-6 py-3 bg-transparent text-slate-300 rounded-2xl font-semibold text-sm hover:bg-slate-800/40 transition border border-slate-700/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Καθαρισμός
        </button>
      </div>
    </div>
  );

  // Render history section
  const renderHistorySection = () => (
    <HistoryTable
      history={history}
      branches={BRANCHES}
      currentBranchId={branch}
      onPreview={handlePreviewHistoryInvoice}
      onDownload={downloadInvoicePDF}
      onReceipt={handleReceiptHistoryInvoice}
      onIssueSurcharge={handleIssueSurchargeForHistory}
      disableActions={isProcessing}
    />
  );

  // Render failed submissions section
  const renderFailedSection = () => (
    <FailedSubmissions
      failedQueue={failedQueue}
      branches={BRANCHES}
      onRetryAll={retryAll}
      onRetryOne={retryOne}
      loadingType={loadingType}
      onRequestDeleteOne={(index, entry) => {
        if (typeof index !== 'number') return;
        const descriptor = entry?.invoiceNumber ? `#${entry.invoiceNumber}` : 'που επιλέξατε';
        openConfirm({
          title: 'Διαγραφή αποτυχημένης υποβολής',
          message: `Η αποτυχημένη υποβολή για το τιμολόγιο ${descriptor} θα αφαιρεθεί από τη λίστα. Η ενέργεια δεν μπορεί να αναιρεθεί.`,
          confirmLabel: 'Διαγραφή',
          cancelLabel: 'Άκυρο',
          intent: 'danger',
          onConfirm: () => removeFailedEntry(index),
        });
      }}
    />
  );

  // Render settings section
  const renderSettingsSection = () => (
    <div className="space-y-6">
      <BackendControls
        useBackend={useBackend}
        setUseBackend={setUseBackend}
        backendBase={backendBase}
        setBackendBase={setBackendBase}
      />
      <TestsPanel
        BRANCHES={BRANCHES}
        validateInvoiceForAADE={validateInvoiceForAADE}
        buildMyDataPayload={buildMyDataPayload}
      />
    </div>
  );

  return (
    <>
      <div className="relative min-h-screen bg-slate-900 lg:flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        useBackend={useBackend}
        isMobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-6 sm:px-6 lg:px-8">
          <Header
            logoUrl={dynamicLogoUrl}
            branchName={branchCfg.label}
            issuer={branchIssuer}
            onToggleSidebar={() => setSidebarOpen(true)}
          />
        </div>

        {/* Content with padding and scroll */}
        <div className="flex-1 overflow-y-auto px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            {/* Status Message */}
            {status.type !== 'idle' && (
              <div className="sticky top-4 z-10">
                <StatusMessage status={status} />
              </div>
            )}

            {/* Dynamic Section Rendering */}
            {activeSection === 'invoice' && renderInvoiceSection()}
            {activeSection === 'history' && renderHistorySection()}
            {activeSection === 'failed' && renderFailedSection()}
            {activeSection === 'settings' && renderSettingsSection()}
          </div>
        </div>
      </div>
      </div>

      {loadingState && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-800/70 bg-slate-950/80 px-6 py-4 shadow-xl">
            <span className="h-10 w-10 rounded-full border-2 border-emerald-400/40 border-t-transparent animate-spin" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-slate-200">{loadingState.message}</p>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        cancelLabel={confirmState?.cancelLabel}
        intent={confirmState?.intent}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />

      <PDFPreviewModal
        open={pdfPreviewState.open}
        pdfUrl={pdfPreviewState.url}
        fileName={pdfPreviewState.fileName}
        onClose={closePdfPreview}
        onDownload={handlePreviewDownload}
      />
    </>
  );
}

// removed local TestsPanel; using component from ./components/TestsPanel.jsx

function normalizeInvoiceForPdf(invoice) {
  const safeInvoice = invoice ? { ...invoice } : {};
  const items = Array.isArray(safeInvoice.items) ? safeInvoice.items.map((item) => ({ ...item })) : [];
  const computedTotals = calcTotals(items);
  const existingTotals = safeInvoice.totals || {};
  const surchargeValue = Number(safeInvoice.surcharge || 0);
  const net = existingTotals.net != null ? Number(existingTotals.net) : computedTotals.net;
  const vat = existingTotals.vat != null ? Number(existingTotals.vat) : computedTotals.vat;
  const gross = existingTotals.gross != null ? Number(existingTotals.gross) : net + vat + surchargeValue;

  return {
    ...safeInvoice,
    items,
    customer: safeInvoice.customer ? { ...safeInvoice.customer } : undefined,
    issueDate: safeInvoice.issueDate || safeInvoice.invoiceDate,
    totals: {
      net: round2(net),
      vat: round2(vat),
      gross: round2(gross),
      surcharge: round2(existingTotals.surcharge != null ? Number(existingTotals.surcharge) : surchargeValue),
    },
  };
}

// Συνάρτηση για εξαγωγή PDF (χρησιμοποιεί το PDF Generator module)
function downloadInvoicePDF(invoice) {
  // Έλεγχος εάν το PDFGenerator module είναι διαθέσιμο
  if (typeof window.PDFGenerator === 'undefined') {
    alert('Το PDFGenerator module δεν είναι διαθέσιμο. Παρακαλώ φορτώστε τη σελίδα ξανά.');
    return;
  }

  // Κλήση της downloadInvoicePDF από το PDFGenerator module
  window.PDFGenerator.downloadInvoicePDF(normalizeInvoiceForPdf(invoice), BRANCHES);
}

// Mount React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<InvoiceAppMock />);
}


