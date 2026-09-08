import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Crown,
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Layers,
  Sparkles,
  Calendar,
  Wallet as WalletIcon,
  XCircle
} from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAppStore } from '@/store/useAppStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { getCategoryStyle, getCategoryDisplayName } from '@/utils/categoryStyles';
import { useDragToClose } from '@/hooks/useDragToClose';
import AutoShrinkText from '@/components/ui/AutoShrinkText';
import type { Transaction } from '@/types';

// Calculation helper matching AnalyticsPage for monthly effective amounts
export const getEffectiveAmountForMonth = (tx: Transaction, targetMonth: number, targetYear: number): number => {
  const txDate = new Date(tx.date);
  const m = txDate.getMonth();
  const y = txDate.getFullYear();
  
  if (!tx.installmentMonths || tx.installmentMonths <= 1) {
    return (m === targetMonth && y === targetYear) ? tx.amount : 0;
  }
  
  const monthsDiff = (targetYear - y) * 12 + (targetMonth - m);
  if (monthsDiff >= 0 && monthsDiff < tx.installmentMonths) {
    const principalPerMonth = tx.amount / tx.installmentMonths;
    const rate = (tx.installmentInterestRate || 0) / 100;
    const interestPerMonth = tx.amount * rate;
    return principalPerMonth + interestPerMonth;
  }
  return 0;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string | null;
  categoryColor?: string;
  activeTab: 'expense' | 'income';
  viewDate: Date;
  monthTotal: number;
  onSelectTransaction: (txId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function CategoryBreakdownModal({
  isOpen,
  onClose,
  categoryName,
  categoryColor = '#8B5CF6',
  activeTab,
  viewDate,
  monthTotal,
  onSelectTransaction,
}: Props) {
  const { t } = useTranslation();
  const language = useSettingsStore(s => s.language);
  const transactions = useTransactionStore(s => s.transactions);
  const appCategories = useAppStore(s => s.appCategories);
  const wallets = useWalletStore(s => s.wallets);

  const [isVisible, setIsVisible] = useState(false);
  const [internalCategory, setInternalCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const { handlers: dragHandlers, style: dragStyle } = useDragToClose({ onClose });

  // Handle open/close animation states
  useEffect(() => {
    if (isOpen && categoryName) {
      setInternalCategory(categoryName);
      setSearchQuery('');
      setSortBy('newest');
      const timer = setTimeout(() => setIsVisible(true), 15);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setInternalCategory(null), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, categoryName]);

  // Compute category details and transactions
  const {
    items,
    categoryTotal,
    percentage,
    txCount,
    avgAmount,
    maxTx,
    minTx,
    prevMonthTotal,
    hasPrevMonth,
    percentChangeVsPrev
  } = useMemo(() => {
    if (!internalCategory) {
      return {
        items: [],
        categoryTotal: 0,
        percentage: 0,
        txCount: 0,
        avgAmount: 0,
        maxTx: null as { tx: Transaction; effectiveAmount: number } | null,
        minTx: null as { tx: Transaction; effectiveAmount: number } | null,
        prevMonthTotal: 0,
        hasPrevMonth: false,
        percentChangeVsPrev: 0
      };
    }

    const cMonth = viewDate.getMonth();
    const cYear = viewDate.getFullYear();

    const prevMonthDate = new Date(cYear, cMonth - 1, 1);
    const prevM = prevMonthDate.getMonth();
    const prevY = prevMonthDate.getFullYear();

    let catTotal = 0;
    let prevTotal = 0;
    let hasPrev = false;

    const matchedItems: { tx: Transaction; effectiveAmount: number }[] = [];

    transactions.forEach(t => {
      if (t.type !== activeTab || t.category !== internalCategory) return;

      const currentEff = getEffectiveAmountForMonth(t, cMonth, cYear);
      if (currentEff > 0) {
        catTotal += currentEff;
        matchedItems.push({ tx: t, effectiveAmount: currentEff });
      }

      const prevEff = getEffectiveAmountForMonth(t, prevM, prevY);
      if (prevEff > 0) {
        prevTotal += prevEff;
        hasPrev = true;
      }
    });

    const count = matchedItems.length;
    const avg = count > 0 ? catTotal / count : 0;
    const share = monthTotal > 0 ? (catTotal / monthTotal) * 100 : 0;

    let maxItem: { tx: Transaction; effectiveAmount: number } | null = null;
    let minItem: { tx: Transaction; effectiveAmount: number } | null = null;

    matchedItems.forEach(item => {
      if (!maxItem || item.effectiveAmount > maxItem.effectiveAmount) {
        maxItem = item;
      }
      if (!minItem || item.effectiveAmount < minItem.effectiveAmount) {
        minItem = item;
      }
    });

    let change = 0;
    if (prevTotal > 0) {
      change = ((catTotal - prevTotal) / prevTotal) * 100;
    }

    return {
      items: matchedItems,
      categoryTotal: catTotal,
      percentage: share,
      txCount: count,
      avgAmount: avg,
      maxTx: maxItem,
      minTx: minItem,
      prevMonthTotal: prevTotal,
      hasPrevMonth: hasPrev,
      percentChangeVsPrev: change
    };
  }, [internalCategory, transactions, activeTab, viewDate, monthTotal]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        const title = (item.tx.title || '').toLowerCase();
        const note = (item.tx.note || '').toLowerCase();
        const amt = item.effectiveAmount.toString();
        return title.includes(q) || note.includes(q) || amt.includes(q);
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.tx.date).getTime() - new Date(a.tx.date).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.tx.date).getTime() - new Date(b.tx.date).getTime();
      }
      if (sortBy === 'highest') {
        return b.effectiveAmount - a.effectiveAmount;
      }
      if (sortBy === 'lowest') {
        return a.effectiveAmount - b.effectiveAmount;
      }
      return 0;
    });

    return result;
  }, [items, searchQuery, sortBy]);

  if (!internalCategory && !isOpen) return null;

  const catStyle = getCategoryStyle(internalCategory || '', appCategories || undefined);
  const IconComponent = catStyle.icon;
  const displayName = getCategoryDisplayName(internalCategory || '', language);

  const monthFormatter = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', {
    month: 'long',
    year: 'numeric'
  });
  const currentMonthLabel = monthFormatter.format(viewDate);

  const walletMap = new Map(wallets.map(w => [w.id, w]));

  return createPortal(
    <>
      {/* Backdrop with frosted blur */}
      <div
        className={`fixed inset-0 bg-slate-950/45 backdrop-blur-md z-[100] transition-opacity duration-300 ${
          isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* World-Class Glassmorphic Bottom Sheet */}
      <div
        {...dragHandlers}
        style={dragStyle}
        className={`fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-t-[36px] shadow-[0_-16px_48px_rgba(0,0,0,0.2)] z-[101] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-t border-white/60 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Full-width Ambient Radial Glow across top edge of modal */}
        <div
          className="absolute -top-10 inset-x-0 h-52 pointer-events-none transition-all duration-700 opacity-25 dark:opacity-35 blur-3xl"
          style={{
            background: `radial-gradient(ellipse 100% 75% at 50% 0%, ${categoryColor} 0%, transparent 100%)`
          }}
        />

        {/* Drag Indicator Handle */}
        <div className="pt-3 pb-1 shrink-0 flex justify-center items-center cursor-grab active:cursor-grabbing relative z-10">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="relative px-6 pt-2 pb-4 shrink-0 border-b border-slate-100 dark:border-slate-800/80 z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Category 3D/Color Badge */}
            <div
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md border border-white/60 dark:border-white/10 relative overflow-hidden transition-transform duration-300 hover:scale-105 ${catStyle.color} ${catStyle.textColor}`}
            >
              <div
                className="absolute inset-0 opacity-20 bg-gradient-to-tr from-white via-transparent to-white pointer-events-none"
              />
              <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
            </div>

            {/* Title & Metadata */}
            <div className="min-w-0 flex-1">
              {/* Row 1: Category Name on left, Group Chip on right */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <AutoShrinkText
                    origin="left"
                    className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-normal pt-1 pb-0.5"
                    text={displayName}
                  />
                </div>

                {/* Category Group Chip on the right */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 shadow-2xs shrink-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  />
                  {catStyle.group || (activeTab === 'expense' ? t('overview.expense') : t('overview.income'))}
                </span>
              </div>

              {/* Row 2: Month / Period Subtitle */}
              <p className="inline-flex items-center gap-1 text-[11px] sm:text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {currentMonthLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-4">
          {/* Executive KPI Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Amount Card */}
            <div className="col-span-2 bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-slate-800/80 dark:to-purple-950/20 rounded-[28px] p-4 sm:p-5 border border-purple-100/70 dark:border-purple-900/30 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t('stats.totalInCat')}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  {percentage.toFixed(1)}% {t('stats.shareOfTotal')}
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                ฿{categoryTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              {/* Progress Bar for Share of Total */}
              <div className="w-full bg-slate-200/70 dark:bg-slate-700/60 rounded-full h-2.5 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: categoryColor
                  }}
                />
              </div>

              {/* Previous Month Comparison */}
              {hasPrevMonth ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                  {percentChangeVsPrev > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-rose-500" />
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        +{percentChangeVsPrev.toFixed(1)}%
                      </span>
                    </>
                  ) : percentChangeVsPrev < 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {percentChangeVsPrev.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-500">0%</span>
                  )}
                  <span>{t('stats.vsPreviousMonth')} (฿{prevMonthTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })})</span>
                </div>
              ) : (
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2">
                  {t('stats.firstMonthRecorded')}
                </p>
              )}
            </div>

            {/* Metric 1: Count */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-[22px] p-3.5 border border-slate-200/60 dark:border-slate-700/50 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-300">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {t('stats.txCount')}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {txCount} <span className="text-xs font-semibold text-slate-500">{t('stats.items')}</span>
              </div>
            </div>

            {/* Metric 2: Average */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-[22px] p-3.5 border border-slate-200/60 dark:border-slate-700/50 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300">
                  <ArrowUpDown className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {t('stats.avgPerTx')}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                ฿{avgAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>

            {/* Metric 3: Highest Transaction */}
            {maxTx && (
              <div className="col-span-2 bg-slate-50 dark:bg-slate-800/60 rounded-[22px] p-3.5 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {t('stats.maxTx')}
                    </p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {maxTx.tx.title || displayName}
                    </p>
                  </div>
                </div>
                <div className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 shrink-0">
                  ฿{maxTx.effectiveAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}
          </div>

          {/* Search and Sort Toolbar */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              {/* Search input */}
              <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200/60 dark:border-slate-700/60 focus-within:border-purple-400 transition-colors">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder={t('stats.searchInCat')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-hidden text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    type="button"
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setSortBy(prev => prev === 'newest' ? 'highest' : prev === 'highest' ? 'lowest' : prev === 'lowest' ? 'oldest' : 'newest')}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center gap-1"
                  title={t('stats.sortBy')}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>
                    {sortBy === 'newest'
                      ? t('stats.sortNewest')
                      : sortBy === 'highest'
                      ? t('stats.sortHighest')
                      : sortBy === 'lowest'
                      ? t('stats.sortLowest')
                      : t('stats.sortOldest')}
                  </span>
                </button>
              </div>
            </div>

            {/* Transaction Items List */}
            <div className="space-y-2.5 pb-8">
              {filteredAndSortedItems.length > 0 ? (
                filteredAndSortedItems.map(({ tx, effectiveAmount }) => {
                  const txDate = new Date(tx.date);
                  const dateStr = txDate.toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  const timeStr = tx.time ? tx.time.replace(/ am| pm| น./gi, '').trim() : '';

                  const wallet = tx.walletId ? walletMap.get(tx.walletId) : null;

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx.id)}
                      className="group cursor-pointer bg-white dark:bg-slate-800/90 rounded-[22px] p-3.5 sm:p-4 border border-slate-100 dark:border-slate-700/70 shadow-xs hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800/60 active:scale-[0.98] transition-all flex items-center justify-between gap-3"
                    >
                      {/* Left: Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${catStyle.color} ${catStyle.textColor}`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Title */}
                          <div className="font-bold text-sm sm:text-[15px] text-slate-800 dark:text-slate-100 truncate mb-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {tx.title || displayName}
                          </div>

                          {/* Metadata row: Date, Time, Wallet, Installment */}
                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {dateStr} {timeStr && `• ${timeStr}`}
                            </span>

                            {wallet && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-700 font-medium">
                                <WalletIcon className="w-2.5 h-2.5" />
                                {wallet.name}
                              </span>
                            )}

                            {tx.isInstallment && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                                <Sparkles className="w-2.5 h-2.5" />
                                {t('stats.installmentPlan')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div
                            className={`font-black text-sm sm:text-base tabular-nums ${
                              tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'}฿{effectiveAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          {tx.isInstallment && tx.installmentMonths && (
                            <div className="text-[10px] text-slate-400 text-right">
                              {t('stats.installmentMonth')} ({tx.installmentMonths} ด.)
                            </div>
                          )}
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-8 text-center border border-slate-200/50 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {searchQuery ? t('stats.noSearchResult') : t('stats.noTxInCat')}
                  </p>
                  <p className="text-xs text-slate-400">
                    {searchQuery ? t('stats.searchInCat') : currentMonthLabel}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
