import { CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';

export default function TodayOverview() {
  const transactions = useTransactionStore((s) => s.transactions);

  const today = new Date().toDateString();
  const todayCount = transactions.filter(
    (t) => new Date(t.date).toDateString() === today
  ).length;

  const todayExpense = transactions
    .filter(
      (t) => t.type === 'expense' && new Date(t.date).toDateString() === today
    )
    .reduce((sum, t) => sum + t.amount, 0);

  // Determine mood
  const isGood = todayExpense < 500;

  return (
    <div className="px-5 mb-8">
      <h3
        className="text-base font-bold mb-3"
        style={{ color: 'var(--text-primary)' }}
      >
        ภาพรวมวันนี้
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Status card */}
        <div
          className="p-4 rounded-2xl relative overflow-hidden"
          style={{
            background: isGood
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.06))'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.06))',
            border: `1px solid ${isGood ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`,
          }}
        >
          {/* Decorative sparkles */}
          <Sparkles
            size={14}
            className="absolute top-3 right-3"
            style={{ color: isGood ? '#34d399' : '#fbbf24', opacity: 0.5 }}
          />
          <Sparkles
            size={10}
            className="absolute top-8 right-8"
            style={{ color: isGood ? '#34d399' : '#fbbf24', opacity: 0.3 }}
          />

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center mb-3"
            style={{
              background: isGood ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            }}
          >
            <CheckCircle2
              size={18}
              style={{ color: isGood ? '#059669' : '#d97706' }}
            />
          </div>
          <p
            className="text-base font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {isGood ? 'ไม่ต้องรีบ' : 'ระวังหน่อยนะ'}
          </p>
          <p
            className="text-[10px] mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {isGood ? 'ยังเหลืองบอีกเยอะ 👍' : 'ใช้เกือบถึงงบแล้ว'}
          </p>
        </div>

        {/* Today records card */}
        <div
          className="p-4 rounded-2xl flex flex-col justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(167, 139, 250, 0.04))',
            border: '1px solid rgba(139, 92, 246, 0.12)',
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'rgba(139, 92, 246, 0.12)' }}
          >
            <TrendingUp size={18} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: '#7c3aed' }}>
              {todayCount} <span className="text-xs font-semibold">รายการ</span>
            </p>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              บันทึกวันนี้แล้ว
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
