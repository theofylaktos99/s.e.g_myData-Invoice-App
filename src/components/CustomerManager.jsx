import React from 'react';

const CustomerManager = ({
  customer,
  customers,
  onCustomerChange,
  onAddCustomer,
  onDeleteCustomer,
  onPickCustomer
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
  <div className="bg-linear-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Στοιχεία Πελάτη</h3>
        <p className="text-slate-600">Επιλέξτε ή προσθέστε νέο πελάτη</p>
      </div>

      <div className="p-8">
        {/* Customer Selection */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Επιλογή Αποθηκευμένου Πελάτη</label>
            <select
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
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
          <div className="flex items-end">
            <button
              onClick={onAddCustomer}
              className="px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Αποθήκευση Πελάτη
            </button>
          </div>
        </div>

        {/* Customer Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Επωνυμία *</label>
            <input
              type="text"
              placeholder="Επωνυμία εταιρείας ή όνομα"
              value={customer.name}
              onChange={(e) => onCustomerChange({ ...customer, name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">ΑΦΜ *</label>
            <input
              type="text"
              placeholder="Αριθμός Φορολογικού Μητρώου"
              value={customer.vat}
              onChange={(e) => onCustomerChange({ ...customer, vat: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={customer.email}
              onChange={(e) => onCustomerChange({ ...customer, email: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Διεύθυνση</label>
            <input
              type="text"
              placeholder="Οδός και αριθμός"
              value={customer.address}
              onChange={(e) => onCustomerChange({ ...customer, address: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Πόλη</label>
          <input
            type="text"
            placeholder="Πόλη κατοικίας"
            value={customer.city}
            onChange={(e) => onCustomerChange({ ...customer, city: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Customer Database */}
        <details className="mt-6 group">
          <summary className="cursor-pointer flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
            <span className="font-semibold text-slate-700">
              Πελατολόγιο ({customers.length} πελάτες)
            </span>
            <svg className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          <div className="mt-4">
            {customers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">👥</div>
                <p>Δεν υπάρχουν αποθηκευμένοι πελάτες</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Επωνυμία</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ΑΦΜ</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Πόλη</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {customers.map(c => (
                      <tr key={c.vat} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-900 font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{c.vat}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{c.email || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{c.city || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                              onClick={() => onPickCustomer(c.vat)}
                            >
                              Επιλογή
                            </button>
                            <button
                              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                              onClick={() => onDeleteCustomer(c.vat)}
                            >
                              Διαγραφή
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
};

export default CustomerManager;