import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  Transaction, 
  Budget, 
  SavingsGoal, 
  Subscription, 
  WishlistItem, 
  ActiveTab, 
  Language, 
  Currency, 
  ToastMessage, 
  TransactionType, 
  PurchaseStatus 
} from './types';
import { 
  getStoredTransactions, 
  saveTransactions, 
  getStoredBudgets, 
  saveBudgets, 
  getStoredGoals, 
  saveGoals, 
  getStoredSubscriptions, 
  saveSubscriptions, 
  getStoredWishlist, 
  saveWishlist, 
  getStoredLanguage, 
  saveLanguage, 
  getStoredCurrency, 
  saveCurrency, 
  getStoredTheme, 
  saveTheme, 
  resetAllToDemo, 
  clearAllUserData 
} from './utils/storage';
import { translations } from './utils/translations';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ToastContainer } from './components/Toast';

// Lazy-load non-critical views and modals for optimal initial bundle & Core Web Vitals
const TransactionsView = lazy(() => import('./components/TransactionsView').then(m => ({ default: m.TransactionsView })));
const BudgetsView = lazy(() => import('./components/BudgetsView').then(m => ({ default: m.BudgetsView })));
const SavingsGoalsView = lazy(() => import('./components/SavingsGoalsView').then(m => ({ default: m.SavingsGoalsView })));
const SubscriptionsView = lazy(() => import('./components/SubscriptionsView').then(m => ({ default: m.SubscriptionsView })));
const PurchasePlannerView = lazy(() => import('./components/PurchasePlannerView').then(m => ({ default: m.PurchasePlannerView })));

const TransactionModal = lazy(() => import('./components/TransactionModal').then(m => ({ default: m.TransactionModal })));
const GoalModal = lazy(() => import('./components/GoalModal').then(m => ({ default: m.GoalModal })));
const DepositModal = lazy(() => import('./components/DepositModal').then(m => ({ default: m.DepositModal })));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal').then(m => ({ default: m.SubscriptionModal })));
const WishlistModal = lazy(() => import('./components/WishlistModal').then(m => ({ default: m.WishlistModal })));
const BudgetModal = lazy(() => import('./components/BudgetModal').then(m => ({ default: m.BudgetModal })));
const CsvImportModal = lazy(() => import('./components/CsvImportModal').then(m => ({ default: m.CsvImportModal })));
const StudentTipsModal = lazy(() => import('./components/StudentTipsModal').then(m => ({ default: m.StudentTipsModal })));
const ConfirmModal = lazy(() => import('./components/ConfirmModal').then(m => ({ default: m.ConfirmModal })));

// Accessible View Loading Skeleton
const ViewSkeleton = () => (
  <div className="space-y-4 py-8 animate-pulse" aria-busy="true" aria-label="Loading view">
    <div className="h-8 bg-slate-800/60 rounded-lg w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-28 bg-slate-900 border border-slate-800 rounded-xl"></div>
      <div className="h-28 bg-slate-900 border border-slate-800 rounded-xl"></div>
      <div className="h-28 bg-slate-900 border border-slate-800 rounded-xl"></div>
    </div>
    <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl"></div>
  </div>
);

