import { ChevronDown, Wallet } from 'lucide-react';

export default function WalletSelector() {
  return (
    <div className="px-5 mb-4">
      <button
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 active:scale-[0.97]"
        style={{
          background: 'var(--wallet-selector-bg, rgba(167, 139, 250, 0.12))',
          border: '1px solid var(--wallet-selector-border, rgba(167, 139, 250, 0.2))',
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}
        >
          <Wallet size={12} color="white" />
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          กระเป๋าหลัก
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </button>
    </div>
  );
}
