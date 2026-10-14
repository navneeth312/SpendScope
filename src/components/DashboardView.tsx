import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  CalendarClock, 
  AlertTriangle, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar,
  Filter
} from 'lucide-react';
import { Transaction, Budget, SavingsGoal, Subscription, Language, Currency, ActiveTab } from '../types';
import { translations, getCategoryTranslation } from '../utils/translations';
import { formatCurrency } from '../utils/currency';

interface DashboardViewProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];
  lang: Language;
  currency: Currency;
  onNavigate: (tab: ActiveTab) => void;
  onAddTransaction: (type?: 'income' | 'expense') => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#10b981',
  'Rent & Housing': '#3b82f6',
  'Academics & Books': '#8b5cf6',
  'Groceries': '#06b6d4',
  'Entertainment': '#f59e0b',
  'Tech & Software': '#ec4899',
  'Travel & Transit': '#14b8a6',
  'Health & Personal': '#f97316',
  'Allowance & Family': '#64748b',
  'Part-Time Job': '#10b981',
  'Scholarship & Grants': '#a855f7',
  'Other': '#94a3b8'
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  budgets,
  goals,
  subscriptions,
  lang,
  currency,
  onNavigate,
  onAddTransaction
}) => {
  const t = translations[lang];
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [period, setPeriod] = useState<'month' | 'all'>('month');

  // Time calculations
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);

  // Filter transactions based on period selector
  const activeTx = period === 'month'
    ? transactions.filter(tx => tx.date.startsWith(currentMonthKey))
    : transactions;

  const totalIncome = activeTx
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = activeTx
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const remainingBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

  // Safe daily spend for the rest of this month
  const safeDailySpendValue = remainingBalance > 0 ? remainingBalance / daysRemaining : 0;

  // Total allocated budget
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const budgetUtilization = totalBudgetLimit > 0 ? Math.round((totalExpenses / totalBudgetLimit) * 100) : 0;

  // Category breakdown for expenses
  const expenseByCategory: Record<string, number> = {};
  activeTx
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    });

  const categoryEntries = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);
  const totalCategoryExpenses = categoryEntries.reduce((s, [, val]) => s + val, 0);

  // Check for budget violations
  const overBudgetCategories = budgets.filter(b => {
    const spent = expenseByCategory[b.category] || 0;
    return spent > b.monthlyLimit && b.monthlyLimit > 0;
  });

  // Upcoming subscription renewals (active subscriptions within next 14 days)
  const upcomingSubs = subscriptions
    .filter(s => s.active)
    .map(s => {
      const renewal = new Date(s.nextRenewalDate);
      const diffTime = renewal.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...s, diffDays };
    })
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 3);

  // Transparent Financial health score (0 - 100)
  let healthScore = 50;
  let healthState: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
  if (totalIncome > 0) {
    const expenseRatio = totalExpenses / totalIncome;
    if (expenseRatio <= 0.65) {
      healthScore = Math.min(100, Math.round(100 - (expenseRatio * 25)));
      healthState = 'excellent';
    } else if (expenseRatio <= 0.85) {
      healthScore = 78;
      healthState = 'good';
    } else if (expenseRatio <= 1.0) {
      healthScore = 58;
      healthState = 'warning';
    } else {
      healthScore = Math.max(10, Math.round(50 - ((expenseRatio - 1) * 40)));
      healthState = 'critical';
    }
  }

  // Calculate SVG Donut Paths
  let accumulatedAngle = 0;
  const donutSlices = categoryEntries.map(([cat, amount]) => {
    const percentage = totalCategoryExpenses > 0 ? amount / totalCategoryExpenses : 0;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return {
      category: cat,
      amount,
      percentage: Math.round(percentage * 100),
      startAngle,
      angle,
      color: CATEGORY_COLORS[cat] || '#10b981'
    };
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Period Filter & Month indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">{t.dashboard}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Overview of monthly cashflow, savings pace, and active budgets</p>
        </div>

        {/* Segmented Period Switcher */}
        <div 
          role="group" 
          aria-label="Filter timeline"
          className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start sm:self-auto"
        >
          <button
            onClick={() => setPeriod('month')}
            aria-pressed={period === 'month'}
            className={`px-3 py-1 font-medium rounded-md transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              period === 'month'
                ? 'bg-slate-800 text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            This Month (Oct 2026)
          </button>
          <button
            onClick={() => setPeriod('all')}
            aria-pressed={period === 'all'}
            className={`px-3 py-1 font-medium rounded-md transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              period === 'all'
                ? 'bg-slate-800 text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All-Time Records ({transactions.length})
          </button>
        </div>
      </div>

      {/* Budget Exceeded Alert Banner */}
      {overBudgetCategories.length > 0 && (
        <div 
          role="alert" 
          className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-300"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
            <span>
              <strong>{t.overBudgetAlert}:</strong> {overBudgetCategories.map(c => getCategoryTranslation(c.category, lang)).join(', ')} exceeded allocated limits.
            </span>
          </div>
          <button
            onClick={() => onNavigate('budgets')}
            className="text-xs font-semibold text-rose-200 hover:text-white underline shrink-0 focus-visible:rounded"
          >
            Review Budgets &rarr;
          </button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{t.totalIncome}</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-bold tracking-tight text-slate-100">
              {formatCurrency(totalIncome, currency)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">{t.savingsRate}: {savingsRate}%</span>
            <span aria-hidden="true">·</span>
            <span>{period === 'month' ? 'October 2026' : 'Cumulative'}</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{t.totalExpenses}</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-bold tracking-tight text-slate-100">
              {formatCurrency(totalExpenses, currency)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className={budgetUtilization > 100 ? 'text-rose-400 font-semibold' : 'text-slate-300 font-medium'}>
              {budgetUtilization}% of budget
            </span>
            <span aria-hidden="true">·</span>
            <span>{categoryEntries.length} categories</span>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{t.netBalance}</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1 font-mono">
            <span className={`text-2xl font-bold tracking-tight ${remainingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {remainingBalance < 0 ? '-' : '+'}{formatCurrency(Math.abs(remainingBalance), currency)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">{formatCurrency(safeDailySpendValue, currency)}/day</span>
            <span aria-hidden="true">·</span>
            <span>{daysRemaining} {t.daysRemaining}</span>
          </div>
        </div>

        {/* Student Health Meter */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{t.financialHealth}</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{healthScore}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 line-clamp-1">
            {healthState === 'excellent' && t.healthExcellent}
            {healthState === 'good' && t.healthGood}
            {healthState === 'warning' && t.healthWarning}
            {healthState === 'critical' && t.healthCritical}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending by Category (Interactive Donut & Accessible Summary) */}
        <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">{t.spendingByCategory}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Distribution across student living & academic expenses</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-300">
              Total: {formatCurrency(totalCategoryExpenses, currency)}
            </span>
          </div>

          {categoryEntries.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
              <p>{t.noTransactionsFound}</p>
              <button
                onClick={() => onAddTransaction('expense')}
                className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
              >
                {t.addExpense}
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Donut Chart Visual SVG with Accessibility Attributes */}
                <div className="flex flex-col items-center justify-center relative">
                  <svg 
                    role="img"
                    aria-label="Expenses distribution donut chart"
                    viewBox="0 0 100 100" 
                    className="w-44 h-44 -rotate-90"
                  >
                    {donutSlices.map((slice) => {
                      const radius = 38;
                      const circumference = 2 * Math.PI * radius;
                      const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((slice.startAngle / 360) * circumference);

                      return (
                        <circle
                          key={slice.category}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth="14"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300 cursor-pointer hover:stroke-width-18"
                          onMouseEnter={() => setHoveredSlice(slice.category)}
                          onMouseLeave={() => setHoveredSlice(null)}
                        />
                      );
                    })}
                  </svg>
                  {/* Center text in donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-medium">
                      {hoveredSlice ? getCategoryTranslation(hoveredSlice, lang) : 'Expenses'}
                    </span>
                    <span className="text-sm font-bold font-mono text-slate-100">
                      {hoveredSlice 
                        ? formatCurrency(expenseByCategory[hoveredSlice] || 0, currency, 0)
                        : formatCurrency(totalCategoryExpenses, currency, 0)}
                    </span>
                  </div>
                </div>

                {/* Accessible Screen Reader Table for Donut Chart Data */}
                <table className="sr-only">
                  <caption>Spending by Category Data Summary</caption>
                  <thead>
                    <tr>
                      <th scope="col">Category</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryEntries.map(([cat, amount]) => (
                      <tr key={cat}>
                        <td>{cat}</td>
                        <td>{formatCurrency(amount, currency)}</td>
                        <td>{totalCategoryExpenses > 0 ? Math.round((amount / totalCategoryExpenses) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Category Legend & Progress Bars */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
                  {categoryEntries.slice(0, 6).map(([cat, amount]) => {
                    const pct = totalCategoryExpenses > 0 ? Math.round((amount / totalCategoryExpenses) * 100) : 0;
                    const color = CATEGORY_COLORS[cat] || '#10b981';
                    const isHovered = hoveredSlice === cat;

                    return (
                      <div 
                        key={cat}
                        onMouseEnter={() => setHoveredSlice(cat)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isHovered ? 'bg-slate-800' : 'hover:bg-slate-800/40'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
                            <span className="text-slate-200 font-medium truncate">{getCategoryTranslation(cat, lang)}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                            <span className="text-slate-400">{pct}%</span>
                            <span className="text-slate-200 font-semibold">{formatCurrency(amount, currency)}</span>
                          </div>
                        </div>
                        <div 
                          className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden"
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${cat} spending percentage`}
                        >
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Want to adjust category ceilings?</span>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 focus-visible:rounded"
            >
              <span>{t.editBudgets}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Right Col: Monthly Budget & Upcoming Subscriptions */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Monthly Budget Health Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-100">{t.monthlyBudgetProgress}</h2>
              <span className="text-xs font-mono font-medium text-slate-400">
                {formatCurrency(totalExpenses, currency, 0)} / {formatCurrency(totalBudgetLimit, currency, 0)}
              </span>
            </div>

            <div 
              className="w-full bg-slate-800 rounded-full h-3 overflow-hidden relative mb-2"
              role="progressbar"
              aria-valuenow={Math.min(100, budgetUtilization)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Monthly budget utilization progress"
            >
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUtilization > 100 
                    ? 'bg-rose-500' 
                    : budgetUtilization > 80 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetUtilization)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{budgetUtilization}% {t.budgetUtilized}</span>
              <span className={remainingBalance < 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                {remainingBalance >= 0 ? `${formatCurrency(remainingBalance, currency, 0)} ${t.remaining}` : 'Deficit'}
              </span>
            </div>
          </div>

          {/* Upcoming Subscriptions Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-slate-100">{t.upcomingRenewals}</h2>
                </div>
                <button
                  onClick={() => onNavigate('subscriptions')}
                  className="text-xs text-slate-400 hover:text-slate-200 focus-visible:rounded"
                >
                  View All
                </button>
              </div>

              {upcomingSubs.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">{t.noUpcomingRenewals}</p>
              ) : (
                <div className="space-y-2.5">
                  {upcomingSubs.map(sub => (
                    <div 
                      key={sub.id}
                      className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium text-slate-200 block truncate max-w-[130px]">{sub.name}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" aria-hidden="true" />
                          <span>{sub.nextRenewalDate}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-slate-200 block">
                          {formatCurrency(sub.amount, currency)}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {sub.diffDays <= 0 ? t.today : `${t.renewsIn} ${sub.diffDays} ${t.days}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{subscriptions.filter(s => s.active).length} active recurring</span>
              <button
                onClick={() => onNavigate('subscriptions')}
                className="text-emerald-400 hover:text-emerald-300 font-medium focus-visible:rounded"
              >
                Manage &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Savings Goals Snapshot */}
      {goals.length > 0 && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-slate-100">{t.goalProgressSummary}</h2>
            </div>
            <button
              onClick={() => onNavigate('savings')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 focus-visible:rounded"
            >
              <span>View All Goals</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.slice(0, 3).map(goal => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const isAchieved = goal.currentAmount >= goal.targetAmount;

              return (
                <div key={goal.id} className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-slate-200 truncate">{goal.title}</span>
                    {isAchieved && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        {t.achieved}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between font-mono text-[11px] text-slate-400 mb-2">
                    <span>{formatCurrency(goal.currentAmount, currency, 0)} saved</span>
                    <span>Target: {formatCurrency(goal.targetAmount, currency, 0)}</span>
                  </div>
                  <div 
                    className="w-full bg-slate-800 rounded-full h-2 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${goal.title} progress`}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${pct}%`, 
                        backgroundColor: goal.color || '#10b981' 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions List & Quick Action Bar */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">{t.recentTransactions}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest logs across campus and personal finances</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddTransaction('income')}
              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.addIncome}</span>
            </button>
            <button
              onClick={() => onAddTransaction('expense')}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.addExpense}</span>
            </button>
            <button
              onClick={() => onNavigate('transactions')}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {t.viewAllTransactions}
            </button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            <p>{t.noTransactionsFound}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {transactions.slice(0, 5).map(tx => {
              const isIncome = tx.type === 'income';

              return (
                <div 
                  key={tx.id}
                  className="py-3 flex items-center justify-between text-xs hover:bg-slate-800/20 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                      {isIncome ? (
                        <TrendingUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-400" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-100 block truncate max-w-[200px] sm:max-w-xs">{tx.title}</span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{getCategoryTranslation(tx.category, lang)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.paymentMethod}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-mono font-semibold text-sm ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </span>
                    {tx.isDemo && (
                      <span className="block text-[10px] text-amber-400/80 font-medium">Demo</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
