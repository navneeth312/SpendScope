import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Budget, Category, Language, Currency } from '../types';
import { translations, getCategoryTranslation } from '../utils/translations';
import { convertFromBase, convertToBase, formatCurrency } from '../utils/currency';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: Budget[];
  onSaveBudgets: (newBudgets: Budget[]) => void;
  lang: Language;
  currency: Currency;
}

const ALL_CATEGORIES: Category[] = [
  'Rent & Housing',
  'Food & Dining',
  'Groceries',
  'Academics & Books',
  'Travel & Transit',
  'Entertainment',
  'Tech & Software',
  'Health & Personal',
  'Other'
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgets,
  onSaveBudgets,
  lang,
  currency
}) => {
  const t = translations[lang];
  const [limits, setLimits] = useState<Record<string, string>>({});

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const map: Record<string, string> = {};
    ALL_CATEGORIES.forEach(cat => {
      const found = budgets.find(b => b.category === cat);
      const baseVal = found ? found.monthlyLimit : 1000;
      map[cat] = convertFromBase(baseVal, currency).toFixed(0);
    });
    setLimits(map);
  }, [budgets, isOpen, currency]);

  if (!isOpen) return null;

  const handleLimitChange = (cat: string, val: string) => {
    setLimits(prev => ({ ...prev, [cat]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Budget[] = ALL_CATEGORIES.map(cat => {
      const parsed = Math.max(0, parseFloat(limits[cat]) || 0);
      const baseLimit = convertToBase(parsed, currency);
      return {
        category: cat,
        monthlyLimit: Math.round(baseLimit * 100) / 100
      };
    });
    onSaveBudgets(updated);
    onClose();
  };

  const totalMonthlyLimit = ALL_CATEGORIES.reduce((sum, cat) => {
    return sum + (parseFloat(limits[cat]) || 0);
  }, 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-modal-heading"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl p-6 transition-all max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 id="budget-modal-heading" className="text-base font-semibold text-slate-100">{t.editBudgetsTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.budgetDisclaimer}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col overflow-hidden pt-4">
          <div className="overflow-y-auto space-y-3 pr-1 max-h-[55vh]">
            {ALL_CATEGORIES.map(cat => (
              <div 
                key={cat}
                className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 gap-3"
              >
                <label htmlFor={`budget-${cat}`} className="text-xs font-medium text-slate-200 cursor-pointer">
                  {getCategoryTranslation(cat, lang)}
                </label>
                <div className="relative w-36 shrink-0">
                  <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-mono">{currency}</span>
                  <input
                    id={`budget-${cat}`}
                    type="number"
                    min="0"
                    step="100"
                    value={limits[cat] ?? '0'}
                    onChange={e => handleLimitChange(cat, e.target.value)}
                    className="w-full pl-7 pr-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 font-mono text-right outline-hidden focus:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 shrink-0">
            <div className="text-xs text-slate-400">
              {t.totalBudgeted}: <span className="font-mono font-bold text-emerald-400">{currency}{totalMonthlyLimit.toFixed(0)}</span>/mo
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {t.save}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
