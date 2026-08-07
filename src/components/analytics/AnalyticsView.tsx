import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useTransactionStore } from '@/store/useTransactionStore';
import { formatCurrency } from '@/lib/utils';
import CategoryIcon from '@/components/shared/CategoryIcon';
import { getCategoryStyle, type CategoryStyle } from '@/utils/categoryStyles';
import { useAppStore } from '@/store/useAppStore';

type Period = 'month' | '3month' | '6month' | 'year';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'month', label: 'เดือนนี้' },
  { id: '3month', label: '3 เดือน' },
  { id: '6month', label: '6 เดือน' },
  { id: 'year', label: 'ปีนี้' },
];

export default function AnalyticsView() {
  const [period, setPeriod] = useState<Period>('month');
  const transactions = useTransactionStore((s) => s.transactions);
  const appCategories = useAppStore(s => s.appCategories);

  // Calculate local breakdown
  const currentMonthTransactions = transactions.filter(tx => {
    // Only current month for simplicity, or we can just filter by period later
    const txDate = new Date(tx.date);
    const now = new Date();
    if (period === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    // simple fallback: include all
    return true;
  });

  const expenseTxs = currentMonthTransactions.filter(t => t.type === 'expense');
  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

  const breakdownMap = new Map<string, number>();
  expenseTxs.forEach(t => {
    breakdownMap.set(t.category, (breakdownMap.get(t.category) || 0) + t.amount);
  });

  const breakdown = Array.from(breakdownMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  // Pie chart data
  const pieData = breakdown.map((item) => {
    const style = getCategoryStyle(item.category, appCategories || undefined);
    return {
      name: item.category,
      value: item.total,
      color: style.color.match(/bg-\[([^\]]+)\]/)?.[1] || '#6b7280',
      category: item.category,
    };
  });

  // Monthly trend data
  const trendData = [
    { month: 'ม.ค.', income: 25000, expense: 15000 },
    { month: 'ก.พ.', income: 28000, expense: 18000 },
    { month: 'มี.ค.', income: 26000, expense: 14000 },
  ];

  return (
    <div className="stagger-children">
      {/* Period selector */}
      <div className="px-5 mb-5">
        <div className="tab-group">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              className={`tab-item ${period === p.id ? 'active' : ''}`}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Donut Chart */}
      <div className="px-5 mb-5">
        <div className="glass-card-strong p-5">
          <h3
            className="text-sm font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            สัดส่วนรายจ่าย
          </h3>

          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-36 h-36 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2">
                {pieData.slice(0, 5).map((item) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <span
                      className="text-xs flex-1 text-fit"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {totalExpense > 0
                        ? `${Math.round((item.value / totalExpense) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p
              className="text-center py-8 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              ไม่มีข้อมูลรายจ่ายในช่วงนี้
            </p>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="px-5 mb-5">
        <div className="glass-card-strong p-5">
          <h3
            className="text-sm font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            แนวโน้มรายรับ-รายจ่าย
          </h3>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-subtle)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v / 1000}k`}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-glass-strong)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 12,
                    backdropFilter: 'blur(12px)',
                    color: 'var(--text-primary)',
                    fontFamily: 'Noto Sans Thai',
                    fontSize: 12,
                  }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="รายรับ"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="รายจ่าย"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown List */}
      <div className="px-5 mb-5">
        <div className="glass-card-strong overflow-hidden">
          <div className="p-4 pb-2">
            <h3
              className="text-sm font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              รายจ่ายตามหมวดหมู่
            </h3>
          </div>

          {breakdown.map((item, i) => {
            const style = getCategoryStyle(item.category, appCategories || undefined);
            const pct = totalExpense > 0 ? (item.total / totalExpense) * 100 : 0;
            const hexColor = style.color.match(/bg-\[([^\]]+)\]/)?.[1] || '#6b7280';

            return (
              <div
                key={item.category}
                className="px-4 py-3"
                style={{
                  borderBottom:
                    i < breakdown.length - 1
                      ? '1px solid var(--border-subtle)'
                      : 'none',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <CategoryIcon categoryName={item.category} />
                  <span
                    className="text-sm font-semibold flex-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.category}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatCurrency(item.total)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: hexColor,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {breakdown.length === 0 && (
            <p
              className="text-center py-8 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              ไม่มีข้อมูล
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
