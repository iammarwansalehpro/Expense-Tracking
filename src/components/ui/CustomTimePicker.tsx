import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface CustomTimePickerProps {
  value: string; // HH:mm
  onChange: (time: string) => void;
}

export default function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const parseValue = () => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      return { h: parseInt(h) || 0, m: parseInt(m) || 0 };
    }
    const now = new Date();
    return { h: now.getHours(), m: now.getMinutes() };
  };

  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const { h, m } = parseValue();
      setHour(h);
      setMinute(m);
    }
  }, [isOpen, value]);

  const handleSave = () => {
    const hh = hour.toString().padStart(2, '0');
    const mm = minute.toString().padStart(2, '0');
    onChange(`${hh}:${mm}`);
    setIsOpen(false);
  };

  const displayTime = value || `${new Date().getHours().toString().padStart(2,'0')}:${new Date().getMinutes().toString().padStart(2,'0')}`;

  return (
    <div className="w-full h-full">
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full h-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-[16px] px-4 py-3.5 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 transition-all shadow-inner"
      >
        <span className="font-bold text-[#2E1065] flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          {displayTime}
        </span>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto shadow-2xl relative animate-slide-up pb-8 pt-4 px-6">
            <div className="flex justify-center shrink-0 mb-6">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            <div className="flex items-center justify-center mb-2">
              <h3 className="text-xl font-bold text-slate-800">
                เวลาที่ชำระเงิน
              </h3>
            </div>
            
            <div className="flex justify-center items-center gap-6 py-6">
              {/* Hour */}
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => setHour(h => (h + 1) % 24)} 
                  className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center hover:bg-purple-100 text-primary active:scale-95 transition-transform"
                >
                  <ChevronUp className="w-8 h-8" />
                </button>
                <div className="text-6xl font-bold text-slate-800 w-24 text-center tabular-nums tracking-tighter">
                  {hour.toString().padStart(2, '0')}
                </div>
                <button 
                  onClick={() => setHour(h => (h - 1 + 24) % 24)} 
                  className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center hover:bg-purple-100 text-primary active:scale-95 transition-transform"
                >
                  <ChevronDown className="w-8 h-8" />
                </button>
              </div>
              
              <div className="text-5xl font-bold text-slate-300 pb-2 -mt-4">:</div>
              
              {/* Minute */}
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => setMinute(m => (m + 1) % 60)} 
                  className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center hover:bg-purple-100 text-primary active:scale-95 transition-transform"
                >
                  <ChevronUp className="w-8 h-8" />
                </button>
                <div className="text-6xl font-bold text-slate-800 w-24 text-center tabular-nums tracking-tighter">
                  {minute.toString().padStart(2, '0')}
                </div>
                <button 
                  onClick={() => setMinute(m => (m - 1 + 60) % 60)} 
                  className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center hover:bg-purple-100 text-primary active:scale-95 transition-transform"
                >
                  <ChevronDown className="w-8 h-8" />
                </button>
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-4 mt-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
            >
              ยืนยันเวลา
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
