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

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  title: string;
  date: string;
  time: string;
  note?: string;
  iconBgColor?: string; // e.g. 'bg-blue-100'
  walletId?: string; // Links transaction to a specific wallet
}

export type Theme = 'light' | 'dark' | 'system';
export type PageId = 'home' | 'overview' | 'add' | 'expenses' | 'statistics' | 'settings';
