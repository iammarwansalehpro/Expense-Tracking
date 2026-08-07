import { create } from 'zustand';
import type { Transaction } from '@/types';
import { subscribeToTransactions } from '@/services/transactionService';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  unsubscribeSync: (() => void) | null;
  setTransactions: (t: Transaction[]) => void;
  initSync: (userId: string) => void;
  stopSync: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: true,
  unsubscribeSync: null,
  
  setTransactions: (transactions) => set({ transactions, loading: false }),
  
  initSync: (userId) => {
    // If already syncing, don't start again
    if (get().unsubscribeSync) return;
    
    set({ loading: true });
    
    const unsubscribe = subscribeToTransactions(userId, (data) => {
      set({ transactions: data, loading: false });
    });
    
    set({ unsubscribeSync: unsubscribe });
  },

  stopSync: () => {
    const { unsubscribeSync } = get();
    if (unsubscribeSync) {
      unsubscribeSync();
    }
    set({ unsubscribeSync: null, transactions: [] });
  }
}));
