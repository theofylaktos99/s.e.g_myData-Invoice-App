import React from 'react';
import { CheckCircleIcon, CloudFailIcon, WarningIcon, HistoryIcon } from './icons.jsx';

const StatusMessage = ({ status }) => {
  if (!status.msg) return null;

  const getStatusConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/40',
          text: 'text-emerald-100',
          accent: 'from-emerald-400 to-emerald-500',
          iconColor: 'text-emerald-200',
          Icon: CheckCircleIcon,
        };
      case 'error':
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/40',
          text: 'text-rose-100',
          accent: 'from-rose-400 to-pink-500',
          iconColor: 'text-rose-200',
          Icon: CloudFailIcon,
        };
      case 'info':
        return {
          bg: 'bg-sky-500/10',
          border: 'border-sky-500/40',
          text: 'text-slate-100',
          accent: 'from-sky-400 to-indigo-500',
          iconColor: 'text-sky-200',
          Icon: HistoryIcon,
        };
      default:
        return {
          bg: 'bg-slate-800/80',
          border: 'border-slate-700/60',
          text: 'text-slate-100',
          accent: 'from-slate-500 to-slate-400',
          iconColor: 'text-slate-300',
          Icon: WarningIcon,
        };
    }
  };

  const config = getStatusConfig(status.type);

  return (
    <div className={`mt-6 p-6 rounded-2xl border-[1.5px] shadow-xl backdrop-blur ${config.bg} ${config.border} ${config.text}`}>
      <div className="flex items-start gap-4">
        <span className={`shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/60 ${config.iconColor}`}>
          <config.Icon className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <div className="whitespace-pre-line text-center font-medium leading-relaxed">
            {status.msg}
          </div>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className={`mt-4 h-1 rounded-full bg-linear-to-r ${config.accent}`}></div>
    </div>
  );
};

export default StatusMessage;