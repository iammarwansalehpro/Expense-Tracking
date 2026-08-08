import { 
  ref, 
  push, 
  set,
  query, 
  orderByChild, 
  equalTo, 
  onValue, 
  remove, 
  serverTimestamp,
  get,
  child
} from 'firebase/database';
import { db } from '@/lib/firebase';
import { CATEGORY_SEED, type DBCategory } from '@/utils/categoryStyles';
import type { Transaction } from '@/types';

const TRANSACTIONS_PATH = 'transactions';

// Add a transaction for a specific user
export const addTransaction = async (
  userId: string, 
  transaction: Omit<Transaction, 'id'>
) => {
  try {
    const newTxRef = push(ref(db, TRANSACTIONS_PATH));
    await set(newTxRef, {
      ...transaction,
      userId,
      createdAt: serverTimestamp()
    });
    return newTxRef.key;
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (id: string) => {
  try {
    await remove(ref(db, `${TRANSACTIONS_PATH}/${id}`));
  } catch (error) {
    console.error("Error deleting transaction: ", error);
    throw error;
  }
};

// Update a transaction
export const updateTransaction = async (
  id: string,
  transactionUpdates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
) => {
  try {
    // We only update the specific fields provided
    const txRef = ref(db, `${TRANSACTIONS_PATH}/${id}`);
    const snapshot = await get(txRef);
    if (snapshot.exists()) {
      await set(txRef, {
        ...snapshot.val(),
        ...transactionUpdates,
        updatedAt: serverTimestamp() // Add an updatedAt timestamp if desired
      });
    }
  } catch (error) {
    console.error("Error updating transaction: ", error);
    throw error;
  }
};

// Subscribe to real-time updates for a specific user
export const subscribeToTransactions = (
  userId: string, 
  onUpdate: (transactions: Transaction[]) => void
) => {
  const transactionsQuery = query(
    ref(db, TRANSACTIONS_PATH),
    orderByChild('userId'),
    equalTo(userId)
  );

  return onValue(transactionsQuery, (snapshot) => {
    const transactions: Transaction[] = [];
    snapshot.forEach((childSnapshot) => {
      transactions.push({
        id: childSnapshot.key as string,
        ...childSnapshot.val()
      });
    });
    
    // Sort descending locally since RTDB query orderByChild doesn't easily chain with orderBy('createdAt')
    transactions.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    
    onUpdate(transactions);
  });
};

// Fetch categories from RTDB
export const fetchCategories = async (): Promise<Record<string, DBCategory>> => {
  try {
    const snapshot = await get(child(ref(db), 'app_categories'));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    
    // Seed DB if it's completely empty
    await set(ref(db, 'app_categories'), CATEGORY_SEED);
    return CATEGORY_SEED;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return CATEGORY_SEED; // fallback
  }
};

// Fetch API Keys from RTDB
export const getApiKeys = async (): Promise<string[]> => {
  try {
    const snapshot = await get(ref(db, 'settings/geminiApiKey'));
    const keysStr = snapshot.val();
    if (typeof keysStr === 'string' && keysStr.trim() !== '') {
      return keysStr.split(',').map(k => k.trim()).filter(k => k !== '');
    }
    return [];
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return [];
  }
};

// Set API Keys in RTDB
export const setApiKeys = async (keys: string[]): Promise<void> => {
  try {
    const keysStr = keys.filter(k => k.trim() !== '').join(',');
    await set(ref(db, 'settings/geminiApiKey'), keysStr);
  } catch (error) {
    console.error("Error saving API keys:", error);
    throw error;
  }
};

// Fetch User Favorite Categories
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    // Fetch global defaults first
    let defaultFavs = ['อาหาร', 'เดินทาง', 'ซื้อของ', 'โอนเงิน'];
    try {
      const globalSnap = await get(ref(db, 'settings/defaultFavorites'));
      if (globalSnap.exists()) {
        defaultFavs = globalSnap.val();
      }
    } catch(e) {}

    const snapshot = await get(ref(db, `users/${userId}/favoriteCategories`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data && data.updated) {
        return data.list || [];
      }
      // Handle legacy array format
      return Array.isArray(data) ? data : defaultFavs;
    }
    return defaultFavs;
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return ['อาหาร', 'เดินทาง', 'ซื้อของ', 'โอนเงิน'];
  }
};

// Set User Favorite Categories
export const setUserFavorites = async (userId: string, favorites: string[]): Promise<void> => {
  try {
    await set(ref(db, `users/${userId}/favoriteCategories`), {
      list: favorites,
      updated: true
    });
  } catch (error) {
    console.error("Error saving user favorites:", error);
  }
};

// Fetch App Info
export const getAppInfo = async (): Promise<{ name: string, subtitle: string, icon?: string }> => {
  try {
    const snapshot = await get(ref(db, 'settings/appInfo'));
    return snapshot.val() || { name: 'PaySave', subtitle: 'Smart Financial Assistant', icon: 'Type' };
  } catch (error) {
    return { name: 'PaySave', subtitle: 'Smart Financial Assistant', icon: 'Type' };
  }
};
