import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Wallet } from '@/types';
import { saveUserWallets } from '@/services/walletService';
import { useAuthStore } from '@/store/useAuthStore';

const syncToFirebase = (wallets: Wallet[]) => {
  const user = useAuthStore.getState().user;
  if (user) {
    saveUserWallets(user.uid, wallets);
  }
};

export interface CreditCardAlert {
  wallet: Wallet;
  daysUntilDue: number;
  outstandingBalance: number;
  urgency: 'warning' | 'urgent' | 'overdue';
}

interface WalletState {
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  setMainWallet: (id: string) => void;
  getMainWallet: () => Wallet;
  setWallets: (wallets: Wallet[]) => void;
  getCreditCardWallets: () => Wallet[];
  getNonCreditCardWallets: () => Wallet[];
}

const defaultWallets: Wallet[] = [
  {
    id: 'wallet-main',
    name: 'เงินสด',
    balance: 0,
    color: 'bg-emerald-500',
    icon: 'Wallet',
    type: 'cash',
    isMain: true
  },
  {
    id: 'wallet-bank',
    name: 'บัญชีธนาคาร',
    balance: 0,
    color: 'bg-blue-500',
    icon: 'Landmark',
    type: 'bank',
    isMain: false
  }
];

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: defaultWallets,
      addWallet: (wallet) => 
        set((state) => {
          const newWallet = { ...wallet, id: crypto.randomUUID() };
          // If this is the first wallet or set to main, ensure others are not main
          let updatedWallets = [...state.wallets];
          if (newWallet.isMain || state.wallets.length === 0) {
            newWallet.isMain = true;
            updatedWallets = updatedWallets.map(w => ({ ...w, isMain: false }));
          }
          const finalWallets = [...updatedWallets, newWallet];
          syncToFirebase(finalWallets);
          return { wallets: finalWallets };
        }),
      updateWallet: (id, updates) =>
        set((state) => {
          let updatedWallets = state.wallets.map((w) => 
            w.id === id ? { ...w, ...updates } : w
          );
          
          if (updates.isMain) {
            updatedWallets = updatedWallets.map(w => ({
              ...w,
              isMain: w.id === id
            }));
          }
          
          syncToFirebase(updatedWallets);
          return { wallets: updatedWallets };
        }),
      deleteWallet: (id) =>
        set((state) => {
          const filtered = state.wallets.filter((w) => w.id !== id);
          // If we deleted the main wallet, assign main to the first available
          if (state.wallets.find(w => w.id === id)?.isMain && filtered.length > 0) {
            filtered[0].isMain = true;
          }
          syncToFirebase(filtered);
          return { wallets: filtered };
        }),
      setMainWallet: (id) => 
        set((state) => {
          const updated = state.wallets.map((w) => ({
            ...w,
            isMain: w.id === id
          }));
          syncToFirebase(updated);
          return { wallets: updated };
        }),
      getMainWallet: () => {
        const state = get();
        return state.wallets.find(w => w.isMain) || state.wallets[0] || defaultWallets[0];
      },
      setWallets: (wallets) => set({ wallets }),
      getCreditCardWallets: () => {
        return get().wallets.filter(w => w.type === 'credit_card');
      },
      getNonCreditCardWallets: () => {
        return get().wallets.filter(w => w.type !== 'credit_card');
      },
    }),
    {
      name: 'paysave-wallet-storage',
    }
  )
);

