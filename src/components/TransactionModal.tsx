import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction, TransactionType, Category, PaymentMethod, Language, Currency } from '../types';
import { translations, getCategoryTranslation } from '../utils/translations';
import { convertFromBase, convertToBase } from '../utils/currency';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  initialData?: Transaction | null;
  defaultType?: TransactionType;
  lang: Language;
  currency: Currency;
}

const CATEGORIES: Category[] = [
  'Food & Dining',
  'Rent & Housing',
  'Academics & Books',
  'Entertainment',
  'Tech & Software',
  'Travel & Transit',
  'Groceries',
  'Health & Personal',
  'Allowance & Family',
  'Part-Time Job',
  'Scholarship & Grants',
  'Other'
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI / Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Campus Card'
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultType = 'expense',
  lang,
  currency
}) => {
  const t = translations[lang];

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [category, setCategory] = useState<Category>('Food & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI / Cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Handle Escape key to close modal
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
      // Convert stored base INR amount to selected currency for input field
      const displayAmount = convertFromBase(initialData.amount, currency);
      setAmount(displayAmount.toFixed(2));
      setType(initialData.type);
      setCategory(initialData.category);
      setDate(initialData.date);
      setPaymentMethod(initialData.paymentMethod);
      setNotes(initialData.notes || '');
      setError('');
    } else {
      setTitle('');
      setAmount('');
      setType(defaultType);
      setCategory(defaultType === 'income' ? 'Part-Time Job' : 'Food & Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI / Cash');
      setNotes('');
      setError('');
    }
  }, [initialData, defaultType, isOpen, currency]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(lang === 'te' ? 'దయచేసి శీర్షికను నమోదు చేయండి' : 'Please provide a title');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(lang === 'te' ? 'సరైన మొత్తాన్ని నమోదు చేయండి' : 'Please enter a valid amount greater than 0');
      return;
    }

    // Convert back to base INR for storage
    const baseAmount = convertToBase(parsedAmount, currency);

    onSave({
      ...(initialData ? { id: initialData.id } : {}),
      title: title.trim(),
      amount: Math.round(baseAmount * 100) / 100,
      type,
      category,
      date,
      paymentMethod,
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
      aria-labelledby="tx-modal-heading"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl p-6 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 id="tx-modal-heading" className="text-base font-semibold text-slate-100">
            {initialData ? t.editTransactionTitle : t.addTransactionTitle}
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
          {/* Type Segmented Control */}
          <div 
            role="group" 
            aria-label="Transaction Type"
            className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800"
          >
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (category === 'Part-Time Job' || category === 'Allowance & Family' || category === 'Scholarship & Grants') {
                  setCategory('Food & Dining');
                }
              }}
              aria-pressed={type === 'expense'}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all focus-visible:ring-2 focus-visible:ring-rose-400 ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
              {t.expense}
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                if (category === 'Food & Dining' || category === 'Rent & Housing' || category === 'Academics & Books') {
                  setCategory('Part-Time Job');
                }
              }}
              aria-pressed={type === 'income'}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              {t.income}
            </button>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="tx-form-title" className="block text-xs font-medium text-slate-300 mb-1">
              {t.title} <span className="text-rose-400" aria-hidden="true">*</span>
            </label>
            <input
              id="tx-form-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t.enterTitle}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 placeholder-slate-500 outline-hidden transition-colors"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="tx-form-amount" className="block text-xs font-medium text-slate-300 mb-1">
                {t.amount} ({currency}) <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm font-mono">{currency}</span>
                <input
                  id="tx-form-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 placeholder-slate-500 outline-hidden transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tx-form-date" className="block text-xs font-medium text-slate-300 mb-1">
                {t.date} <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <input
                id="tx-form-date"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="tx-form-category" className="block text-xs font-medium text-slate-300 mb-1">
                {t.category}
              </label>
              <select
                id="tx-form-category"
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {getCategoryTranslation(cat, lang)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tx-form-payment" className="block text-xs font-medium text-slate-300 mb-1">
                {t.paymentMethod}
              </label>
              <select
                id="tx-form-payment"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              >
                {PAYMENT_METHODS.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="tx-form-notes" className="block text-xs font-medium text-slate-300 mb-1">
              {t.notes}
            </label>
            <input
              id="tx-form-notes"
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={lang === 'te' ? 'అదనపు వివరాలు లేదా గమనిక' : 'Optional notes (e.g. Split with Alex)'}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 placeholder-slate-500 outline-hidden transition-colors"
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
