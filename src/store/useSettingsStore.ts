import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveUserDailyBudget } from '@/services/settingsService';
import { useAuthStore } from '@/store/useAuthStore';

export type Language = 'th' | 'en';

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
  dailyBudget: number;
  userBudgets: Record<string, number>;
  setDailyBudget: (amount: number, userId?: string) => void;
  loadUserDailyBudget: (userId: string, remoteBudget?: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'th',
      setLanguage: (lang) => set({ language: lang }),
      dailyBudget: 500,
      userBudgets: {},
      setDailyBudget: (amount, customUserId) => {
        const val = Math.max(0, amount);
        const uid = customUserId || useAuthStore.getState().user?.uid;
        
        if (uid) {
          saveUserDailyBudget(uid, val);
          set((state) => ({
            dailyBudget: val,
            userBudgets: { ...state.userBudgets, [uid]: val },
          }));
        } else {
          set({ dailyBudget: val });
        }
      },
      loadUserDailyBudget: (userId, remoteBudget) => {
        const state = get();
        if (remoteBudget !== undefined && remoteBudget !== null) {
          set({
            dailyBudget: remoteBudget,
            userBudgets: { ...state.userBudgets, [userId]: remoteBudget },
          });
        } else if (state.userBudgets[userId] !== undefined) {
          set({ dailyBudget: state.userBudgets[userId] });
        } else {
          // Default for new user
          set({ dailyBudget: 500 });
        }
      },
    }),
    {
      name: 'paysave-settings',
    }
  )
);
