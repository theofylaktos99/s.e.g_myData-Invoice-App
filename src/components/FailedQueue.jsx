import React from 'react';

const FailedQueue = ({ failedInvoices, onRetryInvoice, onDeleteFailedInvoice }) => {
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
  <div className="bg-linear-to-r from-red-50 to-pink-50 px-8 py-6 border-b border-red-200">
        <h3 className="text-xl font-bold text-red-800 mb-2">Ουρά Αποτυχημένων Τιμολογίων</h3>
        <p className="text-red-600">Τιμολόγια που απέτυχαν να δημιουργηθούν και χρειάζονται προσοχή</p>
      </div>

      <div className="p-8">
        {failedInvoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h4 className="text-xl font-semibold text-slate-700 mb-2">Όλα τα τιμολόγια είναι επιτυχημένα</h4>
            <p className="text-slate-500">Δεν υπάρχουν αποτυχημένα τιμολόγια προς επεξεργασία</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-red-700 font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {failedInvoices.length} αποτυχημένα τιμολόγια χρειάζονται προσοχή
              </div>
            </div>

            <div className="space-y-4">
              {failedInvoices.map(invoice => (
                <div key={invoice.id} className="border border-red-200 rounded-xl p-6 bg-red-50/50">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{invoice.number}</h4>
                          <p className="text-sm text-slate-600">ID: {invoice.id}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">Πελάτης:</span>
                          <p className="text-slate-600">{invoice.customer.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Ημερομηνία:</span>
                          <p className="text-slate-600">{formatDate(invoice.date)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Σύνολο:</span>
                          <p className="text-slate-600 font-semibold">{formatCurrency(invoice.total)}</p>
                        </div>
                      </div>

                      {invoice.error && (
                        <div className="mt-3 p-3 bg-red-100 rounded-lg">
                          <p className="text-sm text-red-800">
                            <span className="font-medium">Σφάλμα:</span> {invoice.error}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        className="px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        onClick={() => onRetryInvoice(invoice)}
                      >
                        Επανάληψη
                      </button>
                      <button
                        className="px-6 py-3 bg-linear-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        onClick={() => onDeleteFailedInvoice(invoice.id)}
                      >
                        Διαγραφή
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bulk Actions */}
            {failedInvoices.length > 1 && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-3">Μαζικές Ενέργειες</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors font-medium"
                    onClick={() => failedInvoices.forEach(inv => onRetryInvoice(inv))}
                  >
                    Επανάληψη Όλων
                  </button>
                  <button
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium"
                    onClick={() => failedInvoices.forEach(inv => onDeleteFailedInvoice(inv.id))}
                  >
                    Διαγραφή Όλων
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FailedQueue;