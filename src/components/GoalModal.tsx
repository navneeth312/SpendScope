import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SavingsGoal, Language, Currency } from '../types';
import { translations } from '../utils/translations';
import { convertFromBase, convertToBase } from '../utils/currency';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<SavingsGoal, 'id'> & { id?: string }) => void;
  initialData?: SavingsGoal | null;
  lang: Language;
  currency: Currency;
}

const COLOR_OPTIONS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  lang,
  currency
}) => {
  const t = translations[lang];

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Tech');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
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
      setTargetAmount(convertFromBase(initialData.targetAmount, currency).toFixed(0));
      setCurrentAmount(convertFromBase(initialData.currentAmount, currency).toFixed(0));
      setTargetDate(initialData.targetDate);
      setCategory(initialData.category || 'Tech');
      setNotes(initialData.notes || '');
      setColor(initialData.color || COLOR_OPTIONS[0]);
      setError('');
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      setTargetDate(d.toISOString().split('T')[0]);
      setCategory('Tech');
      setNotes('');
      setColor(COLOR_OPTIONS[0]);
      setError('');
    }
  }, [initialData, isOpen, currency]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(lang === 'te' ? 'లక్ష్య శీర్షికను నమోదు చేయండి' : 'Please provide a goal name');
      return;
    }
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount || '0');

    if (isNaN(target) || target <= 0) {
      setError(lang === 'te' ? 'సరైన లక్ష్య మొత్తాన్ని నమోదు చేయండి' : 'Please enter a valid target amount');
      return;
    }

    if (isNaN(current) || current < 0) {
      setError(lang === 'te' ? 'ప్రస్తుత మొత్తం 0 లేదా అంతకంటే ఎక్కువ ఉండాలి' : 'Current savings must be 0 or more');
      return;
    }

    // Convert back to base INR
    const baseTarget = convertToBase(target, currency);
    const baseCurrent = convertToBase(current, currency);

    onSave({
      ...(initialData ? { id: initialData.id } : {}),
      title: title.trim(),
      targetAmount: Math.round(baseTarget * 100) / 100,
      currentAmount: Math.round(baseCurrent * 100) / 100,
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      category,
      notes: notes.trim() || undefined,
      color,
      isDemo: false
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-modal-heading"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl p-6 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 id="goal-modal-heading" className="text-base font-semibold text-slate-100">
            {initialData ? t.editGoalTitle : t.newGoal}
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
            <label htmlFor="goal-form-title" className="block text-xs font-medium text-slate-300 mb-1">
              {t.title} <span className="text-rose-400" aria-hidden="true">*</span>
            </label>
            <input
              id="goal-form-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={lang === 'te' ? 'ఉదా: కొత్త ల్యాప్‌టాప్, ఎమర్జెన్సీ ఫండ్' : 'e.g. New MacBook Fund, Emergency Cushion'}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 placeholder-slate-500 outline-hidden transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-form-target" className="block text-xs font-medium text-slate-300 mb-1">
                {t.targetAmount} ({currency}) <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <input
                id="goal-form-target"
                type="number"
                step="1"
                min="1"
                required
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                placeholder="15000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors font-mono"
              />
            </div>

            <div>
              <label htmlFor="goal-form-current" className="block text-xs font-medium text-slate-300 mb-1">
                {t.currentSaved} ({currency})
              </label>
              <input
                id="goal-form-current"
                type="number"
                step="1"
                min="0"
                value={currentAmount}
                onChange={e => setCurrentAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-form-date" className="block text-xs font-medium text-slate-300 mb-1">
                {t.targetDate}
              </label>
              <input
                id="goal-form-date"
                type="date"
                required
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              />
            </div>

            <div>
              <label htmlFor="goal-form-category" className="block text-xs font-medium text-slate-300 mb-1">
                {t.category}
              </label>
              <input
                id="goal-form-category"
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Tech, Trip, Emergency"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-slate-100 outline-hidden transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                  className={`w-6 h-6 rounded-full transition-transform focus-visible:ring-2 focus-visible:ring-white ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="goal-form-notes" className="block text-xs font-medium text-slate-300 mb-1">
              {t.notes}
            </label>
            <input
              id="goal-form-notes"
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Why this goal matters to you"
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
