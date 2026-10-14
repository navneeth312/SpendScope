import { Transaction, TransactionType, Category, PaymentMethod } from '../types';

export const CSV_TEMPLATE = `Title,Amount,Type,Category,Date,PaymentMethod,Notes
Calculus Textbook,1200.00,expense,Academics & Books,2026-10-14,Debit Card,Bought used copy from senior
Peer Tutoring,1500.00,income,Part-Time Job,2026-10-14,UPI / Cash,2 hours physics tutoring
Campus Canteen Meal,120.00,expense,Food & Dining,2026-10-14,Campus Card,Lunch after lab`;

export const exportTransactionsToCsv = (transactions: Transaction[], filename = 'spendscope_transactions.csv') => {
  const headers = ['Title', 'Amount', 'Type', 'Category', 'Date', 'PaymentMethod', 'Notes'];
  const rows = transactions.map(t => [
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    t.type,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.date,
    `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export interface ParsedCsvResult {
  validRows: Array<Omit<Transaction, 'id'>>;
  errors: string[];
}

export const parseTransactionsCsv = (csvText: string): ParsedCsvResult => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  const errors: string[] = [];
  const validRows: Array<Omit<Transaction, 'id'>> = [];

  if (lines.length < 2) {
    return { validRows: [], errors: ['CSV file is empty or missing data rows.'] };
  }

  // Parse header
  const headerTokens = parseCsvRow(lines[0]).map(h => h.trim().toLowerCase());
  const titleIdx = headerTokens.findIndex(h => h.includes('title') || h.includes('name') || h.includes('desc'));
  const amountIdx = headerTokens.findIndex(h => h.includes('amount') || h.includes('cost') || h.includes('price'));
  const typeIdx = headerTokens.findIndex(h => h.includes('type'));
  const catIdx = headerTokens.findIndex(h => h.includes('cat'));
  const dateIdx = headerTokens.findIndex(h => h.includes('date'));
  const paymentIdx = headerTokens.findIndex(h => h.includes('pay') || h.includes('method'));
  const notesIdx = headerTokens.findIndex(h => h.includes('note') || h.includes('memo'));

  if (titleIdx === -1 || amountIdx === -1) {
    return { 
      validRows: [], 
      errors: ['Missing required columns: CSV must contain at least "Title" and "Amount" columns.'] 
    };
  }

  const validCategories: Category[] = [
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

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const tokens = parseCsvRow(rawLine);
    if (!tokens || tokens.length === 0 || tokens.every(t => t.trim() === '')) {
      continue;
    }

    const title = (tokens[titleIdx] || '').trim();
    const rawAmount = (tokens[amountIdx] || '').replace(/[$,₹,€,£\s]/g, '');
    const amount = parseFloat(rawAmount);

    if (!title) {
      errors.push(`Row ${i + 1}: Missing title`);
      continue;
    }

    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${i + 1}: Invalid positive amount "${rawAmount}"`);
      continue;
    }

    let type: TransactionType = 'expense';
    if (typeIdx !== -1 && tokens[typeIdx]) {
      const rawType = tokens[typeIdx].trim().toLowerCase();
      if (rawType.includes('in') || rawType === 'credit') {
        type = 'income';
      }
    }

    let category: Category = type === 'income' ? 'Part-Time Job' : 'Food & Dining';
    if (catIdx !== -1 && tokens[catIdx]) {
      const matched = validCategories.find(c => c.toLowerCase() === tokens[catIdx].trim().toLowerCase());
      if (matched) {
        category = matched;
      }
    }

    let date = new Date().toISOString().split('T')[0];
    if (dateIdx !== -1 && tokens[dateIdx]) {
      const parsedDate = new Date(tokens[dateIdx].trim());
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      }
    }

    let paymentMethod: PaymentMethod = 'UPI / Cash';
    if (paymentIdx !== -1 && tokens[paymentIdx]) {
      const pm = tokens[paymentIdx].trim();
      if (['UPI / Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Campus Card'].includes(pm)) {
        paymentMethod = pm as PaymentMethod;
      }
    }

    const notes = notesIdx !== -1 ? (tokens[notesIdx] || '').trim() : '';

    validRows.push({
      title,
      amount,
      type,
      category,
      date,
      paymentMethod,
      notes: notes || undefined,
      isDemo: false
    });
  }

  return { validRows, errors };
};

// Helper to parse a single CSV row taking into account quotes and commas
function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
