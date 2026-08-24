import { Activity, ChevronDown, ArrowDown, ArrowUp, Sparkles, PlusCircle, ScanLine, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search, XCircle } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import AutoShrinkText from '@/components/ui/AutoShrinkText';
import AppHeader from '@/components/layout/AppHeader';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Legend, LineChart, Line } from 'recharts';
import TransactionDetailsModal from '@/components/ui/TransactionDetailsModal';
import { getCategoryStyle, getCategoryDisplayName } from '@/utils/categoryStyles';

const SortAltIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M5.47719 7.96225C5.1802 8.25099 5.17351 8.72582 5.46225 9.02281C5.75099 9.3198 6.22582 9.32649 6.52281 9.03775L5.47719 7.96225ZM9.6 5H10.35C10.35 4.69857 10.1695 4.42644 9.89188 4.30913C9.61422 4.19182 9.29331 4.25214 9.07719 4.46225L9.6 5ZM8.85 19C8.85 19.4142 9.18579 19.75 9.6 19.75C10.0142 19.75 10.35 19.4142 10.35 19H8.85ZM18.5228 16.0377C18.8198 15.749 18.8265 15.2742 18.5377 14.9772C18.249 14.6802 17.7742 14.6735 17.4772 14.9623L18.5228 16.0377ZM14.4 19H13.65C13.65 19.3014 13.8305 19.5736 14.1081 19.6909C14.3858 19.8082 14.7067 19.7479 14.9228 19.5377L14.4 19ZM15.15 5C15.15 4.58579 14.8142 4.25 14.4 4.25C13.9858 4.25 13.65 4.58579 13.65 5H15.15ZM6.52281 9.03775L10.1228 5.53775L9.07719 4.46225L5.47719 7.96225L6.52281 9.03775ZM8.85 5V19H10.35V5H8.85ZM17.4772 14.9623L13.8772 18.4623L14.9228 19.5377L18.5228 16.0377L17.4772 14.9623ZM15.15 19V5H13.65V19H15.15Z" />
  </svg>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
        <p className="text-[#2E1065] font-bold mb-2 text-sm text-center border-b border-purple-100 pb-1">
          {label?.toString().includes(t('overview.week')) || label?.toString().includes('W') 
            ? `${t('overview.week')} ${label.replace('W', '').replace(t('overview.week'), '').trim()}`
            : `${label} ${t('overview.day', 'วัน')}`}
        </p>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [statsTimeframe, setStatsTimeframe] = useState<'weekly' | 'daily'>('weekly');

  // Compute dynamic chart data and totals
  const { chartData, dailyChartData, totalIncome, totalExpense, dailyTotals } = useMemo(() => {
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const weekLabel = t('overview.week');
    const data = [
      { name: `${weekLabel} 1`, income: 0, expense: 0 },
      { name: `${weekLabel} 2`, income: 0, expense: 0 },
      { name: `${weekLabel} 3`, income: 0, expense: 0 },
      { name: `${weekLabel} 4`, income: 0, expense: 0 },
    ];

    let tIncome = 0;
    let tExpense = 0;
    const totalsByDay: Record<number, number> = {};
    
    // Initialize daily chart data
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      name: (i + 1).toString(),
      income: 0,
      expense: 0
    }));

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

        // Daily chart data aggregation
        if (t.type === 'income') dailyData[day - 1].income += t.amount;
        else dailyData[day - 1].expense += t.amount;
      }
    });

    return { chartData: data, dailyChartData: dailyData, totalIncome: tIncome, totalExpense: tExpense, dailyTotals: totalsByDay };
  }, [transactions, viewDate, t]);

  const filteredTransactions = transactions.filter(t => {
    let effectiveType = t.type;
    if (t.type === 'transfer') {
      if (t.linkedTransactionId && t.walletId === t.toWalletId) return false;
      effectiveType = 'expense';
    }

    if (effectiveType !== activeTab) return false;

    const tDate = new Date(t.date);

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      const matchNote = (t.note || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchNote) return false;
    }

    // Date filtering
    if (viewMode === 'calendar') {
      return tDate.getDate() === selectedDate.getDate() &&
        tDate.getMonth() === selectedDate.getMonth() &&
        tDate.getFullYear() === selectedDate.getFullYear();
    }

    // In chart mode, filter by viewDate (month)
    return tDate.getMonth() === viewDate.getMonth() &&
      tDate.getFullYear() === viewDate.getFullYear();
  }).sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
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
          {t('overview.welcome')}<span className="font-bold text-purple-600">{useAppStore.getState().appName}</span><br />{t('overview.welcomeDesc')}
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

  // Helper to format daily net amount in calendar cells cleanly
  const formatCalendarAmount = (amount: number): string => {
    const rounded = Math.round(amount * 100) / 100;
    if (Math.abs(rounded) < 0.01) return '';

    const sign = rounded > 0 ? '+' : '';
    const absVal = Math.abs(rounded);

    if (absVal >= 1000) {
      const inK = rounded / 1000;
      return `${sign}${inK.toFixed(1)}k`;
    }

    return `${sign}${rounded}`;
  };

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
      const roundedNet = Math.round(net * 100) / 100;

      let textColor = 'text-[#2E1065]/40';
      if (roundedNet > 0) textColor = 'text-emerald-600';
      else if (roundedNet < 0) textColor = 'text-rose-500';

      const formattedAmount = formatCalendarAmount(net);

      days.push(
        <button
          key={`day-${i}`}
          onClick={() => setSelectedDate(new Date(currentYear, currentMonth, i))}
          className={`h-14 flex flex-col items-center justify-start pt-1.5 pb-1 rounded-[16px] transition-all relative ${isSelected
              ? 'bg-white/80 shadow-sm border border-white/80'
              : 'hover:bg-white/30 border border-transparent'
            }`}
        >
          <span className={`text-[13px] font-bold ${isToday && !isSelected ? 'text-purple-600' : 'text-[#2E1065]'}`}>
            {i}
          </span>
          {formattedAmount ? (
            <span className={`text-[9px] font-bold mt-1 max-w-full truncate px-0.5 ${textColor}`}>
              {formattedAmount}
            </span>
          ) : null}
        </button>
      );
    }

    return (
      <div className="bg-white/30 backdrop-blur-md rounded-[32px] p-5 shadow-inner border border-white/40 mb-6">
        <div className="grid grid-cols-7 gap-1">
          {headers}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-transparent animate-fade-in">
      <AppHeader pageTitle={t('overview.title')} />

      <div className="px-6 flex-1 flex flex-col pt-2 pb-32  no-scrollbar">
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
          {/* Income Card */}
          <div className="flex-1 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-[24px] p-4 border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)] relative overflow-hidden flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm border border-emerald-50">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <AutoShrinkText origin="left" className="text-[12px] font-bold text-[#2E1065]/70 tracking-wide uppercase" text={t('overview.totalIncome')} />
              </div>
            </div>
            <div className="w-full mt-1">
              <AutoShrinkText className="font-black text-[26px] text-[#2E1065] tracking-tight w-full">
                <span className="text-emerald-500 mr-1">+</span>
                {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </AutoShrinkText>
            </div>
          </div>

          {/* Expense Card */}
          <div className="flex-1 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl rounded-[24px] p-4 border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)] relative overflow-hidden flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0 shadow-sm border border-rose-50">
                <ArrowUp className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="min-w-0 flex-1">
                <AutoShrinkText origin="left" className="text-[12px] font-bold text-[#2E1065]/70 tracking-wide uppercase" text={t('overview.totalExpenses')} />
              </div>
            </div>
            <div className="w-full mt-1">
              <AutoShrinkText className="font-black text-[26px] text-[#2E1065] tracking-tight w-full">
                <span className="text-rose-500 mr-1">-</span>
                {totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </AutoShrinkText>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white/20 backdrop-blur-xl border border-white/30 p-1.5 rounded-[20px] mb-6 shadow-inner shrink-0">
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
            <div className="flex items-center justify-between mb-4 px-1 shrink-0">
              <h3 className="font-bold text-[#2E1065] text-lg">{t('overview.statsTitle', 'สถิติ')}</h3>
              
              <div className="flex bg-white/40 backdrop-blur-md p-1 rounded-xl border border-white/50 shadow-inner">
                <button
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${statsTimeframe === 'weekly' ? 'bg-white shadow-sm text-purple-600' : 'text-[#2E1065]/60 hover:text-[#2E1065]'}`}
                  onClick={() => setStatsTimeframe('weekly')}
                >
                  {t('overview.weekly', 'รายสัปดาห์')}
                </button>
                <button
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${statsTimeframe === 'daily' ? 'bg-white shadow-sm text-purple-600' : 'text-[#2E1065]/60 hover:text-[#2E1065]'}`}
                  onClick={() => setStatsTimeframe('daily')}
                >
                  {t('overview.daily', 'รายวัน')}
                </button>
              </div>
            </div>

            <div className="h-48 w-full shrink-0 mb-8 bg-white/20 backdrop-blur-md rounded-[32px] p-4 border border-white/30 shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                {statsTimeframe === 'weekly' ? (
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
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F43F5E" />
                        <stop offset="100%" stopColor="#E11D48" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                ) : (
                  <LineChart data={dailyChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#4C1D95', fontSize: 10, fontWeight: 600, opacity: 0.5 }}
                      dy={10}
                      interval="preserveStartEnd"
                      minTickGap={20}
                    />
                    <Tooltip
                      cursor={{ stroke: 'rgba(46, 16, 101, 0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
                      content={<CustomTooltip />}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      name={t('overview.income')} 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      name={t('overview.expense')} 
                      stroke="#E11D48" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5, fill: '#E11D48', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          renderCalendar()
        )}

        {/* Transaction Type Toggle */}
        <div className="flex bg-white/20 backdrop-blur-xl border border-white/30 p-1.5 rounded-[20px] mb-6 shadow-inner">
          <button
            type="button"
            className={`flex-1 py-3 rounded-[16px] text-sm font-bold transition-all duration-300 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${activeTab === 'income' ? 'bg-white/60 text-[#2E1065] shadow-sm border border-white/50' : 'text-[#2E1065]/60 hover:text-[#2E1065]/80 border border-transparent'}`}
            onClick={() => setActiveTab('income')}
          >
            {t('overview.income')}
          </button>
          <button
            type="button"
            className={`flex-1 py-3 rounded-[16px] text-sm font-bold transition-all duration-300 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${activeTab === 'expense' ? 'bg-white/60 text-[#2E1065] shadow-sm border border-white/50' : 'text-[#2E1065]/60 hover:text-[#2E1065]/80 border border-transparent'}`}
            onClick={() => setActiveTab('expense')}
          >
            {t('overview.expense')}
          </button>
        </div>

        {/* List Below */}
        <div className="flex flex-col gap-3">

          {/* Smart Search & Sort Row */}
          <div className="flex items-center gap-3 mb-2 shrink-0">
            <div className="flex-1 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-inner relative transition-all focus-within:bg-white/60 focus-within:border-purple-300">
              <Search className="w-5 h-5 text-[#2E1065]/50 shrink-0" />
              <input
                type="text"
                placeholder={language === 'en' ? "Search transactions..." : "ค้นหารายการ..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[15px] font-medium text-[#2E1065] placeholder-[#2E1065]/40 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all text-[#2E1065]/40 hover:text-[#2E1065]/70 absolute right-3"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="w-12 h-[48px] shrink-0 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl flex items-center justify-center shadow-sm hover:bg-white/60 active:scale-95 transition-all text-[#2E1065]"
              title={language === 'en' ? "Toggle Sort Order" : "สลับการเรียงลำดับ"}
            >
              <SortAltIcon className={`w-6 h-6 transition-transform duration-300 ${sortOrder === 'asc' ? 'scale-y-[-1]' : ''}`} />
            </button>
          </div>
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
                    <AutoShrinkText 
                      origin="left" 
                      className="font-bold text-[#2E1065] text-[15px] mb-0.5" 
                      text={tx.title || getCategoryDisplayName(tx.category, language)} 
                    />
                    <p className="text-[11px] font-medium text-[#2E1065]/60 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className={`font-bold text-[clamp(14px,3.5vw,16px)] shrink-0 whitespace-nowrap pl-2 ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
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
