import React from 'react';

const FailedSubmissions = ({ failedQueue, branches, onRetryAll, onRetryOne, onRequestDeleteOne = () => {}, loadingType = null }) => {
  return (
    <div className="bg-slate-900/80 rounded-2xl shadow-xl border border-slate-800/60 overflow-hidden backdrop-blur">
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Αποτυχημένες Υποβολές</h3>
            <p className="text-sm text-slate-400 mt-1">Τιμολόγια που απέτυχαν να σταλούν στο myDATA</p>
          </div>
          {failedQueue.length > 0 && (
            <button
              onClick={onRetryAll}
              disabled={loadingType === 'retryAll' || loadingType === 'retryOne'}
              className="px-4 py-2 bg-amber-500/90 hover:bg-amber-500 text-slate-950 rounded-lg font-medium transition-colors shadow-lg shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              🔄 Επανάληψη Όλων ({failedQueue.length})
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {failedQueue.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-6xl mb-4">✅</div>
            <h4 className="text-xl font-semibold text-slate-200 mb-2">Όλα είναι εντάξει!</h4>
            <p className="text-sm text-slate-400">Δεν υπάρχουν αποτυχημένες υποβολές</p>
          </div>
        ) : (
          <div className="space-y-4">
            {failedQueue.map((item, idx) => (
              <div 
                key={idx} 
                className="border border-amber-500/30 rounded-xl p-4 bg-slate-950/60 hover:bg-slate-950/80 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-semibold">
                        ⚠️ Αποτυχία #{idx + 1}
                      </span>
                      <span className="text-sm text-slate-400">
                        {new Date(item.ts || item.timestamp).toLocaleString('el-GR')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3 text-slate-300">
                      <div>
                        <span className="font-semibold text-slate-400">Υποκατάστημα:</span>
                        <span className="ml-2 text-slate-200">{branches?.[item.branchId]?.label || item.branchId}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Αρ. Τιμολογίου:</span>
                        <span className="ml-2 font-mono text-slate-200">{item.invoiceNumber}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">Πελάτης:</span>
                        <span className="ml-2 text-slate-200">{item.customer?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400">ΑΦΜ:</span>
                        <span className="ml-2 font-mono text-slate-200">{item.customer?.vat || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-lg">
                      <p className="text-xs font-semibold text-amber-300 mb-1">Μήνυμα Σφάλματος:</p>
                      <p className="text-sm text-amber-200 font-mono break-all">{item.error || 'Άγνωστο σφάλμα'}</p>
                    </div>

                    {item.totals && (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-slate-300">
                        <div className="text-right">
                          <span className="text-slate-400">Καθαρή:</span>
                          <span className="ml-2 font-semibold text-slate-100">{Number(item.totals.net || 0).toFixed(2)} €</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400">ΦΠΑ:</span>
                          <span className="ml-2 font-semibold text-slate-100">{Number(item.totals.vat || 0).toFixed(2)} €</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400">Σύνολο:</span>
                          <span className="ml-2 font-bold text-emerald-300">{Number(item.totals.gross || 0).toFixed(2)} €</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800/50">
                  <button
                    onClick={() => onRetryOne(idx)}
                    disabled={loadingType === 'retryAll' || loadingType === 'retryOne'}
                    className="flex-1 px-4 py-2 bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    🔄 Επανάληψη Υποβολής
                  </button>
                  <button
                    onClick={() => onRequestDeleteOne?.(idx, item)}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg font-medium transition-colors"
                  >
                    🗑️ Διαγραφή
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FailedSubmissions;
