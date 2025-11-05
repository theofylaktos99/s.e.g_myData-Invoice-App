import React from 'react';

const intents = {
  default: {
    button: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    badge: 'text-emerald-200',
  },
  danger: {
    button: 'bg-rose-500 hover:bg-rose-400 text-slate-950',
    badge: 'text-rose-200',
  },
};

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Επιβεβαίωση',
  cancelLabel = 'Άκυρο',
  intent = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const palette = intents[intent] || intents.default;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/90 shadow-[0_25px_65px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-24 -right-16 h-48 w-48 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-slate-700/30 blur-3xl" />
        </div>

        <div className="relative p-6 space-y-4 text-slate-200">
          <header>
            <p className={`text-xs uppercase tracking-[0.35em] mb-2 ${palette.badge}`}>Επιβεβαίωση</p>
            <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
          </header>

          <p className="text-sm leading-relaxed text-slate-400 whitespace-pre-line">{message}</p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-700/60 bg-slate-900/60 text-sm font-medium text-slate-300 transition hover:bg-slate-900/80"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${palette.button}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
