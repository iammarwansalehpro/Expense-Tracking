import { ChevronLeft, ChevronRight, TrendingUp, Info, Grid, Receipt, Sparkles, PlusCircle, ScanLine, TrendingDown } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#A855F7', '#14B8A6'];

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const language = useSettingsStore(s => s.language);
  const transactions = useTransactionStore((s) => s.transactions);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');

  const {
    currentMonthTotal,
    avgPerDay,
    topCategory,
    txCount,
    categoryTotals,
    compareData
  } = useMemo(() => {
    const now = new Date();
    const cMonth = now.getMonth();
    const cYear = now.getFullYear();
    const daysInMonth = new Date(cYear, cMonth + 1, 0).getDate();
    const currentDay = now.getDate();

    let total = 0;
    let count = 0;
    const catMap: Record<string, number> = {};
    
    // Monthly comparison array (cMonth-2, cMonth-1, cMonth)
    const compare = [0, 0, 0]; 

    transactions.forEach(t => {
      if (t.type !== activeTab) return;
      
      const tDate = new Date(t.date);
      const m = tDate.getMonth();
      const y = tDate.getFullYear();

      // Current Month
      if (m === cMonth && y === cYear) {
        total += t.amount;
        count++;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
        compare[2] += t.amount;
      }
      // Previous Month (-1)
      else if ((m === cMonth - 1 && y === cYear) || (cMonth === 0 && m === 11 && y === cYear - 1)) {
        compare[1] += t.amount;
      }
      // Previous Month (-2)
      else if ((m === cMonth - 2 && y === cYear) || (cMonth <= 1 && m === 11 - (1 - cMonth) && y === cYear - 1)) {
        compare[0] += t.amount;
      }
    });

    const avg = currentDay > 0 ? total / currentDay : 0;
    
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
  }, [transactions, activeTab]);

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

  const now = new Date();
  
  const dateFormatter = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', { month: 'short', year: 'numeric' });
  const currentMonthStr = dateFormatter.format(now);
  
  const monthFormatter = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', { month: 'short' });
  const getMonthLabel = (offset: number) => {
    const d = new Date();
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

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto no-scrollbar pb-32 animate-fade-in">
      {/* Floating Month Selector & Language Toggle */}
      <div className="w-full pt-12 pb-6 px-6 shrink-0 relative z-20 flex justify-between items-center">
        <div className="w-[68px]" /> {/* Spacer */}
        
        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-6 shadow-lg border border-white/20">
            <button className="w-8 h-8 flex items-center justify-center active:scale-90 transition-transform bg-white/10 rounded-full">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <span className="font-bold text-white text-lg min-w-[100px] text-center drop-shadow-md">{currentMonthStr}</span>
            <button className="w-8 h-8 flex items-center justify-center active:scale-90 transition-transform bg-white/10 rounded-full">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
        </div>

        {/* TH-EN Toggle */}
        <button 
          onClick={() => useSettingsStore.getState().setLanguage(language === 'th' ? 'en' : 'th')}
          className="relative px-3 py-2 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-95 transition-transform shadow-sm gap-1"
        >
          <span className={`text-[10px] font-bold ${language === 'th' ? 'text-white' : 'text-white/50'}`}>TH</span>
          <div className="w-px h-3 bg-white/20 mx-0.5" />
          <span className={`text-[10px] font-bold ${language === 'en' ? 'text-white' : 'text-white/50'}`}>EN</span>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="px-4 space-y-4 relative z-10">
        
        {/* Transaction Type Toggle */}
        <div className="flex bg-white/40 backdrop-blur-xl border border-white/50 p-1.5 rounded-[20px] shadow-sm mb-2 mx-2">
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
        <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border border-white/50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-semibold text-[#2E1065]/70 mb-1">
                {activeTab === 'expense' ? t('stats.expenseThisMonth') : t('stats.incomeThisMonth')}
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <h2 className="text-[42px] leading-none font-bold text-[#2E1065] tracking-tight drop-shadow-sm">
                  {currentMonthTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <span className="text-xl font-bold text-[#2E1065]">{t('stats.currency')}</span>
              </div>
              <p className="text-sm font-medium text-[#2E1065]/60">
                {t('stats.avgPerDay')} {avgPerDay.toLocaleString('en-US', { maximumFractionDigits: 0 })} {t('stats.currency')}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/50 rounded-full flex items-center justify-center shrink-0 border border-white/50 shadow-sm">
              {activeTab === 'expense' ? (
                 <TrendingDown className="w-7 h-7 text-rose-500" />
              ) : (
                 <TrendingUp className="w-7 h-7 text-emerald-500" />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-[#2E1065]/60 font-medium">
            <span>{compareData[1] > 0 ? `${t('stats.prevMonth')} ${compareData[1].toLocaleString()} ${t('stats.currency')}` : t('stats.noPrevMonth')}</span>
            <div className="w-4 h-4 rounded-full bg-white/50 flex items-center justify-center border border-white/50">
              <Info className="w-3 h-3 text-[#2E1065]/50" />
            </div>
          </div>
        </div>

        {/* Card Row 2: 3 Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Average/Day */}
          <div className="bg-white/40 backdrop-blur-xl rounded-[24px] p-4 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border border-white/50 flex flex-col justify-between min-h-[120px]">
            <div className="w-8 h-8 bg-white/60 rounded-full flex items-center justify-center mb-3 shadow-sm border border-white/50">
              <TrendingUp className="w-4 h-4 text-[#2E1065]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#2E1065]/70 mb-0.5">{t('stats.avgPerDay')}</p>
              <p className="text-base font-bold text-[#2E1065] leading-tight">{avgPerDay.toLocaleString('en-US', { maximumFractionDigits: 0 })} {t('stats.currency')}</p>
            </div>
          </div>
          
          {/* Top Category */}
          <div className="bg-white/40 backdrop-blur-xl rounded-[24px] p-4 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border border-white/50 flex flex-col justify-between min-h-[120px]">
            <div className="w-8 h-8 bg-white/60 rounded-full flex items-center justify-center mb-3 shadow-sm border border-white/50">
              <Grid className="w-4 h-4 text-[#2E1065]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#2E1065]/70 mb-0.5">{t('stats.topCategory')}</p>
              <p className="text-base font-bold text-[#2E1065] leading-tight truncate">{topCategory}</p>
            </div>
          </div>
          
          {/* Transaction Count */}
          <div className="bg-white/40 backdrop-blur-xl rounded-[24px] p-4 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border border-white/50 flex flex-col justify-between min-h-[120px]">
            <div className="w-8 h-8 bg-white/60 rounded-full flex items-center justify-center mb-3 shadow-sm border border-white/50">
              <Receipt className="w-4 h-4 text-[#2E1065]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#2E1065]/70 mb-0.5">{t('stats.txCount')}</p>
              <p className="text-base font-bold text-[#2E1065] leading-tight">{txCount} {t('stats.items')}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Totals by Category with Donut Chart */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border border-white/50">
          <h3 className="text-xl font-bold text-[#2E1065] mb-4">
            {activeTab === 'expense' ? t('stats.expensesByCategory') : t('stats.incomeByCategory')}
          </h3>
          
          {categoryTotals.length > 0 ? (
            <>
              {/* Donut Chart */}
              <div className="h-56 w-full mb-6 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryTotals}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
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
                {/* Center Text inside Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-semibold text-[#2E1065]/60">{t('stats.items')}</span>
                  <span className="text-lg font-bold text-[#2E1065]">{txCount}</span>
                </div>
              </div>

              {/* Category List */}
              <div className="space-y-4">
                {categoryTotals.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-white/50 border border-white/60 flex items-center justify-center shadow-sm font-bold" style={{ color: cat.fill }}>
                        {cat.name.charAt(0)}
                      </div>
                      <span className="font-bold text-[#2E1065]">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#2E1065]">฿{cat.amount.toLocaleString()}</span>
                      <p className="text-[10px] text-[#2E1065]/60 font-semibold">{((cat.amount / currentMonthTotal) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
        <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border border-white/50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-[#2E1065]">{t('stats.compare3Months')}</h3>
            <div className="bg-white/50 border border-white/50 px-4 py-1.5 rounded-full text-sm font-bold text-[#2E1065] shadow-sm">
              {t('stats.currency')}
            </div>
          </div>
          
          <div className="flex justify-around items-end h-32 px-2 mb-6">
            {/* Bar 1: 2 months ago */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-semibold text-[#2E1065]/80">{compareData[0].toLocaleString()}</span>
              <div className="w-12 bg-white/50 rounded-full transition-all duration-500" style={{ height: `${(compareData[0] / maxCompare) * 100}%`, minHeight: '8px' }} />
              <span className="text-xs font-semibold text-[#2E1065]/60 mt-1">{getMonthLabel(2)}</span>
            </div>
            {/* Bar 2: 1 month ago */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-semibold text-[#2E1065]/80">{compareData[1].toLocaleString()}</span>
              <div className="w-12 bg-white/50 rounded-full transition-all duration-500" style={{ height: `${(compareData[1] / maxCompare) * 100}%`, minHeight: '8px' }} />
              <span className="text-xs font-semibold text-[#2E1065]/60 mt-1">{getMonthLabel(1)}</span>
            </div>
            {/* Bar 3: Current month */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-semibold text-[#2E1065]/80">{compareData[2].toLocaleString()}</span>
              <div className={`w-12 bg-gradient-to-t rounded-full shadow-lg transition-all duration-500 ${activeTab === 'income' ? 'from-emerald-400 to-teal-500 shadow-emerald-500/30' : 'from-[#A855F7] to-[#8B5CF6] shadow-purple-500/30'}`} style={{ height: `${(compareData[2] / maxCompare) * 100}%`, minHeight: '8px' }} />
              <span className="text-xs font-semibold text-[#2E1065]/60 mt-1">{getMonthLabel(0)}</span>
            </div>
          </div>
          
          {compareData[0] === 0 && compareData[1] === 0 && (
            <p className="text-sm text-[#2E1065]/60 font-medium text-center">{t('stats.noPrevMonth')}</p>
          )}
        </div>

      </div>
    </div>
  );
}
