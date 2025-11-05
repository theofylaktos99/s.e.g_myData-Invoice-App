import React from 'react';

const InvoiceMetaForm = ({
  branch,
  branches,
  branchCfg,
  invoiceNumber,
  invoiceDate,
  onBranchChange,
  onInvoiceNumberChange,
  onInvoiceDateChange,
}) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label className="block mb-1 font-semibold">Υποκατάστημα</label>
        <select value={branch} onChange={(e) => onBranchChange(e.target.value)} className="border p-2 rounded w-full">
          {Object.values(branches).map((b) => (
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

      <div>
        <label className="block text-sm font-semibold">Σειρά</label>
        <input value={branchCfg.series} readOnly className="border p-2 rounded w-full bg-gray-100" />
      </div>
      <div>
        <label className="block text-sm font-semibold">Αρ. Τιμολογίου</label>
        <input value={invoiceNumber} onChange={(e) => onInvoiceNumberChange(e.target.value)} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label className="block text-sm font-semibold">Ημερομηνία</label>
        <input type="date" value={invoiceDate} onChange={(e) => onInvoiceDateChange(e.target.value)} className="border p-2 rounded w-full" />
      </div>
    </section>
  );
};

export default InvoiceMetaForm;
