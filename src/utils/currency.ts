import { Currency } from '../types';

export const CURRENCY_RATES_FROM_INR: Record<Currency, number> = {
  '₹': 1,
  '$': 1 / 84.00,   // 1 USD = 84.00 INR
  '€': 1 / 91.50,   // 1 EUR = 91.50 INR
  '£': 1 / 108.00   // 1 GBP = 108.00 INR
};

export const EXCHANGE_RATE_DESCRIPTIONS: Record<Currency, string> = {
  '₹': 'Primary Student Base Currency (INR)',
  '$': 'Converted at 1 USD = ₹84.00 INR',
  '€': 'Converted at 1 EUR = ₹91.50 INR',
  '£': 'Converted at 1 GBP = ₹108.00 INR'
};

/**
 * Converts a base INR amount to the selected currency.
 */
export const convertFromBase = (amountInINR: number, targetCurrency: Currency): number => {
  const rate = CURRENCY_RATES_FROM_INR[targetCurrency] || 1;
  return amountInINR * rate;
};

/**
 * Converts an entered amount in the current currency back into base INR.
 */
export const convertToBase = (amountInTargetCurrency: number, sourceCurrency: Currency): number => {
  const rate = CURRENCY_RATES_FROM_INR[sourceCurrency] || 1;
  return amountInTargetCurrency / rate;
};

/**
 * Formats an amount with correct locale formatting (Indian English format for INR).
 */
export const formatCurrency = (amountInINR: number, currency: Currency, decimals = 2): string => {
  const converted = convertFromBase(amountInINR, currency);
  
  try {
    if (currency === '₹') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(converted);
    } else if (currency === '$') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(converted);
    } else if (currency === '€') {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(converted);
    } else if (currency === '£') {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(converted);
    }
  } catch (e) {
    // Fallback if Intl fails
  }

  return `${currency}${converted.toFixed(decimals)}`;
};
