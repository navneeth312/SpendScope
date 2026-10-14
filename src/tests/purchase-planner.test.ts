import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { WishlistItem, PurchaseStatus } from '../types';

describe('Purchase Planner & Savings Timeline Calculator', () => {
  const item: WishlistItem = {
    id: 'wish-1',
    title: 'Sony WH-1000XM5 Headphones',
    targetPrice: 320,
    savedAmount: 160,
    targetDate: '2026-12-14',
    priority: 'high',
    category: 'Study Tech',
    status: 'saving'
  };

  test('calculates remaining amount to be saved', () => {
    const calcRemaining = (price: number, saved: number): number => Math.max(0, price - saved);

    assert.equal(calcRemaining(item.targetPrice, item.savedAmount), 160);
    assert.equal(calcRemaining(320, 320), 0);
    assert.equal(calcRemaining(320, 350), 0);
  });

  test('calculates required monthly savings given target date', () => {
    const calcMonthlyRequired = (price: number, saved: number, targetDateStr: string, refDate: Date): string => {
      const remaining = Math.max(0, price - saved);
      if (remaining <= 0) return '0.00';
      const target = new Date(targetDateStr);
      const diffMonths = (target.getFullYear() - refDate.getFullYear()) * 12 + (target.getMonth() - refDate.getMonth());
      const safeMonths = Math.max(1, diffMonths);
      return (remaining / safeMonths).toFixed(2);
    };

    const ref = new Date('2026-10-14T00:00:00Z');
    // Target is Dec 2026 -> 2 months away. Remaining is $160 -> $80.00 / mo
    const required = calcMonthlyRequired(item.targetPrice, item.savedAmount, item.targetDate, ref);
    assert.equal(required, '80.00');

    // Fully saved item -> '0.00'
    assert.equal(calcMonthlyRequired(320, 320, item.targetDate, ref), '0.00');
  });

  test('calculates timeline in months given user custom contribution rate', () => {
    const calcMonthsForCustomRate = (price: number, saved: number, customRate: number): number => {
      const remaining = Math.max(0, price - saved);
      if (remaining <= 0) return 0;
      const safeRate = Math.max(1, customRate);
      return Math.ceil(remaining / safeRate);
    };

    // $160 remaining at $50/month -> 4 months (3.2 rounded up)
    assert.equal(calcMonthsForCustomRate(320, 160, 50), 4);

    // $160 remaining at $80/month -> 2 months
    assert.equal(calcMonthsForCustomRate(320, 160, 80), 2);

    // $0 remaining -> 0 months
    assert.equal(calcMonthsForCustomRate(320, 320, 50), 0);
  });

  test('handles status lifecycle transitions (planning, saving, completed)', () => {
    const transitionStatus = (plan: WishlistItem, newStatus: PurchaseStatus): WishlistItem => {
      return {
        ...plan,
        status: newStatus,
        savedAmount: newStatus === 'completed' ? plan.targetPrice : plan.savedAmount
      };
    };

    // Mark completed -> sets status to completed and savedAmount to targetPrice
    const completed = transitionStatus(item, 'completed');
    assert.equal(completed.status, 'completed');
    assert.equal(completed.savedAmount, 320);

    // Reopen plan -> sets status back to saving
    const reopened = transitionStatus(completed, 'saving');
    assert.equal(reopened.status, 'saving');
  });

  test('aggregates total wishlist commitment and funding gap', () => {
    const list: WishlistItem[] = [
      { id: '1', title: 'A', targetPrice: 300, savedAmount: 100, targetDate: '2026-12-01', priority: 'high', category: 'Tech', status: 'saving' },
      { id: '2', title: 'B', targetPrice: 150, savedAmount: 50, targetDate: '2027-01-01', priority: 'medium', category: 'Dorm', status: 'saving' },
      { id: '3', title: 'C', targetPrice: 50, savedAmount: 50, targetDate: '2026-11-01', priority: 'low', category: 'Books', status: 'completed' }
    ];

    const totalTarget = list.reduce((s, i) => s + i.targetPrice, 0);
    const totalSaved = list.reduce((s, i) => s + i.savedAmount, 0);
    const totalGap = Math.max(0, totalTarget - totalSaved);

    assert.equal(totalTarget, 500);
    assert.equal(totalSaved, 200);
    assert.equal(totalGap, 300);
  });
});
