import { useMemo } from 'react';
import { useWalletStore } from '@/store/useWalletStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { AlertCircle, CreditCard, ArrowRight } from 'lucide-react';
import type { Wallet } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface CreditCardAlert {
  wallet: Wallet;
  daysUntilDue: number;
  outstandingBalance: number;
  urgency: 'warning' | 'urgent' | 'overdue';
}

interface Props {
  onPayClick: (walletId: string) => void;
}

export default function CreditCardDueAlert({ onPayClick }: Props) {
  const wallets = useWalletStore(s => s.wallets);
  const transactions = useTransactionStore(s => s.transactions);
  const { t, language } = useTranslation();

  const alerts = useMemo(() => {
    const ccWallets = wallets.filter(w => w.type === 'credit_card');
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const activeAlerts: CreditCardAlert[] = [];

    ccWallets.forEach(wallet => {
      // Calculate outstanding balance
      const txs = transactions.filter(t => t.walletId === wallet.id);
      const income = txs.filter(t => t.type === 'income' || t.type === 'transfer' && t.toWalletId === wallet.id).reduce((sum, t) => sum + t.amount, 0);
      const expense = txs.filter(t => t.type === 'expense' || t.type === 'transfer' && t.fromWalletId === wallet.id).reduce((sum, t) => sum + t.amount, 0);
      const bal = income - expense;
      const outstandingBalance = bal < 0 ? Math.abs(bal) : 0;

      if (outstandingBalance <= 0) return; // Nothing to pay

      const dueDay = wallet.dueDay || 25;
      
      // Calculate next due date
      let nextDueDate = new Date(currentYear, currentMonth, dueDay);
      if (now > nextDueDate) {
        // If today is past the due date for this month, check if we need to show overdue or next month's due
        // For simplicity, we assume the due date is this month.
        // If overdue by less than 5 days, show overdue.
        const diffTime = now.getTime() - nextDueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 5 && diffDays > 0) {
           activeAlerts.push({
              wallet,
              daysUntilDue: -diffDays,
              outstandingBalance,
              urgency: 'overdue'
           });
        }
        return;
      }

      const diffTime = nextDueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 5 && diffDays >= 0) {
        let urgency: 'warning' | 'urgent' = 'warning';
        if (diffDays <= 2) urgency = 'urgent';

        activeAlerts.push({
          wallet,
          daysUntilDue: diffDays,
          outstandingBalance,
          urgency
        });
      }
    });

    // Sort by urgency (days until due ascending)
    return activeAlerts.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [wallets, transactions]);

  if (alerts.length === 0) return null;

  // Show the most urgent alert
  const alert = alerts[0];

  const getStyle = () => {
    switch (alert.urgency) {
      case 'overdue':
        return {
          bg: 'bg-rose-500',
          bgLight: 'bg-rose-50',
          text: 'text-rose-500',
          border: 'border-rose-200',
          icon: 'text-rose-600',
          pulse: 'animate-pulse'
        };
      case 'urgent':
        return {
          bg: 'bg-orange-500',
          bgLight: 'bg-orange-50',
          text: 'text-orange-500',
          border: 'border-orange-200',
          icon: 'text-orange-600',
          pulse: 'animate-pulse'
        };
      case 'warning':
      default:
        return {
          bg: 'bg-amber-400',
          bgLight: 'bg-amber-50',
          text: 'text-amber-500',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          pulse: ''
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`px-6 mb-4 animate-scale-in`}>
      <div className={`${style.bgLight} backdrop-blur-md rounded-2xl p-4 border ${style.border} shadow-sm relative overflow-hidden flex items-center justify-between`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bg} ${style.pulse}`} />
        
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${style.bg} bg-opacity-20 flex items-center justify-center`}>
            <AlertCircle className={`w-5 h-5 ${style.icon}`} />
          </div>
          <div>
            <h4 className={`font-bold text-[13px] ${style.text}`}>
              {alert.urgency === 'overdue' 
                ? (language === 'en' ? 'Overdue payment!' : 'เลยกำหนดชำระแล้ว') 
                : alert.urgency === 'urgent'
                  ? alert.daysUntilDue === 0 
                    ? (language === 'en' ? 'Due today!' : 'ครบกำหนดชำระวันนี้!') 
                    : (language === 'en' ? 'Due tomorrow!' : 'ครบกำหนดชำระพรุ่งนี้!')
                  : (language === 'en' ? `Due in ${alert.daysUntilDue} days` : `จะครบกำหนดในอีก ${alert.daysUntilDue} วัน`)}
            </h4>
            <div className="text-[11px] font-medium text-slate-600 mt-0.5 flex items-center gap-1.5">
              <CreditCard className="w-3 h-3" />
              <span className="truncate max-w-[120px] inline-block">{alert.wallet.name}</span>
              <span className="font-bold text-slate-800">฿{alert.outstandingBalance.toLocaleString(language === 'en' ? 'en-US' : 'th-TH', { minimumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onPayClick(alert.wallet.id)}
          className={`shrink-0 h-8 px-3 rounded-xl ${style.bg} text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-transform`}
        >
          {language === 'en' ? 'Pay Now' : 'ชำระเลย'}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
