import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SavingsGoal, Transaction } from '../types';

describe('Savings Goals & Contribution Logic', () => {
  const goal: SavingsGoal = {
    id: 'goal-1',
    title: 'Emergency Student Cushion',
    targetAmount: 500,
    currentAmount: 375,
    targetDate: '2026-12-31',
    category: 'Emergency',
    color: '#10b981'
  };

  test('calculates percentage progress and clamps to 100%', () => {
    const calcProgress = (current: number, target: number): number => {
      if (target <= 0) return 0;
      return Math.min(100, Math.round((current / target) * 100));
    };

    // 375 / 500 = 75%
    assert.equal(calcProgress(goal.currentAmount, goal.targetAmount), 75);

    // Exact match: 500 / 500 = 100%
    assert.equal(calcProgress(500, 500), 100);

    // Overfunded: 600 / 500 = clamped to 100%
    assert.equal(calcProgress(600, 500), 100);

    // Zero saved: 0 / 500 = 0%
    assert.equal(calcProgress(0, 500), 0);

    // Zero target: protected from division by zero
    assert.equal(calcProgress(100, 0), 0);
  });

  test('calculates remaining amount needed towards goal', () => {
    const getRemaining = (target: number, current: number): number => {
      return Math.max(0, target - current);
    };

    assert.equal(getRemaining(500, 375), 125);
    assert.equal(getRemaining(500, 500), 0);
    assert.equal(getRemaining(500, 600), 0); // never returns negative
  });

  test('identifies achieved milestones', () => {
    const isAchieved = (target: number, current: number): boolean => current >= target;

    assert.equal(isAchieved(500, 375), false);
    assert.equal(isAchieved(500, 500), true);
    assert.equal(isAchieved(500, 501), true);
  });

  test('processes deposits and withdrawals with bounds protection', () => {
    const adjustFunds = (current: number, delta: number): { newAmount: number; error?: string } => {
      if (delta < 0 && Math.abs(delta) > current) {
        return { newAmount: current, error: 'Cannot withdraw more than current savings' };
      }
      const newAmount = Math.max(0, Math.round((current + delta) * 100) / 100);
      return { newAmount };
    };

    // Deposit $50
    const depRes = adjustFunds(375, 50);
    assert.equal(depRes.newAmount, 425);
    assert.equal(depRes.error, undefined);

    // Valid withdrawal $100
    const withRes = adjustFunds(375, -100);
    assert.equal(withRes.newAmount, 275);
    assert.equal(withRes.error, undefined);

    // Invalid excessive withdrawal $400 from $375
    const excessiveRes = adjustFunds(375, -400);
    assert.equal(excessiveRes.newAmount, 375);
    assert.ok(excessiveRes.error?.includes('Cannot withdraw more'));
  });

  test('generates synchronized ledger transaction when recording transfers', () => {
    const createTransferTransaction = (
      goalTitle: string,
      delta: number,
      date = '2026-10-14'
    ): Transaction => {
      const isDeposit = delta > 0;
      const absAmount = Math.abs(delta);
      return {
        id: 'tx-goal-test',
        title: isDeposit ? `Goal Deposit: ${goalTitle}` : `Goal Withdrawal: ${goalTitle}`,
        amount: absAmount,
        type: isDeposit ? 'expense' : 'income',
        category: 'Other',
        date,
        paymentMethod: 'Bank Transfer',
        notes: `Automated goal transfer adjustment (${goalTitle})`
      };
    };

    // Deposit transfer should be recorded as expense (outflow from cash to goal)
    const depositTx = createTransferTransaction('Emergency Cushion', 50);
    assert.equal(depositTx.type, 'expense');
    assert.equal(depositTx.amount, 50);
    assert.ok(depositTx.title.includes('Deposit: Emergency Cushion'));

    // Withdrawal transfer should be recorded as income (inflow from goal to cash)
    const withdrawTx = createTransferTransaction('Emergency Cushion', -75);
    assert.equal(withdrawTx.type, 'income');
    assert.equal(withdrawTx.amount, 75);
    assert.ok(withdrawTx.title.includes('Withdrawal: Emergency Cushion'));
  });

  test('computes deterministic days remaining until target date', () => {
    const getDaysRemaining = (targetDateStr: string, referenceDate: Date): number => {
      const target = new Date(targetDateStr);
      return Math.ceil((target.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    const refDate = new Date('2026-12-01T00:00:00Z');
    // 30 days between Dec 1 and Dec 31
    const days = getDaysRemaining('2026-12-31T00:00:00Z', refDate);
    assert.equal(days, 30);
  });
});
