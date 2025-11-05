import React from 'react';
import { InvoiceIcon, HistoryIcon, WarningIcon, SettingsIcon } from './icons.jsx';

const Sidebar = ({ activeSection, onNavigate, isMobileOpen, onClose, useBackend }) => {
  const sections = [
    { id: 'invoice', label: 'Νέο Τιμολόγιο', Icon: InvoiceIcon },
    { id: 'history', label: 'Ιστορικό', Icon: HistoryIcon },
    { id: 'failed', label: 'Αποτυχημένα', Icon: WarningIcon },
    { id: 'settings', label: 'Ρυθμίσεις', Icon: SettingsIcon }
  ];

  const connectionIndicator = useBackend ? 'bg-emerald-400' : 'bg-amber-400';
  const connectionLabel = useBackend ? 'Backend API ενεργό' : 'Mock λειτουργία';
  const connectionPill = useBackend ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/20 text-amber-200';

  const handleNavigate = (sectionId) => {
    onNavigate(sectionId);
    if (onClose) onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out pointer-events-none lg:static lg:z-auto lg:w-72 lg:translate-x-0 lg:pointer-events-auto lg:flex ${
          isMobileOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full'
        }`}
        aria-label="Κύρια πλοήγηση"
      >
        <div className="relative flex h-full w-full flex-col bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 lg:hidden"
            aria-label="Κλείσιμο μενού"
          >
            ✕
          </button>

          <div className="p-6 border-b border-slate-800/70">
            <h2 className="text-2xl font-semibold text-emerald-400 tracking-tight">S.E.G. Stournaras Entertainment Group</h2>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-[0.2em]">myData Invoice App</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleNavigate(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-emerald-500/20 text-white shadow-lg ring-1 ring-emerald-500/40'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/60 text-emerald-300">
                  <section.Icon className="h-5 w-5" />
                </span>
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium tracking-tight">{section.label}</span>
                </div>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800/70 text-xs text-slate-500">
            <div className="mb-2 text-center">v1.0.0 • 2025</div>
            <div className={`flex items-center justify-center gap-2 rounded-full px-3 py-1 ${connectionPill}`}>
              <span className={`inline-flex h-2 w-2 rounded-full ${connectionIndicator} animate-pulse`} aria-hidden />
              <span>{connectionLabel}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
