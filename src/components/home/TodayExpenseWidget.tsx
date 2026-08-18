import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Edit2, 
  Target, 
  X, 
  Check, 
  Sparkles,
  Minus
} from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useToastStore } from '@/store/useToastStore';
import { useTranslation } from '@/hooks/useTranslation';

const BUDGET_PRESETS = [300, 500, 800, 1000, 1500];

export default function TodayExpenseWidget() {
  const transactions = useTransactionStore((s) => s.transactions);
  const dailyBudget = useSettingsStore((s) => s.dailyBudget);
  const setDailyBudget = useSettingsStore((s) => s.setDailyBudget);
  const { language } = useTranslation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(dailyBudget || 500));

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    // Transactions today
    const todayTxs = transactions.filter(
      (t) => new Date(t.date).toDateString() === todayStr
    );

    const todayExpense = todayTxs
      .filter((t) => t.type === 'expense' || t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);

    const todayIncome = todayTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const todayCount = todayTxs.length;

    // Transactions yesterday
    const yesterdayExpense = transactions
      .filter(
        (t) => (t.type === 'expense' || t.type === 'transfer') && new Date(t.date).toDateString() === yesterdayStr
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate Trend vs Yesterday
    let trendType: 'up' | 'down' | 'equal' | 'no_yesterday' | 'zero_today' = 'equal';
    let trendPercent = 0;

    if (todayExpense === 0) {
      trendType = 'zero_today';
    } else if (yesterdayExpense === 0) {
      trendType = 'no_yesterday';
    } else {
      const diff = ((todayExpense - yesterdayExpense) / yesterdayExpense) * 100;
      trendPercent = Math.round(Math.abs(diff));
      if (diff > 0) {
        trendType = 'up';
      } else if (diff < 0) {
        trendType = 'down';
      } else {
        trendType = 'equal';
      }
    }

    // Budget Calculations
    const target = dailyBudget > 0 ? dailyBudget : 500;
    const remaining = target - todayExpense;
    const isOverBudget = remaining < 0;
    const pctUsed = Math.min(100, Math.round((todayExpense / target) * 100));

    return {
      todayExpense,
      todayIncome,
      todayCount,
      trendType,
      trendPercent,
      target,
      remaining,
      isOverBudget,
      pctUsed,
      now,
    };
  }, [transactions, dailyBudget]);

  const handleOpenModal = () => {
    setBudgetInput(String(stats.target));
    setIsEditModalOpen(true);
  };

  const handleSaveBudget = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseFloat(budgetInput.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      setDailyBudget(num);
      useToastStore.getState().addToast(`ตั้งเป้าหมายรายวัน ฿${num.toLocaleString()} เรียบร้อยแล้ว`, 'success');
      setIsEditModalOpen(false);
    } else {
      useToastStore.getState().addToast('กรุณาระบุจำนวนเงินที่ถูกต้อง', 'error');
    }
  };

  // Dynamic status color for progress
  const progressGradient = stats.isOverBudget
    ? 'from-rose-500 to-red-600'
    : stats.pctUsed > 80
    ? 'from-amber-400 to-orange-500'
    : 'from-emerald-400 to-teal-500';

  return (
    <>
      <div className="px-6 mb-6 shrink-0">
        <div className="bg-white/40 dark:bg-[#1E1035]/80 backdrop-blur-xl rounded-[28px] p-5 border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(31,38,135,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col gap-3.5 relative overflow-hidden transition-all duration-300">
          
          {/* Subtle Decorative Ambient Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-rose-400/10 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-400/10 dark:bg-indigo-500/10 rounded-full blur-xl pointer-events-none translate-y-1/2 -translate-x-1/4" />

          {/* ส่วนบน: วันที่, ยอดใช้จ่ายรวม, เป้าหมาย & คงเหลือ + Progress Bar */}
          <div className="flex flex-col gap-3 relative z-10">
            {/* แถวที่ 1: วันที่ & ยอดใช้จ่ายรวม */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* 📅 Mini Calendar Badge */}
                <div className="w-12 h-12 rounded-[16px] bg-white dark:bg-white/10 flex flex-col items-center shrink-0 shadow-[0_4px_12px_rgba(46,16,101,0.08)] border border-rose-100/60 dark:border-white/15 overflow-hidden">
                  <div className="w-full h-4 bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center">
                    <span className="text-[9px] font-extrabold text-white uppercase tracking-wider">
                      {new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', { month: 'short' }).format(stats.now)}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center w-full bg-gradient-to-b from-white to-rose-50/40 dark:from-transparent dark:to-transparent">
                    <span className="text-[20px] font-black text-rose-600 dark:text-rose-400 tracking-tight leading-none">
                      {stats.now.getDate()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[#2E1065] dark:text-white font-extrabold text-[16px] tracking-tight">
                    ยอดใช้จ่ายวันนี้
                  </span>
                  <span className="text-[11px] font-medium text-[#2E1065]/60 dark:text-white/60 mt-0.5">
                    รวมทุกรายการแล้ว
                  </span>
                </div>
              </div>

              {/* ยอดเงินรวม */}
              <div className="text-right">
                <span className={`text-[23px] font-black tracking-tight ${
                  stats.todayExpense > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[#2E1065]/70 dark:text-white/70'
                }`}>
                  {stats.todayExpense > 0 ? `-${stats.todayExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '฿0.00'}
                  {stats.todayExpense > 0 && <span className="text-[14px] font-bold ml-1 opacity-80">฿</span>}
                </span>
              </div>
            </div>

            {/* เป้าหมาย & คงเหลือ + Progress Bar */}
            <div className="flex flex-col gap-1.5 pt-0.5">
              <div className="flex items-center justify-between text-xs">
                {/* ฝั่งซ้าย: เป้าหมาย + ปุ่มแก้ไข */}
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#2E1065]/80 dark:text-white/80 text-[12px]">
                    เป้าหมาย <span className="font-extrabold text-[#2E1065] dark:text-white">฿{stats.target.toLocaleString()}</span>
                  </span>
                  <button
                    onClick={handleOpenModal}
                    className="w-6 h-6 rounded-full bg-white/70 dark:bg-white/15 flex items-center justify-center shadow-sm border border-white/60 dark:border-white/20 text-[#2E1065] dark:text-white hover:text-[#8B5CF6] hover:bg-white hover:scale-110 active:scale-95 transition-all ml-0.5"
                    title="กำหนด/แก้ไขเป้าหมายรายวัน"
                    aria-label="Edit daily target"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>

                {/* ฝั่งขวา: คงเหลือ */}
                <div className="text-right">
                  <span className="font-bold text-[12px]">
                    {stats.isOverBudget ? (
                      <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                        เกินงบ ฿{Math.abs(stats.remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                        คงเหลือ ฿{stats.remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* แถบ Progress Bar สไตล์ Glow */}
              <div className="w-full bg-[#2E1065]/8 dark:bg-white/10 h-2 rounded-full overflow-hidden shadow-inner relative">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${progressGradient} transition-all duration-500 shadow-sm`}
                  style={{ width: `${Math.min(100, (stats.todayExpense / stats.target) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* ส่วนล่าง (ใต้เส้นคั่น): จำนวนรายการ & เปรียบเทียบ vs เมื่อวาน */}
          <div className="flex items-center justify-between pt-2.5 border-t border-[#2E1065]/8 dark:border-white/10 relative z-10">
            {/* ฝั่งซ้าย: จำนวนรายการ */}
            <div className="flex items-center px-3 py-1 bg-white/50 dark:bg-white/10 rounded-full border border-white/60 dark:border-white/10 shadow-sm">
              <span className="text-[11px] font-bold text-[#2E1065] dark:text-white">
                {stats.todayCount > 0 ? `${stats.todayCount} รายการ` : 'ยังไม่มีรายการ'}
              </span>
            </div>

            {/* ฝั่งขวา: เปรียบเทียบ vs เมื่อวาน */}
            <div className="flex items-center">
              {stats.trendType === 'up' && (
                <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-[11px] font-bold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{stats.trendPercent}% vs เมื่อวาน</span>
                </div>
              )}
              {stats.trendType === 'down' && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>-{stats.trendPercent}% vs เมื่อวาน</span>
                </div>
              )}
              {stats.trendType === 'equal' && (
                <div className="flex items-center gap-1 text-[#2E1065]/70 dark:text-white/70 text-[11px] font-bold bg-[#2E1065]/5 dark:bg-white/10 px-2.5 py-1 rounded-full">
                  <Minus className="w-3.5 h-3.5" />
                  <span>เท่ากับเมื่อวาน</span>
                </div>
              )}
              {stats.trendType === 'no_yesterday' && (
                <div className="flex items-center gap-1 text-[#2E1065]/70 dark:text-white/70 text-[11px] font-bold bg-[#2E1065]/5 dark:bg-white/10 px-2.5 py-1 rounded-full">
                  <span>วันนี้ใช้ไป ฿{stats.todayExpense.toLocaleString()}</span>
                </div>
              )}
              {stats.trendType === 'zero_today' && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ยังไม่มีรายจ่ายวันนี้</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Edit Daily Budget Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div 
            className="w-full max-w-sm bg-white/95 dark:bg-[#1E1035]/95 backdrop-blur-2xl rounded-[32px] p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white dark:border-white/15 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6]">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#2E1065] dark:text-white tracking-tight">
                  กำหนดเป้าหมายรายวัน
                </h3>
                <p className="text-xs text-[#2E1065]/60 dark:text-white/60 font-medium">
                  ตั้งงบประมาณที่คุณต้องการใช้ต่อวัน
                </p>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSaveBudget} noValidate className="flex flex-col gap-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#2E1065]/40 dark:text-white/40">
                  ฿
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="500"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-100/80 dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded-2xl text-xl font-black text-[#2E1065] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all"
                />
              </div>

              {/* Preset Buttons */}
              <div>
                <span className="text-[11px] font-bold text-[#2E1065]/60 dark:text-white/60 mb-2 block uppercase tracking-wider">
                  ตัวเลือกด่วน
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {BUDGET_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBudgetInput(String(preset))}
                      className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                        budgetInput === String(preset)
                          ? 'bg-[#2E1065] text-white shadow-md'
                          : 'bg-slate-100 dark:bg-white/10 text-[#2E1065]/80 dark:text-white/80 hover:bg-slate-200 dark:hover:bg-white/20'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-white/10 text-[#2E1065]/70 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/20 transition-all active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#2E1065] to-[#4C1D95] text-white shadow-lg shadow-[#2E1065]/20 flex items-center justify-center gap-1.5 hover:opacity-95 transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกเป้าหมาย</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
