import React, { useEffect } from 'react';
import { X, Sparkles, GraduationCap, BookOpen, Utensils, RefreshCw, Check } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface StudentTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const StudentTipsModal: React.FC<StudentTipsModalProps> = ({
  isOpen,
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

  const tips = [
    {
      icon: <GraduationCap className="w-5 h-5 text-emerald-400" aria-hidden="true" />,
      title: lang === 'te' ? 'విద్యార్థి రాయితీలు (Student Discounts)' : '50%+ Student Discounts Everywhere',
      desc: t.tip1
    },
    {
      icon: <BookOpen className="w-5 h-5 text-blue-400" aria-hidden="true" />,
      title: lang === 'te' ? 'పుస్తకాల అద్దె & డిజిటల్ కాపీలు' : 'Smart Textbook Reselling & Rentals',
      desc: t.tip2
    },
    {
      icon: <Utensils className="w-5 h-5 text-amber-400" aria-hidden="true" />,
      title: lang === 'te' ? 'వంట & క్యాంటీన్ బడ్జెట్' : 'Meal Prep vs. Daily Dining Hall',
      desc: t.tip3
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-purple-400" aria-hidden="true" />,
      title: lang === 'te' ? 'సెమిస్టర్ సబ్‌స్క్రిప్షన్ ఆడిట్' : 'Semester Subscription Audit',
      desc: t.tip4
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tips-modal-title"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl p-6 transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <h2 id="tips-modal-title" className="text-base font-semibold text-slate-100">{t.studentTipsTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {tips.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-950 rounded-lg border border-slate-800/80 flex gap-3 items-start">
              <div className="p-2 rounded-md bg-slate-900 shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-200">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
