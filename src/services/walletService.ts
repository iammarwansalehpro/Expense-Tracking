import { ref, get, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import type { Wallet } from '@/types';

export const getUserWallets = async (userId: string): Promise<Wallet[] | null> => {
  try {
    const snapshot = await get(ref(db, `users/${userId}/wallets`));
    if (snapshot.exists()) {
      return snapshot.val() as Wallet[];
    }
    return null;
  } catch (error) {
    console.error("Error fetching user wallets:", error);
    return null;
  }
};

export const saveUserWallets = async (userId: string, wallets: Wallet[]): Promise<void> => {
  try {
    await set(ref(db, `users/${userId}/wallets`), wallets);
  } catch (error) {
    console.error("Error saving user wallets:", error);
  }
};
