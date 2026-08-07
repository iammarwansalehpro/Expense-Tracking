export type TransactionType = 'income' | 'expense';
export type TransactionCategory = string;

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  color: string;
  icon: string;
  isMain?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  title: string;
  date: string;
  time: string;
  note?: string;
  bank?: string;
  iconBgColor?: string; // e.g. 'bg-blue-100'
  walletId?: string; // Links transaction to a specific wallet
}

export type Theme = 'light' | 'dark' | 'system';
export type PageId = 'home' | 'overview' | 'add' | 'expenses' | 'statistics' | 'settings';
