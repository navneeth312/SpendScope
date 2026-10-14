import React from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Calculator, 
  CheckCircle2 
} from 'lucide-react';
import { WishlistItem, PriorityLevel, PurchaseStatus, Language, Currency } from '../types';
import { translations } from '../utils/translations';
import { formatCurrency } from '../utils/currency';

interface PurchasePlannerViewProps {
  items: WishlistItem[];
  lang: Language;
  currency: Currency;
  onOpenNewItem: () => void;
  onEditItem: (item: WishlistItem) => void;
  onDeleteItem: (id: string) => void;
  onStatusChange: (id: string, newStatus: PurchaseStatus) => void;
}

export const PurchasePlannerView: React.FC<PurchasePlannerViewProps> = ({
  items,
  lang,
  currency,
  onOpenNewItem,
  onEditItem,
  onDeleteItem,
  onStatusChange
}) => {
  const t = translations[lang];

  const totalCost = items.reduce((sum, item) => sum + item.targetPrice, 0);
  const totalSaved = items.reduce((sum, item) => sum + item.savedAmount, 0);
  const totalRemaining = Math.max(0, totalCost - totalSaved);

  const priorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'high':
        return <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">{t.priorityHigh}</span>;
      case 'medium':
        return <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{t.priorityMedium}</span>;
      case 'low':
        return <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{t.priorityLow}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">{t.planner}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Plan and calculate future major purchases without going into debt</p>
        </div>

        <button
          onClick={onOpenNewItem}
          aria-label={t.newWishlistItem}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
          <span>{t.newWishlistItem}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Total Planned Purchases</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {formatCurrency(totalCost, currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across {items.length} wishlist items
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Accumulated Savings</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(totalSaved, currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {totalCost > 0 ? `${Math.round((totalSaved / totalCost) * 100)}% of total target accumulated` : '0%'}
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Remaining Funding Gap</span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {formatCurrency(totalRemaining, currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Split across upcoming academic months
          </div>
        </div>
      </div>

      {/* Planner Items Grid */}
      {items.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <ShoppingBag className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-80" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-200">{t.noWishlistItems}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{t.noWishlistDesc}</p>
          <button
            onClick={onOpenNewItem}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {t.newWishlistItem}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => {
            const pct = Math.min(100, Math.round((item.savedAmount / item.targetPrice) * 100));
            const remaining = Math.max(0, item.targetPrice - item.savedAmount);

            // Month calculation
            const today = new Date();
            const target = new Date(item.targetDate);
            const diffMonths = Math.max(1, (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()));
            const monthlyEstimate = remaining > 0 ? (remaining / diffMonths) : 0;

            const isDone = item.status === 'completed' || item.savedAmount >= item.targetPrice;

            return (
              <div 
                key={item.id}
                className={`p-5 bg-slate-900 border rounded-xl flex flex-col justify-between transition-all group ${
                  isDone ? 'border-emerald-500/40' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h2 className="font-semibold text-sm text-slate-100">{item.title}</h2>
                      <span className="text-[11px] text-slate-400">{item.category}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditItem(item)}
                        aria-label={`${t.edit} ${item.title}`}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
                        title={t.edit}
                      >
                        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        aria-label={`${t.delete} ${item.title}`}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {priorityBadge(item.priority)}
                    <span className="text-[10px] text-slate-400 capitalize">
                      {item.status === 'planning' ? t.statusPlanning : item.status === 'saving' ? t.statusSaving : t.statusCompleted}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-400 mb-3 italic">{item.notes}</p>
                  )}

                  {/* Target Price & Saved */}
                  <div className="my-3 flex items-baseline justify-between font-mono">
                    <div>
                      <span className="text-xs text-slate-400 block">{t.currentSaved}</span>
                      <span className="text-lg font-bold text-slate-100">
                        {formatCurrency(item.savedAmount, currency)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">{t.targetPrice}</span>
                      <span className="text-sm font-semibold text-slate-300">
                        {formatCurrency(item.targetPrice, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Accessible Progress Bar */}
                  <div 
                    className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.title} funding progress`}
                  >
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isDone ? 'bg-emerald-400' : 'bg-emerald-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Monthly Savings Calculator Banner */}
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 mb-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                      <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Monthly Plan</span>
                    </div>
                    {remaining > 0 ? (
                      <p className="text-[11px] text-slate-400">
                        Save <strong className="text-slate-100 font-mono">{formatCurrency(monthlyEstimate, currency)}/mo</strong> over {diffMonths} month{diffMonths > 1 ? 's' : ''} to buy by {item.targetDate}.
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Target fully saved! Ready to purchase.
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Switcher Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">{pct}% Funded</span>

                  {item.status !== 'completed' ? (
                    <button
                      onClick={() => onStatusChange(item.id, 'completed')}
                      aria-label={`Mark ${item.title} as purchased`}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Mark Purchased</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onStatusChange(item.id, 'saving')}
                      aria-label={`Reopen plan for ${item.title}`}
                      className="text-xs text-slate-400 hover:text-slate-200 underline focus-visible:rounded"
                    >
                      Reopen Plan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
