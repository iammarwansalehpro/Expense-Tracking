import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  isLeaving?: boolean;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 3500);
  },
  showToast: (message, type = 'info') => {
    get().addToast(message, type);
  },
  removeToast: (id) => {
    // Mark as leaving for animation
    set((state) => ({
      toasts: state.toasts.map(t => t.id === id ? { ...t, isLeaving: true } : t)
    }));
    
    // Actually remove after animation duration (300ms)
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 300);
  }
}));
