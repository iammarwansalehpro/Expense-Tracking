import { ScanLine, Clock, CheckCircle2, FileText, Settings, Zap } from 'lucide-react';

export default function AutoScanSection() {
  return (
    <div className="px-5 mb-6">
      <div className="glass-card-strong p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Auto Scan
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              ตรวจจากโฟลเดอร์ที่เลือก ตามความถี่ที่ตั้งไว้
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            เปิดอยู่
          </span>
        </div>

        {/* Info cards row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div
            className="p-3 rounded-xl flex items-center gap-2.5"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
            }}
          >
            <ScanLine size={16} style={{ color: '#8b5cf6' }} />
            <div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>ความถี่</p>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>ทุกสัปดาห์</p>
            </div>
          </div>
          <div
            className="p-3 rounded-xl flex items-center gap-2.5"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
            }}
          >
            <Clock size={16} style={{ color: '#8b5cf6' }} />
            <div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>สแกนล่าสุด</p>
              <p className="text-xs font-bold text-fit" style={{ color: 'var(--text-primary)' }}>ยังไม่เคยสแกน</p>
            </div>
          </div>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div
            className="p-3 rounded-xl flex items-center gap-2.5"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
            }}
          >
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
            <div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>เพิ่มเข้าแอปแล้ว</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                0 <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>ใบ</span>
              </p>
            </div>
          </div>
          <div
            className="p-3 rounded-xl flex items-center gap-2.5"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
            }}
          >
            <FileText size={16} style={{ color: '#f59e0b' }} />
            <div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>ยังไม่เพิ่ม</p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                0 <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>ใบ</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            className="py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
            style={{
              background: 'transparent',
              border: '1.5px solid #8b5cf6',
              color: '#8b5cf6',
            }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Settings size={14} />
              ตั้งค่า
            </span>
          </button>
          <button
            className="py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Zap size={14} />
              ตรวจตอนนี้
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
