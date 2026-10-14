import { Transaction, Budget, SavingsGoal, Subscription, WishlistItem } from '../types';

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Computer Lab Assistant Pay',
    amount: 6500,
    type: 'income',
    category: 'Part-Time Job',
    date: '2026-10-01',
    paymentMethod: 'Bank Transfer',
    notes: 'Campus lab supervisor monthly stipend',
    isDemo: true
  },
  {
    id: 'tx-2',
    title: 'Monthly Family Support Allowance',
    amount: 12000,
    type: 'income',
    category: 'Allowance & Family',
    date: '2026-10-02',
    paymentMethod: 'UPI / Cash',
    notes: 'Monthly allowance for hostel & mess',
    isDemo: true
  },
  {
    id: 'tx-3',
    title: 'Peer Tutoring (Calculus & Physics)',
    amount: 1800,
    type: 'income',
    category: 'Part-Time Job',
    date: '2026-10-06',
    paymentMethod: 'UPI / Cash',
    notes: '3 sessions peer tutoring junior batch',
    isDemo: true
  },
  {
    id: 'tx-4',
    title: 'Shared Student Hostel / Flat Rent',
    amount: 5500,
    type: 'expense',
    category: 'Rent & Housing',
    date: '2026-10-03',
    paymentMethod: 'Bank Transfer',
    notes: 'October split rent with roommates',
    isDemo: true
  },
  {
    id: 'tx-5',
    title: 'Used Engineering Textbooks & Notes',
    amount: 1200,
    type: 'expense',
    category: 'Academics & Books',
    date: '2026-10-04',
    paymentMethod: 'Campus Card',
    notes: 'Algorithms & Database books bought from senior',
    isDemo: true
  },
  {
    id: 'tx-6',
    title: 'Monthly Campus Mess Pass',
    amount: 3000,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-10-05',
    paymentMethod: 'Campus Card',
    notes: 'Mess card renewal for lunch & dinner',
    isDemo: true
  },
  {
    id: 'tx-7',
    title: 'Hostel Grocery & Provision Haul',
    amount: 1450,
    type: 'expense',
    category: 'Groceries',
    date: '2026-10-07',
    paymentMethod: 'Debit Card',
    notes: 'Milk, oats, fruits, biscuits, snacks',
    isDemo: true
  },
  {
    id: 'tx-8',
    title: 'Student Metro & City Bus Pass',
    amount: 550,
    type: 'expense',
    category: 'Travel & Transit',
    date: '2026-10-08',
    paymentMethod: 'Debit Card',
    notes: 'Monthly student bus and metro transit card',
    isDemo: true
  },
  {
    id: 'tx-9',
    title: 'Study Group Chai & Cafe Snacks',
    amount: 240,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-10-10',
    paymentMethod: 'UPI / Cash',
    notes: 'Chai and samosas during group study',
    isDemo: true
  },
  {
    id: 'tx-10',
    title: 'Stationery, Notebooks & Lab Records',
    amount: 380,
    type: 'expense',
    category: 'Academics & Books',
    date: '2026-10-11',
    paymentMethod: 'UPI / Cash',
    notes: 'Grid notebooks and pens for lab work',
    isDemo: true
  },
  {
    id: 'tx-11',
    title: 'Weekend Movie & Dinner Out',
    amount: 650,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-10-12',
    paymentMethod: 'UPI / Cash',
    notes: 'Weekend movie ticket and shared dinner',
    isDemo: true
  }
];

export const initialBudgets: Budget[] = [
  { category: 'Rent & Housing', monthlyLimit: 6000 },
  { category: 'Food & Dining', monthlyLimit: 3500 },
  { category: 'Groceries', monthlyLimit: 2000 },
  { category: 'Academics & Books', monthlyLimit: 1500 },
  { category: 'Travel & Transit', monthlyLimit: 800 },
  { category: 'Entertainment', monthlyLimit: 800 },
  { category: 'Tech & Software', monthlyLimit: 800 },
  { category: 'Health & Personal', monthlyLimit: 600 }
];

export const initialSavingsGoals: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Emergency Student Cushion',
    targetAmount: 15000,
    currentAmount: 11200,
    targetDate: '2026-12-31',
    category: 'Emergency',
    notes: 'Essential student emergency buffer for medical or urgent needs',
    color: '#10b981',
    isDemo: true
  },
  {
    id: 'goal-2',
    title: 'Coding Laptop Upgrade Fund',
    targetAmount: 65000,
    currentAmount: 42000,
    targetDate: '2027-02-15',
    category: 'Tech',
    notes: 'Saving for lightweight developer laptop for capstone project',
    color: '#06b6d4',
    isDemo: true
  },
  {
    id: 'goal-3',
    title: 'Semester End Getaway Trip',
    targetAmount: 8000,
    currentAmount: 5200,
    targetDate: '2026-12-18',
    category: 'Travel',
    notes: 'Weekend trip with college friends after exams',
    color: '#f59e0b',
    isDemo: true
  }
];

export const initialSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Spotify Premium Student',
    amount: 59,
    billingCycle: 'monthly',
    nextRenewalDate: '2026-10-17',
    category: 'Entertainment',
    active: true,
    notes: 'Verified with college .edu / student ID',
    isDemo: true
  },
  {
    id: 'sub-2',
    name: 'Amazon Prime Student',
    amount: 125,
    billingCycle: 'monthly',
    nextRenewalDate: '2026-10-21',
    category: 'Shopping & Delivery',
    active: true,
    notes: 'Free fast delivery on books and essentials',
    isDemo: true
  },
  {
    id: 'sub-3',
    name: 'ChatGPT Plus (Shared Split)',
    amount: 850,
    billingCycle: 'monthly',
    nextRenewalDate: '2026-10-26',
    category: 'Tech & Software',
    active: true,
    notes: 'Split 50/50 with coding project partner',
    isDemo: true
  },
  {
    id: 'sub-4',
    name: 'Campus Gym Membership',
    amount: 600,
    billingCycle: 'monthly',
    nextRenewalDate: '2026-11-01',
    category: 'Health & Personal',
    active: true,
    notes: 'Monthly pass to campus recreation gym',
    isDemo: true
  },
  {
    id: 'sub-5',
    name: 'GitHub Copilot Student',
    amount: 0,
    billingCycle: 'yearly',
    nextRenewalDate: '2027-08-30',
    category: 'Tech & Software',
    active: true,
    notes: 'Free via GitHub Student Developer Pack',
    isDemo: true
  }
];

export const initialWishlist: WishlistItem[] = [
  {
    id: 'wish-1',
    title: 'Sony WH-1000XM5 ANC Headphones',
    targetPrice: 24990,
    savedAmount: 14000,
    targetDate: '2026-12-10',
    priority: 'high',
    category: 'Study Tech',
    notes: 'Essential for concentrating in noisy college library & hostel',
    status: 'saving',
    isDemo: true
  },
  {
    id: 'wish-2',
    title: 'Ergonomic Desk Chair for Study',
    targetPrice: 6500,
    savedAmount: 2800,
    targetDate: '2027-01-20',
    priority: 'medium',
    category: 'Furniture',
    notes: 'Prevent back pain during long study sessions',
    status: 'saving',
    isDemo: true
  },
  {
    id: 'wish-3',
    title: 'Competitive Exam Mock Test Series',
    targetPrice: 3500,
    savedAmount: 1200,
    targetDate: '2027-03-01',
    priority: 'low',
    category: 'Education',
    notes: 'Online test series and previous year solved questions',
    status: 'planning',
    isDemo: true
  }
];
