import React from 'react';

const InvoiceForm = ({
  branch,
  branchCfg,
  branches,
  invoiceNumber,
  invoiceDate,
  onBranchChange,
  onInvoiceNumberChange,
  onInvoiceDateChange,
  onCreateInvoice
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
  <div className="bg-linear-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Έκδοση Τιμολογίου</h2>
        <p className="text-slate-600">Συμπληρώστε τα στοιχεία του παραστατικού</p>
      </div>

      <div className="p-8">
        {/* Series and Invoice Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Σειρά</label>
            <div className="relative">
              <input
                value={branchCfg.series}
                readOnly
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Αρ. Τιμολογίου</label>
            <input
              value={invoiceNumber}
              onChange={(e) => onInvoiceNumberChange(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Αυτόματη αρίθμηση"
            />
            <p className="text-xs text-slate-500">Αυτόματη αρίθμηση (μπορεί να τροποποιηθεί)</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Ημερομηνία</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => onInvoiceDateChange(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Branch and Document Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Υποκατάστημα</label>
            <select
              value={branch}
              onChange={(e) => onBranchChange(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
            >
              {Object.values(branches).map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Τύπος Παραστατικού</label>
            <div className="relative">
              <input
                value={branchCfg.revenueMapping.documentType}
                readOnly
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Κατηγορία Εσόδου</label>
            <div className="relative">
              <input
                value={branchCfg.revenueMapping.revenueCategory}
                readOnly
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Invoice Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onCreateInvoice}
            className="px-8 py-4 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Δημιουργία Τιμολογίου
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;