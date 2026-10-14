import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { SavingsGoal, Language, Currency } from '../types';
import { translations } from '../utils/translations';
import { formatCurrency, convertToBase } from '../utils/currency';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onUpdateFunds: (goalId: string, deltaAmountInBaseINR: number, recordAsTransaction: boolean) => void;
  lang: Language;
  currency: Currency;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  goal,
  onUpdateFunds,
  lang,
  currency
}) => {
  const t = translations[lang];
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [recordTransaction, setRecordTransaction] = useState(true);
  const [error, setError] = useState('');

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

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError(lang === 'te' ? 'సరైన మొత్తాన్ని నమోదు చేయండి' : 'Please enter a valid amount');
      return;
    }

    // Convert entered amount to base INR
    const baseDelta = convertToBase(val, currency);

    if (mode === 'withdraw' && baseDelta > goal.currentAmount) {
      setError(lang === 'te' ? 'ప్రస్తుత పొదుపు కంటే ఎక్కువ ఉపసంహరించలేరు' : 'Cannot withdraw more than current savings');
      return;
    }

    const delta = mode === 'deposit' ? baseDelta : -baseDelta;
    onUpdateFunds(goal.id, delta, recordTransaction);
    setAmount('');
    setError('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deposit-modal-heading"
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl p-6 transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 id="deposit-modal-heading" className="text-sm font-semibold text-slate-100">{t.depositWithdraw}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{goal.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div role="alert" className="mt-3 p-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div className="my-4 p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block">{t.currentSaved}</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{formatCurrency(goal.currentAmount, currency)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">{t.targetAmount}</span>
            <span className="text-sm font-mono font-bold text-slate-200">{formatCurrency(goal.targetAmount, currency)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div 
            role="group" 
            aria-label="Deposit or Withdraw mode"
            className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800"
          >
            <button
              type="button"
              onClick={() => { setMode('deposit'); setError(''); }}
              aria-pressed={mode === 'deposit'}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                mode === 'deposit'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              {t.deposit}
            </button>
            <button
              type="button"
              onClick={() => { setMode('withdraw'); setError(''); }}
              aria-pressed={mode === 'withdraw'}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all focus-visible:ring-2 focus-visible:ring-rose-400 ${
                mode === 'withdraw'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Minus className="w-3.5 h-3.5" aria-hidden="true" />
              {t.withdraw}
            </button>
          </div>

          <div>
            <label htmlFor="deposit-amount-input" className="block text-xs font-medium text-slate-300 mb-1">
              {t.amount} ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-sm font-mono">{currency}</span>
              <input
                id="deposit-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                required
                autoFocus
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="500.00"
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 placeholder-slate-500 outline-hidden font-mono"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={recordTransaction}
              onChange={e => setRecordTransaction(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-950"
            />
            <span>
              {mode === 'deposit' 
                ? (lang === 'te' ? 'లావాదేవీలలో ఖర్చుగా నమోదు చేయి' : 'Also record as expense transaction (Goal Transfer)') 
                : (lang === 'te' ? 'లావాదేవీలలో ఆదాయంగా నమోదు చేయి' : 'Also record as income transaction (Goal Withdrawal)')}
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors focus-visible:ring-2 ${
                mode === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-400' : 'bg-rose-600 hover:bg-rose-500 focus-visible:ring-rose-400'
              }`}
            >
              {mode === 'deposit' ? t.deposit : t.withdraw}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
