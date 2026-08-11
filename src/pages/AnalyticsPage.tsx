import { ChevronLeft, ChevronRight, TrendingUp, Info, Sparkles, PlusCircle, ScanLine, TrendingDown, Activity, Crown, Layers, Lightbulb, AlertTriangle, CheckCircle2, Star } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import AutoShrinkText from '@/components/ui/AutoShrinkText';
import AppHeader from '@/components/layout/AppHeader';
import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Transaction } from '@/types';

const getEffectiveAmountForMonth = (tx: Transaction, targetMonth: number, targetYear: number): number => {
  const txDate = new Date(tx.date);
  const m = txDate.getMonth();
  const y = txDate.getFullYear();
  
  if (!tx.installmentMonths || tx.installmentMonths <= 1) {
    return (m === targetMonth && y === targetYear) ? tx.amount : 0;
  }
  
  const monthsDiff = (targetYear - y) * 12 + (targetMonth - m);
  if (monthsDiff >= 0 && monthsDiff < tx.installmentMonths) {
    const principalPerMonth = tx.amount / tx.installmentMonths;
    const rate = (tx.installmentInterestRate || 0) / 100;
    const interestPerMonth = tx.amount * rate;
    return principalPerMonth + interestPerMonth;
  }
  return 0;
};

const COLORS = ['#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#A855F7', '#14B8A6'];

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const language = useSettingsStore(s => s.language);
  const transactions = useTransactionStore((s) => s.transactions);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [viewDate, setViewDate] = useState(new Date());

  const {
    currentMonthTotal,
    avgPerDay,
    topCategory,
    txCount,
    categoryTotals,
    compareData
  } = useMemo(() => {
    const cMonth = viewDate.getMonth();
    const cYear = viewDate.getFullYear();
    const daysInMonth = new Date(cYear, cMonth + 1, 0).getDate();
    
    // If viewing current month, average by current day. If past month, average by total days.
    const now = new Date();
    const isCurrentMonth = now.getMonth() === cMonth && now.getFullYear() === cYear;
    const daysToDivide = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth;

    let total = 0;
    let count = 0;
    const catMap: Record<string, number> = {};
    
    // Monthly comparison array (cMonth-2, cMonth-1, cMonth)
    const compare = [0, 0, 0]; 

    transactions.forEach(t => {
      if (t.type !== activeTab) return;
      
      const currentAmount = getEffectiveAmountForMonth(t, cMonth, cYear);
      if (currentAmount > 0) {
        total += currentAmount;
        count++;
        catMap[t.category] = (catMap[t.category] || 0) + currentAmount;
        compare[2] += currentAmount;
      }
      
      const prev1 = new Date(cYear, cMonth - 1, 1);
      const prev1Amount = getEffectiveAmountForMonth(t, prev1.getMonth(), prev1.getFullYear());
      if (prev1Amount > 0) compare[1] += prev1Amount;
      
      const prev2 = new Date(cYear, cMonth - 2, 1);
      const prev2Amount = getEffectiveAmountForMonth(t, prev2.getMonth(), prev2.getFullYear());
      if (prev2Amount > 0) compare[0] += prev2Amount;
    });

    const avg = total / daysToDivide;
    
    let tCategory = '-';
    let maxCatVal = 0;
    Object.entries(catMap).forEach(([cat, val]) => {
      if (val > maxCatVal) {
        maxCatVal = val;
        tCategory = cat;
      }
    });

    // Sort categories by amount
    const sortedCats = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], index) => ({ name, amount, fill: COLORS[index % COLORS.length] }));

    return {
      currentMonthTotal: total,
      avgPerDay: avg,
      topCategory: tCategory,
      txCount: count,
      categoryTotals: sortedCats,
      compareData: compare
    };
  }, [transactions, activeTab, viewDate]);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col h-full bg-transparent animate-fade-in pb-24 px-6 pt-16 items-center justify-center">
        <div className="w-28 h-28 bg-white/40 backdrop-blur-xl rounded-[36px] flex items-center justify-center shadow-[0_8px_32px_rgba(31,38,135,0.1)] border border-white/50 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/20 to-pink-500/20" />
          <Sparkles className="w-12 h-12 text-purple-500 drop-shadow-sm" />
        </div>
        
        <h2 className="text-[26px] font-bold text-[#2E1065] text-center mb-3 tracking-tight drop-shadow-sm">
          {t('stats.title')}
        </h2>
        
        <p className="text-[15px] font-medium text-[#2E1065]/70 text-center mb-12 max-w-[280px] leading-relaxed">
          {t('stats.emptyDesc')}
        </p>
        
        <div className="w-full flex flex-col gap-3 px-2">
           <button 
             onClick={() => document.getElementById('slip-upload')?.click()} 
             className="w-full py-4 rounded-[24px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-[16px] shadow-[0_8px_24px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
           >
             <ScanLine className="w-5 h-5" />
             {t('stats.scanSlip')}
           </button>
           <button 
             onClick={() => setCurrentPage('add')} 
             className="w-full py-4 rounded-[24px] bg-white/50 backdrop-blur-xl border border-white/60 text-[#2E1065] font-bold text-[16px] shadow-sm hover:bg-white/70 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
           >
             <PlusCircle className="w-5 h-5 text-purple-600" />
             {t('stats.addManual')}
           </button>
        </div>
      </div>
    );
  }
  
  const dateFormatter = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', { month: 'long', year: 'numeric' });
  const currentMonthStr = dateFormatter.format(viewDate);
  
  const monthFormatter = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', { month: 'short' });
  const getMonthLabel = (offset: number) => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() - offset);
    return monthFormatter.format(d);
  };

  // Max value for scaling the bars
  const maxCompare = Math.max(...compareData, 1); // avoid div by 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-white/60 shadow-lg text-center">
          <p className="text-[#2E1065] font-bold text-sm">{payload[0].name}</p>
          <p className="text-[#8B5CF6] font-bold">฿{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const { smartTotalIncome, smartTotalExpense } = useMemo(() => {
    let inc = 0, exp = 0;
    const cMonth = viewDate.getMonth();
    const cYear = viewDate.getFullYear();
    transactions.forEach(t => {
      if (t.type === 'income') {
        const tDate = new Date(t.date);
        if (tDate.getMonth() === cMonth && tDate.getFullYear() === cYear) {
          inc += t.amount;
        }
      } else if (t.type === 'expense') {
        exp += getEffectiveAmountForMonth(t, cMonth, cYear);
      }
    });
    return { smartTotalIncome: inc, smartTotalExpense: exp };
  }, [transactions, viewDate]);

  let monthProgress = 100;
  const now = new Date();
  if (viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() === now.getMonth()) {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    monthProgress = (now.getDate() / daysInMonth) * 100;
  } else if (viewDate > now) {
    monthProgress = 0;
  }

  let analysisLevel = "info"; 
  let analysisTitle = "";
  let analysisText = "";
  let iconColor = "text-purple-500";
  let bgGradient = "from-purple-500/10 to-indigo-500/5";
  let borderColor = "border-purple-200/50";
  let progressColor = "bg-purple-500";
  let starRating = 0;
  
  const expenseRatio = smartTotalIncome > 0 ? (smartTotalExpense / smartTotalIncome) * 100 : (smartTotalExpense > 0 ? 100 : 0);
  const burnRateDiff = monthProgress - expenseRatio;

  if (smartTotalIncome === 0 && smartTotalExpense === 0) {
    analysisLevel = "info";
    analysisTitle = language === 'en' ? "No Data Yet" : "ยังไม่มีข้อมูล";
    analysisText = language === 'en' ? "Add income and expenses to see your financial health analysis." : "เพิ่มข้อมูลรายรับและรายจ่ายเพื่อดูการวิเคราะห์สุขภาพการเงินครับ";
  } else if (smartTotalExpense > smartTotalIncome) {
    analysisLevel = "critical";
    starRating = 1;
    iconColor = "text-rose-600";
    bgGradient = "from-rose-500/10 to-red-500/5";
    borderColor = "border-rose-200/50";
    progressColor = "bg-rose-500";
    analysisTitle = language === 'en' ? "Critical: Overspending" : "วิกฤต: รายจ่ายสูงกว่ารายรับ";
    analysisText = language === 'en' 
      ? "Your expenses have exceeded your income. Halt unnecessary spending immediately."
      : "รายจ่ายเกินรายรับทั้งหมดไปแล้ว ขอแนะนำให้ชะลอการใช้จ่ายที่ไม่จำเป็นด่วนที่สุดครับ";
  } else if (burnRateDiff < -20) {
    analysisLevel = "warning";
    starRating = 2;
    iconColor = "text-orange-500";
    bgGradient = "from-orange-500/10 to-amber-500/5";
    borderColor = "border-orange-300/50";
    progressColor = "bg-orange-500";
    analysisTitle = language === 'en' ? "Warning: High Burn Rate" : "เฝ้าระวัง: ใช้เงินเร็วกว่าเวลา";
    analysisText = language === 'en'
      ? `You have spent ${expenseRatio.toFixed(0)}% of your income, but only ${monthProgress.toFixed(0)}% of the month has passed. Slow down to avoid a deficit.`
      : `คุณใช้เงินไปแล้ว ${expenseRatio.toFixed(0)}% ทั้งที่เพิ่งผ่านไปเพียง ${monthProgress.toFixed(0)}% ของเดือน ควรระมัดระวังการใช้จ่ายเพื่อป้องกันเงินขาดมือครับ`;
  } else if (burnRateDiff < 0) {
    analysisLevel = "moderate";
    starRating = 3;
    iconColor = "text-amber-600";
    bgGradient = "from-amber-500/10 to-yellow-500/5";
    borderColor = "border-amber-200/50";
    progressColor = "bg-amber-400";
    analysisTitle = language === 'en' ? "Moderate: Slightly Over Track" : "ปานกลาง: ค่อนข้างตึงมือ";
    analysisText = language === 'en'
      ? `Your spending (${expenseRatio.toFixed(0)}%) is slightly ahead of the time passed (${monthProgress.toFixed(0)}%). Keep a close eye on your budget.`
      : `อัตราการใช้จ่าย (${expenseRatio.toFixed(0)}%) นำหน้าเวลาที่ผ่านไปเล็กน้อย (${monthProgress.toFixed(0)}%) ถือว่าตึงมือแต่ยังอยู่ในวิสัยที่ปรับลดได้ครับ`;
  } else if (burnRateDiff < 20) {
    analysisLevel = "good";
    starRating = 4;
    iconColor = "text-emerald-600";
    bgGradient = "from-emerald-500/10 to-teal-500/5";
    borderColor = "border-emerald-200/50";
    progressColor = "bg-emerald-500";
    analysisTitle = language === 'en' ? "Good: On Track" : "ดี: บริหารเงินได้พอดี";
    analysisText = language === 'en'
      ? `Your spending matches the month's progress nicely. You are controlling your expenses well.`
      : `อัตราการใช้จ่ายสอดคล้องกับเวลาที่ผ่านไปอย่างเหมาะสม คุณกำลังควบคุมค่าใช้จ่ายได้ดีเลยครับ`;
  } else {
    analysisLevel = "great";
    starRating = 5;
    iconColor = "text-blue-600";
    bgGradient = "from-blue-500/10 to-cyan-500/5";
    borderColor = "border-blue-200/50";
    progressColor = "bg-blue-500";
    analysisTitle = language === 'en' ? "Excellent: High Savings" : "ยอดเยี่ยม: เงินออมสูง";
    analysisText = language === 'en'
      ? `Incredible! You have only spent ${expenseRatio.toFixed(0)}% of your income while ${monthProgress.toFixed(0)}% of the month passed. Great savings potential!`
      : `ยอดเยี่ยมมาก! คุณใช้เงินน้อยกว่าเวลาที่ผ่านไปอย่างเห็นได้ชัด เป็นโอกาสทองในการเพิ่มสัดส่วนเงินออมเพื่อเป้าหมายในอนาคตครับ`;
  }

  // Recommended Daily Limit Logic
  let remainingDays = 1;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  if (viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() === now.getMonth()) {
    remainingDays = daysInMonth - now.getDate() + 1; 
    if (remainingDays <= 0) remainingDays = 1;
  } else {
    remainingDays = daysInMonth;
  }
  
  const remainingBudget = smartTotalIncome - smartTotalExpense;
  const recommendedDailyLimit = remainingBudget > 0 ? remainingBudget / remainingDays : 0;

  if (smartTotalIncome > 0 && viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() === now.getMonth()) {
    if (recommendedDailyLimit > 0) {
      const formattedLimit = recommendedDailyLimit.toLocaleString('en-US', { maximumFractionDigits: 0 });
      analysisText += language === 'en'
        ? ` 💡 Tip: Keep your daily spending under ฿${formattedLimit} for the rest of the month.`
        : ` 💡 แนะนำ: ควรใช้เงินเฉลี่ยไม่เกิน ฿${formattedLimit}/วัน ในช่วงที่เหลือของเดือน`;
    }
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto no-scrollbar animate-fade-in">
      
      <AppHeader pageTitle={t('stats.title')} />

      <div className="px-6 flex-1 flex flex-col pt-2 pb-32 overflow-y-auto no-scrollbar space-y-4">
        
        {/* Global Month Selector */}
        <div className="flex justify-center mb-6 shrink-0">
          <div className="bg-white/30 backdrop-blur-xl px-5 py-2.5 rounded-full flex items-center gap-5 shadow-[0_4px_20px_rgba(31,38,135,0.05)] border border-white/50">
            <button 
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 active:scale-95 transition-all bg-white/40 text-[#2E1065] shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-[#2E1065] text-base min-w-[100px] text-center">
              {currentMonthStr}
            </span>
            <button 
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 active:scale-95 transition-all bg-white/40 text-[#2E1065] shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transaction Type Toggle */}
        <div className="flex bg-white/40 backdrop-blur-xl border border-white/50 p-1.5 rounded-[20px] shadow-sm mb-4">
          <button 
            className={`flex-1 py-3 rounded-[16px] text-sm font-bold transition-all duration-300 ${activeTab === 'income' ? 'bg-white/70 text-[#2E1065] shadow-sm border border-white/60' : 'text-[#2E1065]/60 hover:text-[#2E1065]/80'}`}
            onClick={() => setActiveTab('income')}
          >
            {t('overview.income')}
          </button>
          <button 
            className={`flex-1 py-3 rounded-[16px] text-sm font-bold transition-all duration-300 ${activeTab === 'expense' ? 'bg-white/70 text-[#2E1065] shadow-sm border border-white/60' : 'text-[#2E1065]/60 hover:text-[#2E1065]/80'}`}
            onClick={() => setActiveTab('expense')}
          >
            {t('overview.expense')}
          </button>
        </div>

        {/* Card 1: Main Total */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border border-white/50 relative overflow-hidden shrink-0">
          {/* Decorative Icon */}
          <div className="absolute right-6 top-6 opacity-15 pointer-events-none">
            {activeTab === 'expense' ? (
               <TrendingDown className="w-20 h-20 text-rose-500" />
            ) : (
               <TrendingUp className="w-20 h-20 text-emerald-500" />
            )}
          </div>
          
          <div className="relative z-10 pr-[85px]">
            <p className="text-[13px] font-bold text-[#2E1065]/70 mb-1 uppercase tracking-wider">
              {activeTab === 'expense' ? t('stats.expenseThisMonth') : t('stats.incomeThisMonth')}
            </p>
            <div className="flex items-end gap-2 mb-2 w-full">
              <AutoShrinkText className="text-[48px] leading-[1] font-black text-[#2E1065] tracking-tight drop-shadow-sm w-full">
                {currentMonthTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-2xl font-bold opacity-80 ml-2">{t('stats.currency')}</span>
              </AutoShrinkText>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-2 text-[13px] text-[#2E1065]/70 font-semibold mt-4 pt-4 border-t border-[#2E1065]/10">
            {compareData[1] > 0 ? (
              <>
                <span>{t('stats.prevMonth')}</span>
                <span className="font-bold text-[#2E1065]">{compareData[1].toLocaleString()} {t('stats.currency')}</span>
              </>
            ) : (
              <span>{t('stats.noPrevMonth')}</span>
            )}
            <div className="w-4 h-4 rounded-full bg-white/50 flex items-center justify-center border border-white/50 ml-auto shadow-sm">
              <Info className="w-3 h-3 text-[#2E1065]/50" />
            </div>
          </div>
        </div>

        {/* Analysis & Insights Section */}
        <div className={`bg-gradient-to-br ${bgGradient} backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border ${borderColor} shrink-0`}>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-white/50 rounded-[14px] flex items-center justify-center shadow-sm border border-white/50 shrink-0">
                {analysisLevel === 'critical' || analysisLevel === 'warning' ? (
                  <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
                ) : analysisLevel === 'info' ? (
                  <Info className={`w-5 h-5 ${iconColor}`} />
                ) : (
                  <CheckCircle2 className={`w-5 h-5 ${iconColor}`} />
                )}
             </div>
             <div className="flex-1 min-w-0 pr-2">
               <AutoShrinkText className={`text-[15px] sm:text-[17px] font-bold ${iconColor.replace('text-', 'text-').replace('-600', '-800').replace('-500', '-800')} opacity-90 leading-tight w-full`}>
                  {analysisTitle}
               </AutoShrinkText>
             </div>
             {analysisLevel !== 'info' && (
               <div className="flex gap-0.5 shrink-0">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <Star 
                     key={star} 
                     className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${star <= starRating ? 'fill-yellow-400 text-yellow-500' : 'fill-[#2E1065]/10 text-[#2E1065]/20'}`} 
                   />
                 ))}
               </div>
             )}
          </div>
          
          <div className="text-[13.5px] leading-relaxed text-[#2E1065]/80 font-medium mb-5 bg-white/30 p-4 rounded-2xl border border-white/40 shadow-inner">
             {analysisText}
          </div>
          
          {analysisLevel !== 'info' && (
            <div className="space-y-4 mb-4">
              <div>
                <div className="flex justify-between items-center text-[11px] font-bold text-[#2E1065]/60 mb-1.5 uppercase tracking-wide">
                  <span>{language === 'en' ? 'Month Progress' : 'เวลาของเดือนที่ผ่านไป'}</span>
                  <span className="bg-white/50 px-2 py-0.5 rounded-full">{monthProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white/40 rounded-full h-2.5 overflow-hidden border border-white/30 shadow-inner">
                  <div className="h-full rounded-full bg-[#2E1065]/20 transition-all duration-1000" style={{ width: `${Math.min(monthProgress, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center text-[11px] font-bold text-[#2E1065]/60 mb-1.5 uppercase tracking-wide">
                  <span>{t('overview.expense')} (Burn Rate)</span>
                  <span className={`bg-white/50 px-2 py-0.5 rounded-full ${iconColor}`}>{expenseRatio.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white/40 rounded-full h-2.5 overflow-hidden border border-white/30 shadow-inner">
                  <div className={`h-full rounded-full ${progressColor} transition-all duration-1000`} style={{ width: `${Math.min(expenseRatio, 100)}%` }}></div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {/* Average/Day */}
            <div className="bg-white/50 rounded-[20px] p-2 sm:p-3 flex flex-col items-center justify-center text-center shadow-sm border border-white/60 overflow-hidden">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2 shrink-0">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[9.5px] sm:text-[10px] font-bold text-[#2E1065]/60 mb-0.5 w-full text-center whitespace-nowrap overflow-hidden text-ellipsis tracking-tighter">
                {t('stats.avgPerDay')}
              </p>
              <p className="text-[13px] sm:text-sm font-black text-[#2E1065]">{avgPerDay.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
            </div>
            
            {/* Top Category */}
            <div className="bg-white/50 rounded-[20px] p-2 sm:p-3 flex flex-col items-center justify-center text-center shadow-sm border border-white/60 overflow-hidden">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mb-2 shrink-0">
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-[9.5px] sm:text-[10px] font-bold text-[#2E1065]/60 mb-0.5 w-full text-center whitespace-nowrap overflow-hidden text-ellipsis tracking-tighter">
                {t('stats.topCategory')}
              </p>
              <div className="w-full overflow-x-auto no-scrollbar text-center">
                 <span className="text-[12px] sm:text-[13px] font-black text-[#2E1065] whitespace-nowrap inline-block px-1">{topCategory}</span>
              </div>
            </div>
            
            {/* Transaction Count */}
            <div className="bg-white/50 rounded-[20px] p-2 sm:p-3 flex flex-col items-center justify-center text-center shadow-sm border border-white/60 overflow-hidden">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mb-2 shrink-0">
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[9.5px] sm:text-[10px] font-bold text-[#2E1065]/60 mb-0.5 w-full text-center whitespace-nowrap overflow-hidden text-ellipsis tracking-tighter">
                {t('stats.txCount')}
              </p>
              <p className="text-[13px] sm:text-sm font-black text-[#2E1065]">{txCount}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Totals by Category with Donut Chart and Tooltips */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border border-white/50 shrink-0">
          <h3 className="text-[17px] font-bold text-[#2E1065] mb-4">
            {activeTab === 'expense' ? t('stats.expensesByCategory') : t('stats.incomeByCategory')}
          </h3>
          
          {categoryTotals.length > 0 ? (
            <div className="flex gap-4 items-center">
              {/* Donut Chart (Left Side) */}
              <div className="h-40 w-[140px] shrink-0 relative">
                {/* Center Text inside Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                  <span className="text-[9px] font-bold text-[#2E1065]/50 uppercase tracking-widest">{t('stats.items')}</span>
                  <span className="text-xl font-black text-[#2E1065] leading-none mt-1">{txCount}</span>
                </div>
                <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                  <PieChart>
                    <Pie
                      data={categoryTotals}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="amount"
                      stroke="none"
                    >
                      {categoryTotals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend (Right Side Scrollable) */}
              <div className="flex-1 max-h-40 overflow-y-auto no-scrollbar space-y-3 pr-1">
                {categoryTotals.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                       <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{backgroundColor: cat.fill}} />
                       <span className="text-[12px] font-bold text-[#2E1065] truncate">{cat.name}</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                       <span className="text-[12px] font-black text-[#2E1065]">฿{cat.amount.toLocaleString()}</span>
                       <span className="text-[9px] font-bold text-[#2E1065]/50">{((cat.amount / currentMonthTotal) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/30 border border-white/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] shadow-inner">
              <p className="text-sm font-semibold text-[#2E1065]/80">
                {activeTab === 'expense' ? t('stats.noExpenses') : t('stats.noIncome')}
              </p>
              <p className="text-sm text-[#2E1065]/60 leading-relaxed max-w-[200px]">{t('stats.noExpensesDesc')}</p>
            </div>
          )}
        </div>

        {/* Card 4: 3-Month Comparison */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border border-white/50 shrink-0">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[17px] font-bold text-[#2E1065]">{t('stats.compare3Months')}</h3>
            <div className="bg-white/50 border border-white/50 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#2E1065] shadow-sm uppercase tracking-wider">
              {t('stats.currency')}
            </div>
          </div>
          
          <div className="flex justify-around items-end h-40 px-2 mb-2 relative">
            {/* Bar 1: 2 months ago */}
            <div className="flex flex-col items-center justify-end h-full gap-2 w-16">
              <span className="text-[11px] font-bold text-[#2E1065]/60">{compareData[0] > 0 ? compareData[0].toLocaleString(undefined, {maximumFractionDigits:0}) : ''}</span>
              <div className="w-full bg-white/40 rounded-[12px] transition-all duration-700 border border-white/50" style={{ height: `${(compareData[0] / maxCompare) * 100}%`, minHeight: '8px' }} />
              <span className="text-xs font-bold text-[#2E1065]/50 mt-1">{getMonthLabel(2)}</span>
            </div>
            {/* Bar 2: 1 month ago */}
            <div className="flex flex-col items-center justify-end h-full gap-2 w-16">
              <span className="text-[11px] font-bold text-[#2E1065]/60">{compareData[1] > 0 ? compareData[1].toLocaleString(undefined, {maximumFractionDigits:0}) : ''}</span>
              <div className="w-full bg-white/40 rounded-[12px] transition-all duration-700 border border-white/50" style={{ height: `${(compareData[1] / maxCompare) * 100}%`, minHeight: '8px' }} />
              <span className="text-xs font-bold text-[#2E1065]/50 mt-1">{getMonthLabel(1)}</span>
            </div>
            {/* Bar 3: Current month */}
            <div className="flex flex-col items-center justify-end h-full gap-2 w-16">
              <span className="text-[12px] font-bold text-[#2E1065]">{compareData[2] > 0 ? compareData[2].toLocaleString(undefined, {maximumFractionDigits:0}) : ''}</span>
              <div className={`w-full bg-gradient-to-t rounded-[12px] shadow-lg transition-all duration-700 ${activeTab === 'income' ? 'from-emerald-400 to-teal-500 shadow-emerald-500/30' : 'from-[#A855F7] to-[#8B5CF6] shadow-purple-500/30'}`} style={{ height: `${(compareData[2] / maxCompare) * 100}%`, minHeight: '8px' }} />
              <span className="text-xs font-bold text-[#2E1065] mt-1">{getMonthLabel(0)}</span>
            </div>
          </div>
          
          {compareData[0] === 0 && compareData[1] === 0 && (
            <p className="text-xs text-[#2E1065]/40 font-semibold text-center mt-4">{t('stats.noPrevMonth')}</p>
          )}
        </div>

      </div>
    </div>
  );
}
