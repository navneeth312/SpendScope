import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  ReceiptText, 
  PieChart, 
  PiggyBank, 
  CalendarClock, 
  ShoppingBag, 
  Plus, 
  Sun, 
  Moon, 
  Languages, 
  Lightbulb, 
  RotateCcw,
  Trash2,
  ChevronDown,
  Info
} from 'lucide-react';
import { ActiveTab, Language, Currency } from '../types';
import { translations } from '../utils/translations';
import { EXCHANGE_RATE_DESCRIPTIONS } from '../utils/currency';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onOpenNewTransaction: () => void;
  onOpenTips: () => void;
  onResetDemo: () => void;
  onClearData: () => void;
  isDemoData: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  currency,
  setCurrency,
  theme,
  setTheme,
  onOpenNewTransaction,
  onOpenTips,
  onResetDemo,
  onClearData,
  isDemoData
}) => {
  const t = translations[lang];
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showCurrencyNotice, setShowCurrencyNotice] = useState(false);
  const demoMenuRef = useRef<HTMLDivElement>(null);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'transactions', label: t.transactions, icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'budgets', label: t.budgets, icon: <PieChart className="w-4 h-4" /> },
    { id: 'savings', label: t.savings, icon: <PiggyBank className="w-4 h-4" /> },
    { id: 'subscriptions', label: t.subscriptions, icon: <CalendarClock className="w-4 h-4" /> },
    { id: 'planner', label: t.planner, icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  // Close demo menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (demoMenuRef.current && !demoMenuRef.current.contains(e.target as Node)) {
        setShowDemoMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDemoMenu(false);
      }
    };
    if (showDemoMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDemoMenu]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Demo Tag */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus-visible:rounded-lg"
              aria-label="SpendScope Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-slate-950 stroke-[2.2]" aria-hidden="true" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
                  {t.appName}
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Student
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:block">
                  {t.appTagline}
                </span>
              </div>
            </button>

            {/* Demo Data Dropdown */}
            {isDemoData && (
              <div className="relative ml-2 hidden md:block" ref={demoMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  aria-haspopup="true"
                  aria-expanded={showDemoMenu}
                  aria-label="Demo Data options"
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-md hover:bg-amber-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                  <span>{t.demoBadge}</span>
                  <ChevronDown className="w-3 h-3 text-amber-400/80" aria-hidden="true" />
                </button>

                {showDemoMenu && (
                  <div 
                    role="menu"
                    aria-label="Demo Data Actions"
                    className="absolute left-0 mt-1.5 w-52 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowDemoMenu(false);
                        onResetDemo();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                      <span>{t.resetDemo}</span>
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowDemoMenu(false);
                        onClearData();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-300 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                      <span>{t.clearAll}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Controls: Currency, Lang, Tips, Theme, Quick Add */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector with conversion tooltip */}
            <div className="relative">
              <div 
                role="group" 
                aria-label="Currency Selector (Base: INR)"
                className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono font-semibold"
              >
                {(['₹', '$', '€', '£'] as Currency[]).map(curr => (
                  <button
                    key={curr}
                    onClick={() => {
                      setCurrency(curr);
                      if (curr !== '₹') {
                        setShowCurrencyNotice(true);
                        setTimeout(() => setShowCurrencyNotice(false), 4000);
                      } else {
                        setShowCurrencyNotice(false);
                      }
                    }}
                    aria-pressed={currency === curr}
                    aria-label={`Select currency ${curr} (${EXCHANGE_RATE_DESCRIPTIONS[curr]})`}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                      currency === curr
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              {/* Conversion transparency tooltip */}
              {showCurrencyNotice && currency !== '₹' && (
                <div 
                  role="status"
                  aria-live="polite"
                  className="absolute right-0 top-9 mt-1 w-64 p-2 bg-slate-900 border border-slate-700 rounded-md shadow-xl text-[11px] text-slate-300 z-50 flex items-start gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-100">{EXCHANGE_RATE_DESCRIPTIONS[currency]}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Totals stored uniformly in base INR (₹) and converted accurately for display.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Language Toggle: English / తెలుగు */}
            <button
              onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label={lang === 'en' ? 'Switch language to Telugu (తెలుగు)' : 'Switch language to English'}
              title={lang === 'en' ? 'భాషను తెలుగులోకి మార్చండి' : 'Switch to English'}
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Student Tips Button */}
            <button
              onClick={onOpenTips}
              className="p-2 text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-lg transition-colors hidden sm:flex focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label={t.studentTipsTitle}
              title={t.studentTipsTitle}
            >
              <Lightbulb className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />
              )}
            </button>

            {/* Primary Action Button: + Add Transaction */}
            <button
              onClick={onOpenNewTransaction}
              aria-label={t.quickAddTransaction}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-500/20 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              <span className="hidden sm:inline">{t.quickAddTransaction}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Semantic Nav with aria-current */}
        <nav 
          role="navigation" 
          aria-label="Main Navigation" 
          className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/40"
        >
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
