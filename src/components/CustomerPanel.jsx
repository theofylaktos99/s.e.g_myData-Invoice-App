import React from 'react';

const CustomerPanel = ({ customer, customers, onCustomerChange, onAddCustomer, onRequestDeleteCustomer = () => {}, onPickCustomer }) => {
  return (
    <div className="bg-slate-900/80 rounded-2xl shadow-xl border border-slate-800/60 overflow-hidden backdrop-blur">
      <div className="bg-linear-to-r from-slate-950 to-slate-900 px-6 py-4 border-b border-slate-800/60">
        <h3 className="text-lg font-semibold text-slate-100">Στοιχεία Πελάτη</h3>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-300 mb-1">Επιλογή Πελάτη</label>
            <select
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
              value={customer.vat || ''}
              onChange={(e) => onPickCustomer(e.target.value)}
            >
              <option value="">— Επιλογή αποθηκευμένου πελάτη —</option>
              {customers.map(c => (
                <option key={c.vat} value={c.vat}>
                  {c.name} — {c.vat}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onAddCustomer}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500/90 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            Αποθήκευση
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Επωνυμία *</label>
            <input
              type="text"
              placeholder="Επωνυμία πελάτη"
              value={customer.name}
              onChange={(e) => onCustomerChange({ ...customer, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">ΑΦΜ *</label>
            <input
              type="text"
              placeholder="Αριθμός Φορολογικού Μητρώου"
              value={customer.vat}
              onChange={(e) => onCustomerChange({ ...customer, vat: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={customer.email}
              onChange={(e) => onCustomerChange({ ...customer, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Διεύθυνση</label>
            <input
              type="text"
              placeholder="Οδός και αριθμός"
              value={customer.address}
              onChange={(e) => onCustomerChange({ ...customer, address: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-300 mb-1">Πόλη</label>
            <input
              type="text"
              placeholder="Πόλη κατοικίας"
              value={customer.city}
              onChange={(e) => onCustomerChange({ ...customer, city: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
            />
          </div>
        </div>

        <details className="mt-4 bg-slate-950/60 rounded-xl p-4 border border-slate-800/70">
          <summary className="cursor-pointer font-semibold text-slate-200 flex items-center justify-between">
            <span>Πελατολόγιο ({customers.length} πελάτες)</span>
            <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          
          {customers.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <div className="text-3xl mb-2">👥</div>
              <p className="text-sm">Δεν υπάρχουν αποθηκευμένοι πελάτες</p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-slate-800/60">
                    <th className="text-left py-2 px-2 font-semibold text-slate-300">Επωνυμία</th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-300">ΑΦΜ</th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-300">Email</th>
                    <th className="text-right py-2 px-2 font-semibold text-slate-300">Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.vat} className="border-b border-slate-800/40 hover:bg-slate-900/80 transition-colors">
                      <td className="py-2 px-2">{c.name}</td>
                      <td className="py-2 px-2 font-mono text-sm">{c.vat}</td>
                      <td className="py-2 px-2">{c.email || '-'}</td>
                      <td className="py-2 px-2 text-right">
                        <button
                          className="text-emerald-400 hover:text-emerald-300 mr-3 text-xs"
                          onClick={() => onPickCustomer(c.vat)}
                        >
                          Επιλογή
                        </button>
                        <button
                          className="text-rose-400 hover:text-rose-300 text-xs"
                          onClick={() => onRequestDeleteCustomer(c)}
                        >
                          Διαγραφή
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </details>
      </div>
    </div>
  );
};

export default CustomerPanel;
