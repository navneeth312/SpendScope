import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Budget, Transaction } from '../types';

describe('Category Budgets & Warning Thresholds', () => {
  const budgets: Budget[] = [
    { category: 'Rent & Housing', monthlyLimit: 400 },
    { category: 'Food & Dining', monthlyLimit: 200 },
    { category: 'Groceries', monthlyLimit: 150 },
    { category: 'Entertainment', monthlyLimit: 50 },
    { category: 'Other', monthlyLimit: 0 } // edge case: zero limit
  ];

  test('calculates spent per category and remaining budget', () => {
    const transactions: Transaction[] = [
      { id: '1', title: 'Rent Split', amount: 380, type: 'expense', category: 'Rent & Housing', date: '2026-10-01', paymentMethod: 'Bank Transfer' },
      { id: '2', title: 'Cafeteria', amount: 150, type: 'expense', category: 'Food & Dining', date: '2026-10-02', paymentMethod: 'Campus Card' },
      { id: '3', title: 'Trader Joe', amount: 80, type: 'expense', category: 'Groceries', date: '2026-10-03', paymentMethod: 'Debit Card' }
    ];

    const spentMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      spentMap[t.category] = (spentMap[t.category] || 0) + t.amount;
    });

    // Rent: 400 limit - 380 spent = 20 remaining (95% utilized -> Warning)
    assert.equal(spentMap['Rent & Housing'], 380);
    assert.equal(budgets[0].monthlyLimit - spentMap['Rent & Housing'], 20);

    // Food: 200 limit - 150 spent = 50 remaining (75% utilized -> Good)
    assert.equal(spentMap['Food & Dining'], 150);
    assert.equal(budgets[1].monthlyLimit - spentMap['Food & Dining'], 50);

    // Unspent category: Entertainment has 0 spent
    assert.equal(spentMap['Entertainment'] || 0, 0);
    assert.equal(budgets[3].monthlyLimit - (spentMap['Entertainment'] || 0), 50);
  });

  test('accurately triggers Near Limit (>=80%) and Over Budget (>100%) states', () => {
    const getBudgetStatus = (spent: number, limit: number): { pct: number; isOver: boolean; isWarning: boolean; label: string } => {
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const isOver = pct > 100;
      const isWarning = pct >= 80 && pct <= 100;
      const label = isOver ? 'Over Budget' : isWarning ? 'Near Limit' : 'On Track';
      return { pct, isOver, isWarning, label };
    };

    // 50% spent: On Track
    const res50 = getBudgetStatus(100, 200);
    assert.equal(res50.pct, 50);
    assert.equal(res50.isOver, false);
    assert.equal(res50.isWarning, false);
    assert.equal(res50.label, 'On Track');

    // 80% spent: Near Limit boundary
    const res80 = getBudgetStatus(160, 200);
    assert.equal(res80.pct, 80);
    assert.equal(res80.isOver, false);
    assert.equal(res80.isWarning, true);
    assert.equal(res80.label, 'Near Limit');

    // 100% spent: Near Limit (exhausted budget)
    const res100 = getBudgetStatus(200, 200);
    assert.equal(res100.pct, 100);
    assert.equal(res100.isOver, false);
    assert.equal(res100.isWarning, true);

    // 105% spent: Over Budget
    const res105 = getBudgetStatus(210, 200);
    assert.equal(res105.pct, 105);
    assert.equal(res105.isOver, true);
    assert.equal(res105.isWarning, false);
    assert.equal(res105.label, 'Over Budget');

    // Zero limit edge case: does not divide by zero or produce NaN
    const resZero = getBudgetStatus(50, 0);
    assert.equal(resZero.pct, 0);
    assert.equal(resZero.isOver, false);
    assert.equal(resZero.label, 'On Track');
  });

  test('identifies over-budget categories for warning banners', () => {
    const spentMap: Record<string, number> = {
      'Rent & Housing': 420, // Limit 400 -> Over
      'Food & Dining': 250,  // Limit 200 -> Over
      'Groceries': 100,      // Limit 150 -> Under
      'Entertainment': 30,   // Limit 50 -> Under
      'Other': 10            // Limit 0 -> Ignored because limit = 0
    };

    const overBudgets = budgets.filter(b => (spentMap[b.category] || 0) > b.monthlyLimit && b.monthlyLimit > 0);
    assert.equal(overBudgets.length, 2);
    assert.equal(overBudgets[0].category, 'Rent & Housing');
    assert.equal(overBudgets[1].category, 'Food & Dining');
  });

  test('aggregates total monthly budgeted limit across categories', () => {
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    assert.equal(totalBudgeted, 400 + 200 + 150 + 50 + 0); // 800

    const emptyBudgets: Budget[] = [];
    assert.equal(emptyBudgets.reduce((s, b) => s + b.monthlyLimit, 0), 0);
  });
});
