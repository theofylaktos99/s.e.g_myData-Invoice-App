import React from 'react';
import { DocumentStackIcon, CheckCircleIcon, CloudFailIcon, RevenueIcon } from './icons.jsx';

const DashboardSummary = ({ stats }) => {
  const formatNumber = (n) =>
    typeof n === 'number' ? n.toLocaleString('el-GR') : n;

  const formatCurrency = (n) =>
    `${(typeof n === 'number' ? n : Number(n || 0)).toLocaleString('el-GR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} €`;

  const cards = [
    {
      label: 'Σύνολο Τιμολογίων',
      value: formatNumber(stats.totalInvoices),
      sublabel: `Ενεργά υποκατάστημα: ${stats.currentBranchLabel}`,
      Icon: DocumentStackIcon,
      accent: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-500/15 text-emerald-300',
    },
    {
      label: 'Επιτυχείς Υποβολές',
      value: formatNumber(stats.sentInvoices),
      sublabel: `${stats.sentPercentage}% επιτυχία`,
      Icon: CheckCircleIcon,
      accent: 'from-sky-500/20 via-sky-500/10 to-transparent',
      iconBg: 'bg-sky-500/15 text-sky-300',
    },
    {
      label: 'Αποτυχημένες Υποβολές',
      value: formatNumber(stats.failedInvoices + stats.queueLength),
      sublabel: `${formatNumber(stats.failedInvoices)} στο ιστορικό · ${formatNumber(stats.queueLength)} σε αναμονή`,
      Icon: CloudFailIcon,
      accent: 'from-amber-500/20 via-amber-500/10 to-transparent',
      iconBg: 'bg-amber-500/15 text-amber-300',
    },
    {
      label: 'Έσοδα Μήνα',
      value: formatCurrency(stats.monthlyGross),
      sublabel: `Καθαρή: ${formatCurrency(stats.monthlyNet)} · ΦΠΑ: ${formatCurrency(stats.monthlyVat)}`,
      Icon: RevenueIcon,
      accent: 'from-purple-500/20 via-purple-500/10 to-transparent',
      iconBg: 'bg-purple-500/15 text-purple-300',
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/80 shadow-xl backdrop-blur"
        >
          <div className={`absolute inset-0 bg-linear-to-br ${card.accent}`} aria-hidden />
          <div className="relative p-5">
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                <card.Icon className="h-6 w-6" />
              </div>
              <div className="text-right">
                <h3 className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                  {card.label}
                </h3>
              </div>
            </div>
            <div className="mt-6 text-3xl font-semibold tracking-tight text-slate-100">
              {card.value}
            </div>
            <p className="mt-3 text-xs font-medium text-slate-400">
              {card.sublabel}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
};

export default DashboardSummary;
