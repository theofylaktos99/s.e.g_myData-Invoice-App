import React from 'react';

const InvoiceHistory = ({ invoices, onViewInvoice, onDeleteInvoice }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
  <div className="bg-linear-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Ιστορικό Τιμολογίων</h3>
        <p className="text-slate-600">Προβολή και διαχείριση δημιουργημένων τιμολογίων</p>
      </div>

      <div className="p-8">
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h4 className="text-xl font-semibold text-slate-700 mb-2">Δεν υπάρχουν τιμολόγια</h4>
            <p className="text-slate-500">Τα δημιουργημένα τιμολόγια θα εμφανίζονται εδώ</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Αριθμός</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Πελάτης</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ημερομηνία</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Σύνολο</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Κατάσταση</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{invoice.number}</div>
                      <div className="text-sm text-slate-500">ID: {invoice.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{invoice.customer.name}</div>
                      <div className="text-sm text-slate-600">ΑΦΜ: {invoice.customer.vat}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-semibold text-slate-900">{formatCurrency(invoice.total)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        invoice.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status === 'completed' ? 'Ολοκληρωμένο' :
                         invoice.status === 'failed' ? 'Αποτυχημένο' : 'Σε εξέλιξη'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-4 py-2 text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors font-medium"
                          onClick={() => onViewInvoice(invoice)}
                        >
                          Προβολή
                        </button>
                        <button
                          className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium"
                          onClick={() => onDeleteInvoice(invoice.id)}
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

        {/* Summary Stats */}
        {invoices.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-linear-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700">{invoices.length}</div>
              <div className="text-sm text-emerald-600">Σύνολο Τιμολογίων</div>
            </div>
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {invoices.filter(i => i.status === 'completed').length}
              </div>
              <div className="text-sm text-blue-600">Ολοκληρωμένα</div>
            </div>
            <div className="bg-linear-to-r from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-200">
              <div className="text-2xl font-bold text-slate-700">
                {formatCurrency(invoices.reduce((sum, i) => sum + (i.status === 'completed' ? i.total : 0), 0))}
              </div>
              <div className="text-sm text-slate-600">Συνολική Αξία</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceHistory;