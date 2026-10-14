import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import { WishlistItem, PriorityLevel, PurchaseStatus, Language, Currency } from '../types';
import { translations } from '../utils/translations';
import { formatCurrency, convertFromBase, convertToBase } from '../utils/currency';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<WishlistItem, 'id'> & { id?: string }) => void;
  initialData?: WishlistItem | null;
  lang: Language;
  currency: Currency;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  lang,
  currency
}) => {
  const t = translations[lang];

  const [title, setTitle] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [savedAmount, setSavedAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [category, setCategory] = useState('Tech & Gadgets');
  const [status, setStatus] = useState<PurchaseStatus>('planning');
  const [notes, setNotes] = useState('');
  const [customMonthlySaving, setCustomMonthlySaving] = useState('500');
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
      setTitle(initialData.title);
      setTargetPrice(convertFromBase(initialData.targetPrice, currency).toFixed(2));
      setSavedAmount(convertFromBase(initialData.savedAmount, currency).toFixed(2));
      setTargetDate(initialData.targetDate);
      setPriority(initialData.priority);
      setCategory(initialData.category);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
      setError('');
    } else {
      setTitle('');
      setTargetPrice('');
      setSavedAmount('0');
      const d = new Date();
      d.setMonth(d.getMonth() + 2);
      setTargetDate(d.toISOString().split('T')[0]);
      setPriority('medium');
      setCategory('Tech & Gadgets');
      setStatus('planning');
      setNotes('');
      setError('');
    }
  }, [initialData, isOpen, currency]);

  if (!isOpen) return null;

  // Calculate savings estimate
  const numericPrice = parseFloat(targetPrice) || 0;
  const numericSaved = parseFloat(savedAmount) || 0;
  const remainingNeeded = Math.max(0, numericPrice - numericSaved);

  // Month diff between today and targetDate
  let monthsToTarget = 1;
  if (targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const diffMonths = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());
    monthsToTarget = Math.max(1, diffMonths);
  }
  const monthlySavingsNeeded = remainingNeeded > 0 ? (remainingNeeded / monthsToTarget).toFixed(2) : '0.00';

  const userCustomRate = parseFloat(customMonthlySaving) || 1;
  const monthsWithCustom = remainingNeeded > 0 ? Math.ceil(remainingNeeded / userCustomRate) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(lang === 'te' ? 'దయచేసి వస్తువు పేరు నమోదు చేయండి' : 'Please enter item name');
      return;
    }
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      setError(lang === 'te' ? 'సరైన లక్ష్య ధరను నమోదు చేయండి' : 'Please enter a valid price');
      return;
    }

    // Convert back to base INR
    const baseTargetPrice = convertToBase(price, currency);
    const baseSavedAmount = convertToBase(parseFloat(savedAmount) || 0, currency);

    onSave({
      ...(initialData ? { id: initialData.id } : {}),
      title: title.trim(),
      targetPrice: Math.round(baseTargetPrice * 100) / 100,
      savedAmount: Math.round(baseSavedAmount * 100) / 100,
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      priority,
      category,
      status,
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
      aria-labelledby="wish-modal-heading"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl p-6 transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 id="wish-modal-heading" className="text-base font-semibold text-slate-100">
            {initialData ? t.editWishlistItemTitle : t.newWishlistItem}
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
            <label htmlFor="wish-title-input" className="block text-xs font-medium text-slate-300 mb-1">
              {t.itemName} <span className="text-rose-400" aria-hidden="true">*</span>
            </label>
            <input
              id="wish-title-input"
              type="text"
              required
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Noise Cancelling Headphones, iPad for Notes, Study Bike"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 placeholder-slate-500 outline-hidden transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="wish-price-input" className="block text-xs font-medium text-slate-300 mb-1">
                {t.targetPrice} ({currency}) <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <input
                id="wish-price-input"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
                placeholder="24990.00"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors font-mono"
              />
            </div>

            <div>
              <label htmlFor="wish-saved-input" className="block text-xs font-medium text-slate-300 mb-1">
                {t.currentSaved} ({currency})
              </label>
              <input
                id="wish-saved-input"
                type="number"
                step="0.01"
                min="0"
                value={savedAmount}
                onChange={e => setSavedAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="wish-date-input" className="block text-xs font-medium text-slate-300 mb-1">
                {t.targetDate}
              </label>
              <input
                id="wish-date-input"
                type="date"
                required
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              />
            </div>

            <div>
              <label htmlFor="wish-priority-select" className="block text-xs font-medium text-slate-300 mb-1">
                {t.priority}
              </label>
              <select
                id="wish-priority-select"
                value={priority}
                onChange={e => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              >
                <option value="high">{t.highPriority}</option>
                <option value="medium">{t.mediumPriority}</option>
                <option value="low">{t.lowPriority}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="wish-status-select" className="block text-xs font-medium text-slate-300 mb-1">
                {t.status}
              </label>
              <select
                id="wish-status-select"
                value={status}
                onChange={e => setStatus(e.target.value as PurchaseStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              >
                <option value="planning">{t.statusPlanning}</option>
                <option value="saving">{t.statusSaving}</option>
                <option value="completed">{t.statusCompleted}</option>
              </select>
            </div>

            <div>
              <label htmlFor="wish-category-input" className="block text-xs font-medium text-slate-300 mb-1">
                {t.category}
              </label>
              <input
                id="wish-category-input"
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Study, Tech, Furniture"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Interactive Savings Plan Estimate Box */}
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
              <Calculator className="w-4 h-4" aria-hidden="true" />
              <span>{t.calcSavingsEstimate}</span>
            </div>

            {numericPrice > 0 ? (
              <div className="space-y-2 text-slate-300">
                <p>
                  {t.calcHelpText
                    .replace('{months}', monthsToTarget.toString())
                    .replace('{monthlyAmount}', `${currency}${monthlySavingsNeeded}`)}
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <label htmlFor="custom-saving-rate" className="text-slate-400">If I save:</label>
                  <div className="relative w-28">
                    <span className="absolute left-2 top-1 text-slate-400 font-mono">{currency}</span>
                    <input
                      id="custom-saving-rate"
                      type="number"
                      value={customMonthlySaving}
                      onChange={e => setCustomMonthlySaving(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 outline-hidden font-mono"
                    />
                  </div>
                  <span>/mo &rarr; ready in <strong className="text-emerald-300">{monthsWithCustom} months</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Enter a target price to view monthly savings timeline.</p>
            )}
          </div>

          <div>
            <label htmlFor="wish-notes-input" className="block text-xs font-medium text-slate-300 mb-1">
              {t.notes}
            </label>
            <input
              id="wish-notes-input"
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Check for student festival discounts"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
            />
          </div>

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
