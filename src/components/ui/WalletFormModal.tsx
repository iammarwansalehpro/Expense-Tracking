import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Landmark, Wallet as WalletIcon } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Wallet } from '@/types';

interface WalletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editWallet?: Wallet | null;
}

export default function WalletFormModal({ isOpen, onClose, editWallet }: WalletFormModalProps) {
  const { t } = useTranslation();
  const addWallet = useWalletStore(s => s.addWallet);
  const updateWallet = useWalletStore(s => s.updateWallet);

  const isAdding = !editWallet;
  
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<'Wallet' | 'CreditCard'>('Wallet');
  const [isMain, setIsMain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editWallet) {
        setWalletName(editWallet.name);
        setWalletType(editWallet.icon === 'CreditCard' ? 'CreditCard' : 'Wallet');
        setIsMain(editWallet.isMain ?? false);
      } else {
        setWalletName('');
        setWalletType('Wallet');
        setIsMain(false);
      }
    }
  }, [isOpen, editWallet]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[210] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] p-6 w-full max-w-sm relative z-10 shadow-[0_8px_32px_rgba(31,38,135,0.15)] border border-white/60 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-[#2E1065]">
            {isAdding ? t('wallet.addTitle') : t('wallet.editTitle')}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#2E1065]/50 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <label className="block text-sm font-bold text-[#2E1065] mb-2">{t('wallet.type')}</label>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setWalletType('Wallet')}
            className={`py-4 px-4 rounded-[20px] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
              walletType === 'Wallet'
                ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/30 scale-105'
                : 'bg-slate-50 text-[#2E1065]/40 hover:bg-slate-100 hover:scale-100'
            }`}
          >
            <WalletIcon className="w-7 h-7" />
            <span className="font-bold text-[13px]">{t('wallet.cash')}</span>
          </button>
          <button
            onClick={() => setWalletType('CreditCard')}
            className={`py-4 px-4 rounded-[20px] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
              walletType === 'CreditCard'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-slate-50 text-[#2E1065]/40 hover:bg-slate-100 hover:scale-100'
            }`}
          >
            <Landmark className="w-7 h-7" />
            <span className="font-bold text-[13px]">{t('wallet.bank')}</span>
          </button>
        </div>

        <label className="block text-sm font-bold text-[#2E1065] mb-2">{t('wallet.name')}</label>
        <div className="relative mb-5">
          <input
            autoFocus
            type="text"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            className="w-full bg-slate-50 rounded-[20px] px-5 py-4 text-[#2E1065] font-bold focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#8B5CF6]/20 transition-all placeholder:text-[#2E1065]/30 text-lg"
            placeholder={t('wallet.namePlaceholder')}
          />
        </div>

        <div className="flex items-center justify-between mb-6 px-1">
          <div>
            <h4 className="font-bold text-[#2E1065] text-sm">{t('wallet.setMain')}</h4>
            <p className="text-[11px] text-[#2E1065]/50 mt-0.5">{t('wallet.setMainHint')}</p>
          </div>
          <button
            onClick={() => setIsMain(!isMain)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isMain ? 'bg-[#8B5CF6]' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isMain ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <button 
          onClick={() => {
            if (isAdding && walletName.trim()) {
              addWallet({
                name: walletName.trim(),
                balance: 0,
                color: walletType === 'CreditCard' ? 'bg-blue-500' : 'bg-emerald-500',
                icon: walletType,
                isMain: isMain
              });
              onClose();
            } else if (editWallet && walletName.trim()) {
              updateWallet(editWallet.id, { 
                name: walletName.trim(),
                icon: walletType,
                color: walletType === 'CreditCard' ? 'bg-blue-500' : 'bg-emerald-500',
                isMain: isMain
              });
              onClose();
            }
          }}
          disabled={!walletName.trim()}
          className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {t('wallet.save')}
        </button>
      </div>
    </div>,
    document.body
  );
}
