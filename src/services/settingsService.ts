import { ref, get, set } from 'firebase/database';
import { db } from '@/lib/firebase';

export interface UserSettings {
  dailyBudget?: number;
  language?: 'th' | 'en';
}

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const snapshot = await get(ref(db, `users/${userId}/settings`));
    if (snapshot.exists()) {
      return snapshot.val() as UserSettings;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }
};

export const saveUserDailyBudget = async (userId: string, dailyBudget: number): Promise<void> => {
  try {
    await set(ref(db, `users/${userId}/settings/dailyBudget`), dailyBudget);
  } catch (error) {
    console.error("Error saving user daily budget:", error);
  }
};
