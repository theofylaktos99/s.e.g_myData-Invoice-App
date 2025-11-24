import React from 'react';
import { SettingsIcon, WarningIcon } from './icons.jsx';

const envOptions = [
  { value: 'production', label: 'Παραγωγή (Live myDATA)' },
  { value: 'preproduction', label: 'Προπαραγωγή (myDATA Pilot)' },
];

const endpointMap = {
  production: 'https://mydatapi.aade.gr/myDATA/SendInvoices',
  preproduction: 'https://mydataapidev.aade.gr/SendInvoices',
};

const statusAccent = {
  success: 'text-emerald-300',
  pending: 'text-amber-300',
  error: 'text-rose-300',
  idle: 'text-slate-400',
  info: 'text-slate-400',
};

const BackendControls = ({
  useBackend,
  backendBase,
  setBackendBase,
  aadeEnv,
  setAadeEnv,
  aadeClientId,
  setAadeClientId,
  aadeClientSecret,
  setAadeClientSecret,
  aadeApiKey,
  setAadeApiKey,
  aadeSubscriptionKey,
  setAadeSubscriptionKey,
  aadeTaxisnetUsername,
  setAadeTaxisnetUsername,
  aadeTaxisnetPassword,
  setAadeTaxisnetPassword,
  aadeCertPath,
  setAadeCertPath,
  aadeCertPassword,
  setAadeCertPassword,
  gsisUsername,
  setGsisUsername,
  gsisPassword,
  setGsisPassword,
  connectionStatus,
  onTestConnection,
  isTestingConnection,
}) => {
  const isBackendEnabled = useBackend !== false;
  const currentEndpoint = endpointMap[aadeEnv] || endpointMap.production;
  const statusState = connectionStatus?.state || 'idle';
  const statusMessage = connectionStatus?.message || 'Δεν έχει εκτελεστεί έλεγχος σύνδεσης.';
  const statusColor = statusAccent[statusState] || statusAccent.info;

  const handleEnvChange = (value) => {
    setAadeEnv(value);
    try { localStorage.setItem('aade_env', value); } catch {}
  };

  const handlePersist = (setter, key) => (value) => {
    setter(value);
    try { localStorage.setItem(key, value); } catch {}
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800/70 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">
              <SettingsIcon className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-white">Κεντρικές Ρυθμίσεις myDATA</h2>
              <p className="text-sm text-slate-300">
                Εισαγάγετε ΜΟΝΟ τα απαραίτητα στοιχεία: aade-user-id και subscription key από myDATA Portal.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <p className="font-semibold">Κατάσταση</p>
            <p>Backend: {backendBase ? <span className="font-mono text-xs text-emerald-200 break-all">{backendBase}</span> : 'Δεν έχει οριστεί.'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">AADE Endpoint</p>
          <p className="mt-2 font-mono text-sm text-slate-100 break-all">{currentEndpoint}</p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Backend URL</p>
          <p className="mt-2 font-mono text-sm text-slate-100 break-all">{backendBase || '—'}</p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Περιβάλλον</p>
          <p className="mt-2 font-semibold text-emerald-300">
            {aadeEnv === 'production' ? 'Παραγωγή (LIVE)' : 'Προπαραγωγή (Testing)'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">Βασικές ρυθμίσεις</h3>
          <p className="text-sm text-slate-400 mb-4">Ορίστε τον backend server και το περιβάλλον.</p>

          <label className="block mb-2 text-sm font-semibold text-slate-200">Backend URL</label>
          <input
            type="text"
            value={backendBase}
            onChange={(e) => setBackendBase(e.target.value)}
            placeholder="http://127.0.0.1:3000"
            disabled={!isBackendEnabled}
            className="w-full rounded-xl border-2 border-slate-800 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500/60 focus:outline-none"
          />
          <p className="mt-2 text-xs text-slate-500">Default: http://127.0.0.1:3000 (after INSTALL-BACKEND-SERVICE.bat)</p>
          {backendBase && (backendBase.includes('mydatapi') || backendBase.includes('SendInvoices')) && (
            <div className="mt-3 rounded-xl border border-rose-500/50 bg-rose-500/15 px-4 py-3 text-xs text-rose-100">
              ⚠️ <strong>ΛΑΘΟΣ!</strong> Μην εισάγετε URL της ΑΑΔΕ εδώ. Εισάγετε ΜΟΝΟ το URL του local backend (π.χ. http://127.0.0.1:3000 ή http://localhost:3000). Το backend θα επικοινωνήσει με την ΑΑΔΕ.
            </div>
          )}

          <label className="mt-5 block text-sm font-semibold text-slate-200">Περιβάλλον myDATA</label>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {envOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleEnvChange(value)}
                className={`flex flex-col rounded-xl border px-4 py-3 text-left transition ${
                  aadeEnv === value
                    ? 'border-emerald-400/70 bg-emerald-500/10 text-emerald-50'
                    : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs text-slate-400">{value === 'production' ? 'LIVE myDATA' : 'Testing myDATA'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">Διαπιστευτήρια myDATA</h3>
          <p className="text-sm text-slate-400 mb-4">Ορίστε ΜΟΝΟ τα απαραίτητα από myDATA Portal.</p>

          <div className="space-y-4">
            {/* AADE User ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-200">AADE User ID <span className="text-rose-400">*</span></label>
              <p className="text-xs text-slate-500 mb-1">π.χ. myDataInvoiceApp (aade-user-id header)</p>
              <input
                type="text"
                value={aadeTaxisnetUsername}
                onChange={(e) => handlePersist(setAadeTaxisnetUsername, 'aade_taxisnet_username')(e.target.value)}
                placeholder="myDataInvoiceApp"
                className="w-full rounded-xl border-2 border-slate-800 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>

            {/* Subscription Key */}
            <div>
              <label className="block text-sm font-semibold text-slate-200">Subscription Key <span className="text-rose-400">*</span></label>
              <p className="text-xs text-slate-500 mb-1">Κλειδί πιστοποίησης από myDATA Portal</p>
              <input
                type="password"
                value={aadeSubscriptionKey}
                onChange={(e) => handlePersist(setAadeSubscriptionKey, 'aade_subscription_key')(e.target.value)}
                placeholder="32-char key"
                className="w-full rounded-xl border-2 border-slate-800 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">Διαπιστευτήρια GSIS (ΑΦΜ Αναζήτηση)</h3>
          <p className="text-sm text-slate-400 mb-4">Ορίστε τα credentials για αναζήτηση ΑΦΜ στη GSIS. Αυτά ενημερώνονται αυτόματα στο server.</p>

          <div className="space-y-4">
            {/* GSIS Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-200">Όνομα χρήστη GSIS</label>
              <p className="text-xs text-slate-500 mb-1">Το όνομα χρήστη από τη GSIS</p>
              <input
                type="text"
                value={gsisUsername || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setGsisUsername(val);
                  try { localStorage.setItem('gsis_username', val); } catch {}
                  try { window.gsisUsername = val; } catch {}
                }}
                placeholder="GSIS username"
                className="w-full rounded-xl border-2 border-slate-800 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>

            {/* GSIS Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-200">Κωδικός GSIS</label>
              <p className="text-xs text-slate-500 mb-1">Ο κωδικός πρόσβασης από τη GSIS</p>
              <input
                type="password"
                value={gsisPassword || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setGsisPassword(val);
                  try { localStorage.setItem('gsis_password', val); } catch {}
                  try { window.gsisPassword = val; } catch {}
                }}
                placeholder="GSIS password"
                className="w-full rounded-xl border-2 border-slate-800 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            💡 Τα credentials GSIS θα αποθηκευτούν στο localStorage και θα σταλούν στο backend για κάθε αναζήτηση ΑΦΜ.
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Έλεγχος συνδεσιμότητας</h3>
            <p className="text-sm text-slate-400">Δοκιμή σύνδεσης με backend και myDATA.</p>
          </div>
          <span className={`text-xs font-semibold ${statusColor}`}>
            {statusState === 'success' && 'Σύνδεση OK'}
            {statusState === 'pending' && 'Σε εξέλιξη'}
            {statusState === 'error' && 'Αποτυχία'}
            {statusState === 'idle' && 'Αναμονή'}
            {statusState === 'info' && statusMessage}
          </span>
        </div>

        <p className="mt-4 text-sm text-slate-300">{statusMessage}</p>

        <button
          type="button"
          onClick={onTestConnection}
          disabled={!backendBase || isTestingConnection}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isTestingConnection ? 'Εκτελείται…' : 'Έλεγχος σύνδεσης'}
        </button>
      </div>

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="flex gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-100">
            <WarningIcon className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-base font-semibold text-emerald-50">Σημαντικές υπενθυμίσεις</h4>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-100/80">
              <li><strong>ΜΟΝΟ 2 πεδία:</strong> aade-user-id και subscription key. Δεν χρειάζονται password ή tokens.</li>
              <li>Εκτελέστε INSTALL-BACKEND-SERVICE.bat στο υπολογιστή του πελάτη πριν χρησιμοποιήσετε την εφαρμογή.</li>
              <li>Επιλέξτε "Παραγωγή" για live invoices ή "Προπαραγωγή" για δοκιμές.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BackendControls;
