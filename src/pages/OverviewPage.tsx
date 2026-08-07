import { Activity, ChevronDown, ArrowDown, ArrowUp, Sparkles, PlusCircle, ScanLine, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAppStore } from '@/store/useAppStore';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import TransactionDetailsModal from '@/components/ui/TransactionDetailsModal';
import { getCategoryStyle } from '@/utils/categoryStyles';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/useSettingsStore';

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
        <p className="text-[#2E1065] font-bold mb-2 text-sm text-center border-b border-purple-100 pb-1">{`${t('overview.week')} ${label.replace('W', '')}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 text-sm font-semibold mb-1 last:mb-0">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#2E1065]/70 w-12">{entry.name}:</span>
            <span className={entry.name === t('overview.income') ? 'text-emerald-600' : 'text-rose-500'}>
              ฿{entry.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function OverviewPage() {
  const { t } = useTranslation();
  const language = useSettingsStore(s => s.language);
  const transactions = useTransactionStore((s) => s.transactions);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const appCategories = useAppStore(s => s.appCategories);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [viewMode, setViewMode] = useState<'chart' | 'calendar'>('chart');
  
  const now = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(now);
  const [viewDate, setViewDate] = useState<Date>(now);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  // Compute dynamic chart data and totals
  const { chartData, totalIncome, totalExpense, dailyTotals } = useMemo(() => {
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const data = [
      { name: 'W1', income: 0, expense: 0 },
      { name: 'W2', income: 0, expense: 0 },
      { name: 'W3', income: 0, expense: 0 },
      { name: 'W4', income: 0, expense: 0 },
    ];

    let tIncome = 0;
    let tExpense = 0;
    const totalsByDay: Record<number, number> = {};

    transactions.forEach(t => {
      // Aggregate Totals
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        if (t.type === 'income') tIncome += t.amount;
        if (t.type === 'expense') tExpense += t.amount;

        const day = tDate.getDate();
        if (!totalsByDay[day]) totalsByDay[day] = 0;
        totalsByDay[day] += (t.type === 'income' ? t.amount : -t.amount);
        let weekIdx = 0;
        if (day > 7 && day <= 14) weekIdx = 1;
        else if (day > 14 && day <= 21) weekIdx = 2;
        else if (day > 21) weekIdx = 3;

        if (t.type === 'income') data[weekIdx].income += t.amount;
        else data[weekIdx].expense += t.amount;
      }
    });

    return { chartData: data, totalIncome: tIncome, totalExpense: tExpense, dailyTotals: totalsByDay };
  }, [transactions, viewDate]);

  const filteredTransactions = transactions.filter(t => {
    if (t.type !== activeTab) return false;
    
    // If in calendar mode, filter by selected date
    if (viewMode === 'calendar') {
      const tDate = new Date(t.date);
      return tDate.getDate() === selectedDate.getDate() && 
             tDate.getMonth() === selectedDate.getMonth() && 
             tDate.getFullYear() === selectedDate.getFullYear();
    }
    
    return true; // Chart mode shows all for the month (we'll just show all filtered by tab for now)
  });

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col h-full bg-transparent animate-fade-in pb-24 px-6 pt-16 items-center justify-center">
        <div className="w-28 h-28 bg-white/40 backdrop-blur-xl rounded-[36px] flex items-center justify-center shadow-[0_8px_32px_rgba(31,38,135,0.1)] border border-white/50 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20" />
          <Sparkles className="w-12 h-12 text-purple-600 drop-shadow-sm" />
        </div>
        
        <h2 className="text-[26px] font-bold text-[#2E1065] text-center mb-3 tracking-tight drop-shadow-sm">
          {t('overview.gettingStarted')}
        </h2>
        
        <p className="text-[15px] font-medium text-[#2E1065]/70 text-center mb-12 max-w-[280px] leading-relaxed">
          {t('overview.welcome')}<span className="font-bold text-purple-600">{useAppStore.getState().appName}</span><br/>{t('overview.welcomeDesc')}
        </p>
        
        <div className="w-full flex flex-col gap-3 px-2">
           <button 
             onClick={() => document.getElementById('slip-upload')?.click()} 
             className="w-full py-4 rounded-[24px] bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-[16px] shadow-[0_8px_24px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
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

  // Calendar Render Logic
  const renderCalendar = () => {
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysCount = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    const dateFormatter = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', { weekday: 'short' });
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(2021, 1, 7 + i); // 2021-02-07 is a Sunday
      weekDays.push(dateFormatter.format(d));
    }

    const headers = weekDays.map((day, i) => (
      <div key={`header-${i}`} className="text-center text-[11px] font-bold text-[#2E1065]/60 mb-2">
        {day}
      </div>
    ));

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14" />);
    }

    for (let i = 1; i <= daysCount; i++) {
      const isSelected = selectedDate.getDate() === i && selectedDate.getMonth() === currentMonth;
      const isToday = now.getDate() === i;
      const net = dailyTotals[i] || 0;
      
      let textColor = 'text-[#2E1065]/40';
      if (net > 0) textColor = 'text-emerald-600';
      else if (net < 0) textColor = 'text-rose-500';

      days.push(
        <button 
          key={`day-${i}`}
          onClick={() => setSelectedDate(new Date(currentYear, currentMonth, i))}
          className={`h-14 flex flex-col items-center justify-start pt-1.5 pb-1 rounded-[16px] transition-all relative ${
            isSelected 
              ? 'bg-white/80 shadow-sm border border-white/80' 
              : 'hover:bg-white/30 border border-transparent'
          }`}
        >
          <span className={`text-[13px] font-bold ${isToday && !isSelected ? 'text-purple-600' : 'text-[#2E1065]'}`}>
            {i}
          </span>
          {net !== 0 && (
            <span className={`text-[9px] font-bold mt-1 ${textColor}`}>
              {net > 0 ? '+' : ''}{Math.abs(net) >= 1000 ? (net/1000).toFixed(1)+'k' : net}
            </span>
          )}
        </button>
      );
    }

    return (
      <div className="bg-white/30 backdrop-blur-md rounded-[32px] p-5 shadow-inner border border-white/40 mb-6 mx-6">
        <div className="grid grid-cols-7 gap-1">
          {headers}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-transparent animate-fade-in">
      {/* Glass Header */}
      <div className="w-full pt-12 pb-4 px-6 flex justify-between items-center shrink-0">
        <div className="w-[68px]" /> {/* Spacer to balance the language toggle width */}
        <span className="font-bold text-xl tracking-tight text-[#2E1065] drop-shadow-sm">{t('overview.title')}</span>
        
        {/* TH-EN Toggle */}
        <button 
          onClick={() => useSettingsStore.getState().setLanguage(language === 'th' ? 'en' : 'th')}
          className="relative px-3 py-2 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 active:scale-95 transition-transform shadow-sm gap-1"
        >
          <span className={`text-[10px] font-bold ${language === 'th' ? 'text-[#2E1065]' : 'text-[#2E1065]/40'}`}>TH</span>
          <div className="w-px h-3 bg-[#2E1065]/20 mx-0.5" />
          <span className={`text-[10px] font-bold ${language === 'en' ? 'text-[#2E1065]' : 'text-[#2E1065]/40'}`}>EN</span>
        </button>
      </div>

      <div className="px-6 flex-1 flex flex-col pt-2 pb-32 overflow-y-auto no-scrollbar">
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
              {new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', { month: 'long', year: 'numeric' }).format(viewDate)}
            </span>
            <button 
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 active:scale-95 transition-all bg-white/40 text-[#2E1065] shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Cards (Glassmorphism) */}
        <div className="flex gap-4 mb-8 shrink-0">
          <div className="flex-1 bg-white/40 backdrop-blur-xl rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border border-white/50 relative overflow-hidden min-w-0">
            <div className="text-[11px] font-semibold text-[#2E1065]/70 whitespace-nowrap">{t('overview.totalIncome')}</div>
            <div className="flex items-center gap-1.5 relative z-10 w-full justify-center">
              <div className="w-5 h-5 shrink-0 rounded-full bg-white/60 flex items-center justify-center border border-white/50 shadow-sm">
                <ArrowDown className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="font-bold text-[clamp(14px,3.5vw,20px)] text-[#2E1065] whitespace-nowrap tracking-tight">
                ฿{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          
          <div className="flex-1 bg-white/40 backdrop-blur-xl rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 shadow-[0_8px_32px_rgba(31,38,135,0.05)] border border-white/50 relative overflow-hidden min-w-0">
            <div className="text-[11px] font-semibold text-[#2E1065]/70 whitespace-nowrap">{t('overview.totalExpenses')}</div>
            <div className="flex items-center gap-1.5 relative z-10 w-full justify-center">
              <div className="w-5 h-5 shrink-0 rounded-full bg-white/60 flex items-center justify-center border border-white/50 shadow-sm">
                <ArrowUp className="w-3 h-3 text-rose-500" />
              </div>
              <span className="font-bold text-[clamp(14px,3.5vw,20px)] text-[#2E1065] whitespace-nowrap tracking-tight">
                ฿{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white/20 backdrop-blur-xl border border-white/30 p-1.5 rounded-[20px] mb-6 shadow-inner mx-6 shrink-0">
          <button 
            className={`flex-1 py-2.5 rounded-[16px] text-sm font-bold transition-all duration-300 ${viewMode === 'chart' ? 'bg-white/60 text-[#2E1065] shadow-sm border border-white/50' : 'text-[#2E1065]/60 hover:text-[#2E1065]/80'}`}
            onClick={() => setViewMode('chart')}
          >
            {t('overview.chart')}
          </button>
          <button 
            className={`flex-1 py-2.5 rounded-[16px] text-sm font-bold transition-all duration-300 ${viewMode === 'calendar' ? 'bg-white/60 text-[#2E1065] shadow-sm border border-white/50' : 'text-[#2E1065]/60 hover:text-[#2E1065]/80'}`}
            onClick={() => setViewMode('calendar')}
          >
            {t('overview.calendar')}
          </button>
        </div>

        {/* Dynamic Content Area */}
        {viewMode === 'chart' ? (
          <>
            <div className="flex items-center justify-between mb-4 px-7 shrink-0">
              <h3 className="font-bold text-[#2E1065] text-lg">{t('overview.weeklyStats')}</h3>
            </div>

            <div className="h-48 w-full shrink-0 mb-8 bg-white/20 backdrop-blur-md rounded-[32px] p-4 border border-white/30 shadow-inner px-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={12} barGap={4}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4C1D95', fontSize: 11, fontWeight: 600, opacity: 0.6 }}
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(46, 16, 101, 0.05)', radius: 8 }}
                    content={<CustomTooltip />}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                  <Bar dataKey="income" name={t('overview.income')} fill="url(#incomeGradient)" radius={[6, 6, 6, 6]} />
                  <Bar dataKey="expense" name={t('overview.expense')} fill="url(#expenseGradient)" radius={[6, 6, 6, 6]} />
                  
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F43F5E" />
                      <stop offset="100%" stopColor="#E11D48" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          renderCalendar()
        )}

        {/* Transaction Type Toggle */}
        <div className="flex bg-white/20 backdrop-blur-xl border border-white/30 p-1.5 rounded-[20px] mb-6 shadow-inner mx-6">
          <button 
            className={`flex-1 py-3 rounded-[16px] text-sm font-bold transition-all duration-300 ${activeTab === 'income' ? 'bg-white/60 text-[#2E1065] shadow-sm border border-white/50' : 'text-[#2E1065]/60 hover:text-[#2E1065]/80'}`}
            onClick={() => setActiveTab('income')}
          >
            {t('overview.income')}
          </button>
          <button 
            className={`flex-1 py-3 rounded-[16px] text-sm font-bold transition-all duration-300 ${activeTab === 'expense' ? 'bg-white/60 text-[#2E1065] shadow-sm border border-white/50' : 'text-[#2E1065]/60 hover:text-[#2E1065]/80'}`}
            onClick={() => setActiveTab('expense')}
          >
            {t('overview.expense')}
          </button>
        </div>

        {/* List Below */}
        <div className="flex flex-col gap-3 px-6">
          {viewMode === 'calendar' && (
            <div className="mb-2 text-sm font-bold text-[#2E1065]/70 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              {t('overview.dateItems')}{selectedDate.toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH', { day: 'numeric', month: 'short' })}
            </div>
          )}
          
          {filteredTransactions.map((tx) => {
            const catStyle = getCategoryStyle(tx.category || '', appCategories || undefined);
            const IconComponent = catStyle.icon;
            
            return (
              <div 
                key={tx.id} 
                onClick={() => setSelectedTransactionId(tx.id)}
                className="cursor-pointer flex items-center justify-between bg-white/40 backdrop-blur-md p-4 rounded-3xl shadow-[0_4px_20px_rgba(31,38,135,0.05)] border border-white/50 hover:bg-white/60 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${catStyle.color} ${catStyle.textColor} shadow-sm border border-white/50`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-[#2E1065] text-[15px] mb-0.5 truncate">{tx.title}</h4>
                    <p className="text-[11px] font-medium text-[#2E1065]/60 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className={`font-bold text-[clamp(14px,3.5vw,16px)] shrink-0 whitespace-nowrap pl-2 ${tx.type === 'income' ? 'text-emerald-600' : 'text-[#2E1065]'}`}>
                  {tx.type === 'income' ? '+' : '-'}฿{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            );
          })}
          {filteredTransactions.length === 0 && (
            <div className="bg-white/40 backdrop-blur-md p-8 rounded-3xl text-center shadow-[0_4px_20px_rgba(31,38,135,0.05)] border border-white/50">
              <p className="text-sm font-semibold text-[#2E1065]/70">{t('overview.noTransactions')}</p>
            </div>
          )}
        </div>
      </div>
      
      <TransactionDetailsModal 
        transactionId={selectedTransactionId}
        onClose={() => setSelectedTransactionId(null)}
      />
    </div>
  );
}
