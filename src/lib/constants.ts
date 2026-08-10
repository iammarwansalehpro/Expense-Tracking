import type { Category } from '@/types';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'อาหาร', icon: 'UtensilsCrossed', color: '#f97316', type: 'expense' },
  { id: 'transport', name: 'เดินทาง', icon: 'Car', color: '#3b82f6', type: 'expense' },
  { id: 'shopping', name: 'ช้อปปิ้ง', icon: 'ShoppingBag', color: '#ec4899', type: 'expense' },
  { id: 'health', name: 'สุขภาพ', icon: 'Heart', color: '#ef4444', type: 'expense' },
  { id: 'entertainment', name: 'บันเทิง', icon: 'Gamepad2', color: '#8b5cf6', type: 'expense' },
  { id: 'bills', name: 'ค่าบริการ', icon: 'Receipt', color: '#06b6d4', type: 'expense' },
  { id: 'education', name: 'การศึกษา', icon: 'GraduationCap', color: '#14b8a6', type: 'expense' },
  { id: 'other_expense', name: 'อื่นๆ', icon: 'MoreHorizontal', color: '#6b7280', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'เงินเดือน', icon: 'Banknote', color: '#10b981', type: 'income' },
  { id: 'bonus', name: 'โบนัส', icon: 'Gift', color: '#f59e0b', type: 'income' },
  { id: 'freelance', name: 'ฟรีแลนซ์', icon: 'Laptop', color: '#6366f1', type: 'income' },
  { id: 'investment', name: 'การลงทุน', icon: 'TrendingUp', color: '#22c55e', type: 'income' },
  { id: 'other_income', name: 'รายรับอื่นๆ', icon: 'Plus', color: '#64748b', type: 'income' },
];

export const ALL_CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.id === id);
}

export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.2';
