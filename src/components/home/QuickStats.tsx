import { ScanLine, PenLine, CalendarDays } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function QuickActions() {
  const setAddMenuOpen = useAppStore((s) => s.setAddMenuOpen);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  return (
    <div className="px-5 mb-6">
      <h3
        className="text-base font-bold mb-3"
        style={{ color: 'var(--text-primary)' }}
      >
        ทำอะไรต่อดี?
      </h3>

      {/* Main action - Scan bill */}
      <button
        onClick={() => setAddMenuOpen(true)}
        className="w-full mb-3 p-4 rounded-2xl flex items-center gap-4 text-left transition-all duration-200 active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.04))',
          border: '1px solid rgba(139, 92, 246, 0.12)',
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
          }}
        >
          <ScanLine size={22} color="white" />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#7c3aed' }}>
            อ่านบิล
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            บันทึกรายจ่ายแบบเร็วที่สุด
          </p>
        </div>
      </button>

      {/* Two smaller action cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setAddMenuOpen(true)}
          className="p-4 rounded-2xl flex items-center gap-3 text-left transition-all duration-200 active:scale-[0.97]"
          style={{
            background: 'var(--bg-glass-strong)',
            border: '1px solid var(--border-glass)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139, 92, 246, 0.1)' }}
          >
            <PenLine size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            เพิ่มรายจ่ายเอง
          </span>
        </button>

        <button
          onClick={() => setCurrentPage('overview')}
          className="p-4 rounded-2xl flex items-center gap-3 text-left transition-all duration-200 active:scale-[0.97]"
          style={{
            background: 'var(--bg-glass-strong)',
            border: '1px solid var(--border-glass)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139, 92, 246, 0.1)' }}
          >
            <CalendarDays size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            ปฏิทินรายจ่าย
          </span>
        </button>
      </div>
    </div>
  );
}
