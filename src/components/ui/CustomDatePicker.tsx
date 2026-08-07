import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays 
} from 'date-fns';

interface CustomDatePickerProps {
  label?: React.ReactNode;
  value: string | Date; 
  onChange: (date: string) => void;
}

export default function CustomDatePicker({ label, value, onChange }: CustomDatePickerProps) {
  const getValidDate = (dateVal: string | Date) => {
    if (!dateVal) return new Date();
    const parsed = new Date(dateVal);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = getValidDate(value);
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <button
            type="button"
            key={day.toString()}
            onClick={() => {
              onChange(format(cloneDay, 'yyyy-MM-dd'));
              setIsOpen(false);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors ${
              !isCurrentMonth ? 'text-slate-300' :
              isSelected ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' : 
              'text-slate-700 hover:bg-purple-50 hover:text-primary font-medium'
            }`}
          >
            {formattedDate}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex justify-between w-full mb-2" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  return (
    <div>
      {label && <label className="block text-sm font-bold text-[#2E1065] mb-2">{label}</label>}
      
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-[16px] px-4 py-3.5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 transition-all shadow-inner"
      >
        <span className="font-bold text-[#2E1065] flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-slate-400" />
          {selectedDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        <ChevronDown className="w-5 h-5 text-slate-400" />
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto shadow-2xl relative animate-slide-up pb-8 pt-4 px-6">
            <div className="flex justify-center shrink-0 mb-6">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button type="button" onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button type="button" onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="flex justify-between w-full mb-4 px-2">
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => (
                <div key={d} className="w-8 text-center text-xs font-bold text-slate-400">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="px-1">
              {renderCells()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
