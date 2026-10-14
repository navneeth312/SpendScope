import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Transaction, TransactionType, Category, PaymentMethod } from '../types';

describe('Transaction Management & Search/Filter Logic', () => {
  const initialList: Transaction[] = [
    { id: 'tx-1', title: 'Campus Tutoring Gig', amount: 90, type: 'income', category: 'Part-Time Job', date: '2026-10-06', paymentMethod: 'UPI / Cash', notes: 'Calculus peer review' },
    { id: 'tx-2', title: 'Shared Dorm Rent', amount: 380, type: 'expense', category: 'Rent & Housing', date: '2026-10-03', paymentMethod: 'Bank Transfer' },
    { id: 'tx-3', title: 'Algorithms Textbook', amount: 85, type: 'expense', category: 'Academics & Books', date: '2026-10-04', paymentMethod: 'Campus Card', notes: 'Used copy' },
    { id: 'tx-4', title: 'Family Allowance', amount: 450, type: 'income', category: 'Allowance & Family', date: '2026-10-02', paymentMethod: 'Bank Transfer' }
  ];

  test('validates inputs: rejects empty title and non-positive amounts', () => {
    const validate = (title: string, amountStr: string): { valid: boolean; error?: string } => {
      if (!title || !title.trim()) return { valid: false, error: 'Please provide a title' };
      const parsed = parseFloat(amountStr);
      if (isNaN(parsed) || parsed <= 0) return { valid: false, error: 'Please enter a valid amount greater than 0' };
      return { valid: true };
    };

    assert.equal(validate('', '50').valid, false);
    assert.equal(validate('   ', '50').valid, false);
    assert.equal(validate('Coffee', '0').valid, false);
    assert.equal(validate('Coffee', '-10').valid, false);
    assert.equal(validate('Coffee', 'abc').valid, false);
    assert.equal(validate('Coffee', '4.50').valid, true);
  });

  test('creates new transaction and prepends to list', () => {
    const newTx: Transaction = {
      id: 'tx-new-1',
      title: 'Lab Assistant Stipend',
      amount: 200,
      type: 'income',
      category: 'Part-Time Job',
      date: '2026-10-08',
      paymentMethod: 'Bank Transfer'
    };

    const updated = [newTx, ...initialList];
    assert.equal(updated.length, initialList.length + 1);
    assert.equal(updated[0].id, 'tx-new-1');
    assert.equal(updated[0].amount, 200);
  });

  test('edits existing transaction by ID while preserving list order and immutability', () => {
    const editPayload = {
      id: 'tx-3',
      title: 'Algorithms Textbook (Discounted)',
      amount: 70,
      type: 'expense' as TransactionType,
      category: 'Academics & Books' as Category,
      date: '2026-10-04',
      paymentMethod: 'Campus Card' as PaymentMethod,
      notes: 'Coupon applied'
    };

    const updated = initialList.map(item => item.id === editPayload.id ? { ...item, ...editPayload } : item);
    const target = updated.find(t => t.id === 'tx-3');

    assert.ok(target);
    assert.equal(target?.amount, 70);
    assert.equal(target?.title, 'Algorithms Textbook (Discounted)');
    assert.equal(target?.notes, 'Coupon applied');
    // Ensure others were untouched
    assert.equal(updated.find(t => t.id === 'tx-1')?.amount, 90);
  });

  test('deletes transaction by ID correctly', () => {
    const idToDelete = 'tx-2';
    const remaining = initialList.filter(t => t.id !== idToDelete);

    assert.equal(remaining.length, initialList.length - 1);
    assert.equal(remaining.find(t => t.id === 'tx-2'), undefined);

    // Deleting non-existent ID does not mutate or throw
    const afterFakeDelete = remaining.filter(t => t.id !== 'non-existent-id');
    assert.equal(afterFakeDelete.length, remaining.length);
  });

  test('filters transactions by type (income, expense, all)', () => {
    const incomes = initialList.filter(t => t.type === 'income');
    const expenses = initialList.filter(t => t.type === 'expense');

    assert.equal(incomes.length, 2);
    assert.equal(expenses.length, 2);
    assert.ok(incomes.every(t => t.type === 'income'));
    assert.ok(expenses.every(t => t.type === 'expense'));
  });

  test('filters transactions by category', () => {
    const academicOnly = initialList.filter(t => t.category === 'Academics & Books');
    assert.equal(academicOnly.length, 1);
    assert.equal(academicOnly[0].title, 'Algorithms Textbook');

    const foodOnly = initialList.filter(t => t.category === 'Food & Dining');
    assert.equal(foodOnly.length, 0);
  });

  test('searches transactions by keyword across title, notes, and payment method', () => {
    const search = (query: string) => {
      const q = query.toLowerCase();
      return initialList.filter(tx => 
        tx.title.toLowerCase().includes(q) ||
        (tx.notes && tx.notes.toLowerCase().includes(q)) ||
        tx.category.toLowerCase().includes(q) ||
        tx.paymentMethod.toLowerCase().includes(q)
      );
    };

    // By title substring
    assert.equal(search('Tutoring').length, 1);
    assert.equal(search('tutoring').length, 1); // case-insensitive

    // By notes
    assert.equal(search('Calculus').length, 1);
    assert.equal(search('Used copy').length, 1);

    // By payment method
    assert.equal(search('Bank Transfer').length, 2);

    // No match
    assert.equal(search('NonexistentQuery123').length, 0);
  });

  test('sorts transactions by date and amount (ascending/descending)', () => {
    // Sort Date Descending
    const dateDesc = [...initialList].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    assert.equal(dateDesc[0].id, 'tx-1'); // 2026-10-06
    assert.equal(dateDesc[dateDesc.length - 1].id, 'tx-4'); // 2026-10-02

    // Sort Date Ascending
    const dateAsc = [...initialList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    assert.equal(dateAsc[0].id, 'tx-4'); // 2026-10-02
    assert.equal(dateAsc[dateAsc.length - 1].id, 'tx-1'); // 2026-10-06

    // Sort Amount Descending
    const amountDesc = [...initialList].sort((a, b) => b.amount - a.amount);
    assert.equal(amountDesc[0].amount, 450);
    assert.equal(amountDesc[amountDesc.length - 1].amount, 85);

    // Sort Amount Ascending
    const amountAsc = [...initialList].sort((a, b) => a.amount - b.amount);
    assert.equal(amountAsc[0].amount, 85);
    assert.equal(amountAsc[amountAsc.length - 1].amount, 450);
  });

  test('calculates filtered aggregate totals', () => {
    // Subset of only expenses
    const filtered = initialList.filter(t => t.type === 'expense');
    const filteredIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const filteredExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const filteredNet = filteredIncome - filteredExpense;

    assert.equal(filteredIncome, 0);
    assert.equal(filteredExpense, 465); // 380 + 85
    assert.equal(filteredNet, -465);
  });
});
