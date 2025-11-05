import React from 'react';
import { DocumentStackIcon } from './icons.jsx';

const PDFPreviewModal = ({ open, pdfUrl, fileName, onClose, onDownload }) => {
  if (!open || !pdfUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4 py-6">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -top-32 -left-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/90 shadow-[0_25px_65px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-6 py-4 text-slate-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">
              <DocumentStackIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold">Προεπισκόπηση PDF</h3>
              <p className="text-xs text-slate-400">{fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25"
            >
              Λήψη
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/80"
            >
              Κλείσιμο
            </button>
          </div>
        </div>
        <div className="relative flex-1 bg-slate-900">
          <iframe
            title="Προεπισκόπηση τιμολογίου PDF"
            src={pdfUrl}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
