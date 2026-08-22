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
  child,
  update
} from 'firebase/database';
import { db } from '@/lib/firebase';
import { 
  CATEGORY_SEED, 
  DEFAULT_EXPENSE_GROUPS, 
  DEFAULT_INCOME_GROUPS, 
  type DBCategory 
} from '@/utils/categoryStyles';
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

// Add a transfer between wallets (creates paired transactions)
export const addTransferTransaction = async (
  userId: string,
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  note?: string
) => {
  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    // Create expense from source wallet
    const fromTxRef = push(ref(db, TRANSACTIONS_PATH));
    const fromTxId = fromTxRef.key!;

    // Create income to destination wallet
    const toTxRef = push(ref(db, TRANSACTIONS_PATH));
    const toTxId = toTxRef.key!;

    await set(fromTxRef, {
      type: 'transfer',
      amount,
      category: 'โอนเงิน',
      title: note || 'โอนเงินข้ามกระเป๋า',
      date: dateStr,
      time: timeStr,
      walletId: fromWalletId,
      fromWalletId,
      toWalletId,
      linkedTransactionId: toTxId,
      iconBgColor: 'bg-[#6366F1]/20 text-[#4F46E5]',
      userId,
      createdAt: serverTimestamp()
    });

    await set(toTxRef, {
      type: 'transfer',
      amount,
      category: 'โอนเงิน',
      title: note || 'โอนเงินข้ามกระเป๋า',
      date: dateStr,
      time: timeStr,
      walletId: toWalletId,
      fromWalletId,
      toWalletId,
      linkedTransactionId: fromTxId,
      iconBgColor: 'bg-[#6366F1]/20 text-[#4F46E5]',
      userId,
      createdAt: serverTimestamp()
    });

    return { fromTxId, toTxId };
  } catch (error) {
    console.error("Error adding transfer transaction: ", error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (id: string) => {
  try {
    const txRef = ref(db, `${TRANSACTIONS_PATH}/${id}`);
    const snapshot = await get(txRef);
    if (snapshot.exists()) {
      const tx = snapshot.val();
      await remove(txRef);
      if (tx.linkedTransactionId) {
        await remove(ref(db, `${TRANSACTIONS_PATH}/${tx.linkedTransactionId}`));
      }
    }
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
      const tx = snapshot.val();
      await set(txRef, {
        ...tx,
        ...transactionUpdates,
        updatedAt: serverTimestamp() // Add an updatedAt timestamp if desired
      });

      // If it's a transfer and has a linked transaction, update it too
      if (tx.linkedTransactionId && tx.type === 'transfer') {
        const linkedRef = ref(db, `${TRANSACTIONS_PATH}/${tx.linkedTransactionId}`);
        const linkedSnap = await get(linkedRef);
        if (linkedSnap.exists()) {
          const linkedTx = linkedSnap.val();
          
          // Only sync fields that should be identical
          const syncedUpdates: any = {};
          if (transactionUpdates.amount !== undefined) syncedUpdates.amount = transactionUpdates.amount;
          if (transactionUpdates.date !== undefined) syncedUpdates.date = transactionUpdates.date;
          if (transactionUpdates.time !== undefined) syncedUpdates.time = transactionUpdates.time;
          if (transactionUpdates.title !== undefined) syncedUpdates.title = transactionUpdates.title;
          if (transactionUpdates.note !== undefined) syncedUpdates.note = transactionUpdates.note;
          
          await set(linkedRef, {
            ...linkedTx,
            ...syncedUpdates,
            updatedAt: serverTimestamp()
          });
        }
      }
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

// Fetch global categories from RTDB (with seed fallback)
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

// Fetch User-Scoped Categories (System Defaults + User Custom Overrides)
export const fetchUserCategories = async (userId: string): Promise<Record<string, DBCategory>> => {
  try {
    // 1. Fetch system baseline defaults
    const systemCategories = await fetchCategories();
    const result: Record<string, DBCategory> = {};

    // Mark default categories
    Object.keys(systemCategories).forEach(key => {
      result[key] = {
        ...systemCategories[key],
        isDefault: true
      };
    });

    if (!userId) return result;

    // 2. Fetch user custom categories & overrides
    const userSnap = await get(ref(db, `users/${userId}/categories`));
    if (userSnap.exists()) {
      const userCats = userSnap.val() as Record<string, DBCategory>;
      Object.keys(userCats).forEach(key => {
        const isOriginalDefault = !!systemCategories[key];
        result[key] = {
          ...userCats[key],
          isDefault: isOriginalDefault,
          isCustom: !isOriginalDefault
        };
      });
    }

    // 3. Fetch hidden categories if any
    const hiddenSnap = await get(ref(db, `users/${userId}/hidden_categories`));
    if (hiddenSnap.exists()) {
      const hiddenCats = hiddenSnap.val() as Record<string, boolean>;
      Object.keys(hiddenCats).forEach(key => {
        if (hiddenCats[key] && result[key]) {
          result[key] = {
            ...result[key],
            hidden: true
          };
        }
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching user categories:", error);
    return CATEGORY_SEED;
  }
};

// Save or Update a User Category
export const saveUserCategory = async (
  userId: string, 
  categoryName: string, 
  categoryData: DBCategory
): Promise<void> => {
  try {
    const cleanName = categoryName.trim();
    if (!cleanName) throw new Error("Category name cannot be empty");

    const payload = {
      ...categoryData,
      updatedAt: Date.now()
    };

    // Save under user's category tree
    await set(ref(db, `users/${userId}/categories/${cleanName}`), payload);

    // Unhide if it was previously hidden
    await remove(ref(db, `users/${userId}/hidden_categories/${cleanName}`)).catch(() => {});
  } catch (error) {
    console.error("Error saving user category:", error);
    throw error;
  }
};

// Delete a User Category (or Hide if it is a system default)
export const deleteUserCategory = async (
  userId: string, 
  categoryName: string,
  isDefault: boolean = false
): Promise<void> => {
  try {
    const cleanName = categoryName.trim();
    if (!cleanName) return;

    // Remove user override if exists
    await remove(ref(db, `users/${userId}/categories/${cleanName}`));

    if (isDefault) {
      // Mark system category as hidden for this user
      await set(ref(db, `users/${userId}/hidden_categories/${cleanName}`), true);
    }
  } catch (error) {
    console.error("Error deleting user category:", error);
    throw error;
  }
};

// Fetch System Default Groups (for Admin and baseline fallback)
export const fetchAdminDefaultGroups = async (): Promise<{ expense: string[], income: string[] }> => {
  const fallback = {
    expense: [...DEFAULT_EXPENSE_GROUPS],
    income: [...DEFAULT_INCOME_GROUPS]
  };
  try {
    const snapshot = await get(ref(db, 'app_default_groups'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        expense: Array.isArray(data.expense) && data.expense.length > 0 ? data.expense : fallback.expense,
        income: Array.isArray(data.income) && data.income.length > 0 ? data.income : fallback.income
      };
    }
    return fallback;
  } catch (e) {
    console.error("Error fetching admin default groups:", e);
    return fallback;
  }
};

// Save System Default Groups (Admin)
export const saveAdminDefaultGroups = async (groups: { expense: string[], income: string[] }): Promise<void> => {
  try {
    await set(ref(db, 'app_default_groups'), groups);
  } catch (error) {
    console.error("Error saving admin default groups:", error);
    throw error;
  }
};

// Fetch User-Scoped Groups for Expense and Income
export const fetchUserGroups = async (userId: string): Promise<{ expense: string[], income: string[] }> => {
  const defaultGroups = await fetchAdminDefaultGroups();

  if (!userId) return defaultGroups;

  try {
    const snapshot = await get(ref(db, `users/${userId}/groups`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        expense: Array.isArray(data.expense) && data.expense.length > 0 ? data.expense : defaultGroups.expense,
        income: Array.isArray(data.income) && data.income.length > 0 ? data.income : defaultGroups.income
      };
    }
    return defaultGroups;
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return defaultGroups;
  }
};

// Save User Groups
export const saveUserGroups = async (
  userId: string, 
  groups: { expense: string[], income: string[] }
): Promise<void> => {
  try {
    await set(ref(db, `users/${userId}/groups`), groups);
  } catch (error) {
    console.error("Error saving user groups:", error);
    throw error;
  }
};

// Rename a Group and update all categories belonging to it
export const renameUserGroup = async (
  userId: string,
  type: 'expense' | 'income',
  oldName: string,
  newName: string,
  currentCategories: Record<string, DBCategory>
): Promise<{ updatedGroups: { expense: string[], income: string[] }, updatedCategories: Record<string, DBCategory> }> => {
  try {
    const currentGroups = await fetchUserGroups(userId);
    const list = [...(currentGroups[type] || [])];
    const index = list.indexOf(oldName);
    if (index >= 0) {
      list[index] = newName.trim();
    } else {
      list.push(newName.trim());
    }

    const updatedGroups = {
      ...currentGroups,
      [type]: Array.from(new Set(list))
    };

    // Save updated group list
    await saveUserGroups(userId, updatedGroups);

    // Update categories that used this group
    const updatedCategories: Record<string, DBCategory> = { ...currentCategories };
    const updates: Record<string, any> = {};

    Object.keys(currentCategories).forEach(catName => {
      const cat = currentCategories[catName];
      if (cat.group === oldName) {
        const newCat = { ...cat, group: newName.trim(), updatedAt: Date.now() };
        updatedCategories[catName] = newCat;
        updates[`users/${userId}/categories/${catName}`] = newCat;
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }

    return { updatedGroups, updatedCategories };
  } catch (error) {
    console.error("Error renaming group:", error);
    throw error;
  }
};

// Delete a Group and migrate its categories to 'อื่นๆ'
export const deleteUserGroup = async (
  userId: string,
  type: 'expense' | 'income',
  groupNameToDelete: string,
  currentCategories: Record<string, DBCategory>
): Promise<{ updatedGroups: { expense: string[], income: string[] }, updatedCategories: Record<string, DBCategory> }> => {
  try {
    const currentGroups = await fetchUserGroups(userId);
    const list = (currentGroups[type] || []).filter(g => g !== groupNameToDelete);
    
    // Ensure 'อื่นๆ' is present
    if (!list.includes('อื่นๆ')) {
      list.push('อื่นๆ');
    }

    const updatedGroups = {
      ...currentGroups,
      [type]: list
    };

    await saveUserGroups(userId, updatedGroups);

    // Move orphaned categories to 'อื่นๆ'
    const updatedCategories: Record<string, DBCategory> = { ...currentCategories };
    const updates: Record<string, any> = {};

    Object.keys(currentCategories).forEach(catName => {
      const cat = currentCategories[catName];
      if (cat.group === groupNameToDelete) {
        const newCat = { ...cat, group: 'อื่นๆ', updatedAt: Date.now() };
        updatedCategories[catName] = newCat;
        updates[`users/${userId}/categories/${catName}`] = newCat;
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }

    return { updatedGroups, updatedCategories };
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

// Reset User Categories and Groups to clean system defaults
export const resetUserCategoriesAndGroups = async (
  userId: string
): Promise<{ categories: Record<string, DBCategory>, groups: { expense: string[], income: string[] } }> => {
  try {
    await remove(ref(db, `users/${userId}/categories`));
    await remove(ref(db, `users/${userId}/hidden_categories`));
    await remove(ref(db, `users/${userId}/groups`));

    const defaultCategories = await fetchCategories();
    const defaultGroups = await fetchAdminDefaultGroups();

    return {
      categories: defaultCategories,
      groups: defaultGroups
    };
  } catch (error) {
    console.error("Error resetting user categories and groups:", error);
    throw error;
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
