import { useState, useMemo } from 'react';
import { useWalletStore } from '@/store/useWalletStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { 
  CreditCard, 
  ArrowRight, 
  Clock, 
  ShieldAlert, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  BellRing
} from 'lucide-react';
import type { Wallet } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { calculateCreditCardStats } from '@/utils/creditCardUtils';

interface CreditCardAlert {
  wallet: Wallet;
  daysUntilDue: number;
  dueDate: Date;
  amountToPay: number;
  statementBalance: number;
  outstandingBalance: number;
  urgency: 'warning' | 'urgent' | 'today' | 'overdue';
}

interface Props {
  onPayClick: (walletId: string) => void;
}

export default function CreditCardDueAlert({ onPayClick }: Props) {
  const wallets = useWalletStore(s => s.wallets);
  const transactions = useTransactionStore(s => s.transactions);
  const { t, language } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const alerts = useMemo(() => {
    const ccWallets = wallets.filter(w => w.type === 'credit_card');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeAlerts: CreditCardAlert[] = [];

    ccWallets.forEach(wallet => {
      const stats = calculateCreditCardStats(wallet, transactions, now);
      const amountToPay = stats.statementBalance > 0 ? stats.statementBalance : stats.outstandingBalance;

      // Nothing due or no outstanding debt
      if (amountToPay <= 0) return;

      const dueDay = wallet.dueDay || 25;
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      // Check current month's due date
      let nextDueDate = new Date(currentYear, currentMonth, dueDay);

      // Time difference in calendar days
      const diffTime = nextDueDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // Overdue: up to 7 days overdue
      if (diffDays < 0 && diffDays >= -7) {
        activeAlerts.push({
          wallet,
          daysUntilDue: diffDays,
          dueDate: nextDueDate,
          amountToPay,
          statementBalance: stats.statementBalance,
          outstandingBalance: stats.outstandingBalance,
          urgency: 'overdue'
        });
      } 
      // Due Today
      else if (diffDays === 0) {
        activeAlerts.push({
          wallet,
          daysUntilDue: 0,
          dueDate: nextDueDate,
          amountToPay,
          statementBalance: stats.statementBalance,
          outstandingBalance: stats.outstandingBalance,
          urgency: 'today'
        });
      } 
      // Due Soon (1-2 days)
      else if (diffDays > 0 && diffDays <= 2) {
        activeAlerts.push({
          wallet,
          daysUntilDue: diffDays,
          dueDate: nextDueDate,
          amountToPay,
          statementBalance: stats.statementBalance,
          outstandingBalance: stats.outstandingBalance,
          urgency: 'urgent'
        });
      }
      // Upcoming (3-7 days)
      else if (diffDays > 2 && diffDays <= 7) {
        activeAlerts.push({
          wallet,
          daysUntilDue: diffDays,
          dueDate: nextDueDate,
          amountToPay,
          statementBalance: stats.statementBalance,
          outstandingBalance: stats.outstandingBalance,
          urgency: 'warning'
        });
      }
    });

    // Sort by urgency: overdue first, then today, then nearest days
    return activeAlerts.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [wallets, transactions]);

  // Handle index safety if alerts count changes
  const safeIndex = alerts.length > 0 ? Math.min(currentIndex, alerts.length - 1) : 0;
  const alert = alerts[safeIndex];

  if (!alert) return null;

  const getUrgencyConfig = () => {
    switch (alert.urgency) {
      case 'overdue': {
        const absDays = Math.abs(alert.daysUntilDue);
        return {
          title: language === 'en'
            ? (absDays === 1 ? 'Overdue 1 day' : `Overdue ${absDays} days`)
            : (absDays === 1 ? 'เลยกำหนดชำระ 1 วัน' : `เลยกำหนดชำระแล้ว ${absDays} วัน`),
          icon: ShieldAlert,
          iconAnimation: 'animate-float-subtle',
          cardBg: 'bg-rose-50/95 dark:bg-[#2A0C16]/90',
          cardBorder: 'border-rose-200/90 dark:border-rose-800/60 shadow-[0_4px_20px_rgba(225,29,72,0.09)]',
          glowGradient: 'from-rose-500/20 via-rose-500/5 to-transparent',
          accentText: 'text-rose-600 dark:text-rose-400',
          iconContainerBg: 'bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-red-500/20 border-rose-300/70 dark:border-rose-700/60 text-rose-600 dark:text-rose-400',
          buttonBg: 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-500/25',
          hasRadar: true
        };
      }
      case 'today':
        return {
          title: language === 'en' ? 'Due today!' : 'ครบกำหนดชำระวันนี้!',
          icon: Flame,
          iconAnimation: 'animate-pulse-slow',
          cardBg: 'bg-orange-50/95 dark:bg-[#2A1408]/90',
          cardBorder: 'border-orange-200/90 dark:border-orange-800/60 shadow-[0_4px_20px_rgba(234,88,12,0.09)]',
          glowGradient: 'from-orange-500/20 via-amber-500/5 to-transparent',
          accentText: 'text-orange-600 dark:text-orange-400',
          iconContainerBg: 'bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-yellow-500/20 border-orange-300/70 dark:border-orange-700/60 text-orange-600 dark:text-orange-400',
          buttonBg: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25',
          hasRadar: true
        };
      case 'urgent':
        return {
          title: alert.daysUntilDue === 1
            ? (language === 'en' ? 'Due tomorrow' : 'ครบกำหนดชำระพรุ่งนี้')
            : (language === 'en' ? `Due in ${alert.daysUntilDue} days` : `จะครบกำหนดในอีก ${alert.daysUntilDue} วัน`),
          icon: Clock,
          iconAnimation: 'animate-float-subtle',
          cardBg: 'bg-amber-50/90 dark:bg-[#261B06]/90',
          cardBorder: 'border-amber-200/90 dark:border-amber-800/60 shadow-[0_4px_20px_rgba(217,119,6,0.08)]',
          glowGradient: 'from-amber-500/18 via-yellow-500/5 to-transparent',
          accentText: 'text-amber-700 dark:text-amber-400',
          iconContainerBg: 'bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-amber-300/70 dark:border-amber-700/60 text-amber-600 dark:text-amber-400',
          buttonBg: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25',
          hasRadar: false
        };
      case 'warning':
      default:
        return {
          title: language === 'en' ? `Due in ${alert.daysUntilDue} days` : `จะครบกำหนดในอีก ${alert.daysUntilDue} วัน`,
          icon: BellRing,
          iconAnimation: 'animate-bell-ring',
          cardBg: 'bg-purple-50/90 dark:bg-[#1E1035]/90',
          cardBorder: 'border-purple-200/80 dark:border-purple-900/60 shadow-[0_4px_20px_rgba(139,92,246,0.08)]',
          glowGradient: 'from-purple-500/18 via-indigo-500/5 to-transparent',
          accentText: 'text-purple-700 dark:text-purple-300',
          iconContainerBg: 'bg-gradient-to-br from-purple-500/20 via-violet-500/10 to-indigo-500/20 border-purple-300/70 dark:border-purple-700/60 text-purple-600 dark:text-purple-400',
          buttonBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/25',
          hasRadar: false
        };
    }
  };

  const config = getUrgencyConfig();
  const StatusIcon = config.icon;
  const hasMultiple = alerts.length > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : alerts.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev < alerts.length - 1 ? prev + 1 : 0));
  };

  const formattedDueDate = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', { 
    day: 'numeric', 
    month: 'short' 
  }).format(alert.dueDate);

  return (
    <div className="px-6 mb-3 animate-fade-in">
      <div 
        onClick={() => onPayClick(alert.wallet.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onPayClick(alert.wallet.id)}
        className={`relative overflow-hidden cursor-pointer rounded-[22px] p-3.5 sm:py-3.5 sm:px-4 backdrop-blur-xl ${config.cardBg} border ${config.cardBorder} transition-all duration-300 group active:scale-[0.99] hover:shadow-md`}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className={`absolute -right-6 -top-6 w-36 h-36 rounded-full bg-gradient-to-br ${config.glowGradient} blur-2xl pointer-events-none`} />

        {/* Compact Notification Card Layout */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          
          {/* Left: Dynamic Animated Icon Badge + Text Stack */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            
            {/* 💎 Luxury Animated Status Icon Badge */}
            <div className={`relative w-11 h-11 rounded-[16px] ${config.iconContainerBg} flex items-center justify-center shrink-0 shadow-xs border transition-transform duration-300 group-hover:scale-105`}>
              {/* Radar wave for critical/urgent alerts */}
              {config.hasRadar && (
                <span className="absolute inset-0 rounded-[16px] bg-current opacity-20 animate-radar pointer-events-none" />
              )}

              {/* Dynamic Animated SVG Icon */}
              <StatusIcon className={`w-5.5 h-5.5 relative z-10 ${config.iconAnimation}`} />
            </div>

            {/* Content Stack */}
            <div className="min-w-0 flex-1">
              {/* Row 1: Status Title & Multi-card Pill */}
              <div className="flex items-center gap-1.5 leading-tight">
                <span className={`font-bold text-xs sm:text-[13px] tracking-tight ${config.accentText}`}>
                  {config.title}
                </span>

                {hasMultiple && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                    {safeIndex + 1}/{alerts.length}
                  </span>
                )}
              </div>

              {/* Row 2: Card Name + Amount + Due Date hint */}
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                <CreditCard className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="font-medium truncate max-w-[90px] sm:max-w-[120px] inline-block">
                  {alert.wallet.name}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  ฿{alert.amountToPay.toLocaleString(language === 'en' ? 'en-US' : 'th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] hidden sm:inline">
                  ({formattedDueDate})
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions (Multi-card pagination + CTA Button) */}
          <div className="flex items-center gap-1.5 shrink-0 relative z-10">
            {hasMultiple && (
              <div className="flex items-center gap-0.5 mr-0.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-6 h-6 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/15 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                  aria-label="Previous card"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-6 h-6 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/15 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                  aria-label="Next card"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Compact High-Conversion CTA Button */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPayClick(alert.wallet.id);
              }}
              className={`h-8 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all duration-150 ${config.buttonBg}`}
            >
              <span>{t('home.payShort') || (language === 'en' ? 'Pay' : 'ชำระเลย')}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
