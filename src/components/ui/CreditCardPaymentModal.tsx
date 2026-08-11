import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { CheckCircle2, X, CreditCard as CreditCardIcon, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { calculateCreditCardStats } from '@/utils/creditCardUtils';
import CustomSelect from '@/components/ui/CustomSelect';
import { useWalletStore } from '@/store/useWalletStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import { addTransferTransaction, updateTransaction } from '@/services/transactionService';
import { useToastStore } from '@/store/useToastStore';
import { useDragToClose } from '@/hooks/useDragToClose';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  creditCardId: string | null;
}

export default function CreditCardPaymentModal({ isOpen, onClose, creditCardId }: Props) {
  const wallets = useWalletStore(s => s.wallets);
  const transactions = useTransactionStore(s => s.transactions);
  const user = useAuthStore(s => s.user);
  const { t } = useTranslation();

  const creditCard = wallets.find(w => w.id === creditCardId);
  const nonCreditCardWallets = useMemo(() => wallets.filter(w => w.type !== 'credit_card'), [wallets]);
  const mainWallet = nonCreditCardWallets.find(w => w.isMain) || nonCreditCardWallets[0];

  const [fromWalletId, setFromWalletId] = useState<string>(mainWallet?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'full' | 'minimum' | 'custom'>('full');
  const [loading, setLoading] = useState(false);

  const { handlers: dragHandlers, style: dragStyle } = useDragToClose({
    onClose,
  });

  const stats = useMemo(() => {
    if (!creditCard || !creditCardId) return null;
    return calculateCreditCardStats(creditCard, transactions);
  }, [creditCard, creditCardId, transactions]);

  const outstandingBalance = stats?.outstandingBalance || 0;
  const statementBalance = stats?.statementBalance || 0;
  const minimumPayment = stats?.minimumPayment || 0;
  const revolvingInterest = stats?.revolvingInterest || 0;

  useEffect(() => {
    if (isOpen) {
      setPaymentType('full');
      setAmount(statementBalance.toString());
    }
  }, [isOpen, statementBalance]);

  useEffect(() => {
    if (paymentType === 'full') setAmount(statementBalance.toString());
    else if (paymentType === 'minimum') setAmount(minimumPayment.toString());
    else if (paymentType === 'custom') setAmount('');
  }, [paymentType, statementBalance, minimumPayment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !fromWalletId || !creditCardId || !creditCard) return;

    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) {
      useToastStore.getState().addToast('จำนวนเงินต้องมากกว่า 0', 'error');
      return;
    }

    setLoading(true);
    try {
      // Create transfer from cash/bank to credit card
      await addTransferTransaction(user.uid, fromWalletId, creditCardId, parsedAmount, 'ชำระค่าบัตรเครดิต');
      
      // No need to manually increment installmentPaidMonths anymore.
      // creditCardUtils dynamically calculates billed installments based on statement dates.
      
      useToastStore.getState().addToast(`ชำระบัตรเครดิต ${creditCard.name} เรียบร้อยแล้ว`, 'success');
      handleClose();
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast('เกิดข้อผิดพลาดในการชำระเงิน', 'error');
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setAmount('');
    setLoading(false);
  };

  if (!isOpen || !creditCard) return null;


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
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <CreditCardIcon className="w-5 h-5" />
              </div>
              ชำระค่าบัตรเครดิต
            </h2>
            <p className="text-sm font-medium text-[#2E1065]/60 mt-1 pl-12">
              {creditCard.name}
            </p>
          </div>
          <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center rounded-full border border-red-200/50 text-red-500 bg-red-50/50 hover:bg-red-100/50 backdrop-blur-md transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden relative">
          <div className="overflow-y-auto px-6 pb-32 no-scrollbar flex-1 flex flex-col gap-5 pt-2">
            
            {/* Credit Card Style Balance Info */}
            <div className={`w-full min-h-[140px] ${creditCard.color} rounded-[20px] p-5 text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col justify-between shrink-0 border border-white/20 transition-all duration-300`}>
              {/* Glassy decorative elements */}
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-black/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute right-10 bottom-10 w-32 h-32 bg-white/5 rounded-full blur-[20px] pointer-events-none" />
              
              {/* Card Header */}
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-white/70 text-[10px] uppercase tracking-[0.1em] font-bold mb-1">{t('home.outstandingBalance')}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-white/80 font-medium text-base">฿</span>
                    <h3 className="text-[32px] font-black tracking-tight leading-none drop-shadow-sm">
                      {outstandingBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                </div>
                
                {/* Chip Icon */}
                <div className="w-11 h-8 bg-gradient-to-br from-yellow-100/40 to-yellow-500/20 rounded-md border border-yellow-300/30 flex flex-col justify-evenly relative overflow-hidden backdrop-blur-md shadow-sm">
                  <div className="w-full h-[1px] bg-yellow-600/20" />
                  <div className="w-full h-[1px] bg-yellow-600/20" />
                  <div className="absolute inset-y-0 left-1/3 w-[1px] bg-yellow-600/20" />
                  <div className="absolute inset-y-0 right-1/3 w-[1px] bg-yellow-600/20" />
                </div>
              </div>

              {/* Card Footer */}
              <div className="relative z-10 flex justify-between items-end mt-8">
                <div className="flex flex-col gap-0.5">
                  <span className="text-white/50 text-[9px] uppercase tracking-[0.1em] font-bold">{t('home.dueDate')}</span>
                  <span className="text-[14px] font-bold tracking-wide text-white/90 drop-shadow-sm">
                    {t('home.day')} {creditCard.dueDay || 25}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-sm">
                     <Calendar className="w-4 h-4 text-white" />
                   </div>
                </div>
              </div>
            </div>

            {revolvingInterest > 0 && (
              <div className="bg-red-50/80 backdrop-blur-md border border-red-200 p-4 rounded-[20px] flex gap-3 shadow-sm shrink-0 items-start">
                <div className="mt-0.5">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-500 font-bold text-xs">%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-red-700">มีดอกเบี้ยค้างชำระ</h4>
                  <p className="text-[11px] text-red-600/80 mt-0.5 leading-relaxed">
                    คุณมียอดค้างชำระจากรอบบิลก่อนหน้า ทำให้เกิดดอกเบี้ยประมาณ ฿{revolvingInterest.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ซึ่งถูกรวมในยอดขั้นต่ำและเต็มจำนวนแล้ว
                  </p>
                </div>
              </div>
            )}

            {/* Payment Options */}
            <div className="bg-white/50 backdrop-blur-xl p-5 rounded-[32px] border border-white/60 shadow-sm shrink-0">
              <label className="text-[13px] font-bold text-[#2E1065]/70 ml-1 mb-3 block">
                ยอดที่ต้องการชำระ
              </label>
              
              <div className="grid gap-3 mb-4">
                <label className={`flex items-center p-4 rounded-[20px] border-2 cursor-pointer transition-all ${paymentType === 'full' ? 'border-amber-500 bg-amber-50/50' : 'border-transparent bg-white hover:bg-slate-50'}`}>
                  <input type="radio" name="paymentType" className="hidden" checked={paymentType === 'full'} onChange={() => setPaymentType('full')} />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${paymentType === 'full' ? 'border-amber-500' : 'border-slate-300'}`}>
                    {paymentType === 'full' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#2E1065]">เต็มจำนวน</div>
                    <div className="text-xs text-[#2E1065]/60 mt-0.5">ไม่ต้องเสียดอกเบี้ย</div>
                  </div>
                  <div className="font-bold text-amber-600">฿{statementBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
                </label>

                <label className={`flex items-center p-4 rounded-[20px] border-2 cursor-pointer transition-all ${paymentType === 'minimum' ? 'border-amber-500 bg-amber-50/50' : 'border-transparent bg-white hover:bg-slate-50'}`}>
                  <input type="radio" name="paymentType" className="hidden" checked={paymentType === 'minimum'} onChange={() => setPaymentType('minimum')} />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${paymentType === 'minimum' ? 'border-amber-500' : 'border-slate-300'}`}>
                    {paymentType === 'minimum' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#2E1065]">ยอดขั้นต่ำ</div>
                    <div className="text-xs text-[#2E1065]/60 mt-0.5">คำนวณอัตโนมัติ (10%)</div>
                  </div>
                  <div className="font-bold text-amber-600">฿{minimumPayment.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
                </label>

                <label className={`flex items-center p-4 rounded-[20px] border-2 cursor-pointer transition-all ${paymentType === 'custom' ? 'border-amber-500 bg-amber-50/50' : 'border-transparent bg-white hover:bg-slate-50'}`}>
                  <input type="radio" name="paymentType" className="hidden" checked={paymentType === 'custom'} onChange={() => setPaymentType('custom')} />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${paymentType === 'custom' ? 'border-amber-500' : 'border-slate-300'}`}>
                    {paymentType === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#2E1065]">ระบุยอดเอง</div>
                  </div>
                </label>
              </div>

              {paymentType === 'custom' && (
                <div className="relative animate-fade-in mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2E1065]/50 font-bold text-lg">฿</span>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/60 backdrop-blur-sm rounded-[20px] px-12 py-4 text-[#2E1065] font-bold text-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 border border-white/50 shadow-inner"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            {/* Source Wallet */}
            <div className="bg-white/50 backdrop-blur-xl p-5 rounded-[32px] border border-white/60 shadow-sm shrink-0">
              <label className="text-[13px] font-bold text-[#2E1065]/70 ml-1 mb-1.5 block">
                ชำระจากกระเป๋า
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
                placeholder="เลือกกระเป๋าเงิน/ธนาคาร"
              />
            </div>
            
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 flex z-10 pointer-events-none bg-gradient-to-t from-white/90 via-white/70 to-transparent pb-8">
            <button
              type="submit"
              disabled={loading || !fromWalletId || !amount || parseFloat(amount) <= 0 || outstandingBalance <= 0}
              className={`pointer-events-auto w-full py-4 rounded-[24px] text-white font-bold text-lg shadow-[0_8px_20px_rgba(245,158,11,0.25)] border border-white/30 transition-all active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-tr from-amber-500 to-orange-400 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : outstandingBalance <= 0 ? (
                'ไม่มีการค้างชำระ'
              ) : (
                <>
                  ยืนยันการชำระเงิน <ArrowRight className="w-5 h-5" />
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
