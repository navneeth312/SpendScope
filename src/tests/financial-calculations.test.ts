import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Transaction } from '../types';

describe('Financial Calculations & Edge Cases', () => {
  test('aggregates income and expenses accurately', () => {
    const sample: Transaction[] = [
      { id: '1', title: 'Salary', amount: 500.50, type: 'income', category: 'Part-Time Job', date: '2026-10-01', paymentMethod: 'Bank Transfer' },
      { id: '2', title: 'Tutoring', amount: 150.25, type: 'income', category: 'Part-Time Job', date: '2026-10-02', paymentMethod: 'UPI / Cash' },
      { id: '3', title: 'Rent', amount: 300.00, type: 'expense', category: 'Rent & Housing', date: '2026-10-03', paymentMethod: 'Bank Transfer' },
      { id: '4', title: 'Groceries', amount: 45.75, type: 'expense', category: 'Groceries', date: '2026-10-04', paymentMethod: 'Debit Card' }
    ];

    const income = sample.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = sample.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;

    assert.equal(income, 650.75);
    assert.equal(expense, 345.75);
    assert.equal(net, 305.00);
  });

  test('handles zero income and zero expenses gracefully', () => {
    const empty: Transaction[] = [];
    const income = empty.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = empty.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;

    assert.equal(income, 0);
    assert.equal(expense, 0);
    assert.equal(net, 0);
  });

  test('calculates savings rate with division by zero protection', () => {
    const calculateSavingsRate = (income: number, expense: number): number => {
      if (income <= 0) return 0;
      return Math.max(0, Math.round(((income - expense) / income) * 100));
    };

    // Standard case: $1000 income, $400 expense -> 60% savings rate
    assert.equal(calculateSavingsRate(1000, 400), 60);

    // Deficit case: $500 income, $800 expense -> 0% (clamped, no negative)
    assert.equal(calculateSavingsRate(500, 800), 0);

    // Zero income: no division by zero
    assert.equal(calculateSavingsRate(0, 200), 0);
    assert.equal(calculateSavingsRate(0, 0), 0);

    // Exact match: $500 income, $500 expense -> 0%
    assert.equal(calculateSavingsRate(500, 500), 0);
  });

  test('calculates safe daily spend based on days remaining', () => {
    const calculateSafeDailySpend = (balance: number, daysLeft: number): string => {
      const safeDays = Math.max(1, daysLeft);
      if (balance <= 0) return '0.00';
      return (balance / safeDays).toFixed(2);
    };

    // $300 balance across 15 days -> $20.00/day
    assert.equal(calculateSafeDailySpend(300, 15), '20.00');

    // $100 balance on last day of month (1 day left) -> $100.00
    assert.equal(calculateSafeDailySpend(100, 1), '100.00');

    // Negative balance -> '0.00'
    assert.equal(calculateSafeDailySpend(-50, 10), '0.00');

    // Zero balance -> '0.00'
    assert.equal(calculateSafeDailySpend(0, 5), '0.00');
  });

  test('handles floating point precision and cents rounding', () => {
    // Classic JavaScript floating issue: 0.1 + 0.2 = 0.30000000000000004
    const a = 0.1;
    const b = 0.2;
    const rawSum = a + b;
    const roundedSum = Math.round(rawSum * 100) / 100;
    assert.equal(roundedSum, 0.3);

    // Precision with 3 decimal input: 14.256 rounds to 14.26
    const threeDecimals = 14.256;
    const roundedCents = Math.round(threeDecimals * 100) / 100;
    assert.equal(roundedCents, 14.26);

    // Rounding down: 19.991 rounds to 19.99
    assert.equal(Math.round(19.991 * 100) / 100, 19.99);
  });

  test('computes category spending breakdown and percentage distributions', () => {
    const expenses: Transaction[] = [
      { id: '1', title: 'Lunch', amount: 100, type: 'expense', category: 'Food & Dining', date: '2026-10-01', paymentMethod: 'Debit Card' },
      { id: '2', title: 'Dinner', amount: 100, type: 'expense', category: 'Food & Dining', date: '2026-10-02', paymentMethod: 'UPI / Cash' },
      { id: '3', title: 'Book', amount: 200, type: 'expense', category: 'Academics & Books', date: '2026-10-03', paymentMethod: 'Debit Card' }
    ];

    const categoryMap: Record<string, number> = {};
    expenses.forEach(tx => {
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
    });

    const total = Object.values(categoryMap).reduce((a, b) => a + b, 0);
    assert.equal(total, 400);
    assert.equal(categoryMap['Food & Dining'], 200);
    assert.equal(categoryMap['Academics & Books'], 200);

    const foodPct = Math.round((categoryMap['Food & Dining'] / total) * 100);
    const academicsPct = Math.round((categoryMap['Academics & Books'] / total) * 100);
    assert.equal(foodPct, 50);
    assert.equal(academicsPct, 50);
    assert.equal(foodPct + academicsPct, 100);
  });

  test('calculates student financial health score across ratio thresholds', () => {
    const getHealthScore = (income: number, expense: number): { score: number; state: string } => {
      if (income <= 0) return { score: 50, state: 'good' };
      const ratio = expense / income;
      if (ratio < 0.6) return { score: 95, state: 'excellent' };
      if (ratio < 0.85) return { score: 80, state: 'good' };
      if (ratio <= 1.0) return { score: 60, state: 'warning' };
      return { score: 30, state: 'critical' };
    };

    // < 60% spent: Excellent
    assert.deepEqual(getHealthScore(1000, 500), { score: 95, state: 'excellent' });

    // 60-84% spent: Good
    assert.deepEqual(getHealthScore(1000, 750), { score: 80, state: 'good' });

    // 85-100% spent: Warning
    assert.deepEqual(getHealthScore(1000, 950), { score: 60, state: 'warning' });
    assert.deepEqual(getHealthScore(1000, 1000), { score: 60, state: 'warning' });

    // > 100% spent: Critical (Deficit)
    assert.deepEqual(getHealthScore(1000, 1200), { score: 30, state: 'critical' });

    // Zero income edge case
    assert.deepEqual(getHealthScore(0, 100), { score: 50, state: 'good' });
  });
});
