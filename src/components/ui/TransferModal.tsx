import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { X, ArrowRight, Loader2, ArrowLeftRight, Landmark, Wallet as WalletIcon } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import { useWalletStore } from '@/store/useWalletStore';
import { useAuthStore } from '@/store/useAuthStore';
import { addTransferTransaction } from '@/services/transactionService';
import { useToastStore } from '@/store/useToastStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/store/useAppStore';
import { useDragToClose } from '@/hooks/useDragToClose';

export default function TransferModal() {
  const { t } = useTranslation();
  const isOpen = useAppStore(s => s.isTransferModalOpen);
  const handleClose = () => useAppStore.getState().setTransferModalOpen(false);
  
  const wallets = useWalletStore(s => s.wallets);
  const user = useAuthStore(s => s.user);

  const { handlers: dragHandlers, style: dragStyle } = useDragToClose({
    onClose: handleClose,
  });

  const [fromWalletId, setFromWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && wallets.length > 0) {
      const mainWallet = wallets.find(w => w.isMain) || wallets[0];
      setFromWalletId(mainWallet.id);
      
      const otherWallet = wallets.find(w => w.id !== mainWallet.id);
      if (otherWallet) {
        setToWalletId(otherWallet.id);
      }
      setAmount('');
      setNote('');
    }
  }, [isOpen, wallets]);

  const nonCreditCardWallets = useMemo(() => wallets.filter(w => w.type !== 'credit_card'), [wallets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !fromWalletId || !toWalletId) return;

    if (fromWalletId === toWalletId) {
      useToastStore.getState().addToast(t('transfer.sameWalletError', 'ไม่สามารถโอนไปกระเป๋าเดียวกันได้'), 'error');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) {
      useToastStore.getState().addToast(t('transfer.amountError', 'จำนวนเงินต้องมากกว่า 0'), 'error');
      return;
    }

    setLoading(true);
    try {
      await addTransferTransaction(user.uid, fromWalletId, toWalletId, parsedAmount, note);
      useToastStore.getState().addToast(t('transfer.success', 'โอนเงินสำเร็จ'), 'success');
      handleClose();
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast(t('transfer.error', 'เกิดข้อผิดพลาดในการโอนเงิน'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFromWalletId(toWalletId);
    setToWalletId(fromWalletId);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        {...dragHandlers}
        style={dragStyle}
        className="bg-white/90 backdrop-blur-[30px] rounded-t-[40px] border-t border-white/60 w-full max-w-md mx-auto shadow-[0_-10px_40px_rgba(31,38,135,0.15)] relative animate-slide-up flex flex-col h-[90vh]"
      >
        <div className="p-4 flex justify-center shrink-0">
          <div className="w-16 h-1.5 bg-slate-300/50 rounded-full" />
        </div>

        <div className="px-6 pb-4 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-[26px] font-bold text-[#2E1065] tracking-tight flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              {t('transfer.title', 'โอนเงินข้ามกระเป๋า')}
            </h2>
            <p className="text-sm font-medium text-[#2E1065]/60 mt-1 pl-12">
              {t('transfer.desc', 'บันทึกการย้ายเงินระหว่างกระเป๋าของคุณ')}
            </p>
          </div>
          <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center rounded-full border border-red-200/50 text-red-500 bg-red-50/50 hover:bg-red-100/50 backdrop-blur-md transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden relative">
          <div className="overflow-y-auto px-6 pb-32 no-scrollbar flex-1 flex flex-col gap-5 pt-2">
            
            {/* Wallet Selection */}
            <div className="bg-white/50 backdrop-blur-xl p-5 rounded-[32px] border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)] relative">
              <div className="absolute left-[38px] top-[72px] bottom-[72px] w-[2px] border-l-2 border-dashed border-indigo-200 z-0 hidden" />
              
              <div className="mb-4 relative z-10">
                <label className="text-[13px] font-bold text-[#2E1065]/70 ml-1 mb-1.5 block">
                  {t('transfer.from', 'จาก (ต้นทาง)')}
                </label>
                <CustomSelect 
                  value={fromWalletId}
                  onChange={setFromWalletId}
                  options={nonCreditCardWallets.map(w => {
                    const iconName = w.icon === 'CreditCard' ? 'Landmark' : w.icon;
                    const WIcon = (Icons as any)[iconName] || Icons.Wallet;
                    return {
                      label: w.name,
                      value: w.id,
                      iconNode: <WIcon className={`w-4 h-4 ${w.color.replace('bg-', 'text-')}`} />
                    };
                  })}
                  placeholder="เลือกกระเป๋าต้นทาง"
                />
              </div>

              <div className="flex justify-center -my-3 relative z-20">
                <button 
                  type="button" 
                  onClick={handleSwap}
                  className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-white shadow-md flex items-center justify-center text-indigo-500 hover:bg-indigo-100 hover:scale-110 transition-all"
                >
                  <ArrowLeftRight className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <div className="mt-4 relative z-10">
                <label className="text-[13px] font-bold text-[#2E1065]/70 ml-1 mb-1.5 block">
                  {t('transfer.to', 'ไป (ปลายทาง)')}
                </label>
                <CustomSelect 
                  value={toWalletId}
                  onChange={setToWalletId}
                  options={wallets.map(w => {
                    const iconName = w.icon === 'CreditCard' ? 'Landmark' : w.icon;
                    const WIcon = (Icons as any)[iconName] || Icons.Wallet;
                    return {
                      label: w.name,
                      value: w.id,
                      iconNode: <WIcon className={`w-4 h-4 ${w.color.replace('bg-', 'text-')}`} />
                    };
                  })}
                  placeholder="เลือกกระเป๋าปลายทาง"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="bg-white/50 backdrop-blur-xl p-5 rounded-[32px] border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)]">
              <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                  <span className="text-indigo-500 font-bold">฿</span>
                </div>
                {t('transfer.amount', 'จำนวนเงิน')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2E1065]/50 font-bold text-lg">฿</span>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/60 backdrop-blur-sm rounded-[20px] px-12 py-4 text-[#2E1065] font-bold text-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 border border-white/50 shadow-inner"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Note */}
            <div className="bg-white/50 backdrop-blur-xl p-5 rounded-[32px] border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)]">
              <label className="text-[13px] font-bold text-[#2E1065]/70 ml-1 mb-1.5 block">
                {t('transfer.note', 'บันทึกช่วยจำ (ไม่บังคับ)')}
              </label>
              <input 
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={50}
                className="w-full bg-white/60 backdrop-blur-sm rounded-[16px] px-4 py-3.5 text-[#2E1065] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 border border-white/50 shadow-inner"
                placeholder="เช่น โอนเงินเก็บ, กดเงินสด"
              />
            </div>

          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 flex z-10 pointer-events-none bg-gradient-to-t from-white/90 via-white/70 to-transparent pb-8">
            <button
              type="submit"
              disabled={loading || !fromWalletId || !toWalletId || !amount}
              className={`pointer-events-auto w-full py-4 rounded-[24px] text-white font-bold text-lg shadow-[0_8px_20px_rgba(79,70,229,0.25)] border border-white/30 transition-all active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-tr from-indigo-600 to-indigo-400 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t('transfer.submit', 'ยืนยันการโอนเงิน')} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
