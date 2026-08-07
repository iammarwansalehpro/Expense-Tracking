import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { formatCurrency, formatDateGroup } from '@/lib/utils';
import CategoryIcon from '@/components/shared/CategoryIcon';
import type { Transaction } from '@/types';

type TabFilter = 'all' | 'income' | 'expense';
const TABS: { id: TabFilter; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'income', label: 'รายรับ' },
  { id: 'expense', label: 'รายจ่าย' },
];

function groupByDate(txs: Transaction[]): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const key = new Date(tx.date).toDateString();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(tx);
  }
  return grouped;
}

export default function TransactionList() {
  const transactions = useTransactionStore(s => s.transactions);
  const [filter, setFilter] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!tx.title.toLowerCase().includes(q) && !tx.category.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const grouped = groupByDate(filtered);

  return (
    <div className="stagger-children">
      {/* Search bar */}
      <div className="px-5 mb-4">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="ค้นหารายการ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-5 mb-4">
        <div className="tab-group">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-item ${filter === tab.id ? 'active' : ''}`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction groups */}
      <div className="px-5 space-y-4">
        {filtered.length === 0 ? (
          <div
            className="text-center py-12"
            style={{ color: 'var(--text-muted)' }}
          >
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm">ไม่พบรายการ</p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([dateKey, txs]) => (
            <div key={dateKey}>
              <p
                className="text-xs font-semibold mb-2 px-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {formatDateGroup(txs[0].date)}
              </p>
              <div className="glass-card-strong overflow-hidden">
                {txs.map((tx, i) => {
                  return (
                    <div
                      key={tx.id}
                      className="transaction-item"
                      style={{
                        borderBottom:
                          i < txs.length - 1
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
                          {tx.category}
                        </p>
                      </div>
                      <span
                        className="text-sm font-bold whitespace-nowrap"
                        style={{
                          color:
                            tx.type === 'income'
                              ? 'var(--color-success)'
                              : 'var(--color-danger)',
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
          ))
        )}
      </div>
    </div>
  );
}
