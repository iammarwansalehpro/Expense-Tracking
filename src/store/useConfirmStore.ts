import { create } from 'zustand';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDestructive: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  showConfirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  hideConfirm: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  isDestructive: false,
  onConfirm: () => {},
  onCancel: undefined,
  
  showConfirm: (options) => set({
    isOpen: true,
    title: options.title,
    message: options.message,
    confirmText: options.confirmText || 'Confirm',
    cancelText: options.cancelText || 'Cancel',
    isDestructive: options.isDestructive || false,
    onConfirm: options.onConfirm,
    onCancel: options.onCancel,
  }),
  
  hideConfirm: () => set({ isOpen: false })
}));
