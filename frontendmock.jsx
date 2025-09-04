// jsPDF will be loaded via script tag in HTML
const { useState, useEffect, useMemo } = React;

const BRANCHES = {
  central: {
    id: 'central',
    label: 'ITALIAN CORNER – meeting point',
    series: 'I-REST',
    revenueMapping: {
      documentType: '1.1',
      revenueCategory: 'RESTAURANT_SERVICES',
      defaultVat: 13,
      allowedVatRates: [13, 24],
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
    },
    issuer: {
      name: 'Villa Alexandros OE',
      vat: '088888888',
      address: 'Οδός Θάλασσας 1',
      city: 'Ρέθυμνο',
      zip: '74100',
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
    },
    issuer: {
      name: "3A's Family Luxury Villa OE",
      vat: '077777777',
      address: 'Οδός Ελιάς 2',
      city: 'Ρέθυμνο',
      zip: '74100',
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

function buildMyDataPayload(invoice, branchCfg) {
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
  };
  const lines = invoice.items.map((it, idx) => {
    const net = it.qty * it.price;
    const vatAmt = net * (it.vatRate / 100);
    return {
      lineNumber: idx + 1,
      description: it.description,
      qty: it.qty,
      unitPrice: it.price,
      netAmount: round2(net),
      vatCategory: `${it.vatRate}%`,
      vatAmount: round2(vatAmt),
      revenueClassification: branchCfg.revenueMapping.revenueCategory,
    };
  });
  const totals = calcTotals(invoice.items);
  const surcharge = Number(invoice.surcharge || 0);
  return {
    header,
    lines,
    totals: {
      net: round2(totals.net),
      vat: round2(totals.vat),
      gross: round2(totals.net + totals.vat + surcharge),
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

function InvoiceAppMock() {
  const [branch, setBranch] = useState('central');
  const branchCfg = useMemo(() => BRANCHES[branch], [branch]);
  const [customer, setCustomer] = useState({ name: '', vat: '', email: '', address: '', city: '' });
  const [items, setItems] = useState([{ description: '', qty: 1, price: 0, vatRate: 13 }]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().substring(0, 10));
  const [invoiceNumber, setInvoiceNumber] = useState('0001');
  const [surcharge, setSurcharge] = useState(0);
  const [status, setStatus] = useState({ type: 'idle', msg: '' });
  const [failedQueue, setFailedQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aade_failed_queue') || '[]'); } catch { return []; }
  });
  const [logoUrl, setLogoUrl] = useState('/assets/italiancornerDesktop App Icon.png');
  const [customers, setCustomers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKeyCustomers('central')) || '[]'); } catch { return []; }
  });
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKeyHistory()) || '[]'); } catch { return []; }
  });
  const [useBackend, setUseBackend] = useState(true);
  const [backendBase, setBackendBase] = useState('http://localhost:3000');
  const totals = useMemo(() => calcTotals(items), [items]);
  const isVilla = branch === 'villa1' || branch === 'villa2';
  useEffect(() => { if (!isVilla) setSurcharge(0); }, [branch, isVilla]);
  useEffect(() => { try { const data = JSON.parse(localStorage.getItem(storageKeyCustomers(branch)) || '[]'); setCustomers(Array.isArray(data)?data:[]); } catch { setCustomers([]); } }, [branch]);
  const persistFailedQueue = (q) => { setFailedQueue(q); localStorage.setItem('aade_failed_queue', JSON.stringify(q)); };
  const persistCustomers = (list) => { setCustomers(list); localStorage.setItem(storageKeyCustomers(branch), JSON.stringify(list)); };
  const persistHistory = (list) => { setHistory(list); localStorage.setItem(storageKeyHistory(), JSON.stringify(list)); };
  const saveDraft = () => { const draft = { branchId: branchCfg.id, invoiceDate, invoiceNumber, customer, items, surcharge }; localStorage.setItem('invoice_draft', JSON.stringify(draft)); setStatus({ type: 'info', msg: 'Αποθηκεύτηκε πρόχειρο.' }); };
  const loadDraft = () => { try { const d = JSON.parse(localStorage.getItem('invoice_draft') || 'null'); if (!d) { setStatus({ type: 'error', msg: 'Δεν βρέθηκε πρόχειρο.' }); return; } setBranch(d.branchId in BRANCHES ? d.branchId : 'central'); setCustomer(d.customer || { name: '', vat: '', email: '', address: '', city: '' }); setItems(d.items || [{ description: '', qty: 1, price: 0, vatRate: 13 }]); setInvoiceDate(d.invoiceDate || new Date().toISOString().substring(0,10)); setInvoiceNumber(d.invoiceNumber || '0001'); setSurcharge(d.surcharge || 0); setStatus({ type: 'success', msg: 'Φορτώθηκε πρόχειρο.' }); } catch { setStatus({ type: 'error', msg: 'Σφάλμα ανάγνωσης προχείρου.' }); } };
  const addItem = () => setItems((prev) => [...prev, { description: '', qty: 1, price: 0, vatRate: branchCfg.revenueMapping.defaultVat }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const addCustomer = () => { if (!customer.name || !customer.vat) { setStatus({ type: 'error', msg: 'Συμπλήρωσε Επωνυμία και ΑΦΜ για αποθήκευση πελάτη.' }); return; } const exists = customers.some(c => c.vat === customer.vat); const list = exists ? customers.map(c => c.vat === customer.vat ? { ...customer } : c) : [{ ...customer }, ...customers]; persistCustomers(list); setStatus({ type: 'success', msg: exists ? 'Ενημερώθηκε ο πελάτης.' : 'Προστέθηκε νέος πελάτης.' }); };
  const deleteCustomer = (vat) => { const list = customers.filter(c => c.vat !== vat); persistCustomers(list); if (customer.vat === vat) setCustomer({ name: '', vat: '', email: '', address: '', city: '' }); };
  const pickCustomer = (vat) => { const c = customers.find(x => x.vat === vat); if (c) setCustomer({ ...c }); };
  const addHistoryEntry = (entry) => { const list = [{ id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, ...entry }, ...history]; persistHistory(list); };
  const updateHistoryEntryByInvoice = (invoiceNumber, patch) => { const list = history.map(h => h.invoiceNumber === invoiceNumber ? { ...h, ...patch } : h); persistHistory(list); };
  const serverValidate = async (payload) => { const url = `${backendBase.replace(/\/$/,'')}/api/aade/validate`; const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) throw new Error('Validate failed'); return res.json(); };
  const serverSubmit = async (payload) => { const url = `${backendBase.replace(/\/$/,'')}/api/aade/submit`; const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }; return res.json(); };
  const serverRetry = async (payload) => { const url = `${backendBase.replace(/\/$/,'')}/api/aade/retry`; const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }; return res.json(); };
  const handleSubmit = async () => {
    setStatus({ type: 'info', msg: 'Υποβολή σε AADE…' });
    const invoice = { branchId: branchCfg.id, invoiceDate, invoiceNumber, customer, items, surcharge };
    const errors = validateInvoiceForAADE(invoice, branchCfg);
    if (errors.length) { setStatus({ type: 'error', msg: errors.join('\n') }); return; }
    const payload = buildMyDataPayload(invoice, branchCfg);
    
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
    }
  };

  const clearAll = () => {
    setBranch('central');
    setCustomer({ name: '', vat: '', email: '', address: '', city: '' });
    setItems([{ description: '', qty: 1, price: 0, vatRate: 13 }]);
    setInvoiceDate(new Date().toISOString().substring(0, 10));
    setInvoiceNumber('0001');
    setSurcharge(0);
    setStatus({ type: 'info', msg: 'Καθαρίστηκαν όλα τα πεδία.' });
  };

  const retryAll = async () => {
    setStatus({ type: 'info', msg: 'Επανάληψη όλων των αποτυχημένων υποβολών...' });
    for (let i = 0; i < failedQueue.length; i++) {
      await retryOne(i);
    }
  };

  const retryOne = async (index) => {
    const entry = failedQueue[index];
    if (!entry) return;
    
    try {
      const result = useBackend ? 
        await serverRetry(entry.payload) : 
        await submitToAADEMock(entry.payload);
      
      if (result.ok) {
        const q = failedQueue.filter((_, i) => i !== index);
        persistFailedQueue(q);
        setStatus({ type: 'success', msg: `Επιτυχής επανάληψη υποβολής #${index + 1}` });
      } else {
        setStatus({ type: 'error', msg: `Αποτυχία επανάληψης: ${result.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: `Σφάλμα επανάληψης: ${err.message}` });
    }
  };

  const branchIssuer = branchCfg.issuer;
  const totalsGross = isVilla ? round2(totals.net + totals.vat + surcharge) : round2(totals.net + totals.vat);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden bg-white shadow-xl p-0">
        <header className="flex items-center gap-6 py-4 px-6 bg-gradient-to-r from-black to-gray-800 rounded-3xl shadow-xl mb-4">
          <img
            src={logoUrl}
            alt="Logo"
            className="w-24 h-24 object-contain drop-shadow-lg rounded-xl bg-white/0"
            style={{background: 'transparent'}}
          />
          <div className="flex flex-col justify-center text-white">
            <div className="text-2xl font-bold leading-tight tracking-wide">{BRANCHES.central.label}</div>
            <div className="text-sm opacity-80">{branchIssuer.address}, {branchIssuer.city} • {branchIssuer.phone || '+30'} </div>
          </div>
        </header>
        <div className="p-8">
          <div className="px-6 py-6">
            <div>
              <h1 className="text-2xl font-bold">Έκδοση Τιμολογίου</h1>
              <p className="text-gray-500">AADE/myDATA Sandbox Mock</p>
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-semibold">Σειρά</label>
                <input value={branchCfg.series} readOnly className="border p-2 rounded bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Αρ. Τιμολογίου</label>
                <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Ημερομηνία</label>
                <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="border p-2 rounded" />
              </div>
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block mb-1 font-semibold">Υποκατάστημα</label>
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="border p-2 rounded w-full">
                {Object.values(BRANCHES).map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Τύπος Παραστατικού</label>
              <input value={branchCfg.revenueMapping.documentType} readOnly className="border p-2 rounded w-full bg-gray-100" />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Κατηγορία Εσόδου</label>
              <input value={branchCfg.revenueMapping.revenueCategory} readOnly className="border p-2 rounded w-full bg-gray-100" />
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Στοιχεία Πελάτη</h2>
            <div className="flex items-end gap-2 mb-2">
              <select className="border p-2 rounded w-64" value={customer.vat || ''} onChange={(e)=>pickCustomer(e.target.value)}>
                <option value="">— Επιλογή αποθηκευμένου πελάτη —</option>
                {customers.map(c => <option key={c.vat} value={c.vat}>{c.name} — {c.vat}</option>)}
              </select>
              <button onClick={addCustomer} className="bg-emerald-600 text-white px-3 py-2 rounded">Αποθήκευση Πελάτη</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <input type="text" placeholder="Επωνυμία" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="border p-2 rounded" />
              <input type="text" placeholder="ΑΦΜ" value={customer.vat} onChange={(e) => setCustomer({ ...customer, vat: e.target.value })} className="border p-2 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <input type="email" placeholder="Email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="border p-2 rounded" />
              <input type="text" placeholder="Διεύθυνση" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} className="border p-2 rounded" />
            </div>
            <input type="text" placeholder="Πόλη" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} className="border p-2 rounded w-full" />

            <details className="mt-3 bg-gray-50 rounded p-3">
              <summary className="cursor-pointer font-semibold">Πελατολόγιο ({customers.length})</summary>
              {customers.length === 0 ? (
                <div className="text-sm text-gray-500 mt-2">Κανένας αποθηκευμένος πελάτης.</div>
              ) : (
                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-1">Επωνυμία</th>
                      <th className="py-1">ΑΦΜ</th>
                      <th className="py-1">Email</th>
                      <th className="py-1">Διεύθυνση</th>
                      <th className="py-1">Πόλη</th>
                      <th className="py-1 text-right">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.vat} className="border-b">
                        <td className="py-1">{c.name}</td>
                        <td className="py-1">{c.vat}</td>
                        <td className="py-1">{c.email}</td>
                        <td className="py-1">{c.address}</td>
                        <td className="py-1">{c.city}</td>
                        <td className="py-1 text-right">
                          <button className="text-blue-600 mr-3" onClick={()=>setCustomer({...c})}>Επεξεργασία</button>
                          <button className="text-red-600" onClick={()=>deleteCustomer(c.vat)}>Διαγραφή</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </details>
          </section>

          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Είδη / Υπηρεσίες</h2>
              <div className="flex gap-2">
                <button onClick={addItem} className="bg-blue-600 text-white px-3 py-1 rounded">+ Γραμμή</button>
                <button onClick={saveDraft} className="bg-gray-700 text-white px-3 py-1 rounded">Αποθήκευση Πρόχειρου</button>
                <button onClick={loadDraft} className="bg-gray-500 text-white px-3 py-1 rounded">Φόρτωση Πρόχειρου</button>
              </div>
            </div>
            <div className="w-full overflow-auto border rounded-lg">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold bg-gray-50 border-b">
                <div className="col-span-4">Περιγραφή</div>
                <div className="col-span-1 text-right">Ποσ.</div>
                <div className="col-span-2 text-right">Τιμή</div>
                <div className="col-span-1 text-right">ΦΠΑ</div>
                <div className="col-span-1 text-right">Καθαρή</div>
                <div className="col-span-1 text-right">ΦΠΑ €</div>
                <div className="col-span-1 text-right">Σύνολο</div>
              </div>
              {items.map((item, idx) => {
                const net = round2(item.qty * item.price);
                const vat = round2(net * (item.vatRate/100));
                const gross = round2(net + vat);
                return (
                  <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-2 items-center border-b">
                    <input className="col-span-4 border rounded px-2 py-1" placeholder="Περιγραφή" value={item.description} onChange={(e)=>{const arr=[...items]; arr[idx].description=e.target.value; setItems(arr);}} />
                    <input type="number" className="col-span-1 border rounded px-2 py-1 text-right" value={item.qty} onChange={(e)=>{const arr=[...items]; arr[idx].qty=Number(e.target.value); setItems(arr);}} />
                    <input type="number" className="col-span-2 border rounded px-2 py-1 text-right" value={item.price} onChange={(e)=>{const arr=[...items]; arr[idx].price=Number(e.target.value); setItems(arr);}} />
                    <select className="col-span-1 border rounded px-2 py-1 text-right" value={item.vatRate} onChange={(e)=>{const arr=[...items]; arr[idx].vatRate=Number(e.target.value); setItems(arr);}}>
                      {branchCfg.revenueMapping.allowedVatRates.map(r=> <option key={r} value={r}>{r}%</option>)}
                    </select>
                    <div className="col-span-1 text-right tabular-nums">{net.toFixed(2)}</div>
                    <div className="col-span-1 text-right tabular-nums">{vat.toFixed(2)}</div>
                    <div className="col-span-1 text-right tabular-nums">{gross.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {branch === 'villa1' || branch === 'villa2' ? (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block mb-1 font-semibold">Τέλος Διαμονής</label>
                <input type="number" value={surcharge} onChange={(e) => setSurcharge(Number(e.target.value))} className="border p-2 rounded w-full" />
              </div>
              <div className="bg-gray-50 rounded p-4">
                <div className="flex justify-between text-sm mb-1"><span>Καθαρή Αξία:</span><span>{round2(totals.net)} €</span></div>
                <div className="flex justify-between text-sm mb-1"><span>Σύνολο ΦΠΑ:</span><span>{round2(totals.vat)} €</span></div>
                <div className="flex justify-between text-sm mb-1"><span>Τέλος Διαμονής:</span><span>{round2(surcharge)} €</span></div>
                <div className="flex justify-between font-bold text-lg"><span>Σύνολο Πληρωμής:</span><span>{round2(totals.net + totals.vat + surcharge)} €</span></div>
              </div>
            </section>
          ) : (
            <section className="bg-gray-50 rounded p-4 mb-6">
              <div className="flex justify-between text-sm mb-1"><span>Καθαρή Αξία:</span><span>{round2(totals.net)} €</span></div>
              <div className="flex justify-between text-sm mb-1"><span>Σύνολο ΦΠΑ:</span><span>{round2(totals.vat)} €</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Σύνολο Πληρωμής:</span><span>{round2(totals.net + totals.vat)} €</span></div>
            </section>
          )}

          {status.msg && (
            <div className={`mt-4 p-4 rounded-lg border-2 ${
              status.type === 'error' 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : status.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800 font-semibold' 
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="whitespace-pre-line text-center">
                {status.msg}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 transition text-white px-4 py-2 rounded w-full">Υποβολή σε myDATA (Sandbox)</button>
            <button onClick={clearAll} className="bg-gray-600 hover:bg-gray-700 transition text-white px-4 py-2 rounded w-full">Καθαρισμός</button>
          </div>

          <section className="mt-8">
            <h3 className="font-semibold mb-2">Αποτυχημένες Υποβολές</h3>
            {failedQueue.length === 0 ? (
              <div className="text-sm text-gray-500">Καμία αποτυχία.</div>
            ) : (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Σύνολο: {failedQueue.length}</span>
                  <button onClick={retryAll} className="bg-orange-600 text-white px-3 py-1 rounded">Επανάληψη Όλων</button>
                </div>
                <ul className="divide-y border rounded">
                  {failedQueue.map((e, i) => (
                    <li key={i} className="p-2 flex items-center justify-between">
                      <div className="text-sm">
                        <div>#{i + 1} — {new Date(e.ts).toLocaleString()}</div>
                        <div className="text-red-600">{e.error}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => retryOne(i)} className="bg-blue-600 text-white px-3 py-1 rounded">Επανάληψη</button>
                        <button onClick={() => {
                          const q = failedQueue.filter((_, idx) => idx !== i);
                          persistFailedQueue(q);
                        }} className="bg-gray-300 px-3 py-1 rounded">Διαγραφή</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="mt-8">
            <h3 className="font-semibold mb-2">Ιστορικό Τιμολογίων</h3>
            {history.length === 0 ? (
              <div className="text-sm text-gray-500">Δεν υπάρχουν τιμολόγια στο ιστορικό.</div>
            ) : (
              <div className="overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b bg-gray-50">
                      <th className="py-2 px-2">Ημερομηνία</th>
                      <th className="py-2 px-2">Υποκατάστημα</th>
                      <th className="py-2 px-2">Αρ. Τιμ.</th>
                      <th className="py-2 px-2">Πελάτης</th>
                      <th className="py-2 px-2">ΑΦΜ</th>
                      <th className="py-2 px-2 text-right">Καθαρή</th>
                      <th className="py-2 px-2 text-right">ΦΠΑ</th>
                      <th className="py-2 px-2 text-right">Σύνολο</th>
                      <th className="py-2 px-2">Κατάσταση</th>
                      <th className="py-2 px-2">MARK/Σφάλμα</th>
                      <th className="py-2 px-2">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.filter(h => !branch || h.branchId === branch).map((h, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-1 px-2 whitespace-nowrap">{h.issueDate}</td>
                        <td className="py-1 px-2">{BRANCHES[h.branchId]?.label || h.branchId}</td>
                        <td className="py-1 px-2">{h.invoiceNumber}</td>
                        <td className="py-1 px-2">{h.customer?.name}</td>
                        <td className="py-1 px-2">{h.customer?.vat}</td>
                        <td className="py-1 px-2 text-right">{Number(h.totals?.net || 0).toFixed(2)}</td>
                        <td className="py-1 px-2 text-right">{Number(h.totals?.vat || 0).toFixed(2)}</td>
                        <td className="py-1 px-2 text-right">{Number((h.totals?.gross ?? (h.totals?.net + h.totals?.vat)) || 0).toFixed(2)}</td>
                        <td className="py-1 px-2"><span className={`px-2 py-0.5 rounded text-xs ${h.status==='sent'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{h.status}</span></td>
                        <td className="py-1 px-2 text-xs break-all">{h.mark || h.error}</td>
                        <td className="py-1 px-2">
                          <button onClick={() => downloadInvoicePDF(h)} className="bg-gray-200 hover:bg-gray-300 text-xs px-2 py-1 rounded">Λήψη PDF</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <TestsPanel />
          
          <footer className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={useBackend} onChange={(e)=>setUseBackend(e.target.checked)} />
                Χρήση Backend API
              </label>
              <input 
                className="border rounded px-2 py-1 text-sm w-80" 
                placeholder="π.χ. http://localhost:3000" 
                value={backendBase} 
                onChange={(e)=>setBackendBase(e.target.value)} 
              />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function TestsPanel() {
  const [results, setResults] = useState([]);
  const runTests = async () => {
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
  };

  return (
    <section className="mt-8">
      <details className="bg-gray-100 rounded p-4">
        <summary className="cursor-pointer font-semibold">Tests (AADE Mock)</summary>
        <p className="text-sm text-gray-600 mb-2">Οι δοκιμές τρέχουν στο frontend για το mock.</p>
        <button onClick={runTests} className="bg-black text-white px-3 py-1 rounded mb-3">Run Tests</button>
        {results.length > 0 && (
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li key={i} className={`p-2 rounded ${r.pass ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}>
                <div className="font-semibold">{r.name} — {r.pass ? 'PASS' : 'FAIL'}</div>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(r.detail, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </details>
    </section>
  );
}

// Συνάρτηση για εξαγωγή PDF (χρησιμοποιεί το PDF Generator module)
function downloadInvoicePDF(invoice) {
  // Έλεγχος εάν το PDFGenerator module είναι διαθέσιμο
  if (typeof window.PDFGenerator === 'undefined') {
    alert('Το PDFGenerator module δεν είναι διαθέσιμο. Παρακαλώ φορτώστε τη σελίδα ξανά.');
    return;
  }

  // Κλήση της downloadInvoicePDF από το PDFGenerator module
  window.PDFGenerator.downloadInvoicePDF(invoice, BRANCHES);
}


