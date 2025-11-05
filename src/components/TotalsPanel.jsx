import React from 'react';

const TotalsPanel = ({ isVilla, totals, surcharge, onSurchargeChange, round2, separateSurcharge = false, onToggleSeparateSurcharge }) => {
  const fmt = (n) => (round2 ? round2(n) : Number(n || 0)).toFixed(2);
  const totalsGross = isVilla 
    ? fmt(totals.net + totals.vat + surcharge) 
    : fmt(totals.net + totals.vat);

  return (
    <div className="bg-slate-900/80 rounded-2xl shadow-xl border border-slate-800/60 overflow-hidden backdrop-blur">
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800/60">
        <h3 className="text-lg font-semibold text-slate-100">Σύνολα</h3>
      </div>

      <div className="p-6">
        {isVilla && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Τέλος Διαμονής (€)</label>
            <input
              type="number"
              step="0.01"
              value={surcharge}
              onChange={(e) => onSurchargeChange(Number(e.target.value))}
              disabled
              title="Υπολογίζεται αυτόματα για τις βίλες"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all disabled:opacity-70"
            />
            <p className="text-xs text-slate-500 mt-1">Υπολογίζεται αυτόματα βάσει κανόνα υποκαταστήματος.</p>
            <div className="mt-3 flex items-center gap-2">
              <input id="separateSurcharge" type="checkbox" checked={separateSurcharge} onChange={(e)=> onToggleSeparateSurcharge && onToggleSeparateSurcharge(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500" />
              <label htmlFor="separateSurcharge" className="text-sm text-slate-300">Έκδοση TAAK ξεχωριστά από το τιμολόγιο</label>
            </div>
          </div>
        )}

        <div className="space-y-3 text-slate-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-300">Καθαρή Αξία:</span>
            <span className="text-lg font-semibold text-slate-100">{fmt(totals.net)} €</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-300">Σύνολο ΦΠΑ:</span>
            <span className="text-lg font-semibold text-slate-100">{fmt(totals.vat)} €</span>
          </div>

          {isVilla && surcharge > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-300">Τέλος Διαμονής:</span>
              <span className="text-lg font-semibold text-slate-100">{fmt(surcharge)} €</span>
            </div>
          )}

          <div className="border-t border-slate-800/60 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-slate-100">Σύνολο Πληρωμής:</span>
              <span className="text-3xl font-semibold text-emerald-300 drop-shadow">{totalsGross} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalsPanel;
