import { Grid, Bell, ChevronDown, ChevronUp, ArrowDown, ArrowUp, Eye, Landmark, Wallet as WalletIcon, ChevronRight, Edit2, Trash2, Plus, ArrowLeftRight, CreditCard as CreditCardIcon, ArrowRight } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAppStore } from '@/store/useAppStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { getIconComponent, getCategoryStyle } from '@/utils/categoryStyles';
import WalletFormModal from '@/components/ui/WalletFormModal';
import AppHeader from '@/components/layout/AppHeader';
import { useConfirmStore } from '@/store/useConfirmStore';
import { useToastStore } from '@/store/useToastStore';
import AutoShrinkText from '@/components/ui/AutoShrinkText';
import { useRef, useState, useEffect } from 'react';
import CreditCardDueAlert from '@/components/home/CreditCardDueAlert';
import CreditCardPaymentModal from '@/components/ui/CreditCardPaymentModal';
import TransactionDetailsModal from '@/components/ui/TransactionDetailsModal';
import { calculateCreditCardStats } from '@/utils/creditCardUtils';
export default function HomePage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const appName = useAppStore(s => s.appName);
  const appSlogan = useAppStore(s => s.appSlogan);
  const appIconName = useAppStore(s => s.appIcon);
  const appCategories = useAppStore(s => s.appCategories);
  const setCurrentPage = useAppStore(s => s.setCurrentPage);
  
  const { t, language } = useTranslation();
  const setLanguage = useSettingsStore(s => s.setLanguage);

  const wallets = useWalletStore(s => s.wallets);
  const mainWallet = wallets.find(w => w.isMain) || wallets[0];
  
  const [activeWalletId, setActiveWalletId] = useState<string>(mainWallet?.id || '');
  
  // Wallet Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any>(null);
  
  const [paymentCreditCardId, setPaymentCreditCardId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [expandedWalletId, setExpandedWalletId] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const toggleExpand = (walletId: string) => {
    setExpandedWalletId(prev => prev === walletId ? null : walletId);
  };

  const handlePayClick = (walletId: string) => {
    setPaymentCreditCardId(walletId);
    setIsPaymentModalOpen(true);
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const deleteWallet = useWalletStore(s => s.deleteWallet);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    
    // Add small offset to ensure we capture the middle of the card correctly
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.clientWidth;
    const index = Math.round(scrollPosition / cardWidth);
    
    if (index >= 0 && index < wallets.length) {
      if (activeWalletId !== wallets[index].id) {
        setActiveWalletId(wallets[index].id);
      }
    } else if (index === wallets.length) {
      // It's the "Add New" card
      if (activeWalletId !== 'add') {
        setActiveWalletId('add');
      }
    }
  };

  // Sync active wallet if main changes or wallet is deleted
  useEffect(() => {
    if (!wallets.find(w => w.id === activeWalletId)) {
      setActiveWalletId(mainWallet?.id || '');
    }
  }, [wallets, activeWalletId, mainWallet]);

  // Initial scroll to active wallet
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeIdx = wallets.findIndex(w => w.id === activeWalletId);
      if (activeIdx > 0) { // If it's 0, it's already there
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              left: activeIdx * scrollContainerRef.current.clientWidth,
              behavior: 'instant'
            });
          }
        }, 50);
      }
    }
  }, []);

  const activeWallet = wallets.find(w => w.id === activeWalletId) || mainWallet;
  
  const AppIcon = getIconComponent(appIconName);

  // Dynamic balance calculation
  const getWalletStats = (walletId: string) => {
    const txs = transactions.filter(t => t.walletId === walletId || (!t.walletId && mainWallet.id === walletId));
    
    const allTimeIncome = txs.filter(t => t.type === 'income' || (t.type === 'transfer' && t.toWalletId === walletId)).reduce((sum, t) => sum + t.amount, 0);
    const allTimeExpense = txs.filter(t => t.type === 'expense' || (t.type === 'transfer' && t.fromWalletId === walletId)).reduce((sum, t) => sum + t.amount, 0);
    const balance = allTimeIncome - allTimeExpense;

    const now = new Date();
    const currentMonthTxs = txs.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const income = currentMonthTxs.filter(t => t.type === 'income' || (t.type === 'transfer' && t.toWalletId === walletId)).reduce((sum, t) => sum + t.amount, 0);
    const expense = currentMonthTxs.filter(t => t.type === 'expense' || (t.type === 'transfer' && t.fromWalletId === walletId)).reduce((sum, t) => sum + t.amount, 0);
    
    return { balance, income, expense };
  };

  const totalStats = wallets.reduce((acc, w) => {
    const stats = getWalletStats(w.id);
    return {
      balance: acc.balance + stats.balance,
      income: acc.income + stats.income,
      expense: acc.expense + stats.expense
    };
  }, { balance: 0, income: 0, expense: 0 });

  const activeWalletStats = getWalletStats(activeWallet?.id || '');

  // Take only first 4 items for home screen
  // Filter out the destination side of transfers for global display to avoid duplicates
  const displayTransactions = transactions.filter(t => t.type !== 'transfer' || t.walletId === t.fromWalletId);
  const recentTransactions = displayTransactions.slice(0, 4);

  return (
    <div className="flex flex-col h-full bg-transparent animate-fade-in">
      <AppHeader />

      {/* Main Scrollable Area */}
      <div className="flex-1 flex flex-col pt-2 pb-32 overflow-y-auto no-scrollbar">
        
        <CreditCardDueAlert onPayClick={handlePayClick} />

        {/* Wallet Carousel */}
        <div className="w-full mb-8 relative">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-8 pt-4 -mt-4 items-stretch"
          >
            {wallets.map(wallet => {
              const stats = getWalletStats(wallet.id);
              const WIcon = wallet.icon === 'CreditCard' ? Landmark : (wallet.icon === 'CreditCardIcon' ? CreditCardIcon : WalletIcon);
              
              const isCreditCard = wallet.type === 'credit_card';
              
              let installmentDebt = 0;
              let normalDebt = 0;
              let outstandingBalance = Math.abs(stats.balance < 0 ? stats.balance : 0);
              
              if (isCreditCard) {
                const cardStats = calculateCreditCardStats(wallet, transactions);
                installmentDebt = cardStats.installmentDebt;
                normalDebt = cardStats.normalDebt;
                outstandingBalance = cardStats.outstandingBalance;
              }
              
              const hasInstallment = installmentDebt > 0;

              return (
                <div key={wallet.id} className="w-full shrink-0 snap-center px-6 h-full">
                  <div className={`w-full h-full flex flex-col bg-white/40 backdrop-blur-xl rounded-[32px] p-6 text-[#2E1065] shadow-[0_8px_32px_rgba(31,38,135,0.1)] border border-white/50 relative transition-colors ${wallet.color}`}>
                    
                    {/* Inline Actions (Edit/Delete) */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                      {!isCreditCard && (
                        <button 
                          onClick={() => {
                            useAppStore.getState().setTransferModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50 transition-all text-[#2E1065]/70 hover:text-[#8B5CF6] hover:bg-white"
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setEditingWallet(wallet);
                          setIsFormOpen(true);
                        }}
                        className="w-8 h-8 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50 transition-all text-[#2E1065]/70 hover:text-[#8B5CF6] hover:bg-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {wallets.length > 1 && !wallet.isMain && (
                        <button 
                          onClick={() => {
                            useConfirmStore.getState().showConfirm({
                              title: t('home.confirmDeleteWallet') || 'Delete Wallet',
                              message: 'คุณแน่ใจหรือไม่ว่าต้องการลบกระเป๋าเงินนี้? ข้อมูลที่เกี่ยวข้องจะไม่สามารถกู้คืนได้',
                              confirmText: 'ลบกระเป๋าเงิน',
                              cancelText: 'ยกเลิก',
                              isDestructive: true,
                              onConfirm: () => {
                                deleteWallet(wallet.id);
                                useToastStore.getState().addToast('ลบกระเป๋าเงินเรียบร้อยแล้ว', 'success');
                                // Scroll back to main wallet
                                const mainIdx = wallets.findIndex(w => w.isMain);
                                if (scrollContainerRef.current) {
                                  scrollContainerRef.current.scrollTo({
                                    left: Math.max(0, mainIdx) * scrollContainerRef.current.clientWidth,
                                    behavior: 'smooth'
                                  });
                                }
                              }
                            });
                          }}
                          className="w-8 h-8 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50 transition-all text-[#2E1065]/70 hover:text-red-500 hover:bg-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-2 relative z-10 pr-10">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-full shadow-sm max-w-[150px] border-white/40">
                          <AutoShrinkText className="text-sm font-bold w-full text-[#2E1065]" text={wallet.name} />
                        </div>
                        
                        {wallet.isMain && (
                          <span className="text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 shadow-sm px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {t('home.mainWallet')}
                          </span>
                        )}
                        {hasInstallment && (
                          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            {t('home.installment')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="mb-6 relative z-10 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-start gap-2 mb-1">
                        <span className="text-[13px] font-semibold block text-[#2E1065]/70">
                          {isCreditCard ? t('home.outstandingBalance') : t('home.balance')}
                        </span>
                        {isCreditCard && (
                          <span className="text-[9px] font-bold text-[#2E1065]/60 uppercase tracking-wider bg-white/40 px-2.5 py-0.5 rounded-full border border-white/50 shadow-sm whitespace-nowrap">
                            {t('home.dueDate')} {t('home.day')} {wallet.dueDay || 25}
                          </span>
                        )}
                      </div>
                      {isCreditCard ? (
                        <div className="flex flex-row items-center justify-between w-full gap-4">
                          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                            <AutoShrinkText className="text-[44px] font-bold tracking-tight leading-none drop-shadow-sm w-full">
                              <span className="text-[24px] font-bold opacity-80 mr-1">฿</span>
                              {outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </AutoShrinkText>
                          </div>
                          <button onClick={() => handlePayClick(wallet.id)} className="px-3.5 h-[36px] bg-gradient-to-br from-[#2E1065] to-[#4c1d95] text-white flex flex-row items-center justify-center gap-1.5 shadow-md rounded-[18px] hover:scale-[0.96] active:scale-95 transition-transform group shrink-0">
                            <span className="text-[11px] font-bold tracking-wide whitespace-nowrap">{t('home.pay')}</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-white/90" />
                          </button>
                        </div>
                      ) : (
                        <AutoShrinkText className="text-[44px] font-bold tracking-tight leading-none drop-shadow-sm w-full">
                          <span className="text-[24px] font-bold opacity-80 mr-1">฿</span>
                          {stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </AutoShrinkText>
                      )}
                    </div>

                    {/* Actions / Stats */}
                    <div className="relative z-10">
                      {isCreditCard ? (
                        <div className="flex flex-col w-full h-[76px]">
                          <div className="flex flex-col justify-center h-full gap-2">
                            {wallet.creditLimit ? (
                                !wallet.installmentCreditLimit ? (
                                  <div className="flex flex-col gap-1.5 px-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex flex-col">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2E1065]/70 mb-0.5">
                                          <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                                          {t('home.remainingCredit')}
                                        </span>
                                        <span className="text-[#2E1065] font-extrabold text-[14px]">
                                          ฿{(wallet.creditLimit - Math.abs(stats.balance < 0 ? stats.balance : 0)).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                        </span>
                                      </div>
                                      <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E1065]/50 mb-0.5">
                                          {t('home.totalCredit')}
                                        </span>
                                        <span className="text-[#2E1065]/60 font-bold text-[14px]">
                                          ฿{wallet.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="w-full bg-[#2E1065]/5 h-2 rounded-full overflow-hidden shadow-inner mt-2">
                                      <div className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (Math.abs(stats.balance < 0 ? stats.balance : 0) / wallet.creditLimit) * 100)}%`}} />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-1 px-1">
                                    <div className="flex flex-col gap-0.5">
                                      <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2E1065]/70">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                                            {t('home.remainingCredit')}
                                          </span>
                                          <span className="text-[#2E1065] font-extrabold text-[12px] leading-none mt-0.5">
                                            ฿{(wallet.creditLimit - normalDebt).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                          </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E1065]/50">
                                            {t('home.totalCredit')}
                                          </span>
                                          <span className="text-[#2E1065]/60 font-bold text-[12px] leading-none mt-0.5">
                                            ฿{wallet.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="w-full bg-[#2E1065]/5 h-1.5 rounded-full overflow-hidden shadow-inner mt-1">
                                        <div className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (normalDebt / wallet.creditLimit) * 100)}%`}} />
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2E1065]/70">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            {t('home.remainingInstallmentCredit')}
                                          </span>
                                          <span className="text-[#2E1065] font-extrabold text-[12px] leading-none mt-0.5">
                                            ฿{(wallet.installmentCreditLimit - installmentDebt).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                          </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E1065]/50">
                                            {t('home.totalInstallmentCredit')}
                                          </span>
                                          <span className="text-[#2E1065]/60 font-bold text-[12px] leading-none mt-0.5">
                                            ฿{wallet.installmentCreditLimit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="w-full bg-[#2E1065]/5 h-1.5 rounded-full overflow-hidden shadow-inner mt-1">
                                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (installmentDebt / wallet.installmentCreditLimit) * 100)}%`}} />
                                      </div>
                                    </div>
                                  </div>
                                )
                            ) : (
                              <div className="flex items-center justify-center h-full text-[12px] font-medium text-[#2E1065]/60 italic">
                                - {t('home.noCreditLimitSet') || 'ไม่ระบุวงเงิน'} -
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 h-[76px]">
                          <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/60 shadow-[0_4px_16px_rgba(31,38,135,0.04)] flex flex-col justify-center min-w-0">
                            <AutoShrinkText className="mb-0.5 w-full">
                              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#2E1065]/60 tracking-wide">
                                <span className="bg-emerald-500/20 p-0.5 rounded-full shrink-0"><ArrowDown className="w-3 h-3 text-emerald-600" /></span>
                                <span>{t('home.income')} <span className="font-medium opacity-80">{t('home.thisMonth')}</span></span>
                              </span>
                            </AutoShrinkText>
                            <AutoShrinkText className="w-full">
                              <span className="font-extrabold text-[#2E1065] text-sm tracking-tight">฿{stats.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </AutoShrinkText>
                          </div>
                          <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/60 shadow-[0_4px_16px_rgba(31,38,135,0.04)] flex flex-col justify-center min-w-0">
                            <AutoShrinkText className="mb-0.5 w-full">
                              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#2E1065]/60 tracking-wide">
                                <span className="bg-rose-500/20 p-0.5 rounded-full shrink-0"><ArrowUp className="w-3 h-3 text-rose-600" /></span>
                                <span>{t('home.expense')} <span className="font-medium opacity-80">{t('home.thisMonth')}</span></span>
                              </span>
                            </AutoShrinkText>
                            <AutoShrinkText className="w-full">
                              <span className="font-extrabold text-[#2E1065] text-sm tracking-tight">฿{stats.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </AutoShrinkText>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Decorative background elements */}
                    <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#8B5CF6]/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/4" />
                      
                      <div className="absolute -top-6 -right-6 opacity-[0.07] rotate-[-15deg] pointer-events-none">
                        {isCreditCard ? <CreditCardIcon className="w-40 h-40 text-[#2E1065]" strokeWidth={1.5} /> : <WIcon className="w-40 h-40 text-[#2E1065]" strokeWidth={1.5} />}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Add New Wallet Empty Card */}
            <div className="w-full shrink-0 snap-center px-6">
              <button 
                onClick={() => {
                  setEditingWallet(null);
                  setIsFormOpen(true);
                }}
                className="w-full h-full min-h-[220px] bg-white/20 backdrop-blur-md rounded-[32px] p-6 text-[#2E1065] border-2 border-dashed border-white/60 flex flex-col items-center justify-center gap-4 hover:bg-white/30 transition-colors active:scale-95 shadow-sm relative overflow-hidden"
              >
                <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center shadow-sm relative z-10">
                  <Plus className="w-8 h-8 text-[#8B5CF6]" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-lg relative z-10 text-[#8B5CF6]">{t('home.addWalletBtn')}</span>
                
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#8B5CF6] to-transparent pointer-events-none" />
              </button>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center gap-1.5 -mt-2 relative z-10">
            {wallets.map((wallet) => (
              <div 
                key={wallet.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeWalletId === wallet.id ? 'w-5 bg-[#8B5CF6]' : 'w-1.5 bg-[#2E1065]/20'
                }`}
              />
            ))}
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeWalletId === 'add' ? 'w-5 bg-[#8B5CF6]' : 'w-1.5 bg-[#2E1065]/20'
              }`}
            />
          </div>
        </div>

        {/* Transactions List */}
        <div className="px-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-[#2E1065] text-lg">{t('home.recentTransactions')}</h3>
            <button 
              onClick={() => setCurrentPage('overview')}
              className="text-sm text-[#2E1065] font-bold bg-white/40 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/50 shadow-sm flex items-center gap-1 hover:bg-white/60 transition-colors active:scale-95"
            >
              {t('home.seeAll')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {recentTransactions.map((tx) => {
              const catStyle = getCategoryStyle(tx.category || '', appCategories || undefined);
              const IconComponent = catStyle.icon;
              
              let displayType = tx.type;
              if (tx.type === 'transfer') {
                displayType = 'expense';
              }

              return (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTransactionId(tx.id)}
                  className="flex items-center justify-between bg-white/40 backdrop-blur-md p-4 rounded-3xl shadow-[0_4px_20px_rgba(31,38,135,0.05)] border border-white/50 cursor-pointer hover:bg-white/60 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${catStyle.color} ${catStyle.textColor} shadow-sm border border-white/50`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-bold text-[#2E1065] text-[15px] mb-0.5 truncate">{tx.title || tx.category}</h4>
                      <p className="text-[11px] font-medium text-[#2E1065]/60 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold text-[clamp(14px,3.5vw,16px)] shrink-0 whitespace-nowrap pl-2 ${displayType === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {displayType === 'income' ? '+' : '-'}฿{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
            {recentTransactions.length === 0 && (
              <div className="bg-white/40 backdrop-blur-md p-8 rounded-3xl text-center shadow-[0_4px_20px_rgba(31,38,135,0.05)] border border-white/50">
                <p className="text-sm font-semibold text-[#2E1065]/70">{t('home.noRecords')}</p>
                <p className="text-xs text-[#2E1065]/50 mt-1">{t('home.noRecordsHint')}</p>
              </div>
            )}
          </div>
        </div>

        <WalletFormModal 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          editWallet={editingWallet}
        />

        <CreditCardPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          creditCardId={paymentCreditCardId}
        />

        <TransactionDetailsModal
          transactionId={selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
        />
      </div>
    </div>
  );
}
