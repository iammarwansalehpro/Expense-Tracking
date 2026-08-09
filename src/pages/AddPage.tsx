import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import { X, CreditCard, Loader2, Sparkles, PlusCircle, MinusCircle, Calendar, AlignLeft, Pencil, FileText, Wallet as WalletIcon, Clock } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomTimePicker from '@/components/ui/CustomTimePicker';
import CategorySelectModal from '@/components/ui/CategorySelectModal';
import { getCategoryStyle } from '@/utils/categoryStyles';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useTranslation } from '@/hooks/useTranslation';
import { addTransaction, updateTransaction } from '@/services/transactionService';
import { useToastStore } from '@/store/useToastStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import type { TransactionType, TransactionCategory, Wallet } from '@/types';

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
  
  // Format existing date properly, or use today
  const initDate = editingTransaction 
    ? new Date(editingTransaction.date).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];
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
    if (appCategories) {
      Object.keys(appCategories).forEach(key => {
        const cat = appCategories[key];
        if (cat.tab === 'income') incomes.push(key);
        else if (cat.tab === 'fixed' || cat.tab === 'lifestyle' || cat.tab === 'savings' || cat.tab === 'all') expenses.push(key);
      });
    }
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
        await updateTransaction(editingTransactionId, {
          type,
          amount: parsedAmount,
          title,
          category,
          date: dateStr,
          time: timeStr,
          walletId
        });
        useToastStore.getState().addToast('อัปเดตรายการสำเร็จ', 'success');
      } else {
        // Add new transaction
        await addTransaction(user.uid, {
          type,
          amount: parsedAmount,
          title,
          category,
          date: dateStr,
          time: timeStr,
          iconBgColor: randomColor,
          walletId
        });
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
        t.date === dateStr &&
        t.title === title
      );

      if (isDuplicate) {
        useConfirmStore.getState().showConfirm({
          title: 'พบรายการซ้ำซ้อน',
          message: 'มีการบันทึกรายการที่มี ยอดเงิน วันที่ และชื่อเดียวกันไปแล้วในวันนี้ คุณต้องการบันทึกรายการนี้ซ้ำหรือไม่?',
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Main Bottom Sheet (Glassmorphism) */}
      <div className="bg-white/80 backdrop-blur-[30px] rounded-t-[40px] border-t border-white/60 w-full max-w-md mx-auto shadow-[0_-10px_40px_rgba(31,38,135,0.15)] relative animate-slide-up flex flex-col h-[95vh]">
        {/* Drag handle */}
        <div className="p-4 flex justify-center shrink-0">
          <div className="w-16 h-1.5 bg-slate-300/50 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-[26px] font-bold text-[#2E1065] tracking-tight">
              {editingTransactionId ? t('add.editTitle', 'Edit Transaction') : t('add.title')}
            </h2>
            <p className="text-sm font-medium text-[#2E1065]/60 mt-1">
              {editingTransactionId ? t('add.editDesc', 'Update your transaction details') : t('add.desc', 'Record your income or expense')}
            </p>
          </div>
          <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center rounded-full border border-red-200/50 text-red-500 bg-red-50/50 hover:bg-red-100/50 backdrop-blur-md transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden relative">
          <div className="overflow-y-auto px-6 pb-32 no-scrollbar flex-1 flex flex-col">
            {/* Top Toggles (Glassmorphism) */}
            <div className="flex justify-between items-end mb-8 relative">
              <div className="flex gap-4 w-full">
              <button 
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex-1 rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm border ${
                  type === 'income' ? 'bg-white/80 border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.1)]' : 'bg-white/30 border-white/40 hover:bg-white/40 backdrop-blur-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-[16px] shadow-sm flex items-center justify-center border border-white/50 transition-colors ${type === 'income' ? 'bg-[#8B5CF6]/10' : 'bg-white/50'}`}>
                  <PlusCircle className={`w-6 h-6 ${type === 'income' ? 'text-[#8B5CF6]' : 'text-[#2E1065]/40'}`} />
                </div>
                <span className={`font-bold text-sm ${type === 'income' ? 'text-[#8B5CF6]' : 'text-[#2E1065]/60'}`}>{t('add.income')}</span>
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
            </div>

            <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-[0_8px_32px_rgba(31,38,135,0.05)] flex flex-col gap-5">
              
              <CustomDatePicker 
                label={
                  <span className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                      <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    {t('add.date')}
                  </span>
                }
                value={date}
                onChange={(val) => setDate(val)}
              />

              <div>
                <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                    <Clock className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  {t('add.time', 'เวลา')}
                </label>
                <div className="relative">
                  <CustomTimePicker 
                    value={time}
                    onChange={(val) => setTime(val)}
                  />
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
                  onChange={setWalletId}
                  options={wallets.map(w => {
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
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-[16px] px-4 py-3.5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 transition-all shadow-inner h-14"
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
                  {favoriteCategories.length > 0 && (
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
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2E1065]/50 font-bold">฿</span>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/60 backdrop-blur-sm rounded-[16px] px-10 py-3.5 text-[#2E1065] font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 border border-white/50 shadow-inner"
                    placeholder="0.00"
                  />
                </div>
              </div>

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
                  placeholder="เช่น เงินเดือน, ค่ากาแฟ, ซื้อของเข้าบ้าน (ไม่บังคับ)"
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 flex z-10 pointer-events-none">
            <button
            type="submit"
            disabled={loading}
            className={`pointer-events-auto w-full py-4 rounded-[24px] text-white font-bold text-lg shadow-[0_8px_20px_rgba(31,38,135,0.15)] border border-white/30 transition-transform active:scale-95 flex items-center justify-center gap-2 ${
              type === 'income' ? 'bg-gradient-to-tr from-indigo-500 to-purple-500' : 'bg-gradient-to-tr from-orange-400 to-rose-500'
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
