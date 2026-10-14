import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { translations, getCategoryTranslation } from '../utils/translations';
import { 
  initialTransactions, 
  initialBudgets, 
  initialSavingsGoals, 
  initialSubscriptions, 
  initialWishlist 
} from '../utils/sampleData';
import { Category } from '../types';

describe('Bilingual Translations & Sample Data Integrity', () => {
  test('verifies that English and Telugu dictionaries have 100% key parity', () => {
    const enKeys = Object.keys(translations.en).sort();
    const teKeys = Object.keys(translations.te).sort();

    assert.equal(enKeys.length, teKeys.length, 'Translations must have identical number of keys');
    assert.deepEqual(enKeys, teKeys, 'English and Telugu dictionaries must share the exact same keys');
  });

  test('verifies that no translation string is blank or undefined', () => {
    Object.entries(translations.en).forEach(([key, val]) => {
      assert.ok(typeof val === 'string' && val.trim().length > 0, `English key "${key}" must be non-empty`);
    });

    Object.entries(translations.te).forEach(([key, val]) => {
      assert.ok(typeof val === 'string' && val.trim().length > 0, `Telugu key "${key}" must be non-empty`);
    });
  });

  test('translates standard student categories into Telugu properly', () => {
    const categories: Category[] = [
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

    categories.forEach(cat => {
      const teName = getCategoryTranslation(cat, 'te');
      const enName = getCategoryTranslation(cat, 'en');

      assert.ok(teName.length > 0, `Category "${cat}" must have a Telugu translation`);
      assert.equal(enName, cat, `Category "${cat}" in English must return itself`);
    });

    // Unknown category fallback
    const unknownCat = 'Custom Robotics Club' as any;
    assert.equal(getCategoryTranslation(unknownCat, 'te'), 'Custom Robotics Club');
  });

  test('validates initial student sample transactions integrity', () => {
    assert.ok(initialTransactions.length > 5, 'Should have rich sample student dataset');

    initialTransactions.forEach(tx => {
      assert.ok(tx.id && tx.id.length > 0, 'Transaction must have ID');
      assert.ok(tx.title && tx.title.trim().length > 0, 'Transaction must have title');
      assert.ok(typeof tx.amount === 'number' && tx.amount > 0, 'Amount must be positive number');
      assert.ok(tx.type === 'income' || tx.type === 'expense', 'Type must be income or expense');
      assert.ok(tx.category && tx.category.length > 0, 'Must have category');
      assert.match(tx.date, /^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');
      assert.equal(tx.isDemo, true, 'Sample data must be flagged as demo data');
    });
  });

  test('validates initial budgets, goals, subscriptions, and wishlist integrity', () => {
    // Budgets
    assert.ok(initialBudgets.length > 0);
    initialBudgets.forEach(b => {
      assert.ok(b.category);
      assert.ok(b.monthlyLimit > 0);
    });

    // Goals
    assert.ok(initialSavingsGoals.length > 0);
    initialSavingsGoals.forEach(g => {
      assert.ok(g.title);
      assert.ok(g.targetAmount > 0);
      assert.ok(g.currentAmount >= 0);
      assert.equal(g.isDemo, true);
    });

    // Subscriptions
    assert.ok(initialSubscriptions.length > 0);
    initialSubscriptions.forEach(s => {
      assert.ok(s.name);
      assert.ok(s.amount >= 0);
      assert.match(s.nextRenewalDate, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(s.isDemo, true);
    });

    // Wishlist
    assert.ok(initialWishlist.length > 0);
    initialWishlist.forEach(w => {
      assert.ok(w.title);
      assert.ok(w.targetPrice > 0);
      assert.ok(['high', 'medium', 'low'].includes(w.priority));
      assert.equal(w.isDemo, true);
    });
  });
});
