import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import AutoShrinkText from './AutoShrinkText';

interface CustomTimePickerProps {
  value: string; // HH:mm
  onChange: (time: string) => void;
}

function ScrollPicker({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (val: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 60;
  const VISIBLE_ITEMS = 3;
  const padding = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;
  
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isScrolling.current) return;
    const idx = items.indexOf(value);
    if (idx !== -1 && containerRef.current) {
      containerRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
  }, [value, items]);

  const handleScroll = () => {
    isScrolling.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
      // Snap to exact position when scrolling stops
      if (containerRef.current) {
        const scrollY = containerRef.current.scrollTop;
        const idx = Math.round(scrollY / ITEM_HEIGHT);
        containerRef.current.scrollTo({
          top: idx * ITEM_HEIGHT,
          behavior: 'smooth'
        });
      }
    }, 150);

    if (!containerRef.current) return;
    const scrollY = containerRef.current.scrollTop;
    const idx = Math.round(scrollY / ITEM_HEIGHT);
    const safeIdx = Math.max(0, Math.min(idx, items.length - 1));
    
    if (items[safeIdx] !== value) {
      onChange(items[safeIdx]);
    }
  };

  return (
    <div 
      className="relative h-[180px] w-24 overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)'
      }}
    >
      <div className="absolute top-1/2 left-0 right-0 h-[60px] -translate-y-1/2 border-y-2 border-[#8B5CF6]/30 bg-[#8B5CF6]/5 pointer-events-none rounded-xl" />
      
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
        onScroll={handleScroll}
      >
        <div style={{ height: padding }} />
        {items.map((item, i) => {
          const isSelected = item === value;
          return (
            <div
              key={i}
              className={`h-[60px] snap-center flex items-center justify-center text-4xl font-bold transition-all duration-200 cursor-pointer ${
                isSelected ? 'text-[#2E1065] scale-110' : 'text-slate-300 scale-90'
              }`}
              onClick={() => {
                if (containerRef.current) {
                  containerRef.current.scrollTo({
                    top: i * ITEM_HEIGHT,
                    behavior: 'smooth'
                  });
                }
              }}
            >
              {item}
            </div>
          );
        })}
        <div style={{ height: padding }} />
      </div>
    </div>
  );
}

export default function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const parseValue = () => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      return { 
        h: h.padStart(2, '0'), 
        m: m.padStart(2, '0') 
      };
    }
    const now = new Date();
    return { 
      h: now.getHours().toString().padStart(2, '0'), 
      m: now.getMinutes().toString().padStart(2, '0') 
    };
  };

  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');

  useEffect(() => {
    if (isOpen) {
      const { h, m } = parseValue();
      setHour(h);
      setMinute(m);
    }
  }, [isOpen, value]);

  const handleSave = () => {
    onChange(`${hour}:${minute}`);
    setIsOpen(false);
  };

  const displayTime = value || `${new Date().getHours().toString().padStart(2,'0')}:${new Date().getMinutes().toString().padStart(2,'0')}`;

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), []);

  return (
    <div className="w-full h-full">
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full h-full bg-white/60 backdrop-blur-sm border border-white/50 rounded-[16px] px-3 py-3.5 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 transition-all shadow-inner overflow-hidden"
      >
        <div className="flex items-center justify-center gap-1.5 min-w-0 w-full">
          <Clock className="w-5 h-5 text-slate-400 shrink-0" />
          <AutoShrinkText 
            className="font-bold text-[#2E1065] w-full text-center"
            text={displayTime}
          />
        </div>
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

            <div className="flex items-center justify-center mb-4">
              <h3 className="text-xl font-bold text-[#2E1065]">
                เวลาที่ชำระเงิน
              </h3>
            </div>
            
            <div className="flex justify-center items-center gap-2 py-4">
              <ScrollPicker 
                items={hours}
                value={hour}
                onChange={setHour}
              />
              <div className="text-4xl font-bold text-slate-300 -mt-2 animate-pulse">:</div>
              <ScrollPicker 
                items={minutes}
                value={minute}
                onChange={setMinute}
              />
            </div>

            <button 
              onClick={handleSave}
              className="mt-6 w-full py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-[20px] font-bold text-lg shadow-[0_10px_20px_-10px_rgba(139,92,246,0.5)] transition-all active:scale-[0.98]"
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
