import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  ArrowUpDown
} from 'lucide-react';
import { Transaction, TransactionType, Category, Language, Currency } from '../types';
import { translations, getCategoryTranslation } from '../utils/translations';
import { exportTransactionsToCsv } from '../utils/csv';
import { formatCurrency } from '../utils/currency';

interface TransactionsViewProps {
  transactions: Transaction[];
  lang: Language;
  currency: Currency;
  onAddTransaction: (type?: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenImportCsv: () => void;
}

const ALL_CATEGORIES: Category[] = [
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

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  lang,
  currency,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onOpenImportCsv
}) => {
  const t = translations[lang];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filter & Sort
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) return false;

        // Category filter
        if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;

        // Search text
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchesTitle = tx.title.toLowerCase().includes(query);
          const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(query) : false;
          const matchesCat = tx.category.toLowerCase().includes(query);
          const matchesMethod = tx.paymentMethod.toLowerCase().includes(query);
          if (!matchesTitle && !matchesNotes && !matchesCat && !matchesMethod) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, selectedType, selectedCategory, searchTerm, sortBy]);

  // Aggregate stats of filtered transactions
  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const handleExportCsv = () => {
    exportTransactionsToCsv(filteredTransactions, `spendscope_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Main Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">{t.transactions}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage and audit all student income and expense logs</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Import */}
          <button
            onClick={onOpenImportCsv}
            aria-label={t.importCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>{t.importCsv}</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            aria-label={t.exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>{t.exportCsv}</span>
          </button>

          {/* Add Income */}
          <button
            onClick={() => onAddTransaction('income')}
            aria-label={t.addIncome}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.addIncome}</span>
          </button>

          {/* Add Expense */}
          <button
            onClick={() => onAddTransaction('expense')}
            aria-label={t.addExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.addExpense}</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & Segmented Controls */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <label htmlFor="tx-search-input" className="sr-only">Search transactions</label>
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" aria-hidden="true" />
            <input
              id="tx-search-input"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={lang === 'te' ? 'పేరు, గమనికలు, వర్గం లేదా చెల్లింపు విధానం ద్వారా వెతకండి...' : 'Search by title, notes, category, payment method...'}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs text-slate-100 placeholder-slate-500 outline-hidden transition-colors"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="md:col-span-4 relative">
            <label htmlFor="tx-category-select" className="sr-only">Filter by category</label>
            <select
              id="tx-category-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs text-slate-200 outline-hidden transition-colors"
            >
              <option value="all">{t.all} Categories ({ALL_CATEGORIES.length})</option>
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryTranslation(cat, lang)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="md:col-span-3 relative">
            <label htmlFor="tx-sort-select" className="sr-only">Sort transactions</label>
            <select
              id="tx-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-xs text-slate-200 outline-hidden transition-colors"
            >
              <option value="date-desc">{t.sortByDateDesc}</option>
              <option value="date-asc">{t.sortByDateAsc}</option>
              <option value="amount-desc">{t.sortByAmountDesc}</option>
              <option value="amount-asc">{t.sortByAmountAsc}</option>
            </select>
          </div>
        </div>

        {/* Type Filter Buttons & Summary Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div 
            role="group" 
            aria-label="Filter transaction types"
            className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 w-fit"
          >
            <button
              onClick={() => setSelectedType('all')}
              aria-pressed={selectedType === 'all'}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                selectedType === 'all'
                  ? 'bg-slate-800 text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.allTransactions}
            </button>
            <button
              onClick={() => setSelectedType('income')}
              aria-pressed={selectedType === 'income'}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                selectedType === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.incomeTab}
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              aria-pressed={selectedType === 'expense'}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all focus-visible:ring-2 focus-visible:ring-rose-400 ${
                selectedType === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.expenseTab}
            </button>
          </div>

          {/* Filtered Summary stats */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-slate-400">
              {t.totalFiltered}: <strong className="text-slate-200">{filteredTransactions.length}</strong> {t.records}
            </div>
            <div className="text-emerald-400 font-semibold">
              +{formatCurrency(filteredIncome, currency)}
            </div>
            <div className="text-rose-400 font-semibold">
              -{formatCurrency(filteredExpense, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-sm font-medium text-slate-300">{t.noTransactionsFound}</p>
          <p className="text-xs text-slate-400 mt-1">{t.noTransactionsDesc}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => onAddTransaction('income')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {t.addIncome}
            </button>
            <button
              onClick={() => onAddTransaction('expense')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {t.addExpense}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-4">{t.title}</th>
                  <th scope="col" className="py-3 px-4">{t.category}</th>
                  <th scope="col" className="py-3 px-4">{t.paymentMethod}</th>
                  <th scope="col" className="py-3 px-4">{t.date}</th>
                  <th scope="col" className="py-3 px-4 text-right">{t.amount}</th>
                  <th scope="col" className="py-3 px-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map(tx => {
                  const isIncome = tx.type === 'income';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors group">
                      {/* Title & Notes */}
                      <td className="py-3 px-4 font-medium text-slate-200">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                            {isIncome ? (
                              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-100">{tx.title}</span>
                            {tx.notes && (
                              <p className="text-[11px] text-slate-400 font-normal line-clamp-1">{tx.notes}</p>
                            )}
                          </div>
                          {tx.isDemo && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                              Demo
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-300">
                        {getCategoryTranslation(tx.category, lang)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 text-slate-400">
                        {tx.paymentMethod}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {tx.date}
                      </td>

                      {/* Amount */}
                      <td className={`py-3 px-4 text-right font-mono font-semibold text-sm ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            aria-label={`${t.edit} ${tx.title}`}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
                            title={t.edit}
                          >
                            <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            aria-label={`${t.delete} ${tx.title}`}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
                            title={t.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