export default function App() {
  // Persistence state
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(getStoredBudgets);
  const [goals, setGoals] = useState<SavingsGoal[]>(getStoredGoals);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(getStoredSubscriptions);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(getStoredWishlist);
  const [lang, setLang] = useState<Language>(getStoredLanguage);
  const [currency, setCurrency] = useState<Currency>(getStoredCurrency);
  const [theme, setTheme] = useState<'dark' | 'light'>(getStoredTheme);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('expense');

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositTargetGoal, setDepositTargetGoal] = useState<SavingsGoal | null>(null);

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [editingWishlistItem, setEditingWishlistItem] = useState<WishlistItem | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);

  // Generic Confirmation Modal
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const t = translations[lang];

  // Helper for toasts
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to storage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveSubscriptions(subscriptions);
  }, [subscriptions]);

  useEffect(() => {
    saveWishlist(wishlist);
  }, [wishlist]);

  // Sync language with HTML lang attribute for Accessibility & SEO
  useEffect(() => {
    saveLanguage(lang);
    document.documentElement.lang = lang === 'te' ? 'te' : 'en';
  }, [lang]);

  useEffect(() => {
    saveCurrency(currency);
  }, [currency]);

  useEffect(() => {
    saveTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check if any demo data exists
  const hasDemoData = transactions.some(t => t.isDemo) || goals.some(g => g.isDemo);

  // --- Transactions Handlers ---
  const handleOpenAddTx = (type: TransactionType = 'expense') => {
    setEditingTx(null);
    setDefaultTxType(type);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setDefaultTxType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (txData: Omit<Transaction, 'id'> & { id?: string }) => {
    if (txData.id) {
      setTransactions(prev => prev.map(item => item.id === txData.id ? { ...txData, id: txData.id } as Transaction : item));
      addToast(lang === 'te' ? 'లావాదేవీ నవీకరించబడింది' : 'Transaction updated successfully');
    } else {
      const newTx: Transaction = {
        ...txData,
        id: 'tx-' + Date.now().toString()
      };
      setTransactions(prev => [newTx, ...prev]);
      addToast(lang === 'te' ? 'కొత్త లావాదేవీ విజయవంతంగా జోడించబడింది' : 'Transaction added successfully');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: t.confirmDeleteTitle,
      description: t.confirmDeleteDesc,
      isDestructive: true,
      onConfirm: () => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        addToast(lang === 'te' ? 'లావాదేవీ తొలగించబడింది' : 'Transaction removed', 'info');
      }
    });
  };

  // --- Goals Handlers ---
  const handleOpenNewGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (goalData: Omit<SavingsGoal, 'id'> & { id?: string }) => {
    if (goalData.id) {
      setGoals(prev => prev.map(g => g.id === goalData.id ? { ...goalData, id: goalData.id } as SavingsGoal : g));
      addToast(lang === 'te' ? 'లక్ష్యం నవీకరించబడింది' : 'Savings goal updated');
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: 'goal-' + Date.now().toString()
      };
      setGoals(prev => [...prev, newGoal]);
      addToast(lang === 'te' ? 'కొత్త పొదుపు లక్ష్యం సృష్టించబడింది' : 'New savings goal created');
    }
  };

  const handleDeleteGoal = (id: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: t.confirmDeleteTitle,
      description: t.confirmDeleteDesc,
      isDestructive: true,
      onConfirm: () => {
        setGoals(prev => prev.filter(g => g.id !== id));
        addToast(lang === 'te' ? 'లక్ష్యం తొలగించబడింది' : 'Goal removed', 'info');
      }
    });
  };

  const handleOpenDeposit = (goal: SavingsGoal) => {
    setDepositTargetGoal(goal);
    setIsDepositModalOpen(true);
  };

  const handleUpdateFunds = (goalId: string, deltaAmountInBaseINR: number, recordAsTransaction: boolean) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = Math.max(0, goal.currentAmount + deltaAmountInBaseINR);
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: newAmount } : g));

    if (recordAsTransaction) {
      const isDeposit = deltaAmountInBaseINR > 0;
      const absAmount = Math.abs(deltaAmountInBaseINR);
      const newTx: Transaction = {
        id: 'tx-goal-' + Date.now().toString(),
        title: isDeposit ? `Goal Deposit: ${goal.title}` : `Goal Withdrawal: ${goal.title}`,
        amount: absAmount,
        type: isDeposit ? 'expense' : 'income',
        category: 'Other',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer',
        notes: `Automated goal transfer adjustment (${goal.title})`,
        isDemo: false
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    addToast(t.fundsAdjusted);
  };

  // --- Subscriptions Handlers ---
  const handleOpenNewSub = () => {
    setEditingSub(null);
    setIsSubModalOpen(true);
  };

  const handleEditSub = (sub: Subscription) => {
    setEditingSub(sub);
    setIsSubModalOpen(true);
  };

  const handleSaveSub = (subData: Omit<Subscription, 'id'> & { id?: string }) => {
    if (subData.id) {
      setSubscriptions(prev => prev.map(s => s.id === subData.id ? { ...subData, id: subData.id } as Subscription : s));
      addToast(lang === 'te' ? 'సబ్‌స్క్రిప్షన్ నవీకరించబడింది' : 'Subscription updated');
    } else {
      const newSub: Subscription = {
        ...subData,
        id: 'sub-' + Date.now().toString()
      };
      setSubscriptions(prev => [...prev, newSub]);
      addToast(lang === 'te' ? 'కొత్త సబ్‌స్క్రిప్షన్ జోడించబడింది' : 'Subscription added to tracking');
    }
  };

  const handleDeleteSub = (id: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: t.confirmDeleteTitle,
      description: t.confirmDeleteDesc,
      isDestructive: true,
      onConfirm: () => {
        setSubscriptions(prev => prev.filter(s => s.id !== id));
        addToast(lang === 'te' ? 'సబ్‌స్క్రిప్షన్ తొలగించబడింది' : 'Subscription removed', 'info');
      }
    });
  };

  const handleToggleSubActive = (id: string) => {
    setSubscriptions(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.active;
        addToast(nextState ? 'Subscription marked Active' : 'Subscription marked Inactive', 'info');
        return { ...s, active: nextState };
      }
      return s;
    }));
  };

  // --- Wishlist Handlers ---
  const handleOpenNewWishlistItem = () => {
    setEditingWishlistItem(null);
    setIsWishlistModalOpen(true);
  };

  const handleEditWishlistItem = (item: WishlistItem) => {
    setEditingWishlistItem(item);
    setIsWishlistModalOpen(true);
  };

  const handleSaveWishlistItem = (itemData: Omit<WishlistItem, 'id'> & { id?: string }) => {
    if (itemData.id) {
      setWishlist(prev => prev.map(w => w.id === itemData.id ? { ...itemData, id: itemData.id } as WishlistItem : w));
      addToast(lang === 'te' ? 'ప్లానర్ వస్తువు నవీకరించబడింది' : 'Purchase plan updated');
    } else {
      const newItem: WishlistItem = {
        ...itemData,
        id: 'wish-' + Date.now().toString()
      };
      setWishlist(prev => [...prev, newItem]);
      addToast(lang === 'te' ? 'కొత్త వస్తువు ప్లానర్‌లో చేర్చబడింది' : 'Purchase plan added');
    }
  };

  const handleDeleteWishlistItem = (id: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: t.confirmDeleteTitle,
      description: t.confirmDeleteDesc,
      isDestructive: true,
      onConfirm: () => {
        setWishlist(prev => prev.filter(w => w.id !== id));
        addToast(lang === 'te' ? 'వస్తువు తొలగించబడింది' : 'Item removed from planner', 'info');
      }
    });
  };

  const handleStatusChangeWishlist = (id: string, newStatus: PurchaseStatus) => {
    setWishlist(prev => prev.map(w => {
      if (w.id === id) {
        return { 
          ...w, 
          status: newStatus,
          savedAmount: newStatus === 'completed' ? w.targetPrice : w.savedAmount
        };
      }
      return w;
    }));
    addToast(newStatus === 'completed' ? 'Item marked as Purchased! 🎉' : 'Purchase plan reopened');
  };

  // --- Budgets Handlers ---
  const handleSaveBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    addToast(lang === 'te' ? 'వర్గ బడ్జెట్‌లు నవీకరించబడ్డాయి' : 'Category budgets updated successfully');
  };

  // --- CSV Import ---
  const handleImportCsv = (rows: Array<Omit<Transaction, 'id'>>) => {
    const formatted = rows.map((r, index) => ({
      ...r,
      id: 'tx-csv-' + Date.now().toString() + '-' + index
    }));
    setTransactions(prev => [...formatted, ...prev]);
    addToast(t.csvSuccessImport.replace('{count}', rows.length.toString()), 'success');
  };

  // --- Reset & Clear ---
  const handleResetDemo = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: t.confirmResetTitle,
      description: t.confirmResetDesc,
      isDestructive: false,
      confirmText: t.resetDemo,
      onConfirm: () => {
        resetAllToDemo();
        setTransactions(getStoredTransactions());
        setBudgets(getStoredBudgets());
        setGoals(getStoredGoals());
        setSubscriptions(getStoredSubscriptions());
        setWishlist(getStoredWishlist());
        addToast(lang === 'te' ? 'నమూనా డెమో డేటా విజయవంతంగా పునరుద్ధరించబడింది' : 'Realistic student demo data reloaded', 'success');
      }
    });
  };

  const handleClearAll = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: t.confirmClearTitle,
      description: t.confirmClearDesc,
      isDestructive: true,
      confirmText: t.clearAll,
      onConfirm: () => {
        clearAllUserData();
        setTransactions([]);
        setGoals([]);
        setSubscriptions([]);
        setWishlist([]);
        addToast(lang === 'te' ? 'మొత్తం డేటా తొలగించబడింది' : 'All personal data cleared. Ready for fresh records.', 'info');
      }
    });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      theme === 'dark' ? 'bg-[#0a0f1d] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Skip to Main Content Link (WCAG 2.4.1) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-slate-950 focus:font-bold focus:rounded-lg focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
        theme={theme}
        setTheme={setTheme}
        onOpenNewTransaction={() => handleOpenAddTx('expense')}
        onOpenTips={() => setIsTipsModalOpen(true)}
        onResetDemo={handleResetDemo}
        onClearData={handleClearAll}
        isDemoData={hasDemoData}
      />

      {/* Main View Area */}
      <main id="main-content" role="main" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 outline-none">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            subscriptions={subscriptions}
            lang={lang}
            currency={currency}
            onNavigate={setActiveTab}
            onAddTransaction={handleOpenAddTx}
          />
        )}

        <Suspense fallback={<ViewSkeleton />}>
          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              lang={lang}
              currency={currency}
              onAddTransaction={handleOpenAddTx}
              onEditTransaction={handleEditTx}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenImportCsv={() => setIsCsvModalOpen(true)}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              transactions={transactions}
              lang={lang}
              currency={currency}
              onOpenEditBudgets={() => setIsBudgetModalOpen(true)}
              onAddExpense={() => handleOpenAddTx('expense')}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsGoalsView
              goals={goals}
              lang={lang}
              currency={currency}
              onOpenNewGoal={handleOpenNewGoal}
              onEditGoal={handleEditGoal}
              onDeleteGoal={handleDeleteGoal}
              onOpenDeposit={handleOpenDeposit}
            />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionsView
              subscriptions={subscriptions}
              lang={lang}
              currency={currency}
              onOpenNewSubscription={handleOpenNewSub}
              onEditSubscription={handleEditSub}
              onDeleteSubscription={handleDeleteSub}
              onToggleActive={handleToggleSubActive}
            />
          )}

          {activeTab === 'planner' && (
            <PurchasePlannerView
              items={wishlist}
              lang={lang}
              currency={currency}
              onOpenNewItem={handleOpenNewWishlistItem}
              onEditItem={handleEditWishlistItem}
              onDeleteItem={handleDeleteWishlistItem}
              onStatusChange={handleStatusChangeWishlist}
            />
          )}
        </Suspense>
      </main>

      {/* Semantic Footer */}
      <footer role="contentinfo" className="border-t border-slate-800/60 bg-slate-950/40 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium text-slate-300">
            <span>SpendScope</span>
            <span aria-hidden="true">·</span>
            <span>Student Personal Finance & Budget Tracker</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button onClick={handleResetDemo} className="hover:text-slate-200 underline focus-visible:rounded">
              {t.resetDemo}
            </button>
            <button onClick={() => setIsTipsModalOpen(true)} className="hover:text-slate-200 underline focus-visible:rounded">
              {t.studentTipsTitle}
            </button>
            <span>LocalStorage Secured</span>
          </div>
        </div>
      </footer>

      {/* Lazily Rendered Modals with Suspense */}
      <Suspense fallback={null}>
        {isTxModalOpen && (
          <TransactionModal
            isOpen={isTxModalOpen}
            onClose={() => setIsTxModalOpen(false)}
            onSave={handleSaveTransaction}
            initialData={editingTx}
            defaultType={defaultTxType}
            lang={lang}
            currency={currency}
          />
        )}

        {isGoalModalOpen && (
          <GoalModal
            isOpen={isGoalModalOpen}
            onClose={() => setIsGoalModalOpen(false)}
            onSave={handleSaveGoal}
            initialData={editingGoal}
            lang={lang}
            currency={currency}
          />
        )}

        {isDepositModalOpen && (
          <DepositModal
            isOpen={isDepositModalOpen}
            onClose={() => setIsDepositModalOpen(false)}
            goal={depositTargetGoal}
            onUpdateFunds={handleUpdateFunds}
            lang={lang}
            currency={currency}
          />
        )}

        {isSubModalOpen && (
          <SubscriptionModal
            isOpen={isSubModalOpen}
            onClose={() => setIsSubModalOpen(false)}
            onSave={handleSaveSub}
            initialData={editingSub}
            lang={lang}
            currency={currency}
          />
        )}

        {isWishlistModalOpen && (
          <WishlistModal
            isOpen={isWishlistModalOpen}
            onClose={() => setIsWishlistModalOpen(false)}
            onSave={handleSaveWishlistItem}
            initialData={editingWishlistItem}
            lang={lang}
            currency={currency}
          />
        )}

        {isBudgetModalOpen && (
          <BudgetModal
            isOpen={isBudgetModalOpen}
            onClose={() => setIsBudgetModalOpen(false)}
            budgets={budgets}
            onSaveBudgets={handleSaveBudgets}
            lang={lang}
            currency={currency}
          />
        )}

        {isCsvModalOpen && (
          <CsvImportModal
            isOpen={isCsvModalOpen}
            onClose={() => setIsCsvModalOpen(false)}
            onImport={handleImportCsv}
            lang={lang}
            currency={currency}
          />
        )}

        {isTipsModalOpen && (
          <StudentTipsModal
            isOpen={isTipsModalOpen}
            onClose={() => setIsTipsModalOpen(false)}
            lang={lang}
          />
        )}

        {confirmModalConfig.isOpen && (
          <ConfirmModal
            isOpen={confirmModalConfig.isOpen}
            title={confirmModalConfig.title}
            description={confirmModalConfig.description}
            confirmText={confirmModalConfig.confirmText}
            isDestructive={confirmModalConfig.isDestructive}
            onConfirm={confirmModalConfig.onConfirm}
            onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
            lang={lang}
          />
        )}
      </Suspense>

      {/* Accessible Toast notifications with live region */}
      <div aria-live="polite" aria-atomic="true">
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    </div>
  );
}
