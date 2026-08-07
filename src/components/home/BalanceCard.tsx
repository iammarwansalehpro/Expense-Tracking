import { useState, useMemo } from 'react';
import { Wallet, TrendingDown, CalendarDays, PiggyBank } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';

type BudgetPeriod = 'daily' | 'weekly' | 'monthly';

const PERIOD_TABS: { id: BudgetPeriod; label: string }[] = [
  { id: 'daily', label: 'รายวัน' },
  { id: 'weekly', label: 'รายสัปดาห์' },
  { id: 'monthly', label: 'รายเดือน' },
];

const MONTHLY_BUDGET = 10000; // Mock budget

function formatNumber(n: number): string {
  return n.toLocaleString('th-TH');
}

export default function BudgetCard() {
  const [period, setPeriod] = useState<BudgetPeriod>('daily');
  const transactions = useTransactionStore((s) => s.transactions);

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const remainingDays = daysInMonth - dayOfMonth + 1;
    const hoursLeft = 24 - now.getHours();

    // Monthly spending
    const monthlyExpense = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          new Date(t.date).getMonth() === now.getMonth() &&
          new Date(t.date).getFullYear() === now.getFullYear()
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Today's spending
    const todayExpense = transactions
      .filter(
        (t) => t.type === 'expense' && new Date(t.date).toDateString() === today
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Weekly spending (current week)
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weeklyExpense = transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          new Date(t.date) >= weekStart &&
          new Date(t.date) <= now
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const dailyBudget = Math.round(MONTHLY_BUDGET / daysInMonth);
    const weeklyBudget = Math.round(MONTHLY_BUDGET / 4);
    const avgPerDay = dayOfMonth > 1 ? Math.round(monthlyExpense / (dayOfMonth - 1 || 1)) : 0;

    let budgetForPeriod: number;
    let spentForPeriod: number;
    let budgetLabel: string;
    let budgetSource: string;

    switch (period) {
      case 'daily':
        budgetForPeriod = dailyBudget;
        spentForPeriod = todayExpense;
        budgetLabel = 'วันนี้ใช้ได้อีก';
        budgetSource = `จากงบประมาณ ${formatNumber(dailyBudget)} บาท`;
        break;
      case 'weekly':
        budgetForPeriod = weeklyBudget;
        spentForPeriod = weeklyExpense;
        budgetLabel = 'สัปดาห์นี้ใช้ได้อีก';
        budgetSource = `จากงบประมาณ ${formatNumber(weeklyBudget)} บาท`;
        break;
      case 'monthly':
        budgetForPeriod = MONTHLY_BUDGET;
        spentForPeriod = monthlyExpense;
        budgetLabel = 'เดือนนี้ใช้ได้อีก';
        budgetSource = `จากงบประมาณ ${formatNumber(MONTHLY_BUDGET)} บาท`;
        break;
    }

    const remaining = Math.max(0, budgetForPeriod - spentForPeriod);
    const pctUsed = budgetForPeriod > 0 ? Math.min(100, Math.round((spentForPeriod / budgetForPeriod) * 100)) : 0;
    const canSpendPerDay = remainingDays > 0 ? Math.round((MONTHLY_BUDGET - monthlyExpense) / remainingDays) : 0;

    return {
      remaining,
      budgetForPeriod,
      spentForPeriod,
      budgetLabel,
      budgetSource,
      pctUsed,
      hoursLeft,
      avgPerDay,
      todayExpense,
      canSpendPerDay,
      monthlyExpense,
      remainingDays,
    };
  }, [period, transactions]);

  // Progress bar color based on spending
  const progressColor =
    stats.pctUsed < 50
      ? '#8b5cf6'
      : stats.pctUsed < 80
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className="px-5 mb-4 animate-scale-in">
      <div className="budget-card">
        {/* Period Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'var(--budget-tab-bg, rgba(139, 92, 246, 0.08))' }}>
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-250"
              style={{
                background: period === tab.id ? 'white' : 'transparent',
                color: period === tab.id ? '#7c3aed' : 'var(--text-muted)',
                boxShadow: period === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Budget label */}
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          {stats.budgetLabel}
        </p>

        {/* Amount + Icon */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="budget-amount">
              {formatNumber(stats.remaining)} <span className="text-xl font-semibold">บาท</span>
            </p>
          </div>
          <button
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
          >
            <Wallet size={20} color="white" />
          </button>
        </div>

        {/* Budget source info */}
        <p className="text-xs font-semibold mb-0.5" style={{ color: '#8b5cf6' }}>
          {stats.budgetSource}
        </p>
        <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>
          ประมาณจากงบรายเดือน
        </p>
        <p className="text-xs font-medium mb-4" style={{ color: '#8b5cf6' }}>
          ใช้ไปแล้ว {formatNumber(stats.spentForPeriod)} บาท
        </p>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold" style={{ color: progressColor }}>
              {stats.pctUsed}% ใช้ไปแล้ว
            </span>
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              {period === 'daily'
                ? `เหลืออีก ${stats.hoursLeft} ชม.`
                : period === 'weekly'
                ? `เหลืออีก ${7 - new Date().getDay()} วัน`
                : `เหลืออีก ${stats.remainingDays} วัน`}
            </span>
          </div>
          <div className="budget-progress">
            <div
              className="budget-progress-fill"
              style={{
                width: `${stats.pctUsed}%`,
                background: `linear-gradient(90deg, ${progressColor}, ${progressColor}cc)`,
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="my-4" style={{ borderTop: '1px solid var(--border-subtle)' }} />

        {/* Three stat boxes */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                ≈ เฉลี่ยต่อวัน
              </span>
            </div>
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatNumber(stats.avgPerDay)}
              <span className="text-[10px] font-medium ml-0.5" style={{ color: 'var(--text-muted)' }}>บาท</span>
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              จากจังหวะตอนนี้
            </p>
          </div>

          <div className="text-center" style={{ borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <CalendarDays size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                วันนี้ใช้ไป
              </span>
            </div>
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatNumber(stats.todayExpense)}
              <span className="text-[10px] font-medium ml-0.5" style={{ color: 'var(--text-muted)' }}>บาท</span>
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              จากแผน {formatNumber(stats.budgetForPeriod)} บาท
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <PiggyBank size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                ใช้ได้ต่อวัน
              </span>
            </div>
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatNumber(stats.canSpendPerDay)}
              <span className="text-[10px] font-medium ml-0.5" style={{ color: 'var(--text-muted)' }}>บาท</span>
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              จนถึงสิ้นเดือน
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
