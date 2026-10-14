export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Food & Dining'
  | 'Rent & Housing'
  | 'Academics & Books'
  | 'Entertainment'
  | 'Tech & Software'
  | 'Travel & Transit'
  | 'Groceries'
  | 'Health & Personal'
  | 'Allowance & Family'
  | 'Part-Time Job'
  | 'Scholarship & Grants'
  | 'Other';

export type PaymentMethod = 'UPI / Cash' | 'Debit Card' | 'Credit Card' | 'Bank Transfer' | 'Campus Card';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  isDemo?: boolean;
}

export interface Budget {
  category: Category;
  monthlyLimit: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  notes?: string;
  color?: string;
  isDemo?: boolean;
}

export type BillingCycle = 'monthly' | 'yearly' | 'quarterly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextRenewalDate: string; // YYYY-MM-DD
  category: string;
  active: boolean;
  notes?: string;
  isDemo?: boolean;
}

export type PriorityLevel = 'high' | 'medium' | 'low';
export type PurchaseStatus = 'planning' | 'saving' | 'completed';

export interface WishlistItem {
  id: string;
  title: string;
  targetPrice: number;
  savedAmount: number;
  targetDate: string; // YYYY-MM-DD
  priority: PriorityLevel;
  category: string;
  notes?: string;
  status: PurchaseStatus;
  isDemo?: boolean;
}

export type Currency = '$' | '₹' | '€' | '£';

export type Language = 'en' | 'te';

export type ActiveTab = 
  | 'dashboard' 
  | 'transactions' 
  | 'budgets' 
  | 'savings' 
  | 'subscriptions' 
  | 'planner';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
