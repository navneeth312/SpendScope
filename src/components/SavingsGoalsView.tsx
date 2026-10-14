import React from 'react';
import { 
  PiggyBank, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Edit2, 
  Trash2, 
  ArrowUpRight 
} from 'lucide-react';
import { SavingsGoal, Language, Currency } from '../types';
import { translations } from '../utils/translations';
import { formatCurrency } from '../utils/currency';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  lang: Language;
  currency: Currency;
  onOpenNewGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onOpenDeposit: (goal: SavingsGoal) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  lang,
  currency,
  onOpenNewGoal,
  onEditGoal,
  onDeleteGoal,
  onOpenDeposit
}) => {
  const t = translations[lang];

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completedCount = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">{t.savings}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track student emergency cushions, capstone tech funds, and semester goals</p>
        </div>

        <button
          onClick={onOpenNewGoal}
          aria-label={t.newGoal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
          <span>{t.newGoal}</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Total Saved in Goals</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(totalSaved, currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across {goals.length} target goals
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Total Goal Commitments</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {formatCurrency(totalTarget, currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}% overall funded` : '0%'}
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Milestones Achieved</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {completedCount} <span className="text-sm font-normal text-slate-400">/ {goals.length}</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">
            {completedCount > 0 ? `${completedCount} goals fully reached!` : 'Keep saving consistently'}
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <PiggyBank className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-80" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-200">{t.noGoals}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{t.noGoalsDesc}</p>
          <button
            onClick={onOpenNewGoal}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {t.newGoal}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            // Remaining days calculation
            const today = new Date();
            const target = new Date(goal.targetDate);
            const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div 
                key={goal.id}
                className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: goal.color || '#10b981' }} 
                          aria-hidden="true"
                        />
                        <h2 className="font-semibold text-sm text-slate-100">{goal.title}</h2>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">{goal.category}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditGoal(goal)}
                        aria-label={`${t.edit} ${goal.title}`}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
                        title={t.edit}
                      >
                        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        aria-label={`${t.delete} ${goal.title}`}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-slate-400 mb-3 italic">{goal.notes}</p>
                  )}

                  {/* Amounts & Percentage */}
                  <div className="my-3 flex items-baseline justify-between font-mono">
                    <div>
                      <span className="text-xs text-slate-400 block">{t.currentSaved}</span>
                      <span className="text-lg font-bold text-slate-100">
                        {formatCurrency(goal.currentAmount, currency)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">{t.targetAmount}</span>
                      <span className="text-sm font-semibold text-slate-300">
                        {formatCurrency(goal.targetAmount, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Accessible Progress Bar */}
                  <div 
                    className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-2"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${goal.title} savings progress`}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${pct}%`, 
                        backgroundColor: goal.color || '#10b981' 
                      }}
                    />
                  </div>

                  {/* Target Date & Status */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" aria-hidden="true" />
                      <span>{goal.targetDate}</span>
                      {diffDays > 0 && <span>({diffDays} {t.daysLeft})</span>}
                    </div>
                    <span className="font-mono font-medium text-slate-200">{pct}%</span>
                  </div>
                </div>

                {/* Bottom Action: Deposit/Withdraw & Achievement Flag */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  {isCompleted ? (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      {t.completedGoal}
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-400">
                      {formatCurrency(remaining, currency)} {t.remaining}
                    </span>
                  )}

                  <button
                    onClick={() => onOpenDeposit(goal)}
                    aria-label={`${t.depositWithdraw} for ${goal.title}`}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <span>{t.depositWithdraw}</span>
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
