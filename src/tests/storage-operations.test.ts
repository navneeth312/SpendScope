import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { 
  getStoredTransactions, 
  saveTransactions, 
  getStoredBudgets, 
  saveBudgets, 
  getStoredGoals, 
  saveGoals, 
  getStoredSubscriptions, 
  saveSubscriptions, 
  getStoredWishlist, 
  saveWishlist, 
  getStoredLanguage, 
  saveLanguage, 
  getStoredCurrency, 
  saveCurrency, 
  getStoredTheme, 
  saveTheme,
  resetAllToDemo,
  clearAllUserData
} from '../utils/storage';
import { initialTransactions } from '../utils/sampleData';

describe('Local Storage Persistence & State Restoration', () => {
  // In-memory mock localStorage for deterministic node environment tests
  const storageMap = new Map<string, string>();
  const mockLocalStorage = {
    getItem: (key: string) => storageMap.get(key) ?? null,
    setItem: (key: string, val: string) => storageMap.set(key, val),
    removeItem: (key: string) => storageMap.delete(key),
    clear: () => storageMap.clear()
  };

  beforeEach(() => {
    storageMap.clear();
    // Assign globalThis.localStorage for test suite
    (globalThis as any).localStorage = mockLocalStorage;
  });

  test('falls back to default demo transactions when storage is empty', () => {
    const data = getStoredTransactions();
    assert.equal(data.length, initialTransactions.length);
    assert.equal(data[0].id, initialTransactions[0].id);
  });

  test('saves and retrieves transactions accurately', () => {
    const customTx = [
      { id: 'custom-1', title: 'Freelance Design', amount: 120, type: 'income' as const, category: 'Part-Time Job' as const, date: '2026-10-10', paymentMethod: 'UPI / Cash' as const }
    ];

    saveTransactions(customTx);
    const loaded = getStoredTransactions();

    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].title, 'Freelance Design');
    assert.equal(loaded[0].amount, 120);
  });

  test('resiliently handles corrupted JSON in localStorage without throwing', () => {
    mockLocalStorage.setItem('spendscope_transactions_v1', 'INVALID_JSON_CORRUPT{{{');

    // Should catch error and return initialTransactions safely
    const data = getStoredTransactions();
    assert.ok(data.length > 0);
    assert.equal(data[0].id, initialTransactions[0].id);
  });

  test('saves and retrieves language, currency, and theme settings', () => {
    // Language
    assert.equal(getStoredLanguage(), 'en'); // default
    saveLanguage('te');
    assert.equal(getStoredLanguage(), 'te');

    // Currency
    assert.equal(getStoredCurrency(), '$'); // default
    saveCurrency('₹');
    assert.equal(getStoredCurrency(), '₹');
    saveCurrency('€');
    assert.equal(getStoredCurrency(), '€');

    // Theme
    assert.equal(getStoredTheme(), 'dark'); // default
    saveTheme('light');
    assert.equal(getStoredTheme(), 'light');
  });

  test('resets all data back to demo dataset', () => {
    // First clear or mutate
    saveTransactions([]);
    saveGoals([]);
    assert.equal(getStoredTransactions().length, 0);

    // Call resetAllToDemo
    resetAllToDemo();

    const restoredTx = getStoredTransactions();
    const restoredBudgets = getStoredBudgets();
    const restoredGoals = getStoredGoals();

    assert.ok(restoredTx.length > 0);
    assert.ok(restoredBudgets.length > 0);
    assert.ok(restoredGoals.length > 0);
  });

  test('clears all user records to empty arrays', () => {
    clearAllUserData();

    assert.equal(getStoredTransactions().length, 0);
    assert.equal(getStoredGoals().length, 0);
    assert.equal(getStoredSubscriptions().length, 0);
    assert.equal(getStoredWishlist().length, 0);
  });
});
