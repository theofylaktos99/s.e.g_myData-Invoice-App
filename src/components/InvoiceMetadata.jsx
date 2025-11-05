import React from 'react';

const InvoiceMetadata = ({ 
  branch, 
  branchCfg, 
  branches, 
  invoiceNumber, 
  invoiceDate, 
  paymentMethod,
  onBranchChange, 
  onInvoiceNumberChange, 
  onInvoiceDateChange,
  onPaymentMethodChange,
}) => {
  return (
    <div className="bg-slate-900/80 rounded-2xl shadow-xl border border-slate-800/60 overflow-hidden backdrop-blur">
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800/60">
        <h3 className="text-lg font-semibold text-slate-100">Στοιχεία Παραστατικού</h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Υποκατάστημα</label>
            <select
              value={branch}
              onChange={(e) => onBranchChange(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            >
              {Object.values(branches).map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Σειρά</label>
            <input
              value={branchCfg.series}
              readOnly
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Αρ. Τιμολογίου</label>
            <input
              value={invoiceNumber}
              readOnly
              title="Ο αριθμός τιμολογίου ορίζεται αυτόματα"
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Ημερομηνία</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => onInvoiceDateChange(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Τύπος Παραστατικού</label>
            <input
              value={branchCfg.revenueMapping.documentType}
              readOnly
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Κατηγορία Εσόδου</label>
            <input
              value={branchCfg.revenueMapping.revenueCategory}
              readOnly
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Τρόπος Πληρωμής</label>
            <select
              value={paymentMethod}
              onChange={(e)=> onPaymentMethodChange(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            >
              <option value="cash">Μετρητά</option>
              <option value="card">Κάρτα</option>
              <option value="bank">Κατάθεση</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceMetadata;
