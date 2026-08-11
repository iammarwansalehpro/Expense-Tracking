import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Landmark, Wallet as WalletIcon, CreditCard as CreditCardIcon, Calendar, ChevronRight } from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Wallet, WalletType } from '@/types';
import { useDragToClose } from '@/hooks/useDragToClose';

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
  const [walletType, setWalletType] = useState<WalletType>('cash');
  const [isMain, setIsMain] = useState(false);
  
  // Credit card fields
  const [creditLimit, setCreditLimit] = useState<string>('');
  const [installmentCreditLimit, setInstallmentCreditLimit] = useState<string>('');
  const [dueDay, setDueDay] = useState<number>(25);
  const [statementDay, setStatementDay] = useState<number>(10);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);

  const { handlers: dragHandlers, style: dragStyle } = useDragToClose({
    onClose: () => setIsCycleModalOpen(false),
  });

  useEffect(() => {
    if (isOpen) {
      if (editWallet) {
        setWalletName(editWallet.name);
        
        let derivedType = editWallet.type;
        if (!derivedType) {
           // Old bank wallets used 'CreditCard' icon but had 'bg-blue-500' color
           if (editWallet.color === 'bg-blue-500') derivedType = 'bank';
           else if (editWallet.icon === 'CreditCard' || editWallet.icon === 'CreditCardIcon') derivedType = 'credit_card';
           else if (editWallet.icon === 'Landmark') derivedType = 'bank';
           else derivedType = 'cash';
        }
        setWalletType(derivedType);
        
        setIsMain(editWallet.isMain ?? false);
        if (derivedType === 'credit_card') {
            setCreditLimit(editWallet.creditLimit?.toString() || '');
            setInstallmentCreditLimit(editWallet.installmentCreditLimit?.toString() || '');
            setDueDay(editWallet.dueDay || 25);
            setStatementDay(editWallet.statementDay || 10);
        }
      } else {
        setWalletName('');
        setWalletType('cash');
        setIsMain(false);
        setCreditLimit('');
        setInstallmentCreditLimit('');
        setDueDay(25);
        setStatementDay(10);
      }
    }
  }, [isOpen, editWallet]);

  useEffect(() => {
    if (isCycleModalOpen) {
      setTimeout(() => {
        document.getElementById(`stmt-${statementDay}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        document.getElementById(`due-${dueDay}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 50);
    }
  }, [isCycleModalOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[210] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] p-6 w-full max-w-sm relative z-10 shadow-[0_8px_32px_rgba(31,38,135,0.15)] border border-white/60 animate-scale-in max-h-[90vh] overflow-y-auto no-scrollbar">
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
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button
            onClick={() => setWalletType('cash')}
            className={`py-3 px-2 rounded-[20px] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
              walletType === 'cash'
                ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/30 scale-105'
                : 'bg-slate-50 text-[#2E1065]/40 hover:bg-slate-100 hover:scale-100'
            }`}
          >
            <WalletIcon className="w-6 h-6" />
            <span className="font-bold text-[11px]">{t('wallet.cash')}</span>
          </button>
          <button
            onClick={() => setWalletType('bank')}
            className={`py-3 px-2 rounded-[20px] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
              walletType === 'bank'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-slate-50 text-[#2E1065]/40 hover:bg-slate-100 hover:scale-100'
            }`}
          >
            <Landmark className="w-6 h-6" />
            <span className="font-bold text-[11px]">{t('wallet.bank')}</span>
          </button>
          <button
            onClick={() => setWalletType('credit_card')}
            className={`py-3 px-2 rounded-[20px] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
              walletType === 'credit_card'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                : 'bg-slate-50 text-[#2E1065]/40 hover:bg-slate-100 hover:scale-100'
            }`}
          >
            <CreditCardIcon className="w-6 h-6" />
            <span className="font-bold text-[11px]">{t('wallet.credit_card')}</span>
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

        {walletType === 'credit_card' && (
          <div className="animate-fade-in space-y-5 mb-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-[24px] border border-amber-200/50 shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10">
              <label className="block text-sm font-bold text-[#2E1065] mb-2">วงเงินทั้งหมด (Total Credit Limit)</label>
              <div className="relative">
                 <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2E1065]/50 font-bold text-lg">฿</span>
                 <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-md rounded-[20px] pl-10 pr-5 py-3.5 text-[#2E1065] font-bold focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all placeholder:text-[#2E1065]/30 text-lg border border-amber-100/50 shadow-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="relative z-10">
              <label className="block text-sm font-bold text-[#2E1065] mb-2">วงเงินสินเชื่อ (Installment Limit)</label>
              <div className="relative">
                 <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2E1065]/50 font-bold text-lg">฿</span>
                 <input
                  type="number"
                  value={installmentCreditLimit}
                  onChange={(e) => setInstallmentCreditLimit(e.target.value)}
                  className="w-full bg-white/70 backdrop-blur-md rounded-[20px] pl-10 pr-5 py-3.5 text-[#2E1065] font-bold focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all placeholder:text-[#2E1065]/30 text-lg border border-amber-100/50 shadow-sm"
                  placeholder="0.00 (ไม่ระบุ = ใช้ร่วมกัน)"
                />
              </div>
            </div>
            
            <div className="relative z-10">
                 <label className="block text-sm font-bold text-[#2E1065] mb-2">รอบบิลและวันชำระ</label>
                 <button 
                   type="button"
                   onClick={() => setIsCycleModalOpen(true)}
                   className="w-full bg-white/70 backdrop-blur-md rounded-[20px] px-5 py-4 text-left flex items-center justify-between focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all border border-amber-100/50 shadow-sm group"
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-amber-100/50 flex items-center justify-center text-amber-600 shadow-inner">
                       <Calendar className="w-5 h-5" />
                     </div>
                     <div>
                       <div className="text-sm font-bold text-[#2E1065]">สรุปยอดวันที่ {statementDay}</div>
                       <div className="text-[12px] font-medium text-[#2E1065]/60 mt-0.5">ครบกำหนดชำระวันที่ {dueDay}</div>
                     </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-[#2E1065]/30 group-hover:text-[#2E1065]/50 transition-colors" />
                 </button>
            </div>
          </div>
        )}

        {/* Cycle Select Modal */}
        {isCycleModalOpen && createPortal(
          <div className="fixed inset-0 z-[300] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsCycleModalOpen(false)} />
            <div 
              {...dragHandlers}
              style={dragStyle}
              className="bg-white/90 backdrop-blur-[30px] rounded-t-[40px] w-full max-w-md mx-auto shadow-[0_-10px_40px_rgba(31,38,135,0.15)] border-t border-white/60 relative animate-slide-up pb-8 px-6"
            >
              <div className="p-4 flex justify-center shrink-0">
                <div className="w-16 h-1.5 bg-slate-300/50 rounded-full" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[22px] font-bold text-[#2E1065]">ตั้งค่ารอบบิล</h3>
                <button onClick={() => setIsCycleModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#2E1065]/50 hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-6 p-4 bg-[#F8FAFC] rounded-[20px] border border-slate-100">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#2E1065]/50">วันสรุปยอด</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-bold text-[#2E1065]">วันที่ {statementDay}</span>
                  </div>
                </div>
                <div className="w-[1px] h-8 bg-slate-200" />
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#2E1065]/50">ครบกำหนด</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                    <span className="text-sm font-bold text-[#2E1065]">วันที่ {dueDay}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                   <label className="block text-sm font-bold text-[#2E1065] mb-3">วันสรุปยอด (Statement Date)</label>
                   <div className="flex overflow-x-auto gap-3 py-4 px-4 -mx-4 no-scrollbar snap-x">
                     {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                       <button
                         key={`stmt-${day}`}
                         id={`stmt-${day}`}
                         onClick={() => setStatementDay(day)}
                         className={`shrink-0 snap-center w-14 h-14 rounded-[18px] flex flex-col items-center justify-center font-bold transition-all ${
                           statementDay === day 
                             ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-110 border-0' 
                             : 'bg-white/60 border border-slate-200/60 text-[#2E1065]/60 hover:bg-white'
                         }`}
                       >
                         <span className="text-xs font-medium opacity-80 mb-0.5">วันที่</span>
                         <span className="text-lg leading-none">{day}</span>
                       </button>
                     ))}
                   </div>
                </div>
                
                <div>
                   <label className="block text-sm font-bold text-[#2E1065] mb-3">ครบกำหนดชำระ (Due Date)</label>
                   <div className="flex overflow-x-auto gap-3 py-4 px-4 -mx-4 no-scrollbar snap-x">
                     {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                       <button
                         key={`due-${day}`}
                         id={`due-${day}`}
                         onClick={() => setDueDay(day)}
                         className={`shrink-0 snap-center w-14 h-14 rounded-[18px] flex flex-col items-center justify-center font-bold transition-all ${
                           dueDay === day 
                             ? 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white shadow-lg shadow-[#8B5CF6]/30 scale-110 border-0' 
                             : 'bg-white/60 border border-slate-200/60 text-[#2E1065]/60 hover:bg-white'
                         }`}
                       >
                         <span className="text-xs font-medium opacity-80 mb-0.5">วันที่</span>
                         <span className="text-lg leading-none">{day}</span>
                       </button>
                     ))}
                   </div>
                </div>

                <button 
                  onClick={() => setIsCycleModalOpen(false)}
                  className="w-full py-4 rounded-[20px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_8px_20px_rgba(245,158,11,0.25)] mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {walletType !== 'credit_card' && (
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
        )}
        
        <button 
          onClick={() => {
            if (!walletName.trim()) return;

            let iconName = 'Wallet';
            let colorStr = 'bg-emerald-500';
            if (walletType === 'bank') {
              iconName = 'Landmark';
              colorStr = 'bg-blue-500';
            } else if (walletType === 'credit_card') {
              iconName = 'CreditCard';
              colorStr = 'bg-amber-500';
            }

            const baseWallet = {
              name: walletName.trim(),
              icon: iconName,
              color: colorStr,
              type: walletType,
              isMain: walletType === 'credit_card' ? false : isMain,
            };

            const creditCardProps = walletType === 'credit_card' ? {
              creditLimit: creditLimit ? parseFloat(creditLimit) : 0,
              installmentCreditLimit: installmentCreditLimit ? parseFloat(installmentCreditLimit) : 0,
              dueDay,
              statementDay,
            } : {};

            if (isAdding) {
              addWallet({
                ...baseWallet,
                balance: 0,
                ...creditCardProps
              });
            } else if (editWallet) {
              updateWallet(editWallet.id, { 
                ...baseWallet,
                ...creditCardProps
              });
            }
            onClose();
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
