import { useState, useMemo } from 'react';
import { useWalletStore } from '@/store/useWalletStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { 
  CreditCard, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { Wallet } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { calculateCreditCardStats } from '@/utils/creditCardUtils';
import Alert3DIcon from '@/components/ui/Alert3DIcon';

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
          badgeText: language === 'en' ? 'PAY NOW' : 'ด่วนมาก',
          cardBg: 'bg-gradient-to-r from-rose-100/95 via-rose-50/90 to-pink-50/95 dark:from-rose-950/80 dark:via-rose-900/50 dark:to-pink-950/60',
          cardBorder: 'border-rose-300/80 dark:border-rose-600/60 shadow-[0_8px_28px_rgba(225,29,72,0.15)]',
          glowGradient: 'from-rose-500/30 via-pink-500/15 to-transparent',
          accentText: 'text-rose-700 dark:text-rose-300',
          badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300/50 dark:border-rose-600/40',
          buttonBg: 'bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-[0_4px_12px_rgba(225,29,72,0.35)]',
        };
      }
      case 'today':
        return {
          title: language === 'en' ? 'Due today!' : 'ครบกำหนดชำระวันนี้!',
          badgeText: language === 'en' ? 'TODAY' : 'วันนี้',
          cardBg: 'bg-gradient-to-r from-orange-100/95 via-amber-50/90 to-orange-50/95 dark:from-orange-950/80 dark:via-orange-900/50 dark:to-amber-950/60',
          cardBorder: 'border-orange-300/80 dark:border-orange-600/60 shadow-[0_8px_28px_rgba(234,88,12,0.15)]',
          glowGradient: 'from-orange-500/30 via-amber-500/15 to-transparent',
          accentText: 'text-orange-700 dark:text-orange-300',
          badgeBg: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-300/50 dark:border-orange-600/40',
          buttonBg: 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white shadow-[0_4px_12px_rgba(234,88,12,0.35)]',
        };
      case 'urgent':
        return {
          title: alert.daysUntilDue === 1
            ? (language === 'en' ? 'Due tomorrow' : 'ครบกำหนดชำระพรุ่งนี้')
            : (language === 'en' ? `Due in ${alert.daysUntilDue} days` : `จะครบกำหนดในอีก ${alert.daysUntilDue} วัน`),
          badgeText: language === 'en' ? 'SOON' : 'ใกล้ถึง',
          cardBg: 'bg-gradient-to-r from-amber-100/90 via-yellow-50/85 to-amber-50/90 dark:from-amber-950/70 dark:via-yellow-900/45 dark:to-amber-950/55',
          cardBorder: 'border-amber-300/80 dark:border-amber-600/60 shadow-[0_8px_28px_rgba(217,119,6,0.12)]',
          glowGradient: 'from-amber-500/25 via-yellow-500/15 to-transparent',
          accentText: 'text-amber-800 dark:text-amber-300',
          badgeBg: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300/50 dark:border-amber-600/40',
          buttonBg: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-[0_4px_12px_rgba(217,119,6,0.35)]',
        };
      case 'warning':
      default:
        return {
          title: language === 'en' ? `Due in ${alert.daysUntilDue} days` : `จะครบกำหนดในอีก ${alert.daysUntilDue} วัน`,
          badgeText: language === 'en' ? 'UPCOMING' : 'เตือนความจำ',
          cardBg: 'bg-gradient-to-r from-purple-100/90 via-violet-50/85 to-indigo-50/90 dark:from-purple-950/70 dark:via-violet-900/45 dark:to-indigo-950/55',
          cardBorder: 'border-purple-300/80 dark:border-purple-600/60 shadow-[0_8px_28px_rgba(139,92,246,0.12)]',
          glowGradient: 'from-purple-500/25 via-indigo-500/15 to-transparent',
          accentText: 'text-purple-800 dark:text-purple-300',
          badgeBg: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-300/50 dark:border-purple-600/40',
          buttonBg: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white shadow-[0_4px_12px_rgba(139,92,246,0.35)]',
        };
    }
  };

  const config = getUrgencyConfig();
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
    <div className="px-6 mb-4 sm:mb-5 animate-fade-in">
      <div 
        onClick={() => onPayClick(alert.wallet.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onPayClick(alert.wallet.id)}
        className={`relative overflow-hidden cursor-pointer rounded-[24px] p-3 sm:p-3.5 backdrop-blur-xl ${config.cardBg} border ${config.cardBorder} transition-all duration-300 group active:scale-[0.99] hover:shadow-lg`}
      >
        {/* Top Gloss Specular Highlight Line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/40 to-transparent pointer-events-none" />

        {/* Ambient Radial Mesh Glow */}
        <div className={`absolute -right-6 -top-6 w-40 h-40 rounded-full bg-gradient-to-br ${config.glowGradient} blur-2xl pointer-events-none`} />

        {/* Card Content Layout */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          
          {/* Left: 3D Modern Icon + Text Stack */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            
            {/* 💎 3D Modern Dynamic Alert Icon Component */}
            <div className="shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
              <Alert3DIcon urgency={alert.urgency} size="md" />
            </div>

            {/* Content Stack */}
            <div className="min-w-0 flex-1">
              {/* Row 1: Status Title & Multi-card Pill */}
              <div className="flex items-center gap-1.5 leading-tight mb-0.5">
                <span className={`font-black text-xs sm:text-[13px] tracking-tight ${config.accentText}`}>
                  {config.title}
                </span>

                {hasMultiple ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                    {safeIndex + 1}/{alerts.length}
                  </span>
                ) : (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase tracking-wider hidden sm:inline-flex items-center gap-0.5 ${config.badgeBg}`}>
                    <Sparkles className="w-2.5 h-2.5" />
                    {config.badgeText}
                  </span>
                )}
              </div>

              {/* Row 2: Card Name + Amount + Due Date hint */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <CreditCard className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="font-semibold truncate max-w-[85px] sm:max-w-[120px] inline-block text-slate-700 dark:text-slate-200">
                  {alert.wallet.name}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                  ฿{alert.amountToPay.toLocaleString(language === 'en' ? 'en-US' : 'th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] hidden sm:inline font-medium">
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
                  className="w-6 h-6 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/15 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors active:scale-90"
                  aria-label="Previous card"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-6 h-6 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/15 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors active:scale-90"
                  aria-label="Next card"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 3D Tactile High-Conversion CTA Button */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPayClick(alert.wallet.id);
              }}
              className={`h-8 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all duration-150 relative overflow-hidden group/btn ${config.buttonBg}`}
            >
              {/* Button Specular Glint Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/15 to-white/30 pointer-events-none opacity-80 group-hover/btn:opacity-100" />
              
              <span className="relative z-10 font-bold">{t('home.payShort') || (language === 'en' ? 'Pay' : 'ชำระเลย')}</span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
