import React from 'react';
import { SettingsIcon, WarningIcon } from './icons.jsx';

const BackendControls = ({ useBackend, setUseBackend, backendBase, setBackendBase }) => {
  return (
    <div className="bg-slate-900/80 rounded-2xl shadow-xl border border-slate-800/60 overflow-hidden backdrop-blur">
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800/60 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200">
          <SettingsIcon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Ρυθμίσεις Backend</h3>
          <p className="text-sm text-slate-400 mt-1">Διαμόρφωση σύνδεσης με AADE myDATA</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Backend Toggle */}
        <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800/60">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-slate-100 text-base mb-1">Τρόπος Λειτουργίας</h4>
              <p className="text-sm text-slate-400">
                {useBackend 
                  ? 'Χρήση πραγματικού Backend API για αποστολή στο myDATA'
                  : 'Χρήση Mock/Sandbox για δοκιμές (χωρίς πραγματική αποστολή)'}
              </p>
            </div>
            <button
              onClick={() => setUseBackend(!useBackend)}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                useBackend 
                  ? 'bg-emerald-500 focus:ring-emerald-500/60' 
                  : 'bg-slate-700 focus:ring-slate-500/60'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  useBackend ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${useBackend ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></div>
            <span className="font-semibold text-slate-200">
              {useBackend ? 'Backend API Ενεργό' : 'Mock Mode Ενεργό'}
            </span>
          </div>
        </div>

        {/* Backend URL Input */}
        <div className={`transition-all duration-300 ${useBackend ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <label className="block mb-2">
            <span className="text-sm font-semibold text-slate-200">Backend URL</span>
            <span className="text-xs text-slate-500 ml-2">(π.χ. http://localhost:3456)</span>
          </label>
          <input
            type="text"
            value={backendBase}
            onChange={(e) => setBackendBase(e.target.value)}
            placeholder="http://localhost:3456"
            disabled={!useBackend}
            className="w-full px-4 py-3 border-2 border-slate-700 bg-slate-900/70 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent disabled:bg-slate-900/30 font-mono text-sm placeholder:text-slate-600"
          />
          <p className="text-xs text-slate-500 mt-2">
            Βεβαιωθείτε ότι το backend server τρέχει στην παραπάνω διεύθυνση πριν ενεργοποιήσετε το Backend Mode
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/60">
          <h4 className="font-semibold text-slate-200 mb-3 text-sm">Κατάσταση Σύνδεσης</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Τρόπος:</span>
              <span className="font-semibold text-slate-100">
                {useBackend ? 'Backend API' : 'Mock/Sandbox'}
              </span>
            </div>
            {useBackend && (
              <div className="flex justify-between text-slate-400">
                <span>Endpoint:</span>
                <span className="font-mono text-xs text-slate-300 break-all">{backendBase}/api/sendInvoice</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>AADE Environment:</span>
              <span className="font-semibold text-emerald-300">Sandbox</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
              <WarningIcon className="h-5 w-5" />
            </span>
            <div className="text-sm text-slate-200">
              <p className="font-semibold mb-1 text-emerald-100">Πληροφορίες</p>
              <ul className="space-y-1 text-xs text-slate-300 leading-relaxed">
                <li><strong>Mock Mode:</strong> Οι υποβολές προσομοιώνονται τοπικά χωρίς πραγματική αποστολή</li>
                <li><strong>Backend Mode:</strong> Οι υποβολές στέλνονται μέσω του backend API στο AADE myDATA Sandbox</li>
                <li>Για παραγωγή (production), θα χρειαστεί ενημέρωση των credentials και του environment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendControls;
