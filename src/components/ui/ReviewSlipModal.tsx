import { createPortal } from 'react-dom';
import { AlignLeft, Calendar, FileText, Wallet as WalletIcon, ChevronRight, Check, Search, Pencil, Building2, CreditCard, X, ChevronLeft, ChevronRight as ChevronRightIcon, Trash2 } from 'lucide-react';
import { getCategoryStyle } from '@/utils/categoryStyles';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { addTransaction, setUserFavorites } from '@/services/transactionService';
import { useWalletStore } from '@/store/useWalletStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import type { TransactionCategory, Wallet } from '@/types';
import CategorySelectModal from './CategorySelectModal';
import CustomSelect from './CustomSelect';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomTimePicker from '@/components/ui/CustomTimePicker';
import AutoShrinkText from '@/components/ui/AutoShrinkText';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function ReviewSlipModal() {
  const { t } = useTranslation();
  const isReviewModalOpen = useAppStore((s) => s.isReviewModalOpen);
  const setReviewModalOpen = useAppStore((s) => s.setReviewModalOpen);
  const scannedSlips = useAppStore((s) => s.scannedSlips);
  const currentScanIndex = useAppStore((s) => s.currentScanIndex);
  const setCurrentScanIndex = useAppStore((s) => s.setCurrentScanIndex);
  const updateScannedSlip = useAppStore((s) => s.updateScannedSlip);
  const removeScannedSlip = useAppStore((s) => s.removeScannedSlip);
  const favoriteCategories = useAppStore((s) => s.favoriteCategories);
  const addFavoriteCategory = useAppStore((s) => s.addFavoriteCategory);
  const appCategories = useAppStore((s) => s.appCategories);
  const user = useAuthStore((s) => s.user);
  const transactions = useTransactionStore((s) => s.transactions);
  
  const wallets = useWalletStore((s) => s.wallets);
  const mainWallet = wallets.find(w => w.isMain) || wallets[0];

  const [isEditing, setIsEditing] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync scroll position when index changes externally
  useEffect(() => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: currentScanIndex * width,
        behavior: 'smooth'
      });
    }
  }, [currentScanIndex]);

  if (!isReviewModalOpen || scannedSlips.length === 0) return null;

  const currentSlip = scannedSlips[currentScanIndex] || {};

  const handleClose = () => {
    setReviewModalOpen(false);
    useAppStore.getState().setScannedSlips([]);
    setIsEditing(false);
  };

  const handleSaveCurrent = async () => {
    if (!user) {
      alert('Please log in to save transactions');
      return;
    }
    if (!currentSlip.category) {
      alert(t('review.requireCategory'));
      return;
    }
    let finalDate = new Date().toISOString().split('T')[0];
    let finalTime = new Date().toTimeString().split(' ')[0];
    
    if (currentSlip.date) {
      const d = new Date(currentSlip.date);
      if (!isNaN(d.getTime())) {
        finalDate = currentSlip.date.split('T')[0] || finalDate;
        finalTime = currentSlip.date.split('T')[1]?.slice(0,5) || finalTime;
      }
    }

    const title = currentSlip.title || t('review.defaultTitle');
    const parsedAmount = Number(currentSlip.amount) || 0;

    const executeSave = async () => {
      setLoading(true);
      try {
        addFavoriteCategory(currentSlip.category!);
        if (user) {
          setTimeout(() => {
            setUserFavorites(user.uid, useAppStore.getState().favoriteCategories);
          }, 0);
        }

        await addTransaction(user!.uid, {
          type: 'expense',
          amount: parsedAmount,
          title: title,
          category: currentSlip.category as TransactionCategory,
          date: finalDate,
          time: finalTime,
          note: currentSlip.note || '',
          walletId: currentSlip.walletId || mainWallet.id,
        });
        
        setIsEditing(false);
        removeScannedSlip(currentScanIndex);
      } catch (error) {
        alert('Failed to save transaction');
      } finally {
        setLoading(false);
      }
    };

    const isDuplicate = transactions.some(t => 
      t.type === 'expense' &&
      t.amount === parsedAmount &&
      t.date === finalDate &&
      t.title === title
    );

    if (isDuplicate) {
      useConfirmStore.getState().showConfirm({
        title: 'พบรายการซ้ำซ้อน',
        message: 'มีการบันทึกรายการที่มี ยอดเงิน วันที่ และชื่อเดียวกันไปแล้วในวันนี้ คุณต้องการบันทึกรายการนี้ซ้ำหรือไม่?',
        confirmText: 'บันทึกซ้ำ',
        cancelText: 'ยกเลิก',
        onConfirm: () => {
          executeSave();
        }
      });
      return;
    }

    executeSave();
  };

  const handleSkipCurrent = () => {
    setIsEditing(false);
    removeScannedSlip(currentScanIndex);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== currentScanIndex && newIndex >= 0 && newIndex < scannedSlips.length) {
        setCurrentScanIndex(newIndex);
        setIsEditing(false);
      }
    }
  };

  const setCategory = (cat: string) => updateScannedSlip(currentScanIndex, { category: cat });
  const setTitle = (t: string) => updateScannedSlip(currentScanIndex, { title: t });
  const setAmountStr = (a: string) => updateScannedSlip(currentScanIndex, { amount: Number(a) });
  const setDateStr = (d: string) => updateScannedSlip(currentScanIndex, { date: d });
  const setBankStr = (b: string) => updateScannedSlip(currentScanIndex, { bank: b });
  const setNoteStr = (n: string) => updateScannedSlip(currentScanIndex, { note: n });
  const setWalletStr = (wId: string) => updateScannedSlip(currentScanIndex, { walletId: wId });

  let displayDate = '';
  if (currentSlip.date) {
    const d = new Date(currentSlip.date);
    if (!isNaN(d.getTime())) {
      displayDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear() + 543} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
  }

  let dateStr = '';
  if (currentSlip.date) {
    const d = new Date(currentSlip.date);
    if (!isNaN(d.getTime())) {
      dateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0,16);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Main Bottom Sheet (Glassmorphism) */}
      <div className="bg-white/80 backdrop-blur-[30px] rounded-t-[40px] border-t border-white/60 w-full max-w-md mx-auto shadow-[0_-10px_40px_rgba(31,38,135,0.15)] relative animate-slide-up flex flex-col max-h-[95vh]">
        {/* Drag handle */}
        <div className="p-4 flex justify-center shrink-0">
          <div className="w-16 h-1.5 bg-slate-300/50 rounded-full" />
        </div>

        <div className="px-6 pb-4 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-[26px] font-bold text-[#2E1065] tracking-tight">
              {t('review.title')} {scannedSlips.length > 1 && <span className="text-sm ml-2 px-2 py-0.5 bg-white/20 rounded-full">{currentScanIndex + 1}/{scannedSlips.length}</span>}
            </h2>
            <p className="text-sm font-medium text-[#2E1065]/60 mt-1">{t('review.subtitle')}</p>
          </div>
          <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center rounded-full border border-red-200/50 text-red-500 bg-red-50/50 hover:bg-red-100/50 backdrop-blur-md transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto pb-32 no-scrollbar">
          <div className="relative mb-6">
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full scroll-smooth"
            >
            {scannedSlips.map((slip, idx) => {
              let dDate = '';
              if (slip.date) {
                const d = new Date(slip.date);
                if (!isNaN(d.getTime())) {
                  const thaiDate = d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
                  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                  dDate = `${thaiDate} ${time}`;
                }
              }

              return (
                <div key={idx} className="w-full shrink-0 snap-center px-6">
                  <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-[32px] p-5 shadow-[0_4px_20px_rgba(31,38,135,0.05)] flex gap-5 h-full relative">
                    <button 
                      onClick={() => setIsImageViewerOpen(true)}
                      className="w-[110px] shrink-0 bg-white/50 border border-white/50 rounded-2xl p-2 relative overflow-hidden flex flex-col items-center group cursor-pointer active:scale-95 transition-transform shadow-sm"
                    >
                      {slip.imageUrl ? (
                        <img src={slip.imageUrl} alt="Slip" className="w-full h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity" />
                      ) : (
                        <div className="w-full h-32 bg-white/40 rounded-lg flex items-center justify-center text-xs font-semibold text-[#2E1065]/40">No Image</div>
                      )}
                    </button>

                    <div className="flex-1 py-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-[28px] leading-tight font-bold text-[#2E1065] drop-shadow-sm truncate w-full">
                          {Number(slip.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}<span className="text-xl text-[#2E1065]/50"> {t('stats.currency')}</span>
                        </h3>
                        <AutoShrinkText 
                          text={slip.title || t('review.noMerchant')} 
                          className="text-sm font-bold text-[#2E1065]" 
                        />
                      </div>
                      <div className="flex flex-col gap-2 text-[13px] text-[#2E1065]/70 font-semibold">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{dDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <WalletIcon className="w-3.5 h-3.5" />
                          <span>{t('review.via')} <span className="font-bold text-[#2E1065]">{slip.bank || 'Slip'}</span></span>
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <div className="text-xs font-bold text-[#2E1065]/60 mb-0.5">{t('review.category')}</div>
                        <div className="text-sm font-bold text-[#8B5CF6]">
                            {slip.category ? slip.category : t('review.noCategory')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          <div className="px-6">
            <div className="mb-6 bg-white/30 backdrop-blur-md rounded-[28px] p-5 border border-white/50 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#2E1065]">{t('review.category')}</h3>
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border shadow-sm transition-colors ${
                    currentSlip.category 
                    ? 'bg-white/60 text-[#8B5CF6] border-white/60' 
                    : 'bg-[#FBBF24]/20 text-[#D97706] border-[#FBBF24]/30'
                  }`}
                >
                  {currentSlip.category ? (
                    <>
                      {(() => {
                        const { icon: Icon, textColor } = getCategoryStyle(currentSlip.category!, appCategories || undefined);
                        return <Icon className={`w-4 h-4 ${textColor.replace('text-', 'text-')}`} />;
                      })()}
                      {currentSlip.category}
                    </>
                  ) : (
                    <>{t('review.selectCategory')} <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
              
              {/* Quick Select Favorites */}
              {favoriteCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 animate-fade-in">
                  {favoriteCategories.map((cat) => {
                    const isSelected = currentSlip.category === cat;
                    const { color, textColor } = getCategoryStyle(cat, useAppStore.getState().appCategories || undefined);
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
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

            {isEditing && (
              <div className="animate-fade-in border-t border-white/30 pt-6">
                <div className="mb-5">
                  <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                      <Building2 className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    {t('review.merchant')}
                  </label>
                  <input 
                    type="text"
                    value={currentSlip.title || ''}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/50 border border-white/60 rounded-[20px] px-5 py-4 text-[#2E1065] font-bold focus:outline-none focus:ring-4 focus:ring-purple-500/20 shadow-sm"
                    placeholder={t('review.merchantPlaceholder')}
                  />
                </div>

                <div className="mb-5">
                  <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                      <AlignLeft className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    {t('review.amount')}
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={currentSlip.amount || ''}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full bg-white/50 border border-white/60 rounded-[20px] px-5 py-4 text-[#2E1065] font-bold focus:outline-none focus:ring-4 focus:ring-purple-500/20 shadow-sm"
                    placeholder="0.00"
                  />
                </div>

                <div className="mb-5">
                  <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                      <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    {t('review.dateTime')}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-[5]">
                      <CustomDatePicker 
                        value={dateStr ? new Date(dateStr) : new Date()} 
                        onChange={(date) => {
                          const d = dateStr ? new Date(dateStr) : new Date();
                          const newD = new Date(date);
                          newD.setHours(d.getHours(), d.getMinutes());
                          const iso = new Date(newD.getTime() - (newD.getTimezoneOffset() * 60000)).toISOString().slice(0,16);
                          setDateStr(iso);
                        }}
                      />
                    </div>
                    <div className="flex-[3]">
                      <CustomTimePicker 
                        value={dateStr && dateStr.includes('T') ? dateStr.split('T')[1].slice(0,5) : ''}
                        onChange={(newTime) => {
                          const d = dateStr ? dateStr.split('T')[0] : new Date().toISOString().split('T')[0];
                          if (newTime) {
                            setDateStr(`${d}T${newTime}`);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                      <CreditCard className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    {t('review.wallet')}
                  </label>
                  <CustomSelect 
                    value={currentSlip.walletId || mainWallet.id}
                    onChange={setWalletStr}
                    options={wallets.map(w => ({
                      label: w.name,
                      value: w.id,
                      iconNode: w.icon === 'CreditCard' ? <CreditCard className="w-4 h-4" /> : <WalletIcon className="w-4 h-4" />
                    }))}
                    placeholder={t('review.walletPlaceholder')}
                  />
                </div>

                <div className="mb-5">
                  <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                      <CreditCard className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    {t('review.paidVia')}
                  </label>
                  <input 
                    type="text"
                    value={currentSlip.bank || ''}
                    onChange={(e) => setBankStr(e.target.value)}
                    className="w-full bg-white/50 border border-white/60 rounded-[20px] px-5 py-4 text-[#2E1065] font-bold focus:outline-none focus:ring-4 focus:ring-purple-500/20 shadow-sm"
                    placeholder={t('review.paidViaPlaceholder')}
                  />
                </div>

                <div className="mb-5">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold text-[#2E1065] flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center border border-white/50 shadow-sm">
                        <Pencil className="w-4 h-4 text-[#8B5CF6]" />
                      </div>
                      {t('review.memo')}
                    </label>
                    <span className={`text-xs font-semibold ${(currentSlip.note?.length || 0) >= 50 ? 'text-red-500' : 'text-[#2E1065]/40'}`}>
                      {currentSlip.note?.length || 0}/50
                    </span>
                  </div>
                    <textarea 
                      maxLength={50}
                      value={currentSlip.note || ''}
                      onChange={(e) => setNoteStr(e.target.value)}
                      className="w-full bg-white/50 border border-white/60 rounded-[20px] px-5 py-4 text-[#2E1065] font-bold focus:outline-none focus:ring-4 focus:ring-purple-500/20 shadow-sm min-h-[100px] resize-none"
                      placeholder={`${t('review.memoPlaceholder')} (ไม่บังคับ)`}
                    />
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Footer Actions (Transparent) */}
        <div className="absolute bottom-0 left-0 right-0 p-5 flex gap-3 z-10 pointer-events-none">
          {!isEditing ? (
            <>
              {scannedSlips.length > 1 && (
                <button 
                  onClick={handleSkipCurrent}
                  className="pointer-events-auto w-14 h-14 shrink-0 rounded-[20px] border border-white/60 bg-white/40 backdrop-blur-md text-[#2E1065] font-bold hover:bg-white/60 transition-colors flex justify-center items-center shadow-sm"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              )}
              <button 
                onClick={() => setIsEditing(true)}
                className="pointer-events-auto flex-[1] py-4 rounded-[20px] border border-white/60 bg-white/40 backdrop-blur-md text-[#2E1065] font-bold hover:bg-white/60 transition-colors flex justify-center items-center gap-2 shadow-sm"
              >
                <Pencil className="w-4 h-4" /> {t('review.edit')}
              </button>
              <button 
                onClick={handleSaveCurrent}
                disabled={loading}
                className="pointer-events-auto flex-[2] py-4 rounded-[20px] bg-gradient-to-tr from-[#A855F7] to-[#8B5CF6] text-white font-bold shadow-[0_8px_20px_rgba(139,92,246,0.3)] border border-white/30 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? t('add.saving') : scannedSlips.length > 1 ? t('review.saveNext') : t('review.save')}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="pointer-events-auto flex-[1] py-4 rounded-[20px] border border-white/60 bg-white/40 backdrop-blur-md text-[#2E1065] font-bold hover:bg-white/60 transition-colors shadow-sm"
              >
                {t('review.minimize')}
              </button>
              <button 
                onClick={handleSaveCurrent}
                disabled={loading}
                className="pointer-events-auto flex-[2] py-4 rounded-[20px] bg-gradient-to-tr from-[#A855F7] to-[#8B5CF6] text-white font-bold shadow-[0_8px_20px_rgba(139,92,246,0.3)] border border-white/30 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? t('add.saving') : scannedSlips.length > 1 ? t('review.saveNext') : t('review.done')}
              </button>
            </>
          )}
        </div>
      </div>

      <CategorySelectModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelect={(cat) => setCategory(cat)}
        type="expense"
        selectedCategory={currentSlip.category}
      />

      {/* Image Viewer Modal */}
      {isImageViewerOpen && currentSlip.imageUrl && createPortal(
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setIsImageViewerOpen(false)}
          />
          <button 
            onClick={() => setIsImageViewerOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/20 transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative z-10 p-4 max-h-[90vh] w-full max-w-lg mx-auto flex items-center justify-center animate-slide-up">
            <img 
              src={currentSlip.imageUrl} 
              alt="Slip Full" 
              className="max-w-full max-h-[85vh] object-contain rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20" 
            />
          </div>
        </div>,
        document.body
      )}
    </div>,
    document.body
  );
}
