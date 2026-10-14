import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Subscription } from '../types';

describe('Recurring Subscriptions & Renewal Countdown', () => {
  const subscriptions: Subscription[] = [
    { id: 'sub-1', name: 'Spotify Student', amount: 5.99, billingCycle: 'monthly', nextRenewalDate: '2026-10-17', category: 'Entertainment', active: true },
    { id: 'sub-2', name: 'GitHub Copilot', amount: 100.00, billingCycle: 'yearly', nextRenewalDate: '2027-08-30', category: 'Tech & Software', active: true },
    { id: 'sub-3', name: 'Cloud Storage', amount: 9.00, billingCycle: 'quarterly', nextRenewalDate: '2026-11-15', category: 'Tech & Software', active: true },
    { id: 'sub-4', name: 'Gym Pass (Paused)', amount: 20.00, billingCycle: 'monthly', nextRenewalDate: '2026-10-25', category: 'Health', active: false }
  ];

  test('calculates monthly equivalent cost across all billing frequencies', () => {
    const getMonthlyEquivalent = (sub: Subscription): number => {
      if (sub.billingCycle === 'monthly') return sub.amount;
      if (sub.billingCycle === 'yearly') return sub.amount / 12;
      if (sub.billingCycle === 'quarterly') return sub.amount / 3;
      return sub.amount;
    };

    // Monthly: 5.99
    assert.equal(getMonthlyEquivalent(subscriptions[0]), 5.99);

    // Yearly: 100 / 12 = 8.333...
    assert.equal(Math.round(getMonthlyEquivalent(subscriptions[1]) * 100) / 100, 8.33);

    // Quarterly: 9 / 3 = 3.00
    assert.equal(getMonthlyEquivalent(subscriptions[2]), 3.00);
  });

  test('calculates total monthly commitment excluding paused subscriptions', () => {
    const calcTotalMonthly = (subs: Subscription[]): number => {
      return subs
        .filter(s => s.active)
        .reduce((sum, s) => {
          if (s.billingCycle === 'monthly') return sum + s.amount;
          if (s.billingCycle === 'yearly') return sum + s.amount / 12;
          if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
          return sum + s.amount;
        }, 0);
    };

    const totalMonthly = calcTotalMonthly(subscriptions);
    // 5.99 + (100/12) + 3.00 = 5.99 + 8.3333... + 3 = 17.3233...
    const rounded = Math.round(totalMonthly * 100) / 100;
    assert.equal(rounded, 17.32);

    // Annual projected commitment
    const annualProjected = Math.round(totalMonthly * 12 * 100) / 100;
    assert.equal(annualProjected, 207.88);
  });

  test('calculates deterministic countdown to next renewal date', () => {
    const getDaysUntilRenewal = (renewalDateStr: string, refDate: Date): number => {
      const renewal = new Date(renewalDateStr);
      return Math.ceil((renewal.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    const ref = new Date('2026-10-14T00:00:00Z');

    // Due in 3 days: 2026-10-17
    assert.equal(getDaysUntilRenewal('2026-10-17T00:00:00Z', ref), 3);

    // Due today: 2026-10-14
    assert.equal(getDaysUntilRenewal('2026-10-14T00:00:00Z', ref), 0);

    // Overdue by 2 days: 2026-10-12
    assert.equal(getDaysUntilRenewal('2026-10-12T00:00:00Z', ref), -2);
  });

  test('toggles active and paused subscription state', () => {
    const toggleSub = (subs: Subscription[], id: string): Subscription[] => {
      return subs.map(s => s.id === id ? { ...s, active: !s.active } : s);
    };

    // Toggle sub-4 from false to true
    const activated = toggleSub(subscriptions, 'sub-4');
    assert.equal(activated.find(s => s.id === 'sub-4')?.active, true);

    // Toggle sub-1 from true to false
    const paused = toggleSub(subscriptions, 'sub-1');
    assert.equal(paused.find(s => s.id === 'sub-1')?.active, false);
  });
});
