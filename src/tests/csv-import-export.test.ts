import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseTransactionsCsv, CSV_TEMPLATE } from '../utils/csv';

describe('CSV Parsing, Validation & Edge Cases', () => {
  test('parses the default CSV_TEMPLATE with zero errors and valid rows', () => {
    const result = parseTransactionsCsv(CSV_TEMPLATE);

    assert.equal(result.errors.length, 0);
    assert.equal(result.validRows.length, 3);

    // Row 1: Calculus Textbook
    assert.equal(result.validRows[0].title, 'Calculus Textbook');
    assert.equal(result.validRows[0].amount, 65.00);
    assert.equal(result.validRows[0].type, 'expense');
    assert.equal(result.validRows[0].category, 'Academics & Books');

    // Row 2: Peer Tutoring (Income)
    assert.equal(result.validRows[1].title, 'Peer Tutoring');
    assert.equal(result.validRows[1].amount, 45.00);
    assert.equal(result.validRows[1].type, 'income');
    assert.equal(result.validRows[1].category, 'Part-Time Job');
  });

  test('strips currency symbols ($, ₹, €, £) and spaces from amounts', () => {
    const csv = `Title,Amount,Type
Dorm Rent,$350.00,expense
Stipend,₹12000,income
Books,€45.50,expense
Bus Pass,£20.00,expense`;

    const result = parseTransactionsCsv(csv);
    assert.equal(result.errors.length, 0);
    assert.equal(result.validRows.length, 4);

    assert.equal(result.validRows[0].amount, 350.00);
    assert.equal(result.validRows[1].amount, 12000);
    assert.equal(result.validRows[2].amount, 45.50);
    assert.equal(result.validRows[3].amount, 20.00);
  });

  test('correctly handles quoted fields containing commas', () => {
    const csv = `Title,Amount,Type,Category,Notes
"Coffee, Donut & Water",8.50,expense,Food & Dining,"Bought at library, split with Joe"`;

    const result = parseTransactionsCsv(csv);
    assert.equal(result.errors.length, 0);
    assert.equal(result.validRows.length, 1);
    assert.equal(result.validRows[0].title, 'Coffee, Donut & Water');
    assert.equal(result.validRows[0].notes, 'Bought at library, split with Joe');
  });

  test('rejects rows with invalid, negative, or zero amounts', () => {
    const csv = `Title,Amount,Type
Valid Item,25.00,expense
Negative Item,-50.00,expense
Zero Item,0.00,expense
Text Amount,abc,expense`;

    const result = parseTransactionsCsv(csv);
    assert.equal(result.validRows.length, 1);
    assert.equal(result.validRows[0].title, 'Valid Item');
    assert.equal(result.errors.length, 3);
  });

  test('rejects rows with missing or blank titles', () => {
    const csv = `Title,Amount,Type
,25.00,expense
"   ",35.00,expense
Valid Title,45.00,expense`;

    const result = parseTransactionsCsv(csv);
    assert.equal(result.validRows.length, 1);
    assert.equal(result.validRows[0].title, 'Valid Title');
    assert.equal(result.errors.length, 2);
  });

  test('returns error when required headers (Title or Amount) are missing', () => {
    const invalidHeaderCsv = `Description,Cost,Type
Lunch,12.00,expense`;

    // Note: 'Description' contains 'desc' which matches titleIdx, but 'Cost' matches amountIdx.
    // Let's test with completely arbitrary headers:
    const arbitraryCsv = `Foo,Bar,Baz
1,2,3`;

    const result = parseTransactionsCsv(arbitraryCsv);
    assert.equal(result.validRows.length, 0);
    assert.ok(result.errors[0].includes('Missing required columns'));
  });

  test('handles empty CSV input gracefully', () => {
    assert.equal(parseTransactionsCsv('').errors.length, 1);
    assert.equal(parseTransactionsCsv('   \n\n  ').errors.length, 1);
  });

  test('maps case-insensitive and partial types (credit -> income, debit -> expense)', () => {
    const csv = `Title,Amount,Type
Gig Pay,100,credit
Groceries,40,debit
Allowance,150,income`;

    const result = parseTransactionsCsv(csv);
    assert.equal(result.validRows.length, 3);
    assert.equal(result.validRows[0].type, 'income');
    assert.equal(result.validRows[1].type, 'expense');
    assert.equal(result.validRows[2].type, 'income');
  });
});
