export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionCategory = string;
export type WalletType = 'cash' | 'bank' | 'credit_card';

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  color: string;
  icon: string;
  type: WalletType;
  isMain?: boolean;
  // Credit card / Installment specific fields
  creditLimit?: number;
  installmentCreditLimit?: number; // วงเงินสินเชื่อ (สำหรับผ่อนชำระ)
  dueDay?: number;       // 1-31
  statementDay?: number;  // 1-31
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
  // Transfer specific fields
  fromWalletId?: string;
  toWalletId?: string;
  linkedTransactionId?: string;

  // Installment specific fields (for credit card expense transactions)
  isInstallment?: boolean;
  installmentMonths?: number;
  installmentPaidMonths?: number;
  installmentInterestRate?: number; // ดอกเบี้ย % ต่อเดือน (Flat Rate)
}

export type Theme = 'light' | 'dark' | 'system';
export type PageId = 'home' | 'overview' | 'add' | 'expenses' | 'statistics' | 'settings';
