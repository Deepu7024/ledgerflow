import { Category, Source, Transaction } from './types';

// REACT_APP_API_BASE_URL is inlined at build time from frontend/.env.development
// or frontend/.env.production — see those files, and README.md, for how the
// two halves of this app get wired together per environment.
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ?? 'https://your-backend.onrender.com/api';

export const MONTHLY_BUDGET_DEFAULT = 45000;

export const CATEGORIES: Category[] = [
  'Food & Dining',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Groceries',
  'Travel',
  'Health',
  'Business',
  'Personal',
  'Other',
];

export const SOURCES: Source[] = ['SMS', 'Cash', 'PhonePe'];

export const CATEGORY_STYLES: Record<Category, string> = {
  'Food & Dining': 'bg-orange-500/10 text-orange-300 ring-orange-500/25',
  Entertainment: 'bg-fuchsia-500/10 text-fuchsia-300 ring-fuchsia-500/25',
  Shopping: 'bg-sky-500/10 text-sky-300 ring-sky-500/25',
  Utilities: 'bg-amber-500/10 text-amber-300 ring-amber-500/25',
  Groceries: 'bg-lime-500/10 text-lime-300 ring-lime-500/25',
  Travel: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/25',
  Health: 'bg-rose-500/10 text-rose-300 ring-rose-500/25',
  Business: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/25',
  Personal: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
  Other: 'bg-zinc-500/10 text-zinc-300 ring-zinc-500/25',
};

/**
 * Demo/seed data. Used only as a fallback so the dashboard still renders
 * something meaningful when the placeholder API_BASE_URL can't be reached
 * (e.g. during local development, before a real backend is deployed).
 */
export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    merchant: 'Blue Tokai Coffee',
    category: 'Food & Dining',
    amount: 640,
    date: '2026-08-19T09:12:00.000Z',
    source: 'PhonePe',
    isBusiness: false,
    isTransfer: false,
    isSplit: false,
  },
  {
    id: 'tx_2',
    merchant: 'Netflix',
    category: 'Entertainment',
    amount: 649,
    date: '2026-08-18T00:00:00.000Z',
    source: 'SMS',
    isBusiness: false,
    isTransfer: false,
    isSplit: true,
    shareAmount: 325,
  },
  {
    id: 'tx_3',
    merchant: 'AWS',
    category: 'Business',
    amount: 4820,
    date: '2026-08-17T14:30:00.000Z',
    source: 'SMS',
    isBusiness: true,
    isTransfer: false,
    isSplit: false,
  },
  {
    id: 'tx_4',
    merchant: 'Local Kirana Store',
    category: 'Groceries',
    amount: 1120,
    date: '2026-08-17T11:00:00.000Z',
    source: 'Cash',
    isBusiness: false,
    isTransfer: false,
    isSplit: false,
  },
  {
    id: 'tx_5',
    merchant: 'Transfer to Savings',
    category: 'Personal',
    amount: 15000,
    date: '2026-08-16T08:00:00.000Z',
    source: 'PhonePe',
    isBusiness: false,
    isTransfer: true,
    isSplit: false,
  },
  {
    id: 'tx_6',
    merchant: 'Zomato',
    category: 'Food & Dining',
    amount: 480,
    date: '2026-08-15T20:15:00.000Z',
    source: 'SMS',
    isBusiness: false,
    isTransfer: false,
    isSplit: false,
  },
  {
    id: 'tx_7',
    merchant: 'H&M',
    category: 'Shopping',
    amount: 2799,
    date: '2026-08-14T17:45:00.000Z',
    source: 'SMS',
    isBusiness: false,
    isTransfer: false,
    isSplit: false,
  },
  {
    id: 'tx_8',
    merchant: 'Indian Oil Petrol Pump',
    category: 'Travel',
    amount: 1500,
    date: '2026-08-13T07:30:00.000Z',
    source: 'Cash',
    isBusiness: false,
    isTransfer: false,
    isSplit: false,
  },
  {
    id: 'tx_9',
    merchant: 'Notion',
    category: 'Business',
    amount: 799,
    date: '2026-08-12T00:00:00.000Z',
    source: 'SMS',
    isBusiness: true,
    isTransfer: false,
    isSplit: false,
  },
  {
    id: 'tx_10',
    merchant: 'Apollo Pharmacy',
    category: 'Health',
    amount: 340,
    date: '2026-08-11T18:20:00.000Z',
    source: 'PhonePe',
    isBusiness: false,
    isTransfer: false,
    isSplit: false,
  },
  {
    id: 'tx_11',
    merchant: 'BESCOM Electricity',
    category: 'Utilities',
    amount: 2150,
    date: '2026-08-10T00:00:00.000Z',
    source: 'SMS',
    isBusiness: false,
    isTransfer: false,
    isSplit: false,
  },
  {
    id: 'tx_12',
    merchant: 'PVR Cinemas',
    category: 'Entertainment',
    amount: 960,
    date: '2026-08-09T21:00:00.000Z',
    source: 'PhonePe',
    isBusiness: false,
    isTransfer: false,
    isSplit: true,
    shareAmount: 480,
  },
];
