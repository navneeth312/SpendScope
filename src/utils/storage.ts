import { 
  Transaction, 
  Budget, 
  SavingsGoal, 
  Subscription, 
  WishlistItem,
  Currency,
  Language 
} from '../types';
import { 
  initialTransactions, 
  initialBudgets, 
  initialSavingsGoals, 
  initialSubscriptions, 
  initialWishlist 
} from './sampleData';

const KEYS = {
  TRANSACTIONS: 'spendscope_transactions_v2',
  BUDGETS: 'spendscope_budgets_v2',
  GOALS: 'spendscope_goals_v2',
  SUBSCRIPTIONS: 'spendscope_subscriptions_v2',
  WISHLIST: 'spendscope_wishlist_v2',
  LANGUAGE: 'spendscope_lang_v2',
  CURRENCY: 'spendscope_currency_v2',
  THEME: 'spendscope_theme_v2'
};

export const getStoredTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(KEYS.TRANSACTIONS);
    if (!raw) return initialTransactions;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read transactions from localStorage', e);
    return initialTransactions;
  }
};

export const saveTransactions = (data: Transaction[]) => {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save transactions to localStorage', e);
  }
};

export const getStoredBudgets = (): Budget[] => {
  try {
    const raw = localStorage.getItem(KEYS.BUDGETS);
    if (!raw) return initialBudgets;
    return JSON.parse(raw);
  } catch (e) {
    return initialBudgets;
  }
};

export const saveBudgets = (data: Budget[]) => {
  try {
    localStorage.setItem(KEYS.BUDGETS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save budgets', e);
  }
};

export const getStoredGoals = (): SavingsGoal[] => {
  try {
    const raw = localStorage.getItem(KEYS.GOALS);
    if (!raw) return initialSavingsGoals;
    return JSON.parse(raw);
  } catch (e) {
    return initialSavingsGoals;
  }
};

export const saveGoals = (data: SavingsGoal[]) => {
  try {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save goals', e);
  }
};

export const getStoredSubscriptions = (): Subscription[] => {
  try {
    const raw = localStorage.getItem(KEYS.SUBSCRIPTIONS);
    if (!raw) return initialSubscriptions;
    return JSON.parse(raw);
  } catch (e) {
    return initialSubscriptions;
  }
};

export const saveSubscriptions = (data: Subscription[]) => {
  try {
    localStorage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save subscriptions', e);
  }
};

export const getStoredWishlist = (): WishlistItem[] => {
  try {
    const raw = localStorage.getItem(KEYS.WISHLIST);
    if (!raw) return initialWishlist;
    return JSON.parse(raw);
  } catch (e) {
    return initialWishlist;
  }
};

export const saveWishlist = (data: WishlistItem[]) => {
  try {
    localStorage.setItem(KEYS.WISHLIST, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save wishlist', e);
  }
};

export const getStoredLanguage = (): Language => {
  try {
    const raw = localStorage.getItem(KEYS.LANGUAGE) as Language;
    if (raw === 'en' || raw === 'te') return raw;
    return 'en';
  } catch (e) {
    return 'en';
  }
};

export const saveLanguage = (lang: Language) => {
  try {
    localStorage.setItem(KEYS.LANGUAGE, lang);
  } catch (e) {
    console.error('Failed to save language', e);
  }
};

export const getStoredCurrency = (): Currency => {
  try {
    const raw = localStorage.getItem(KEYS.CURRENCY) as Currency;
    if (raw && ['₹', '$', '€', '£'].includes(raw)) return raw;
    return '₹';
  } catch (e) {
    return '₹';
  }
};

export const saveCurrency = (curr: Currency) => {
  try {
    localStorage.setItem(KEYS.CURRENCY, curr);
  } catch (e) {
    console.error('Failed to save currency', e);
  }
};

export const getStoredTheme = (): 'dark' | 'light' => {
  try {
    const raw = localStorage.getItem(KEYS.THEME);
    if (raw === 'light' || raw === 'dark') return raw;
    return 'dark'; // default premium dark navy
  } catch (e) {
    return 'dark';
  }
};

export const saveTheme = (theme: 'dark' | 'light') => {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
};

export const resetAllToDemo = () => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
  localStorage.setItem(KEYS.BUDGETS, JSON.stringify(initialBudgets));
  localStorage.setItem(KEYS.GOALS, JSON.stringify(initialSavingsGoals));
  localStorage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify(initialSubscriptions));
  localStorage.setItem(KEYS.WISHLIST, JSON.stringify(initialWishlist));
};

export const clearAllUserData = () => {
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
  localStorage.setItem(KEYS.GOALS, JSON.stringify([]));
  localStorage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify([]));
  localStorage.setItem(KEYS.WISHLIST, JSON.stringify([]));
};
