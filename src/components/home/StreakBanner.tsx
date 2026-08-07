import { Flame, ChevronRight } from 'lucide-react';

export default function StreakBanner() {
  const streakDays = 12; // Mock data

  return (
    <div className="px-5 mb-5">
      <button
        className="w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.08))',
          border: '1px solid rgba(16, 185, 129, 0.15)',
        }}
      >
        <Flame size={16} style={{ color: '#f59e0b' }} />
        <span className="text-sm font-semibold" style={{ color: '#059669' }}>
          คุมงบต่อเนื่อง {streakDays} วัน
        </span>
        <ChevronRight size={14} style={{ color: '#059669' }} />
      </button>
    </div>
  );
}
