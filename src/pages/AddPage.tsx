import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { X, CreditCard, Loader2, Sparkles, PlusCircle, MinusCircle, Calendar, AlignLeft, Pencil, FileText, Wallet as WalletIcon, Clock, ArrowLeftRight } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomTimePicker from '@/components/ui/CustomTimePicker';
import CategorySelectModal from '@/components/ui/CategorySelectModal';
import { getCategoryStyle, CATEGORY_SEED } from '@/utils/categoryStyles';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useTranslation } from '@/hooks/useTranslation';
import { addTransaction, updateTransaction } from '@/services/transactionService';
import { useToastStore } from '@/store/useToastStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import type { TransactionType, TransactionCategory, Wallet } from '@/types';
import { useDragToClose } from '@/hooks/useDragToClose';

export default function AddPage() {
  const { t } = useTranslation();
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const user = useAuthStore((s) => s.user);
  const appCategories = useAppStore(s => s.appCategories);
  const favoriteCategories = useAppStore((s) => s.favoriteCategories);

  const editingTransactionId = useAppStore(s => s.editingTransactionId);
  const setEditingTransactionId = useAppStore(s => s.setEditingTransactionId);
  const transactions = useTransactionStore(s => s.transactions);
  const editingTransaction = transactions.find(t => t.id === editingTransactionId);
  const wallets = useWalletStore(s => s.wallets);
  const mainWallet = wallets.find(w => w.isMain) || wallets[0];

  const [type, setType] = useState<TransactionType>(editingTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editingTransaction ? editingTransaction.amount.toString() : '');
  const [title, setTitle] = useState(editingTransaction?.title || '');
  const [category, setCategory] = useState<TransactionCategory>(editingTransaction?.category || '');
  const [walletId, setWalletId] = useState<string>(editingTransaction?.walletId || mainWallet?.id || '');
  const [isInstallment, setIsInstallment] = useState<boolean>(editingTransaction?.isInstallment || false);
  const [installmentMonths, setInstallmentMonths] = useState<string>(editingTransaction?.installmentMonths?.toString() || '');
  const [installmentInterestRate, setInstallmentInterestRate] = useState<string>(editingTransaction?.installmentInterestRate?.toString() || '0');
  
  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format existing date properly in local timezone, or use today
  const initDate = editingTransaction 
    ? getLocalDateString(new Date(editingTransaction.date))
    : getLocalDateString(new Date());
  const [date, setDate] = useState(initDate);
  
  // Format existing time properly, or use current time
  const initTime = editingTransaction?.time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const [time, setTime] = useState(initTime);
  
  const [loading, setLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Derive expense and income strings from appCategories
  const { expenseCats, incomeCats } = useMemo(() => {
    const expenses: string[] = [];
    const incomes: string[] = [];
    const cats = appCategories && Object.keys(appCategories).length > 0 ? appCategories : CATEGORY_SEED;
    Object.keys(cats).forEach(key => {
      const cat = cats[key];
      if (cat.hidden) return;
      if (cat.tab === 'income') incomes.push(key);
      else expenses.push(key);
    });
    return { expenseCats: expenses, incomeCats: incomes };
  }, [appCategories]);

  useEffect(() => {
    if (!editingTransaction && expenseCats.length > 0 && !category) {
      setCategory(expenseCats[0]);
    }
  }, [expenseCats, category, editingTransaction]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income' && incomeCats.length > 0) {
      setCategory(incomeCats[0]);
    } else if (newType === 'expense' && expenseCats.length > 0) {
      setCategory(expenseCats[0]);
    }
  };

  const handleClose = () => {
    if (editingTransactionId) {
      setCurrentPage('overview');
    } else {
      setCurrentPage('home');
    }
    setEditingTransactionId(null);
  };

  const executeSave = async (parsedAmount: number, dateStr: string) => {
    setLoading(true);
    try {
      const timeStr = time;
      const colors = ['bg-[#A855F7]/20 text-[#8B5CF6]', 'bg-[#3B82F6]/20 text-[#2563EB]', 'bg-[#F43F5E]/20 text-[#E11D48]'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      if (!user) return;

      if (editingTransactionId) {
        // Edit existing transaction
        const updatePayload: any = {
          type,
          amount: parsedAmount,
          title,
          category,
          date: dateStr,
          time: timeStr,
          walletId,
          isInstallment,
        };
        
        if (isInstallment) {
          updatePayload.installmentMonths = installmentMonths ? parseInt(installmentMonths, 10) : 0;
          updatePayload.installmentInterestRate = parseFloat(installmentInterestRate) || 0;
        } else {
          updatePayload.installmentMonths = null;
          updatePayload.installmentInterestRate = null;
        }
        
        await updateTransaction(editingTransactionId, updatePayload);
        useToastStore.getState().addToast('อัปเดตรายการสำเร็จ', 'success');
      } else {
        // Add new transaction
        const addPayload: any = {
          type,
          amount: parsedAmount,
          title,
          category,
          date: dateStr,
          time: timeStr,
          iconBgColor: randomColor,
          walletId,
          isInstallment,
        };
        
        if (isInstallment) {
          addPayload.installmentMonths = installmentMonths ? parseInt(installmentMonths, 10) : 0;
          addPayload.installmentInterestRate = parseFloat(installmentInterestRate) || 0;
        }
        
        await addTransaction(user.uid, addPayload);
        useToastStore.getState().addToast('บันทึกรายการสำเร็จ', 'success');
      }

      handleClose();
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast('เกิดข้อผิดพลาดในการบันทึกรายการ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!amount) return;

    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const parsedAmount = parseFloat(amount);

    if (!editingTransactionId) {
      const isDuplicate = transactions.some(t => 
        t.type === type &&
        t.amount === parsedAmount &&
        t.date === dateStr
      );

      if (isDuplicate) {
        useConfirmStore.getState().showConfirm({
          title: 'พบรายการซ้ำซ้อน',
          message: 'มีการบันทึกรายการที่มี ยอดเงิน และ วันที่ เดียวกันไปแล้ว คุณต้องการบันทึกรายการนี้ซ้ำหรือไม่?',
          confirmText: 'บันทึกซ้ำ',
          cancelText: 'ยกเลิก',
          onConfirm: () => {
            executeSave(parsedAmount, dateStr);
          }
        });
        return; // Stop and wait for confirmation
      }
    }

    executeSave(parsedAmount, dateStr);
  };

  const { handlers: dragHandlers, style: dragStyle } = useDragToClose({
    onClose: handleClose,
  });

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Main Bottom Sheet (Glassmorphism) */}
      <div 
        {...dragHandlers}
        style={dragStyle}
        className="bg-white/80 backdrop-blur-[30px] rounded-t-[40px] border-t border-white/60 w-full max-w-md mx-auto shadow-[0_-10px_40px_rgba(31,38,135,0.15)] relative animate-slide-up flex flex-col h-[95vh]"
      >
        {/* Drag handle */}
        <div className="p-4 flex justify-center shrink-0">
          <div className="w-16 h-1.5 bg-slate-300/50 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex justify-between items-start shrink-0">
          <div className="w-full flex flex-col items-center justify-center">
            <h2 className="text-[26px] font-bold text-[#2E1065] tracking-tight text-center">
              {editingTransactionId ? t('add.editTitle', 'Edit Transaction') : t('add.title')}
            </h2>
            <p className="text-sm font-medium text-[#2E1065]/60 mt-1 text-center">
              {editingTransactionId ? t('add.editDesc', 'Update your transaction details') : t('add.desc', 'Record your income or expense')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden relative">
          <div className="overflow-y-auto px-6 pb-36 no-scrollbar flex-1 flex flex-col">
            {/* Top Toggles (Glassmorphism) */}
            <div className="flex justify-between items-end mb-8 relative">
            {type === 'transfer' ? (
              <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-[0_8px_32px_rgba(31,38,135,0.05)] w-full flex flex-col items-center justify-center gap-2">
                 <div className="w-12 h-12 rounded-[16px] shadow-sm flex items-center justify-center border border-white/50 bg-[#3B82F6]/10">
                   <ArrowLeftRight className="w-6 h-6 text-[#3B82F6]" />
                 </div>
                 <span className="font-bold text-sm text-[#3B82F6]">ชำระบัตรเครดิต / โอนเงิน</span>
                 <span className="text-[11px] text-[#2E1065]/50 text-center px-4 mt-1">
                   แก้ไขได้เฉพาะจำนวนเงิน วันที่เวลา และบันทึกช่วยจำ
                 </span>
              </div>
            ) : (
              <div className="flex gap-4 w-full">
              <button 
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex-1 rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm border ${
                  type === 'income' ? 'bg-white/80 border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.1)]' : 'bg-white/30 border-white/40 hover:bg-white/40 backdrop-blur-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-[16px] shadow-sm flex items-center justify-center border border-white/50 transition-colors ${type === 'income' ? 'bg-emerald-500/10' : 'bg-white/50'}`}>
                  <PlusCircle className={`w-6 h-6 ${type === 'income' ? 'text-emerald-500' : 'text-[#2E1065]/40'}`} />
                </div>
                <span className={`font-bold text-sm ${type === 'income' ? 'text-emerald-600' : 'text-[#2E1065]/60'}`}>{t('add.income')}</span>
              </button>
              
              <button 
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex-1 rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm border ${
                  type === 'expense' ? 'bg-white/80 border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.1)]' : 'bg-white/30 border-white/40 hover:bg-white/40 backdrop-blur-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-[16px] shadow-sm flex items-center justify-center border border-white/50 transition-colors ${type === 'expense' ? 'bg-[#F43F5E]/10' : 'bg-white/50'}`}>
                  <MinusCircle className={`w-6 h-6 ${type === 'expense' ? 'text-[#F43F5E]' : 'text-[#2E1065]/40'}`} />
                </div>
                <span className={`font-bold text-sm ${type === 'expense' ? 'text-[#F43F5E]' : 'text-[#2E1065]/60'}`}>{t('add.expense')}</span>
              </button>
              </div>
            )}
            </div>

            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-[0_8px_32px_rgba(31,38,135,0.05)] flex flex-col gap-5">
              
              <div className="mb-2">
                <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                    <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  {t('add.dateTime', 'วันที่และเวลา')}
                </label>
                <div className="flex gap-2">
                  <div className="flex-[5]">
                    <CustomDatePicker 
                      value={date}
                      onChange={(val) => setDate(val)}
                    />
                  </div>
                  <div className="flex-[3]">
                    <CustomTimePicker 
                      value={time}
                      onChange={(val) => setTime(val)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                    <CreditCard className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  {t('add.wallet')}
                </label>
                <CustomSelect 
                  value={walletId}
                  disabled={type === 'transfer'}
                  onChange={setWalletId}
                  options={wallets
                    .filter(w => type !== 'income' || w.type !== 'credit_card')
                    .map(w => {
                    const iconName = w.icon === 'CreditCard' ? 'Landmark' : w.icon;
                    const WIcon = (Icons as any)[iconName] || Icons.Wallet;
                    return {
                      label: w.name,
                      value: w.id,
                      iconNode: <WIcon className={`w-4 h-4 ${w.color.replace('bg-', 'text-')}`} />
                    };
                  })}
                  placeholder="เลือกกระเป๋าเงิน"
                />
              </div>


              <div>
                <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                    <FileText className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  {t('add.category')}
                </label>
                <button 
                  type="button"
                  onClick={() => type !== 'transfer' && setIsCategoryModalOpen(true)}
                  className={`w-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-[16px] px-4 py-3.5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 transition-all shadow-inner min-h-[60px] ${type === 'transfer' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {category ? (
                    <span className="flex items-center gap-3 font-bold text-[#2E1065]">
                      {(() => {
                        const { icon: Icon, color, textColor } = getCategoryStyle(category, appCategories || undefined);
                        return (
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm ${color} ${textColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        );
                      })()}
                      {category}
                    </span>
                  ) : (
                    <span className="font-bold text-[#2E1065]/40">{t('add.selectCategory', 'Select Category')}</span>
                  )}
                  <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                    <PlusCircle className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  </button>
                  
                  {/* Quick Select Favorites */}
                  {favoriteCategories.length > 0 && type !== 'transfer' && (
                    <div className="flex flex-wrap gap-2 mt-4 animate-fade-in">
                      {favoriteCategories.filter(cat => {
                        if (type === 'expense') return expenseCats.includes(cat);
                        if (type === 'income') return incomeCats.includes(cat);
                        return true;
                      }).map((cat) => {
                        const isSelected = category === cat;
                        const { color, textColor } = getCategoryStyle(cat, appCategories || undefined);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat as TransactionCategory)}
                            className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all active:scale-95 ${
                              isSelected 
                                ? `${color} ${textColor} border-transparent shadow-md scale-105` 
                                : 'bg-white/50 border-white/60 text-[#2E1065]/70 hover:bg-white/80 shadow-sm'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              <div>
                <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                    <AlignLeft className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  {t('add.amount', 'Amount')}
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${type === 'income' ? 'text-emerald-600' : type === 'expense' ? 'text-rose-500' : 'text-[#2E1065]/50'}`}>
                    {type === 'income' ? '+' : type === 'expense' ? '-' : ''}฿
                  </span>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full bg-white/60 backdrop-blur-sm rounded-[16px] px-10 py-3.5 font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 border border-white/50 shadow-inner ${type === 'income' ? 'text-emerald-600 placeholder:text-emerald-600/50' : type === 'expense' ? 'text-rose-500 placeholder:text-rose-500/50' : 'text-[#2E1065] placeholder:text-[#2E1065]/40'}`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {type === 'expense' && wallets.find(w => w.id === walletId)?.type === 'credit_card' && (
                <div className="bg-amber-50/50 p-4 rounded-[20px] border border-amber-200/50 animate-fade-in relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-[#2E1065] text-sm">ทำรายการผ่อนชำระ</h4>
                      <p className="text-[11px] text-[#2E1065]/50 mt-0.5">แบ่งจ่ายรายเดือน</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInstallment(!isInstallment)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isInstallment ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isInstallment ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {isInstallment && (
                    <div className="mt-4 animate-fade-in flex flex-col gap-3">
                      <div>
                        <label className="block text-sm font-bold text-[#2E1065] mb-2">จำนวนงวด</label>
                        <input
                          type="number"
                          value={installmentMonths}
                          onChange={(e) => setInstallmentMonths(e.target.value)}
                          className="w-full bg-white/70 backdrop-blur-md rounded-[16px] px-4 py-3 text-[#2E1065] font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/40 border border-amber-100/50 shadow-inner text-lg placeholder:text-[#2E1065]/30"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#2E1065] mb-2">อัตราดอกเบี้ยต่อเดือน (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={installmentInterestRate}
                          onChange={(e) => setInstallmentInterestRate(e.target.value)}
                          className="w-full bg-white/70 backdrop-blur-md rounded-[16px] px-4 py-3 text-[#2E1065] font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/40 border border-amber-100/50 shadow-inner text-lg placeholder:text-[#2E1065]/30"
                          placeholder="0.00"
                        />
                      </div>

                      {amount && installmentMonths && (
                        <div className="mt-2 bg-amber-100/50 p-3 rounded-[12px] flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-800">ยอดผ่อนชำระต่อเดือนโดยประมาณ</span>
                          <span className="font-extrabold text-amber-600">
                            ฿{((parseFloat(amount) / parseInt(installmentMonths)) + (parseFloat(amount) * (parseFloat(installmentInterestRate || '0') / 100))).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                      <Pencil className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    {t('add.memo', 'Memo')}
                  </label>
                  <span className={`text-xs font-semibold ${title.length >= 50 ? 'text-red-500' : 'text-[#2E1065]/40'}`}>
                    {title.length}/50
                  </span>
                </div>
                <textarea 
                  maxLength={50}
                  rows={3}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/60 backdrop-blur-sm rounded-[16px] px-4 py-3.5 text-[#2E1065] font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 border border-white/50 shadow-inner resize-none min-h-[100px]"
                  placeholder="บันทึกรายละเอียดเพิ่มเติม (ถ้ามี)..."
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 flex z-10 pointer-events-none bg-gradient-to-t from-white/90 via-white/70 to-transparent pb-8">
            <button
            type="submit"
            disabled={loading}
            className={`pointer-events-auto w-full py-4 rounded-[24px] text-white font-bold text-lg shadow-[0_8px_20px_rgba(31,38,135,0.15)] border border-white/30 transition-transform active:scale-95 flex items-center justify-center gap-2 ${
              type === 'income' ? 'bg-gradient-to-tr from-emerald-400 to-emerald-500' : 'bg-gradient-to-tr from-orange-400 to-rose-500'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {editingTransactionId ? t('add.update', 'Update Transaction') : t('add.save')}
              </>
            )}
          </button>
          </div>
        </form>
      </div>
      
      {/* Category Select Modal */}
      <CategorySelectModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelect={(cat) => {
          setCategory(cat);
          setIsCategoryModalOpen(false);
        }}
        type={type}
        selectedCategory={category}
      />
    </div>,
    document.body
  );
}
