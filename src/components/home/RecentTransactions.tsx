import { ChevronRight } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import CategoryIcon from '@/components/shared/CategoryIcon';

export default function RecentTransactions() {
  const transactions = useTransactionStore((s) => s.transactions);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  const recent = transactions.slice(0, 5);

  return (
    <div className="px-5 mt-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-base font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          รายการล่าสุด
        </h2>
        <button
          onClick={() => setCurrentPage('overview')}
          className="flex items-center gap-0.5 text-sm font-medium transition-colors"
          style={{ color: 'var(--color-primary)' }}
        >
          ดูทั้งหมด
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Transaction list */}
      <div className="glass-card-strong overflow-hidden">
        {recent.map((tx, i) => {
          return (
            <div
              key={tx.id}
              className="transaction-item"
              style={{
                borderBottom:
                  i < recent.length - 1
                    ? '1px solid var(--border-subtle)'
                    : 'none',
              }}
            >
              <CategoryIcon categoryName={tx.category} />
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold text-fit"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {tx.title}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {tx.category} • {formatDate(tx.date)}
                </p>
              </div>
              <span
                className="text-sm font-bold whitespace-nowrap"
                style={{
                  color: tx.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)',
                }}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(tx.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
