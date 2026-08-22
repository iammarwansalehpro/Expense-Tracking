import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PageId } from '@/types';
import { DEFAULT_EXPENSE_GROUPS, DEFAULT_INCOME_GROUPS, type DBCategory } from '@/utils/categoryStyles';

export interface ScanResult {
  amount?: number;
  date?: string;
  title?: string;
  rawText: string;
  imageUrl?: string;
  category?: string;
  bank?: string;
  note?: string;
  walletId?: string;
}

interface AppState {
  currentPage: PageId;
  isAddMenuOpen: boolean;
  isReviewModalOpen: boolean;
  isTransferModalOpen: boolean;
  isVoiceModalOpen: boolean;
  isCategoryManagerOpen: boolean;
  scannedSlips: ScanResult[];
  currentScanIndex: number;
  favoriteCategories: string[];
  isSettingsModalOpen: boolean;
  appCategories: Record<string, DBCategory> | null;
  userGroups: { expense: string[]; income: string[] };
  appName: string;
  appSlogan: string;
  appIcon: string;
  setCurrentPage: (page: PageId) => void;
  setAddMenuOpen: (isOpen: boolean) => void;
  setReviewModalOpen: (isOpen: boolean) => void;
  setTransferModalOpen: (isOpen: boolean) => void;
  setVoiceModalOpen: (isOpen: boolean) => void;
  setCategoryManagerOpen: (isOpen: boolean) => void;
  setScannedSlips: (slips: ScanResult[]) => void;
  setCurrentScanIndex: (index: number) => void;
  updateScannedSlip: (index: number, data: Partial<ScanResult>) => void;
  removeScannedSlip: (index: number) => void;
  setFavoriteCategories: (cats: string[]) => void;
  addFavoriteCategory: (cat: string) => void;
  toggleFavoriteCategory: (cat: string) => void;
  setSettingsModalOpen: (isOpen: boolean) => void;
  setAppCategories: (cats: Record<string, DBCategory>) => void;
  updateSingleCategory: (name: string, data: DBCategory) => void;
  removeSingleCategory: (name: string) => void;
  setUserGroups: (groups: { expense: string[]; income: string[] }) => void;
  setAppInfo: (name: string, slogan: string, icon: string) => void;
  editingTransactionId: string | null;
  setEditingTransactionId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentPage: 'home',
      isAddMenuOpen: false,
      isReviewModalOpen: false,
      isTransferModalOpen: false,
      isVoiceModalOpen: false,
      isCategoryManagerOpen: false,
      editingTransactionId: null,
      setEditingTransactionId: (id) => set({ editingTransactionId: id }),
      scannedSlips: [],
      currentScanIndex: 0,
      favoriteCategories: ['อาหาร', 'เดินทาง', 'ซื้อของ', 'โอนเงิน'], // Default smart favorites
      isSettingsModalOpen: false,
      appCategories: null,
      userGroups: {
        expense: [...DEFAULT_EXPENSE_GROUPS],
        income: [...DEFAULT_INCOME_GROUPS]
      },
      appName: 'PaySave',
      appSlogan: 'จดปุ๊บ รู้ปั๊บ... จัดการเงินง่ายๆ สไตล์คุณ!',
      appIcon: 'Type',
      setCurrentPage: (page) => set({ currentPage: page }),
      setAddMenuOpen: (isOpen) => set({ isAddMenuOpen: isOpen }),
      setReviewModalOpen: (isOpen) => set({ isReviewModalOpen: isOpen }),
      setTransferModalOpen: (isOpen) => set({ isTransferModalOpen: isOpen }),
      setVoiceModalOpen: (isOpen) => set({ isVoiceModalOpen: isOpen }),
      setCategoryManagerOpen: (isOpen) => set({ isCategoryManagerOpen: isOpen }),
      setScannedSlips: (slips) => set({ scannedSlips: slips, currentScanIndex: 0 }),
      setCurrentScanIndex: (index) => set({ currentScanIndex: index }),
      updateScannedSlip: (index, data) => set((state) => {
        const newSlips = [...state.scannedSlips];
        newSlips[index] = { ...newSlips[index], ...data };
        return { scannedSlips: newSlips };
      }),
      removeScannedSlip: (index) => set((state) => {
        const newSlips = [...state.scannedSlips];
        newSlips.splice(index, 1);
        let newIndex = state.currentScanIndex;
        if (newIndex >= newSlips.length && newSlips.length > 0) {
          newIndex = newSlips.length - 1;
        }
        return { scannedSlips: newSlips, currentScanIndex: newIndex, isReviewModalOpen: newSlips.length > 0 };
      }),
      setFavoriteCategories: (cats) => set({ favoriteCategories: cats }),
      addFavoriteCategory: (cat) => set((state) => {
        const newFavs = [cat, ...state.favoriteCategories.filter(c => c !== cat)].slice(0, 5);
        return { favoriteCategories: newFavs };
      }),
      toggleFavoriteCategory: (cat) => set((state) => {
        if (state.favoriteCategories.includes(cat)) {
          return { favoriteCategories: state.favoriteCategories.filter(c => c !== cat) };
        } else {
          const newFavs = [cat, ...state.favoriteCategories].slice(0, 5); // limit to 5
          return { favoriteCategories: newFavs };
        }
      }),
      setSettingsModalOpen: (isOpen) => set({ isSettingsModalOpen: isOpen }),
      setAppCategories: (cats) => set({ appCategories: cats }),
      updateSingleCategory: (name, data) => set((state) => ({
        appCategories: {
          ...(state.appCategories || {}),
          [name]: data
        }
      })),
      removeSingleCategory: (name) => set((state) => {
        if (!state.appCategories) return state;
        const next = { ...state.appCategories };
        delete next[name];
        return { appCategories: next };
      }),
      setUserGroups: (groups) => set({ userGroups: groups }),
      setAppInfo: (name, slogan, icon) => set({ appName: name, appSlogan: slogan, appIcon: icon }),
    }),
    {
      name: 'paysave-storage',
      partialize: (state) => ({
        appName: state.appName,
        appSlogan: state.appSlogan,
        appIcon: state.appIcon,
        userGroups: state.userGroups
      }),
    }
  )
);
