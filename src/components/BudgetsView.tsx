import React from 'react';
import { 
  Settings, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar
} from 'lucide-react';
import { Budget, Transaction, Language, Currency } from '../types';
import { translations, getCategoryTranslation } from '../utils/translations';
import { formatCurrency } from '../utils/currency';

interface BudgetsViewProps {
  budgets: Budget[];
  transactions: Transaction[];
  lang: Language;
  currency: Currency;
  onOpenEditBudgets: () => void;
  onAddExpense: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  transactions,
  lang,
  currency,
  onOpenEditBudgets,
  onAddExpense
}) => {
  const t = translations[lang];

  // Current month filter
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - today.getDate());

  const currentMonthTransactions = transactions.filter(tx => tx.date.startsWith(currentMonthKey));
  const activeTx = currentMonthTransactions.length > 0 ? currentMonthTransactions : transactions;

  // Calculate spent per category
  const spentMap: Record<string, number> = {};
  activeTx
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      spentMap[tx.category] = (spentMap[tx.category] || 0) + tx.amount;
    });

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = Object.values(spentMap).reduce((sum, val) => sum + val, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallUtilization = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  // Category alert lists
  const overBudgetCategories = budgets.filter(b => (spentMap[b.category] || 0) > b.monthlyLimit && b.monthlyLimit > 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">{t.budgets}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.budgetDisclaimer}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEditBudgets}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>{t.editBudgets}</span>
          </button>
          <button
            onClick={onAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span>{t.addExpense}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">{t.totalBudgeted}</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {formatCurrency(totalBudgeted, currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across {budgets.length} student spending categories
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">{t.spentSoFar}</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {formatCurrency(totalSpent, currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {overallUtilization}% of total allocated limit
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">{t.remaining}</span>
          <div className={`mt-2 text-2xl font-bold font-mono ${totalRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalRemaining >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalRemaining), currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {daysRemaining} {t.daysRemaining}
          </div>
        </div>
      </div>

      {/* Warnings & Alerts */}
      {overBudgetCategories.length > 0 && (
        <div 
          role="alert"
          className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-xs text-rose-300"
        >
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-rose-200">{t.budgetOverText}</h2>
            <p className="mt-0.5">
              You have exceeded your monthly limit for: {overBudgetCategories.map(c => getCategoryTranslation(c.category, lang)).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map(b => {
          const spent = spentMap[b.category] || 0;
          const limit = b.monthlyLimit;
          const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
          const remaining = limit - spent;
          const isOver = pct > 100;
          const isWarning = pct >= 80 && pct <= 100;

          return (
            <div 
              key={b.category}
              className={`p-5 bg-slate-900 border rounded-xl transition-all ${
                isOver 
                  ? 'border-rose-500/40 shadow-xs shadow-rose-500/10' 
                  : isWarning 
                  ? 'border-amber-500/40' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-100">
                  {getCategoryTranslation(b.category, lang)}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isOver 
                    ? 'text-rose-400 bg-rose-500/10' 
                    : isWarning 
                    ? 'text-amber-400 bg-amber-500/10' 
                    : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  {isOver ? t.budgetOverText : isWarning ? t.budgetWarningText : t.budgetGood}
                </span>
              </div>

              {/* Amount Progress */}
              <div className="flex items-baseline justify-between font-mono text-xs my-2">
                <span className="text-slate-300 font-medium">
                  {formatCurrency(spent, currency)}
                </span>
                <span className="text-slate-400">
                  {t.monthlyLimit}: {formatCurrency(limit, currency)}
                </span>
              </div>

              {/* Progress Bar with Accessibility */}
              <div 
                className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3"
                role="progressbar"
                aria-valuenow={Math.min(100, pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${b.category} budget consumption`}
              >
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                <span>{pct}% {t.budgetUtilized}</span>
                <span className={remaining < 0 ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                  {remaining >= 0 ? `${formatCurrency(remaining, currency)} left` : `Exceeded by ${formatCurrency(Math.abs(remaining), currency)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
