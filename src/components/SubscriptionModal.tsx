import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Subscription, BillingCycle, Language, Currency } from '../types';
import { translations } from '../utils/translations';
import { convertFromBase, convertToBase } from '../utils/currency';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: Omit<Subscription, 'id'> & { id?: string }) => void;
  initialData?: Subscription | null;
  lang: Language;
  currency: Currency;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  lang,
  currency
}) => {
  const t = translations[lang];

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nextRenewalDate, setNextRenewalDate] = useState('');
  const [category, setCategory] = useState('Tech & Software');
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');
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

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(convertFromBase(initialData.amount, currency).toFixed(2));
      setBillingCycle(initialData.billingCycle);
      setNextRenewalDate(initialData.nextRenewalDate);
      setCategory(initialData.category);
      setActive(initialData.active);
      setNotes(initialData.notes || '');
      setError('');
    } else {
      setName('');
      setAmount('');
      setBillingCycle('monthly');
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setNextRenewalDate(d.toISOString().split('T')[0]);
      setCategory('Tech & Software');
      setActive(true);
      setNotes('');
      setError('');
    }
  }, [initialData, isOpen, currency]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(lang === 'te' ? 'సబ్‌స్క్రిప్షన్ పేరు నమోదు చేయండి' : 'Please enter subscription name');
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) {
      setError(lang === 'te' ? 'సరైన మొత్తాన్ని నమోదు చేయండి' : 'Please enter a valid amount');
      return;
    }

    // Convert back to base INR
    const baseAmount = convertToBase(val, currency);

    onSave({
      ...(initialData ? { id: initialData.id } : {}),
      name: name.trim(),
      amount: Math.round(baseAmount * 100) / 100,
      billingCycle,
      nextRenewalDate: nextRenewalDate || new Date().toISOString().split('T')[0],
      category,
      active,
      notes: notes.trim() || undefined,
      isDemo: false
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sub-modal-heading"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl p-6 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 id="sub-modal-heading" className="text-base font-semibold text-slate-100">
            {initialData ? t.editSubscriptionTitle : t.newSubscription}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div role="alert" className="mt-4 p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="sub-name-input" className="block text-xs font-medium text-slate-300 mb-1">
              {t.title} / Service <span className="text-rose-400" aria-hidden="true">*</span>
            </label>
            <input
              id="sub-name-input"
              type="text"
              required
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Spotify Student, Prime Student, Chegg"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 placeholder-slate-500 outline-hidden transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sub-amount-input" className="block text-xs font-medium text-slate-300 mb-1">
                {t.amount} ({currency}) <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <input
                id="sub-amount-input"
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="59.00"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors font-mono"
              />
            </div>

            <div>
              <label htmlFor="sub-cycle-select" className="block text-xs font-medium text-slate-300 mb-1">
                {t.billingCycle}
              </label>
              <select
                id="sub-cycle-select"
                value={billingCycle}
                onChange={e => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              >
                <option value="monthly">{t.monthly}</option>
                <option value="yearly">{t.yearly}</option>
                <option value="quarterly">{t.quarterly}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sub-renewal-date" className="block text-xs font-medium text-slate-300 mb-1">
                {t.nextRenewal} <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <input
                id="sub-renewal-date"
                type="date"
                required
                value={nextRenewalDate}
                onChange={e => setNextRenewalDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              />
            </div>

            <div>
              <label htmlFor="sub-category-input" className="block text-xs font-medium text-slate-300 mb-1">
                {t.category}
              </label>
              <input
                id="sub-category-input"
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Entertainment, Software, Gym"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sub-notes-input" className="block text-xs font-medium text-slate-300 mb-1">
              {t.notes}
            </label>
            <input
              id="sub-notes-input"
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Student discount promo valid until June"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-950"
            />
            <span>{t.active} ({lang === 'te' ? 'పునరుద్ధరణ హెచ్చరికలను చూపించు' : 'Active and tracking renewal alerts'})</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              {initialData ? t.save : t.add}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
