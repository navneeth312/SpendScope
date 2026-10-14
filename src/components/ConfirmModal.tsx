import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  lang: Language;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  isDestructive = true,
  onConfirm,
  onClose,
  lang
}) => {
  const t = translations[lang];

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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl p-6 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDestructive ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 id="confirm-modal-title" className="text-base font-semibold text-slate-100">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <p id="confirm-modal-desc" className="text-sm text-slate-300 mb-6 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {cancelText || t.cancel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors focus-visible:ring-2 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 focus-visible:ring-rose-400'
                : 'bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-400'
            }`}
          >
            {confirmText || t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
