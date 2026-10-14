import assert from 'assert';
import { CURRENCY_RATES_FROM_INR, convertFromBase, convertToBase, formatCurrency } from '../src/utils/currency.ts';
import { parseTransactionsCsv } from '../src/utils/csv.ts';
import { initialTransactions, initialBudgets, initialSavingsGoals, initialSubscriptions, initialWishlist } from '../src/utils/sampleData.ts';

console.log('--- Running Financial Calculations & Robustness QA ---');

// 1. Verify Sample Data Totals
const totalIncome = initialTransactions
  .filter(t => t.type === 'income')
  .reduce((sum, t) => sum + t.amount, 0);

const totalExpense = initialTransactions
  .filter(t => t.type === 'expense')
  .reduce((sum, t) => sum + t.amount, 0);

const netBalance = totalIncome - totalExpense;

console.log(`Initial Income: ₹${totalIncome}`);
console.log(`Initial Expense: ₹${totalExpense}`);
console.log(`Initial Net: ₹${netBalance}`);

assert.strictEqual(totalIncome, 6500 + 12000 + 1800, 'Income must match sample rows');
assert.strictEqual(totalExpense, 5500 + 1200 + 3000 + 1450 + 550 + 240 + 380 + 650, 'Expense must match sample rows');
assert.strictEqual(netBalance, totalIncome - totalExpense, 'Net balance must equal Income - Expense');

// 2. Verify Currency Conversion
const inrAmount = 8400;
const usdAmount = convertFromBase(inrAmount, '$');
assert.strictEqual(Math.round(usdAmount), 100, '₹8,400 should equal $100 at 84 rate');

const reconvertedInr = convertToBase(usdAmount, '$');
assert.strictEqual(Math.round(reconvertedInr), inrAmount, 'Reconverting $100 should return ₹8,400');

console.log('✓ Currency round-trip conversion accurate.');

// 3. Verify Budget Calculations
const foodBudget = initialBudgets.find(b => b.category === 'Food & Dining');
assert(foodBudget, 'Food & Dining budget must exist');
const foodSpent = initialTransactions
  .filter(t => t.category === 'Food & Dining' && t.type === 'expense')
  .reduce((s, t) => s + t.amount, 0);
assert.strictEqual(foodSpent, 3000 + 240, 'Food spent should equal mess + cafe = 3240');
const foodRemaining = foodBudget.monthlyLimit - foodSpent;
assert.strictEqual(foodRemaining, 3500 - 3240, 'Remaining budget must be 260');

console.log('✓ Budget utilization math verified.');

// 4. Verify Subscriptions Monthly Commitment
const activeSubs = initialSubscriptions.filter(s => s.active);
const monthlyCommitment = activeSubs.reduce((sum, s) => {
  if (s.billingCycle === 'monthly') return sum + s.amount;
  if (s.billingCycle === 'yearly') return sum + s.amount / 12;
  if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
  return sum + s.amount;
}, 0);

// Active: Spotify (59) + Prime (125) + ChatGPT (850) + Gym (600) + Copilot (0) = 1634
assert.strictEqual(monthlyCommitment, 59 + 125 + 850 + 600 + 0, 'Monthly commitment must be 1634');
console.log('✓ Recurring subscription commitment calculation verified.');

// 5. Verify CSV Parser & Error Handling
const goodCsv = `Title,Amount,Type,Category,Date,PaymentMethod,Notes
Test Item,500.00,expense,Food & Dining,2026-10-14,UPI / Cash,Good
Tutor,1000.00,income,Part-Time Job,2026-10-14,Bank Transfer,Tutoring`;

const parsed = parseTransactionsCsv(goodCsv);
assert.strictEqual(parsed.validRows.length, 2, 'Should parse 2 valid rows');
assert.strictEqual(parsed.errors.length, 0, 'Should have 0 errors for valid CSV');

const badCsv = `Title,Amount
Bad Row,-20
,50`;
const parsedBad = parseTransactionsCsv(badCsv);
assert.strictEqual(parsedBad.validRows.length, 0, 'Should reject invalid amounts and missing titles');
assert(parsedBad.errors.length >= 2, 'Should report errors for bad rows');

console.log('✓ CSV parser and error handling validated.');
console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
